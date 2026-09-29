// src/app/admin/(portal)/accounts/hooks/useAccounts.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { callAdminApi } from '@/lib/admin-api';
import { supabase } from '@/lib/supabase';
import { NotificationType, UserProfile, UserRole } from '@/types';
import { ROLE_META } from '../components/role-meta';

const ACCOUNT_COLUMNS =
  'id, email, full_name, role, branch, technician_id, is_active, must_change_password, admin_id';

export interface CreateAccountInput {
  email: string;
  full_name: string;
  role: 'super_admin' | 'branch_admin';
  branch: string | null;
  password: string;
}

interface UseAccountsOptions {
  currentUserId: string | undefined;
  refreshProfile: () => Promise<void>;
  notify: (type: NotificationType, title: string, message: string) => void;
  askConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

/**
 * Data & aksi halaman Kelola Akun.
 * Ubah peran/cabang/status memakai RLS Super Admin langsung; aksi yang butuh
 * service role (buat, reset sandi, terbitkan ID, hapus) lewat /api/admin/accounts.
 */
export function useAccounts({ currentUserId, refreshProfile, notify, askConfirm }: UseAccountsOptions) {
  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const patchLocal = (id: string, patch: Partial<UserProfile>) =>
    setAccounts((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select(ACCOUNT_COLUMNS)
      .order('role', { ascending: true })
      .order('full_name', { ascending: true });

    if (error) {
      notify('error', 'Gagal Memuat Akun', error.message);
    } else {
      setAccounts((data ?? []) as UserProfile[]);
    }
    setLoading(false);
  }, [notify]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const updateAccount = async (account: UserProfile, patch: Partial<UserProfile>) => {
    setSavingId(account.id);
    const { error } = await supabase.from('user_profiles').update(patch).eq('id', account.id);
    setSavingId(null);

    if (error) {
      notify('error', 'Gagal Menyimpan', error.message);
      return;
    }

    patchLocal(account.id, patch);
    // Bila Super Admin mengubah profilnya sendiri, segarkan sesi agar UI konsisten
    if (account.id === currentUserId) await refreshProfile();
  };

  const changeRole = (account: UserProfile, nextRole: UserRole) => {
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

  const changeBranch = (account: UserProfile, branch: string | null) =>
    updateAccount(account, { branch });

  const toggleActive = (account: UserProfile) => {
    const nextActive = !account.is_active;
    askConfirm(
      nextActive ? 'Aktifkan Akun' : 'Nonaktifkan Akun',
      nextActive
        ? `Aktifkan kembali akses portal untuk ${account.full_name}?`
        : `Nonaktifkan ${account.full_name}? Sesi aktifnya akan ditolak pada permintaan berikutnya.`,
      () => updateAccount(account, { is_active: nextActive })
    );
  };

  const resetPassword = (account: UserProfile) => {
    askConfirm(
      'Atur Ulang Kata Sandi',
      `Atur ulang kata sandi ${account.full_name}? Akun wajib mengganti kata sandi pada login berikutnya.`,
      async () => {
        setSavingId(account.id);
        const result = await callAdminApi<{ password: string }>('/api/admin/accounts', 'PATCH', {
          id: account.id,
        });
        setSavingId(null);

        if (!result.ok) {
          notify('error', 'Gagal Atur Ulang', result.error);
          return;
        }

        patchLocal(account.id, { must_change_password: true });
        notify(
          'success',
          'Kata Sandi Diatur Ulang',
          `Kata sandi sementara untuk ${account.full_name}:\n\n${result.data.password}\n\nSampaikan secara pribadi. Akun wajib menggantinya saat login berikutnya.`
        );
      }
    );
  };

  /** Menerbitkan ID login (ADM-[KODE]-[NN]) untuk Admin Cabang lama yang belum memilikinya */
  const issueAdminId = async (account: UserProfile) => {
    setSavingId(account.id);
    const result = await callAdminApi<{ admin_id: string }>('/api/admin/accounts', 'PUT', {
      id: account.id,
    });
    setSavingId(null);

    if (!result.ok) {
      notify('error', 'Gagal Menerbitkan ID', result.error);
      return;
    }

    patchLocal(account.id, { admin_id: result.data.admin_id });
    notify(
      'success',
      'ID Admin Diterbitkan',
      `ID login untuk ${account.full_name}:\n\n${result.data.admin_id}\n\nSampaikan ID ini kepada admin yang bersangkutan untuk masuk ke portal.`
    );
  };

  const deleteAccount = (account: UserProfile) => {
    askConfirm(
      'Hapus Akun Permanen',
      `Hapus akun ${account.full_name} (${account.admin_id || account.email}) secara permanen? Tindakan ini tidak dapat dibatalkan.`,
      async () => {
        setSavingId(account.id);
        const result = await callAdminApi('/api/admin/accounts', 'DELETE', { id: account.id });
        setSavingId(null);

        if (!result.ok) {
          notify('error', 'Gagal Menghapus', result.error);
          return;
        }

        setAccounts((prev) => prev.filter((item) => item.id !== account.id));
        notify('success', 'Akun Dihapus', `${account.full_name} telah dihapus dari sistem.`);
      }
    );
  };

  /** Membuat akun admin baru. Mengembalikan pesan error untuk form, atau null bila sukses. */
  const createAccount = async (input: CreateAccountInput): Promise<string | null> => {
    const result = await callAdminApi<{ profile: UserProfile }>('/api/admin/accounts', 'POST', input);
    if (!result.ok) return result.error;

    const { profile } = result.data;
    setAccounts((prev) => [...prev, profile]);
    notify(
      'success',
      'Akun Dibuat',
      profile.admin_id
        ? `${profile.full_name} berhasil dibuat.\n\nID login: ${profile.admin_id}\n\nSampaikan ID ini bersama kata sandi awal. Akun wajib mengganti kata sandi saat login pertama.`
        : `${profile.full_name} berhasil dibuat. Super Admin masuk memakai email MODENA. Akun wajib mengganti kata sandi awal saat login pertama.`
    );
    return null;
  };

  return {
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
  };
}
