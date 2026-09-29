// src/app/admin/(portal)/accounts/components/RoleSummaryCards.tsx
'use client';

import React from 'react';
import { StatCard, statGridStyle } from '@/components/ui/StatCard';
import { UserRole } from '@/types';
import { ROLE_META } from './role-meta';

/** Jumlah akun per peran. */
export const RoleSummaryCards: React.FC<{ counts: Partial<Record<UserRole, number>> }> = ({
  counts,
}) => (
  <div style={statGridStyle}>
    {(Object.keys(ROLE_META) as UserRole[]).map((role) => (
      <StatCard
        key={role}
        icon={ROLE_META[role].icon}
        value={counts[role] ?? 0}
        label={ROLE_META[role].label}
        iconBackground={ROLE_META[role].bg}
        iconColor={ROLE_META[role].color}
      />
    ))}
  </div>
);
