// src/app/admin/(portal)/grooming/components/GroomingDetailModal.tsx
'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatWibTimestamp, getWeekDateRangeLabel } from '@/lib/grooming/period';
import { GroomingReport } from '@/types';

interface GroomingDetailModalProps {
  report: GroomingReport | null;
  onClose: () => void;
  onApprove: (reportId: string) => Promise<void>;
  onReject: (reportId: string, reason: string) => Promise<void>;
}

export const GroomingDetailModal: React.FC<GroomingDetailModalProps> = ({
  report,
  onClose,
  onApprove,
  onReject,
}) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!report) return null;

  const isApproved = report.status === 'approved';
  const isRejected = report.status === 'rejected';

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onApprove(report.id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      await onReject(report.id, reason.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Detail Verifikasi Grooming"
      description={`${report.technician_name} (${report.technician_id}) • ${report.branch} (${report.service_type})`}
      width={760}
      footer={
        !rejectMode ? (
          <>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Tutup
            </button>

            <button
              type="button"
              onClick={() => setRejectMode(true)}
              className="btn btn-secondary"
              disabled={submitting}
              style={{ color: 'var(--red-ink)', borderColor: 'rgba(218, 41, 28, 0.3)' }}
            >
              <XCircle size={15} />
              <span>Minta Perbaikan / Tolak</span>
            </button>

            <button
              type="button"
              onClick={handleApprove}
              className="btn btn-primary"
              disabled={submitting || isApproved}
              style={
                isApproved
                  ? undefined
                  : { background: 'var(--ok)', borderColor: 'var(--ok)' }
              }
            >
              {submitting ? (
                <Loader2 size={15} className="spin" />
              ) : (
                <ShieldCheck size={15} />
              )}
              <span>{isApproved ? 'Sudah Disetujui' : 'Setujui Grooming (Sesuai SOP)'}</span>
            </button>
          </>
        ) : null
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Ringkasan Metadata */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            background: 'var(--surface-sunk)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            padding: '14px 16px',
            fontSize: '13px',
          }}
        >
          <div>
            <span style={{ color: 'var(--ink-3)', fontSize: '11.5px', display: 'block', marginBottom: '2px' }}>
              Periode Laporan:
            </span>
            <strong style={{ color: 'var(--ink)', fontSize: '13.5px' }}>
              {getWeekDateRangeLabel(report.period_week)}
            </strong>
            <span style={{ fontSize: '11px', color: 'var(--ink-3)', display: 'block' }}>
              Minggu ke-{report.period_week.split('-W')[1]}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--ink-3)', fontSize: '11.5px', display: 'block', marginBottom: '2px' }}>
              Waktu Submit:
            </span>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
              {formatWibTimestamp(new Date(report.submission_time))}
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--ink-3)', fontSize: '11.5px', display: 'block', marginBottom: '4px' }}>
              Kepatuhan Waktu:
            </span>
            {report.is_monday ? (
              <span className="badge badge-ok">
                <CheckCircle2 size={12} />
                Senin (Tepat Waktu)
              </span>
            ) : (
              <span className="badge badge-warn">
                <Clock size={12} />
                Susulan (Di Luar Senin)
              </span>
            )}
          </div>

          <div>
            <span style={{ color: 'var(--ink-3)', fontSize: '11.5px', display: 'block', marginBottom: '4px' }}>
              Status Review:
            </span>
            <span
              className={`badge ${
                isApproved
                  ? 'badge-ok'
                  : isRejected
                    ? 'badge-red'
                    : 'badge-warn'
              }`}
            >
              {isApproved
                ? 'Disetujui'
                : isRejected
                  ? 'Perlu Perbaikan'
                  : 'Menunggu Review'}
            </span>
          </div>
        </div>

        {/* Notifikasi Info Watermark Digital */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '10px 14px',
            background: 'rgba(22, 121, 74, 0.06)',
            border: '1px solid rgba(22, 121, 74, 0.2)',
            borderRadius: 'var(--r-md)',
            fontSize: '12.5px',
            color: 'var(--ok)',
          }}
        >
          <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Autentikasi Watermark Digital MODENA Terverifikasi</strong>
            <p style={{ margin: '2px 0 0', color: 'var(--ink-2)', fontSize: '12px' }}>
              Foto ditangkap langsung dari kamera ponsel dengan stempel anti-pemalsuan (ID teknisi, nama, cabang, dan waktu real-time). Klik foto untuk melihat detail resolusi tinggi.
            </p>
          </div>
        </div>

        {/* Galeri Foto Watermark */}
        <div>
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--ink-2)',
              marginBottom: '10px',
            }}
          >
            Foto Audit Kamera Langsung
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '14px',
            }}
          >
            {/* Foto 1: Badan Penuh */}
            <div
              style={{
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-md)',
                overflow: 'hidden',
                background: 'var(--surface)',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--surface-sunk)',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>
                  Foto 1: Badan Penuh
                </span>
                <span className="badge" style={{ fontSize: '10.5px' }}>
                  Seragam & Celana
                </span>
              </div>
              <div style={{ position: 'relative', background: '#000' }}>
                <img
                  src={report.photo_full_url}
                  alt="Foto Badan Penuh"
                  style={{
                    width: '100%',
                    height: '320px',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
              <div style={{ padding: '8px 12px', textAlign: 'center', background: 'var(--surface)' }}>
                <a
                  href={report.photo_full_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', gap: '6px' }}
                >
                  <ExternalLink size={13} />
                  <span>Buka Foto Asli (Resolusi Penuh)</span>
                </a>
              </div>
            </div>

            {/* Foto 2: Wajah Close-Up */}
            <div
              style={{
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-md)',
                overflow: 'hidden',
                background: 'var(--surface)',
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  background: 'var(--surface-sunk)',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)' }}>
                  Foto 2: Wajah Close-Up
                </span>
                <span className="badge" style={{ fontSize: '10.5px' }}>
                  Rambut & Kumis
                </span>
              </div>
              <div style={{ position: 'relative', background: '#000' }}>
                <img
                  src={report.photo_face_url}
                  alt="Foto Wajah Close-Up"
                  style={{
                    width: '100%',
                    height: '320px',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>
              <div style={{ padding: '8px 12px', textAlign: 'center', background: 'var(--surface)' }}>
                <a
                  href={report.photo_face_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', gap: '6px' }}
                >
                  <ExternalLink size={13} />
                  <span>Buka Foto Asli (Resolusi Penuh)</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist Mandiri SOP */}
        <div>
          <h4
            style={{
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--ink-2)',
              marginBottom: '10px',
            }}
          >
            Checklist Mandiri Kerapian SOP
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '8px',
              background: 'var(--surface-sunk)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-md)',
              padding: '12px 14px',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ok)' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span style={{ color: 'var(--ink)' }}>Seragam Resmi Bersih & Rapi</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ok)' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span style={{ color: 'var(--ink)' }}>Celana Kerja Standar Rapi</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ok)' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span style={{ color: 'var(--ink)' }}>Rambut Pendek & Tersisir</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ok)' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span style={{ color: 'var(--ink)' }}>Wajah Bersih / Kumis Rapi</span>
            </div>
          </div>
        </div>

        {/* Catatan Tambahan Teknisi bila ada */}
        {report.notes && (
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: '4px' }}>
              Catatan dari Teknisi:
            </span>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--ink)',
                background: 'var(--surface-sunk)',
                border: '1px solid var(--line)',
                padding: '10px 14px',
                borderRadius: 'var(--r-md)',
              }}
            >
              {report.notes}
            </div>
          </div>
        )}

        {/* Catatan Penolakan bila sebelumnya ditolak */}
        {isRejected && report.rejection_reason && (
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--red-wash)',
              border: '1px solid rgba(218, 41, 28, 0.25)',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <ShieldAlert size={18} style={{ color: 'var(--red-ink)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--red-ink)', fontSize: '13px' }}>
                Catatan Evaluasi / Penolakan Terakhir:
              </strong>
              <p style={{ margin: '2px 0 0', color: 'var(--red-ink)', fontSize: '13px' }}>
                {report.rejection_reason}
              </p>
            </div>
          </div>
        )}

        {/* Mode Form Penolakan */}
        {rejectMode && (
          <form
            onSubmit={handleReject}
            style={{
              padding: '16px',
              background: 'var(--red-wash)',
              border: '1px solid rgba(218, 41, 28, 0.3)',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div>
              <label
                htmlFor="rejection_reason"
                style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--red-ink)', marginBottom: '4px' }}
              >
                Alasan Penolakan / Catatan Perbaikan SOP Grooming:
              </label>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--ink-2)' }}>
                Tuliskan instruksi yang jelas kepada teknisi hal apa yang perlu dirapikan (misal: seragam belum rapi, kumis belum dicukur). Teknisi akan dapat mengambil foto ulang untuk perbaikan.
              </p>
              <textarea
                id="rejection_reason"
                name="rejection_reason"
                required
                rows={3}
                className="input"
                placeholder="Contoh: Seragam kusut dan kumis belum dicukur rapi. Mohon rapikan penampilan dan kirimkan foto ulang..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', fontSize: '13px', background: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setRejectMode(false)}
                className="btn btn-secondary btn-sm"
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-danger btn-sm"
                disabled={submitting || !reason.trim()}
              >
                {submitting ? <Loader2 size={14} className="spin" /> : <XCircle size={14} />}
                <span>Konfirmasi Tolak & Minta Perbaikan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
