'use client';

import React from 'react';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { UserRole } from '@/types';
import { ROLE_META } from './role-meta';

/** Jumlah akun per peran. */
export const RoleSummaryCards: React.FC<{ counts: Partial<Record<UserRole, number>> }> = ({
  counts,
}) => (
  <StatRow>
    {(Object.keys(ROLE_META) as UserRole[]).map((role) => (
      <StatCard
        key={role}
        icon={ROLE_META[role].icon}
        value={counts[role] ?? 0}
        label={ROLE_META[role].label}
      />
    ))}
  </StatRow>
);
