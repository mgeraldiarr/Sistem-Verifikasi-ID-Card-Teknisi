// src/components/PageHeading.tsx
'use client';

import React from 'react';

interface PageHeadingProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  /** Tombol aksi utama di sisi kanan judul */
  actions?: React.ReactNode;
}

/**
 * Judul halaman di dalam area konten portal admin.
 * Sengaja tanpa chrome navigasi — sidebar portal sudah menanganinya.
 */
export const PageHeading: React.FC<PageHeadingProps> = ({
  title,
  subtitle,
  icon,
  actions,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {icon && (
          <span
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(218,41,28,0.1)',
              color: 'var(--accent-red)',
              flexShrink: 0,
            }}
          >
            {icon}
          </span>
        )}
        <div style={{ lineHeight: 1.35 }}>
          <h1
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              margin: 0,
              color: 'var(--text-primary)',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '0.775rem',
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions}
    </div>
  );
};
