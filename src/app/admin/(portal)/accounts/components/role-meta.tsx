// src/app/admin/(portal)/accounts/components/role-meta.tsx
import React from 'react';
import { Building2, Crown, Wrench } from 'lucide-react';
import { UserRole } from '@/types';

export const ROLE_META: Record<
  UserRole,
  { label: string; bg: string; color: string; icon: React.ReactNode }
> = {
  super_admin: {
    label: 'Super Admin',
    bg: 'rgba(218,41,28,0.12)',
    color: '#B51F15',
    icon: <Crown size={12} />,
  },
  branch_admin: {
    label: 'Admin Cabang',
    bg: 'rgba(59,130,246,0.12)',
    color: '#1D4ED8',
    icon: <Building2 size={12} />,
  },
  technician: {
    label: 'Teknisi',
    bg: 'rgba(16,185,129,0.12)',
    color: '#047857',
    icon: <Wrench size={12} />,
  },
};

/** Dropdown kecil di dalam baris tabel */
export const controlStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  fontSize: '0.775rem',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  cursor: 'pointer',
};
