// src/app/admin/(portal)/dashboard/utils/dashboard-stats.ts
import { MONTH_NAMES } from '@/constants/months';
import { Technician } from '@/types';

export interface SkillDistributionStats {
  total: number;
  beginnerCount: number;
  beginnerPercent: number;
  intermediateCount: number;
  intermediatePercent: number;
  advanceCount: number;
  advancePercent: number;
  avgKpi: number;
  avgCsi: number;
}

const isValidNumber = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value);

const roundOneDecimal = (value: number) => Math.round(value * 10) / 10;

/** Distribusi level teknisi dan rata-rata KPI/CSI dari data yang sedang ditampilkan. */
export function computeSkillDistribution(technicians: Technician[]): SkillDistributionStats {
  const total = technicians.length;
  let beginnerCount = 0;
  let intermediateCount = 0;
  let advanceCount = 0;
  const kpiScores: number[] = [];
  const csiScores: number[] = [];

  for (const tech of technicians) {
    if (tech.technician_level === 'beginner') beginnerCount++;
    else if (tech.technician_level === 'intermediate') intermediateCount++;
    else if (tech.technician_level === 'advance') advanceCount++;

    const perf = tech.technician_performance?.[0];
    if (isValidNumber(perf?.kpi_score)) kpiScores.push(perf.kpi_score);
    if (isValidNumber(perf?.csi_score)) csiScores.push(perf.csi_score);
  }

  const percent = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);
  const beginnerPercent = percent(beginnerCount);
  const intermediatePercent = percent(intermediateCount);
  // Sisa dari 100 agar total persentase selalu tepat 100 meski ada pembulatan
  const advancePercent = total > 0 ? Math.max(0, 100 - beginnerPercent - intermediatePercent) : 0;

  const average = (values: number[]) =>
    values.length > 0 ? roundOneDecimal(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  return {
    total,
    beginnerCount,
    beginnerPercent,
    intermediateCount,
    intermediatePercent,
    advanceCount,
    advancePercent,
    avgKpi: average(kpiScores),
    avgCsi: average(csiScores),
  };
}

function monthName(yearMonth: string): string {
  const monthIndex = parseInt(yearMonth.split('-')[1], 10) - 1;
  return MONTH_NAMES[monthIndex] || yearMonth;
}

/** Label periode kumulatif (YTD) untuk konteks dashboard, mengikuti filter bulan/tahun aktif. */
export function buildPeriodLabel(year: string, month: string): string {
  if (year && month) return `kumulatif Januari–${monthName(month)} ${year}`;
  if (year) return `kumulatif sepanjang ${year}`;
  if (month) return `${monthName(month)} ${month.split('-')[0] || ''}`.trim();
  return 'semua periode';
}

export function buildBranchLabel(branch: string, totalBranches: number): string {
  return branch ? `DSC ${branch}` : `Semua ${totalBranches} cabang DSC`;
}
