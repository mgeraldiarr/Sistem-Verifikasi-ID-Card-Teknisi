// src/app/admin/(portal)/components/sidebar/ServiceScopeList.tsx
'use client';

import React from 'react';
import { Building2, ChevronDown, ChevronRight, Shield, Wrench } from 'lucide-react';
import { SERVICE_SCOPES, ServiceCenterType, ServiceScopeItem } from '@/constants/service-center';
import { C } from './sidebar-theme';
import { DscBranchList } from './DscBranchList';

const SCOPE_ICONS: Record<ServiceCenterType, React.ReactNode> = {
  DSC: <Building2 size={14} />,
  ASC: <Shield size={14} />,
  SL: <Wrench size={14} />,
};

interface ServiceScopeListProps {
  branches: string[];
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  branchCounts: Record<string, number>;
  isLocked: boolean;
  isDscExpanded: boolean;
  onToggleDsc: () => void;
}

/** Kartu 3 lingkup layanan; hanya DSC yang aktif dan dapat dibuka ke daftar cabang. */
export const ServiceScopeList: React.FC<ServiceScopeListProps> = ({
  branches,
  selectedBranch,
  onSelectBranch,
  branchCounts,
  isLocked,
  isDscExpanded,
  onToggleDsc,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {SERVICE_SCOPES.map((scope) => {
      const isDsc = scope.code === 'DSC';
      return (
        <div key={scope.code}>
          <ScopeCard
            scope={scope}
            isDsc={isDsc}
            isExpanded={isDsc && isDscExpanded}
            branchCount={isLocked ? 1 : branches.length}
            onClick={isDsc ? onToggleDsc : undefined}
          />
          {isDsc && isDscExpanded && (
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

interface ScopeCardProps {
  scope: ServiceScopeItem;
  isDsc: boolean;
  isExpanded: boolean;
  branchCount: number;
  onClick?: () => void;
}

function ScopeCard({ scope, isDsc, isExpanded, branchCount, onClick }: ScopeCardProps) {
  const restingBackground = isExpanded ? C.bgHover : C.bgElevated;
  const restingBorder = isExpanded ? C.accentBorder : C.creamFaint;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isDsc ? isExpanded : undefined}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 0.7rem',
        borderRadius: '8px',
        backgroundColor: isDsc ? restingBackground : C.creamGhost,
        cursor: isDsc ? 'pointer' : 'default',
        opacity: scope.isActive ? 1 : 0.5,
        border: `1px solid ${isDsc ? restingBorder : C.creamGhost}`,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!isDsc) return;
        e.currentTarget.style.backgroundColor = C.bgHover;
        e.currentTarget.style.borderColor = C.creamSoft;
      }}
      onMouseLeave={(e) => {
        if (!isDsc) return;
        e.currentTarget.style.backgroundColor = restingBackground;
        e.currentTarget.style.borderColor = restingBorder;
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDsc ? C.accent : C.creamGhost,
            color: isDsc ? C.white : C.creamMuted,
            flexShrink: 0,
          }}
        >
          {SCOPE_ICONS[scope.code]}
        </div>

        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              fontSize: '0.775rem',
              fontWeight: 700,
              color: scope.isActive ? C.white : C.creamMuted,
              lineHeight: 1.2,
            }}
          >
            {scope.label}
          </div>
          <div style={{ fontSize: '0.625rem', color: C.creamMuted, marginTop: '1px' }}>
            {scope.fullName}
          </div>
        </div>
      </div>

      {scope.badge ? (
        <span
          style={{
            fontSize: '0.575rem',
            fontWeight: 700,
            backgroundColor: C.creamGhost,
            color: C.creamMuted,
            padding: '2px 7px',
            borderRadius: '10px',
            border: `1px solid ${C.creamGhost}`,
            letterSpacing: '0.02em',
          }}
        >
          {scope.badge}
        </span>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: C.creamSoft }}>
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 800,
              backgroundColor: C.accent,
              color: C.white,
              padding: '0px 6px',
              borderRadius: '10px',
              lineHeight: '18px',
            }}
          >
            {branchCount}
          </span>
          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>
      )}
    </button>
  );
}
