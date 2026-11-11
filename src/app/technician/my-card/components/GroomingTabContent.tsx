// src/app/technician/my-card/components/GroomingTabContent.tsx
'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  RotateCw,
  Send,
  Sparkles,
} from 'lucide-react';
import { useFeedbackModals } from '@/hooks/useFeedbackModals';
import { ProcessedPhotoResult } from '@/lib/grooming/canvas-watermark';
import {
  getIsoWeekString,
  getWeekDateRangeLabel,
  isMondayInWib,
} from '@/lib/grooming/period';
import { submitGroomingReport } from '@/lib/grooming/service';
import { GroomingReport, ServiceTypeCode, Technician } from '@/types';
import { CameraCaptureBox } from '@/app/technician/grooming/components/CameraCaptureBox';
import { GroomingSubmittedCard } from '@/app/technician/grooming/components/GroomingSubmittedCard';
import styles from '@/app/technician/grooming/grooming.module.css';

interface GroomingTabContentProps {
  technician: Technician;
  report: GroomingReport | null;
  loadingReport: boolean;
  onReportSubmitted: (report: GroomingReport) => void;
  onBackToCard: () => void;
}

export const GroomingTabContent: React.FC<GroomingTabContentProps> = ({
  technician,
  report,
  loadingReport,
  onReportSubmitted,
  onBackToCard,
}) => {
  const { notify, modals } = useFeedbackModals();

  // Form states
  const [fullPhoto, setFullPhoto] = useState<ProcessedPhotoResult | null>(null);
  const [facePhoto, setFacePhoto] = useState<ProcessedPhotoResult | null>(null);
  const [uniformChecked, setUniformChecked] = useState(true);
  const [pantsChecked, setPantsChecked] = useState(true);
  const [hairChecked, setHairChecked] = useState(true);
  const [faceChecked, setFaceChecked] = useState(true);
  const [notes, setNotes] = useState('');

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const currentWeek = getIsoWeekString();
  const isMonday = isMondayInWib();

  const allPhotosCaptured = Boolean(fullPhoto && facePhoto);
  const allChecklistPassed = uniformChecked && pantsChecked && hairChecked && faceChecked;
  const canSubmit = allPhotosCaptured && allChecklistPassed && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !technician || !fullPhoto || !facePhoto) return;

    setSubmitting(true);
    setRetryAttempt(0);

    const maxRetries = 3;
    let attempt = 0;
    let success = false;
    let lastError = '';

    while (attempt < maxRetries && !success) {
      attempt++;
      setRetryAttempt(attempt);

      try {
        const newReport = await submitGroomingReport({
          technician_id: technician.technician_id,
          technician_name: technician.technician_name,
          branch: technician.branch,
          service_type: (technician.service_type || 'DSC') as ServiceTypeCode,
          period_week: currentWeek,
          is_monday: isMonday,
          uniform_checked: uniformChecked,
          pants_checked: pantsChecked,
          hair_checked: hairChecked,
          face_checked: faceChecked,
          photo_full_file: fullPhoto.file,
          photo_face_file: facePhoto.file,
          notes: notes.trim(),
        });

        success = true;
        setIsRetrying(false);
        onReportSubmitted(newReport);
        notify(
          'success',
          'Laporan Grooming Terkirim',
          'Laporan kerapian seragam & grooming Anda berhasil dikirim ke Service Center.'
        );
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses laporan.';

        // Jangan retry jika error disebabkan oleh sesi login atau validasi data
        const isNonRetryable =
          lastError.toLowerCase().includes('sesi') ||
          lastError.toLowerCase().includes('login') ||
          lastError.toLowerCase().includes('izin') ||
          lastError.toLowerCase().includes('wajib') ||
          lastError.toLowerCase().includes('sudah mengirimkan') ||
          lastError.toLowerCase().includes('401') ||
          lastError.toLowerCase().includes('403');

        if (isNonRetryable) {
          break;
        }

        if (attempt < maxRetries) {
          // Tunggu 1.5 detik sebelum mencoba lagi untuk kendala jaringan
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    }

    setSubmitting(false);

    if (!success) {
      const isAuthError =
        lastError.toLowerCase().includes('sesi') ||
        lastError.toLowerCase().includes('login') ||
        lastError.toLowerCase().includes('401');

      if (isAuthError) {
        notify(
          'error',
          'Sesi Login Berakhir',
          `${lastError}\n\nSilakan muat ulang halaman atau tekan tombol 'Keluar' di kanan atas dan masuk kembali.`
        );
      } else if (attempt > 1) {
        notify(
          'error',
          'Gagal Mengirim Laporan',
          `${lastError}\n\nSistem telah mencoba 3 kali namun gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.`
        );
      } else {
        notify('error', 'Gagal Mengirim Laporan', lastError);
      }
    }
  };

  if (loadingReport) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--line)' }}>
        <Loader2 size={32} className="spin" color="var(--red)" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: '13px', color: 'var(--ink-2)' }}>Memeriksa status laporan minggu ini...</p>
      </div>
    );
  }

  // Jika teknisi sudah pernah mengirimkan laporan minggu ini dan tidak sedang kirim ulang, tampilkan ringkasan
  if (report && !isRetrying) {
    return (
      <GroomingSubmittedCard
        report={report}
        onBackToCard={onBackToCard}
        onRetake={() => {
          setFullPhoto(null);
          setFacePhoto(null);
          setIsRetrying(true);
        }}
      />
    );
  }

  // Jika belum lapor atau sedang kirim ulang perbaikan, tampilkan langkah-langkah input grooming
  return (
    <div>
      {/* Banner Mode Kirim Ulang Perbaikan jika sedang retrying */}
      {isRetrying && (
        <div
          className={`${styles.alertBox} ${styles.alertBoxError}`}
          style={{ marginBottom: '16px', textAlign: 'left', alignItems: 'flex-start' }}
        >
          <RotateCw size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '13.5px', marginBottom: '2px' }}>
              Mode Kirim Ulang Perbaikan
            </strong>
            {report?.rejection_reason && (
              <p style={{ margin: '2px 0 6px', fontSize: '12.5px' }}>
                Catatan evaluasi admin: <em>&ldquo;{report.rejection_reason}&rdquo;</em>
              </p>
            )}
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink-2)' }}>
              Silakan rapikan penampilan sesuai instruksi admin di atas, lalu ambil ulang 2 foto terbaru.
            </p>
            <button
              type="button"
              onClick={() => setIsRetrying(false)}
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: 'var(--red-ink)',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'inline-block',
              }}
            >
              ← Batal ambil ulang & kembali ke status laporan
            </button>
          </div>
        </div>
      )}

      {/* Banner Periode & Hari Senin */}
      <div className={styles.periodCard}>
        <div className={styles.periodHead}>
          <div>
            <span className={styles.periodTitle}>Periode Pelaporan</span>
            <div className={styles.periodValue}>
              {getWeekDateRangeLabel(currentWeek)}
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink-3)', marginLeft: '6px' }}>
                (Minggu Ini)
              </span>
            </div>
          </div>

          {isMonday ? (
            <span className={styles.badgeMonday}>
              <CheckCircle2 size={13} />
              Hari Senin (Waktu Ideal)
            </span>
          ) : (
            <span className={styles.badgeWarning}>
              <Clock size={13} />
              Di Luar Hari Senin
            </span>
          )}
        </div>

        {!isMonday && (
          <div className={`${styles.alertBox} ${styles.alertBoxInfo}`} style={{ margin: 0 }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Sesuai SOP, pelaporan grooming dianjurkan diisi setiap <strong>Senin pagi</strong> sebelum
              kunjungan servis pertama. Anda tetap dapat mengirimkan laporan susulan hari ini.
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Langkah 1: Tangkapan Kamera Langsung */}
        <section className={styles.cardSection}>
          <h3 className={styles.sectionTitle}>
            <Sparkles size={16} color="var(--red)" />
            Langkah 1: Tangkapan Kamera Langsung
          </h3>
          <p className={styles.sectionSubtitle}>
            Ambil foto langsung dengan kamera HP Anda. Watermark digital resmi dan kompresi ukuran foto
            akan otomatis distempel oleh sistem.
          </p>

          <div className={styles.photoGrid}>
            <CameraCaptureBox
              title="Foto 1: Badan Penuh"
              photoType="BADAN PENUH"
              captureMode="environment"
              description="Seragam MODENA lengkap dari ujung kepala hingga celana kerja standar."
              technicianName={technician.technician_name}
              technicianId={technician.technician_id}
              branch={technician.branch}
              processedPhoto={fullPhoto}
              onPhotoProcessed={setFullPhoto}
              onPhotoReset={() => setFullPhoto(null)}
              disabled={submitting}
            />

            <CameraCaptureBox
              title="Foto 2: Wajah Close-Up"
              photoType="WAJAH CLOSE-UP"
              captureMode="user"
              description="Kerapian rambut dan wajah bersih (kumis/jenggot tertata atau dicukur rapi)."
              technicianName={technician.technician_name}
              technicianId={technician.technician_id}
              branch={technician.branch}
              processedPhoto={facePhoto}
              onPhotoProcessed={setFacePhoto}
              onPhotoReset={() => setFacePhoto(null)}
              disabled={submitting}
            />
          </div>

          {!allPhotosCaptured && (
            <div style={{ fontSize: '12px', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} />
              <span>Harap ambil kedua foto (Badan Penuh & Wajah) sebelum melanjutkan.</span>
            </div>
          )}
        </section>

        {/* Langkah 2: Checklist Evaluasi Mandiri (SOP) */}
        <section className={styles.cardSection}>
          <h3 className={styles.sectionTitle}>
            <CheckCircle2 size={16} color="var(--red)" />
            Langkah 2: Checklist Kerapian SOP
          </h3>
          <p className={styles.sectionSubtitle}>
            Konfirmasi 4 poin pemeriksaan mandiri berikut sebelum memulai kunjungan servis pertama:
          </p>

          <div className={styles.checklistGroup}>
            <label className={styles.checkItem}>
              <input
                type="checkbox"
                checked={uniformChecked}
                onChange={(e) => setUniformChecked(e.target.checked)}
                disabled={submitting}
              />
              <div className={styles.checkContent}>
                <span className={styles.checkTitle}>1. Seragam Resmi MODENA</span>
                <span className={styles.checkDesc}>
                  Mengenakan seragam resmi MODENA, kondisi bersih, tidak kusut, dan tidak pudar.
                </span>
              </div>
            </label>

            <label className={styles.checkItem}>
              <input
                type="checkbox"
                checked={pantsChecked}
                onChange={(e) => setPantsChecked(e.target.checked)}
                disabled={submitting}
              />
              <div className={styles.checkContent}>
                <span className={styles.checkTitle}>2. Celana Kerja Standar</span>
                <span className={styles.checkDesc}>
                  Mengenakan celana kerja sesuai standar SOP, bersih, dan rapi.
                </span>
              </div>
            </label>

            <label className={styles.checkItem}>
              <input
                type="checkbox"
                checked={hairChecked}
                onChange={(e) => setHairChecked(e.target.checked)}
                disabled={submitting}
              />
              <div className={styles.checkContent}>
                <span className={styles.checkTitle}>3. Kerapian Rambut</span>
                <span className={styles.checkDesc}>
                  Rambut dipotong pendek rapi, disisir, dan bersih.
                </span>
              </div>
            </label>

            <label className={styles.checkItem}>
              <input
                type="checkbox"
                checked={faceChecked}
                onChange={(e) => setFaceChecked(e.target.checked)}
                disabled={submitting}
              />
              <div className={styles.checkContent}>
                <span className={styles.checkTitle}>4. Kerapian Wajah</span>
                <span className={styles.checkDesc}>
                  Wajah bersih, kumis dan jenggot dicukur bersih atau dirapikan sesuai standar.
                </span>
              </div>
            </label>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label htmlFor="notes" className="label" style={{ fontSize: '13px' }}>
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              className="input"
              placeholder="Tuliskan catatan bila ada kendala seragam atau kelengkapan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              style={{ minHeight: '60px', padding: '10px' }}
            />
          </div>
        </section>

        {/* Tombol Kirim */}
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn btn-primary btn-block"
            style={{ minHeight: '48px', fontSize: '15px', fontWeight: 700 }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>
                  {retryAttempt > 1
                    ? `Mencoba kirim ulang (${retryAttempt}/3)...`
                    : 'Mengirim laporan & mengunggah foto...'}
                </span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Kirim Laporan Grooming ({currentWeek})</span>
              </>
            )}
          </button>

          {!allChecklistPassed && (
            <p style={{ fontSize: '11.5px', color: '#dc2626', textAlign: 'center', marginTop: '8px' }}>
              * Seluruh 4 poin checklist wajib dicentang sesuai komitmen SOP MODENA.
            </p>
          )}
        </div>
      </form>

      {modals}
    </div>
  );
};
