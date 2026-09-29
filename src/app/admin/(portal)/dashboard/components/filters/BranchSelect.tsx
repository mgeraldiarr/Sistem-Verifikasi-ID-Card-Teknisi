// src/app/admin/(portal)/dashboard/components/filters/BranchSelect.tsx
'use client';

import React from 'react';
import { Building2, Lock } from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';

interface BranchSelectProps {
  value: string;
  onChange: (branch: string) => void;
  /** Admin Cabang: dropdown terkunci pada cabangnya sendiri */
  lockedBranch: string | null;
}

/** Pemilih cabang DSC kerja ('' = seluruh cabang). */
export const BranchSelect: React.FC<BranchSelectProps> = ({ value, onChange, lockedBranch }) => {
  // Master cabang dari tabel `branches` (fallback ke konstanta bila belum dimigrasi)
  const { branchNames } = useBranches();
  const isLocked = Boolean(lockedBranch);

  return (
    <div style={{ minWidth: '210px', position: 'relative' }}>
      <select
        id="filter-branch"
        name="filter_branch"
        aria-label="Filter cabang"
        value={isLocked ? lockedBranch ?? '' : value}
        disabled={isLocked}
        onChange={(e) => onChange(e.target.value)}
        title={isLocked ? `Akses Anda terkunci pada cabang ${lockedBranch}` : 'Pilih cabang DSC'}
        style={{
          width: '100%',
          padding: '8px 10px 8px 32px',
          borderRadius: '8px',
          border: isLocked ? '1px solid #E5E7EB' : '1px solid var(--border-color, #D1D5DB)',
          fontSize: '0.825rem',
          fontWeight: isLocked ? 700 : 500,
          outline: 'none',
          backgroundColor: isLocked ? '#F3F4F6' : '#FFFFFF',
          color: isLocked ? '#6B7280' : '#374151',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          appearance: 'auto',
        }}
      >
        {isLocked ? (
          <option value={lockedBranch ?? ''}>{lockedBranch}</option>
        ) : (
          <>
            <option value="">Semua Cabang DSC</option>
            {branchNames.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </>
        )}
      </select>

      <span
        style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {isLocked ? (
          <Lock size={13} color="#DA291C" />
        ) : (
          <Building2 size={13} color="var(--text-muted, #9CA3AF)" />
        )}
      </span>
    </div>
  );
};
