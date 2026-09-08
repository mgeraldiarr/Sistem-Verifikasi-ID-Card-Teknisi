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

export const KPI_WEIGHTS = {
  tat: 0.2, // 20%
  rtat: 0.15, // 15%
  csat: 0.25, // 25%
  grooming: 0.1, // 10% (Penampilan)
  service: 0.15, // 15% (Pelayanan)
  repair_quality: 0.15, // 15% (Hasil Perbaikan)
} as const;

/**
 * Normalisasi skor indikator ke skala 0 - 100 jika klien menginput dalam skala 0 - 10 atau 0 - 5
 */
export function normalizeIndicatorScore(val: number | null | undefined): number {
  if (val === undefined || val === null || isNaN(val)) return 0;
  if (val < 0) return 0;
  // Jika bernilai antara 0.1 s/d 10 (misal CSAT 9.5 atau CSI 8.8), kalikan 10 ke skala 100
  if (val > 0 && val <= 10) {
    return Math.min(100, Math.round(val * 10 * 100) / 100);
  }
  return Math.min(100, Math.round(val * 100) / 100);
}

/**
 * Menghitung Total Skor KPI Berdasarkan 6 Indikator Terbobot (Skala 0 - 100)
 */
export function calculateWeightedKpi(indicators: KpiIndicators): number {
  const tat = normalizeIndicatorScore(indicators.tat);
  const rtat = normalizeIndicatorScore(indicators.rtat);
  const csat = normalizeIndicatorScore(indicators.csat);
  const grooming = normalizeIndicatorScore(indicators.grooming_score);
  const service = normalizeIndicatorScore(indicators.service_score);
  const repairQuality = normalizeIndicatorScore(indicators.repair_quality_score);

  const total =
    tat * KPI_WEIGHTS.tat +
    rtat * KPI_WEIGHTS.rtat +
    csat * KPI_WEIGHTS.csat +
    grooming * KPI_WEIGHTS.grooming +
    service * KPI_WEIGHTS.service +
    repairQuality * KPI_WEIGHTS.repair_quality;

  return Math.round(total * 100) / 100;
}

/**
 * Menentukan Level Sertifikasi Teknisi Berdasarkan Skor Total:
 * - < 70  -> Beginner
 * - 70-84 -> Intermediate
 * - >= 85 -> Advance
 */
export function determineTechnicianLevel(score: number): TechnicianLevel {
  if (score < 70) return 'beginner';
  if (score < 85) return 'intermediate';
  return 'advance';
}

/**
 * Logika Penilaian Hybrid:
 * 1. Jika Kolom 11 (Client Score) & Kolom 12 (Client Level) sudah diisi di Excel:
 *    Sistem memprioritaskan data dari Excel klien.
 * 2. Jika Kolom 11 & 12 dikosongkan (atau saat input/edit manual di web):
 *    Sistem otomatis menghitung Skor Total berdasarkan bobot 6 indikator
 *    dan menetapkan Status Level secara otomatis.
 */
export function calculateHybridKpi(
  indicators: KpiIndicators,
  clientScore?: number | null,
  clientLevel?: string | null
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

  // Jika kolom 11 & 12 disediakan oleh klien
  if (hasClientScore) {
    const finalScore = Math.min(100, Math.max(0, Math.round(clientScore * 100) / 100));
    const finalLevel = normClientLevel || determineTechnicianLevel(finalScore);
    return {
      score: finalScore,
      level: finalLevel,
      isCalculated: false,
    };
  }

  // Jika kolom 11 & 12 kosong, jalankan kalkulasi otomatis
  const autoScore = calculateWeightedKpi(indicators);
  const autoLevel = determineTechnicianLevel(autoScore);

  return {
    score: autoScore,
    level: autoLevel,
    isCalculated: true,
  };
}
