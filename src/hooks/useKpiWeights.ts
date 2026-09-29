// src/hooks/useKpiWeights.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  DEFAULT_KPI_WEIGHTS,
  KPI_SETTINGS_KEY,
  KpiSettingsRow,
  KpiWeights,
  getKpiWeights,
  kpiWeightsFromRow,
  kpiWeightsToRow,
  saveKpiWeights,
  validateKpiWeights,
} from '@/lib/kpi';

export interface UseKpiWeightsResult {
  /** Bobot aktif (persentase, total 100) */
  weights: KpiWeights;
  loading: boolean;
  /** true bila tabel `kpi_settings` belum ada / tidak terbaca (memakai bobot bawaan) */
  usingFallback: boolean;
  refresh: () => Promise<void>;
  /** Menyimpan bobot baru ke database. Mengembalikan pesan error, atau null bila sukses. */
  save: (next: KpiWeights) => Promise<string | null>;
}

/**
 * Membaca bobot KPI sistem dari tabel `kpi_settings`.
 *
 * Database adalah sumber kebenaran agar semua admin menilai dengan bobot yang sama.
 * Hasilnya juga disalin ke localStorage sehingga `getKpiWeights()` (dipakai sebagai
 * bobot bawaan `calculateWeightedKpi`) ikut memakai nilai terbaru.
 */
export function useKpiWeights(): UseKpiWeightsResult {
  // Mulai dari salinan lokal terakhir agar skor tidak "berkedip" saat memuat
  const [weights, setWeights] = useState<KpiWeights>(() => getKpiWeights());
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchWeights = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('kpi_settings')
      .select(
        'tat_weight, rtat_weight, csat_weight, grooming_weight, service_weight, repair_quality_weight'
      )
      .eq('setting_key', KPI_SETTINGS_KEY)
      .maybeSingle();

    const parsed = data ? kpiWeightsFromRow(data as KpiSettingsRow) : null;

    if (error || !parsed || !validateKpiWeights(parsed).isValid) {
      setWeights(DEFAULT_KPI_WEIGHTS);
      setUsingFallback(true);
    } else {
      setWeights(parsed);
      setUsingFallback(false);
      saveKpiWeights(parsed);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWeights();
  }, [fetchWeights]);

  const save = useCallback(async (next: KpiWeights): Promise<string | null> => {
    const validation = validateKpiWeights(next);
    if (!validation.isValid) return validation.message ?? 'Total bobot wajib 100%.';

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('kpi_settings').upsert(
      {
        setting_key: KPI_SETTINGS_KEY,
        ...kpiWeightsToRow(next),
        updated_by: user?.id ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'setting_key' }
    );

    if (error) return error.message;

    setWeights(next);
    setUsingFallback(false);
    saveKpiWeights(next);
    return null;
  }, []);

  return { weights, loading, usingFallback, refresh: fetchWeights, save };
}
