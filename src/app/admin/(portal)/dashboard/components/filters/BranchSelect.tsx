// src/app/admin/(portal)/dashboard/components/filters/BranchSelect.tsx
'use client';

import React from 'react';
import { Building2, Lock } from 'lucide-react';
import { BranchOptions } from '@/components/ui/BranchOptions';
import { useBranches } from '@/hooks/useBranches';
import { ServiceTypeCode } from '@/types';

interface BranchSelectProps {
  value: string;
  onChange: (branch: string) => void;
  /** Admin Cabang: dropdown terkunci pada cabangnya sendiri */
  lockedBranch: string | null;
  /** Lingkup aktif: hanya cabang lingkup ini yang ditawarkan ('' = semua, per grup) */
  scope: ServiceTypeCode | '';
}

/** Pemilih cabang kerja pada lingkup aktif ('' = seluruh cabang lingkup tersebut). */
export const BranchSelect: React.FC<BranchSelectProps> = ({
  value,
  onChange,
  lockedBranch,
  scope,
}) => {
  // Master cabang dari tabel `branches` (fallback ke konstanta bila belum dimigrasi)
  const { branchesByScope } = useBranches();
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
        title={isLocked ? `Akses Anda terkunci pada cabang ${lockedBranch}` : 'Pilih cabang'}
      >
        {isLocked ? (
          <option value={lockedBranch ?? ''}>{lockedBranch}</option>
        ) : (
          <>
            <option value="">{scope ? `Semua cabang ${scope}` : 'Semua cabang'}</option>
            <BranchOptions branchesByScope={branchesByScope} scope={scope} />
          </>
        )}
      </select>
    </div>
  );
};
