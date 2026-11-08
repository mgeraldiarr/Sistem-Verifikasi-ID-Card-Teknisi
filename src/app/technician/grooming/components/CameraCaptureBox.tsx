// src/app/technician/grooming/components/CameraCaptureBox.tsx
'use client';

import React, { useRef, useState } from 'react';
import { Camera, CheckCircle2, Loader2, RotateCcw, AlertTriangle } from 'lucide-react';
import { validateCameraFreshness } from '@/lib/grooming/camera-validator';
import {
  PhotoTypeLabel,
  ProcessedPhotoResult,
  processAndWatermarkPhoto,
} from '@/lib/grooming/canvas-watermark';
import styles from '../grooming.module.css';

interface CameraCaptureBoxProps {
  title: string;
  photoType: PhotoTypeLabel;
  captureMode: 'environment' | 'user';
  description: string;
  technicianName: string;
  technicianId: string;
  branch: string;
  processedPhoto: ProcessedPhotoResult | null;
  onPhotoProcessed: (result: ProcessedPhotoResult) => void;
  onPhotoReset: () => void;
  disabled?: boolean;
}

export const CameraCaptureBox: React.FC<CameraCaptureBoxProps> = ({
  title,
  photoType,
  captureMode,
  description,
  technicianName,
  technicianId,
  branch,
  processedPhoto,
  onPhotoProcessed,
  onPhotoReset,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProcessing(true);

    try {
      // 1. Validasi Anti-Galeri & Freshness Check (< 30 menit)
      const freshness = validateCameraFreshness(file);
      if (!freshness.valid) {
        setError(freshness.error || 'Foto tidak memenuhi syarat kebaruan waktu.');
        return;
      }

      // 2. Client-side Canvas: Resize, Watermark Stamp, & Kompresi JPEG
      const result = await processAndWatermarkPhoto(file, {
        technicianName,
        technicianId,
        branch,
        photoType,
      });

      onPhotoProcessed(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses foto.';
      setError(msg);
    } finally {
      setProcessing(false);
      // Reset input value agar dapat memilih file yang sama jika retake
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerCamera = () => {
    if (disabled || processing) return;
    setError(null);
    fileInputRef.current?.click();
  };

  const handleRetake = () => {
    setError(null);
    onPhotoReset();
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const formatKb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

  return (
    <div className={`${styles.photoBox} ${processedPhoto ? styles.photoBoxActive : ''}`}>
      {/* Hidden file input with direct camera capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={captureMode}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled || processing}
      />

      {processing ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Loader2 size={32} className="spin" color="var(--red)" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
            Menyematkan Watermark & Kompresi...
          </p>
          <p style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '4px' }}>
            Memvalidasi waktu dan identitas teknisi
          </p>
        </div>
      ) : processedPhoto ? (
        <div style={{ width: '100%' }}>
          <img
            src={processedPhoto.previewUrl}
            alt={title}
            className={styles.photoPreview}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} />
              Watermark Valid ({formatKb(processedPhoto.sizeBytes)})
            </span>
            <button
              type="button"
              onClick={handleRetake}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '12px', padding: '4px 8px', height: 'auto' }}
              disabled={disabled}
            >
              <RotateCcw size={12} />
              Ambil Ulang
            </button>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--surface)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: 'var(--ink-2)',
            }}
          >
            <Camera size={22} />
          </div>

          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
            {title}
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginBottom: '14px', lineHeight: 1.3 }}>
            {description}
          </p>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#b91c1c',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '11.5px',
                textAlign: 'left',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
              }}
            >
              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={triggerCamera}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', minHeight: '38px', gap: '6px' }}
            disabled={disabled}
          >
            <Camera size={15} />
            Buka Kamera {captureMode === 'user' ? 'Depan' : 'Belakang'}
          </button>
        </div>
      )}
    </div>
  );
};
