// src/app/admin/dashboard/components/DashboardFilters.tsx
'use client';

import React from 'react';
import { Filter, Search } from 'lucide-react';

interface DashboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterBranch: string;
  setFilterBranch: (val: string) => void;
  filterLevel: string;
  setFilterLevel: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  uniqueBranches: string[];
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterBranch,
  setFilterBranch,
  filterLevel,
  setFilterLevel,
  filterStatus,
  setFilterStatus,
  uniqueBranches,
}) => {
  return (
    <div
      className="modena-card"
      style={{
        marginBottom: '1.5rem',
        padding: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
      }}
    >
      {/* Input Pencarian */}
      <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          type="text"
          placeholder="Cari nama, ID MOD, nomor karyawan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px 10px 38px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Filter Cabang */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          minWidth: '150px',
        }}
      >
        <Filter size={16} style={{ color: 'var(--text-muted)' }} />
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        >
          <option value="">Semua Cabang</option>
          {uniqueBranches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>

      {/* Filter Level */}
      <div style={{ minWidth: '150px' }}>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        >
          <option value="">Semua Level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advance">Advance</option>
        </select>
      </div>

      {/* Filter Status */}
      <div style={{ minWidth: '130px' }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>
    </div>
  );
};
