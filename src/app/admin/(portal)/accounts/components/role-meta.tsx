import React from 'react';
import { Building2, Crown, Wrench } from 'lucide-react';
import { UserRole } from '@/types';

export const ROLE_META: Record<UserRole, { label: string; icon: React.ReactNode }> = {
  super_admin: { label: 'Super Admin', icon: <Crown size={13} /> },
  branch_admin: { label: 'Admin Cabang', icon: <Building2 size={13} /> },
  technician: { label: 'Teknisi', icon: <Wrench size={13} /> },
};
