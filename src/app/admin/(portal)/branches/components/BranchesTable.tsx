// src/app/admin/(portal)/branches/components/BranchesTable.tsx
'use client';

import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
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
  <div className="table-panel">
    {loading ? (
      <div className="table-loading" aria-label="Memuat cabang">
        <Loader2 size={24} className="spin" />
      </div>
    ) : branches.length === 0 ? (
      <div className="table-empty">
        <strong>Belum ada cabang yang cocok</strong>
        Ubah kata kunci pencarian, atau tambahkan cabang baru.
      </div>
    ) : (
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Cabang</th>
            <th scope="col">Lingkup</th>
            <th scope="col">Teknisi</th>
            <th scope="col">Admin cabang</th>
            <th scope="col">Status</th>
            <th scope="col" className="col-actions">
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => {
            const techCount = technicianCounts[branch.name] ?? 0;
            const adminCount = adminCounts[branch.name] ?? 0;
            const busy = savingId === branch.id;
            const inUse = techCount > 0 || adminCount > 0;

            return (
              <tr key={branch.id}>
                <td className="cell-primary cell-strong">{branch.name}</td>

                <td data-label="Lingkup">
                  <span className="badge">{branch.service_type}</span>
                </td>

                <td data-label="Teknisi" className="tnum">
                  {techCount}
                </td>

                <td data-label="Admin cabang">
                  {adminCount === 0 ? (
                    <span className="badge badge-warn">Belum ada</span>
                  ) : (
                    <span className="tnum">{adminCount}</span>
                  )}
                </td>

                <td data-label="Status">
                  <button
                    type="button"
                    onClick={() => onToggleActive(branch)}
                    disabled={busy}
                    className={`status-toggle ${branch.is_active ? 'is-on' : 'is-off'}`}
                    title="Klik untuk mengubah status"
                  >
                    {branch.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>

                <td className="col-actions">
                  <div className="row-actions">
                    {busy && <Loader2 size={16} className="spin text-3" style={{ margin: '0 6px' }} />}
                    <button
                      type="button"
                      className="icon-btn is-danger"
                      onClick={() => onDelete(branch)}
                      disabled={busy}
                      aria-label={`Hapus cabang ${branch.name}`}
                      title={
                        inUse
                          ? 'Cabang masih punya teknisi atau admin, nonaktifkan saja'
                          : 'Hapus cabang'
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
  </div>
);
