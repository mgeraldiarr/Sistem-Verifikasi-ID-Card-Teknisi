// src/app/admin/dashboard/components/TechnicianTableRow.tsx
'use client';

import React, { useState } from 'react';
import {
  Edit,
  Image as ImageIcon,
  Info,
  Printer,
  RefreshCcw,
  Trash2,
} from 'lucide-react';
import { Technician, TechnicianStatus } from '@/types';

interface TechnicianTableRowProps {
  tech: Technician;
  onToggleActive: (id: string, status: TechnicianStatus) => void;
  onPrint: (tech: Technician) => void;
  onRegenerateQR: (tech: Technician) => void;
  onEdit: (tech: Technician) => void;
  onDelete: (id: string) => void;
}

export const TechnicianTableRow: React.FC<TechnicianTableRowProps> = ({
  tech,
  onToggleActive,
  onPrint,
  onRegenerateQR,
  onEdit,
  onDelete,
}) => {
  const card = tech.technician_id_cards?.[0];
  const perf = tech.technician_performance?.[0];
  const [showPopover, setShowPopover] = useState(false);

  // Level badge helper (konsisten dengan widget distribusi skill)
  const levelBadgeConfig: Record<
    string,
    { label: string; bg: string; text: string; dot: string }
  > = {
    beginner: {
      label: 'Beginner',
      bg: 'rgba(16, 185, 129, 0.12)',
      text: '#047857',
      dot: '#10B981',
    },
    intermediate: {
      label: 'Intermediate',
      bg: 'rgba(245, 158, 11, 0.12)',
      text: '#B45309',
      dot: '#F59E0B',
    },
    advance: {
      label: 'Advance',
      bg: 'rgba(59, 130, 246, 0.12)',
      text: '#1D4ED8',
      dot: '#3B82F6',
    },
  };

  const levelInfo =
    levelBadgeConfig[tech.technician_level] || levelBadgeConfig.beginner;

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--border-color)',
        transition: 'background-color 0.2s',
      }}
    >
      {/* Detail Profil */}
      <td
        style={{
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#F3F4F6',
            flexShrink: 0,
            border: '1px solid var(--border-color)',
          }}
        >
          {tech.photo_url ? (
            <img
              src={tech.photo_url}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <ImageIcon color="#A3A3A3" style={{ margin: '12px' }} />
          )}
        </div>
        <div>
          <div
            style={{
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          >
            {tech.technician_name}
          </div>
          <div
            style={{
              fontSize: '0.775rem',
              color: 'var(--text-secondary)',
            }}
          >
            {tech.technician_id} • Level:{' '}
            <span
              style={{
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {tech.technician_level}
            </span>
          </div>
        </div>
      </td>

      {/* Cabang */}
      <td
        style={{
          padding: '1.25rem',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
        }}
      >
        <div style={{ fontWeight: 600 }}>{tech.branch}</div>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          {tech.service_center || '-'}
        </div>
      </td>

      {/* Performa dengan Quick-Peek Popover 6 Indikator */}
      <td
        style={{
          padding: '1.25rem',
          fontSize: '0.875rem',
          position: 'relative',
        }}
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
      >
        {perf ? (
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
              }}
              onClick={() => setShowPopover((prev) => !prev)}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                }}
              >
                {perf.kpi_score ?? perf.performance_score}%
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: levelInfo.bg,
                  color: levelInfo.text,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: levelInfo.dot,
                  }}
                />
                {levelInfo.label}
              </span>
              <Info
                size={14}
                style={{
                  color: showPopover ? 'var(--accent-red)' : 'var(--text-muted)',
                  transition: 'color 0.15s',
                }}
              />
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                marginTop: '0.2rem',
              }}
            >
              Periode: {perf.period}
            </div>

            {/* QUICK-PEEK POPOVER (6 INDIKATOR EVALUASI HYBRID) */}
            {showPopover && (
              <div
                style={{
                  position: 'absolute',
                  top: '80%',
                  left: '1rem',
                  zIndex: 50,
                  width: '275px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  boxShadow:
                    '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid var(--border-color)',
                  padding: '0.85rem',
                  pointerEvents: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '0.5rem',
                    marginBottom: '0.6rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                    }}
                  >
                    6 Indikator Evaluasi
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {perf.period}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    fontSize: '0.775rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      TAT <span style={{ fontSize: '0.7rem' }}>(20%)</span>
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {perf.tat ?? perf.kpi_score ?? '-'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      RTAT <span style={{ fontSize: '0.7rem' }}>(15%)</span>
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {perf.rtat ?? '-'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      CSAT <span style={{ fontSize: '0.7rem' }}>(25%)</span>
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {perf.csat ?? (perf.csi_score ? perf.csi_score * 10 : '-')}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Penampilan <span style={{ fontSize: '0.7rem' }}>(10%)</span>
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {perf.grooming_score ?? '-'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Pelayanan <span style={{ fontSize: '0.7rem' }}>(15%)</span>
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {perf.service_score ?? '-'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Hasil Perbaikan <span style={{ fontSize: '0.7rem' }}>(15%)</span>
                    </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {perf.repair_quality_score ?? '-'}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '0.6rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px dashed var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    Skor Total KPI
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      color: 'var(--accent-red)',
                    }}
                  >
                    {perf.kpi_score ?? perf.performance_score}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            Belum ada data
          </span>
        )}
      </td>

      {/* Info ID Card */}
      <td style={{ padding: '1.25rem', fontSize: '0.875rem' }}>
        {card ? (
          <div>
            <div style={{ fontWeight: 600 }}>{card.card_number}</div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}
            >
              Exp: {card.expiry_date}
            </div>
          </div>
        ) : (
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            Belum terbit
          </span>
        )}
      </td>

      {/* Status Aktif */}
      <td style={{ padding: '1.25rem' }}>
        <button
          onClick={() => onToggleActive(tech.id, tech.technician_status)}
          style={{
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor:
              tech.technician_status === 'active'
                ? 'var(--status-active-glow)'
                : 'var(--status-inactive-glow)',
            color:
              tech.technician_status === 'active'
                ? 'var(--status-active)'
                : 'var(--status-inactive)',
            border: '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {tech.technician_status === 'active' ? 'AKTIF' : 'NONAKTIF'}
        </button>
      </td>

      {/* Aksi */}
      <td style={{ padding: '1.25rem', textAlign: 'right' }}>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={() => onPrint(tech)}
            style={{
              padding: '6px',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
            title="Cetak ID Card"
          >
            <Printer size={18} />
          </button>
          <button
            onClick={() => onRegenerateQR(tech)}
            style={{
              padding: '6px',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
            title="Regenerasi QR Code Token"
          >
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={() => onEdit(tech)}
            style={{
              padding: '6px',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
            title="Edit Data"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(tech.id)}
            style={{
              padding: '6px',
              background: 'transparent',
              color: 'var(--accent-red)',
              cursor: 'pointer',
            }}
            title="Hapus Data"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};
