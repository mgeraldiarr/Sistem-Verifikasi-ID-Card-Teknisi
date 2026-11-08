// src/app/technician/grooming/components/GroomingSubmittedCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { GroomingReport } from '@/types';
import { formatWibTimestamp, getWeekDateRangeLabel } from '@/lib/grooming/period';
import styles from '../grooming.module.css';

interface GroomingSubmittedCardProps {
  report: GroomingReport;
  onBackToCard?: () => void;
}

export const GroomingSubmittedCard: React.FC<GroomingSubmittedCardProps> = ({ report, onBackToCard }) => {
  const isApproved = report.status === 'approved';
  const isRejected = report.status === 'rejected';

  return (
    <div className={styles.statusCard}>
      <div
        className={`${styles.statusIconWrap} ${
          isApproved
            ? styles.statusIconApproved
            : isRejected
              ? styles.statusIconRejected
              : styles.statusIconSubmitted
        }`}
      >
        {isApproved ? (
          <ShieldCheck size={32} />
        ) : isRejected ? (
          <ShieldAlert size={32} />
        ) : (
          <Clock size={32} />
        )} 
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
        {isApproved
          ? 'Grooming Memenuhi Standar'
          : isRejected
            ? 'Perlu Perbaikan Penampilan'
            : 'Laporan Berhasil Terkirim'}
      </h2>

      <p style={{ fontSize: '13.5px', color: 'var(--ink-2)', marginBottom: '16px' }}>
        {isApproved
          ? 'Penampilan & kerapian Anda telah ditinjau dan dinyatakan sesuai SOP resmi MODENA.'
          : isRejected
            ? 'Laporan grooming Anda ditolak oleh admin. Harap perhatikan catatan evaluasi di bawah.'
            : 'Laporan grooming minggu ini sedang menunggu verifikasi dari Admin Service Center.'}
      </p>

      {/* Detail Periode & Waktu */}
      <div
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--r-md)',
          padding: '12px 16px',
          textAlign: 'left',
          fontSize: '12.5px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--ink-3)' }}>Periode:</span>
          <strong>
            {report.period_week} ({getWeekDateRangeLabel(report.period_week)})
          </strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--ink-3)' }}>Waktu Submit:</span>
          <span>{formatWibTimestamp(new Date(report.submission_time))}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--ink-3)' }}>Kepatuhan Hari Senin:</span>
          <span style={{ color: report.is_monday ? '#16a34a' : '#d97706', fontWeight: 600 }}>
            {report.is_monday ? 'Tepat Waktu (Senin)' : 'Di luar Hari Senin'}
          </span>
        </div>
      </div>

      {isRejected && report.rejection_reason && (
        <div className={`${styles.alertBox} ${styles.alertBoxError}`} style={{ textAlign: 'left' }}>
          <XCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Catatan Evaluasi Admin:</strong>
            <p style={{ marginTop: '2px', fontSize: '12.5px' }}>{report.rejection_reason}</p>
          </div>
        </div>
      )}

      {/* Foto Bukti Grooming */}
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>
          Foto Watermark Terkirim:
        </h4>
        <div className={styles.photoGrid}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '6px' }}>
              Badan Penuh:
            </p>
            <img
              src={report.photo_full_url}
              alt="Foto Badan Penuh"
              className={styles.photoPreview}
            />
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '6px' }}>
              Wajah Close-Up:
            </p>
            <img
              src={report.photo_face_url}
              alt="Foto Wajah"
              className={styles.photoPreview}
            />
          </div>
        </div>
      </div>

      {/* Checklist SOP */}
      <div style={{ textAlign: 'left', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
          Checklist Evaluasi Mandiri:
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12.5px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
            <CheckCircle2 size={15} /> Seragam Resmi Rapi
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
            <CheckCircle2 size={15} /> Celana Kerja Standar
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
            <CheckCircle2 size={15} /> Rambut Pendek & Rapi
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
            <CheckCircle2 size={15} /> Wajah Bersih / Rapi
          </span>
        </div>
      </div>

      {onBackToCard ? (
        <button
          type="button"
          onClick={onBackToCard}
          className="btn btn-secondary btn-block"
          style={{ gap: '6px' }}
        >
          <span>Kembali ke Kartu Digital</span>
          <ExternalLink size={15} />
        </button>
      ) : (
        <Link href="/technician/my-card" className="btn btn-secondary btn-block" style={{ gap: '6px' }}>
          <span>Kembali ke Kartu Digital</span>
          <ExternalLink size={15} />
        </Link>
      )}
    </div>
  );
};
