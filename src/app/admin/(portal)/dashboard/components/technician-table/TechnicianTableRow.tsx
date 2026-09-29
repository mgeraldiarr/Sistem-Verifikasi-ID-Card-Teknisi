// src/app/admin/(portal)/dashboard/components/technician-table/TechnicianTableRow.tsx
'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Info } from 'lucide-react';
import { DEFAULT_KPI_WEIGHTS, KpiWeights } from '@/lib/kpi';
import { Technician, TechnicianLevel, TechnicianStatus } from '@/types';
import { KpiQuickPeek } from './KpiQuickPeek';
import { TechnicianActionHandlers, TechnicianRowActions } from './TechnicianRowActions';

export interface TechnicianTableRowProps extends TechnicianActionHandlers {
  tech: Technician;
  onToggleActive: (id: string, status: TechnicianStatus) => void;
  /** Admin Cabang tidak memiliki hak hapus data teknisi */
  canDelete?: boolean;
  /** Bobot KPI aktif untuk label indikator */
  kpiWeights?: KpiWeights;
}

// Warna level konsisten dengan widget distribusi skill
const LEVEL_BADGE: Record<TechnicianLevel, { label: string; bg: string; text: string; dot: string }> = {
  beginner: { label: 'Beginner', bg: 'rgba(16, 185, 129, 0.12)', text: '#047857', dot: '#10B981' },
  intermediate: {
    label: 'Intermediate',
    bg: 'rgba(245, 158, 11, 0.12)',
    text: '#B45309',
    dot: '#F59E0B',
  },
  advance: { label: 'Advance', bg: 'rgba(59, 130, 246, 0.12)', text: '#1D4ED8', dot: '#3B82F6' },
};

const cellStyle: React.CSSProperties = { padding: '1.25rem' };
const mutedTextStyle: React.CSSProperties = { color: 'var(--text-muted)', fontSize: '0.8rem' };
const subTextStyle: React.CSSProperties = { fontSize: '0.75rem', color: 'var(--text-secondary)' };

export const TechnicianTableRow: React.FC<TechnicianTableRowProps> = ({
  tech,
  onToggleActive,
  canDelete = true,
  kpiWeights = DEFAULT_KPI_WEIGHTS,
  ...actions
}) => {
  const [showPeek, setShowPeek] = useState(false);
  const card = tech.technician_id_cards?.[0];
  const perf = tech.technician_performance?.[0];
  const level = LEVEL_BADGE[tech.technician_level] || LEVEL_BADGE.beginner;
  const isActive = tech.technician_status === 'active';

  return (
    <tr style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
      {/* PROFIL */}
      <td style={{ ...cellStyle, display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ImageIcon color="#A3A3A3" style={{ margin: '12px' }} />
          )}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            {tech.technician_name}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
            {tech.technician_id} • Level:{' '}
            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
              {tech.technician_level}
            </span>
          </div>
        </div>
      </td>

      {/* CABANG */}
      <td style={{ ...cellStyle, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
        <div style={{ fontWeight: 600 }}>{tech.branch}</div>
        <div style={subTextStyle}>{tech.service_center || '-'}</div>
      </td>

      {/* PERFORMA + popover 6 indikator */}
      <td
        style={{ ...cellStyle, fontSize: '0.875rem', position: 'relative' }}
        onMouseEnter={() => setShowPeek(true)}
        onMouseLeave={() => setShowPeek(false)}
      >
        {perf ? (
          <div>
            <div
              onClick={() => setShowPeek((prev) => !prev)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
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
                  backgroundColor: level.bg,
                  color: level.text,
                }}
              >
                <span
                  style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: level.dot }}
                />
                {level.label}
              </span>
              <Info
                size={14}
                style={{
                  color: showPeek ? 'var(--accent-red)' : 'var(--text-muted)',
                  transition: 'color 0.15s',
                }}
              />
            </div>
            <div style={{ ...subTextStyle, marginTop: '0.2rem' }}>Periode: {perf.period}</div>
            {showPeek && <KpiQuickPeek perf={perf} kpiWeights={kpiWeights} />}
          </div>
        ) : (
          <span style={mutedTextStyle}>Belum ada data</span>
        )}
      </td>

      {/* KARTU ID */}
      <td style={{ ...cellStyle, fontSize: '0.875rem' }}>
        {card ? (
          <div>
            <div style={{ fontWeight: 600 }}>{card.card_number}</div>
            <div style={subTextStyle}>Exp: {card.expiry_date}</div>
          </div>
        ) : (
          <span style={mutedTextStyle}>Belum terbit</span>
        )}
      </td>

      {/* STATUS AKTIF */}
      <td style={cellStyle}>
        <button
          type="button"
          onClick={() => onToggleActive(tech.id, tech.technician_status)}
          style={{
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            backgroundColor: isActive ? 'var(--status-active-glow)' : 'var(--status-inactive-glow)',
            color: isActive ? 'var(--status-active)' : 'var(--status-inactive)',
            border: '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isActive ? 'AKTIF' : 'NONAKTIF'}
        </button>
      </td>

      {/* AKSI */}
      <td style={{ ...cellStyle, textAlign: 'right' }}>
        <TechnicianRowActions tech={tech} canDelete={canDelete} {...actions} />
      </td>
    </tr>
  );
};
