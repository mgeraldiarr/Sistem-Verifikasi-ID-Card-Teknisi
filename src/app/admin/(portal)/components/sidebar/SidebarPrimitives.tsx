// src/app/admin/(portal)/components/sidebar/SidebarPrimitives.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { C } from './sidebar-theme';

/** Label seksi kecil (uppercase, muted) */
export function SectionLabel({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: C.creamMuted,
        textTransform: 'uppercase',
      }}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}

/** Tautan navigasi utama (Dashboard, Kelola Akun, dll.) */
export function NavLink({
  href,
  label,
  icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.55rem',
        padding: '7px 10px',
        borderRadius: '7px',
        backgroundColor: isActive ? C.accentSoft : 'transparent',
        border: isActive ? `1px solid ${C.accentBorder}` : '1px solid transparent',
        color: isActive ? C.white : C.creamSoft,
        fontSize: '0.775rem',
        fontWeight: isActive ? 700 : 500,
        transition: 'all 0.15s ease',
        textDecoration: 'none',
      }}
    >
      <span style={{ color: isActive ? '#FF6B5E' : C.accent, display: 'flex', alignItems: 'center' }}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

/** Tombol cabang di daftar navigasi DSC */
export function BranchButton({
  label,
  isSelected,
  onClick,
  count,
  icon,
  showCheck,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  count?: number;
  icon?: React.ReactNode;
  showCheck?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'left',
        width: '100%',
        backgroundColor: isSelected ? C.accent : 'transparent',
        color: isSelected ? C.white : C.creamSoft,
        border: isSelected ? `1px solid ${C.accent}` : '1px solid transparent',
        padding: '5px 8px',
        borderRadius: '6px',
        fontSize: '0.7rem',
        fontWeight: isSelected ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
        {icon}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>

      {showCheck && isSelected && <Check size={12} color={C.white} />}

      {typeof count === 'number' && count > 0 && (
        <span
          style={{
            fontSize: '0.6rem',
            padding: '1px 6px',
            borderRadius: '8px',
            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : C.creamGhost,
            color: isSelected ? C.white : C.creamMuted,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
