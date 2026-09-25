// src/app/admin/dashboard/components/TechnicianFormModal.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Calendar,
  Lock,
  Loader2,
  Sparkles,
  X,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { TechnicianFormData, TechnicianStatus } from '@/types';
import { DSC_BRANCHES } from '@/constants/service-center';
import { getBranchCode, getNextAvailableSequenceNumber } from '@/constants/branch_codes';
import { calculateWeightedKpi, determineTechnicianLevel } from '@/lib/kpi';
import { supabase } from '@/lib/supabase';

interface TechnicianFormModalProps {
  show: boolean;
  formId: string | null;
  formData: TechnicianFormData;
  setFormData: React.Dispatch<React.SetStateAction<TechnicianFormData>>;
  photoFile?: File | null;
  setPhotoFile: React.Dispatch<React.SetStateAction<File | null>>;
  saving: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

/**
 * Daftar pilihan Service Center khusus lingkup layanan DSC.
 * Menghasilkan opsi spesifik DSC dan MSC flagship cabang terkait.
 */
function getDscServiceCenterOptions(branch: string): string[] {
  if (!branch || !branch.trim()) return [];
  const clean = branch.trim();

  // Opsi utama berstandar DSC: misal "DSC Bali", "DSC Makassar", "DSC Balikpapan"
  const stripped = clean.replace(/^(DSC|MSC)\s+/i, '');
  const primary = `DSC ${stripped}`;
  const options = [primary];

  const lower = clean.toLowerCase();
  if (lower.includes('bandung')) {
    options.push('MSC KBP Bandung');
  }
  if (lower.includes('surabaya')) {
    options.push('MSC Surabaya Mayjend Sungkono', 'MSC Surabaya GWalk');
  }
  if (lower.includes('jakarta')) {
    options.push('MSC Suryo', 'MSC Kemang', 'MSC Greenlake');
  }
  if (lower.includes('bogor')) {
    options.push('MSC Bogor');
  }
  if (clean.startsWith('MSC ') && !options.includes(clean)) {
    options.unshift(clean);
  }

  return Array.from(new Set(options));
}

export const TechnicianFormModal: React.FC<TechnicianFormModalProps> = ({
  show,
  formId,
  formData,
  setFormData,
  photoFile,
  setPhotoFile,
  saving,
  onClose,
  onSave,
}) => {
  // State validasi ketat & feedback
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [generatingId, setGeneratingId] = useState(false);

  // 1. Live Auto-Calculation 6 Indikator Terbobot
  const liveKpiScore = useMemo(() => {
    return calculateWeightedKpi({
      tat: formData.tat,
      rtat: formData.rtat,
      csat: formData.csat,
      grooming_score: formData.grooming_score,
      service_score: formData.service_score,
      repair_quality_score: formData.repair_quality_score,
    });
  }, [
    formData.tat,
    formData.rtat,
    formData.csat,
    formData.grooming_score,
    formData.service_score,
    formData.repair_quality_score,
  ]);

  // 2. Auto-Level: < 70 Beginner, 70-84 Intermediate, >= 85 Advance
  const liveCalculatedLevel = useMemo(() => {
    return determineTechnicianLevel(liveKpiScore);
  }, [liveKpiScore]);

  // Sinkronkan level sertifikasi otomatis & terkunci
  useEffect(() => {
    if (formData.technician_level !== liveCalculatedLevel) {
      setFormData((prev) => ({
        ...prev,
        technician_level: liveCalculatedLevel,
        performance_score: liveKpiScore,
      }));
    }
  }, [liveCalculatedLevel, liveKpiScore, formData.technician_level, setFormData]);

  // 3. FUNGSI AUTO-GENERATE ID TEKNISI DARI NOMOR URUT TERTINGGI DATABASE (misal: DSC-BAL-001)
  const generateBranchTechnicianId = useCallback(
    async (branchName: string) => {
      if (!branchName || !branchName.trim()) return;
      const code = getBranchCode(branchName);
      if (!code || code === 'MOD') return;

      setGeneratingId(true);
      try {
        // Query teknisi untuk cabang ini atau yang berprefix DSC-[KODE]- / MOD-[KODE]-
        const { data, error } = await supabase
          .from('technicians')
          .select('technician_id')
          .or(
            `branch.ilike.%${branchName.trim()}%,technician_id.ilike.DSC-${code}-%,technician_id.ilike.MOD-${code}-%`
          );

        const existingIds =
          !error && data ? data.map((r) => r.technician_id).filter(Boolean) : [];
        const nextSeq = getNextAvailableSequenceNumber(existingIds, code);
        const formattedId = `DSC-${code}-${nextSeq}`;

        setFormData((prev) => ({
          ...prev,
          technician_id: formattedId,
          card_number: formattedId, // Nomor kartu otomatis menyatu dengan ID
        }));
      } catch (err) {
        console.error('Gagal mengambil urutan nomor ID teknisi:', err);
        const fallbackId = `DSC-${code}-001`;
        setFormData((prev) => ({
          ...prev,
          technician_id: fallbackId,
          card_number: fallbackId,
        }));
      } finally {
        setGeneratingId(false);
      }
    },
    [setFormData]
  );

  // Inisialisasi Service Center & ID saat modal dibuka dengan cabang bawaan
  useEffect(() => {
    if (show && !formId && formData.branch) {
      if (!formData.technician_id) {
        generateBranchTechnicianId(formData.branch);
      }
      if (!formData.service_center) {
        const scOpts = getDscServiceCenterOptions(formData.branch);
        if (scOpts.length > 0) {
          setFormData((prev) => ({ ...prev, service_center: scOpts[0] }));
        }
      }
    }
  }, [
    show,
    formId,
    formData.branch,
    formData.technician_id,
    formData.service_center,
    generateBranchTechnicianId,
    setFormData,
  ]);

  // Handler saat Cabang dipilih atau diketik
  const handleBranchChange = (newBranch: string) => {
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy.branch;
      return copy;
    });

