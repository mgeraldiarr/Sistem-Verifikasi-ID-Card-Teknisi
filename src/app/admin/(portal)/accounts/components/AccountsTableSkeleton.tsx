// src/app/admin/(portal)/accounts/components/AccountsTableSkeleton.tsx
'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface AccountsTableSkeletonProps {
  rows?: number;
}

export const AccountsTableSkeleton: React.FC<AccountsTableSkeletonProps> = ({ rows = 5 }) => {
  const dummyRows = Array.from({ length: rows }, (_, i) => i);

  return (
    <>
      {dummyRows.map((index) => (
        <tr key={index}>
          {/* PENGGUNA */}
          <td className="cell-primary">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Skeleton width="32px" height="32px" radius="8px" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <Skeleton width={`${120 + (index % 3) * 20}px`} height="15px" style={{ marginBottom: '4px' }} />
                <Skeleton width="160px" height="12px" />
              </div>
            </div>
          </td>

          {/* PERAN */}
          <td>
            <Skeleton width="110px" height="30px" radius="6px" />
          </td>

          {/* LINGKUP */}
          <td>
            <Skeleton width="45px" height="20px" radius="4px" />
          </td>

          {/* CABANG */}
          <td>
            <Skeleton width="120px" height="30px" radius="6px" />
          </td>

          {/* STATUS */}
          <td>
            <Skeleton width="60px" height="24px" radius="12px" />
          </td>

          {/* AKSI */}
          <td className="col-actions">
            <div style={{ display: 'inline-flex', gap: '4px', justifyContent: 'flex-end' }}>
              <Skeleton width="28px" height="28px" radius="6px" />
              <Skeleton width="28px" height="28px" radius="6px" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

