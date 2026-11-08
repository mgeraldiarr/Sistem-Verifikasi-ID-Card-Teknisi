// src/app/admin/(portal)/grooming/components/GroomingDetailModal.tsx
'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { GroomingReport } from '@/types';
import { formatWibTimestamp, getWeekDateRangeLabel } from '@/lib/grooming/period';

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
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
              Detail Verifikasi Grooming
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--ink-3)' }}>
              {report.technician_name} ({report.technician_id}) • {report.branch} ({report.service_type})
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {/* Metadata Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--r-md)',
              padding: '14px 16px',
              fontSize: '12.5px',
              marginBottom: '20px',
            }}
          >
            <div>
              <span style={{ color: 'var(--ink-3)', display: 'block' }}>Periode Minggu:</span>
              <strong>
                {report.period_week} ({getWeekDateRangeLabel(report.period_week)})
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--ink-3)', display: 'block' }}>Waktu Submit:</span>
              <span>{formatWibTimestamp(new Date(report.submission_time))}</span>
            </div>
            <div>
              <span style={{ color: 'var(--ink-3)', display: 'block' }}>Kepatuhan Waktu:</span>
              <span
                style={{
                  fontWeight: 600,
                  color: report.is_monday ? '#16a34a' : '#d97706',
                }}
              >
                {report.is_monday ? 'Tepat Waktu (Senin)' : 'Susulan (Di Luar Senin)'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--ink-3)', display: 'block' }}>Status Review:</span>
              <span
                className={`badge ${
                  report.status === 'approved'
                    ? 'badge-success'
                    : report.status === 'rejected'
                      ? 'badge-error'
                      : 'badge-warning'
                }`}
              >
                {report.status === 'approved'
                  ? 'Disetujui'
                  : report.status === 'rejected'
                    ? 'Ditolak'
                    : 'Menunggu Review'}
              </span>
            </div>
          </div>

          {/* Galeri Foto Watermark */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>
              Foto Tangkapan Langsung & Watermark Audit:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '6px' }}>
                  Foto 1: Badan Penuh
                </p>
                <a href={report.photo_full_url} target="_blank" rel="noopener noreferrer" title="Klik untuk memperbesar">
                  <img
                    src={report.photo_full_url}
                    alt="Foto Badan Penuh"
                    style={{
                      width: '100%',
                      height: '280px',
                      objectFit: 'cover',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                    }}
                  />
                </a>
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)', marginBottom: '6px' }}>
                  Foto 2: Wajah Close-Up
                </p>
                <a href={report.photo_face_url} target="_blank" rel="noopener noreferrer" title="Klik untuk memperbesar">
                  <img
                    src={report.photo_face_url}
                    alt="Foto Wajah"
                    style={{
                      width: '100%',
                      height: '280px',
                      objectFit: 'cover',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                    }}
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Checklist Mandiri */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>
              Checklist Evaluasi Mandiri Teknisi:
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--r-md)',
                padding: '12px 16px',
                fontSize: '12.5px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
                <CheckCircle2 size={16} /> Seragam Resmi MODENA Rapi
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
                <CheckCircle2 size={16} /> Celana Kerja Standar Bersih
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
                <CheckCircle2 size={16} /> Rambut Pendek & Rapi
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a' }}>
                <CheckCircle2 size={16} /> Wajah Bersih / Kumis-Jenggot Rapi
              </span>
            </div>
          </div>

          {/* Catatan Teknisi bila ada */}
          {report.notes && (
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-3)' }}>Catatan Teknisi:</span>
              <p style={{ fontSize: '13px', color: 'var(--ink)', background: 'var(--surface-2)', padding: '10px', borderRadius: 'var(--r-sm)', marginTop: '4px' }}>
                {report.notes}
              </p>
            </div>
          )}

          {/* Alasan Penolakan bila ada */}
          {report.status === 'rejected' && report.rejection_reason && (
            <div style={{ marginBottom: '20px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--r-sm)', padding: '12px' }}>
              <strong style={{ fontSize: '13px', color: '#b91c1c' }}>Alasan Penolakan:</strong>
              <p style={{ fontSize: '13px', color: '#b91c1c', marginTop: '2px' }}>{report.rejection_reason}</p>
            </div>
          )}

          {/* Form input alasan tolak jika sedang mode tolak */}
          {rejectMode && (
            <form onSubmit={handleReject} style={{ marginTop: '16px', padding: '16px', border: '1px solid #f87171', borderRadius: 'var(--r-md)', background: 'rgba(239, 68, 68, 0.04)' }}>
              <label htmlFor="rejection_reason" className="label" style={{ color: '#b91c1c', fontWeight: 700 }}>
                Alasan Penolakan / Catatan Perbaikan Grooming:
              </label>
              <textarea
                id="rejection_reason"
                required
                rows={2}
                className="input"
                placeholder="Contoh: Seragam kusut, kumis belum dicukur rapi. Mohon rapikan dan laporkan kembali..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ minHeight: '60px', padding: '10px', marginBottom: '12px' }}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setRejectMode(false)} className="btn btn-secondary btn-sm" disabled={submitting}>
                  Batal
                </button>
                <button type="submit" className="btn btn-danger btn-sm" disabled={submitting || !reason.trim()}>
                  {submitting ? <Loader2 size={14} className="spin" /> : <XCircle size={14} />}
                  Konfirmasi Tolak Grooming
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Actions */}
        {!rejectMode && (
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Tutup
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRejectMode(true)}
                className="btn btn-secondary"
                disabled={submitting}
                style={{ color: '#dc2626' }}
              >
                <XCircle size={16} />
                Minta Perbaikan / Tolak
              </button>

              <button
                type="button"
                onClick={handleApprove}
                className="btn btn-primary"
                disabled={submitting || report.status === 'approved'}
                style={{ background: '#16a34a', borderColor: '#16a34a' }}
              >
                {submitting ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />}
                Setujui Grooming (Sesuai SOP)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
