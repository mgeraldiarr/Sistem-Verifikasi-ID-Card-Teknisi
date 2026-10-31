// src/hooks/useBranches.ts
'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { supabase } from '@/lib/supabase';
import { DSC_BRANCHES } from '@/constants/service-center';
import { BranchRecord, ServiceTypeCode } from '@/types';

/** Daftar cabang bawaan, dipakai bila tabel `branches` belum dimigrasi/terisi. */
const FALLBACK_RECORDS: Pick<BranchRecord, 'name' | 'service_type' | 'is_active'>[] =
  DSC_BRANCHES.map((name) => ({ name, service_type: 'DSC', is_active: true }));

interface BranchStoreState {
  records: BranchRecord[];
  loading: boolean;
  usingFallback: boolean;
}

/*
 * Master cabang disimpan sekali untuk seluruh halaman (sidebar, filter, form, Kelola
 * Cabang/Akun). Setelah cabang ditambah/diubah, `refreshBranches()` memperbarui semua
 * pemakai sekaligus tanpa perlu memuat ulang halaman.
 */
let state: BranchStoreState = { records: [], loading: true, usingFallback: false };
let loaded = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: Partial<BranchStoreState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;

/** Memuat ulang master cabang dan memberi tahu semua komponen yang memakainya. */
export function refreshBranches(): Promise<void> {
  if (inflight) return inflight;

  inflight = (async () => {
    if (!loaded) setState({ loading: true });

    const { data, error } = await supabase
      .from('branches')
      .select('id, name, service_type, is_active')
      .order('name', { ascending: true });

    loaded = true;
    if (error || !data || data.length === 0) {
      setState({ records: [], usingFallback: true, loading: false });
    } else {
      setState({ records: data as BranchRecord[], usingFallback: false, loading: false });
    }
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

export interface UseBranchesResult {
  /** Nama cabang aktif untuk dropdown & navigasi */
  branchNames: string[];
  /** Nama cabang aktif dikelompokkan per lingkup layanan (DSC/ASC/SL) */
  branchesByScope: Record<ServiceTypeCode, string[]>;
  /**
   * Lingkup layanan sebuah cabang, termasuk cabang nonaktif (tidak peka huruf besar/kecil);
   * null bila tidak terdaftar
   */
  getBranchServiceType: (branch: string | null | undefined) => ServiceTypeCode | null;
  /** Baris lengkap tabel `branches` (termasuk cabang nonaktif) */
  records: BranchRecord[];
  loading: boolean;
  /** true bila data berasal dari konstanta, bukan database */
  usingFallback: boolean;
  refresh: () => Promise<void>;
}

/**
 * Membaca master cabang dari tabel `branches`.
 *
 * Bila tabel belum ada / belum terisi (database belum dimigrasi), hook ini
 * otomatis jatuh ke konstanta DSC_BRANCHES agar dashboard tetap berfungsi.
 */
export function useBranches(includeInactive = false): UseBranchesResult {
  const { records, loading, usingFallback } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );

  // Pemakai yang dipasang bersamaan berbagi satu permintaan (lihat `inflight`)
  useEffect(() => {
    refreshBranches();
  }, []);

  const allRecords = useMemo(
    () => (usingFallback ? FALLBACK_RECORDS : records),
    [usingFallback, records]
  );

  const visibleRecords = useMemo(
    () => allRecords.filter((b) => includeInactive || b.is_active),
    [allRecords, includeInactive]
  );

  const branchNames = useMemo(() => visibleRecords.map((b) => b.name), [visibleRecords]);

  const branchesByScope = useMemo(() => {
    const groups: Record<ServiceTypeCode, string[]> = { DSC: [], ASC: [], SL: [] };
    for (const b of visibleRecords) groups[b.service_type]?.push(b.name);
    return groups;
  }, [visibleRecords]);

  const getBranchServiceType = useCallback(
    (branch: string | null | undefined): ServiceTypeCode | null => {
      const clean = (branch ?? '').trim().toLowerCase();
      if (!clean) return null;
      return allRecords.find((b) => b.name.trim().toLowerCase() === clean)?.service_type ?? null;
    },
    [allRecords]
  );

  return {
    branchNames,
    branchesByScope,
    getBranchServiceType,
    records,
    loading,
    usingFallback,
    refresh: refreshBranches,
  };
}
