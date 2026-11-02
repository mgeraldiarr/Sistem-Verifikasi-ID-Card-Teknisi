// src/app/admin/(portal)/components/sidebar/SidebarAdminMenu.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, LayoutDashboard, SlidersHorizontal, UserCog } from 'lucide-react';

const ADMIN_MENU = [
  { href: '/admin/dashboard', label: 'Daftar teknisi', icon: <LayoutDashboard size={16} /> },
  { href: '/admin/accounts', label: 'Kelola akun', icon: <UserCog size={16} /> },
  { href: '/admin/branches', label: 'Kelola cabang', icon: <Building2 size={16} /> },
  { href: '/admin/kpi-settings', label: 'Bobot KPI', icon: <SlidersHorizontal size={16} /> },
];

/** Menu administrasi sistem — hanya ditampilkan untuk Super Admin */
export const SidebarAdminMenu: React.FC<{ pathname: string }> = ({ pathname }) => (
  <nav aria-label="Menu Super Admin" className="sb-nav">
    {ADMIN_MENU.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className="sb-link"
        aria-current={pathname === item.href ? 'page' : undefined}
      >
        {item.icon}
        {item.label}
      </Link>
    ))}
  </nav>
);
