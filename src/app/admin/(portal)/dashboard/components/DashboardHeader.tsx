// src/app/admin/dashboard/components/DashboardHeader.tsx
'use client';

import React from 'react';
import { LogOut, Crown, Building2 } from 'lucide-react';
import { UserProfile } from '@/types';

interface DashboardHeaderProps {
  onLogout: () => void;
  /** Profil peran pengguna yang sedang login (Super Admin / Admin Cabang) */
  profile?: UserProfile | null;
}

/**
 * Badge identitas peran: 👑 Super Admin (Nasional) atau 🏢 Admin Cabang ({Cabang}).
 */
export const RoleBadge: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const isSuperAdmin = profile.role === 'super_admin';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 9px',
        borderRadius: '999px',
        fontSize: '0.65rem',
        fontWeight: 800,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
        backgroundColor: isSuperAdmin ? 'rgba(218,41,28,0.14)' : 'rgba(236,232,218,0.12)',
        color: isSuperAdmin ? '#DA291C' : '#ECE8DA',
        border: `1px solid ${isSuperAdmin ? 'rgba(218,41,28,0.35)' : 'rgba(236,232,218,0.18)'}`,
      }}
    >
      {isSuperAdmin ? <Crown size={11} /> : <Building2 size={11} />}
      {isSuperAdmin
        ? 'Super Admin — Nasional'
        : `Admin Cabang — ${profile.branch || 'Belum Ditetapkan'}`}
    </span>
  );
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout, profile }) => {
  return (
    <header
      style={{
        backgroundColor: 'var(--bg-dark)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-dark)',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <h1
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: 0,
        }}
      >
        <img
          src="/modena-logo-white.png"
          alt="MODENA"
          style={{
            height: '1.8rem',
            width: 'auto',
            objectFit: 'contain',
          }}
        />
        <span
          style={{
            color: 'white',
            fontWeight: 400,
            opacity: 0.6,
            fontSize: '0.875rem',
            letterSpacing: '0.05em',
          }}
        >
          | TECHNICIAN PORTAL
        </span>
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Identitas Pengguna yang Sedang Login */}
        {profile && (
          <div style={{ textAlign: 'right', lineHeight: 1.35 }}>
            <div style={{ color: 'white', fontSize: '0.825rem', fontWeight: 700 }}>
              {profile.full_name || profile.email}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: '0.7rem',
                marginBottom: '4px',
              }}
            >
              {profile.email}
            </div>
            <RoleBadge profile={profile} />
          </div>
        )}

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
};
