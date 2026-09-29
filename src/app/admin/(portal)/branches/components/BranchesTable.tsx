// src/app/admin/(portal)/branches/components/BranchesTable.tsx
'use client';

import React from 'react';
import { Loader2, MapPin, Trash2 } from 'lucide-react';
import { tdStyle, thStyle } from '@/components/ui/admin-styles';
import { BranchRecord } from '@/types';

interface BranchesTableProps {
  branches: BranchRecord[];
  loading: boolean;
  savingId: string | null;
  technicianCounts: Record<string, number>;
  adminCounts: Record<string, number>;
  onToggleActive: (branch: BranchRecord) => void;
  onDelete: (branch: BranchRecord) => void;
}

export const BranchesTable: React.FC<BranchesTableProps> = ({
  branches,
  loading,
  savingId,
  technicianCounts,
  adminCounts,
  onToggleActive,
  onDelete,
}) => (
  <div className="modena-card" style={{ padding: 0, overflowX: 'auto' }}>
    {loading ? (
      <div style={{ padding: '3.5rem', display: 'flex', justifyContent: 'center' }}>
        <Loader2 size={32} color="var(--bg-dark)" className="animate-spin-custom" />
      </div>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#F9FAFB' }}>
            <th style={thStyle}>Nama Cabang</th>
            <th style={thStyle}>Ruang Lingkup</th>
            <th style={thStyle}>Teknisi</th>
            <th style={thStyle}>Admin Cabang</th>
            <th style={thStyle}>Status</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => {
            const techCount = technicianCounts[branch.name] ?? 0;
            const adminCount = adminCounts[branch.name] ?? 0;
            const busy = savingId === branch.id;
            const inUse = techCount > 0 || adminCount > 0;

            return (
              <tr key={branch.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                    <MapPin size={13} color="var(--text-muted)" />
                    {branch.name}
                  </div>
                </td>

                <td style={tdStyle}>
                  <span
                    style={{
                      padding: '2px 9px',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: 'rgba(28,28,26,0.07)',
                      color: '#1C1C1A',
                    }}
                  >
                    {branch.service_type}
                  </span>
                </td>

                <td style={tdStyle}>{techCount}</td>
                <td style={tdStyle}>
                  {adminCount === 0 ? (
                    <span style={{ color: '#B45309', fontWeight: 600, fontSize: '0.775rem' }}>
                      Belum ada
                    </span>
                  ) : (
                    adminCount
                  )}
                </td>

                <td style={tdStyle}>
                  <button
                    type="button"
                    onClick={() => onToggleActive(branch)}
                    disabled={busy}
                    style={{
                      padding: '5px 13px',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      border: '1px solid transparent',
                      cursor: 'pointer',
                      backgroundColor: branch.is_active
                        ? 'var(--status-active-glow)'
                        : 'var(--status-inactive-glow)',
                      color: branch.is_active ? 'var(--status-active)' : 'var(--status-inactive)',
                    }}
                  >
                    {branch.is_active ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </td>

                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                    {busy && (
                      <Loader2 size={16} className="animate-spin-custom" color="var(--text-muted)" />
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(branch)}
                      disabled={busy}
                      aria-label={`Hapus cabang ${branch.name}`}
                      title={
                        inUse
                          ? 'Cabang masih memiliki teknisi/admin — nonaktifkan saja'
                          : 'Hapus Cabang'
                      }
                      style={{
                        padding: '5px',
                        background: 'transparent',
                        color: inUse ? 'var(--text-muted)' : 'var(--accent-red)',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {branches.length === 0 && (
            <tr>
              <td
                colSpan={6}
                style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                }}
              >
                Master cabang kosong atau tidak ada yang cocok dengan pencarian.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    )}
  </div>
);
