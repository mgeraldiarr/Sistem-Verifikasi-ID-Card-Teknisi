// src/app/admin/(portal)/dashboard/components/skill-distribution/SkillDistributionWidget.tsx
'use client';

import React from 'react';
import { TechnicianLevel } from '@/types';
import { SkillDistributionStats } from '../../utils/dashboard-stats';
import styles from './SkillDistributionWidget.module.css';

interface SkillDistributionWidgetProps {
  stats: SkillDistributionStats;
  loading?: boolean;
}

const LEVELS: { level: TechnicianLevel; label: string; range: string }[] = [
  { level: 'beginner', label: 'Beginner', range: 'skor di bawah 70' },
  { level: 'intermediate', label: 'Intermediate', range: 'skor 70–84' },
  { level: 'advance', label: 'Advance', range: 'skor 85 ke atas' },
];

function levelNumbers(stats: SkillDistributionStats, level: TechnicianLevel) {
  if (level === 'beginner') return { count: stats.beginnerCount, percent: stats.beginnerPercent };
  if (level === 'intermediate') {
    return { count: stats.intermediateCount, percent: stats.intermediatePercent };
  }
  return { count: stats.advanceCount, percent: stats.advancePercent };
}

/** Proporsi level teknisi (bar bertumpuk + legenda) dan rata-rata KPI/CSI. */
export const SkillDistributionWidget: React.FC<SkillDistributionWidgetProps> = ({
  stats,
  loading = false,
}) => {
  const show = (value: React.ReactNode) => (loading ? '–' : value);

  return (
    <section aria-label="Distribusi level teknisi" className={`panel ${styles.widget}`}>
      <div className={styles.distribution}>
        <div className={styles.headline}>
          <span className={styles.total}>{show(stats.total)}</span>
          <span className={styles.totalLabel}>teknisi terdata, dibagi per level kompetensi</span>
        </div>

        <div
          className={styles.bar}
          role="img"
          aria-label={LEVELS.map(({ level, label }) => {
            const { count, percent } = levelNumbers(stats, level);
            return `${label} ${count} (${percent}%)`;
          }).join(', ')}
        >
          {!loading &&
            stats.total > 0 &&
            LEVELS.map(({ level }) => {
              const { percent } = levelNumbers(stats, level);
              if (percent <= 0) return null;
              return (
                <span
                  key={level}
                  className={`${styles.segment} ${styles[level]}`}
                  style={{ width: `${percent}%` }}
                />
              );
            })}
        </div>

        <dl className={styles.legend}>
          {LEVELS.map(({ level, label, range }) => {
            const { count, percent } = levelNumbers(stats, level);
            return (
              <div key={level} className={styles.legendItem}>
                <dt className={`level level-${level}`}>{label}</dt>
                <dd>
                  <span className={styles.count}>{show(count)}</span>
                  <span className={styles.percent}>{show(`${percent}%`)}</span>
                </dd>
                <dd className={styles.range}>{range}</dd>
              </div>
            );
          })}
        </dl>
      </div>

      <dl className={styles.averages}>
        <div>
          <dt>Rata-rata skor KPI</dt>
          <dd className={styles.metric}>
            {show(stats.avgKpi)}
            <small>%</small>
          </dd>
        </div>
        <div>
          <dt>Rata-rata indeks CSI</dt>
          <dd className={styles.metric}>
            {show(stats.avgCsi)}
            <small>/10</small>
          </dd>
        </div>
      </dl>
    </section>
  );
};
