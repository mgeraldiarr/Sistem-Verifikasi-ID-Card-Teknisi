// src/app/admin/(portal)/components/sidebar/SidebarUserCard.tsx
'use client';

import React from 'react';
import { Building2, Crown, User } from 'lucide-react';
import { UserProfile } from '@/types';
import { C } from './sidebar-theme';

/** Inisial nama (maks. 2 huruf) untuk avatar */
function getInitials(profile: UserProfile): string {
  return (profile.full_name || profile.email || '?')
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getRoleLabel(profile: UserProfile): string {
  if (profile.role === 'super_admin') return 'Super Admin';
  if (profile.role === 'branch_admin') return `Admin — ${profile.branch || '—'}`;
  return 'Peran Belum Ditetapkan';
}

/** Identitas pengguna: avatar ringkas + badge peran */
export const SidebarUserCard: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const isSuperAdmin = profile.role === 'super_admin';
  const tone = {
    background: isSuperAdmin ? C.accentSoft : C.creamGhost,
    border: isSuperAdmin ? C.accentBorder : C.creamFaint,
    color: isSuperAdmin ? '#FF6B5E' : C.creamSoft,
  };
  const displayName = profile.full_name || profile.email;

  return (
    <div
      style={{
        padding: '0.875rem 1.25rem',
        borderBottom: `1px solid ${C.divider}`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        flexShrink: 0,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          backgroundColor: tone.background,
          border: `1.5px solid ${tone.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: tone.color,
          fontSize: '0.7rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
        }}
      >
        {getInitials(profile) || <User size={15} />}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          title={displayName}
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: C.white,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}
        >
          {displayName}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '3px',
            padding: '1px 7px 1px 5px',
            borderRadius: '999px',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            backgroundColor: tone.background,
            color: tone.color,
            border: `1px solid ${tone.border}`,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {isSuperAdmin ? <Crown size={9} /> : <Building2 size={9} />}
          {getRoleLabel(profile)}
        </div>
      </div>
    </div>
  );
};
