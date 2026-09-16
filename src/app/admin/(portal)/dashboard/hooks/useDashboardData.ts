// src/app/admin/dashboard/hooks/useDashboardData.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SyncLog, Technician } from '@/types';

interface UseDashboardDataOptions {
  /**
   * Cabang yang dipaksakan pada seluruh query (isolasi data Admin Cabang).
   * null = akses nasional (Super Admin).
   */
  scopedBranch?: string | null;
  /** Tunda pengambilan data sampai profil peran selesai dimuat */
  enabled?: boolean;
}

export function useDashboardData({
  scopedBranch = null,
  enabled = true,
}: UseDashboardDataOptions = {}) {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [lastSyncLog, setLastSyncLog] = useState<SyncLog | null>(null);
  const [loading, setLoading] = useState(true);

  // Cek Sesi Login Admin
  const checkSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return false;
    }
    return true;
  }, [router]);

  // Mengambil data teknisi & log sinkronisasi terakhir dari database
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    const isAuthenticated = await checkSession();
    if (!isAuthenticated) return;

    try {
      // Fetch log sinkronisasi terakhir (disaring per cabang untuk Admin Cabang)
      const buildSyncQuery = (withBranchFilter: boolean) => {
        let q = supabase.from('sync_logs').select('*');
        if (withBranchFilter && scopedBranch) q = q.eq('branch', scopedBranch);
        return q.order('start_time', { ascending: false }).limit(1).maybeSingle();
      };

      let { data: syncData, error: syncError } = await buildSyncQuery(true);

      // Fallback bila kolom `branch` belum ada di sync_logs (database belum dimigrasi)
      if (syncError && scopedBranch) {
        const retry = await buildSyncQuery(false);
        syncData = retry.data;
        syncError = retry.error;
      }

      setLastSyncLog(syncData ? (syncData as SyncLog) : null);

      // Fetch data teknisi beserta performa terbaru & kartu
      // (dengan fallback query otomatis jika database belum dimigrasi)
      const buildTechQuery = (selectClause: string) => {
        let q = supabase.from('technicians').select(selectClause);
        // Isolasi data cabang: Admin Cabang tidak pernah menarik data cabang lain
        if (scopedBranch) q = q.eq('branch', scopedBranch);
        return q.order('created_at', { ascending: false });
      };

      const FULL_SELECT = `
          *,
          technician_performance (
            period,
            kpi_score,
            csi_score,
            performance_score,
            performance_level,
            tat,
            rtat,
            csat,
            grooming_score,
            service_score,
            repair_quality_score
          ),
          technician_id_cards!technician_id_cards_technician_id_fkey (
            card_number,
            card_status,
            expiry_date
          )
        `;

      const BASIC_SELECT = `
            *,
            technician_performance (
              period,
              kpi_score,
              csi_score,
              performance_score,
              performance_level
            ),
            technician_id_cards!technician_id_cards_technician_id_fkey (
              card_number,
              card_status,
              expiry_date
            )
          `;

      let { data: techData, error } = await buildTechQuery(FULL_SELECT);

      if (error) {
        // Jika kolom baru belum ada di Supabase, fallback ke skema dasar agar dashboard tetap berfungsi normal
        const fallbackRes = await buildTechQuery(BASIC_SELECT);

        if (!fallbackRes.error) {
          techData = fallbackRes.data;
          error = null;
        } else {
          console.error('Error fetching technicians:', error);
        }
      }

      if (techData) {
        setTechnicians(techData as unknown as Technician[]);
      }
    } finally {
      setLoading(false);
    }
  }, [checkSession, enabled, scopedBranch]);

  useEffect(() => {
    if (!enabled) return;

    fetchData();

    // Subscribe to realtime database changes for synchronization
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'technicians' }, () => {
        fetchData();
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'technician_performance' },
        () => {
          fetchData();
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sync_logs' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, fetchData]);

  return {
    technicians,
    setTechnicians,
    lastSyncLog,
    setLastSyncLog,
    loading,
    fetchData,
  };
}
