// src/app/admin/(portal)/loading.tsx
import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { TechnicianTableSkeleton } from './dashboard/components/technician-table/TechnicianTableSkeleton';

export default function PortalLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Skeleton width="180px" height="26px" radius="6px" />
        <Skeleton width="280px" height="14px" />
      </div>

      <div className="table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Kolom 1</th>
              <th scope="col">Kolom 2</th>
              <th scope="col">Kolom 3</th>
              <th scope="col">Kolom 4</th>
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
  );
}

