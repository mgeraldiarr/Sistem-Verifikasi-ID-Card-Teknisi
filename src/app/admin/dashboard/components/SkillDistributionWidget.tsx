// src/app/admin/dashboard/components/SkillDistributionWidget.tsx
'use client';

import React from 'react';
import { Award, TrendingUp, Users, Calendar, MapPin } from 'lucide-react';

export interface SkillDistributionStats {
  total: number;
  beginnerCount: number;
  beginnerPercent: number;
  intermediateCount: number;
  intermediatePercent: number;
  advanceCount: number;
  advancePercent: number;
  avgKpi: number;
  avgCsi: number;
}

interface SkillDistributionWidgetProps {
  stats: SkillDistributionStats;
  periodLabel: string;
  branchLabel: string;
  loading?: boolean;
}

export const SkillDistributionWidget: React.FC<SkillDistributionWidgetProps> = ({
  stats,
  periodLabel,
  branchLabel,
  loading = false,
}) => {
  return (
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
      {/* HEADER WIDGET: Judul & Badge Konteks YTD / Cabang */}
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
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Distribusi Skill & Tracking Performa Teknisi
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '0.775rem',
                color: 'var(--text-secondary, #6B7280)',
              }}
            >
              Proporsi kompetensi dan pencapaian standar KPI teknisi MODENA
            </p>
          </div>
        </div>

        {/* BADGES: Periode YTD & Lingkup Cabang */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Badge Cabang */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: '1px solid #E5E7EB',
            }}
          >
            <MapPin size={12} color="#4B5563" />
            <span>{branchLabel}</span>
          </div>

          {/* Badge YTD Dinamis */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A',
            }}
          >
            <Calendar size={12} color="#B45309" />
            <span>{periodLabel}</span>
          </div>

          {/* Badge Total Teknisi Terfilter */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              border: '1px solid #BFDBFE',
            }}
          >
            <Users size={12} color="#2563EB" />
            <span>Total: <strong>{stats.total}</strong> Personel</span>
          </div>
        </div>
      </div>

      {/* VISUAL STACKED DISTRIBUTION BAR */}
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

        {/* Stacked Progress Bar Multi-Segmen */}
        <div
          style={{
            width: '100%',
            height: '12px',
            borderRadius: '999px',
            backgroundColor: '#F3F4F6',
            overflow: 'hidden',
            display: 'flex',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.06)',
          }}
        >
          {stats.total > 0 ? (
            <>
              {/* Segmen Beginner 🟢 */}
              {stats.beginnerPercent > 0 && (
                <div
                  title={`Beginner: ${stats.beginnerCount} (${stats.beginnerPercent}%)`}
                  style={{
                    width: `${stats.beginnerPercent}%`,
                    backgroundColor: '#10B981',
                    height: '100%',
                    transition: 'width 0.4s ease-out',
                  }}
                />
              )}
              {/* Segmen Intermediate 🟡 */}
              {stats.intermediatePercent > 0 && (
                <div
                  title={`Intermediate: ${stats.intermediateCount} (${stats.intermediatePercent}%)`}
                  style={{
                    width: `${stats.intermediatePercent}%`,
                    backgroundColor: '#F59E0B',
                    height: '100%',
                    transition: 'width 0.4s ease-out',
                  }}
                />
              )}
              {/* Segmen Advance 🔵 */}
              {stats.advancePercent > 0 && (
                <div
                  title={`Advance: ${stats.advanceCount} (${stats.advancePercent}%)`}
                  style={{
                    width: `${stats.advancePercent}%`,
                    backgroundColor: '#3B82F6',
                    height: '100%',
                    transition: 'width 0.4s ease-out',
                  }}
                />
              )}
            </>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#E5E7EB',
              }}
            />
          )}
        </div>
      </div>

      {/* 3 KARTU KATEGORI SKILL + 1 KARTU RATA-RATA KPI */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '0.875rem',
        }}
      >
        {/* 1. KARTU BEGINNER 🟢 */}
        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                }}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#15803D',
                  letterSpacing: '0.04em',
                }}
              >
                BEGINNER
              </span>
            </div>
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#DCFCE7',
                color: '#166534',
              }}
            >
              Skor &lt; 70
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#14532D',
                lineHeight: 1,
              }}
            >
              {loading ? '...' : stats.beginnerCount}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 600 }}>
              Teknisi
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#15803D',
              }}
            >
              {loading ? '...' : `${stats.beginnerPercent}%`}
            </span>
          </div>
        </div>

        {/* 2. KARTU INTERMEDIATE 🟡 */}
        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#F59E0B',
                }}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#B45309',
                  letterSpacing: '0.04em',
                }}
              >
                INTERMEDIATE
              </span>
            </div>
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
              }}
            >
              Skor 70 - 84
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#78350F',
                lineHeight: 1,
              }}
            >
              {loading ? '...' : stats.intermediateCount}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#B45309', fontWeight: 600 }}>
              Teknisi
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#B45309',
              }}
            >
              {loading ? '...' : `${stats.intermediatePercent}%`}
            </span>
          </div>
        </div>

        {/* 3. KARTU ADVANCE 🔵 */}
        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#3B82F6',
                }}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1D4ED8',
                  letterSpacing: '0.04em',
                }}
              >
                ADVANCE
              </span>
            </div>
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#DBEAFE',
                color: '#1E40AF',
              }}
            >
              Skor &ge; 85
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#1E3A8A',
                lineHeight: 1,
              }}
            >
              {loading ? '...' : stats.advanceCount}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#1D4ED8', fontWeight: 600 }}>
              Teknisi
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#1D4ED8',
              }}
            >
              {loading ? '...' : `${stats.advancePercent}%`}
            </span>
          </div>
        </div>

        {/* 4. KARTU RATA-RATA KPI & CSI 📊 */}
        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            backgroundColor: '#FAF9F6',
            border: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <TrendingUp size={14} color="#4B5563" />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#374151',
                  letterSpacing: '0.04em',
                }}
              >
                RATA-RATA PERFORMA
              </span>
            </div>
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#ECE8DA',
                color: '#1C1C1A',
              }}
            >
              YTD Metric
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.725rem', color: '#6B7280', display: 'block' }}>
                Skor KPI:
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1C1C1A' }}>
                {loading ? '...' : `${stats.avgKpi}%`}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.725rem', color: '#6B7280', display: 'block' }}>
                Indeks CSI:
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1C1C1A' }}>
                {loading ? '...' : `${stats.avgCsi}`}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>/10</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
