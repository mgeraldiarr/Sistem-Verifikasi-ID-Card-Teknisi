// src/app/admin/(portal)/accounts/components/AccountsTable.tsx
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { ServiceTypeCode, UserProfile } from '@/types';
import { AccountRow, AccountRowActions } from './AccountRow';

interface AccountsTableProps extends AccountRowActions {
  accounts: UserProfile[];
  loading: boolean;
  savingId: string | null;
  currentUserId: string | undefined;
  branchesByScope: Record<ServiceTypeCode, string[]>;
  getBranchServiceType: (branch: string | null) => ServiceTypeCode | null;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  loading,
  savingId,
  currentUserId,
  branchesByScope,
  getBranchServiceType,
  ...actions
}) => (
  <div className="table-panel">
    {loading ? (
      <div className="table-loading" aria-label="Memuat akun">
        <Loader2 size={24} className="spin" />
      </div>
    ) : accounts.length === 0 ? (
      <div className="table-empty">
        <strong>Tidak ada akun yang cocok</strong>
        Ubah kata kunci, atau pilih lingkup, cabang, maupun peran lain.
      </div>
    ) : (
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Pengguna</th>
            <th scope="col">Peran</th>
            <th scope="col">Lingkup</th>
            <th scope="col">Cabang</th>
            <th scope="col">Status</th>
            <th scope="col" className="col-actions">
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              isSelf={account.id === currentUserId}
              busy={savingId === account.id}
              serviceType={getBranchServiceType(account.branch)}
              branchesByScope={branchesByScope}
              {...actions}
            />
          ))}
        </tbody>
      </table>
    )}
  </div>
);
