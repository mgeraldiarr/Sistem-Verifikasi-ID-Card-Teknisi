// src/lib/server/admin-id.ts
import 'server-only';
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { generateAdminId, getBranchCode } from '@/constants/branch-codes';

const MAX_ATTEMPTS = 3;

/** 23505 = unique_violation (nomor ID baru saja dipakai proses lain) */
const UNIQUE_VIOLATION = '23505';

/** Mengambil ID Admin Cabang berikutnya (ADM-[KODE]-[NN]) berdasarkan nomor tertinggi. */
export async function getNextAdminId(
  branch: string
): Promise<{ adminId: string } | { error: string }> {
  const code = getBranchCode(branch);
  const { data: rows, error } = await supabaseAdmin
    .from('user_profiles')
    .select('admin_id')
    .ilike('admin_id', `ADM-${code}-%`);

  if (error) return { error: error.message };
  return { adminId: generateAdminId(branch, (rows ?? []).map((r) => r.admin_id as string)) };
}

/**
 * Menerbitkan ID login Admin Cabang untuk sebuah profil.
 *
 * Kolom `admin_id` bersifat UNIQUE, jadi bila dua penerbitan berjalan bersamaan
 * dan menghasilkan nomor yang sama, percobaan berikutnya mengambil nomor baru.
 */
export async function assignAdminId(
  profileId: string,
  branch: string
): Promise<{ adminId: string } | { error: string }> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const next = await getNextAdminId(branch);
    if ('error' in next) return next;

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ admin_id: next.adminId })
      .eq('id', profileId);

    if (!error) return next;
    if (error.code !== UNIQUE_VIOLATION) return { error: error.message };
  }

  return { error: 'Gagal menerbitkan ID admin unik. Silakan coba lagi.' };
}

export const ACCOUNT_PROFILE_COLUMNS =
  'id, email, full_name, role, branch, technician_id, is_active, must_change_password, admin_id';
