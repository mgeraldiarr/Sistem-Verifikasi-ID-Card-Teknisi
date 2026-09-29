// src/app/admin/(portal)/dashboard/components/technician-table/KpiQuickPeek.tsx
'use client';

import React from 'react';
import { KpiWeights } from '@/lib/kpi';
import { TechnicianPerformance } from '@/types';

interface IndicatorRow {
  label: string;
  weightKey: keyof KpiWeights;
  value: (perf: TechnicianPerformance) => number | string | null | undefined;
}

const INDICATOR_ROWS: IndicatorRow[] = [
  { label: 'TAT', weightKey: 'tat', value: (p) => p.tat ?? p.kpi_score },
  { label: 'RTAT', weightKey: 'rtat', value: (p) => p.rtat },
  // Data lama hanya punya csi_score (skala 1-10)
  { label: 'CSAT', weightKey: 'csat', value: (p) => p.csat ?? (p.csi_score ? p.csi_score * 10 : null) },
  { label: 'Penampilan', weightKey: 'grooming', value: (p) => p.grooming_score },
  { label: 'Pelayanan', weightKey: 'service', value: (p) => p.service_score },
  { label: 'Hasil Perbaikan', weightKey: 'repair_quality', value: (p) => p.repair_quality_score },
];

/** Popover ringkas 6 indikator evaluasi dan skor total KPI periode terakhir. */
export const KpiQuickPeek: React.FC<{ perf: TechnicianPerformance; kpiWeights: KpiWeights }> = ({
  perf,
  kpiWeights,
}) => (
  <div
    role="tooltip"
    style={{
      position: 'absolute',
      top: '80%',
      left: '1rem',
      zIndex: 50,
      width: '275px',
      backgroundColor: '#FFFFFF',
      borderRadius: '10px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
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
      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
        {perf.period}
      </span>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.775rem' }}>
      {INDICATOR_ROWS.map((row) => (
        <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {row.label} <span style={{ fontSize: '0.7rem' }}>({kpiWeights[row.weightKey]}%)</span>
          </span>
          <strong style={{ color: 'var(--text-primary)' }}>{row.value(perf) ?? '-'}</strong>
        </div>
      ))}
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
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        Skor Total KPI
      </span>
      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent-red)' }}>
        {perf.kpi_score ?? perf.performance_score}%
      </span>
    </div>
  </div>
);
