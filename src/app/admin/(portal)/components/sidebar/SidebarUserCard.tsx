// src/app/admin/(portal)/components/sidebar/SidebarUserCard.tsx
'use client';

import React from 'react';
import { User } from 'lucide-react';
import { UserProfile } from '@/types';

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
  if (profile.role === 'branch_admin') return `Admin cabang ${profile.branch || '-'}`;
  return 'Peran belum ditetapkan';
}

/** Identitas pengguna: avatar inisial, nama, dan peran */
export const SidebarUserCard: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const displayName = profile.full_name || profile.email;

  return (
    <div className="sb-user">
      <div className="sb-avatar" aria-hidden="true">
        {getInitials(profile) || <User size={15} />}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="sb-user-name" title={displayName}>
          {displayName}
        </div>
        <div className="sb-user-role">{getRoleLabel(profile)}</div>
      </div>
    </div>
  );
};
