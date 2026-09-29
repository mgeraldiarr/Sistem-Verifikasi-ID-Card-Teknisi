// src/app/admin/(portal)/dashboard/components/skill-distribution/SkillDistributionWidget.tsx
'use client';

import React from 'react';
import { Award, Calendar, MapPin, Users } from 'lucide-react';
import { TechnicianLevel } from '@/types';
import { SkillDistributionStats } from '../../utils/dashboard-stats';
import { AveragePerformanceCard, LevelCardTheme, LevelStatCard } from './SkillStatCards';

interface SkillDistributionWidgetProps {
  stats: SkillDistributionStats;
  periodLabel: string;
  branchLabel: string;
  loading?: boolean;
}

const LEVELS: { level: TechnicianLevel; theme: LevelCardTheme }[] = [
  {
    level: 'beginner',
    theme: {
      label: 'BEGINNER',
      rangeLabel: 'Skor < 70',
      accent: '#10B981',
      background: '#F0FDF4',
      border: '#BBF7D0',
      labelColor: '#15803D',
      countColor: '#14532D',
      rangeBackground: '#DCFCE7',
      rangeColor: '#166534',
    },
  },
  {
    level: 'intermediate',
    theme: {
      label: 'INTERMEDIATE',
      rangeLabel: 'Skor 70 - 84',
      accent: '#F59E0B',
      background: '#FFFBEB',
      border: '#FDE68A',
      labelColor: '#B45309',
      countColor: '#78350F',
      rangeBackground: '#FEF3C7',
      rangeColor: '#92400E',
    },
  },
  {
    level: 'advance',
    theme: {
      label: 'ADVANCE',
      rangeLabel: 'Skor ≥ 85',
      accent: '#3B82F6',
      background: '#EFF6FF',
      border: '#BFDBFE',
      labelColor: '#1D4ED8',
      countColor: '#1E3A8A',
      rangeBackground: '#DBEAFE',
      rangeColor: '#1E40AF',
    },
  },
];

function levelNumbers(stats: SkillDistributionStats, level: TechnicianLevel) {
  if (level === 'beginner') return { count: stats.beginnerCount, percent: stats.beginnerPercent };
  if (level === 'intermediate') {
    return { count: stats.intermediateCount, percent: stats.intermediatePercent };
  }
  return { count: stats.advanceCount, percent: stats.advancePercent };
}

const ContextBadge: React.FC<{
  icon: React.ReactNode;
  background: string;
  color: string;
  border: string;
  bold?: boolean;
  children: React.ReactNode;
}> = ({ icon, background, color, border, bold = false, children }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: bold ? 700 : 600,
      backgroundColor: background,
      color,
      border: `1px solid ${border}`,
    }}
  >
    {icon}
    <span>{children}</span>
  </div>
);

/** Proporsi level teknisi (bar bertumpuk + kartu per level) dan rata-rata KPI/CSI. */
export const SkillDistributionWidget: React.FC<SkillDistributionWidgetProps> = ({
  stats,
  periodLabel,
  branchLabel,
  loading = false,
}) => (
  <section
    aria-label="Widget Distribusi Skill Teknisi"
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid var(--border-color, #E5E7EB)',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
    }}
  >
    {/* HEADER: judul & badge konteks */}
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        paddingBottom: '0.875rem',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#1C1C1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ECE8DA',
          }}
        >
          <Award size={18} />
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary, #1C1C1A)',
            }}
          >
            Distribusi Skill & Tracking Performa Teknisi
          </h3>
          <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--text-secondary, #6B7280)' }}>
            Proporsi kompetensi dan pencapaian standar KPI teknisi MODENA
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <ContextBadge
          icon={<MapPin size={12} color="#4B5563" />}
          background="#F3F4F6"
          color="#374151"
          border="#E5E7EB"
        >
          {branchLabel}
        </ContextBadge>
        <ContextBadge
          icon={<Calendar size={12} color="#B45309" />}
          background="#FEF3C7"
          color="#92400E"
          border="#FDE68A"
          bold
        >
          {periodLabel}
        </ContextBadge>
        <ContextBadge
          icon={<Users size={12} color="#2563EB" />}
          background="#EFF6FF"
          color="#1E40AF"
          border="#BFDBFE"
        >
          Total: <strong>{stats.total}</strong> Personel
        </ContextBadge>
      </div>
    </div>

    {/* BAR PROPORSI BERTUMPUK */}
    <div style={{ marginBottom: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.4rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-secondary, #6B7280)',
        }}
      >
        <span>Proporsi Kategori Skill:</span>
        <span>{stats.total > 0 ? `${stats.total} Teknisi Terdata` : '0 Data'}</span>
      </div>

      <div
        style={{
          width: '100%',
          height: '12px',
          borderRadius: '999px',
          backgroundColor: stats.total > 0 ? '#F3F4F6' : '#E5E7EB',
          overflow: 'hidden',
          display: 'flex',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.06)',
        }}
      >
        {stats.total > 0 &&
          LEVELS.map(({ level, theme }) => {
            const { count, percent } = levelNumbers(stats, level);
            if (percent <= 0) return null;
            return (
              <div
                key={level}
                title={`${theme.label.charAt(0)}${theme.label.slice(1).toLowerCase()}: ${count} (${percent}%)`}
                style={{
                  width: `${percent}%`,
                  backgroundColor: theme.accent,
                  height: '100%',
                  transition: 'width 0.4s ease-out',
                }}
              />
            );
          })}
      </div>
    </div>

    {/* KARTU PER LEVEL + RATA-RATA */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '0.875rem',
      }}
    >
      {LEVELS.map(({ level, theme }) => {
        const { count, percent } = levelNumbers(stats, level);
        return (
          <LevelStatCard key={level} theme={theme} count={count} percent={percent} loading={loading} />
        );
      })}
      <AveragePerformanceCard avgKpi={stats.avgKpi} avgCsi={stats.avgCsi} loading={loading} />
    </div>
  </section>
);
