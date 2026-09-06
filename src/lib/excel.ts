// src/lib/excel.ts
import { CardStatus, TechnicianLevel, TechnicianStatus } from '@/types';

/**
 * Mencari nilai pada baris objek Excel berdasarkan kecocokan nama kolom (tidak sensitif huruf besar/kecil & spasi/simbol)
 */
export const getRowValue = (row: any, keys: string[]): any => {
  if (!row || typeof row !== 'object') return undefined;

  for (const rawKey of Object.keys(row)) {
    const normKey = rawKey.toLowerCase().replace(/[\s_\-\/]/g, '');
    if (keys.some((k) => k.toLowerCase().replace(/[\s_\-\/]/g, '') === normKey)) {
      return row[rawKey];
    }
  }
  return undefined;
};

/**
 * Membaca dan menstandarisasi tanggal dari berbagai format Excel (Serial number, Date object, string ISO)
 */
export const parseExcelDate = (val: any): string | null => {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return null;
};

/**
 * Mengonversi nilai numerik Excel yang mungkin berisi koma atau format teks
 */
export const parseExcelNumber = (val: any): number => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const str = String(val).trim().replace(',', '.');
  const num = Number(str);
  return isNaN(num) ? 0 : num;
};

/**
 * Menstandarisasi format periode (YYYY-MM) dari teks, Date, ataupun serial number Excel
 */
export const parseExcelPeriod = (val: any): string | null => {
  if (!val) return null;
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}$/.test(str)) return str;
  const parts = str.split(/[\/\-]/);
  if (parts.length === 2) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}`;
    } else {
      return `${parts[1]}-${parts[0].padStart(2, '0')}`;
    }
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  return null;
};

/**
 * Memetakan variasi teks status ke 'active' atau 'inactive'
 */
export const mapStatus = (val: any): TechnicianStatus => {
  if (!val) return 'active';
  const str = String(val).trim().toLowerCase();
  if (['aktif', 'active', 'yes', '1', 'true', 'aktif/active'].includes(str)) return 'active';
  if (
    [
      'nonaktif',
      'tidak aktif',
      'inactive',
      'no',
      '0',
      'false',
      'blokir',
      'diblokir',
      'non-aktif',
      'non_aktif',
    ].includes(str)
  )
    return 'inactive';
  return 'active';
};

/**
 * Memetakan variasi teks level sertifikasi ke 'beginner' | 'intermediate' | 'advance'
 */
export const mapLevel = (val: any): TechnicianLevel => {
  if (!val) return 'beginner';
  const str = String(val).trim().toLowerCase();
  if (['beginner', 'pemula', 'basic', 'begginer'].includes(str)) return 'beginner';
  if (['intermediate', 'menengah', 'madya'].includes(str)) return 'intermediate';
  if (['advance', 'advanced', 'mahir', 'senior', 'adv'].includes(str)) return 'advance';
  return 'beginner';
};

/**
 * Memetakan variasi teks status ID card fisik ke 'active' | 'suspended' | 'expired'
 */
export const mapCardStatus = (val: any): CardStatus => {
  if (!val) return 'active';
  const str = String(val).trim().toLowerCase();
  if (['aktif', 'active', 'yes', '1', 'true'].includes(str)) return 'active';
  if (['suspended', 'ditangguhkan', 'suspend', 'tangguh'].includes(str)) return 'suspended';
  if (['expired', 'kadaluarsa', 'habis', 'exp'].includes(str)) return 'expired';
  return 'active';
};
