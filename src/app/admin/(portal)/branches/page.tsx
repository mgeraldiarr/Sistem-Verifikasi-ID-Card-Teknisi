// src/app/admin/(portal)/branches/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Building2, MapPin, Plus, Search, Users } from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { inputStyle } from '@/components/ui/admin-styles';
import { StatCard, statGridStyle } from '@/components/ui/StatCard';
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
        title="Kelola Cabang"
        subtitle="Master cabang DSC / ASC / SL"
        icon={<Building2 size={19} />}
      />

      <div style={statGridStyle}>
        <StatCard icon={<MapPin size={14} />} value={stats.total} label="Total Cabang" />
        <StatCard icon={<Building2 size={14} />} value={stats.active} label="Cabang Aktif" />
        <StatCard icon={<Users size={14} />} value={stats.assigned} label="Sudah Ada Admin" />
      </div>

      {/* TOOLBAR */}
      <div
        className="modena-card"
        style={{
          padding: '0.9rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            id="branch-search"
            name="branch_search"
            type="text"
            aria-label="Cari cabang"
            placeholder="Cari nama cabang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '32px' }}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="modena-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} /> Tambah Cabang
        </button>
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

      <p
        style={{
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}
      >
        Nama cabang dipakai sebagai kunci isolasi data pada tabel teknisi dan akun. Penggantian
        nama cabang belum didukung dari halaman ini karena akan memutus keterkaitan data yang
        sudah ada — gunakan nonaktifkan lalu tambah cabang baru bila diperlukan.
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
