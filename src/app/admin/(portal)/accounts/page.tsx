// src/app/admin/accounts/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Crown,
  Building2,
  Wrench,
  KeyRound,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserCog,
  X,
} from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { NotificationModal } from '@/components/ui/NotificationModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { supabase } from '@/lib/supabase';
import { useBranches } from '@/hooks/useBranches';
import { SuperAdminOnly, usePortal } from '../portal-context';
import {
  ConfirmModalState,
  NotificationState,
  NotificationType,
  UserProfile,
  UserRole,
} from '@/types';

const ROLE_META: Record<UserRole, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  super_admin: {
    label: 'Super Admin',
    bg: 'rgba(218,41,28,0.12)',
    color: '#B51F15',
    icon: <Crown size={12} />,
  },
  branch_admin: {
    label: 'Admin Cabang',
    bg: 'rgba(59,130,246,0.12)',
    color: '#1D4ED8',
    icon: <Building2 size={12} />,
  },
  technician: {
    label: 'Teknisi',
    bg: 'rgba(16,185,129,0.12)',
    color: '#047857',
    icon: <Wrench size={12} />,
  },
};

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

const controlStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  fontSize: '0.775rem',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  cursor: 'pointer',
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

interface CreateFormState {
  email: string;
  full_name: string;
  role: 'super_admin' | 'branch_admin';
  branch: string;
  password: string;
}

const EMPTY_FORM: CreateFormState = {
  email: '',
  full_name: '',
  role: 'branch_admin',
  branch: '',
  password: '',
};

