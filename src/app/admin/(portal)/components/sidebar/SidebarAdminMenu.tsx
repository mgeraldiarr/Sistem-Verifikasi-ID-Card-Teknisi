// src/app/admin/(portal)/components/sidebar/SidebarAdminMenu.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, LayoutDashboard, SlidersHorizontal, Sparkles, UserCog } from 'lucide-react';

const SUPER_ADMIN_MENU = [
  { href: '/admin/dashboard', label: 'Daftar teknisi', icon: <LayoutDashboard size={16} /> },
  { href: '/admin/grooming', label: 'Monitoring grooming', icon: <Sparkles size={16} /> },
  { href: '/admin/accounts', label: 'Kelola akun', icon: <UserCog size={16} /> },
  { href: '/admin/branches', label: 'Kelola cabang', icon: <Building2 size={16} /> },
  { href: '/admin/kpi-settings', label: 'Bobot KPI', icon: <SlidersHorizontal size={16} /> },
];

const BRANCH_ADMIN_MENU = [
  { href: '/admin/dashboard', label: 'Daftar teknisi', icon: <LayoutDashboard size={16} /> },
  { href: '/admin/grooming', label: 'Monitoring grooming', icon: <Sparkles size={16} /> },
];

interface SidebarAdminMenuProps {
  pathname: string;
  isSuperAdmin?: boolean;
}

/** Menu navigasi portal — menampilkan menu sistem lengkap untuk Super Admin atau menu operasional untuk Admin Cabang */
export const SidebarAdminMenu: React.FC<SidebarAdminMenuProps> = ({
  pathname,
  isSuperAdmin = true,
}) => {
  const menuItems = isSuperAdmin ? SUPER_ADMIN_MENU : BRANCH_ADMIN_MENU;

  return (
    <nav aria-label="Menu Admin" className="sb-nav">
      {menuItems.map((item) => (
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
};
