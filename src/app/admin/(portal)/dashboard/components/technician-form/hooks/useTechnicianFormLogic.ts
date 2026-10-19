// src/app/admin/(portal)/dashboard/components/technician-form/hooks/useTechnicianFormLogic.ts
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getBranchCode, getNextSequenceNumber } from '@/constants/branch-codes';
import { getServiceCenterOptions } from '@/constants/service-center';
import { useBranches } from '@/hooks/useBranches';
import { calculateWeightedKpi, determineTechnicianLevel, KpiWeights } from '@/lib/kpi';
import { sanitizeOrFilterValue } from '@/lib/postgrest-filters';
import { supabase } from '@/lib/supabase';
import { ServiceTypeCode, TechnicianFormData } from '@/types';

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
 * - ID teknisi [LINGKUP]-[KODE]-[NNN] (DSC/ASC/SL) dibuat dari nomor urut tertinggi
 *   lingkup tersebut di database
 * - Lingkup layanan mengikuti master cabang bila cabang terdaftar di tabel `branches`
 * - Service Center bawaan mengikuti cabang & lingkup yang dipilih
 */
export function useTechnicianFormLogic({
  show,
  formId,
  formData,
  setFormData,
  kpiWeights,
}: UseTechnicianFormLogicOptions) {
  const [generatingId, setGeneratingId] = useState(false);
  const { branchesByScope, getBranchServiceType } = useBranches();

  // Saran cabang di form hanya untuk lingkup yang sedang dipilih
  const branchOptions = branchesByScope[formData.service_type] ?? [];

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
    async (branchName: string, serviceType: ServiceTypeCode) => {
      if (!branchName || !branchName.trim()) return;
      const code = getBranchCode(branchName);
      if (!code || code === 'MOD') return;

      const safeBranch = sanitizeOrFilterValue(branchName);
      // Format lama MOD-[KODE]- hanya dipakai teknisi DSC
      const legacyFilter = serviceType === 'DSC' ? `,technician_id.ilike.MOD-${code}-%` : '';

      // Hasil hanya dipakai bila cabang & lingkup belum diganti selama query berjalan
      const applyId = (id: string) =>
        setFormData((prev) =>
          prev.branch === branchName && prev.service_type === serviceType
            ? { ...prev, technician_id: id, card_number: id }
            : prev
        );

      setGeneratingId(true);
      try {
        // Teknisi cabang ini, atau yang ber-ID [LINGKUP]-[KODE]-
        const { data, error } = await supabase
          .from('technicians')
          .select('technician_id')
          .or(
            `branch.ilike.%${safeBranch}%,technician_id.ilike.${serviceType}-${code}-%${legacyFilter}`
          );

        const existingIds = !error && data ? data.map((r) => r.technician_id).filter(Boolean) : [];
        // Nomor seri kartu selalu sama dengan ID teknisi
        applyId(`${serviceType}-${code}-${getNextSequenceNumber(existingIds, code, serviceType)}`);
      } catch (err) {
        console.error('Gagal mengambil urutan nomor ID teknisi:', err);
        applyId(`${serviceType}-${code}-001`);
      } finally {
        setGeneratingId(false);
      }
    },
    [setFormData]
  );

  // Lingkup data baru mengikuti master cabang, termasuk cabang Admin Cabang yang
  // sudah terisi sebelum master cabang selesai dimuat
  const branchScope = getBranchServiceType(formData.branch);
  useEffect(() => {
    if (!show || formId || !branchScope || branchScope === formData.service_type) return;
    setFormData((prev) => ({
      ...prev,
      service_type: branchScope,
      technician_id: '',
      card_number: '',
      service_center: '',
    }));
  }, [show, formId, branchScope, formData.service_type, setFormData]);

  // Data baru tanpa ID (cabang/lingkup baru dipilih): buatkan ID & pilih Service Center
  useEffect(() => {
    if (!show || formId || !formData.branch) return;
    if (branchScope && branchScope !== formData.service_type) return;

    if (!formData.technician_id && !generatingId) {
      generateTechnicianId(formData.branch, formData.service_type);
    }
    if (!formData.service_center) {
      const options = getServiceCenterOptions(formData.branch, formData.service_type);
      if (options.length > 0) setFormData((prev) => ({ ...prev, service_center: options[0] }));
    }
  }, [
    show,
    formId,
    branchScope,
    formData.branch,
    formData.service_type,
    formData.technician_id,
    formData.service_center,
    generatingId,
    generateTechnicianId,
    setFormData,
  ]);

  /**
   * Ganti cabang: Service Center berganti; data baru juga mengikuti lingkup master cabang
   * dan mendapat ID baru. Data lama mempertahankan lingkupnya agar tetap sesuai prefiks ID.
   */
  const changeBranch = (newBranch: string) => {
    const serviceType = formId
      ? formData.service_type
      : getBranchServiceType(newBranch) ?? formData.service_type;
    const autoServiceCenter = getServiceCenterOptions(newBranch, serviceType)[0] || '';
    setFormData((prev) => ({
      ...prev,
      branch: newBranch,
      service_type: serviceType,
      service_center: autoServiceCenter,
      // Data baru: ID dikosongkan lalu dibuat ulang oleh effect di atas
      ...(formId ? {} : { technician_id: '', card_number: '' }),
    }));
  };

  /** Ganti lingkup (hanya data baru): cabang milik lingkup lain dikosongkan, ID dibuat ulang */
  const changeServiceType = (serviceType: ServiceTypeCode) => {
    if (formId) return;
    const branchScope = getBranchServiceType(formData.branch);
    const branch = branchScope && branchScope !== serviceType ? '' : formData.branch;

    setFormData((prev) => ({
      ...prev,
      service_type: serviceType,
      branch,
      service_center: getServiceCenterOptions(branch, serviceType)[0] || '',
      technician_id: '',
      card_number: '',
    }));
  };

  return {
    liveKpiScore,
    liveLevel,
    generatingId,
    branchOptions,
    changeBranch,
    changeServiceType,
  };
}
