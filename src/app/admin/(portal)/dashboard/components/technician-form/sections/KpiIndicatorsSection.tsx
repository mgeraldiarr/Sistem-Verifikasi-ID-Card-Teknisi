// src/app/admin/(portal)/dashboard/components/technician-form/sections/KpiIndicatorsSection.tsx
'use client';

import React from 'react';
import { KpiWeights } from '@/lib/kpi';
import { TechnicianFormData, TechnicianLevel } from '@/types';
import { KPI_FIELDS, KpiFieldKey } from '../form-config';
import { fieldClass, formStyles, FormSection, LabelAside, RequiredMark } from '../form-styles';

interface KpiIndicatorsSectionProps {
  formData: TechnicianFormData;
  kpiWeights: KpiWeights;
  liveKpiScore: number;
  liveLevel: TechnicianLevel;
  onScoreChange: (field: KpiFieldKey, value: number | undefined) => void;
  hasError: (field: string) => boolean;
}

const LEVEL_LABEL: Record<TechnicianLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advance: 'Advance',
};

/** 6 indikator evaluasi wajib + pratinjau skor terbobot dan level otomatis. */
export const KpiIndicatorsSection: React.FC<KpiIndicatorsSectionProps> = ({
  formData,
  kpiWeights,
  liveKpiScore,
  liveLevel,
  onScoreChange,
  hasError,
}) => (
  <FormSection
    title="Penilaian kinerja"
    aside={<span className="hint">Skor 0–100 per indikator</span>}
  >
    {/* 2 baris x 3 kolom: TAT, RTAT, CSAT / Penampilan, Pelayanan, Hasil Perbaikan */}
    <div className="grid-3">
      {KPI_FIELDS.map((kpi) => (
        <div key={kpi.field} className="field">
          <label htmlFor={kpi.inputId} className="label">
            {kpi.label} <RequiredMark />
            <LabelAside>{kpiWeights[kpi.weightKey]}%</LabelAside>
          </label>
          <input
            id={kpi.inputId}
            name={kpi.field}
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.1"
            value={formData[kpi.field] ?? ''}
            onChange={(e) =>
              onScoreChange(kpi.field, e.target.value === '' ? undefined : parseFloat(e.target.value))
            }
            className={`${fieldClass('input', hasError(kpi.field))} tnum`}
            placeholder="0–100"
          />
        </div>
      ))}
    </div>

    {/* PRATINJAU SKOR & LEVEL (REAL-TIME) */}
    <div className={formStyles.scoreLine} aria-live="polite">
      <div>
        <div className={formStyles.scoreLabel}>Skor KPI terbobot</div>
        <div className={formStyles.score}>{liveKpiScore}%</div>
      </div>
      <div className={formStyles.levelTag}>
        <div className={formStyles.scoreLabel}>Level ditentukan otomatis</div>
        <div className={`level level-${liveLevel}`}>{LEVEL_LABEL[liveLevel]}</div>
      </div>
    </div>
  </FormSection>
);
