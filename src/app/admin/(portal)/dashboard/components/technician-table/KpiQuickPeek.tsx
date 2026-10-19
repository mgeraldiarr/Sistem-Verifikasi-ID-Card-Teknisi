// src/app/admin/(portal)/dashboard/components/technician-table/KpiQuickPeek.tsx
'use client';

import React from 'react';
import { KpiWeights } from '@/lib/kpi';
import { TechnicianPerformance } from '@/types';
import styles from './TechnicianTable.module.css';

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
  { label: 'Hasil perbaikan', weightKey: 'repair_quality', value: (p) => p.repair_quality_score },
];

/** Popover ringkas 6 indikator evaluasi dan skor total KPI periode terakhir. */
export const KpiQuickPeek: React.FC<{ perf: TechnicianPerformance; kpiWeights: KpiWeights }> = ({
  perf,
  kpiWeights,
}) => (
  <div role="tooltip" className={`popover ${styles.peek}`}>
    <div className={styles.peekHead}>
      Indikator evaluasi
      <span>{perf.period}</span>
    </div>

    <dl>
      {INDICATOR_ROWS.map((row) => (
        <div key={row.label} className={styles.peekRow}>
          <dt>
            {row.label} <small>bobot {kpiWeights[row.weightKey]}%</small>
          </dt>
          <dd>{row.value(perf) ?? '-'}</dd>
        </div>
      ))}
    </dl>

    <div className={styles.peekTotal}>
      Skor total
      <strong>{perf.kpi_score ?? perf.performance_score}%</strong>
    </div>
  </div>
);
