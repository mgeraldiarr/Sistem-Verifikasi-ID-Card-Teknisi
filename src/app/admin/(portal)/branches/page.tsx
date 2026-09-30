// src/app/admin/(portal)/branches/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { useFeedbackModals } from '@/hooks/useFeedbackModals';
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
    stats,
    toggleActive,
    deleteBranch,
    createBranch,
  } = useManagedBranches({ notify, askConfirm });

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const filteredBranches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q ? branches.filter((b) => b.name.toLowerCase().includes(q)) : branches;
  }, [branches, searchQuery]);

  return (
    <>
      <PageHeading
        title="Kelola cabang"
        subtitle="Master cabang DSC, ASC, dan SL yang dipakai untuk data teknisi dan akun admin."
        actions={
          <button type="button" onClick={() => setShowCreate(true)} className="btn btn-primary">
            <Plus size={16} />
            Tambah cabang
          </button>
        }
      />

      <StatRow>
        <StatCard value={stats.total} label="Total cabang" />
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
            aria-label="Cari cabang"
            placeholder="Cari nama cabang"
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
      />

      <p className="footnote">
        Nama cabang menjadi kunci pemisah data teknisi dan akun, sehingga belum bisa diganti dari
        halaman ini. Untuk mengganti nama, nonaktifkan cabang lama lalu tambahkan cabang baru.
      </p>

      {showCreate && (
        <CreateBranchModal onClose={() => setShowCreate(false)} onCreate={createBranch} />
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
