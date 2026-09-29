// src/app/admin/(portal)/dashboard/components/technician-form/TechnicianFormModal.tsx
'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import { DEFAULT_KPI_WEIGHTS, KpiWeights } from '@/lib/kpi';
import { TechnicianFormData } from '@/types';
import { FieldErrors, KpiFieldKey, validateTechnicianForm } from './form-config';
import { ERROR_FIELD_STYLE } from './form-styles';
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

  const errorStyle = (field: string): React.CSSProperties =>
    fieldErrors[field] ? ERROR_FIELD_STYLE : {};

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
          style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--bg-dark)' }}>
              {formId ? 'Edit Data Teknisi Modena' : 'Tambah Teknisi Modena Baru'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup form"
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
            onSubmit={handleSubmit}
            noValidate
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <IdentitySection
              formData={formData}
              generatingId={generatingId}
              onFieldChange={updateField}
              onBranchChange={(branch) => {
                clearError('branch');
                changeBranch(branch);
              }}
              onServiceCenterChange={(sc) => updateField('service_center', sc)}
              errorStyle={errorStyle}
            />

            <KpiIndicatorsSection
              formData={formData}
              kpiWeights={kpiWeights}
              liveKpiScore={liveKpiScore}
              liveLevel={liveLevel}
              onScoreChange={(field: KpiFieldKey, value) => updateField(field, value)}
              errorStyle={errorStyle}
            />

            <ProfileDetailsSection
              formData={formData}
              isNew={!formId}
              liveLevel={liveLevel}
              onFieldChange={(field, value) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
              onPhotoChange={(file) => {
                clearError('photo_file');
                setPhotoFile(file);
              }}
              errorStyle={errorStyle}
            />

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

      {missingFields.length > 0 && (
        <IncompleteFormDialog missingFields={missingFields} onClose={() => setMissingFields([])} />
      )}
    </>
  );
};
