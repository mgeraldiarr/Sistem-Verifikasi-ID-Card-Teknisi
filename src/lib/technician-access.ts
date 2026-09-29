// src/lib/technician-access.ts

/** Teks petunjuk resmi yang ditampilkan pada halaman login. */
export const TECHNICIAN_PASSWORD_HINT =
  'Petunjuk Teknisi: Masuk menggunakan ID Teknisi pada kartu Anda (contoh: DSC-BAL-001). Password awal resmi: Modena@{4 digit terakhir No HP}.';

/**
 * Kata sandi awal resmi teknisi: `Modena@{4 digit terakhir nomor HP}`.
 * Mengembalikan null bila nomor HP tidak memiliki minimal 4 digit.
 */
export function buildDefaultTechnicianPassword(
  phone: string | null | undefined
): string | null {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (digits.length < 4) return null;
  return `Modena@${digits.slice(-4)}`;
}

/**
 * Email pribadi pemilik akun (teknisi / Admin Cabang).
 * Login tetap memakai ID (DSC-... / ADM-...); email dipakai Supabase Auth
 * dan untuk menerima tautan "Lupa Kata Sandi". Mengembalikan null bila tidak valid.
 */
export function normalizePersonalEmail(email: string | null | undefined): string | null {
  const trimmed = String(email ?? '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : null;
}

/**
 * Normalisasi nomor HP Indonesia ke format internasional wa.me (62xxxxxxxxxx).
 */
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (digits.length < 8) return null;

  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
}

interface AccessMessageOptions {
  technicianName: string;
  /** ID Teknisi (DSC-...) yang dipakai sebagai ID login */
  technicianId: string;
  loginUrl: string;
  /** Hanya tersedia saat akun baru pertama kali diterbitkan */
  password?: string | null;
}

/**
 * Menyusun pesan WhatsApp resmi berisi petunjuk akses portal teknisi.
 */
export function buildTechnicianAccessMessage({
  technicianName,
  technicianId,
  loginUrl,
  password,
}: AccessMessageOptions): string {
  const lines = [
    `Halo ${technicianName},`,
    '',
    'Berikut akses resmi Kartu Digital Teknisi MODENA Anda:',
    '',
    `Portal  : ${loginUrl}`,
    `ID Login: ${technicianId}`,
  ];

  if (password) {
    lines.push(`Password: ${password}`);
    lines.push('');
    lines.push(
      'PENTING: Kata sandi di atas bersifat sementara. Anda WAJIB menggantinya saat pertama kali masuk sebelum kartu digital dapat dibuka.'
    );
  } else {
    lines.push('Password: (gunakan kata sandi yang sudah Anda miliki)');
    lines.push('');
    lines.push(
      'Jika lupa kata sandi, gunakan menu "Lupa Kata Sandi" pada halaman login.'
    );
  }

  lines.push('');
  lines.push('Terima kasih.');
  lines.push('MODENA Technician Portal');

  return lines.join('\n');
}
