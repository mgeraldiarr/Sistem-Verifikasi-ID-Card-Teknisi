// src/app/admin/(portal)/dashboard/components/technician-form/sections/IdentitySection.tsx
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { getBranchCode } from '@/constants/branch-codes';
import { DSC_BRANCHES, getDscServiceCenterOptions } from '@/constants/service-center';
import { TechnicianFormData } from '@/types';
import { fieldClass, FormSection, LabelAside, RequiredMark } from '../form-styles';

interface IdentitySectionProps {
  formData: TechnicianFormData;
  generatingId: boolean;
  /** Mengubah satu field teks dan menghapus sorotan error-nya */
  onFieldChange: (field: 'employee_number' | 'technician_name', value: string) => void;
  onBranchChange: (branch: string) => void;
  onServiceCenterChange: (serviceCenter: string) => void;
  hasError: (field: string) => boolean;
}

/** ID teknisi (otomatis), NIK, nama, cabang, dan Service Center. */
export const IdentitySection: React.FC<IdentitySectionProps> = ({
  formData,
  generatingId,
  onFieldChange,
  onBranchChange,
  onServiceCenterChange,
  hasError,
}) => {
  const branchCode = formData.branch ? getBranchCode(formData.branch) : null;
  const serviceCenters = getDscServiceCenterOptions(formData.branch);

  return (
    <FormSection title="Identitas">
      <div className="field">
        <label htmlFor="form-technician-name" className="label">
          Nama lengkap <RequiredMark />
        </label>
        <input
          id="form-technician-name"
          name="technician_name"
          type="text"
          autoComplete="off"
          value={formData.technician_name}
          onChange={(e) => onFieldChange('technician_name', e.target.value)}
          className={fieldClass('input', hasError('technician_name'))}
          placeholder="Budi Santoso"
        />
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="form-branch" className="label">
            Cabang <RequiredMark />
            {branchCode && branchCode !== 'MOD' && <LabelAside>Kode {branchCode}</LabelAside>}
          </label>
          <input
            id="form-branch"
            name="branch"
            type="text"
            list="dsc-branches-list"
            value={formData.branch}
            onChange={(e) => onBranchChange(e.target.value)}
            className={fieldClass('input', hasError('branch'))}
            placeholder="Pilih atau ketik cabang DSC"
          />
          <datalist id="dsc-branches-list">
            {DSC_BRANCHES.map((b) => (
              <option key={b} value={b}>
                {`${b} (Kode: ${getBranchCode(b)})`}
              </option>
            ))}
          </datalist>
        </div>

        <div className="field">
          <label htmlFor="form-service-center" className="label">
            Service center
          </label>
          <select
            id="form-service-center"
            name="service_center"
            className="select"
            value={formData.service_center}
            onChange={(e) => onServiceCenterChange(e.target.value)}
            disabled={serviceCenters.length === 0}
          >
            {serviceCenters.length === 0 ? (
              <option value="">Pilih cabang dulu</option>
            ) : (
              serviceCenters.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <div className="grid-2">
        {/* ID TEKNISI (AUTO-GENERATE & TERKUNCI) */}
        <div className="field">
          <label htmlFor="form-technician-id" className="label">
            ID teknisi
            <LabelAside>Dibuat otomatis dari cabang</LabelAside>
          </label>
          <div className="input-wrap">
            <input
              id="form-technician-id"
              name="technician_id"
              type="text"
              readOnly
              className="input tnum"
              value={formData.technician_id}
              style={{ fontWeight: formData.technician_id ? 600 : 400 }}
              placeholder={generatingId ? 'Membuat ID…' : 'Terisi setelah cabang dipilih'}
            />
            {generatingId && (
              <span className="input-suffix">
                <Loader2 size={16} className="spin" />
              </span>
            )}
          </div>
        </div>

        <div className="field">
          <label htmlFor="form-employee-number" className="label">
            Nomor karyawan (NIK) <RequiredMark />
          </label>
          <input
            id="form-employee-number"
            name="employee_number"
            type="text"
            inputMode="numeric"
            value={formData.employee_number}
            onChange={(e) => onFieldChange('employee_number', e.target.value)}
            className={fieldClass('input', hasError('employee_number'))}
            placeholder="10293847"
          />
        </div>
      </div>
    </FormSection>
  );
};
