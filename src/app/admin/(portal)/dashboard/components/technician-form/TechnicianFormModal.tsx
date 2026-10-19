// src/app/admin/(portal)/dashboard/components/technician-form/TechnicianFormModal.tsx
'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DEFAULT_KPI_WEIGHTS, KpiWeights } from '@/lib/kpi';
import { TechnicianFormData } from '@/types';
import { FieldErrors, KpiFieldKey, validateTechnicianForm } from './form-config';
import { formStyles } from './form-styles';
import { IdentitySection } from './sections/IdentitySection';
import { IncompleteFormDialog } from './IncompleteFormDialog';
import { KpiIndicatorsSection } from './sections/KpiIndicatorsSection';
import { ProfileDetailsSection } from './sections/ProfileDetailsSection';
import { useTechnicianFormLogic } from './hooks/useTechnicianFormLogic';

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
  /** Bobot KPI aktif dari pengaturan sistem (tabel `kpi_settings`) */
  kpiWeights?: KpiWeights;
}

const FORM_ID = 'technician-form';

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
  kpiWeights = DEFAULT_KPI_WEIGHTS,
}) => {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const { liveKpiScore, liveLevel, generatingId, changeBranch } = useTechnicianFormLogic({
    show,
    formId,
    formData,
    setFormData,
    kpiWeights,
  });

  const clearError = (field: string) =>
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const hasError = (field: string) => Boolean(fieldErrors[field]);

  const updateField = <K extends keyof TechnicianFormData>(
    field: K,
    value: TechnicianFormData[K]
  ) => {
    clearError(field);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validasi ketat: bila ada field wajib kosong, batalkan simpan & tampilkan rinciannya
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { errors, missing } = validateTechnicianForm(formData, {
      isNew: !formId,
      hasPhoto: Boolean(photoFile),
    });

    if (missing.length > 0) {
      setFieldErrors(errors);
      setMissingFields(missing);
      return;
    }

    setFieldErrors({});
    onSave(e);
  };

  if (!show) return null;

  return (
    <>
      <Modal
        width={680}
        onClose={onClose}
        dismissible={!saving}
        title={formId ? 'Ubah data teknisi' : 'Tambah teknisi'}
        description={
          formId
            ? formData.technician_id
            : 'Kolom bertanda * wajib diisi. ID teknisi dan level dibuat otomatis.'
        }
        footer={
          <>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={saving}>
              Batal
            </button>
            <button type="submit" form={FORM_ID} disabled={saving} className="btn btn-primary">
              {saving && <Loader2 size={16} className="spin" />}
              {formId ? 'Simpan perubahan' : 'Simpan teknisi'}
            </button>
          </>
        }
      >
        <form id={FORM_ID} onSubmit={handleSubmit} noValidate className={formStyles.form}>
          <IdentitySection
            formData={formData}
            generatingId={generatingId}
            onFieldChange={updateField}
            onBranchChange={(branch) => {
              clearError('branch');
              changeBranch(branch);
            }}
            onServiceCenterChange={(sc) => updateField('service_center', sc)}
            hasError={hasError}
          />

          <KpiIndicatorsSection
            formData={formData}
            kpiWeights={kpiWeights}
            liveKpiScore={liveKpiScore}
            liveLevel={liveLevel}
            onScoreChange={(field: KpiFieldKey, value) => updateField(field, value)}
            hasError={hasError}
          />

          <ProfileDetailsSection
            formData={formData}
            isNew={!formId}
            photoFile={photoFile}
            onFieldChange={(field, value) => setFormData((prev) => ({ ...prev, [field]: value }))}
            onPhotoChange={(file) => {
              clearError('photo_file');
              setPhotoFile(file);
            }}
            hasError={hasError}
          />
        </form>
      </Modal>

      {missingFields.length > 0 && (
        <IncompleteFormDialog missingFields={missingFields} onClose={() => setMissingFields([])} />
      )}
    </>
  );
};
