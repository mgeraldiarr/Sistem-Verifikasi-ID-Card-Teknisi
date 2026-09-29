// src/app/admin/(portal)/accounts/components/AccountsTable.tsx
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { thStyle } from '@/components/ui/admin-styles';
import { UserProfile } from '@/types';
import { AccountRow, AccountRowActions } from './AccountRow';

interface AccountsTableProps extends AccountRowActions {
  accounts: UserProfile[];
  loading: boolean;
  savingId: string | null;
  currentUserId: string | undefined;
  branchNames: string[];
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  loading,
  savingId,
  currentUserId,
  branchNames,
  ...actions
}) => (
  <div className="modena-card" style={{ padding: 0, overflowX: 'auto' }}>
    {loading ? (
      <div style={{ padding: '3.5rem', display: 'flex', justifyContent: 'center' }}>
        <Loader2 size={32} color="var(--bg-dark)" className="animate-spin-custom" />
      </div>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#F9FAFB' }}>
            <th style={thStyle}>Pengguna</th>
            <th style={thStyle}>Peran</th>
            <th style={thStyle}>Cabang</th>
            <th style={thStyle}>Status</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              isSelf={account.id === currentUserId}
              busy={savingId === account.id}
              branchNames={branchNames}
              {...actions}
            />
          ))}

          {accounts.length === 0 && (
            <tr>
              <td
                colSpan={5}
                style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                }}
              >
                Tidak ada akun yang cocok dengan pencarian.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    )}
  </div>
);
