// src/app/admin/(portal)/components/sidebar/SidebarAdminMenu.tsx
'use client';

import React from 'react';
import { Building2, LayoutDashboard, SlidersHorizontal, UserCog } from 'lucide-react';
import { C } from './sidebar-theme';
import { NavLink, SectionLabel } from './SidebarPrimitives';

const ADMIN_MENU = [
  { href: '/admin/dashboard', label: 'Dashboard Teknisi', icon: <LayoutDashboard size={15} /> },
  { href: '/admin/accounts', label: 'Kelola Akun', icon: <UserCog size={15} /> },
  { href: '/admin/branches', label: 'Kelola Cabang', icon: <Building2 size={15} /> },
  { href: '/admin/kpi-settings', label: 'Bobot KPI', icon: <SlidersHorizontal size={15} /> },
];

/** Menu administrasi sistem — hanya ditampilkan untuk Super Admin */
export const SidebarAdminMenu: React.FC<{ pathname: string }> = ({ pathname }) => (
  <nav
    aria-label="Menu Super Admin"
    style={{
      padding: '0.75rem 0.875rem 0.625rem',
      borderBottom: `1px solid ${C.divider}`,
      flexShrink: 0,
    }}
  >
    <SectionLabel text="Menu" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '0.4rem' }}>
      {ADMIN_MENU.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          isActive={pathname === item.href}
        />
      ))}
    </div>
  </nav>
);
