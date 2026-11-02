// src/app/admin/(portal)/components/PortalSkeletonShell.tsx
'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { TechnicianTableSkeleton } from '../dashboard/components/technician-table/TechnicianTableSkeleton';

/**
 * Kerangka skeleton penuh untuk portal admin (sidebar + konten utama).
 * Menggantikan seluruh loading spinner bulat sehingga layout tidak pernah bergeser (zero layout shift).
 */
export function PortalSkeletonShell() {
  return (
    <div className="portal-shell">
      {/* Topbar skeleton di mobile */}
      <header className="topbar no-print">
        <img src="/modena-logo-white.png" alt="MODENA" />
        <span className="topbar-context" style={{ width: '120px' }}>
          <Skeleton
            width="100px"
            height="14px"
            style={{ background: 'var(--surface-dark-3)' }}
          />
        </span>
      </header>

      {/* Sidebar skeleton di desktop */}
      <aside className="sidebar" aria-label="Memuat menu portal">
        <div className="sb-brand">
          <img src="/modena-logo-white.png" alt="MODENA" />
          <span className="sb-brand-name">Portal Teknisi</span>
        </div>

        {/* User Card Skeleton */}
        <div className="sb-user">
          <Skeleton
            width="34px"
            height="34px"
            radius="8px"
            style={{ background: 'var(--surface-dark-3)', flexShrink: 0 }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <Skeleton
              width="110px"
              height="14px"
              style={{ background: 'var(--surface-dark-3)', marginBottom: '4px' }}
            />
            <Skeleton
              width="80px"
              height="11px"
              style={{ background: 'var(--surface-dark-3)' }}
            />
          </div>
        </div>

        {/* Nav Links Skeleton */}
        <div className="sb-nav">
          <div style={{ padding: '8px 12px' }}>
            <Skeleton
              width="100px"
              height="16px"
              style={{ background: 'var(--surface-dark-3)' }}
            />
          </div>
          <div style={{ padding: '8px 12px' }}>
            <Skeleton
              width="90px"
              height="16px"
              style={{ background: 'var(--surface-dark-3)' }}
            />
          </div>
          <div style={{ padding: '8px 12px' }}>
            <Skeleton
              width="110px"
              height="16px"
              style={{ background: 'var(--surface-dark-3)' }}
            />
          </div>
          <div style={{ padding: '8px 12px' }}>
            <Skeleton
              width="85px"
              height="16px"
              style={{ background: 'var(--surface-dark-3)' }}
            />
          </div>
        </div>

        {/* Lingkup Layanan Skeleton */}
        <div className="sb-scroll" style={{ padding: '12px' }}>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton
              width="90px"
              height="12px"
              style={{ background: 'var(--surface-dark-3)' }}
            />
            <Skeleton
              width="50px"
              height="12px"
              style={{ background: 'var(--surface-dark-3)' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton
              width="100%"
              height="36px"
              radius="6px"
              style={{ background: 'var(--surface-dark-3)' }}
            />
            <Skeleton
              width="100%"
              height="36px"
              radius="6px"
              style={{ background: 'var(--surface-dark-3)' }}
            />
            <Skeleton
              width="100%"
              height="36px"
              radius="6px"
              style={{ background: 'var(--surface-dark-3)' }}
            />
          </div>
        </div>
      </aside>

      {/* Konten Utama Skeleton */}
      <main className="portal-main">
        <div className="portal-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Page Heading Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Skeleton width="180px" height="26px" radius="6px" />
            <Skeleton width="280px" height="14px" />
          </div>

          {/* Stats / Distribution Card Skeleton */}
          <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton width="140px" height="24px" radius="4px" />
              <Skeleton width="100px" height="20px" radius="4px" />
            </div>
            <Skeleton width="100%" height="8px" radius="999px" />
            <div style={{ display: 'flex', gap: '16px' }}>
              <Skeleton width="90px" height="16px" />
              <Skeleton width="110px" height="16px" />
              <Skeleton width="90px" height="16px" />
            </div>
          </div>

          {/* Toolbar & Filter Skeleton */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Skeleton width="260px" height="38px" radius="8px" />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Skeleton width="110px" height="38px" radius="8px" />
              <Skeleton width="120px" height="38px" radius="8px" />
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="table-panel">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Teknisi</th>
                  <th scope="col">Cabang</th>
                  <th scope="col">Skor KPI</th>
                  <th scope="col">ID card</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="col-actions">
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <TechnicianTableSkeleton rows={5} />
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

