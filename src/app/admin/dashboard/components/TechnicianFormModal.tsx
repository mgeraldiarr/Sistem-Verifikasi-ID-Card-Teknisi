// src/app/admin/dashboard/components/TechnicianFormModal.tsx
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { TechnicianFormData, TechnicianLevel, TechnicianStatus } from '@/types';
import { DSC_BRANCHES } from '@/constants/service-center';

interface TechnicianFormModalProps {
  show: boolean;
  formId: string | null;
  formData: TechnicianFormData;
  setFormData: React.Dispatch<React.SetStateAction<TechnicianFormData>>;
  setPhotoFile: React.Dispatch<React.SetStateAction<File | null>>;
  saving: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

export const TechnicianFormModal: React.FC<TechnicianFormModalProps> = ({
  show,
  formId,
  formData,
  setFormData,
  setPhotoFile,
  saving,
  onClose,
  onSave,
}) => {
  if (!show) return null;

  return (
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
          maxWidth: '550px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            color: 'var(--bg-dark)',
          }}
        >
          {formId ? 'Edit Data Teknisi Modena' : 'Tambah Teknisi Modena Baru'}
        </h3>

        <form
          onSubmit={onSave}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <div>
              <label
                htmlFor="form-technician-id"
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                ID Teknisi
              </label>
              <input
                id="form-technician-id"
                name="technician_id"
                type="text"
                required
                value={formData.technician_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    technician_id: e.target.value,
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
                placeholder="MOD-T001"
              />
            </div>
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
                Nomor Karyawan
              </label>
              <input
                id="form-employee-number"
                name="employee_number"
                type="text"
                required
                value={formData.employee_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    employee_number: e.target.value,
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
                placeholder="10293847"
              />
            </div>
          </div>

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
              Nama Lengkap Teknisi
            </label>
            <input
              id="form-technician-name"
              name="technician_name"
              type="text"
              required
              value={formData.technician_name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  technician_name: e.target.value,
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
              placeholder="Contoh: Budi Santoso"
            />
          </div>

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
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                Cabang / Wilayah
              </label>
              <input
                id="form-branch"
                name="branch"
                type="text"
                required
                list="dsc-branches-list"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
                placeholder="Pilih atau ketik cabang DSC..."
              />
              <datalist id="dsc-branches-list">
                {DSC_BRANCHES.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <div>
              <label
                htmlFor="form-service-center"
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                Service Center
              </label>
              <input
                id="form-service-center"
                name="service_center"
                type="text"
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
                }}
                placeholder="Contoh: SC Selatan"
              />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <div>
              <label
                htmlFor="form-technician-level"
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                Level Sertifikasi
              </label>
              <select
                id="form-technician-level"
                name="technician_level"
                value={formData.technician_level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    technician_level: e.target.value as TechnicianLevel,
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
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advance">Advance</option>
              </select>
            </div>
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

          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              margin: '0.5rem 0',
            }}
          ></div>

          {/* Seksi ID Card Terkait */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <div>
              <label
                htmlFor="form-card-number"
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                Nomor ID Card Fisik
              </label>
              <input
                id="form-card-number"
                name="card_number"
                type="text"
                required={!!formId}
                value={formData.card_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    card_number: e.target.value,
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
                placeholder="CARD-T001"
              />
            </div>
            <div>
              <label
                htmlFor="form-expiry-date"
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                Tanggal Kadaluarsa Kartu
              </label>
              <input
                id="form-expiry-date"
                name="expiry_date"
                type="date"
                required={!!formId}
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
          </div>

          <div>
            <label
              htmlFor="form-photo-file"
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 600,
                marginBottom: '0.4rem',
              }}
            >
              Foto Resmi Teknisi (Maks 2MB)
            </label>
            <input
              id="form-photo-file"
              name="photo_file"
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              style={{
                width: '100%',
                padding: '0.5rem 0',
                fontSize: '0.875rem',
              }}
            />
          </div>

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
              }}
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin-custom" />
              ) : (
                'SIMPAN DATA'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
