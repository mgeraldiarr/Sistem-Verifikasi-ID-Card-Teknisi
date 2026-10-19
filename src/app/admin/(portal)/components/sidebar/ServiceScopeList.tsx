// src/app/admin/(portal)/components/sidebar/ServiceScopeList.tsx
'use client';

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SERVICE_SCOPES } from '@/constants/service-center';
import { DscBranchList } from './DscBranchList';

interface ServiceScopeListProps {
  branches: string[];
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  branchCounts: Record<string, number>;
  isLocked: boolean;
  isDscExpanded: boolean;
  onToggleDsc: () => void;
}

/** 3 lingkup layanan; hanya DSC yang aktif dan dapat dibuka ke daftar cabang. */
export const ServiceScopeList: React.FC<ServiceScopeListProps> = ({
  branches,
  selectedBranch,
  onSelectBranch,
  branchCounts,
  isLocked,
  isDscExpanded,
  onToggleDsc,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    {SERVICE_SCOPES.map((scope) => {
      const isDsc = scope.code === 'DSC';
      const expanded = isDsc && isDscExpanded;

      return (
        <div key={scope.code}>
          <button
            type="button"
            className="sb-scope"
            onClick={isDsc ? onToggleDsc : undefined}
            disabled={!scope.isActive}
            aria-expanded={isDsc ? expanded : undefined}
          >
            <span className="sb-scope-code">{scope.label}</span>
            <span className="sb-scope-name">{scope.fullName}</span>
            <span className="sb-scope-meta">
              {scope.isActive ? (
                <>
                  <span className="tnum">{isLocked ? 1 : branches.length}</span>
                  {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </>
              ) : (
                'Segera'
              )}
            </span>
          </button>

          {expanded && (
            <DscBranchList
              branches={branches}
              selectedBranch={selectedBranch}
              onSelectBranch={onSelectBranch}
              branchCounts={branchCounts}
              isLocked={isLocked}
            />
          )}
        </div>
      );
    })}
  </div>
);
