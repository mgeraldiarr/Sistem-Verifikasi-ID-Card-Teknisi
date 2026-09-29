// src/app/api/admin/accounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { ACCOUNT_PROFILE_COLUMNS, assignAdminId } from '@/lib/server/admin-id';
import {
  authenticateCaller,
  isUuid,
  jsonError,
  readJsonBody,
} from '@/lib/server/api-auth';
import { buildDefaultTechnicianPassword, normalizePersonalEmail } from '@/lib/technician-access';

export const dynamic = 'force-dynamic';

/** Kata sandi sementara acak untuk akun admin (bukan turunan data pribadi). */
function generateTemporaryPassword(): string {
  return `Mod-${randomBytes(12).toString('base64url')}`;
}

/** Membaca `id` akun target dari body dan memastikan formatnya UUID. */
async function readTargetId(req: NextRequest): Promise<{ id: string } | { error: NextResponse }> {
  const body = await readJsonBody(req);
  if (!body) return { error: jsonError('Format permintaan tidak valid.', 400) };

  const id = String(body.id ?? '').trim();
  if (!id) return { error: jsonError('ID akun wajib diisi.', 400) };
  if (!isUuid(id)) return { error: jsonError('ID akun tidak valid.', 400) };
  return { id };
}

// POST — Membuat akun admin baru (Super Admin / Admin Cabang)
export async function POST(req: NextRequest) {
  const auth = await authenticateCaller(
    req,
    ['super_admin'],
    'Hanya Super Admin yang berwenang membuat akun pengguna.'
  );
  if ('error' in auth) return auth.error;

  const body = await readJsonBody(req);
  if (!body) return jsonError('Format permintaan tidak valid.', 400);

  const email = normalizePersonalEmail(String(body.email ?? ''));
  const fullName = String(body.full_name ?? '').trim();
  const role = String(body.role ?? '').trim();
  const branch = body.branch ? String(body.branch).trim() : null;
  const password = String(body.password ?? '');

  if (!email) return jsonError('Email tidak valid.', 400);
  if (!fullName) return jsonError('Nama lengkap wajib diisi.', 400);
  if (role !== 'super_admin' && role !== 'branch_admin') {
    return jsonError(
      'Peran hanya boleh super_admin atau branch_admin. Akun teknisi diterbitkan lewat tombol Kirim Akses di dashboard.',
      400
    );
  }
  if (role === 'branch_admin' && !branch) {
    return jsonError('Admin Cabang wajib memiliki cabang penugasan.', 400);
  }
  if (password.length < 8) return jsonError('Kata sandi awal minimal 8 karakter.', 400);

  // Cabang harus terdaftar pada master cabang
  if (branch) {
    const { data: branchRow } = await supabaseAdmin
      .from('branches')
      .select('name')
      .eq('name', branch)
      .maybeSingle();

    if (!branchRow) {
      return jsonError(`Cabang "${branch}" tidak terdaftar pada master cabang.`, 400);
    }
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    return jsonError(`Gagal membuat akun: ${createError?.message ?? 'tidak diketahui'}`, 400);
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      id: created.user.id,
      email,
      full_name: fullName,
      role,
      branch,
      is_active: true,
      // Kata sandi awal yang dibuat admin wajib dirotasi pada login pertama
      must_change_password: true,
    })
    .select(ACCOUNT_PROFILE_COLUMNS)
    .single();

  if (profileError) {
    // Rollback agar tidak meninggalkan akun auth tanpa profil peran
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    return jsonError(`Gagal menyimpan profil peran: ${profileError.message}`, 500);
  }

  // Admin Cabang login memakai ID (ADM-[KODE]-[NN]); email pribadinya untuk Lupa Kata Sandi
  if (role === 'branch_admin' && branch) {
    const assigned = await assignAdminId(created.user.id, branch);
    if ('error' in assigned) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return jsonError(`Gagal menerbitkan ID admin: ${assigned.error}`, 500);
    }
    profile.admin_id = assigned.adminId;
  }

  return NextResponse.json({ profile });
}

