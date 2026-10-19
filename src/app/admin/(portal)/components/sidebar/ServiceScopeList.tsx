// src/app/admin/(portal)/components/sidebar/ServiceScopeList.tsx
'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SERVICE_SCOPES } from '@/constants/service-center';
import { ServiceTypeCode } from '@/types';
import { ScopeBranchList } from './ScopeBranchList';

interface ServiceScopeListProps {
  branchesByScope: Record<ServiceTypeCode, string[]>;
  /** Lingkup aktif ('' = semua lingkup) */
  selectedScope: ServiceTypeCode | '';
  selectedBranch: string;
  /** Tampilkan teknisi seluruh lingkup */
  onSelectAll: () => void;
  /** Tampilkan teknisi satu lingkup & buka daftar cabangnya */
  onSelectScope: (scope: ServiceTypeCode) => void;
  onSelectBranch: (branch: string) => void;
  branchCounts: Record<string, number>;
  /** Jumlah teknisi per lingkup */
  scopeCounts: Partial<Record<ServiceTypeCode, number>>;
  totalTechnicians: number;
  isLocked: boolean;
  /** Lingkup yang daftar cabangnya sedang terbuka (null = semua tertutup) */
  expandedScope: ServiceTypeCode | null;
}

/**
 * Navigasi teknisi per lingkup layanan (DSC, ASC, SL).
 * Klik lingkup = semua teknisi lingkup itu; klik cabang di dalamnya = teknisi cabang itu.
 */
export const ServiceScopeList: React.FC<ServiceScopeListProps> = ({
  branchesByScope,
  selectedScope,
  selectedBranch,
  onSelectAll,
  onSelectScope,
  onSelectBranch,
  branchCounts,
  scopeCounts,
  totalTechnicians,
  isLocked,
  expandedScope,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    {!isLocked && (
      <button
        type="button"
        className="sb-scope"
        onClick={onSelectAll}
        aria-current={selectedScope === '' && !selectedBranch ? 'true' : undefined}
        data-active={(selectedScope === '' && !selectedBranch) || undefined}
      >
        <span className="sb-scope-code">Semua</span>
        <span className="sb-scope-name">Semua lingkup layanan</span>
        <span className="sb-scope-meta">
          <span className="tnum">{totalTechnicians}</span>
        </span>
      </button>
    )}

    {SERVICE_SCOPES.map((scope) => {
      const branches = branchesByScope[scope.code] ?? [];
      const expanded = expandedScope === scope.code;
      const isActive = selectedScope === scope.code;

      // Admin Cabang hanya melihat lingkup cabangnya sendiri
      if (isLocked && branches.length === 0) return null;

      return (
        <div key={scope.code}>
          <button
            type="button"
            className="sb-scope"
            onClick={() => onSelectScope(scope.code)}
            aria-expanded={expanded}
            aria-current={isActive && !selectedBranch ? 'true' : undefined}
            data-active={isActive || undefined}
            title={`Tampilkan semua teknisi ${scope.code}`}
          >
            <span className="sb-scope-code">{scope.label}</span>
            <span className="sb-scope-name">{scope.fullName}</span>
            <span className="sb-scope-meta">
              <span className="tnum" title="Jumlah teknisi">
                {scopeCounts[scope.code] ?? 0}
              </span>
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </button>

          {expanded && (
            <ScopeBranchList
              scopeCode={scope.code}
              branches={branches}
              selectedBranch={isActive ? selectedBranch : null}
              onSelectAllInScope={() => onSelectScope(scope.code)}
              onSelectBranch={onSelectBranch}
              branchCounts={branchCounts}
              scopeCount={scopeCounts[scope.code] ?? 0}
              isLocked={isLocked}
            />
          )}
        </div>
      );
    })}
  </div>
);
