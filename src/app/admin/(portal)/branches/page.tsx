// src/app/admin/branches/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { NotificationModal } from '@/components/ui/NotificationModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { supabase } from '@/lib/supabase';
import { SERVICE_SCOPES } from '@/constants/service-center';
import { SuperAdminOnly } from '../portal-context';
import {
  BranchRecord,
  ConfirmModalState,
  NotificationState,
  NotificationType,
  ServiceTypeCode,
} from '@/types';

const thStyle: React.CSSProperties = {
  padding: '0.9rem 1rem',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '0.85rem 1rem',
  fontSize: '0.825rem',
  color: 'var(--text-primary)',
  verticalAlign: 'middle',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.7rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.775rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '0.35rem',
};

function ManageBranchesContent() {
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [technicianCounts, setTechnicianCounts] = useState<Record<string, number>>({});
  const [adminCounts, setAdminCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ServiceTypeCode>('DSC');
  const [formError, setFormError] = useState<string | null>(null);

  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const notify = (type: NotificationType, title: string, message: string) =>
    setNotification({ show: true, type, title, message });

  const askConfirm = (title: string, message: string, onConfirm: () => void) =>
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => setConfirmModal((prev) => ({ ...prev, show: false })),
    });

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const [branchRes, techRes, adminRes] = await Promise.all([
      supabase
        .from('branches')
        .select('id, name, service_type, is_active')
        .order('name', { ascending: true }),
      supabase.from('technicians').select('branch'),
      supabase.from('user_profiles').select('branch, role'),
    ]);

    if (branchRes.error) {
      notify(
        'error',
        'Gagal Memuat Cabang',
        `${branchRes.error.message}\n\nPastikan migrasi RBAC & isolasi cabang sudah dijalankan.`
      );
      setBranches([]);
    } else {
      setBranches((branchRes.data ?? []) as BranchRecord[]);
    }

    // Agregasi jumlah teknisi per cabang
    const techMap: Record<string, number> = {};
    (techRes.data ?? []).forEach((row: { branch: string | null }) => {
      if (row.branch) techMap[row.branch] = (techMap[row.branch] ?? 0) + 1;
    });
    setTechnicianCounts(techMap);

    // Agregasi jumlah Admin Cabang per cabang
    const adminMap: Record<string, number> = {};
    (adminRes.data ?? []).forEach((row: { branch: string | null; role: string }) => {
      if (row.branch && row.role === 'branch_admin') {
        adminMap[row.branch] = (adminMap[row.branch] ?? 0) + 1;
      }
    });
    setAdminCounts(adminMap);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredBranches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((b) => b.name.toLowerCase().includes(q));
  }, [branches, searchQuery]);

  const stats = useMemo(() => {
    const total = branches.length;
    const active = branches.filter((b) => b.is_active).length;
    const assigned = branches.filter((b) => (adminCounts[b.name] ?? 0) > 0).length;
    return { total, active, assigned };
  }, [branches, adminCounts]);

  const handleToggleActive = (branch: BranchRecord) => {
    const nextActive = !branch.is_active;

    askConfirm(
      nextActive ? 'Aktifkan Cabang' : 'Nonaktifkan Cabang',
      nextActive
        ? `Aktifkan kembali cabang ${branch.name}?`
        : `Nonaktifkan cabang ${branch.name}? Cabang akan hilang dari dropdown pemilihan, namun data teknisi yang sudah ada tetap tersimpan.`,
      async () => {
        setSavingId(branch.id);
        const { error } = await supabase
          .from('branches')
          .update({ is_active: nextActive })
          .eq('id', branch.id);
        setSavingId(null);

        if (error) {
          notify('error', 'Gagal Menyimpan', error.message);
          return;
        }

        setBranches((prev) =>
          prev.map((b) => (b.id === branch.id ? { ...b, is_active: nextActive } : b))
        );
      }
    );
  };

  const handleDelete = (branch: BranchRecord) => {
    const techCount = technicianCounts[branch.name] ?? 0;
    const adminCount = adminCounts[branch.name] ?? 0;

    // `technicians.branch` & `user_profiles.branch` berupa teks, bukan foreign key.
    // Menghapus cabang yang masih dipakai akan meninggalkan data yatim.
    if (techCount > 0 || adminCount > 0) {
      notify(
        'warning',
        'Cabang Masih Dipakai',
        `Cabang ${branch.name} masih memiliki ${techCount} teknisi dan ${adminCount} admin cabang. Pindahkan atau hapus data tersebut terlebih dahulu, atau cukup nonaktifkan cabang ini.`
      );
      return;
    }

    askConfirm(
      'Hapus Cabang',
      `Hapus cabang ${branch.name} secara permanen dari master cabang?`,
      async () => {
        setSavingId(branch.id);
        const { data, error } = await supabase
          .from('branches')
          .delete()
          .eq('id', branch.id)
          .select('id');
        setSavingId(null);

        if (error) {
          notify('error', 'Gagal Menghapus', error.message);
          return;
        }
        if (!data || data.length === 0) {
          notify(
            'error',
            'Akses Ditolak',
            'Cabang tidak terhapus. Peran akun Anda tidak memiliki izin menghapus master cabang.'
          );
          return;
        }

        setBranches((prev) => prev.filter((b) => b.id !== branch.id));
        notify('success', 'Cabang Dihapus', `${branch.name} telah dihapus dari master cabang.`);
      }
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = newName.trim().replace(/\s+/g, ' ');
    if (!name) {
      setFormError('Nama cabang wajib diisi.');
      return;
    }
    if (branches.some((b) => b.name.toLowerCase() === name.toLowerCase())) {
      setFormError(`Cabang "${name}" sudah terdaftar.`);
      return;
    }

    setCreating(true);
    const { data, error } = await supabase
      .from('branches')
      .insert({ name, service_type: newType, is_active: true })
      .select('id, name, service_type, is_active')
      .single();
    setCreating(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setBranches((prev) =>
      [...prev, data as BranchRecord].sort((a, b) => a.name.localeCompare(b.name))
    );
    setShowCreate(false);
    setNewName('');
    setNewType('DSC');
    notify('success', 'Cabang Ditambahkan', `${name} berhasil ditambahkan ke master cabang.`);
  };

  return (
    <>
      <PageHeading
        title="Kelola Cabang"
        subtitle="Master cabang DSC / ASC / SL"
        icon={<Building2 size={19} />}
      />

      {/* RINGKASAN */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.25rem',
        }}
      >
        {[
          { label: 'Total Cabang', value: stats.total, icon: <MapPin size={14} /> },
          { label: 'Cabang Aktif', value: stats.active, icon: <Building2 size={14} /> },
          { label: 'Sudah Ada Admin', value: stats.assigned, icon: <Users size={14} /> },
        ].map((item) => (
          <div
            key={item.label}
            className="modena-card"
            style={{ padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <span
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(218,41,28,0.1)',
                color: 'var(--accent-red)',
              }}
            >
              {item.icon}
            </span>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{item.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {item.label}
              </div>
            </div>
          </div>
        ))}
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
            placeholder="Cari nama cabang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '32px' }}
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setNewName('');
            setNewType('DSC');
            setFormError(null);
            setShowCreate(true);
          }}
          className="modena-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} /> Tambah Cabang
        </button>
      </div>

      {/* TABEL CABANG */}
      <div className="modena-card" style={{ padding: 0, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3.5rem', display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={32} color="var(--bg-dark)" className="animate-spin-custom" />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#F9FAFB' }}>
                <th style={thStyle}>Nama Cabang</th>
                <th style={thStyle}>Ruang Lingkup</th>
                <th style={thStyle}>Teknisi</th>
                <th style={thStyle}>Admin Cabang</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map((branch) => {
                const techCount = technicianCounts[branch.name] ?? 0;
                const adminCount = adminCounts[branch.name] ?? 0;
                const busy = savingId === branch.id;
                const inUse = techCount > 0 || adminCount > 0;

                return (
                  <tr key={branch.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={tdStyle}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                      >
                        <MapPin size={13} color="var(--text-muted)" />
                        {branch.name}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '2px 9px',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: 'rgba(28,28,26,0.07)',
                          color: '#1C1C1A',
                        }}
                      >
                        {branch.service_type}
                      </span>
                    </td>

                    <td style={tdStyle}>{techCount}</td>
                    <td style={tdStyle}>
                      {adminCount === 0 ? (
                        <span style={{ color: '#B45309', fontWeight: 600, fontSize: '0.775rem' }}>
                          Belum ada
                        </span>
                      ) : (
                        adminCount
                      )}
                    </td>

                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(branch)}
                        disabled={busy}
                        style={{
                          padding: '5px 13px',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          border: '1px solid transparent',
                          cursor: 'pointer',
                          backgroundColor: branch.is_active
                            ? 'var(--status-active-glow)'
                            : 'var(--status-inactive-glow)',
                          color: branch.is_active
                            ? 'var(--status-active)'
                            : 'var(--status-inactive)',
                        }}
                      >
                        {branch.is_active ? 'AKTIF' : 'NONAKTIF'}
                      </button>
                    </td>

                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                        {busy && (
                          <Loader2 size={16} className="animate-spin-custom" color="var(--text-muted)" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(branch)}
                          disabled={busy}
                          title={
                            inUse
                              ? 'Cabang masih memiliki teknisi/admin — nonaktifkan saja'
                              : 'Hapus Cabang'
                          }
                          style={{
                            padding: '5px',
                            background: 'transparent',
                            color: inUse ? 'var(--text-muted)' : 'var(--accent-red)',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredBranches.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: '3rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                    }}
                  >
                    Master cabang kosong atau tidak ada yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* CATATAN OPERASIONAL */}
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

      {/* MODAL TAMBAH CABANG */}
      {showCreate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100,
          }}
        >
          <div className="modena-card" style={{ width: '100%', maxWidth: '420px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Tambah Cabang</h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                style={{ background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  backgroundColor: 'var(--status-inactive-glow)',
                  color: 'var(--status-inactive)',
                  padding: '0.7rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {formError}
              </div>
            )}

            <form
              onSubmit={handleCreate}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label htmlFor="branch-name" style={labelStyle}>
                  Nama Cabang
                </label>
                <input
                  id="branch-name"
                  name="branch_name"
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={inputStyle}
                  placeholder="Contoh: Cirebon"
                />
              </div>

              <div>
                <label htmlFor="branch-type" style={labelStyle}>
                  Ruang Lingkup Layanan
                </label>
                <select
                  id="branch-type"
                  name="branch_type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ServiceTypeCode)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {SERVICE_SCOPES.map((scope) => (
                    <option key={scope.code} value={scope.code}>
                      {scope.code} — {scope.fullName}
                      {scope.isActive ? '' : ' (Belum Aktif)'}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="modena-btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {creating ? (
                  <Loader2 size={17} className="animate-spin-custom" />
                ) : (
                  'SIMPAN CABANG'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <NotificationModal
        notification={notification}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
      <ConfirmModal
        modal={confirmModal}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, show: false }))}
      />
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
