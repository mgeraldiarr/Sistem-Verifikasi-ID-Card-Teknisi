'use client';

import React from 'react';

interface PageHeadingProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Tombol aksi utama di sisi kanan judul */
  actions?: React.ReactNode;
}

/**
 * Judul halaman di dalam area konten portal admin.
 * Sengaja tanpa chrome navigasi — sidebar portal sudah menanganinya.
 */
export const PageHeading: React.FC<PageHeadingProps> = ({ title, subtitle, actions }) => (
  <div className="page-head">
    <div style={{ minWidth: 0 }}>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-sub">{subtitle}</p>}
    </div>
    {actions && <div className="page-actions">{actions}</div>}
  </div>
);
