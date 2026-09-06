// src/app/admin/dashboard/hooks/useDashboardData.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SyncLog, Technician } from '@/types';

export function useDashboardData() {
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
    setLoading(true);
    const isAuthenticated = await checkSession();
    if (!isAuthenticated) return;

    try {
      // Fetch log sinkronisasi terakhir
      const { data: syncData } = await supabase
        .from('sync_logs')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (syncData) setLastSyncLog(syncData as SyncLog);

      // Fetch data teknisi beserta performa terbaru & kartu
      const { data: techData, error } = await supabase
        .from('technicians')
        .select(
          `
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
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching technicians:', error);
      }
      if (techData) {
        setTechnicians(techData as unknown as Technician[]);
      }
    } finally {
      setLoading(false);
    }
  }, [checkSession]);

  useEffect(() => {
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
  }, [fetchData]);

  return {
    technicians,
    setTechnicians,
    lastSyncLog,
    setLastSyncLog,
    loading,
    fetchData,
  };
}
