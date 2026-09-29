// src/app/admin/(portal)/dashboard/components/technician-form/hooks/useTechnicianFormLogic.ts
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getBranchCode, getNextSequenceNumber } from '@/constants/branch-codes';
import { getDscServiceCenterOptions } from '@/constants/service-center';
import { calculateWeightedKpi, determineTechnicianLevel, KpiWeights } from '@/lib/kpi';
import { sanitizeOrFilterValue } from '@/lib/postgrest-filters';
import { supabase } from '@/lib/supabase';
import { TechnicianFormData } from '@/types';

interface UseTechnicianFormLogicOptions {
  show: boolean;
  formId: string | null;
  formData: TechnicianFormData;
  setFormData: React.Dispatch<React.SetStateAction<TechnicianFormData>>;
  kpiWeights: KpiWeights;
}

/**
 * Logika otomatis form teknisi:
 * - skor KPI terbobot & level (terkunci) dihitung ulang setiap indikator berubah
 * - ID teknisi DSC-[KODE]-[NNN] dibuat dari nomor urut tertinggi di database
 * - Service Center bawaan mengikuti cabang yang dipilih
 */
export function useTechnicianFormLogic({
  show,
  formId,
  formData,
  setFormData,
  kpiWeights,
}: UseTechnicianFormLogicOptions) {
  const [generatingId, setGeneratingId] = useState(false);

  const liveKpiScore = useMemo(
    () =>
      calculateWeightedKpi(
        {
          tat: formData.tat,
          rtat: formData.rtat,
          csat: formData.csat,
          grooming_score: formData.grooming_score,
          service_score: formData.service_score,
          repair_quality_score: formData.repair_quality_score,
        },
        kpiWeights
      ),
    [
      kpiWeights,
      formData.tat,
      formData.rtat,
      formData.csat,
      formData.grooming_score,
      formData.service_score,
      formData.repair_quality_score,
    ]
  );

  // < 70 Beginner, 70-84 Intermediate, >= 85 Advance
  const liveLevel = useMemo(() => determineTechnicianLevel(liveKpiScore), [liveKpiScore]);

  // Skor dicek terpisah dari level karena skor bisa berubah tanpa berpindah level
  // (misal 72 -> 80 tetap intermediate).
  useEffect(() => {
    if (formData.technician_level !== liveLevel || formData.performance_score !== liveKpiScore) {
      setFormData((prev) => ({
        ...prev,
        technician_level: liveLevel,
        performance_score: liveKpiScore,
      }));
    }
  }, [liveLevel, liveKpiScore, formData.technician_level, formData.performance_score, setFormData]);

  const generateTechnicianId = useCallback(
    async (branchName: string) => {
      if (!branchName || !branchName.trim()) return;
      const code = getBranchCode(branchName);
      if (!code || code === 'MOD') return;

      const safeBranch = sanitizeOrFilterValue(branchName);

      setGeneratingId(true);
      try {
        // Teknisi cabang ini, atau yang ber-ID DSC-[KODE]- / MOD-[KODE]- (format lama)
        const { data, error } = await supabase
          .from('technicians')
          .select('technician_id')
          .or(
            `branch.ilike.%${safeBranch}%,technician_id.ilike.DSC-${code}-%,technician_id.ilike.MOD-${code}-%`
          );

        const existingIds = !error && data ? data.map((r) => r.technician_id).filter(Boolean) : [];
        const formattedId = `DSC-${code}-${getNextSequenceNumber(existingIds, code)}`;

        // Nomor seri kartu selalu sama dengan ID teknisi
        setFormData((prev) => ({ ...prev, technician_id: formattedId, card_number: formattedId }));
      } catch (err) {
        console.error('Gagal mengambil urutan nomor ID teknisi:', err);
        const fallbackId = `DSC-${code}-001`;
        setFormData((prev) => ({ ...prev, technician_id: fallbackId, card_number: fallbackId }));
      } finally {
        setGeneratingId(false);
      }
    },
    [setFormData]
  );

  // Data baru dengan cabang bawaan: langsung buatkan ID & pilih Service Center
  useEffect(() => {
    if (!show || formId || !formData.branch) return;

    if (!formData.technician_id) generateTechnicianId(formData.branch);
    if (!formData.service_center) {
      const options = getDscServiceCenterOptions(formData.branch);
      if (options.length > 0) setFormData((prev) => ({ ...prev, service_center: options[0] }));
    }
  }, [
    show,
    formId,
    formData.branch,
    formData.technician_id,
    formData.service_center,
    generateTechnicianId,
    setFormData,
  ]);

  /** Ganti cabang: Service Center ikut berganti, dan data baru mendapat ID baru */
  const changeBranch = (newBranch: string) => {
    const autoServiceCenter = getDscServiceCenterOptions(newBranch)[0] || '';
    setFormData((prev) => ({ ...prev, branch: newBranch, service_center: autoServiceCenter }));

    if (!formId && newBranch.trim()) generateTechnicianId(newBranch);
  };

  return { liveKpiScore, liveLevel, generatingId, changeBranch };
}
