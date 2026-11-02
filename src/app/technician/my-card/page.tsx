// src/app/technician/my-card/page.tsx
'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Loader2, LogOut, ShieldCheck, ShieldX } from 'lucide-react';
import AuthWrapper from '@/components/AuthWrapper';
import TechnicianCard3D from '@/components/TechnicianCard3D';
import { Skeleton } from '@/components/ui/Skeleton';
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', marginTop: '8px' }}>
            <div style={{ width: '100%', maxWidth: '380px' }}>
              <Skeleton width="100%" height="60px" radius="var(--r-md)" />
            </div>
            <div className="id-card-stage" style={{ display: 'flex', justifyContent: 'center' }}>
              <Skeleton width="32em" height="50.75em" radius="1.4em" />
            </div>
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

              <div className="panel panel-pad" style={{ width: '100%', marginTop: '4px' }}>
                <p className="text-sm text-2" style={{ marginBottom: '12px' }}>
                  Simpan cadangan gambar QR code kartu Anda untuk ditunjukkan bila diperlukan tanpa
                  harus membuka portal ini.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  disabled={!verifyUrl}
                  className="btn btn-secondary btn-block"
                >
                  <Download size={16} />
                  Unduh gambar QR code (PNG)
                </button>
              </div>

              {/* Render elemen kanvas QR tersembunyi yang akan di-ekspor menjadi berkas PNG */}
              <div ref={qrWrapperRef} style={{ display: 'none' }} aria-hidden="true">
                {verifyUrl && (
                  <QRCodeCanvas
                    value={verifyUrl}
                    size={512}
                    level="H"
                    includeMargin
                    imageSettings={{
                      src: '/modena-emblem.png',
                      x: undefined,
                      y: undefined,
                      height: 96,
                      width: 96,
                      excavate: true,
                    }}
                  />
                )}
              </div>
            </>
          )
        )}
      </div>
    </main>
  );
}

export default function MyCardPage() {
  return (
    <AuthWrapper allowedRoles={['technician']}>
      <MyCardContent />
    </AuthWrapper>
  );
}
