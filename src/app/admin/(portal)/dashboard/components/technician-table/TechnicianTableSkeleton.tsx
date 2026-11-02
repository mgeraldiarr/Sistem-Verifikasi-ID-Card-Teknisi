// src/app/admin/(portal)/dashboard/components/technician-table/TechnicianTableSkeleton.tsx
'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './TechnicianTable.module.css';

interface TechnicianTableSkeletonProps {
  rows?: number;
}

export const TechnicianTableSkeleton: React.FC<TechnicianTableSkeletonProps> = ({ rows = 5 }) => {
  const dummyRows = Array.from({ length: rows }, (_, i) => i);

  return (
    <>
      {dummyRows.map((index) => (
        <tr key={index}>
          {/* PROFIL */}
          <td className="cell-primary">
            <div className={styles.person}>
              <Skeleton width="40px" height="48px" radius="var(--r-sm)" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <Skeleton width={`${120 + (index % 3) * 25}px`} height="15px" style={{ marginBottom: '6px' }} />
                <Skeleton width="90px" height="12px" />
              </div>
            </div>
          </td>

          {/* CABANG */}
          <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Skeleton width="34px" height="20px" radius="4px" />
              <Skeleton width={`${75 + (index % 2) * 20}px`} height="15px" />
            </div>
            <Skeleton width="110px" height="12px" />
          </td>

          {/* PERFORMA */}
          <td>
            <div style={{ marginBottom: '6px' }}>
              <Skeleton width="52px" height="20px" radius="4px" />
            </div>
            <Skeleton width="72px" height="18px" radius="4px" />
          </td>

          {/* KARTU ID */}
          <td>
            <div style={{ marginBottom: '6px' }}>
              <Skeleton width="100px" height="15px" />
            </div>
            <Skeleton width="120px" height="12px" />
          </td>

          {/* STATUS */}
          <td>
            <Skeleton width="58px" height="24px" radius="12px" />
          </td>

          {/* AKSI */}
          <td className="col-actions">
            <div style={{ display: 'inline-flex', gap: '4px', justifyContent: 'flex-end' }}>
              <Skeleton width="28px" height="28px" radius="6px" />
              <Skeleton width="28px" height="28px" radius="6px" />
              <Skeleton width="28px" height="28px" radius="6px" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