    const scOptions = getDscServiceCenterOptions(newBranch);
    const autoServiceCenter = scOptions[0] || '';

    setFormData((prev) => ({
      ...prev,
      branch: newBranch,
      service_center: autoServiceCenter,
    }));

    if (!formId && newBranch.trim()) {
      generateBranchTechnicianId(newBranch);
    }
  };

  // Helper styling error merah menyala
  const getErrorStyle = (fieldKey: string) => {
    if (fieldErrors[fieldKey]) {
      return {
        border: '1.5px solid #EF4444',
        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.25)',
        backgroundColor: '#FEF2F2',
      };
    }
    return {};
  };

  // 4. VALIDASI FORM KETAT (STRICT INCOMPLETE GUARD)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const uncompleted: string[] = [];

    // Validasi Identitas Utama
    if (!formData.technician_name || !formData.technician_name.trim()) {
      errors.technician_name = 'Nama Lengkap Teknisi wajib diisi';
      uncompleted.push('Nama Lengkap Teknisi');
    }

    if (!formData.employee_number || !formData.employee_number.trim()) {
      errors.employee_number = 'Nomor Karyawan (NIK) wajib diisi';
      uncompleted.push('Nomor Karyawan (NIK)');
    }

    if (!formData.branch || !formData.branch.trim()) {
      errors.branch = 'Cabang / Wilayah penugasan wajib dipilih';
      uncompleted.push('Cabang / Wilayah');
    }

    // Validasi Foto (Wajib untuk data baru)
    if (!formId && !photoFile) {
      errors.photo_file = 'Foto Resmi Teknisi wajib diunggah untuk data baru';
      uncompleted.push('Foto Resmi Teknisi (Maks 2MB)');
    }

    // Validasi 6 Indikator Evaluasi (Wajib diisi angka 0 - 100)
    if (formData.tat === undefined || formData.tat === null || isNaN(formData.tat)) {
      errors.tat = 'Skor TAT wajib diisi (0 - 100)';
      uncompleted.push('Indikator TAT (Turn Around Time)');
    }

    if (formData.rtat === undefined || formData.rtat === null || isNaN(formData.rtat)) {
      errors.rtat = 'Skor RTAT wajib diisi (0 - 100)';
      uncompleted.push('Indikator RTAT (Repeat TAT)');
    }

    if (formData.csat === undefined || formData.csat === null || isNaN(formData.csat)) {
      errors.csat = 'Skor CSAT wajib diisi (0 - 100)';
      uncompleted.push('Indikator CSAT (Kepuasan Pelanggan)');
    }

    if (
      formData.grooming_score === undefined ||
      formData.grooming_score === null ||
      isNaN(formData.grooming_score)
    ) {
      errors.grooming_score = 'Skor Penampilan wajib diisi (0 - 100)';
      uncompleted.push('Indikator Penampilan (Grooming)');
    }

    if (
      formData.service_score === undefined ||
      formData.service_score === null ||
      isNaN(formData.service_score)
    ) {
      errors.service_score = 'Skor Pelayanan wajib diisi (0 - 100)';
      uncompleted.push('Indikator Pelayanan (Service)');
    }

    if (
      formData.repair_quality_score === undefined ||
      formData.repair_quality_score === null ||
      isNaN(formData.repair_quality_score)
    ) {
      errors.repair_quality_score = 'Skor Hasil Perbaikan wajib diisi (0 - 100)';
      uncompleted.push('Indikator Hasil Perbaikan (Repair Quality)');
    }

    // Jika ada yang belum lengkap: batalkan simpan & tampilkan modal peringatan
    if (uncompleted.length > 0) {
      setFieldErrors(errors);
      setMissingFields(uncompleted);
      setShowIncompleteModal(true);
      return;
    }

    // Pastikan state nomor kartu tersinkron dengan ID teknisi
    if (formData.technician_id && formData.card_number !== formData.technician_id) {
      setFormData((prev) => ({
        ...prev,
        card_number: prev.technician_id,
      }));
    }

    // Lolos validasi -> lanjutkan penyimpanan
    setFieldErrors({});
    onSave(e);
  };

  if (!show) return null;

  const currentBranchCode = formData.branch ? getBranchCode(formData.branch) : null;
  const availableServiceCenters = getDscServiceCenterOptions(formData.branch);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 50,
          backdropFilter: 'blur(4px)',
        }}
      >
        <div
          className="modena-card"
          style={{
            width: '100%',
            maxWidth: '640px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--bg-dark)',
              }}
            >
              {formId ? 'Edit Data Teknisi Modena' : 'Tambah Teknisi Modena Baru'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleFormSubmit}
            noValidate
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* IDENTITAS UTAMA */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              {/* ID TEKNISI (AUTO-GENERATE & TERKUNCI) */}
              <div>
                <label
                  htmlFor="form-technician-id"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  <Lock size={13} style={{ color: '#64748b' }} />
                  <span>ID Teknisi</span>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 500,
                      color: '#0284c7',
                      backgroundColor: '#e0f2fe',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    Otomatis
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="form-technician-id"
                    name="technician_id"
                    type="text"
                    readOnly
                    value={formData.technician_id}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      outline: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      backgroundColor: '#f8fafc',
                      color: formData.technician_id ? '#0f172a' : '#94a3b8',
                      cursor: 'not-allowed',
                    }}
                    placeholder={
                      generatingId
                        ? 'Membuat ID otomatis...'
                        : 'Pilih cabang untuk generate ID...'
                    }
                  />
                  {generatingId && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      <Loader2 size={16} className="animate-spin-custom" />
                    </div>
                  )}
                </div>
              </div>

              {/* NOMOR KARYAWAN (NIK) */}
              <div>
                <label
                  htmlFor="form-employee-number"
                  style={{
                    display: 'block',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  Nomor Karyawan (NIK) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="form-employee-number"
                  name="employee_number"
                  type="text"
                  value={formData.employee_number}
                  onChange={(e) => {
                    setFieldErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.employee_number;
                      return copy;
                    });
                    setFormData({
                      ...formData,
                      employee_number: e.target.value,
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    fontSize: '0.875rem',
                    ...getErrorStyle('employee_number'),
                  }}
                  placeholder="Contoh: 10293847"
                />
              </div>
            </div>

            {/* NAMA LENGKAP TEKNISI */}
            <div>
              <label
                htmlFor="form-technician-name"
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                Nama Lengkap Teknisi <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="form-technician-name"
                name="technician_name"
                type="text"
                value={formData.technician_name}
                onChange={(e) => {
                  setFieldErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.technician_name;
                    return copy;
                  });
                  setFormData({
                    ...formData,
                    technician_name: e.target.value,
                  });
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  fontSize: '0.875rem',
                  ...getErrorStyle('technician_name'),
                }}
                placeholder="Contoh: Budi Santoso"
              />
            </div>

            {/* CABANG & SERVICE CENTER */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div>
                <label
                  htmlFor="form-branch"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  <span>
                    Cabang / Wilayah <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                  {currentBranchCode && currentBranchCode !== 'MOD' && (
                    <span
                      style={{
                        fontSize: '0.725rem',
                        color: '#059669',
                        backgroundColor: '#d1fae5',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                      }}
                    >
                      Kode: {currentBranchCode}
                    </span>
                  )}
                </label>
                <input
                  id="form-branch"
                  name="branch"
                  type="text"
                  list="dsc-branches-list"
                  value={formData.branch}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    fontSize: '0.875rem',
                    ...getErrorStyle('branch'),
                  }}
                  placeholder="Pilih atau ketik cabang DSC..."
                />
                <datalist id="dsc-branches-list">
                  {DSC_BRANCHES.map((b) => {
                    const c = getBranchCode(b);
                    return (
                      <option key={b} value={b}>
                        {`${b} (Kode: ${c})`}
                      </option>
                    );
                  })}
                </datalist>
              </div>

              {/* SERVICE CENTER (PILIHAN KHUSUS LINGKUP DSC) */}
              <div>
                <label
                  htmlFor="form-service-center"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  <span>Service Center</span>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      color: '#059669',
                      backgroundColor: '#d1fae5',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    Lingkup DSC
                  </span>
                </label>
                <select
                  id="form-service-center"
                  name="service_center"
                  value={formData.service_center}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service_center: e.target.value,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    fontSize: '0.875rem',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {availableServiceCenters.length === 0 ? (
                    <option value="">Pilih cabang terlebih dahulu...</option>
                  ) : (
                    availableServiceCenters.map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* SEKSI 6 INDIKATOR KPI TERBOBOT */}
            <div
              style={{
                backgroundColor: 'var(--bg-light)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  📊 Indikator Evaluasi Performa (6 Indikator Wajib)
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#059669',
                    backgroundColor: '#d1fae5',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Lock size={12} /> Auto-Level Terkunci
                </span>
              </div>

              {/* Baris 1: TAT, RTAT, CSAT */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <label
                    htmlFor="form-tat"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    TAT (20%) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="form-tat"
                    name="tat"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.tat ?? ''}
                    onChange={(e) => {
                      setFieldErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.tat;
                        return copy;
                      });
                      setFormData({
                        ...formData,
                        tat:
                          e.target.value === '' ? undefined : parseFloat(e.target.value),
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      ...getErrorStyle('tat'),
                    }}
                    placeholder="0 - 100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="form-rtat"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    RTAT (15%) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="form-rtat"
                    name="rtat"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.rtat ?? ''}
                    onChange={(e) => {
                      setFieldErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.rtat;
                        return copy;
                      });
                      setFormData({
                        ...formData,
                        rtat:
                          e.target.value === '' ? undefined : parseFloat(e.target.value),
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      ...getErrorStyle('rtat'),
                    }}
                    placeholder="0 - 100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="form-csat"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    CSAT (25%) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="form-csat"
                    name="csat"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.csat ?? ''}
                    onChange={(e) => {
                      setFieldErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.csat;
                        return copy;
                      });
                      setFormData({
                        ...formData,
                        csat:
                          e.target.value === '' ? undefined : parseFloat(e.target.value),
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      ...getErrorStyle('csat'),
                    }}
                    placeholder="0 - 100"
                  />
                </div>
              </div>

              {/* Baris 2: Penampilan, Pelayanan, Hasil Perbaikan */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <label
                    htmlFor="form-grooming"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Penampilan (10%) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="form-grooming"
                    name="grooming_score"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.grooming_score ?? ''}
                    onChange={(e) => {
                      setFieldErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.grooming_score;
                        return copy;
                      });
                      setFormData({
                        ...formData,
                        grooming_score:
                          e.target.value === '' ? undefined : parseFloat(e.target.value),
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      ...getErrorStyle('grooming_score'),
                    }}
                    placeholder="0 - 100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="form-service"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Pelayanan (15%) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="form-service"
                    name="service_score"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.service_score ?? ''}
                    onChange={(e) => {
                      setFieldErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.service_score;
                        return copy;
                      });
                      setFormData({
                        ...formData,
                        service_score:
                          e.target.value === '' ? undefined : parseFloat(e.target.value),
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      ...getErrorStyle('service_score'),
                    }}
                    placeholder="0 - 100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="form-repair"
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Hasil Perbaikan (15%) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="form-repair"
                    name="repair_quality_score"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.repair_quality_score ?? ''}
                    onChange={(e) => {
                      setFieldErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.repair_quality_score;
                        return copy;
                      });
                      setFormData({
                        ...formData,
                        repair_quality_score:
                          e.target.value === '' ? undefined : parseFloat(e.target.value),
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      ...getErrorStyle('repair_quality_score'),
                    }}
                    placeholder="0 - 100"
                  />
                </div>
              </div>

              {/* LIVE KALKULATOR PREVIEW */}
              <div
                style={{
                  marginTop: '0.25rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px dashed var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.725rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Sparkles size={13} color="var(--accent-red)" />
                    <span>Kalkulasi Skor Total KPI (Real-time):</span>
                  </div>
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'var(--accent-red)',
                    }}
                  >
                    {liveKpiScore}%
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '0.725rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.2rem',
                    }}
                  >
                    Status Level Otomatis:
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor:
                        liveCalculatedLevel === 'advance'
                          ? 'rgba(59, 130, 246, 0.15)'
                          : liveCalculatedLevel === 'intermediate'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(16, 185, 129, 0.15)',
                      color:
                        liveCalculatedLevel === 'advance'
                          ? '#1D4ED8'
                          : liveCalculatedLevel === 'intermediate'
                            ? '#B45309'
                            : '#047857',
                    }}
                  >
                    {liveCalculatedLevel.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* LEVEL & STATUS AKTIF */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              {/* LEVEL (OTOMATIS MENGIKUTI PERUBAHAN SKOR) */}
              <div>
                <label
                  htmlFor="form-technician-level"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  <Lock size={13} style={{ color: '#64748b' }} />
                  <span>Level</span>
                  <span
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 500,
                      color: '#0284c7',
                      backgroundColor: '#e0f2fe',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    Otomatis
                  </span>
                </label>
                <select
                  id="form-technician-level"
                  name="technician_level"
                  disabled
                  value={liveCalculatedLevel}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    cursor: 'not-allowed',
                  }}
                >
                  <option value="beginner">Beginner (&lt; 70)</option>
                  <option value="intermediate">Intermediate (70 - 84)</option>
                  <option value="advance">Advance (&ge; 85)</option>
                </select>
              </div>

              {/* STATUS AKTIF */}
              <div>
                <label
                  htmlFor="form-technician-status"
                  style={{
                    display: 'block',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  Status Aktif
                </label>
                <select
                  id="form-technician-status"
                  name="technician_status"
                  value={formData.technician_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      technician_status: e.target.value as TechnicianStatus,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            {/* TELEPON & EMAIL */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div>
                <label
                  htmlFor="form-phone"
                  style={{
                    display: 'block',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  Nomor Telepon (Sensitif)
                </label>
                <input
                  id="form-phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    fontSize: '0.875rem',
                  }}
                  placeholder="0812345..."
                />
              </div>
              <div>
                <label
                  htmlFor="form-email"
                  style={{
                    display: 'block',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  Email Korporat (Sensitif)
                </label>
                <input
                  id="form-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    outline: 'none',
                    fontSize: '0.875rem',
                  }}
                  placeholder="budi@modena.com"
                />
              </div>
            </div>

            {/* MASA BERLAKU ID CARD (TANGGAL KADALUARSA) */}
            <div
              style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
              }}
            >
              <label
                htmlFor="form-expiry-date"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                <Calendar size={14} style={{ color: '#64748b' }} />
                <span>Masa Berlaku ID Card (Tanggal Kadaluarsa)</span>
              </label>
              <input
                id="form-expiry-date"
                name="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expiry_date: e.target.value,
                  })
                }
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* FOTO RESMI TEKNISI */}
            <div>
              <label
                htmlFor="form-photo-file"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                <ImageIcon size={14} />
                <span>
                  Foto Resmi Teknisi (Maks 2MB){' '}
                  {!formId && <span style={{ color: '#ef4444' }}>*</span>}
                </span>
              </label>
              <input
                id="form-photo-file"
                name="photo_file"
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => {
                  setFieldErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.photo_file;
                    return copy;
                  });
                  setPhotoFile(e.target.files?.[0] || null);
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem',
                  ...getErrorStyle('photo_file'),
                }}
              />
            </div>

            {/* TOMBOL AKSI */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="modena-btn-secondary"
                style={{ flex: 1 }}
              >
                BATAL
              </button>
              <button
                type="submit"
                disabled={saving}
                className="modena-btn-primary"
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin-custom" />
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>SIMPAN DATA</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 5. MODAL PERINGATAN DATA BELUM LENGKAP (STRICT INCOMPLETE GUARD) */}
      {showIncompleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 100,
            backdropFilter: 'blur(5px)',
          }}
        >
          <div
            className="modena-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1.5px solid #EF4444',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  padding: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#991B1B',
                    margin: 0,
                  }}
                >
                  Formulir Belum Lengkap!
                </h4>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#6B7280',
                    margin: '2px 0 0 0',
                  }}
                >
                  Sistem mewajibkan seluruh field diisi sebelum disimpan.
                </p>
              </div>
            </div>

            <p
              style={{
                fontSize: '0.825rem',
                color: '#374151',
                marginBottom: '0.75rem',
                fontWeight: 600,
              }}
            >
              Rincian data yang masih kosong ({missingFields.length} item):
            </p>

            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              {missingFields.map((field, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.825rem',
                    color: '#B91C1C',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#EF4444',
                    }}
                  />
                  <span>{field}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowIncompleteModal(false)}
              className="modena-btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                backgroundColor: '#DC2626',
              }}
            >
              Saya Mengerti, Lengkapi Sekarang
            </button>
          </div>
        </div>
      )}
    </>
  );
};
