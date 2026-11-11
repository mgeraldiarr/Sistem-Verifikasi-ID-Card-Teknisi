// src/lib/grooming/camera-validator.ts

const MAX_AGE_MINUTES = 30;
const MAX_AGE_MS = MAX_AGE_MINUTES * 60 * 1000;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  ageMinutes?: number;
}

/**
 * Validasi kebaruan foto (Anti-Galeri / Freshness Check).
 * Foto yang diambil lebih dari 30 menit sebelum pengiriman akan ditolak untuk
 * memastikan foto diambil secara langsung dari kamera dan bukan arsip galeri lama.
 */
export function validateCameraFreshness(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'File foto tidak ditemukan.' };
  }

  // Cek tipe file gambar
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Format file tidak didukung. Harap ambil foto dari kamera.' };
  }

  const now = Date.now();
  const fileTime = file.lastModified;

  // Bila lastModified tidak valid atau 0
  if (!fileTime || isNaN(fileTime)) {
    return { valid: true }; // Fallback jika browser/perangkat tidak menyediakan lastModified
  }

  const ageMs = now - fileTime;

  // Toleransi clock drift (misal waktu perangkat user beberapa detik ke depan)
  if (ageMs < -60000) {
    return {
      valid: false,
      error: 'Waktu pada perangkat Anda tidak sesuai (terlalu cepat). Harap periksa pengaturan jam.',
    };
  }

  const ageMinutes = Math.floor(Math.max(0, ageMs) / 60000);

  if (ageMs > MAX_AGE_MS) {
    return {
      valid: false,
      ageMinutes,
      error: `Foto terdeteksi diambil ${ageMinutes} menit yang lalu. Sesuai SOP Anti-Fraud, foto wajib diambil langsung menggunakan kamera saat ini (maksimal batas ${MAX_AGE_MINUTES} menit).`,
    };
  }

  return { valid: true, ageMinutes };
}
