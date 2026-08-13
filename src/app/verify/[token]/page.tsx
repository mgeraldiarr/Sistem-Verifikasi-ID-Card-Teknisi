// src/app/verify/[token]/page.tsx
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { CheckCircle, XCircle, Lock, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

// Di Next.js 15, params adalah sebuah Promise
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

  // Mengambil data teknisi beserta status ID card dari Supabase
  // RLS Policy untuk anon akan membatasi baris jika status tidak aktif (tergantung konfigurasi DB)
  // Untuk keamanan, kita hanya mengambil kolom-kolom non-sensitif (tanpa email, phone, dll)
  const { data: technician, error } = await supabase
    .from('technicians')
    .select(`
      technician_id,
      technician_name,
      branch,
      service_center,
      photo_url,
      technician_status,
      technician_level,
      technician_id_cards (
        card_number,
        card_status,
        expiry_date
      )
    `)
    .eq('qr_token', token)
    .single();

  // Jika error atau data tidak ditemukan, alihkan ke halaman 404 (not-found)
  if (error || !technician) {
    notFound();
  }

  // Mengakses informasi kartu dari array relasi
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

  // Teks, warna, dan ikon dinamis berdasarkan status keaktifan teknisi dan kartu
  let statusText = 'TEKNISI AKTIF';
  let statusColorClass = 'var(--status-active)';
  let statusGlowClass = 'var(--status-active-glow)';
  let StatusIcon = CheckCircle;

  if (!isTechnicianActive) {
    statusText = 'TEKNISI NONAKTIF / BLOKIR';
    statusColorClass = 'var(--status-inactive)';
    statusGlowClass = 'var(--status-inactive-glow)';
    StatusIcon = XCircle;
  } else if (!cardInfo) {
    statusText = 'KARTU TIDAK DITEMUKAN';
    statusColorClass = 'var(--status-inactive)';
    statusGlowClass = 'var(--status-inactive-glow)';
    StatusIcon = XCircle;
  } else if (!isCardActive) {
    statusText = 'KARTU DITANGGUHKAN';
    statusColorClass = 'var(--status-inactive)';
    statusGlowClass = 'var(--status-inactive-glow)';
    StatusIcon = XCircle;
  } else if (isExpired) {
    statusText = 'KARTU KADALUARSA';
    statusColorClass = 'var(--status-inactive)';
    statusGlowClass = 'var(--status-inactive-glow)';
    StatusIcon = XCircle;
  }

  // Format Level Teks
  const levelLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advance: 'Advance / Senior'
  };
  const levelText = levelLabels[technician.technician_level] || technician.technician_level;

  // Format Tanggal Kadaluarsa Card untuk Tampilan
  const formattedExpiryDate = expiryDate ? expiryDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '-';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem' }}>
      
      {/* Header Logo MODENA */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '2rem', letterSpacing: '0.15em', color: 'var(--bg-dark)', margin: 0 }}>
          MODENA
        </h1>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--text-secondary)', fontWeight: 500 }}>
          AUTHORIZED SERVICE
        </span>
      </div>

      {/* Main Card Teknisi */}
      <div className="modena-card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
        
        {/* Badge Status Keaktifan */}
        <div style={{
          backgroundColor: statusColorClass,
          color: 'white',
          padding: '1.25rem',
          textAlign: 'center',
          fontWeight: 700,
          letterSpacing: '0.05em',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          margin: '-24px -24px 1rem -24px', /* Negatif margin agar penuh ke ujung kartu */
          boxShadow: `0 4px 12px ${statusGlowClass}`
        }}>
          <StatusIcon size={24} />
          {statusText}
        </div>

        {/* Foto Profil Teknisi */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            width: '140px', 
            height: '140px', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: '2px solid var(--border-color)',
            backgroundColor: '#F3F4F6',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
          }}>
            {technician.photo_url ? (
              <img 
                src={technician.photo_url} 
                alt={technician.technician_name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No Photo
              </div>
            )}
          </div>
        </div>

        {/* Detail Informasi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {technician.technician_name}
            </h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              <Shield size={14} style={{ color: 'var(--accent-red)' }} />
              <span>Teknisi Resmi MODENA</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '0' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>ID Teknisi</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {technician.technician_id}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Sertifikasi Level</span>
              <span style={{ 
                fontWeight: 700, 
                fontSize: '0.825rem', 
                color: technician.technician_level === 'advance' ? '#B45309' : (technician.technician_level === 'intermediate' ? '#0F766E' : 'var(--text-primary)'),
                backgroundColor: technician.technician_level === 'advance' ? '#FEF3C7' : (technician.technician_level === 'intermediate' ? '#CCFBF1' : '#F3F4F6'),
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {levelText}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Cabang / Lokasi</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {technician.branch}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Service Center</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {technician.service_center || '-'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No. Seri ID Card</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {cardInfo?.card_number || '-'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Masa Berlaku Kartu</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: isExpired ? 'var(--status-inactive)' : 'var(--text-primary)' }}>
                {formattedExpiryDate}
              </span>
            </div>
          </div>
        </div>

        {/* Watermark Validasi Digital */}
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          border: '1px dashed var(--border-color)'
        }}>
          <Lock size={14} style={{ flexShrink: 0, marginTop: '2px', color: isValid ? 'var(--status-active)' : 'var(--status-inactive)' }} />
          <p style={{ lineHeight: '1.4', margin: 0 }}>
            Halaman ini adalah bukti resmi verifikasi digital identitas teknisi MODENA.<br/>
            Diverifikasi pada: <strong style={{ color: 'var(--text-secondary)' }}>{timestamp} WIB</strong>
          </p>
        </div>
        
      </div>

      {/* Button kembali */}      
      <div style={{ marginTop: '2rem' }}>
        <Link
          href='/scan'
          className='modena-btn-secondary'
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderRadius: '8px',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={18} /> Scanner
        </Link>
      </div>

    </div>
  );
}
