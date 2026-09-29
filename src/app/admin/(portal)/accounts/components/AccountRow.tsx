// src/app/admin/(portal)/accounts/components/AccountRow.tsx
'use client';

import React from 'react';
import { KeyRound, Loader2, Trash2 } from 'lucide-react';
import { tdStyle } from '@/components/ui/admin-styles';
import { UserProfile, UserRole } from '@/types';
import { controlStyle, ROLE_META } from './role-meta';

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
  branchNames: string[];
}

export const AccountRow: React.FC<AccountRowProps> = ({
  account,
  isSelf,
  busy,
  branchNames,
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
    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
      {/* PENGGUNA */}
      <td style={tdStyle}>
        <div style={{ fontWeight: 700 }}>
          {account.full_name || '(Tanpa Nama)'}
          {isSelf && (
            <span
              style={{
                marginLeft: '0.4rem',
                fontSize: '0.65rem',
                fontWeight: 800,
                color: 'var(--accent-red)',
              }}
            >
              (Anda)
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{account.email}</div>

        {account.role === 'branch_admin' &&
          (account.admin_id ? (
            <div
              title="ID login Admin Cabang"
              style={{
                marginTop: '3px',
                fontSize: '0.72rem',
                fontWeight: 800,
                fontFamily: 'monospace',
                color: 'var(--text-primary)',
              }}
            >
              {account.admin_id}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onIssueAdminId(account)}
              disabled={busy || !account.branch}
              title={
                account.branch
                  ? 'Admin Cabang belum memiliki ID login'
                  : 'Tetapkan cabang terlebih dahulu'
              }
              style={{
                display: 'block',
                marginTop: '4px',
                padding: '2px 8px',
                fontSize: '0.68rem',
                fontWeight: 800,
                borderRadius: '6px',
                border: '1px dashed var(--accent-red)',
                background: 'transparent',
                color: 'var(--accent-red)',
                cursor: busy || !account.branch ? 'not-allowed' : 'pointer',
              }}
            >
              Terbitkan ID Login
            </button>
          ))}

        {account.must_change_password && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              marginTop: '4px',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#B45309',
              backgroundColor: 'rgba(245,158,11,0.12)',
              padding: '2px 7px',
              borderRadius: '999px',
            }}
          >
            <KeyRound size={10} /> Wajib ganti kata sandi
          </span>
        )}
      </td>

      {/* PERAN — peran teknisi & akun sendiri tidak dapat diubah dari sini */}
      <td style={tdStyle}>
        {isTechnician || isSelf ? (
          <span
            title={
              isSelf
                ? 'Peran akun sendiri tidak dapat diubah'
                : 'Peran teknisi mengikuti data teknisi tertaut'
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 9px',
              borderRadius: '999px',
              fontSize: '0.7rem',
              fontWeight: 800,
              backgroundColor: role.bg,
              color: role.color,
            }}
          >
            {role.icon}
            {role.label}
          </span>
        ) : (
          <select
            aria-label={`Peran ${account.full_name}`}
            value={account.role}
            disabled={busy}
            onChange={(e) => onChangeRole(account, e.target.value as UserRole)}
            style={controlStyle}
          >
            <option value="super_admin">Super Admin</option>
            <option value="branch_admin">Admin Cabang</option>
          </select>
        )}
      </td>

      {/* CABANG */}
      <td style={tdStyle}>
        {isTechnician ? (
          <span style={{ color: 'var(--text-secondary)' }}>{account.branch || '-'}</span>
        ) : (
          <select
            aria-label={`Cabang ${account.full_name}`}
            value={account.branch ?? ''}
            disabled={busy}
            onChange={(e) => onChangeBranch(account, e.target.value || null)}
            style={{ ...controlStyle, minWidth: '170px' }}
          >
            <option value="">— Tanpa Cabang (Nasional) —</option>
            {branchNames.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        )}
      </td>

      {/* STATUS */}
      <td style={tdStyle}>
        <button
          type="button"
          onClick={() => onToggleActive(account)}
          disabled={busy || isSelf}
          title={isSelf ? 'Anda tidak dapat menonaktifkan akun sendiri' : 'Ubah status akun'}
          style={{
            padding: '5px 13px',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 800,
            border: '1px solid transparent',
            cursor: isSelf ? 'not-allowed' : 'pointer',
            opacity: isSelf ? 0.55 : 1,
            backgroundColor: account.is_active
              ? 'var(--status-active-glow)'
              : 'var(--status-inactive-glow)',
            color: account.is_active ? 'var(--status-active)' : 'var(--status-inactive)',
          }}
        >
          {account.is_active ? 'AKTIF' : 'NONAKTIF'}
        </button>
      </td>

      {/* AKSI */}
      <td style={{ ...tdStyle, textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
          {busy && <Loader2 size={16} className="animate-spin-custom" color="var(--text-muted)" />}
          <button
            type="button"
            onClick={() => onResetPassword(account)}
            disabled={busy}
            title="Atur Ulang Kata Sandi"
            aria-label={`Atur ulang kata sandi ${account.full_name}`}
            style={{
              padding: '5px',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <KeyRound size={17} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(account)}
            disabled={busy || isSelf}
            title={isSelf ? 'Anda tidak dapat menghapus akun sendiri' : 'Hapus Akun'}
            aria-label={`Hapus akun ${account.full_name}`}
            style={{
              padding: '5px',
              background: 'transparent',
              color: isSelf ? 'var(--text-muted)' : 'var(--accent-red)',
              cursor: isSelf ? 'not-allowed' : 'pointer',
            }}
          >
            <Trash2 size={17} />
          </button>
        </div>
      </td>
    </tr>
  );
};
