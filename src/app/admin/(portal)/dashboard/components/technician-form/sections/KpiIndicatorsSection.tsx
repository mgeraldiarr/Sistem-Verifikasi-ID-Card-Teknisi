// src/app/admin/(portal)/dashboard/components/technician-form/sections/KpiIndicatorsSection.tsx
'use client';

import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { KpiWeights } from '@/lib/kpi';
import { TechnicianFormData, TechnicianLevel } from '@/types';
import { KPI_FIELDS, KpiFieldKey } from '../form-config';
import { RequiredMark } from '../form-styles';

interface KpiIndicatorsSectionProps {
  formData: TechnicianFormData;
  kpiWeights: KpiWeights;
  liveKpiScore: number;
  liveLevel: TechnicianLevel;
  onScoreChange: (field: KpiFieldKey, value: number | undefined) => void;
  errorStyle: (field: string) => React.CSSProperties;
}

const LEVEL_BADGE: Record<TechnicianLevel, { bg: string; color: string }> = {
  advance: { bg: 'rgba(59, 130, 246, 0.15)', color: '#1D4ED8' },
  intermediate: { bg: 'rgba(245, 158, 11, 0.15)', color: '#B45309' },
  beginner: { bg: 'rgba(16, 185, 129, 0.15)', color: '#047857' },
};

const scoreInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.65rem',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  fontSize: '0.85rem',
  outline: 'none',
  backgroundColor: '#FFFFFF',
};

/** 6 indikator evaluasi wajib + pratinjau skor terbobot dan level otomatis. */
export const KpiIndicatorsSection: React.FC<KpiIndicatorsSectionProps> = ({
  formData,
  kpiWeights,
  liveKpiScore,
  liveLevel,
  onScoreChange,
  errorStyle,
}) => {
  const levelBadge = LEVEL_BADGE[liveLevel];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-light)',
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          Indikator Evaluasi Performa (6 Indikator Wajib)
        </span>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#059669',
            backgroundColor: '#d1fae5',
            padding: '2px 8px',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Lock size={12} /> Auto-Level Terkunci
        </span>
      </div>

      {/* 2 baris x 3 kolom: TAT, RTAT, CSAT / Penampilan, Pelayanan, Hasil Perbaikan */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        {KPI_FIELDS.map((kpi) => (
          <div key={kpi.field}>
            <label
              htmlFor={kpi.inputId}
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.25rem',
              }}
            >
              {kpi.label} ({kpiWeights[kpi.weightKey]}%) <RequiredMark />
            </label>
            <input
              id={kpi.inputId}
              name={kpi.field}
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData[kpi.field] ?? ''}
              onChange={(e) =>
                onScoreChange(
                  kpi.field,
                  e.target.value === '' ? undefined : parseFloat(e.target.value)
                )
              }
              style={{ ...scoreInputStyle, ...errorStyle(kpi.field) }}
              placeholder="0 - 100"
            />
          </div>
        ))}
      </div>

      {/* PRATINJAU SKOR & LEVEL (REAL-TIME) */}
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
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-red)' }}>
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
            Status Level Otomatis:
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: levelBadge.bg,
              color: levelBadge.color,
            }}
          >
            {liveLevel.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
