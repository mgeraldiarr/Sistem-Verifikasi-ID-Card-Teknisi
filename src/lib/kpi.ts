// src/lib/kpi.ts
import { TechnicianLevel } from '@/types';

export interface KpiIndicators {
  tat?: number | null;
  rtat?: number | null;
  csat?: number | null;
  grooming_score?: number | null; // Penampilan
  service_score?: number | null; // Pelayanan
  repair_quality_score?: number | null; // Hasil Perbaikan
}

/**
 * 1. TIPE & DEFAULT BOBOT PERSENTASE (TOTAL = 100%)
 */
export interface KpiWeights {
  tat: number; // Default 20%
  rtat: number; // Default 15%
  csat: number; // Default 25%
  grooming: number; // Default 10% (Penampilan)
  service: number; // Default 15% (Pelayanan)
  repair_quality: number; // Default 15% (Hasil Perbaikan)
}

export const DEFAULT_KPI_WEIGHTS: KpiWeights = {
  tat: 20,
  rtat: 15,
  csat: 25,
  grooming: 10,
  service: 15,
  repair_quality: 15,
};

// Kompatibilitas mundur dengan format desimal lama (0.2, 0.15, dst.)
export const KPI_WEIGHTS = {
  tat: 0.2,
  rtat: 0.15,
  csat: 0.25,
  grooming: 0.1,
  service: 0.15,
  repair_quality: 0.15,
} as const;

export const STORAGE_KEY_KPI_WEIGHTS = 'modena_kpi_weights_v1';

/**
 * 2. VALIDATOR BOBOT KPI
 * Memastikan total 6 indikator persis 100%.
 */
export function validateKpiWeights(weights: KpiWeights): {
  isValid: boolean;
  total: number;
  message?: string;
} {
  const total =
    Number(weights.tat || 0) +
    Number(weights.rtat || 0) +
    Number(weights.csat || 0) +
    Number(weights.grooming || 0) +
    Number(weights.service || 0) +
    Number(weights.repair_quality || 0);

  // Toleransi rounding floating-point kecil
  const isHundred = Math.abs(total - 100) < 0.01;

  return {
    isValid: isHundred,
    total: Math.round(total * 100) / 100,
    message: isHundred
      ? 'Total bobot valid (100%).'
      : `Total bobot saat ini ${total}%. Wajib berjumlah tepat 100%.`,
  };
}

/**
 * 3. PENYIMPANAN & PENGAMBILAN DARI LOCALSTORAGE
 * Aman dari error SSR (Server Side Rendering).
 */
export function getKpiWeights(): KpiWeights {
  if (typeof window === 'undefined') {
    return DEFAULT_KPI_WEIGHTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_KPI_WEIGHTS);
    if (!raw) return DEFAULT_KPI_WEIGHTS;

    const parsed: KpiWeights = JSON.parse(raw);
    const validation = validateKpiWeights(parsed);
    return validation.isValid ? parsed : DEFAULT_KPI_WEIGHTS;
  } catch {
    return DEFAULT_KPI_WEIGHTS;
  }
}

export function saveKpiWeights(weights: KpiWeights): boolean {
  if (typeof window === 'undefined') return false;

  const validation = validateKpiWeights(weights);
  if (!validation.isValid) return false;

  try {
    localStorage.setItem(STORAGE_KEY_KPI_WEIGHTS, JSON.stringify(weights));
    return true;
  } catch {
    return false;
  }
}

/**
 * 4. NORMALISASI SKOR INDIKATOR (Skala 0 - 100)
 * Jika pengguna menginput skala 1-10 (misal CSAT 9.5), dikalikan 10 jadi 95.
 */
export function normalizeIndicatorScore(val: number | null | undefined): number {
  if (val === undefined || val === null || isNaN(val)) return 0;
  if (val < 0) return 0;
  if (val > 0 && val <= 10) {
    return Math.min(100, Math.round(val * 10 * 100) / 100);
  }
  return Math.min(100, Math.round(val * 100) / 100);
}

/**
 * 5. MENGHITUNG TOTAL SKOR KPI TERBOBOT
 * Mendukung injeksi customWeights (atau otomatis mengambil dari pengaturan tersimpan).
 */
export function calculateWeightedKpi(
  indicators: KpiIndicators,
  customWeights?: KpiWeights
): number {
  const weights = customWeights || getKpiWeights();

  const tat = normalizeIndicatorScore(indicators.tat);
  const rtat = normalizeIndicatorScore(indicators.rtat);
  const csat = normalizeIndicatorScore(indicators.csat);
  const grooming = normalizeIndicatorScore(indicators.grooming_score);
  const service = normalizeIndicatorScore(indicators.service_score);
  const repairQuality = normalizeIndicatorScore(indicators.repair_quality_score);

  // Bobot dalam format persentase bulat (20, 15, dst), jadi dibagi 100
  const total =
    tat * (weights.tat / 100) +
    rtat * (weights.rtat / 100) +
    csat * (weights.csat / 100) +
    grooming * (weights.grooming / 100) +
    service * (weights.service / 100) +
    repairQuality * (weights.repair_quality / 100);

  return Math.round(total * 100) / 100;
}

/**
 * 6. MENENTUKAN LEVEL SERTIFIKASI TEKNISI (AUTO-LEVEL)
 * - Skor < 70   -> beginner
 * - Skor 70-84  -> intermediate
 * - Skor >= 85  -> advance
 */
export function determineTechnicianLevel(score: number): TechnicianLevel {
  if (score < 70) return 'beginner';
  if (score < 85) return 'intermediate';
  return 'advance';
}

/**
 * 7. LOGIKA HYBRID PENILAIAN EXCEL & MANUAL
 */
export function calculateHybridKpi(
  indicators: KpiIndicators,
  clientScore?: number | null,
  clientLevel?: string | null,
  customWeights?: KpiWeights
): {
  score: number;
  level: TechnicianLevel;
  isCalculated: boolean;
} {
  const hasClientScore =
    clientScore !== undefined &&
    clientScore !== null &&
    !isNaN(clientScore) &&
    clientScore > 0;

  let normClientLevel: TechnicianLevel | null = null;
  if (clientLevel) {
    const cl = String(clientLevel).trim().toLowerCase();
    if (['advance', 'advanced', 'mahir', 'senior', 'adv'].includes(cl)) {
      normClientLevel = 'advance';
    } else if (['intermediate', 'menengah', 'madya'].includes(cl)) {
      normClientLevel = 'intermediate';
    } else if (['beginner', 'pemula', 'basic', 'begginer'].includes(cl)) {
      normClientLevel = 'beginner';
    }
  }

  // Jika kolom skor disediakan dari Excel klien, hormati skor tersebut
  if (hasClientScore) {
    const finalScore = Math.min(100, Math.max(0, Math.round(clientScore * 100) / 100));
    const finalLevel = normClientLevel || determineTechnicianLevel(finalScore);
    return {
      score: finalScore,
      level: finalLevel,
      isCalculated: false,
    };
  }

  // Jika skor kosong, hitung otomatis dari indikator & bobot aktif
  const autoScore = calculateWeightedKpi(indicators, customWeights);

  return {
    score: autoScore,
    level: normClientLevel || determineTechnicianLevel(autoScore),
    isCalculated: true,
  };
}
