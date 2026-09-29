// src/app/admin/(portal)/components/sidebar/DscBranchList.tsx
'use client';

import React, { useState } from 'react';
import { Lock, MapPin, Search } from 'lucide-react';
import { C } from './sidebar-theme';
import { BranchButton } from './SidebarPrimitives';

interface DscBranchListProps {
  branches: string[];
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  branchCounts: Record<string, number>;
  /** true untuk Admin Cabang: tanpa pencarian & tanpa pilihan "Semua Cabang" */
  isLocked: boolean;
}

/** Submenu cabang DSC: pencarian, "Semua Cabang", dan daftar cabang */
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
    <div
      style={{
        marginLeft: '14px',
        marginTop: '6px',
        paddingLeft: '12px',
        borderLeft: `2px solid ${C.creamFaint}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      {isLocked ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 8px',
            marginBottom: '4px',
            borderRadius: '6px',
            backgroundColor: C.accentSoft,
            border: `1px solid ${C.accentBorder}`,
            color: 'rgba(236, 232, 218, 0.75)',
            fontSize: '0.65rem',
            lineHeight: 1.4,
          }}
        >
          <Lock size={11} color={C.accent} style={{ flexShrink: 0 }} />
          <span>Akses terkunci pada cabang Anda</span>
        </div>
      ) : (
        <>
          <div style={{ position: 'relative', marginBottom: '4px' }}>
            <Search
              size={12}
              color={C.creamMuted}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <input
              id="sidebar-branch-search"
              name="sidebar_branch_search"
              type="text"
              aria-label="Cari cabang"
              placeholder="Cari cabang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                fontSize: '0.7rem',
                padding: '6px 8px 6px 26px',
                borderRadius: '6px',
                border: `1px solid ${C.creamFaint}`,
                backgroundColor: C.creamGhost,
                color: C.cream,
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = C.accent;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = C.creamFaint;
              }}
            />
          </div>

          <BranchButton
            label="Semua Cabang DSC"
            isSelected={selectedBranch === ''}
            onClick={() => onSelectBranch('')}
            showCheck
          />
        </>
      )}

      <div
        style={{
          maxHeight: '320px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
          paddingRight: '2px',
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              fontSize: '0.7rem',
              color: C.creamMuted,
              padding: '0.75rem 0.5rem',
              textAlign: 'center',
            }}
          >
            Cabang tidak ditemukan
          </div>
        ) : (
          filtered.map((branch) => {
            const isSelected = selectedBranch === branch;
            return (
              <BranchButton
                key={branch}
                label={branch}
                isSelected={isSelected}
                onClick={() => onSelectBranch(branch)}
                count={branchCounts[branch]}
                icon={
                  <MapPin
                    size={11}
                    color={isSelected ? C.white : 'rgba(236, 232, 218, 0.22)'}
                    style={{ flexShrink: 0 }}
                  />
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
};
