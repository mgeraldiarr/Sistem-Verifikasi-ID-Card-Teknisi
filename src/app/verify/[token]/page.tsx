// src/app/verify/[token]/page.tsx
import { supabaseAdmin } from '@/lib/supabase-admin';
import { notFound } from 'next/navigation';
import { CheckCircle, XCircle, Lock } from 'lucide-react';

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

  // Warna-warna utama sesuai desain kartu fisik
  const CREAM = '#ECE8DA';
  const DARK = '#1C1C1A';
  const ACCENT_RED = '#DA291C';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F2EC', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem', fontFamily: 'var(--font-sans, Arial, sans-serif)' }}>

      {/* Header Logo MODENA */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
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

      {/* Tampilan Visual Kartu Fisik (Sisi Depan ID Card) */}
      <div 
        style={{ 
          width: '320px', 
          height: '508px', /* Rasio CR80 standar kartu nama portrait */
          backgroundColor: CREAM,
          borderRadius: '18px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #D6D2C2',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
          marginBottom: '2rem'
        }}
      >
        {/* Header ID Card */}
        <div style={{ padding: '14px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo MODENA Authorized */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src="/logo-modena.png"
              alt="Modena Logo"
              style={{
                width: '28px',
                height: '28px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: '1px solid #D6D2C2'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', transform: 'translateY(-1px)' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, lineHeight: 1.1, color: DARK }}>
                MODENA
              </span>
              <span style={{ fontSize: '7px', fontWeight: 800, letterSpacing: '1px', lineHeight: 1.1, color: '#707070', marginTop: '1px' }}>
                AUTHORIZED
              </span>
            </div>
          </div>

          {/* Level Sertifikasi */}
          <span style={{
            fontSize: '7px',
            fontWeight: 800,
            backgroundColor: 'rgba(0,0,0,0.06)',
            padding: '4px 8px',
            borderRadius: '4px',
            color: DARK,
            letterSpacing: '0.5px'
          }}>
            {levelText}
          </span>
        </div>

        {/* Foto Profil Teknisi */}
        <div
          style={{
            flex: 1,
            margin: '12px 16px 0',
            borderRadius: '10px',
            overflow: 'hidden',
            backgroundColor: '#D6D2C2',
            border: '1px solid #C5C1B1',
            position: 'relative'
          }}
        >
          {technician.photo_url ? (
            <img
              src={technician.photo_url}
              alt={technician.technician_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' }}>
              <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Tidak Ada Foto</span>
            </div>
          )}
        </div>

        {/* Strip Nama & Jabatan (Warna Gelap) */}
        <div style={{ backgroundColor: DARK, color: 'white', padding: '12px 16px', textAlign: 'left' }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.15, textTransform: 'uppercase', letterSpacing: '0.2px' }}>
            {technician.technician_name}
          </div>
          <div style={{ fontSize: '7px', fontWeight: 800, color: ACCENT_RED, marginTop: '4px', letterSpacing: '0.8px' }}>
            AUTHORIZED TECHNICIAN
          </div>
        </div>
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
