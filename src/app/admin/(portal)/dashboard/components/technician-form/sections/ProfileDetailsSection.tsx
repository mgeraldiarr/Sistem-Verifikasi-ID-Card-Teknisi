// src/app/admin/(portal)/dashboard/components/technician-form/sections/ProfileDetailsSection.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { TechnicianFormData, TechnicianStatus } from '@/types';
import { fieldClass, formStyles, FormSection, RequiredMark } from '../form-styles';

type EditableField = 'technician_status' | 'phone' | 'email' | 'expiry_date';

interface ProfileDetailsSectionProps {
  formData: TechnicianFormData;
  isNew: boolean;
  photoFile?: File | null;
  onFieldChange: (field: EditableField, value: string) => void;
  onPhotoChange: (file: File | null) => void;
  hasError: (field: string) => boolean;
}

/** Pratinjau foto yang baru dipilih (URL objek dibersihkan saat berganti) */
function usePhotoPreview(file: File | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url;
}

/** Status aktif, kontak, masa berlaku kartu, dan foto resmi. */
export const ProfileDetailsSection: React.FC<ProfileDetailsSectionProps> = ({
  formData,
  isNew,
  photoFile,
  onFieldChange,
  onPhotoChange,
  hasError,
}) => {
  const previewUrl = usePhotoPreview(photoFile);

  return (
    <FormSection title="Kontak & kartu">
      <div className="grid-2">
        <div className="field">
          <label htmlFor="form-phone" className="label">
            Nomor HP
          </label>
          <input
            id="form-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            className="input"
            value={formData.phone}
            onChange={(e) => onFieldChange('phone', e.target.value)}
            placeholder="0812…"
          />
          <p className="hint">Dipakai untuk mengirim akses portal lewat WhatsApp.</p>
        </div>
        <div className="field">
          <label htmlFor="form-email" className="label">
            Email pribadi
          </label>
          <input
            id="form-email"
            name="email"
            type="email"
            className="input"
            value={formData.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            placeholder="budi.santoso@gmail.com"
          />
          <p className="hint">Dipakai teknisi untuk mengatur ulang kata sandi.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="form-expiry-date" className="label">
            Kartu berlaku sampai
          </label>
          <input
            id="form-expiry-date"
            name="expiry_date"
            type="date"
            className="input"
            value={formData.expiry_date}
            onChange={(e) => onFieldChange('expiry_date', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="form-technician-status" className="label">
            Status
          </label>
          <select
            id="form-technician-status"
            name="technician_status"
            className="select"
            value={formData.technician_status}
            onChange={(e) => onFieldChange('technician_status', e.target.value as TechnicianStatus)}
          >
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="form-photo-file" className="label">
          Foto resmi {isNew && <RequiredMark />}
        </label>
        <div className={formStyles.photoRow}>
          <div className={formStyles.photoPreview}>
            {previewUrl ? <img src={previewUrl} alt="Pratinjau foto" /> : <User size={20} />}
          </div>
          <div className="field" style={{ flex: 1 }}>
            <input
              id="form-photo-file"
              name="photo_file"
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => onPhotoChange(e.target.files?.[0] || null)}
              className={`${fieldClass('input', hasError('photo_file'))} input-file`}
            />
            <p className="hint">
              JPG atau PNG, maksimal 2 MB.
              {!isNew && ' Kosongkan bila foto tidak diganti.'}
            </p>
          </div>
        </div>
      </div>
    </FormSection>
  );
};
