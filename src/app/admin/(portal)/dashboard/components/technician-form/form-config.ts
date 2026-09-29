// src/app/admin/(portal)/dashboard/components/technician-form/form-config.ts
import { KpiWeights } from '@/lib/kpi';
import { TechnicianFormData } from '@/types';

export type KpiFieldKey =
  | 'tat'
  | 'rtat'
  | 'csat'
  | 'grooming_score'
  | 'service_score'
  | 'repair_quality_score';

export interface KpiFieldConfig {
  field: KpiFieldKey;
  weightKey: keyof KpiWeights;
  inputId: string;
  label: string;
  /** Teks di modal "Formulir Belum Lengkap" */
  missingLabel: string;
  errorMessage: string;
}

/** 6 indikator evaluasi, berurutan sesuai tampilan form (2 baris x 3 kolom). */
export const KPI_FIELDS: KpiFieldConfig[] = [
  {
    field: 'tat',
    weightKey: 'tat',
    inputId: 'form-tat',
    label: 'TAT',
    missingLabel: 'Indikator TAT (Turn Around Time)',
    errorMessage: 'Skor TAT wajib diisi (0 - 100)',
  },
  {
    field: 'rtat',
    weightKey: 'rtat',
    inputId: 'form-rtat',
    label: 'RTAT',
    missingLabel: 'Indikator RTAT (Repeat TAT)',
    errorMessage: 'Skor RTAT wajib diisi (0 - 100)',
  },
  {
    field: 'csat',
    weightKey: 'csat',
    inputId: 'form-csat',
    label: 'CSAT',
    missingLabel: 'Indikator CSAT (Kepuasan Pelanggan)',
    errorMessage: 'Skor CSAT wajib diisi (0 - 100)',
  },
  {
    field: 'grooming_score',
    weightKey: 'grooming',
    inputId: 'form-grooming',
    label: 'Penampilan',
    missingLabel: 'Indikator Penampilan (Grooming)',
    errorMessage: 'Skor Penampilan wajib diisi (0 - 100)',
  },
  {
    field: 'service_score',
    weightKey: 'service',
    inputId: 'form-service',
    label: 'Pelayanan',
    missingLabel: 'Indikator Pelayanan (Service)',
    errorMessage: 'Skor Pelayanan wajib diisi (0 - 100)',
  },
  {
    field: 'repair_quality_score',
    weightKey: 'repair_quality',
    inputId: 'form-repair',
    label: 'Hasil Perbaikan',
    missingLabel: 'Indikator Hasil Perbaikan (Repair Quality)',
    errorMessage: 'Skor Hasil Perbaikan wajib diisi (0 - 100)',
  },
];

export type FieldErrors = Record<string, string>;

export interface FormValidationResult {
  errors: FieldErrors;
  /** Label field yang kosong, untuk ditampilkan di modal peringatan */
  missing: string[];
}

function isBlank(value: string | undefined | null): boolean {
  return !value || !value.trim();
}

function isMissingNumber(value: number | undefined | null): boolean {
  return value === undefined || value === null || isNaN(value);
}

/**
 * Validasi ketat form teknisi: Nama, NIK, Cabang, Foto (data baru) dan 6 indikator wajib.
 * Fungsi murni tanpa state, sehingga mudah diuji dan di-debug.
 */
export function validateTechnicianForm(
  formData: TechnicianFormData,
  { isNew, hasPhoto }: { isNew: boolean; hasPhoto: boolean }
): FormValidationResult {
  const errors: FieldErrors = {};
  const missing: string[] = [];

  const require = (key: string, message: string, label: string) => {
    errors[key] = message;
    missing.push(label);
  };

  if (isBlank(formData.technician_name)) {
    require('technician_name', 'Nama Lengkap Teknisi wajib diisi', 'Nama Lengkap Teknisi');
  }
  if (isBlank(formData.employee_number)) {
    require('employee_number', 'Nomor Karyawan (NIK) wajib diisi', 'Nomor Karyawan (NIK)');
  }
  if (isBlank(formData.branch)) {
    require('branch', 'Cabang / Wilayah penugasan wajib dipilih', 'Cabang / Wilayah');
  }
  if (isNew && !hasPhoto) {
    require(
      'photo_file',
      'Foto Resmi Teknisi wajib diunggah untuk data baru',
      'Foto Resmi Teknisi (Maks 2MB)'
    );
  }

  for (const kpi of KPI_FIELDS) {
    if (isMissingNumber(formData[kpi.field])) {
      require(kpi.field, kpi.errorMessage, kpi.missingLabel);
    }
  }

  return { errors, missing };
}
