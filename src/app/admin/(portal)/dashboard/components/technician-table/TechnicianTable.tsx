// src/app/admin/(portal)/dashboard/components/technician-table/TechnicianTable.tsx
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Technician, TechnicianStatus } from '@/types';
import { TechnicianTableRow } from './TechnicianTableRow';
import { KpiWeights } from '@/lib/kpi';

interface TechnicianTableProps {
  loading: boolean;
  technicians: Technician[];
  onToggleActive: (id: string, status: TechnicianStatus) => void;
  onPrint: (tech: Technician) => void;
  onRegenerateQR: (tech: Technician) => void;
  onEdit: (tech: Technician) => void;
  onDelete: (id: string) => void;
  onSendAccess: (tech: Technician) => void;
  canDelete?: boolean;
  kpiWeights?: KpiWeights;
}

export const TechnicianTable: React.FC<TechnicianTableProps> = ({
  loading,
  technicians,
  canDelete = true,
  kpiWeights,
  ...handlers
}) => (
  <div className="table-panel">
    {loading ? (
      <div className="table-loading" aria-label="Memuat data teknisi">
        <Loader2 className="spin" size={24} />
      </div>
    ) : technicians.length === 0 ? (
      <div className="table-empty">
        <strong>Belum ada teknisi yang cocok</strong>
        Ubah kata kunci atau hapus filter, atau tambahkan teknisi baru.
      </div>
    ) : (
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
          {technicians.map((tech) => (
            <TechnicianTableRow
              key={tech.id}
              tech={tech}
              canDelete={canDelete}
              kpiWeights={kpiWeights}
              {...handlers}
            />
          ))}
        </tbody>
      </table>
    )}
  </div>
);
