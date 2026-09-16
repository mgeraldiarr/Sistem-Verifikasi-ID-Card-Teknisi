// src/hooks/useTechnicianBranchCounts.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface TechnicianBranchCounts {
  /** Jumlah teknisi per nama cabang */
  counts: Record<string, number>;
  /** Total teknisi yang terlihat oleh peran pengguna saat ini */
  total: number;
  refresh: () => Promise<void>;
}

/**
 * Query ringan khusus sidebar: hanya mengambil kolom `branch` untuk menghitung
 * jumlah teknisi per cabang. RLS otomatis membatasi hasilnya pada cabang
 * milik Admin Cabang, sehingga angka yang tampil selalu sesuai hak akses.
 */
export function useTechnicianBranchCounts(enabled = true): TechnicianBranchCounts {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    const { data, error } = await supabase.from('technicians').select('branch');
    if (error || !data) return;

    const map: Record<string, number> = {};
    data.forEach((row: { branch: string | null }) => {
      if (row.branch) map[row.branch] = (map[row.branch] ?? 0) + 1;
    });

    setCounts(map);
    setTotal(data.length);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    refresh();

    // Nama channel dibedakan dari channel dashboard agar tidak saling menimpa
    const channel = supabase
      .channel('portal-sidebar-technician-counts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'technicians' },
        () => {
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, refresh]);

  return { counts, total, refresh };
}
