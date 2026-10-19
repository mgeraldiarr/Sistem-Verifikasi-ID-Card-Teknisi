// src/app/admin/(portal)/accounts/components/AccountsToolbar.tsx
'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { BranchOptions } from '@/components/ui/BranchOptions';
import { ServiceTypeCode, UserRole } from '@/types';
import { ROLE_META } from './role-meta';

interface AccountsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  /** Lingkup aktif dari tab; membatasi pilihan cabang */
  scope: ServiceTypeCode | '';
  branchesByScope: Record<ServiceTypeCode, string[]>;
  branchFilter: string;
  onBranchFilterChange: (value: string) => void;
}

const FILTER_SELECT_STYLE: React.CSSProperties = {
  width: 'auto',
  minWidth: '170px',
  flex: '1 1 170px',
  maxWidth: '240px',
};

/** Pencarian, filter peran, dan filter cabang (sesuai lingkup terpilih). */
export const AccountsToolbar: React.FC<AccountsToolbarProps> = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  scope,
  branchesByScope,
  branchFilter,
  onBranchFilterChange,
}) => (
  <div className="toolbar" role="search">
    <div className="input-wrap grow">
      <Search size={16} className="input-icon" />
      <input
        id="account-search"
        name="account_search"
        type="search"
        className="input"
        aria-label="Cari akun"
        placeholder="Cari nama, email, ID admin, atau cabang"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>

    <select
      id="account-role-filter"
      name="account_role_filter"
      className="select"
      aria-label="Filter peran"
      value={roleFilter}
      onChange={(e) => onRoleFilterChange(e.target.value)}
      style={FILTER_SELECT_STYLE}
    >
      <option value="">Semua peran</option>
      {(Object.keys(ROLE_META) as UserRole[]).map((role) => (
        <option key={role} value={role}>
          {ROLE_META[role].label}
        </option>
      ))}
    </select>

    <select
      id="account-branch-filter"
      name="account_branch_filter"
      className="select"
      aria-label="Filter cabang"
      value={branchFilter}
      onChange={(e) => onBranchFilterChange(e.target.value)}
      style={FILTER_SELECT_STYLE}
    >
      <option value="">{scope ? `Semua cabang ${scope}` : 'Semua cabang'}</option>
      <BranchOptions branchesByScope={branchesByScope} scope={scope} />
    </select>
  </div>
);
