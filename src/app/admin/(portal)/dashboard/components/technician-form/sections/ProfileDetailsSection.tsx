// src/app/admin/(portal)/dashboard/components/technician-form/sections/ProfileDetailsSection.tsx
'use client';

import React from 'react';
import { Calendar, Image as ImageIcon, Lock } from 'lucide-react';
import { TechnicianFormData, TechnicianLevel, TechnicianStatus } from '@/types';
import {
  iconLabelStyle,
  inputStyle,
  LabelBadge,
  labelStyle,
  lockedInputStyle,
  RequiredMark,
  twoColumnGrid,
} from '../form-styles';

type EditableField = 'technician_status' | 'phone' | 'email' | 'expiry_date';

interface ProfileDetailsSectionProps {
  formData: TechnicianFormData;
  isNew: boolean;
  liveLevel: TechnicianLevel;
  onFieldChange: (field: EditableField, value: string) => void;
  onPhotoChange: (file: File | null) => void;
  errorStyle: (field: string) => React.CSSProperties;
}

/** Level (otomatis), status aktif, kontak, masa berlaku kartu, dan foto resmi. */
export const ProfileDetailsSection: React.FC<ProfileDetailsSectionProps> = ({
  formData,
  isNew,
  liveLevel,
  onFieldChange,
  onPhotoChange,
  errorStyle,
}) => (
  <>
    {/* LEVEL & STATUS AKTIF */}
    <div style={twoColumnGrid}>
      <div>
        <label htmlFor="form-technician-level" style={iconLabelStyle}>
          <Lock size={13} style={{ color: '#64748b' }} />
          <span>Level</span>
          <LabelBadge>Otomatis</LabelBadge>
        </label>
        <select
          id="form-technician-level"
          name="technician_level"
          disabled
          value={liveLevel}
          style={{ ...lockedInputStyle, fontWeight: 600, color: '#1e293b' }}
        >
          <option value="beginner">Beginner (&lt; 70)</option>
          <option value="intermediate">Intermediate (70 - 84)</option>
          <option value="advance">Advance (&ge; 85)</option>
        </select>
      </div>

      <div>
        <label htmlFor="form-technician-status" style={labelStyle}>
          Status Aktif
        </label>
        <select
          id="form-technician-status"
          name="technician_status"
          value={formData.technician_status}
          onChange={(e) => onFieldChange('technician_status', e.target.value as TechnicianStatus)}
          style={inputStyle}
        >
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>
    </div>

    {/* TELEPON & EMAIL */}
    <div style={twoColumnGrid}>
      <div>
        <label htmlFor="form-phone" style={labelStyle}>
          Nomor Telepon (Sensitif)
        </label>
        <input
          id="form-phone"
          name="phone"
          type="text"
          value={formData.phone}
          onChange={(e) => onFieldChange('phone', e.target.value)}
          style={inputStyle}
          placeholder="0812345..."
        />
      </div>
      <div>
        <label htmlFor="form-email" style={labelStyle}>
          Email Pribadi (Sensitif)
        </label>
        <input
          id="form-email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          style={inputStyle}
          placeholder="budi.santoso@gmail.com"
        />
      </div>
    </div>

    {/* MASA BERLAKU ID CARD */}
    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
      <label htmlFor="form-expiry-date" style={iconLabelStyle}>
        <Calendar size={14} style={{ color: '#64748b' }} />
        <span>Masa Berlaku ID Card (Tanggal Kadaluarsa)</span>
      </label>
      <input
        id="form-expiry-date"
        name="expiry_date"
        type="date"
        value={formData.expiry_date}
        onChange={(e) => onFieldChange('expiry_date', e.target.value)}
        style={inputStyle}
      />
    </div>

    {/* FOTO RESMI TEKNISI */}
    <div>
      <label htmlFor="form-photo-file" style={iconLabelStyle}>
        <ImageIcon size={14} />
        <span>
          Foto Resmi Teknisi (Maks 2MB) {isNew && <RequiredMark />}
        </span>
      </label>
      <input
        id="form-photo-file"
        name="photo_file"
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => onPhotoChange(e.target.files?.[0] || null)}
        style={{
          width: '100%',
          padding: '0.5rem 0.65rem',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          fontSize: '0.875rem',
          ...errorStyle('photo_file'),
        }}
      />
    </div>
  </>
);
