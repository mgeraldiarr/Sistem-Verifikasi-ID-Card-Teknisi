// src/app/admin/(portal)/dashboard/components/skill-distribution/SkillDistributionWidget.tsx
'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { TechnicianLevel } from '@/types';
import { SkillDistributionStats } from '../../utils/dashboard-stats';
import styles from './SkillDistributionWidget.module.css';

interface SkillDistributionWidgetProps {
  stats: SkillDistributionStats;
  loading?: boolean;
}

const LEVELS: { level: TechnicianLevel; label: string; range: string }[] = [
  { level: 'beginner', label: 'Beginner', range: '< 70' },
  { level: 'intermediate', label: 'Intermediate', range: '70–84' },
  { level: 'advance', label: 'Advance', range: '≥ 85' },
];

function levelNumbers(stats: SkillDistributionStats, level: TechnicianLevel) {
  if (level === 'beginner') return { count: stats.beginnerCount, percent: stats.beginnerPercent };
  if (level === 'intermediate') return { count: stats.intermediateCount, percent: stats.intermediatePercent };
  return { count: stats.advanceCount, percent: stats.advancePercent };
}

/** Proporsi level teknisi (bar bertumpuk + legenda) dan rata-rata KPI/CSI dengan skeleton loading. */
export const SkillDistributionWidget: React.FC<SkillDistributionWidgetProps> = ({
  stats,
  loading = false,
}) => {
  return (
    <section aria-label="Distribusi level teknisi" className={`panel ${styles.widget}`}>
      <div className={styles.distribution}>
        <div className={styles.headline}>
          <span className={styles.total}>
            {loading ? <Skeleton width="54px" height="32px" radius="6px" /> : stats.total}
          </span>
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
          {loading ? (
            <Skeleton width="100%" height="8px" radius="999px" />
          ) : (
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
            })
          )}
        </div>

        <dl className={styles.legend}>
          {LEVELS.map(({ level, label, range }) => {
            const { count, percent } = levelNumbers(stats, level);
            return (
              <div key={level} className={styles.legendItem}>
                <dt className={`level level-${level}`}>{label}</dt>
                <dd>
                  <span className={styles.count}>
                    {loading ? <Skeleton width="28px" height="18px" /> : count}
                  </span>
                  <span className={styles.percent}>
                    {loading ? <Skeleton width="36px" height="18px" /> : `${percent}%`}
                  </span>
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
            {loading ? (
              <Skeleton width="56px" height="28px" radius="6px" />
            ) : (
              <>
                {stats.avgKpi}
                <small>%</small>
              </>
            )}
          </dd>
        </div>
        <div>
          <dt>Rata-rata indeks CSI</dt>
          <dd className={styles.metric}>
            {loading ? (
              <Skeleton width="56px" height="28px" radius="6px" />
            ) : (
              <>
                {stats.avgCsi}
                <small>/10</small>
              </>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
};
