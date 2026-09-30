// src/app/admin/(portal)/dashboard/components/filters/DashboardFilters.tsx
'use client';

import React from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { BranchSelect } from './BranchSelect';
import { MonthYearPicker } from './MonthYearPicker';
import styles from './DashboardFilters.module.css';

interface DashboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  /** Cabang kerja aktif ('' = seluruh cabang DSC) */
  filterBranch: string;
  setFilterBranch: (val: string) => void;
  /**
   * Bila diisi (Admin Cabang), dropdown cabang dikunci ke cabang tersebut
   * sehingga data cabang lain tidak dapat dibuka.
   */
  lockedBranch?: string | null;
  filterMonth: string; // Format: 'YYYY-MM' (contoh: '2026-08')
  setFilterMonth: (val: string) => void;
  filterYear: string; // Format: 'YYYY' (contoh: '2026')
  setFilterYear: (val: string) => void;
  filterLevel: string;
  setFilterLevel: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  onResetFilters: () => void;
  /** Jumlah baris yang cocok dengan filter aktif */
  resultCount: number;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterBranch,
  setFilterBranch,
  lockedBranch = null,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  filterLevel,
  setFilterLevel,
  filterStatus,
  setFilterStatus,
  onResetFilters,
  resultCount,
}) => {
  // Jumlah filter aktif di luar cabang kerja
  const activeFilterCount = [searchQuery, filterMonth, filterYear, filterLevel, filterStatus].filter(
    Boolean
  ).length;

  return (
    <div className={styles.filters} role="search">
      <div className="input-wrap">
        <Search size={16} className="input-icon" />
        <input
          id="filter-technician-search"
          name="filter_technician_search"
          type="search"
          className="input"
          aria-label="Cari teknisi"
          placeholder="Cari nama, ID teknisi, atau nomor karyawan"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.controls}>
        <BranchSelect value={filterBranch} onChange={setFilterBranch} lockedBranch={lockedBranch} />

        <MonthYearPicker
          month={filterMonth}
          year={filterYear}
          onMonthChange={setFilterMonth}
          onYearChange={setFilterYear}
        />

        <select
          id="filter-status"
          name="filter_status"
          className="select"
          aria-label="Filter status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Semua status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>

        <select
          id="filter-level"
          name="filter_level"
          className="select"
          aria-label="Filter level"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="">Semua level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advance">Advance</option>
        </select>
      </div>

      <div className={styles.summary}>
        <span className="tnum">
          {resultCount} teknisi ditampilkan
          {activeFilterCount > 0 && `, ${activeFilterCount} filter aktif`}
        </span>
        {activeFilterCount > 0 && (
          <button type="button" onClick={onResetFilters} className="btn btn-ghost btn-sm">
            <RotateCcw size={14} />
            Hapus filter
          </button>
        )}
      </div>
    </div>
  );
};
