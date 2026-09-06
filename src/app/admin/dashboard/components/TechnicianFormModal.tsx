// src/app/admin/dashboard/components/TechnicianFormModal.tsx
'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { TechnicianFormData, TechnicianLevel, TechnicianStatus } from '@/types';

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
                type="text"
                required
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
                placeholder="Contoh: Jakarta"
              />
            </div>
            <div>
              <label
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
