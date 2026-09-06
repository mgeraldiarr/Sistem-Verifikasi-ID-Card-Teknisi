// src/app/admin/dashboard/components/TechnicianTable.tsx
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Technician, TechnicianStatus } from '@/types';
import { TechnicianTableRow } from './TechnicianTableRow';

interface TechnicianTableProps {
  loading: boolean;
  technicians: Technician[];
  onToggleActive: (id: string, status: TechnicianStatus) => void;
  onPrint: (tech: Technician) => void;
  onRegenerateQR: (tech: Technician) => void;
  onEdit: (tech: Technician) => void;
  onDelete: (id: string) => void;
}

export const TechnicianTable: React.FC<TechnicianTableProps> = ({
  loading,
  technicians,
  onToggleActive,
  onPrint,
  onRegenerateQR,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="modena-card" style={{ padding: '0', overflowX: 'auto' }}>
      {loading ? (
        <div
          style={{
            padding: '4rem',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Loader2
            className="animate-spin-custom"
            size={36}
            color="var(--bg-dark)"
          />
        </div>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            minWidth: '800px',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: '#F9FAFB',
              }}
            >
              <th
                style={{
                  padding: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  fontSize: '0.825rem',
                  textTransform: 'uppercase',
                }}
              >
                Teknisi
              </th>
              <th
                style={{
                  padding: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  fontSize: '0.825rem',
                  textTransform: 'uppercase',
                }}
              >
                Cabang / Service Center
              </th>
              <th
                style={{
                  padding: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  fontSize: '0.825rem',
                  textTransform: 'uppercase',
                }}
              >
                Performa (KPI/CSI)
              </th>
              <th
                style={{
                  padding: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  fontSize: '0.825rem',
                  textTransform: 'uppercase',
                }}
              >
                ID Card Fisik
              </th>
              <th
                style={{
                  padding: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  fontSize: '0.825rem',
                  textTransform: 'uppercase',
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  fontSize: '0.825rem',
                  textTransform: 'uppercase',
                  textAlign: 'right',
                }}
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((tech) => (
              <TechnicianTableRow
                key={tech.id}
                tech={tech}
                onToggleActive={onToggleActive}
                onPrint={onPrint}
                onRegenerateQR={onRegenerateQR}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}

            {technicians.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Data teknisi tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
