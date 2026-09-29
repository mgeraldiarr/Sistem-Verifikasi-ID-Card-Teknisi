// src/app/admin/(portal)/dashboard/components/skill-distribution/SkillStatCards.tsx
'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

export interface LevelCardTheme {
  label: string;
  rangeLabel: string;
  /** Warna segmen bar & titik indikator */
  accent: string;
  background: string;
  border: string;
  labelColor: string;
  countColor: string;
  rangeBackground: string;
  rangeColor: string;
}

const cardStyle: React.CSSProperties = {
  padding: '0.875rem 1rem',
  borderRadius: '10px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'relative',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
};

const tagStyle: React.CSSProperties = {
  fontSize: '0.675rem',
  fontWeight: 600,
  padding: '2px 6px',
  borderRadius: '4px',
};

/** Kartu jumlah & persentase teknisi pada satu level */
export const LevelStatCard: React.FC<{
  theme: LevelCardTheme;
  count: number;
  percent: number;
  loading: boolean;
}> = ({ theme, count, percent, loading }) => (
  <div style={{ ...cardStyle, backgroundColor: theme.background, border: `1px solid ${theme.border}` }}>
    <div style={cardHeaderStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span
          style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.accent }}
        />
        <span style={{ ...cardTitleStyle, color: theme.labelColor }}>{theme.label}</span>
      </div>
      <span style={{ ...tagStyle, backgroundColor: theme.rangeBackground, color: theme.rangeColor }}>
        {theme.rangeLabel}
      </span>
    </div>

    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.countColor, lineHeight: 1 }}>
        {loading ? '...' : count}
      </span>
      <span style={{ fontSize: '0.8rem', color: theme.labelColor, fontWeight: 600 }}>Teknisi</span>
      <span
        style={{
          marginLeft: 'auto',
          fontSize: '1.125rem',
          fontWeight: 700,
          color: theme.labelColor,
        }}
      >
        {loading ? '...' : `${percent}%`}
      </span>
    </div>
  </div>
);

/** Kartu rata-rata skor KPI & indeks CSI */
export const AveragePerformanceCard: React.FC<{
  avgKpi: number;
  avgCsi: number;
  loading: boolean;
}> = ({ avgKpi, avgCsi, loading }) => (
  <div style={{ ...cardStyle, backgroundColor: '#FAF9F6', border: '1px solid #E5E7EB' }}>
    <div style={cardHeaderStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <TrendingUp size={14} color="#4B5563" />
        <span style={{ ...cardTitleStyle, color: '#374151' }}>RATA-RATA PERFORMA</span>
      </div>
      <span style={{ ...tagStyle, backgroundColor: '#ECE8DA', color: '#1C1C1A' }}>YTD Metric</span>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <span style={{ fontSize: '0.725rem', color: '#6B7280', display: 'block' }}>Skor KPI:</span>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1C1C1A' }}>
          {loading ? '...' : `${avgKpi}%`}
        </span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: '0.725rem', color: '#6B7280', display: 'block' }}>Indeks CSI:</span>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1C1C1A' }}>
          {loading ? '...' : `${avgCsi}`}
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>/10</span>
        </span>
      </div>
    </div>
  </div>
);
