// src/app/admin/(portal)/branches/components/BranchesTableSkeleton.tsx
'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface BranchesTableSkeletonProps {
  rows?: number;
}

export const BranchesTableSkeleton: React.FC<BranchesTableSkeletonProps> = ({ rows = 5 }) => {
  const dummyRows = Array.from({ length: rows }, (_, i) => i);

  return (
    <>
      {dummyRows.map((index) => (
        <tr key={index}>
          {/* CABANG */}
          <td className="cell-primary">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Skeleton width={`${100 + (index % 3) * 25}px`} height="16px" />
              <Skeleton width="42px" height="20px" radius="4px" />
            </div>
          </td>

          {/* TEKNISI */}
          <td>
            <Skeleton width="70px" height="15px" />
          </td>

          {/* ADMIN CABANG */}
          <td>
            <Skeleton width="70px" height="15px" />
          </td>

          {/* STATUS */}
          <td>
            <Skeleton width="58px" height="24px" radius="12px" />
          </td>

          {/* AKSI */}
          <td className="col-actions">
            <div style={{ display: 'inline-flex', gap: '4px', justifyContent: 'flex-end' }}>
              <Skeleton width="28px" height="28px" radius="6px" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

