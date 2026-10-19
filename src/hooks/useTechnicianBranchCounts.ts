// src/hooks/useTechnicianBranchCounts.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { getTechnicianServiceType } from '@/constants/service-center';
import { supabase } from '@/lib/supabase';
import { ServiceTypeCode } from '@/types';

interface CountRow {
  branch: string | null;
  technician_id?: string | null;
  service_type?: string | null;
}

export interface TechnicianBranchCounts {
  /** Jumlah teknisi per nama cabang */
  counts: Record<string, number>;
  /** Jumlah teknisi per lingkup layanan */
  scopeCounts: Record<ServiceTypeCode, number>;
  /** Total teknisi yang terlihat oleh peran pengguna saat ini */
  total: number;
  refresh: () => Promise<void>;
}

/**
 * Query ringan khusus sidebar: hanya mengambil kolom cabang & lingkup untuk menghitung
 * jumlah teknisi per cabang dan per lingkup layanan. RLS otomatis membatasi hasilnya pada cabang
 * milik Admin Cabang, sehingga angka yang tampil selalu sesuai hak akses.
 */
export function useTechnicianBranchCounts(enabled = true): TechnicianBranchCounts {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [scopeCounts, setScopeCounts] = useState<Record<ServiceTypeCode, number>>({
    DSC: 0,
    ASC: 0,
    SL: 0,
  });
  const [total, setTotal] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    let result = await supabase
      .from('technicians')
      .select('branch, technician_id, service_type')
      .returns<CountRow[]>();
    // Database lama tanpa kolom service_type: lingkup diambil dari prefiks ID
    if (result.error) {
      result = await supabase.from('technicians').select('branch, technician_id').returns<CountRow[]>();
    }
    const { data, error } = result;
    if (error || !data) return;

    const map: Record<string, number> = {};
    const byScope: Record<ServiceTypeCode, number> = { DSC: 0, ASC: 0, SL: 0 };
    data.forEach((row) => {
      if (row.branch) map[row.branch] = (map[row.branch] ?? 0) + 1;
      byScope[getTechnicianServiceType(row)] += 1;
    });

    setCounts(map);
    setScopeCounts(byScope);
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

  return { counts, scopeCounts, total, refresh };
}
