// src/hooks/useBranches.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DSC_BRANCHES } from '@/constants/service-center';
import { BranchRecord } from '@/types';

/** Daftar cabang bawaan, dipakai bila tabel `branches` belum dimigrasi/terisi. */
const FALLBACK_BRANCHES: string[] = [...DSC_BRANCHES];

export interface UseBranchesResult {
  /** Nama cabang aktif untuk dropdown & navigasi */
  branchNames: string[];
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
  const [records, setRecords] = useState<BranchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchBranches = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('branches')
      .select('id, name, service_type, is_active')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      setRecords([]);
      setUsingFallback(true);
    } else {
      setRecords(data as BranchRecord[]);
      setUsingFallback(false);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const branchNames = usingFallback
    ? FALLBACK_BRANCHES
    : records
        .filter((b) => includeInactive || b.is_active)
        .map((b) => b.name);

  return {
    branchNames,
    records,
    loading,
    usingFallback,
    refresh: fetchBranches,
  };
}
