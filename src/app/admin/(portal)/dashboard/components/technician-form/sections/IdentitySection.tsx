// src/app/admin/(portal)/dashboard/components/technician-form/sections/IdentitySection.tsx
'use client';

import React from 'react';
import { Loader2, Lock } from 'lucide-react';
import { getBranchCode } from '@/constants/branch-codes';
import { DSC_BRANCHES, getDscServiceCenterOptions } from '@/constants/service-center';
import { TechnicianFormData } from '@/types';
import {
  iconLabelStyle,
  inputStyle,
  LabelBadge,
  labelStyle,
  lockedInputStyle,
  RequiredMark,
  splitLabelStyle,
  twoColumnGrid,
} from '../form-styles';

interface IdentitySectionProps {
  formData: TechnicianFormData;
  generatingId: boolean;
  /** Mengubah satu field teks dan menghapus sorotan error-nya */
  onFieldChange: (field: 'employee_number' | 'technician_name', value: string) => void;
  onBranchChange: (branch: string) => void;
  onServiceCenterChange: (serviceCenter: string) => void;
  errorStyle: (field: string) => React.CSSProperties;
}

/** ID teknisi (otomatis), NIK, nama, cabang, dan Service Center. */
export const IdentitySection: React.FC<IdentitySectionProps> = ({
  formData,
  generatingId,
  onFieldChange,
  onBranchChange,
  onServiceCenterChange,
  errorStyle,
}) => {
  const branchCode = formData.branch ? getBranchCode(formData.branch) : null;
  const serviceCenters = getDscServiceCenterOptions(formData.branch);

  return (
    <>
      <div style={twoColumnGrid}>
        {/* ID TEKNISI (AUTO-GENERATE & TERKUNCI) */}
        <div>
          <label htmlFor="form-technician-id" style={iconLabelStyle}>
            <Lock size={13} style={{ color: '#64748b' }} />
            <span>ID Teknisi</span>
            <LabelBadge>Otomatis</LabelBadge>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="form-technician-id"
              name="technician_id"
              type="text"
              readOnly
              value={formData.technician_id}
              style={{
                ...lockedInputStyle,
                fontWeight: 700,
                color: formData.technician_id ? '#0f172a' : '#94a3b8',
              }}
              placeholder={
                generatingId ? 'Membuat ID otomatis...' : 'Pilih cabang untuk generate ID...'
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
          <label htmlFor="form-employee-number" style={labelStyle}>
            Nomor Karyawan (NIK) <RequiredMark />
          </label>
          <input
            id="form-employee-number"
            name="employee_number"
            type="text"
            value={formData.employee_number}
            onChange={(e) => onFieldChange('employee_number', e.target.value)}
            style={{ ...inputStyle, ...errorStyle('employee_number') }}
            placeholder="Contoh: 10293847"
          />
        </div>
      </div>

      {/* NAMA LENGKAP TEKNISI */}
      <div>
        <label htmlFor="form-technician-name" style={labelStyle}>
          Nama Lengkap Teknisi <RequiredMark />
        </label>
        <input
          id="form-technician-name"
          name="technician_name"
          type="text"
          value={formData.technician_name}
          onChange={(e) => onFieldChange('technician_name', e.target.value)}
          style={{ ...inputStyle, ...errorStyle('technician_name') }}
          placeholder="Contoh: Budi Santoso"
        />
      </div>

      {/* CABANG & SERVICE CENTER */}
      <div style={twoColumnGrid}>
        <div>
          <label htmlFor="form-branch" style={splitLabelStyle}>
            <span>
              Cabang / Wilayah <RequiredMark />
            </span>
            {branchCode && branchCode !== 'MOD' && (
              <LabelBadge tone="green" bold>
                Kode: {branchCode}
              </LabelBadge>
            )}
          </label>
          <input
            id="form-branch"
            name="branch"
            type="text"
            list="dsc-branches-list"
            value={formData.branch}
            onChange={(e) => onBranchChange(e.target.value)}
            style={{ ...inputStyle, ...errorStyle('branch') }}
            placeholder="Pilih atau ketik cabang DSC..."
          />
          <datalist id="dsc-branches-list">
            {DSC_BRANCHES.map((b) => (
              <option key={b} value={b}>
                {`${b} (Kode: ${getBranchCode(b)})`}
              </option>
            ))}
          </datalist>
        </div>

        {/* SERVICE CENTER (PILIHAN KHUSUS LINGKUP DSC) */}
        <div>
          <label htmlFor="form-service-center" style={splitLabelStyle}>
            <span>Service Center</span>
            <LabelBadge tone="green">Lingkup DSC</LabelBadge>
          </label>
          <select
            id="form-service-center"
            name="service_center"
            value={formData.service_center}
            onChange={(e) => onServiceCenterChange(e.target.value)}
            style={{
              ...inputStyle,
              backgroundColor: '#FFFFFF',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {serviceCenters.length === 0 ? (
              <option value="">Pilih cabang terlebih dahulu...</option>
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
    </>
  );
};
