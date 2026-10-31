// src/app/admin/(portal)/accounts/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { ServiceScopeTabs } from '@/components/ui/ServiceScopeTabs';
import { useBranches } from '@/hooks/useBranches';
import { useFeedbackModals } from '@/hooks/useFeedbackModals';
import { ServiceTypeCode, UserRole } from '@/types';
import { SuperAdminOnly, usePortal } from '../portal-context';
import { AccountsTable } from './components/AccountsTable';
import { AccountsToolbar } from './components/AccountsToolbar';
import { CreateAccountModal } from './components/CreateAccountModal';
import { RoleSummaryCards } from './components/RoleSummaryCards';
import { useAccounts } from './hooks/useAccounts';

function ManageAccountsContent() {
  const { profile, refreshProfile } = usePortal();
  // Cabang aktif untuk penugasan; filter juga memuat cabang nonaktif yang masih punya akun
  const { branchesByScope, getBranchServiceType } = useBranches();
  const { branchesByScope: allBranchesByScope } = useBranches(true);
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

  // Alur penyaringan: lingkup layanan -> cabang -> peran & kata kunci
  const [scope, setScope] = useState<ServiceTypeCode | ''>('');
  const [branchFilter, setBranchFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const scopeCounts = useMemo(() => {
    const counts: Partial<Record<ServiceTypeCode | '', number>> = { '': accounts.length };
    for (const acc of accounts) {
      const accScope = getBranchServiceType(acc.branch);
      if (accScope) counts[accScope] = (counts[accScope] ?? 0) + 1;
    }
    return counts;
  }, [accounts, getBranchServiceType]);

  // Akun pada lingkup & cabang terpilih (dasar ringkasan peran dan tabel)
  const scopedAccounts = useMemo(
    () =>
      accounts.filter(
        (acc) =>
          (scope === '' || getBranchServiceType(acc.branch) === scope) &&
          (branchFilter === '' || acc.branch === branchFilter)
      ),
    [accounts, scope, branchFilter, getBranchServiceType]
  );

  const filteredAccounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedAccounts.filter((acc) => {
      const matchesSearch =
        q === '' ||
        acc.full_name.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        (acc.admin_id ?? '').toLowerCase().includes(q) ||
        (acc.branch ?? '').toLowerCase().includes(q);
      const matchesRole = roleFilter === '' || acc.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [scopedAccounts, searchQuery, roleFilter]);

  const roleCounts = useMemo(
    () =>
      scopedAccounts.reduce<Partial<Record<UserRole, number>>>((acc, item) => {
        acc[item.role] = (acc[item.role] ?? 0) + 1;
        return acc;
      }, {}),
    [scopedAccounts]
  );

  const changeScope = (next: ServiceTypeCode | '') => {
    setScope(next);
    // Cabang terpilih dari lingkup lain tidak lagi relevan
    if (branchFilter && next && getBranchServiceType(branchFilter) !== next) setBranchFilter('');
  };

  return (
    <>
      <PageHeading
        title="Kelola akun"
        subtitle="Pilih lingkup layanan dan cabang untuk melihat Admin Cabang serta akun teknisinya. Akun teknisi dibuat dari daftar teknisi."
        actions={
          <button type="button" onClick={() => setShowCreate(true)} className="btn btn-primary">
            <Plus size={16} />
            Tambah akun admin
          </button>
        }
      />

      <ServiceScopeTabs value={scope} onChange={changeScope} counts={scopeCounts} allowAll />

      <RoleSummaryCards counts={roleCounts} />

      <AccountsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        scope={scope}
        branchesByScope={allBranchesByScope}
        branchFilter={branchFilter}
        onBranchFilterChange={setBranchFilter}
      />

      <AccountsTable
        accounts={filteredAccounts}
        loading={loading}
        savingId={savingId}
        currentUserId={profile?.id}
        branchesByScope={branchesByScope}
        getBranchServiceType={getBranchServiceType}
        onChangeRole={changeRole}
        onChangeBranch={changeBranch}
        onToggleActive={toggleActive}
        onResetPassword={resetPassword}
        onIssueAdminId={issueAdminId}
        onDelete={deleteAccount}
      />

      {showCreate && (
        <CreateAccountModal
          branchesByScope={branchesByScope}
          defaultScope={scope || 'DSC'}
          defaultBranch={branchFilter}
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
