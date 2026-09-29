// src/app/api/admin/technician-access/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { authenticateCaller, isUuid, jsonError, readJsonBody } from '@/lib/server/api-auth';
import { buildDefaultTechnicianPassword, normalizePersonalEmail } from '@/lib/technician-access';

export const dynamic = 'force-dynamic';

/**
 * Menyiapkan (provisioning) akun portal mandiri untuk seorang teknisi.
 *
 * Dipanggil oleh Admin Cabang / Super Admin dari tombol "Kirim Akses via WhatsApp".
 * Endpoint ini memakai service role sehingga otorisasi pemanggil diverifikasi manual:
 *   - super_admin  : boleh untuk teknisi cabang mana pun
 *   - branch_admin : hanya untuk teknisi di cabangnya sendiri
 */
export async function POST(req: NextRequest) {
  // 1-2. Verifikasi sesi & peran pemanggil
  const auth = await authenticateCaller(
    req,
    ['super_admin', 'branch_admin'],
    'Peran Anda tidak berwenang menerbitkan akses teknisi.'
  );
  if ('error' in auth) return auth.error;
  const callerProfile = auth.caller;

  // 3. Validasi payload
  const body = await readJsonBody<{ technician_id?: unknown }>(req);
  if (!body) return jsonError('Format permintaan tidak valid.', 400);

  const technicianRowId = String(body.technician_id ?? '').trim();
  if (!isUuid(technicianRowId)) return jsonError('ID teknisi tidak valid.', 400);

  // 4. Ambil data teknisi
  const { data: technician } = await supabaseAdmin
    .from('technicians')
    .select('id, technician_id, technician_name, employee_number, branch, phone, email')
    .eq('id', technicianRowId)
    .maybeSingle();

  if (!technician) {
    return NextResponse.json({ error: 'Data teknisi tidak ditemukan.' }, { status: 404 });
  }

  // 5. Isolasi cabang: Admin Cabang hanya boleh untuk teknisi cabangnya
  if (
    callerProfile.role === 'branch_admin' &&
    technician.branch !== callerProfile.branch
  ) {
    return NextResponse.json(
      {
        error: `Akses ditolak: teknisi ini terdaftar di cabang ${technician.branch}, sedangkan Anda mengelola cabang ${callerProfile.branch}.`,
      },
      { status: 403 }
    );
  }

  // 6. Jika akun portal sudah ada, jangan buat ulang dan jangan bocorkan kata sandi
  const { data: existingProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('id, email, is_active')
    .eq('technician_id', technician.id)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json({
      created: false,
      email: existingProfile.email,
      is_active: existingProfile.is_active,
      employee_number: technician.employee_number,
      technician_name: technician.technician_name,
      phone: technician.phone,
    });
  }

  // 7. Kata sandi awal resmi: Modena@{4 digit terakhir No HP}
  const password = buildDefaultTechnicianPassword(technician.phone);
  if (!password) {
    return NextResponse.json(
      {
        error:
          'Nomor HP teknisi belum terisi atau kurang dari 4 digit. Lengkapi nomor HP terlebih dahulu sebelum menerbitkan akses.',
      },
      { status: 422 }
    );
  }

  // Akun teknisi memakai email pribadinya sendiri (untuk Lupa Kata Sandi)
  const loginEmail = normalizePersonalEmail(technician.email);
  if (!loginEmail) {
    return NextResponse.json(
      {
        error:
          'Email pribadi teknisi belum diisi atau tidak valid. Lengkapi email pada data teknisi terlebih dahulu sebelum menerbitkan akses.',
      },
      { status: 422 }
    );
  }

  // 8. Buat akun auth + profil peran teknisi
  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: loginEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: technician.technician_name,
      employee_number: technician.employee_number,
    },
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { error: `Gagal membuat akun teknisi: ${createError?.message ?? 'tidak diketahui'}` },
      { status: 500 }
    );
  }

  const { error: profileError } = await supabaseAdmin.from('user_profiles').insert({
    id: created.user.id,
    email: loginEmail,
    full_name: technician.technician_name,
    role: 'technician',
    branch: technician.branch,
    technician_id: technician.id,
    is_active: true,
    // Kata sandi awal bersifat sementara: wajib dirotasi pada login pertama
    must_change_password: true,
  });

  if (profileError) {
    // Rollback akun auth agar tidak tertinggal tanpa profil peran
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json(
      { error: `Gagal menyimpan profil peran teknisi: ${profileError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    created: true,
    email: loginEmail,
    password,
    is_active: true,
    employee_number: technician.employee_number,
    technician_name: technician.technician_name,
    phone: technician.phone,
  });
}
