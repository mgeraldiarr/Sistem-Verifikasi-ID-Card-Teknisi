// src/app/technician/my-card/page.tsx
'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Download,
  Loader2,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import AuthWrapper from '@/components/AuthWrapper';
import TechnicianCard3D from '@/components/TechnicianCard3D';
import { useAuthProfile } from '@/hooks/useAuthProfile';
import { useMyTechnicianCard } from './hooks/useMyTechnicianCard';

const CREAM_BG = '#F3F2EC';

function MyCardContent() {
  const router = useRouter();
  const { profile, loading: profileLoading, signOut } = useAuthProfile();

  const [signingOut, setSigningOut] = useState(false);

  const qrWrapperRef = useRef<HTMLDivElement>(null);

  const { technician, loading, error, verifyUrl, isValid, formattedExpiryDate, statusLabel, levelText } =
    useMyTechnicianCard(profile?.technician_id ?? null, profileLoading);

  /** Unduh QR Code verifikasi sebagai file PNG */
  const handleDownloadQr = useCallback(() => {
    const canvas = qrWrapperRef.current?.querySelector('canvas');
    if (!canvas || !technician) return;

    const link = document.createElement('a');
    link.download = `QR-${technician.technician_id}-${technician.technician_name.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [technician]);

  const handleLogout = useCallback(async () => {
    setSigningOut(true);
    await signOut();
    router.replace('/admin/login');
  }, [router, signOut]);

  const busy = profileLoading || loading;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: CREAM_BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem 3rem',
      }}
    >
      {/* Header Logo MODENA */}
      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        <img
          src="/modena-logo-official.png"
          alt="MODENA"
          style={{ height: '1.6rem', width: 'auto', objectFit: 'contain' }}
        />
        <span
          style={{
            fontSize: '0.7rem',
            letterSpacing: '0.28em',
            color: '#707070',
            fontWeight: 700,
          }}
        >
          KARTU DIGITAL TEKNISI
        </span>
      </div>

      {/* Sapaan Pemilik Kartu */}
      {profile && (
        <p
          style={{
            fontSize: '0.85rem',
            color: '#4B5563',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          Halo,{' '}
          <strong style={{ color: '#1C1C1A' }}>
            {technician?.technician_name || profile.full_name}
          </strong>
        </p>
      )}

      {busy ? (
        <div style={{ padding: '4rem 0' }}>
          <Loader2 size={40} color="#1C1C1A" className="animate-spin-custom" />
        </div>
      ) : error ? (
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.04)',
          }}
        >
          <XCircle size={36} color="#DA291C" />
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1C1C1A', margin: 0 }}>
            Kartu Digital Tidak Tersedia
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#4B5563', margin: 0, lineHeight: 1.6 }}>
            {error}
          </p>
        </div>
      ) : (
        technician && (
          <>
            {/* Banner Status Keabsahan */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '8px 18px',
                borderRadius: '999px',
                marginBottom: '1.5rem',
                backgroundColor: isValid ? 'rgba(13,148,136,0.12)' : 'rgba(218,41,28,0.12)',
                color: isValid ? '#0D9488' : '#DA291C',
                fontSize: '0.775rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              {isValid ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
              {statusLabel}
            </div>

            {/* Kartu 3D Flip-Flop Interaktif */}
            <TechnicianCard3D
              technician={technician}
              levelText={levelText}
              formattedExpiryDate={formattedExpiryDate}
              isValid={isValid}
              verifyUrl={verifyUrl}
            />

            {/* QR tersembunyi khusus untuk keperluan unduhan PNG resolusi tinggi */}
            <div
              ref={qrWrapperRef}
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
                opacity: 0,
                pointerEvents: 'none',
              }}
            >
              {verifyUrl && (
                <QRCodeCanvas value={verifyUrl} size={512} level="M" includeMargin />
              )}
            </div>

            {/* Tombol Aksi Mandiri */}
            <div
              style={{
                marginTop: '1.75rem',
                width: '100%',
                maxWidth: '320px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <button
                type="button"
                onClick={handleDownloadQr}
                disabled={!verifyUrl}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  border: '1px solid #D6D2C2',
                  backgroundColor: '#FFFFFF',
                  color: verifyUrl ? '#1C1C1A' : '#9CA3AF',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: verifyUrl ? 'pointer' : 'not-allowed',
                }}
              >
                <Download size={16} /> Unduh QR Code
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  border: '1px solid rgba(218,41,28,0.25)',
                  backgroundColor: 'rgba(218,41,28,0.06)',
                  color: '#DA291C',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {signingOut ? (
                  <Loader2 size={16} className="animate-spin-custom" />
                ) : (
                  <LogOut size={16} />
                )}
                Keluar dari Portal
              </button>
            </div>

            {/* Catatan Keamanan */}
            <p
              style={{
                marginTop: '1.5rem',
                maxWidth: '320px',
                fontSize: '0.7rem',
                color: '#8A8A85',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              Kartu digital ini bersifat pribadi. Tunjukkan QR Code kepada pelanggan untuk
              verifikasi status keaktifan Anda secara real-time.
            </p>
          </>
        )
      )}
    </div>
  );
}

export default function TechnicianMyCardPage() {
  return (
    <AuthWrapper allowedRoles={['technician']}>
      <MyCardContent />
    </AuthWrapper>
  );
}
