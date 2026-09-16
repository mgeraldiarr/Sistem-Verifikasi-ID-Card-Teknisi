// src/lib/technician-access.ts

/**
 * Domain email sintetis untuk teknisi yang belum memiliki email korporat.
 * Akun tetap login memakai NIK; email hanya dipakai internal oleh Supabase Auth.
 */
export const TECHNICIAN_LOGIN_DOMAIN = 'teknisi.modena.co.id';

/** Teks petunjuk resmi yang ditampilkan pada halaman login. */
export const TECHNICIAN_PASSWORD_HINT =
  'Petunjuk Teknisi: Masuk menggunakan NIK Anda. Password awal resmi: Modena@{4 digit terakhir No HP}.';

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
 * Email login teknisi: pakai email korporat bila tersedia,
 * selain itu bentuk email sintetis dari Nomor Karyawan (NIK).
 */
export function buildTechnicianLoginEmail(
  email: string | null | undefined,
  employeeNumber: string
): string {
  const trimmed = String(email ?? '').trim();
  if (trimmed && trimmed.includes('@')) return trimmed.toLowerCase();

  const safeNik = employeeNumber.replace(/[^A-Za-z0-9._-]/g, '').toLowerCase();
  return `${safeNik || 'teknisi'}@${TECHNICIAN_LOGIN_DOMAIN}`;
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
  employeeNumber: string;
  loginUrl: string;
  /** Hanya tersedia saat akun baru pertama kali diterbitkan */
  password?: string | null;
}

/**
 * Menyusun pesan WhatsApp resmi berisi petunjuk akses portal teknisi.
 */
export function buildTechnicianAccessMessage({
  technicianName,
  employeeNumber,
  loginUrl,
  password,
}: AccessMessageOptions): string {
  const lines = [
    `Halo ${technicianName},`,
    '',
    'Berikut akses resmi Kartu Digital Teknisi MODENA Anda:',
    '',
    `Portal  : ${loginUrl}`,
    `NIK     : ${employeeNumber}`,
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