// PUT — Menerbitkan ID login untuk Admin Cabang yang belum memilikinya
export async function PUT(req: NextRequest) {
  const auth = await authenticateCaller(
    req,
    ['super_admin'],
    'Hanya Super Admin yang berwenang menerbitkan ID admin.'
  );
  if ('error' in auth) return auth.error;

  const target = await readTargetId(req);
  if ('error' in target) return target.error;

  const { data: account } = await supabaseAdmin
    .from('user_profiles')
    .select('id, role, branch, admin_id')
    .eq('id', target.id)
    .maybeSingle();

  if (!account) return jsonError('Akun tidak ditemukan.', 404);
  if (account.role !== 'branch_admin' || !account.branch) {
    return jsonError(
      'ID admin hanya diterbitkan untuk Admin Cabang yang memiliki cabang penugasan.',
      400
    );
  }
  if (account.admin_id) return NextResponse.json({ admin_id: account.admin_id });

  const assigned = await assignAdminId(account.id, account.branch);
  if ('error' in assigned) {
    return jsonError(`Gagal menerbitkan ID admin: ${assigned.error}`, 500);
  }

  return NextResponse.json({ admin_id: assigned.adminId });
}

// PATCH — Reset kata sandi sebuah akun
export async function PATCH(req: NextRequest) {
  const auth = await authenticateCaller(
    req,
    ['super_admin', 'branch_admin'],
    'Peran Anda tidak berwenang mengatur ulang kata sandi.'
  );
  if ('error' in auth) return auth.error;
  const { caller } = auth;

  const target = await readTargetId(req);
  if ('error' in target) return target.error;

  const { data: account } = await supabaseAdmin
    .from('user_profiles')
    .select('id, email, full_name, role, branch, technician_id')
    .eq('id', target.id)
    .maybeSingle();

  if (!account) return jsonError('Akun tidak ditemukan.', 404);

  // Admin Cabang hanya boleh mereset akun teknisi di cabangnya sendiri
  if (
    caller.role === 'branch_admin' &&
    (account.role !== 'technician' || account.branch !== caller.branch)
  ) {
    return jsonError(
      'Admin Cabang hanya dapat mengatur ulang kata sandi teknisi di cabangnya sendiri.',
      403
    );
  }

  // Teknisi memakai pola kata sandi awal resmi; admin memakai sandi acak sekali pakai
  let newPassword: string | null;

  if (account.role === 'technician' && account.technician_id) {
    const { data: technician } = await supabaseAdmin
      .from('technicians')
      .select('phone')
      .eq('id', account.technician_id)
      .maybeSingle();

    newPassword = buildDefaultTechnicianPassword(technician?.phone);
    if (!newPassword) {
      return jsonError(
        'Nomor HP teknisi belum terisi atau kurang dari 4 digit, sehingga kata sandi awal tidak dapat dibentuk.',
        422
      );
    }
  } else {
    newPassword = generateTemporaryPassword();
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(account.id, {
    password: newPassword,
  });

  if (updateError) {
    return jsonError(`Gagal mengatur ulang kata sandi: ${updateError.message}`, 500);
  }

  // Wajibkan rotasi pada login berikutnya
  await supabaseAdmin
    .from('user_profiles')
    .update({ must_change_password: true })
    .eq('id', account.id);

  return NextResponse.json({
    password: newPassword,
    full_name: account.full_name,
    email: account.email,
    role: account.role,
  });
}

// DELETE — Menghapus akun beserta profil perannya
export async function DELETE(req: NextRequest) {
  const auth = await authenticateCaller(
    req,
    ['super_admin'],
    'Hanya Super Admin yang berwenang menghapus akun.'
  );
  if ('error' in auth) return auth.error;

  const target = await readTargetId(req);
  if ('error' in target) return target.error;

  // Cegah Super Admin mengunci dirinya sendiri keluar dari sistem
  if (target.id === auth.caller.id) {
    return jsonError('Anda tidak dapat menghapus akun Anda sendiri.', 400);
  }

  // Menghapus auth.users otomatis menghapus user_profiles (ON DELETE CASCADE)
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(target.id);
  if (deleteError) {
    return jsonError(`Gagal menghapus akun: ${deleteError.message}`, 500);
  }

  return NextResponse.json({ deleted: true });
}
