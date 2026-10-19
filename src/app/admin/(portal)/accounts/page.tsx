// src/app/admin/(portal)/accounts/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { useBranches } from '@/hooks/useBranches';
import { useFeedbackModals } from '@/hooks/useFeedbackModals';
import { UserRole } from '@/types';
import { SuperAdminOnly, usePortal } from '../portal-context';
import { AccountsTable } from './components/AccountsTable';
import { AccountsToolbar } from './components/AccountsToolbar';
import { CreateAccountModal } from './components/CreateAccountModal';
import { RoleSummaryCards } from './components/RoleSummaryCards';
import { useAccounts } from './hooks/useAccounts';

function ManageAccountsContent() {
  const { profile, refreshProfile } = usePortal();
  const { branchNames } = useBranches();
  const { notify, askConfirm, modals } = useFeedbackModals();

  const {
    accounts,
    loading,
    savingId,
    changeRole,
    changeBranch,
    toggleActive,
    resetPassword,
    issueAdminId,
    deleteAccount,
    createAccount,
  } = useAccounts({ currentUserId: profile?.id, refreshProfile, notify, askConfirm });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filteredAccounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return accounts.filter((acc) => {
      const matchesSearch =
        q === '' ||
        acc.full_name.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        (acc.admin_id ?? '').toLowerCase().includes(q) ||
        (acc.branch ?? '').toLowerCase().includes(q);
      const matchesRole = roleFilter === '' || acc.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [accounts, searchQuery, roleFilter]);

  const roleCounts = useMemo(
    () =>
      accounts.reduce<Partial<Record<UserRole, number>>>((acc, item) => {
        acc[item.role] = (acc[item.role] ?? 0) + 1;
        return acc;
      }, {}),
    [accounts]
  );

  return (
    <>
      <PageHeading
        title="Kelola akun"
        subtitle="Atur peran, cabang, dan status akun yang dapat masuk ke portal. Akun teknisi dibuat dari daftar teknisi."
        actions={
          <button type="button" onClick={() => setShowCreate(true)} className="btn btn-primary">
            <Plus size={16} />
            Tambah akun admin
          </button>
        }
      />

      <RoleSummaryCards counts={roleCounts} />

      <AccountsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
      />

      <AccountsTable
        accounts={filteredAccounts}
        loading={loading}
        savingId={savingId}
        currentUserId={profile?.id}
        branchNames={branchNames}
        onChangeRole={changeRole}
        onChangeBranch={changeBranch}
        onToggleActive={toggleActive}
        onResetPassword={resetPassword}
        onIssueAdminId={issueAdminId}
        onDelete={deleteAccount}
      />

      {showCreate && (
        <CreateAccountModal
          branchNames={branchNames}
          onClose={() => setShowCreate(false)}
          onCreate={createAccount}
        />
      )}

      {modals}
    </>
  );
}

export default function ManageAccountsPage() {
  // Layout portal sudah memastikan pengguna adalah admin aktif;
  // halaman ini mempersempit lagi ke Super Admin.
  return (
    <SuperAdminOnly>
      <ManageAccountsContent />
    </SuperAdminOnly>
  );
}