function ManageAccountsContent() {
  const { profile, refreshProfile } = usePortal();
  const { branchNames } = useBranches();

  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateFormState>(EMPTY_FORM);
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

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, role, branch, technician_id, is_active, must_change_password')
      .order('role', { ascending: true })
      .order('full_name', { ascending: true });

    if (error) {
      notify('error', 'Gagal Memuat Akun', error.message);
    } else {
      setAccounts((data ?? []) as UserProfile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filteredAccounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return accounts.filter((acc) => {
      const matchesSearch =
        q === '' ||
        acc.full_name.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        (acc.branch ?? '').toLowerCase().includes(q);
      const matchesRole = roleFilter === '' || acc.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [accounts, searchQuery, roleFilter]);

  const roleCounts = useMemo(() => {
    return accounts.reduce<Record<string, number>>((acc, item) => {
      acc[item.role] = (acc[item.role] ?? 0) + 1;
      return acc;
    }, {});
  }, [accounts]);

  /** Simpan perubahan peran / cabang / status langsung lewat RLS Super Admin */
  const updateAccount = async (account: UserProfile, patch: Partial<UserProfile>) => {
    setSavingId(account.id);

    const { error } = await supabase
      .from('user_profiles')
      .update(patch)
      .eq('id', account.id);

    setSavingId(null);

    if (error) {
      notify('error', 'Gagal Menyimpan', error.message);
      return;
    }

    setAccounts((prev) =>
      prev.map((item) => (item.id === account.id ? { ...item, ...patch } : item))
    );

    // Bila Super Admin mengubah profilnya sendiri, segarkan sesi agar UI konsisten
    if (account.id === profile?.id) await refreshProfile();
  };

  const handleRoleChange = (account: UserProfile, nextRole: UserRole) => {
    if (nextRole === account.role) return;

    if (nextRole === 'branch_admin' && !account.branch) {
      notify(
        'warning',
        'Cabang Belum Dipilih',
        'Tetapkan cabang penugasan terlebih dahulu sebelum mengubah peran menjadi Admin Cabang.'
      );
      return;
    }

    askConfirm(
      'Ubah Peran Akun',
      `Ubah peran ${account.full_name} menjadi ${ROLE_META[nextRole].label}?`,
      () => updateAccount(account, { role: nextRole })
    );
  };

  const handleToggleActive = (account: UserProfile) => {
    const nextActive = !account.is_active;
    askConfirm(
      nextActive ? 'Aktifkan Akun' : 'Nonaktifkan Akun',
      nextActive
        ? `Aktifkan kembali akses portal untuk ${account.full_name}?`
        : `Nonaktifkan ${account.full_name}? Sesi aktifnya akan ditolak pada permintaan berikutnya.`,
      () => updateAccount(account, { is_active: nextActive })
    );
  };

  const handleResetPassword = (account: UserProfile) => {
    askConfirm(
      'Atur Ulang Kata Sandi',
      `Atur ulang kata sandi ${account.full_name}? Akun wajib mengganti kata sandi pada login berikutnya.`,
      async () => {
        setSavingId(account.id);
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          const res = await fetch('/api/admin/accounts', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token ?? ''}`,
            },
            body: JSON.stringify({ id: account.id }),
          });

          const payload = await res.json();
          if (!res.ok) {
            notify('error', 'Gagal Atur Ulang', payload.error ?? 'Terjadi kesalahan.');
            return;
          }

          setAccounts((prev) =>
            prev.map((item) =>
              item.id === account.id ? { ...item, must_change_password: true } : item
            )
          );

          notify(
            'success',
            'Kata Sandi Diatur Ulang',
            `Kata sandi sementara untuk ${account.full_name}:\n\n${payload.password}\n\nSampaikan secara pribadi. Akun wajib menggantinya saat login berikutnya.`
          );
        } catch {
          notify('error', 'Gagal Terhubung', 'Tidak dapat menghubungi server.');
        } finally {
          setSavingId(null);
        }
      }
    );
  };

  const handleDelete = (account: UserProfile) => {
    askConfirm(
      'Hapus Akun Permanen',
      `Hapus akun ${account.full_name} (${account.email}) secara permanen? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        setSavingId(account.id);
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          const res = await fetch('/api/admin/accounts', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token ?? ''}`,
            },
            body: JSON.stringify({ id: account.id }),
          });

          const payload = await res.json();
          if (!res.ok) {
            notify('error', 'Gagal Menghapus', payload.error ?? 'Terjadi kesalahan.');
            return;
          }

          setAccounts((prev) => prev.filter((item) => item.id !== account.id));
          notify('success', 'Akun Dihapus', `${account.full_name} telah dihapus dari sistem.`);
        } catch {
          notify('error', 'Gagal Terhubung', 'Tidak dapat menghubungi server.');
        } finally {
          setSavingId(null);
        }
      }
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (form.role === 'branch_admin' && !form.branch) {
      setFormError('Admin Cabang wajib memiliki cabang penugasan.');
      return;
    }
    if (form.password.length < 8) {
      setFormError('Kata sandi awal minimal 8 karakter.');
      return;
    }

    setCreating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch('/api/admin/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({
          email: form.email,
          full_name: form.full_name,
          role: form.role,
          branch: form.role === 'branch_admin' ? form.branch : null,
          password: form.password,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        setFormError(payload.error ?? 'Gagal membuat akun.');
        return;
      }

      setAccounts((prev) => [...prev, payload.profile as UserProfile]);
      setShowCreate(false);
      setForm(EMPTY_FORM);
      notify(
        'success',
        'Akun Dibuat',
        `${payload.profile.full_name} berhasil dibuat. Akun wajib mengganti kata sandi awal saat login pertama.`
      );
    } catch {
      setFormError('Tidak dapat menghubungi server.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <PageHeading
        title="Kelola Akun"
        subtitle="Pengguna resmi portal MODENA"
        icon={<UserCog size={19} />}
      />

      {/* RINGKASAN PERAN */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.25rem',
        }}
      >
        {(Object.keys(ROLE_META) as UserRole[]).map((role) => (
          <div
            key={role}
            className="modena-card"
            style={{
              padding: '0.9rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: ROLE_META[role].bg,
                color: ROLE_META[role].color,
              }}
            >
              {ROLE_META[role].icon}
            </span>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {roleCounts[role] ?? 0}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {ROLE_META[role].label}
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
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            flex: 1,
            minWidth: '260px',
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
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
              id="account-search"
              name="account_search"
              type="text"
              placeholder="Cari nama, email, atau cabang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '32px' }}
            />
          </div>

          <select
            id="account-role-filter"
            name="account_role_filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ ...controlStyle, padding: '0.6rem 0.7rem', minWidth: '150px' }}
          >
            <option value="">Semua Peran</option>
            <option value="super_admin">Super Admin</option>
            <option value="branch_admin">Admin Cabang</option>
            <option value="technician">Teknisi</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM);
            setFormError(null);
            setShowCreate(true);
          }}
          className="modena-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} /> Tambah Akun Admin
        </button>
      </div>

      {/* TABEL AKUN */}
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
              {filteredAccounts.map((account) => {
                const isSelf = account.id === profile?.id;
                const isTechnician = account.role === 'technician';
                const busy = savingId === account.id;

                return (
                  <tr key={account.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {account.email}
                      </div>
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

                    <td style={tdStyle}>
                      {/* Peran teknisi tidak dapat diubah dari sini agar tautan ke data teknisi tetap konsisten */}
                      {isTechnician || isSelf ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 9px',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            backgroundColor: ROLE_META[account.role].bg,
                            color: ROLE_META[account.role].color,
                          }}
                          title={
                            isSelf
                              ? 'Peran akun sendiri tidak dapat diubah'
                              : 'Peran teknisi mengikuti data teknisi tertaut'
                          }
                        >
                          {ROLE_META[account.role].icon}
                          {ROLE_META[account.role].label}
                        </span>
                      ) : (
                        <select
                          value={account.role}
                          disabled={busy}
                          onChange={(e) => handleRoleChange(account, e.target.value as UserRole)}
                          style={controlStyle}
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="branch_admin">Admin Cabang</option>
                        </select>
                      )}
                    </td>

                    <td style={tdStyle}>
                      {isTechnician ? (
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {account.branch || '-'}
                        </span>
                      ) : (
                        <select
                          value={account.branch ?? ''}
                          disabled={busy}
                          onChange={(e) =>
                            updateAccount(account, { branch: e.target.value || null })
                          }
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

                    <td style={tdStyle}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(account)}
                        disabled={busy || isSelf}
                        title={
                          isSelf ? 'Anda tidak dapat menonaktifkan akun sendiri' : 'Ubah status akun'
                        }
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
                          color: account.is_active
                            ? 'var(--status-active)'
                            : 'var(--status-inactive)',
                        }}
                      >
                        {account.is_active ? 'AKTIF' : 'NONAKTIF'}
                      </button>
                    </td>

                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                        {busy && (
                          <Loader2 size={16} className="animate-spin-custom" color="var(--text-muted)" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleResetPassword(account)}
                          disabled={busy}
                          title="Atur Ulang Kata Sandi"
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
                          onClick={() => handleDelete(account)}
                          disabled={busy || isSelf}
                          title={isSelf ? 'Anda tidak dapat menghapus akun sendiri' : 'Hapus Akun'}
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
              })}

              {filteredAccounts.length === 0 && (
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

      {/* MODAL TAMBAH AKUN */}
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
          <div className="modena-card" style={{ width: '100%', maxWidth: '440px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                Tambah Akun Admin
              </h2>
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
                <label htmlFor="new-full-name" style={labelStyle}>
                  Nama Lengkap
                </label>
                <input
                  id="new-full-name"
                  name="new_full_name"
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  style={inputStyle}
                  placeholder="Budi Santoso"
                />
              </div>

              <div>
                <label htmlFor="new-email" style={labelStyle}>
                  Email
                </label>
                <input
                  id="new-email"
                  name="new_email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  style={inputStyle}
                  placeholder="admin.bali@modena.com"
                />
              </div>

              <div>
                <label htmlFor="new-role" style={labelStyle}>
                  Peran
                </label>
                <select
                  id="new-role"
                  name="new_role"
                  value={form.role}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      role: e.target.value as CreateFormState['role'],
                    }))
                  }
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="branch_admin">Admin Cabang</option>
                  <option value="super_admin">Super Admin (Nasional)</option>
                </select>
              </div>

              {form.role === 'branch_admin' && (
                <div>
                  <label htmlFor="new-branch" style={labelStyle}>
                    Cabang Penugasan
                  </label>
                  <select
                    id="new-branch"
                    name="new_branch"
                    required
                    value={form.branch}
                    onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">— Pilih Cabang —</option>
                    {branchNames.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="new-password" style={labelStyle}>
                  Kata Sandi Awal
                </label>
                <input
                  id="new-password"
                  name="new_password"
                  type="text"
                  required
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  style={inputStyle}
                  placeholder="Minimal 8 karakter"
                />
                <p
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.4rem',
                    lineHeight: 1.5,
                  }}
                >
                  Sampaikan kata sandi ini secara pribadi. Akun wajib menggantinya saat
                  login pertama.
                </p>
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
                  'BUAT AKUN'
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

export default function ManageAccountsPage() {
  // Layout portal sudah memastikan pengguna adalah admin aktif;
  // halaman ini mempersempit lagi ke Super Admin.
  return (
    <SuperAdminOnly>
      <ManageAccountsContent />
    </SuperAdminOnly>
  );
}
