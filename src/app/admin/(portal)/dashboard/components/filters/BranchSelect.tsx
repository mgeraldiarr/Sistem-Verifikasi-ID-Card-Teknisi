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
    <div className="input-wrap">
      {isLocked ? (
        <Lock size={14} className="input-icon" />
      ) : (
        <Building2 size={14} className="input-icon" />
      )}
      <select
        id="filter-branch"
        name="filter_branch"
        className="select"
        aria-label="Filter cabang"
        value={isLocked ? lockedBranch ?? '' : value}
        disabled={isLocked}
        onChange={(e) => onChange(e.target.value)}
        title={isLocked ? `Akses Anda terkunci pada cabang ${lockedBranch}` : 'Pilih cabang DSC'}
      >
        {isLocked ? (
          <option value={lockedBranch ?? ''}>{lockedBranch}</option>
        ) : (
          <>
            <option value="">Semua cabang DSC</option>
            {branchNames.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
};
