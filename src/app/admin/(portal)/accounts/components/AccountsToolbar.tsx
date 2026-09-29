// src/app/admin/(portal)/accounts/components/AccountsToolbar.tsx
'use client';

import React from 'react';
import { Plus, Search } from 'lucide-react';
import { inputStyle } from '@/components/ui/admin-styles';
import { UserRole } from '@/types';
import { controlStyle, ROLE_META } from './role-meta';

interface AccountsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  onAddAccount: () => void;
}

/** Pencarian, filter peran, dan tombol tambah akun. */
export const AccountsToolbar: React.FC<AccountsToolbarProps> = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onAddAccount,
}) => (
  <div
    className="modena-card"
    style={{
      padding: '0.9rem 1rem',
      marginBottom: '1.25rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        flex: 1,
        minWidth: '260px',
      }}
    >
      <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
        <input
          id="account-search"
          name="account_search"
          type="text"
          aria-label="Cari akun"
          placeholder="Cari nama, email, ID admin, atau cabang..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ ...inputStyle, paddingLeft: '32px' }}
        />
      </div>

      <select
        id="account-role-filter"
        name="account_role_filter"
        aria-label="Filter peran"
        value={roleFilter}
        onChange={(e) => onRoleFilterChange(e.target.value)}
        style={{ ...controlStyle, padding: '0.6rem 0.7rem', minWidth: '150px' }}
      >
        <option value="">Semua Peran</option>
        {(Object.keys(ROLE_META) as UserRole[]).map((role) => (
          <option key={role} value={role}>
            {ROLE_META[role].label}
          </option>
        ))}
      </select>
    </div>

    <button
      type="button"
      onClick={onAddAccount}
      className="modena-btn-primary"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
    >
      <Plus size={16} /> Tambah Akun Admin
    </button>
  </div>
);
