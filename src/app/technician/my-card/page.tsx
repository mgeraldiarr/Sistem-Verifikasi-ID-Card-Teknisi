// src/app/technician/my-card/page.tsx
'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Loader2, LogOut, ShieldCheck, ShieldX } from 'lucide-react';
import AuthWrapper from '@/components/AuthWrapper';
import TechnicianCard3D from '@/components/TechnicianCard3D';
import { useAuthProfile } from '@/hooks/useAuthProfile';
import { useMyTechnicianCard } from './hooks/useMyTechnicianCard';

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
    <main className="public-page">
      <header className="public-head">
        <img src="/modena-logo-official.png" alt="MODENA" />
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          className="btn btn-ghost btn-sm"
          style={{ marginRight: '-8px' }}
        >
          {signingOut ? <Loader2 size={15} className="spin" /> : <LogOut size={15} />}
          Keluar
        </button>
      </header>

      <div className="public-body">
        {profile && (
          <div style={{ width: '100%' }}>
            <p className="text-2 text-sm">Kartu digital</p>
            <h1 className="page-title">{technician?.technician_name || profile.full_name}</h1>
          </div>
        )}

        {busy ? (
          <div style={{ padding: '64px 0' }}>
            <Loader2 size={28} color="var(--ink-3)" className="spin" aria-label="Memuat kartu" />
          </div>
        ) : error ? (
          <div className="verdict is-invalid" role="status">
            <ShieldX size={28} />
            <div>
              <h2 className="verdict-title">Kartu digital belum tersedia</h2>
              <p className="verdict-sub">{error}</p>
            </div>
          </div>
        ) : (
          technician && (
            <>
              <div className={`verdict${isValid ? '' : ' is-invalid'}`} role="status">
                {isValid ? <ShieldCheck size={28} /> : <ShieldX size={28} />}
                <div>
                  <h2 className="verdict-title">{statusLabel}</h2>
                  <p className="verdict-sub">
                    {isValid
                      ? `Berlaku sampai ${formattedExpiryDate}. Tunjukkan QR code di sisi belakang kepada pelanggan.`
                      : 'Hubungi Admin Cabang untuk memperbarui kartu Anda.'}
                  </p>
                </div>
              </div>

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
                {verifyUrl && <QRCodeCanvas value={verifyUrl} size={512} level="M" includeMargin />}
              </div>

              <div className="panel panel-pad" style={{ width: '100%' }}>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  disabled={!verifyUrl}
                  className="btn btn-dark btn-block"
                >
                  <Download size={16} />
                  Unduh QR code
                </button>
                <p className="hint" style={{ marginTop: '10px' }}>
                  Kartu ini bersifat pribadi. Pelanggan yang memindai QR code melihat status
                  keaktifan Anda secara langsung.
                </p>
              </div>
            </>
          )
        )}
      </div>
    </main>
  );
}

export default function TechnicianMyCardPage() {
  return (
    <AuthWrapper allowedRoles={['technician']}>
      <MyCardContent />
    </AuthWrapper>
  );
}
