// src/app/admin/(portal)/dashboard/components/SyncLogWidget.tsx
'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { SyncLog } from '@/types';
import { formatTimeWIB } from '@/lib/formatters';
import styles from './SyncLogWidget.module.css';

interface SyncLogWidgetProps {
  lastSyncLog: SyncLog | null;
  lastFileName: string | null;
  onRefresh: () => void;
}

const STATUS_TEXT: Record<SyncLog['status'], string> = {
  success: 'Upload Excel terakhir berhasil',
  partial: 'Upload Excel terakhir sebagian gagal',
  failed: 'Upload Excel terakhir gagal',
};

/** Ringkasan satu baris hasil upload Excel terakhir. */
export const SyncLogWidget: React.FC<SyncLogWidgetProps> = ({
  lastSyncLog,
  lastFileName,
  onRefresh,
}) => {
  if (!lastSyncLog) return null;

  const tone =
    lastSyncLog.status === 'success' ? styles.ok : lastSyncLog.status === 'partial' ? styles.warn : styles.bad;

  const counts = [
    { label: 'baris', value: lastSyncLog.total_records },
    { label: 'baru', value: lastSyncLog.new_records },
    { label: 'diperbarui', value: lastSyncLog.updated_records },
    { label: 'gagal', value: lastSyncLog.error_count, alert: lastSyncLog.error_count > 0 },
  ];

  return (
    <section aria-label="Hasil upload Excel terakhir" className={`${styles.bar} ${tone}`}>
      <div className={styles.summary}>
        {lastSyncLog.status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
        <div style={{ minWidth: 0 }}>
          <div className={styles.title}>{STATUS_TEXT[lastSyncLog.status] ?? 'Upload Excel terakhir'}</div>
          <div className={styles.meta}>
            {lastFileName && <span className={styles.file}>{lastFileName}, </span>}
            selesai {formatTimeWIB(lastSyncLog.end_time || lastSyncLog.start_time)}
          </div>
        </div>
      </div>

      <dl className={styles.counts}>
        {counts.map((item) => (
          <div key={item.label} className={item.alert ? styles.alert : undefined}>
            <dd>{item.value}</dd>
            <dt>{item.label}</dt>
          </div>
        ))}
      </dl>

      <button type="button" onClick={onRefresh} className="btn btn-ghost btn-sm">
        <RefreshCw size={14} />
        Muat ulang data
      </button>
    </section>
  );
};
