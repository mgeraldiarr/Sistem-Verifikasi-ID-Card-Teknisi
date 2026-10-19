// src/app/admin/(portal)/components/sidebar/DscBranchList.tsx
'use client';

import React, { useState } from 'react';
import { Lock, Search } from 'lucide-react';
import { BranchButton } from './SidebarPrimitives';

interface DscBranchListProps {
  branches: string[];
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  branchCounts: Record<string, number>;
  /** true untuk Admin Cabang: tanpa pencarian & tanpa pilihan "Semua cabang" */
  isLocked: boolean;
}

/** Submenu cabang DSC: pencarian, "Semua cabang", dan daftar cabang */
export const DscBranchList: React.FC<DscBranchListProps> = ({
  branches,
  selectedBranch,
  onSelectBranch,
  branchCounts,
  isLocked,
}) => {
  const [search, setSearch] = useState('');
  const filtered = branches.filter((branch) =>
    branch.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sb-branches">
      {isLocked ? (
        <div className="sb-note">
          <Lock size={12} />
          <span>Akses terkunci pada cabang Anda</span>
        </div>
      ) : (
        <>
          <div className="sb-search">
            <Search size={13} />
            <input
              id="sidebar-branch-search"
              name="sidebar_branch_search"
              type="search"
              aria-label="Cari cabang"
              placeholder="Cari cabang"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <BranchButton
            label="Semua cabang"
            isSelected={selectedBranch === ''}
            onClick={() => onSelectBranch('')}
          />
        </>
      )}

      <div className="sb-branch-list">
        {filtered.length === 0 ? (
          <div className="sb-empty">Tidak ada cabang dengan nama itu</div>
        ) : (
          filtered.map((branch) => (
            <BranchButton
              key={branch}
              label={branch}
              isSelected={selectedBranch === branch}
              onClick={() => onSelectBranch(branch)}
              count={branchCounts[branch]}
            />
          ))
        )}
      </div>
    </div>
  );
};
