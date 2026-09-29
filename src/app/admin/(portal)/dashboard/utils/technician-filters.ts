// src/app/admin/(portal)/dashboard/utils/technician-filters.ts
import { Technician } from '@/types';

export interface TechnicianFilters {
  search: string;
  branch: string;
  level: string;
  status: string;
  /** Format YYYY-MM */
  month: string;
  /** Format YYYY */
  year: string;
}

/** Tahun & bulan (YYYY-MM) teknisi didaftarkan, untuk filter periode. */
function getCreatedPeriod(tech: Technician): { year: string; yearMonth: string } {
  if (!tech.created_at) return { year: '', yearMonth: '' };
  const created = new Date(tech.created_at);
  const year = String(created.getFullYear());
  const month = String(created.getMonth() + 1).padStart(2, '0');
  return { year, yearMonth: `${year}-${month}` };
}

/**
 * Menyaring teknisi di sisi klien.
 * Filter bulan/tahun cocok bila periode KPI terakhir ATAU tanggal pendaftaran sesuai.
 */
export function filterTechnicians(technicians: Technician[], filters: TechnicianFilters): Technician[] {
  const query = filters.search.toLowerCase();

  return technicians.filter((tech) => {
    const matchesSearch =
      query === '' ||
      tech.technician_name.toLowerCase().includes(query) ||
      tech.technician_id.toLowerCase().includes(query) ||
      tech.employee_number.toLowerCase().includes(query);

    const matchesBranch =
      filters.branch === '' || tech.branch.toLowerCase() === filters.branch.toLowerCase();
    const matchesLevel = filters.level === '' || tech.technician_level === filters.level;
    const matchesStatus = filters.status === '' || tech.technician_status === filters.status;

    const latestPeriod = tech.technician_performance?.[0]?.period; // contoh: '2026-08'
    const created = getCreatedPeriod(tech);

    const matchesMonth =
      !filters.month || latestPeriod === filters.month || created.yearMonth === filters.month;

    const periodYear = latestPeriod ? latestPeriod.split('-')[0] : '';
    const matchesYear =
      !filters.year || periodYear === filters.year || created.year === filters.year;

    return (
      matchesSearch && matchesBranch && matchesLevel && matchesStatus && matchesMonth && matchesYear
    );
  });
}
