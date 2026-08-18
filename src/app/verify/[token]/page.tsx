// src/app/verify/[token]/page.tsx
import { supabaseAdmin } from '@/lib/supabase-admin';
import { notFound } from 'next/navigation';
import { CheckCircle, XCircle, Lock } from 'lucide-react';
import TechnicianCard3D from '@/components/TechnicianCard3D';

// Menghindari Next.js melakukan caching halaman agar status keaktifan terupdate secara real-time
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function VerifyTechnicianPage({ params }: PageProps) {
  const { token } = await params;

  // Validasi format UUID sederhana untuk mencegah error database
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    notFound();
  }

  // Mengambil data teknisi menggunakan supabaseAdmin (bypass RLS agar status nonaktif terdeteksi dengan benar)
  // Hanya memilih kolom yang aman untuk publik (tidak menyertakan email, hp, dan nomor karyawan internal)
  const { data: technician, error } = await supabaseAdmin
    .from('technicians')
    .select(`
      technician_id,
      technician_name,
      branch,
      service_center,
      photo_url,
      technician_status,
      technician_level,
      technician_id_cards!technician_id_cards_technician_id_fkey (
        card_number,
        card_status,
        expiry_date
      )
    `)
    .eq('qr_token', token)
    .single();

  // Jika error atau data tidak ditemukan, alihkan ke halaman 404
  if (error || !technician) {
    notFound();
  }

  const cardList = technician.technician_id_cards as any[];
  const cardInfo = cardList && cardList.length > 0 ? cardList[0] : null;

  const isTechnicianActive = technician.technician_status === 'active';
  const isCardActive = cardInfo?.card_status === 'active';

  // Periksa apakah kartu kadaluarsa
  const expiryDate = cardInfo ? new Date(cardInfo.expiry_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isExpired = expiryDate ? expiryDate < today : false;

  // Status validasi akhir
  const isValid = isTechnicianActive && isCardActive && !isExpired;

  // Waktu verifikasi real-time (WIB)
  const timestamp = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  // Level Teks
  const levelLabels: Record<string, string> = {
    beginner: 'BEGINNER',
    intermediate: 'INTERMEDIATE',
    advance: 'ADVANCED'
  };
  const levelText = levelLabels[technician.technician_level] || technician.technician_level.toUpperCase();

  // Format Tanggal Kadaluarsa
  const formattedExpiryDate = expiryDate ? expiryDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '-';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1rem', fontFamily: 'var(--font-sans, Arial, sans-serif)' }}>

      {/* Header Logo MODENA */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <img
          src="/modena-logo-official.png"
          alt="MODENA"
          style={{
            height: '1.8rem',
            width: 'auto',
            objectFit: 'contain',
            display: 'inline-block',
            marginBottom: '0.25rem'
          }}
        />
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: '#707070', fontWeight: 700 }}>
          AUTHORIZED SERVICE
        </span>
      </div>

      {/* Tampilan Visual Kartu 3D Interaktif (Sisi Depan & Belakang) */}
      <div style={{ marginBottom: '2rem' }}>
        <TechnicianCard3D
          technician={technician}
          cardInfo={cardInfo}
          levelText={levelText}
          formattedExpiryDate={formattedExpiryDate}
          isValid={isValid}
        />
      </div>

      {/* Informasi Detail & Status Verifikasi Digital */}
      <div 
        className="modena-card" 
        style={{ 
          width: '100%', 
          maxWidth: '400px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem', 
          padding: '1.5rem', 
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
        }}
      >
        {/* Status Badge Verifikasi */}
        <div style={{
          backgroundColor: isValid ? 'var(--status-active)' : 'var(--status-inactive)',
          color: 'white',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          fontWeight: 700,
          letterSpacing: '0.05em',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          boxShadow: isValid ? '0 4px 12px var(--status-active-glow)' : '0 4px 12px var(--status-inactive-glow)'
        }}>
          {isValid ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {isValid ? 'TEKNISI RESMI AKTIF' : (!isTechnicianActive ? 'TEKNISI NONAKTIF / BLOKIR' : (!cardInfo ? 'KARTU TIDAK DITEMUKAN' : (!isCardActive ? 'KARTU DITANGGUHKAN' : 'KARTU KADALUARSA')))}
        </div>

        {/* Tabel Detail Informasi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>ID Teknisi</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{technician.technician_id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Cabang / Wilayah</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{technician.branch}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Service Center</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{technician.service_center || '-'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>No. Seri ID Card</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cardInfo?.card_number || '-'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Masa Berlaku Kartu</span>
            <span style={{ fontWeight: 700, color: isExpired ? 'var(--status-inactive)' : 'var(--text-primary)' }}>{formattedExpiryDate}</span>
          </div>
        </div>

        {/* Watermark Keamanan */}
        <div style={{
          padding: '10px 12px',
          backgroundColor: '#F9FAFB',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          border: '1px dashed var(--border-color)',
          lineHeight: '1.4'
        }}>
          <Lock size={14} style={{ flexShrink: 0, marginTop: '2px', color: isValid ? 'var(--status-active)' : 'var(--status-inactive)' }} />
          <div>
            Halaman ini adalah bukti resmi verifikasi digital identitas teknisi MODENA.<br />
            Diverifikasi pada: <strong style={{ color: 'var(--text-secondary)' }}>{timestamp} WIB</strong>
          </div>
        </div>
      </div>

    </div>
  );
}
