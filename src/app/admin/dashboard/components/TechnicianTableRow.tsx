// src/app/admin/dashboard/components/TechnicianTableRow.tsx
'use client';

import React from 'react';
import {
  Edit,
  Image as ImageIcon,
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

      {/* Performa */}
      <td style={{ padding: '1.25rem', fontSize: '0.875rem' }}>
        {perf ? (
          <div>
            <div>
              KPI:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {perf.kpi_score}%
              </strong>{' '}
              | CSI:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {perf.csi_score}/10
              </strong>
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
              }}
            >
              Periode: {perf.period}
            </div>
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
