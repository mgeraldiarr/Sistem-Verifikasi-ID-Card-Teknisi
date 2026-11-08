// src/app/technician/my-card/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Award,
  BarChart3,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Flame,
  HelpCircle,
  Loader2,
  LogOut,
  Maximize2,
  QrCode,
  RotateCw,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Star,
  UserCheck,
  Wrench,
  X,
} from 'lucide-react';
import AuthWrapper from '@/components/AuthWrapper';
import TechnicianCard3D from '@/components/TechnicianCard3D';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthProfile } from '@/hooks/useAuthProfile';
import { getIsoWeekString } from '@/lib/grooming/period';
import { getTechnicianWeekGrooming } from '@/lib/grooming/service';
import { GroomingReport } from '@/types';
import { useMyTechnicianCard } from './hooks/useMyTechnicianCard';
import { GroomingTabContent } from './components/GroomingTabContent';
import styles from './my-card.module.css';

type ActiveTab = 'card' | 'grooming' | 'performance';

function MyCardContent() {
  const router = useRouter();
  const { profile, loading: profileLoading, signOut } = useAuthProfile();

  const [activeTab, setActiveTab] = useState<ActiveTab>('card');
  const [signingOut, setSigningOut] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Deteksi jika URL membawa parameter ?tab=grooming atau ?tab=performance
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'grooming') setActiveTab('grooming');
      else if (tabParam === 'performance') setActiveTab('performance');
    }
  }, []);

  // Grooming status untuk minggu berjalan
  const [groomingReport, setGroomingReport] = useState<GroomingReport | null>(null);
  const [loadingGrooming, setLoadingGrooming] = useState(true);

  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const currentWeek = useMemo(() => getIsoWeekString(), []);

  const { technician, loading, error, verifyUrl, isValid, formattedExpiryDate, levelText } =
    useMyTechnicianCard(profile?.technician_id ?? null, profileLoading);

  // Load status grooming minggu ini
  useEffect(() => {
    if (!technician?.technician_id) return;

    let cancelled = false;
    getTechnicianWeekGrooming(technician.technician_id, currentWeek)
      .then((report) => {
        if (!cancelled) {
          setGroomingReport(report);
          setLoadingGrooming(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingGrooming(false);
      });

    return () => {
      cancelled = true;
    };
  }, [technician?.technician_id, currentWeek]);

  /** Unduh QR Code verifikasi sebagai file PNG */
  const handleDownloadQr = useCallback(() => {
    const canvas = qrWrapperRef.current?.querySelector('canvas');
    if (!canvas || !technician) return;

    const link = document.createElement('a');
    link.download = `QR-${technician.technician_id}-${technician.technician_name.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [technician]);

  /** Salin tautan verifikasi publik */
  const handleCopyLink = useCallback(async () => {
    if (!verifyUrl) return;
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
    }
  }, [verifyUrl]);

  const handleLogout = useCallback(async () => {
    setSigningOut(true);
    await signOut();
    router.replace('/admin/login');
  }, [router, signOut]);

  const busy = profileLoading || loading;
  const latestPerf = technician?.technician_performance?.[0];

  return (
    <div className={styles.pageWrapper}>
      {/* App Sticky Header */}
      <header className={styles.appHeader}>
        <div className={styles.appBrand}>
          <img src="/modena-logo-white.png" alt="MODENA" className={styles.brandLogo} />
          <div className={styles.brandDivider} />
          <span className={styles.brandName}>Portal Teknisi</span>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className={styles.logoutBtn}
            title="Keluar dari akun portal"
          >
            {signingOut ? <Loader2 size={13} className="spin" /> : <LogOut size={13} />}
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <div className={styles.mobileContainer}>
        {/* Tab Navigation Switcher */}
        <div className={styles.tabNavWrap}>
          <div className={styles.segmentedControl} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'card'}
              onClick={() => setActiveTab('card')}
              className={`${styles.tabBtn} ${activeTab === 'card' ? styles.tabBtnActive : ''}`}
            >
              <CreditCard size={15} />
              <span>Kartu ID</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'grooming'}
              onClick={() => setActiveTab('grooming')}
              className={`${styles.tabBtn} ${activeTab === 'grooming' ? styles.tabBtnActive : ''}`}
            >
              <Camera size={15} />
              <span>Grooming</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'performance'}
              onClick={() => setActiveTab('performance')}
              className={`${styles.tabBtn} ${activeTab === 'performance' ? styles.tabBtnActive : ''}`}
            >
              <BarChart3 size={15} />
              <span>Performa</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className={styles.tabContent}>
          {busy ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Loader2 size={32} className="spin" color="var(--red)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '13px', color: '#64748b' }}>Memuat profil dan kartu digital...</p>
            </div>
          ) : error ? (
            <div className="verdict is-invalid" role="status" style={{ margin: '16px 0' }}>
              <ShieldX size={28} />
              <div>
                <h2 className="verdict-title">Kartu digital belum tersedia</h2>
                <p className="verdict-sub">{error}</p>
              </div>
            </div>
          ) : (
            technician && (
              <>
                {/* ======================================================== */}
                {/* TAB 1: KARTU DIGITAL 3D */}
                {/* ======================================================== */}
                {activeTab === 'card' && (
                  <div className={styles.cardStage}>
                    <TechnicianCard3D
                      technician={technician}
                      levelText={levelText}
                      formattedExpiryDate={formattedExpiryDate}
                      isValid={isValid}
                      verifyUrl={verifyUrl}
                    />

                    <div className={styles.flipHint}>
                      <RotateCw size={13} />
                      <span>Sentuh kartu untuk membalik sisi depan / belakang</span>
                    </div>

                    {/* Tombol Aksi Cepat Kartu */}
                    <div className={styles.actionGrid}>
                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className={styles.actionBtn}
                        disabled={!verifyUrl}
                      >
                        <QrCode size={16} color="var(--red)" />
                        <span>Perbesar QR Code</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadQr}
                        className={styles.actionBtn}
                        disabled={!verifyUrl}
                      >
                        <Download size={16} />
                        <span>Simpan Gambar</span>
                      </button>
                    </div>

                    {verifyUrl && (
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={styles.copyLinkBtn}
                      >
                        <Copy size={13} />
                        <span>{copiedLink ? 'Tautan verifikasi berhasil disalin!' : 'Salin tautan verifikasi publik'}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* ======================================================== */}
                {/* TAB 2: MONITORING GROOMING LANGSUNG */}
                {/* ======================================================== */}
                {activeTab === 'grooming' && (
                  <GroomingTabContent
                    technician={technician}
                    report={groomingReport}
                    loadingReport={loadingGrooming}
                    onReportSubmitted={(newReport) => setGroomingReport(newReport)}
                    onBackToCard={() => setActiveTab('card')}
                  />
                )}

                {/* ======================================================== */}
                {/* TAB 3: PERFORMA & KPI SAYA */}
                {/* ======================================================== */}
                {activeTab === 'performance' && (
                  <div>
                    {/* Grade Level Banner */}
                    <div className={styles.gradeBanner}>
                      <div>
                        <span className={styles.gradeBannerSub}>
                          Evaluasi Periode {latestPerf?.period || 'Terbaru'}
                        </span>
                        <h2 className={styles.gradeBannerTitle}>
                          {latestPerf?.performance_level || levelText || 'Grade Standar'}
                        </h2>
                        <span className={styles.gradeBannerDesc}>
                          Tingkat Kinerja Teknisi MODENA
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className={styles.gradeScore}>
                          {latestPerf?.performance_score || latestPerf?.kpi_score || 100}
                        </span>
                        <span className={styles.gradeScoreLabel}>/ 100 KPI</span>
                      </div>
                    </div>

                    {/* Indikator KPI Grid */}
                    <div className={styles.perfGrid}>
                      <div className={styles.perfCard}>
                        <div className={styles.perfCardHeader}>
                          <Star size={16} color="#eab308" />
                          <span style={{ fontSize: '11px', fontWeight: 700 }}>CSAT</span>
                        </div>
                        <div className={styles.perfValue}>
                          {latestPerf?.csat ? `${latestPerf.csat}%` : latestPerf?.csi_score ? `${latestPerf.csi_score * 10}%` : '100%'}
                        </div>
                        <div className={styles.perfLabel}>Kepuasan Pelanggan</div>
                      </div>

                      <div className={styles.perfCard}>
                        <div className={styles.perfCardHeader}>
                          <Clock size={16} color="#3b82f6" />
                          <span style={{ fontSize: '11px', fontWeight: 700 }}>TAT / RTAT</span>
                        </div>
                        <div className={styles.perfValue}>
                          {latestPerf?.tat ? `${latestPerf.tat}%` : '95%'}
                        </div>
                        <div className={styles.perfLabel}>Ketepatan Waktu</div>
                      </div>

                      <div className={styles.perfCard}>
                        <div className={styles.perfCardHeader}>
                          <Sparkles size={16} color="#10b981" />
                          <span style={{ fontSize: '11px', fontWeight: 700 }}>Grooming</span>
                        </div>
                        <div className={styles.perfValue}>
                          {latestPerf?.grooming_score ? `${latestPerf.grooming_score}%` : '100%'}
                        </div>
                        <div className={styles.perfLabel}>Kerapian & SOP</div>
                      </div>

                      <div className={styles.perfCard}>
                        <div className={styles.perfCardHeader}>
                          <Wrench size={16} color="#a855f7" />
                          <span style={{ fontSize: '11px', fontWeight: 700 }}>Kualitas</span>
                        </div>
                        <div className={styles.perfValue}>
                          {latestPerf?.repair_quality_score ? `${latestPerf.repair_quality_score}%` : '98%'}
                        </div>
                        <div className={styles.perfLabel}>Hasil Servis Mesin</div>
                      </div>
                    </div>

                    <p style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: '16px' }}>
                      Nilai performa dihitung secara berkala oleh sistem evaluasi Service Center.
                    </p>
                  </div>
                )}
              </>
            )
          )}
        </div>

        {/* Modal QR Code Pop-up Ukuran Penuh */}
        {showQrModal && verifyUrl && (
          <div className={styles.qrModalBackdrop} onClick={() => setShowQrModal(false)}>
            <div className={styles.qrModalCard} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  QR Code Verifikasi
                </span>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="icon-btn"
                  style={{ width: '28px', height: '28px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', display: 'inline-block' }}>
                <QRCodeCanvas
                  value={verifyUrl}
                  size={240}
                  level="H"
                  includeMargin
                />
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '14px' }}>
                {technician?.technician_name}
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                {technician?.technician_id}
              </p>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="btn btn-primary btn-block"
                style={{ marginTop: '16px' }}
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Hidden Canvas untuk Unduhan File PNG QR Code */}
        <div ref={qrWrapperRef} style={{ display: 'none' }} aria-hidden="true">
          {verifyUrl && (
            <QRCodeCanvas
              value={verifyUrl}
              size={512}
              level="H"
              includeMargin
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyCardPage() {
  return (
    <AuthWrapper allowedRoles={['technician']}>
      <MyCardContent />
    </AuthWrapper>
  );
}
