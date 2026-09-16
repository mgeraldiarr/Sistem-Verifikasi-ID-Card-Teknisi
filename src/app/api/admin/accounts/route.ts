// src/app/api/admin/accounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { buildDefaultTechnicianPassword } from '@/lib/technician-access';

export const dynamic = 'force-dynamic';

type CallerProfile = {
  id: string;
  role: 'super_admin' | 'branch_admin' | 'technician';
  branch: string | null;
  is_active: boolean;
};

/**
 * Memvalidasi token sesi pemanggil dan mengembalikan profil perannya.
 * Endpoint ini memakai service role, sehingga otorisasi WAJIB diperiksa manual.
 */
async function authenticateCaller(
  req: NextRequest
): Promise<{ caller: CallerProfile } | { error: NextResponse }> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';

  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Sesi tidak ditemukan. Silakan masuk kembali.' },
        { status: 401 }
      ),
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return {
      error: NextResponse.json(
        { error: 'Sesi tidak valid atau telah berakhir.' },
        { status: 401 }
      ),
    };
  }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id, role, branch, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    return {
      error: NextResponse.json(
        { error: 'Akun Anda tidak aktif atau belum memiliki profil peran resmi.' },
        { status: 403 }
      ),
    };
  }

  return { caller: profile as CallerProfile };
}

/** Kata sandi sementara acak untuk akun admin (bukan turunan data pribadi). */
function generateTemporaryPassword(): string {
  return `Mod-${randomBytes(12).toString('base64url')}`;
}

// =============================================================
// POST — Membuat akun admin baru (Super Admin / Admin Cabang)
// =============================================================
export async function POST(req: NextRequest) {
  const auth = await authenticateCaller(req);
  if ('error' in auth) return auth.error;

  if (auth.caller.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Hanya Super Admin yang berwenang membuat akun pengguna.' },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  const fullName = String(body.full_name ?? '').trim();
  const role = String(body.role ?? '').trim();
  const branch = body.branch ? String(body.branch).trim() : null;
  const password = String(body.password ?? '');

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email tidak valid.' }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 });
  }
  if (role !== 'super_admin' && role !== 'branch_admin') {
    return NextResponse.json(
      {
        error:
          'Peran hanya boleh super_admin atau branch_admin. Akun teknisi diterbitkan lewat tombol Kirim Akses di dashboard.',
      },
      { status: 400 }
    );
  }
  if (role === 'branch_admin' && !branch) {
    return NextResponse.json(
      { error: 'Admin Cabang wajib memiliki cabang penugasan.' },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Kata sandi awal minimal 8 karakter.' },
      { status: 400 }
    );
  }

  // Cabang harus terdaftar pada master cabang
  if (branch) {
    const { data: branchRow } = await supabaseAdmin
      .from('branches')
      .select('name')
      .eq('name', branch)
      .maybeSingle();

    if (!branchRow) {
      return NextResponse.json(
        { error: `Cabang "${branch}" tidak terdaftar pada master cabang.` },
        { status: 400 }
      );
    }
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: `Gagal membuat akun: ${createError?.message ?? 'tidak diketahui'}` },
      { status: 400 }
    );
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
    .select('id, email, full_name, role, branch, technician_id, is_active, must_change_password')
    .single();

  if (profileError) {
    // Rollback agar tidak meninggalkan akun auth tanpa profil peran
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json(
      { error: `Gagal menyimpan profil peran: ${profileError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile });
}

// =============================================================
// PATCH — Reset kata sandi sebuah akun
// =============================================================
export async function PATCH(req: NextRequest) {
  const auth = await authenticateCaller(req);
  if ('error' in auth) return auth.error;

  const { caller } = auth;

  if (caller.role !== 'super_admin' && caller.role !== 'branch_admin') {
    return NextResponse.json(
      { error: 'Peran Anda tidak berwenang mengatur ulang kata sandi.' },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  const targetId = String(body.id ?? '').trim();
  if (!targetId) {
    return NextResponse.json({ error: 'ID akun wajib diisi.' }, { status: 400 });
  }

  const { data: target } = await supabaseAdmin
    .from('user_profiles')
    .select('id, email, full_name, role, branch, technician_id')
    .eq('id', targetId)
    .maybeSingle();

  if (!target) {
    return NextResponse.json({ error: 'Akun tidak ditemukan.' }, { status: 404 });
  }

  // Admin Cabang hanya boleh mereset akun teknisi di cabangnya sendiri
  if (caller.role === 'branch_admin') {
    if (target.role !== 'technician' || target.branch !== caller.branch) {
      return NextResponse.json(
        {
          error:
            'Admin Cabang hanya dapat mengatur ulang kata sandi teknisi di cabangnya sendiri.',
        },
        { status: 403 }
      );
    }
  }

  // Teknisi memakai pola kata sandi awal resmi; admin memakai sandi acak sekali pakai
  let newPassword: string | null = null;

  if (target.role === 'technician' && target.technician_id) {
    const { data: technician } = await supabaseAdmin
      .from('technicians')
      .select('phone')
      .eq('id', target.technician_id)
      .maybeSingle();

    newPassword = buildDefaultTechnicianPassword(technician?.phone);

    if (!newPassword) {
      return NextResponse.json(
        {
          error:
            'Nomor HP teknisi belum terisi atau kurang dari 4 digit, sehingga kata sandi awal tidak dapat dibentuk.',
        },
        { status: 422 }
      );
    }
  } else {
    newPassword = generateTemporaryPassword();
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetId, {
    password: newPassword,
  });

  if (updateError) {
    return NextResponse.json(
      { error: `Gagal mengatur ulang kata sandi: ${updateError.message}` },
      { status: 500 }
    );
  }

  // Wajibkan rotasi pada login berikutnya
  await supabaseAdmin
    .from('user_profiles')
    .update({ must_change_password: true })
    .eq('id', targetId);

  return NextResponse.json({
    password: newPassword,
    full_name: target.full_name,
    email: target.email,
    role: target.role,
  });
}

// =============================================================
// DELETE — Menghapus akun beserta profil perannya
// =============================================================
export async function DELETE(req: NextRequest) {
  const auth = await authenticateCaller(req);
  if ('error' in auth) return auth.error;

  if (auth.caller.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Hanya Super Admin yang berwenang menghapus akun.' },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  const targetId = String(body.id ?? '').trim();
  if (!targetId) {
    return NextResponse.json({ error: 'ID akun wajib diisi.' }, { status: 400 });
  }

  // Cegah Super Admin mengunci dirinya sendiri keluar dari sistem
  if (targetId === auth.caller.id) {
    return NextResponse.json(
      { error: 'Anda tidak dapat menghapus akun Anda sendiri.' },
      { status: 400 }
    );
  }

  // Menghapus auth.users otomatis menghapus user_profiles (ON DELETE CASCADE)
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetId);

  if (deleteError) {
    return NextResponse.json(
      { error: `Gagal menghapus akun: ${deleteError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ deleted: true });
}
