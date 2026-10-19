// src/app/admin/(portal)/accounts/components/AccountRow.tsx
'use client';

import React from 'react';
import { KeyRound, Loader2, Trash2 } from 'lucide-react';
import { BranchOptions } from '@/components/ui/BranchOptions';
import { SERVICE_SCOPES } from '@/constants/service-center';
import { ServiceTypeCode, UserProfile, UserRole } from '@/types';
import { ROLE_META } from './role-meta';

export interface AccountRowActions {
  onChangeRole: (account: UserProfile, role: UserRole) => void;
  onChangeBranch: (account: UserProfile, branch: string | null) => void;
  onToggleActive: (account: UserProfile) => void;
  onResetPassword: (account: UserProfile) => void;
  onIssueAdminId: (account: UserProfile) => void;
  onDelete: (account: UserProfile) => void;
}

interface AccountRowProps extends AccountRowActions {
  account: UserProfile;
  isSelf: boolean;
  busy: boolean;
  /** Lingkup cabang akun ini; null = nasional / cabang tidak terdaftar */
  serviceType: ServiceTypeCode | null;
  branchesByScope: Record<ServiceTypeCode, string[]>;
}

export const AccountRow: React.FC<AccountRowProps> = ({
  account,
  isSelf,
  busy,
  serviceType,
  branchesByScope,
  onChangeRole,
  onChangeBranch,
  onToggleActive,
  onResetPassword,
  onIssueAdminId,
  onDelete,
}) => {
  const isTechnician = account.role === 'technician';
  const role = ROLE_META[account.role];

  return (
    <tr>
      {/* PENGGUNA */}
      <td className="cell-primary">
        <div className="cell-strong" style={{ overflowWrap: 'anywhere' }}>
          {account.full_name || '(Tanpa nama)'}
          {isSelf && (
            <span className="badge" style={{ marginLeft: '8px', verticalAlign: '1px' }}>
              Anda
            </span>
          )}
        </div>
        <div className="cell-sub" style={{ overflowWrap: 'anywhere' }}>
          {account.email}
        </div>

        {account.role === 'branch_admin' &&
          (account.admin_id ? (
            <div className="cell-sub tnum" title="ID login Admin Cabang" style={{ color: 'var(--ink)', fontWeight: 600 }}>
              {account.admin_id}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onIssueAdminId(account)}
              disabled={busy || !account.branch}
              className="btn btn-danger btn-sm"
              style={{ marginTop: '6px', minHeight: '26px' }}
              title={
                account.branch
                  ? 'Admin Cabang ini belum punya ID login'
                  : 'Tetapkan cabang terlebih dahulu'
              }
            >
              Terbitkan ID login
            </button>
          ))}

        {account.must_change_password && (
          <div style={{ marginTop: '6px' }}>
            <span className="badge badge-warn">
              <KeyRound size={11} /> Belum ganti kata sandi awal
            </span>
          </div>
        )}
      </td>

      {/* PERAN — peran teknisi & akun sendiri tidak dapat diubah dari sini */}
      <td data-label="Peran">
        {isTechnician || isSelf ? (
          <span
            className="badge"
            title={
              isSelf
                ? 'Peran akun sendiri tidak dapat diubah'
                : 'Peran teknisi mengikuti data teknisi tertaut'
            }
          >
            {role.icon}
            {role.label}
          </span>
        ) : (
          <select
            aria-label={`Peran ${account.full_name}`}
            className="select select-sm"
            value={account.role}
            disabled={busy}
            onChange={(e) => onChangeRole(account, e.target.value as UserRole)}
            style={{ maxWidth: '170px' }}
          >
            <option value="super_admin">Super Admin</option>
            <option value="branch_admin">Admin Cabang</option>
          </select>
        )}
      </td>

      {/* LINGKUP — mengikuti lingkup cabang akun */}
      <td data-label="Lingkup">
        {serviceType ? (
          <span
            className="badge"
            title={SERVICE_SCOPES.find((s) => s.code === serviceType)?.fullName}
          >
            {serviceType}
          </span>
        ) : (
          <span className="text-3">{account.branch ? '-' : 'Nasional'}</span>
        )}
      </td>

      {/* CABANG */}
      <td data-label="Cabang">
        {isTechnician ? (
          <span className="text-2">{account.branch || '-'}</span>
        ) : (
          <select
            aria-label={`Cabang ${account.full_name}`}
            className="select select-sm"
            value={account.branch ?? ''}
            disabled={busy}
            onChange={(e) => onChangeBranch(account, e.target.value || null)}
            style={{ maxWidth: '220px' }}
          >
            <option value="">Nasional (tanpa cabang)</option>
            {/* Cabang lama/nonaktif tetap tampil agar nilai select tidak hilang */}
            {account.branch &&
              !Object.values(branchesByScope).some((names) => names.includes(account.branch!)) && (
              <option value={account.branch}>{account.branch}</option>
            )}
            <BranchOptions branchesByScope={branchesByScope} />
          </select>
        )}
      </td>

      {/* STATUS */}
      <td data-label="Status">
        <button
          type="button"
          onClick={() => onToggleActive(account)}
          disabled={busy || isSelf}
          className={`status-toggle ${account.is_active ? 'is-on' : 'is-off'}`}
          title={isSelf ? 'Anda tidak dapat menonaktifkan akun sendiri' : 'Klik untuk mengubah status'}
        >
          {account.is_active ? 'Aktif' : 'Nonaktif'}
        </button>
      </td>

      {/* AKSI */}
      <td className="col-actions">
        <div className="row-actions">
          {busy && <Loader2 size={16} className="spin text-3" style={{ margin: '0 6px' }} />}
          <button
            type="button"
            className="icon-btn"
            onClick={() => onResetPassword(account)}
            disabled={busy}
            title="Atur ulang kata sandi"
            aria-label={`Atur ulang kata sandi ${account.full_name}`}
          >
            <KeyRound size={17} />
          </button>
          <button
            type="button"
            className="icon-btn is-danger"
            onClick={() => onDelete(account)}
            disabled={busy || isSelf}
            title={isSelf ? 'Anda tidak dapat menghapus akun sendiri' : 'Hapus akun'}
            aria-label={`Hapus akun ${account.full_name}`}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </td>
    </tr>
  );
};
