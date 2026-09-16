// src/app/technician/my-card/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { supabase } from '@/lib/supabase';
import { useAuthProfile } from '@/hooks/useAuthProfile';
import { Technician } from '@/types';

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'BEGINNER',
  intermediate: 'INTERMEDIATE',
  advance: 'ADVANCED',
};

const CREAM_BG = '#F3F2EC';

function MyCardContent() {
  const router = useRouter();
  const { profile, loading: profileLoading, signOut } = useAuthProfile();

  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const qrWrapperRef = useRef<HTMLDivElement>(null);

  const technicianRowId = profile?.technician_id ?? null;

  useEffect(() => {
    if (profileLoading) return;

    if (!technicianRowId) {
      setLoading(false);
      setError(
        'Akun Anda belum terhubung ke data teknisi mana pun. Hubungi Admin Cabang untuk menautkan akun Anda.'
      );
      return;
    }

    let cancelled = false;

    const fetchTechnician = async () => {
      setLoading(true);

      // RLS hanya mengizinkan teknisi membaca barisnya sendiri
      const { data, error: fetchError } = await supabase
        .from('technicians')
        .select(
          `
          id,
          technician_id,
          employee_number,
          technician_name,
          branch,
          service_center,
          photo_url,
          phone,
          email,
          technician_status,
          technician_level,
          qr_token,
          created_at,
          technician_id_cards!technician_id_cards_technician_id_fkey (
            card_number,
            card_status,
            expiry_date
          )
        `
        )
        .eq('id', technicianRowId)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        setError(`Gagal memuat kartu digital: ${fetchError.message}`);
      } else if (!data) {
        setError('Data teknisi Anda tidak ditemukan dalam sistem.');
      } else {
        setTechnician(data as unknown as Technician);
        setError(null);
      }

      setLoading(false);
    };

    fetchTechnician();
    return () => {
      cancelled = true;
    };
  }, [profileLoading, technicianRowId]);

  const cardInfo = technician?.technician_id_cards?.[0] ?? null;

  const { isValid, formattedExpiryDate, statusLabel } = useMemo(() => {
    if (!technician) {
      return { isValid: false, formattedExpiryDate: '-', statusLabel: 'MEMUAT DATA' };
    }

    const isTechnicianActive = technician.technician_status === 'active';
    const isCardActive = cardInfo?.card_status === 'active';

    const expiryDate = cardInfo ? new Date(cardInfo.expiry_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expired = expiryDate ? expiryDate < today : false;

    const valid = isTechnicianActive && isCardActive && !expired;

    let label = 'KARTU DIGITAL AKTIF';
    if (!isTechnicianActive) label = 'STATUS TEKNISI NONAKTIF';
    else if (!cardInfo) label = 'KARTU BELUM DITERBITKAN';
    else if (!isCardActive) label = 'KARTU DITANGGUHKAN';
    else if (expired) label = 'KARTU KADALUARSA';

    return {
      isValid: valid,
      statusLabel: label,
      formattedExpiryDate: expiryDate
        ? expiryDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '-',
    };
  }, [technician, cardInfo]);

  const qrToken = technician?.qr_token;
  const verifyUrl = useMemo(() => {
    if (!qrToken || typeof window === 'undefined') return undefined;
    return `${window.location.origin}/verify/${qrToken}`;
  }, [qrToken]);

  const levelText = technician
    ? LEVEL_LABELS[technician.technician_level] ||
      technician.technician_level.toUpperCase()
    : '';

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
              cardInfo={cardInfo}
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
