// src/app/admin/(portal)/branches/hooks/useManagedBranches.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BranchRecord, NotificationType, ServiceTypeCode } from '@/types';

const BRANCH_COLUMNS = 'id, name, service_type, is_active';

interface UseManagedBranchesOptions {
  notify: (type: NotificationType, title: string, message: string) => void;
  askConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

/** Hitung jumlah baris per cabang (kolom `branch` berupa teks, bukan foreign key). */
function countByBranch<T extends { branch: string | null }>(
  rows: T[],
  include: (row: T) => boolean = () => true
): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    if (row.branch && include(row)) acc[row.branch] = (acc[row.branch] ?? 0) + 1;
    return acc;
  }, {});
}

/** Data & aksi master cabang untuk halaman Kelola Cabang (khusus Super Admin). */
export function useManagedBranches({ notify, askConfirm }: UseManagedBranchesOptions) {
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [technicianCounts, setTechnicianCounts] = useState<Record<string, number>>({});
  const [adminCounts, setAdminCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);

    const [branchRes, techRes, adminRes] = await Promise.all([
      supabase.from('branches').select(BRANCH_COLUMNS).order('name', { ascending: true }),
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

    setTechnicianCounts(countByBranch(techRes.data ?? []));
    setAdminCounts(countByBranch(adminRes.data ?? [], (row) => row.role === 'branch_admin'));
    setLoading(false);
  }, [notify]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const stats = useMemo(
    () => ({
      total: branches.length,
      active: branches.filter((b) => b.is_active).length,
      assigned: branches.filter((b) => (adminCounts[b.name] ?? 0) > 0).length,
    }),
    [branches, adminCounts]
  );

  const toggleActive = (branch: BranchRecord) => {
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

  const deleteBranch = (branch: BranchRecord) => {
    const techCount = technicianCounts[branch.name] ?? 0;
    const adminCount = adminCounts[branch.name] ?? 0;

    // Menghapus cabang yang masih dipakai akan meninggalkan data yatim
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
        // `.select()` wajib agar penolakan RLS (0 baris terhapus) terdeteksi
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

  /** Menambah cabang baru. Mengembalikan pesan error untuk form, atau null bila sukses. */
  const createBranch = async (rawName: string, serviceType: ServiceTypeCode): Promise<string | null> => {
    const name = rawName.trim().replace(/\s+/g, ' ');
    if (!name) return 'Nama cabang wajib diisi.';
    if (branches.some((b) => b.name.toLowerCase() === name.toLowerCase())) {
      return `Cabang "${name}" sudah terdaftar.`;
    }

    const { data, error } = await supabase
      .from('branches')
      .insert({ name, service_type: serviceType, is_active: true })
      .select(BRANCH_COLUMNS)
      .single();

    if (error) return error.message;

    setBranches((prev) =>
      [...prev, data as BranchRecord].sort((a, b) => a.name.localeCompare(b.name))
    );
    notify('success', 'Cabang Ditambahkan', `${name} berhasil ditambahkan ke master cabang.`);
    return null;
  };

  return {
    branches,
    technicianCounts,
    adminCounts,
    loading,
    savingId,
    stats,
    toggleActive,
    deleteBranch,
    createBranch,
  };
}
