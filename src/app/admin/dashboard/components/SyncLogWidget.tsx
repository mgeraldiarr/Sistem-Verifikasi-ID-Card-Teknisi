// src/app/admin/dashboard/components/SyncLogWidget.tsx
'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { SyncLog } from '@/types';
import { formatTimeWIB } from '@/lib/formatters';

interface SyncLogWidgetProps {
  lastSyncLog: SyncLog | null;
  lastFileName: string | null;
  onRefresh: () => void;
}

export const SyncLogWidget: React.FC<SyncLogWidgetProps> = ({
  lastSyncLog,
  lastFileName,
  onRefresh,
}) => {
  if (!lastSyncLog) return null;

  const borderColor =
    lastSyncLog.status === 'success'
      ? 'var(--status-active)'
      : lastSyncLog.status === 'partial'
        ? '#F59E0B'
        : 'var(--status-inactive)';

  return (
    <div
      className="modena-card"
      style={{
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeft: `4px solid ${borderColor}`,
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem',
          }}
        >
          {lastSyncLog.status === 'success' ? (
            <CheckCircle2 size={16} color="var(--status-active)" />
          ) : (
            <AlertCircle
              size={16}
              color={
                lastSyncLog.status === 'partial'
                  ? '#F59E0B'
                  : 'var(--status-inactive)'
              }
            />
          )}
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
            }}
          >
            Sinkronisasi Excel Terakhir: {lastSyncLog.status.toUpperCase()}
          </span>
        </div>
        {lastFileName && (
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.15rem',
            }}
          >
            File:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {lastFileName}
            </strong>
          </div>
        )}
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Selesai pada:{' '}
          {formatTimeWIB(lastSyncLog.end_time || lastSyncLog.start_time)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>
            {lastSyncLog.total_records}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            Total Baris
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '1.15rem',
              color: 'var(--status-active)',
            }}
          >
            {lastSyncLog.new_records}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            Baru
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '1.15rem',
              color: '#3B82F6',
            }}
          >
            {lastSyncLog.updated_records}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            Diberbarui
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '1.15rem',
              color:
                lastSyncLog.error_count > 0
                  ? 'var(--status-inactive)'
                  : 'var(--text-secondary)',
            }}
          >
            {lastSyncLog.error_count}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            Gagal
          </div>
        </div>
      </div>

      <button
        onClick={onRefresh}
        className="modena-btn-secondary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '8px 16px',
          borderRadius: '4px',
        }}
      >
        <RefreshCw size={14} /> Segarkan
      </button>
    </div>
  );
};
