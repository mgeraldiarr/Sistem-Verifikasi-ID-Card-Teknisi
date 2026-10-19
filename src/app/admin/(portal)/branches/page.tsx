// src/app/admin/(portal)/branches/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { ServiceScopeTabs } from '@/components/ui/ServiceScopeTabs';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { SERVICE_SCOPES } from '@/constants/service-center';
import { useFeedbackModals } from '@/hooks/useFeedbackModals';
import { ServiceTypeCode } from '@/types';
import { SuperAdminOnly } from '../portal-context';
import { BranchesTable } from './components/BranchesTable';
import { CreateBranchModal } from './components/CreateBranchModal';
import { useManagedBranches } from './hooks/useManagedBranches';

function ManageBranchesContent() {
  const { notify, askConfirm, modals } = useFeedbackModals();
  const {
    branches,
    technicianCounts,
    adminCounts,
    loading,
    savingId,
    toggleActive,
    deleteBranch,
    createBranch,
  } = useManagedBranches({ notify, askConfirm });

  // Cabang dikelola per lingkup layanan: pilih lingkup dulu, baru lihat cabangnya
  const [scope, setScope] = useState<ServiceTypeCode>('DSC');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const scopeInfo = SERVICE_SCOPES.find((s) => s.code === scope)!;

  const scopeCounts = useMemo(
    () =>
      branches.reduce<Partial<Record<ServiceTypeCode, number>>>((acc, b) => {
        acc[b.service_type] = (acc[b.service_type] ?? 0) + 1;
        return acc;
      }, {}),
    [branches]
  );

  const scopeBranches = useMemo(
    () => branches.filter((b) => b.service_type === scope),
    [branches, scope]
  );

  const filteredBranches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q ? scopeBranches.filter((b) => b.name.toLowerCase().includes(q)) : scopeBranches;
  }, [scopeBranches, searchQuery]);

  const stats = useMemo(
    () => ({
      total: scopeBranches.length,
      active: scopeBranches.filter((b) => b.is_active).length,
      assigned: scopeBranches.filter((b) => (adminCounts[b.name] ?? 0) > 0).length,
    }),
    [scopeBranches, adminCounts]
  );

  // Cabang baru langsung terlihat: tab berpindah ke lingkup cabang yang baru dibuat
  const handleCreate = async (name: string, serviceType: ServiceTypeCode) => {
    const error = await createBranch(name, serviceType);
    if (!error) {
      setScope(serviceType);
      setSearchQuery('');
    }
    return error;
  };

  return (
    <>
      <PageHeading
        title="Kelola cabang"
        subtitle="Pilih lingkup layanan untuk melihat dan mengelola cabangnya. Cabang dipakai untuk data teknisi dan akun admin."
        actions={
          <button type="button" onClick={() => setShowCreate(true)} className="btn btn-primary">
            <Plus size={16} />
            Tambah cabang {scope}
          </button>
        }
      />

      <ServiceScopeTabs
        value={scope}
        onChange={(next) => {
          setScope(next);
          setSearchQuery('');
        }}
        counts={scopeCounts}
      />

      <StatRow>
        <StatCard value={stats.total} label={`Cabang ${scope}`} />
        <StatCard value={stats.active} label="Cabang aktif" />
        <StatCard value={stats.assigned} label="Sudah punya admin" />
      </StatRow>

      <div className="toolbar" role="search">
        <div className="input-wrap grow">
          <Search size={16} className="input-icon" />
          <input
            id="branch-search"
            name="branch_search"
            type="search"
            className="input"
            aria-label={`Cari cabang ${scope}`}
            placeholder={`Cari cabang ${scope}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <BranchesTable
        branches={filteredBranches}
        loading={loading}
        savingId={savingId}
        technicianCounts={technicianCounts}
        adminCounts={adminCounts}
        onToggleActive={toggleActive}
        onDelete={deleteBranch}
        emptyTitle={
          searchQuery.trim()
            ? 'Belum ada cabang yang cocok'
            : `Belum ada cabang ${scopeInfo.code}`
        }
        emptyHint={
          searchQuery.trim()
            ? 'Ubah kata kunci pencarian, atau tambahkan cabang baru.'
            : `Tambahkan cabang ${scopeInfo.fullName} pertama lewat tombol Tambah cabang.`
        }
      />

      <p className="footnote">
        Nama cabang menjadi kunci pemisah data teknisi dan akun, sehingga belum bisa diganti dari
        halaman ini. Untuk mengganti nama, nonaktifkan cabang lama lalu tambahkan cabang baru.
      </p>

      {showCreate && (
        <CreateBranchModal
          defaultServiceType={scope}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {modals}
    </>
  );
}

export default function ManageBranchesPage() {
  // Layout portal sudah memastikan pengguna adalah admin aktif;
  // halaman ini mempersempit lagi ke Super Admin.
  return (
    <SuperAdminOnly>
      <ManageBranchesContent />
    </SuperAdminOnly>
  );
}
