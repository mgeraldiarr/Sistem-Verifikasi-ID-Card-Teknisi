// src/app/admin/dashboard/components/DashboardHeader.tsx
'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLogout }) => {
  return (
    <header
      style={{
        backgroundColor: 'var(--bg-dark)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-dark)',
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
    </header>
  );
};
