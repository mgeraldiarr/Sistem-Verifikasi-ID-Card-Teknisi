// src/app/admin/dashboard/components/TechnicianFormModal.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, Loader2, Sparkles } from 'lucide-react';
import { TechnicianFormData, TechnicianLevel, TechnicianStatus } from '@/types';
import { DSC_BRANCHES } from '@/constants/service-center';
import { calculateWeightedKpi, determineTechnicianLevel } from '@/lib/kpi';

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
  const [autoCalculateLevel, setAutoCalculateLevel] = useState(true);

  // Live Auto-Calculation 6 Indikator Terbobot
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

  const liveCalculatedLevel = useMemo(() => {
    return determineTechnicianLevel(liveKpiScore);
  }, [liveKpiScore]);

  // Sinkronkan level sertifikasi otomatis jika toggle aktif
  useEffect(() => {
    if (autoCalculateLevel) {
      if (formData.technician_level !== liveCalculatedLevel) {
        setFormData((prev) => ({
          ...prev,
          technician_level: liveCalculatedLevel,
          performance_score: liveKpiScore,
        }));
      }
    }
  }, [autoCalculateLevel, liveCalculatedLevel, liveKpiScore, formData.technician_level, setFormData]);

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
          maxWidth: '640px',
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
          {/* IDENTITAS UTAMA */}
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

          {/* SEKSI INDIKATOR EVALUASI PERFORMA DENGAN LIVE AUTO-CALCULATOR */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={18} color="var(--accent-red)" />
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  Indikator Evaluasi Performa (6 Indikator)
                </span>
              </div>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  userSelect: 'none',
                  color: 'var(--text-secondary)',
                }}
              >
                <input
                  type="checkbox"
                  checked={autoCalculateLevel}
                  onChange={(e) => setAutoCalculateLevel(e.target.checked)}
                />
                Auto-Kalkulasi Level
              </label>
            </div>

            {/* Baris 1 Indikator (TAT, RTAT, CSAT) */}
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
                  TAT (20%)
                </label>
                <input
                  id="form-tat"
                  name="tat"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.tat ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tat: e.target.value === '' ? undefined : parseFloat(e.target.value),
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
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
                  RTAT (15%)
                </label>
                <input
                  id="form-rtat"
                  name="rtat"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.rtat ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rtat: e.target.value === '' ? undefined : parseFloat(e.target.value),
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
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
                  CSAT (25%)
                </label>
                <input
                  id="form-csat"
                  name="csat"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.csat ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      csat: e.target.value === '' ? undefined : parseFloat(e.target.value),
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                  placeholder="0 - 100"
                />
              </div>
            </div>

            {/* Baris 2 Indikator (Penampilan, Pelayanan, Hasil Perbaikan) */}
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
                  Penampilan (10%)
                </label>
                <input
                  id="form-grooming"
                  name="grooming_score"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.grooming_score ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      grooming_score:
                        e.target.value === '' ? undefined : parseFloat(e.target.value),
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
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
                  Pelayanan (15%)
                </label>
                <input
                  id="form-service"
                  name="service_score"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.service_score ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service_score:
                        e.target.value === '' ? undefined : parseFloat(e.target.value),
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
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
                  Hasil Perbaikan (15%)
                </label>
                <input
                  id="form-repair"
                  name="repair_quality_score"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.repair_quality_score ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      repair_quality_score:
                        e.target.value === '' ? undefined : parseFloat(e.target.value),
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                  placeholder="0 - 100"
                />
              </div>
            </div>

            {/* LIVE AUTO-CALCULATOR RESULT PREVIEW */}
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
                    fontSize: '1.2rem',
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
                  Status Rekomendasi:
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor:
                      liveCalculatedLevel === 'advance'
                        ? 'rgba(59, 130, 246, 0.12)'
                        : liveCalculatedLevel === 'intermediate'
                          ? 'rgba(245, 158, 11, 0.12)'
                          : 'rgba(16, 185, 129, 0.12)',
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
                onChange={(e) => {
                  setAutoCalculateLevel(false);
                  setFormData({
                    ...formData,
                    technician_level: e.target.value as TechnicianLevel,
                  });
                }}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
              >
                <option value="beginner">Beginner (&lt; 70)</option>
                <option value="intermediate">Intermediate (70 - 84)</option>
                <option value="advance">Advance (&ge; 85)</option>
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
