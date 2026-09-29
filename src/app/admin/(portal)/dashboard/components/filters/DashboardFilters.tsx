// src/app/admin/(portal)/dashboard/components/filters/DashboardFilters.tsx
'use client';

import React from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { BranchSelect } from './BranchSelect';
import { MonthYearPicker } from './MonthYearPicker';

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
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #D1D5DB)',
  fontSize: '0.825rem',
  outline: 'none',
  backgroundColor: '#FFFFFF',
  cursor: 'pointer',
};

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
}) => {
  // Jumlah filter aktif di luar cabang kerja
  const activeFilterCount = [searchQuery, filterMonth, filterYear, filterLevel, filterStatus].filter(
    Boolean
  ).length;
  const hasActiveFilter = activeFilterCount > 0;

  return (
    <div
      className="modena-card"
      style={{
        marginBottom: '1.5rem',
        padding: '18px 20px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--border-color, #E5E7EB)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* BARIS 1: PENCARIAN */}
      <div style={{ position: 'relative', width: '100%' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted, #9CA3AF)',
          }}
        />
        <input
          id="filter-technician-search"
          name="filter_technician_search"
          type="text"
          aria-label="Cari teknisi"
          placeholder="Cari nama lengkap teknisi, ID teknisi, no. karyawan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 12px 9px 36px',
            borderRadius: '8px',
            border: '1px solid var(--border-color, #D1D5DB)',
            fontSize: '0.85rem',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
        />
      </div>

      {/* BARIS 2: CABANG, WAKTU, STATUS, LEVEL & RESET */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid #F3F4F6',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <BranchSelect value={filterBranch} onChange={setFilterBranch} lockedBranch={lockedBranch} />

          <MonthYearPicker
            month={filterMonth}
            year={filterYear}
            onMonthChange={setFilterMonth}
            onYearChange={setFilterYear}
          />

          <div style={{ minWidth: '130px' }}>
            <select
              id="filter-status"
              name="filter_status"
              aria-label="Filter status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={selectStyle}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          <div style={{ minWidth: '140px' }}>
            <select
              id="filter-level"
              name="filter_level"
              aria-label="Filter level"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={selectStyle}
            >
              <option value="">Semua Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advance">Advance</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          disabled={!hasActiveFilter}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: hasActiveFilter ? '#FEE2E2' : '#F3F4F6',
            color: hasActiveFilter ? '#DC2626' : '#9CA3AF',
            border: hasActiveFilter ? '1px solid #FECACA' : '1px solid #E5E7EB',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: hasActiveFilter ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
        >
          <RotateCcw size={14} />
          <span>Reset Filter {hasActiveFilter ? `(${activeFilterCount})` : ''}</span>
        </button>
      </div>
    </div>
  );
};
