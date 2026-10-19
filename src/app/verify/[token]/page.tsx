// src/app/verify/[token]/page.tsx
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { evaluateCardStatus, getLevelCardLabel } from '@/lib/card-status';
import { notFound } from 'next/navigation';
import { Clock, ShieldCheck, ShieldX } from 'lucide-react';
import TechnicianCard3D from '@/components/TechnicianCard3D';

// Menghindari Next.js melakukan caching halaman agar status keaktifan terupdate secara real-time
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ token: string }>;
}

function PublicHeader() {
  return (
    <header className="public-head">
      <img src="/modena-logo-official.png" alt="MODENA" />
      <span>Verifikasi teknisi resmi</span>
    </header>
  );
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

  // Jika data tidak ditemukan (misalnya QR code lama yang telah diregenerasi / hangus)
  if (error || !technician) {
    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });

    return (
      <main className="public-page">
        <PublicHeader />
        <div className="public-body">
          <div className="verdict is-invalid" role="status">
            <ShieldX size={28} />
            <div>
              <h1 className="verdict-title">QR code tidak berlaku</h1>
              <p className="verdict-sub">
                Kartu ini sudah diganti oleh HR, atau QR code tidak terdaftar di sistem verifikasi
                MODENA.
              </p>
            </div>
          </div>

          <div className="panel panel-pad" style={{ width: '100%' }}>
            <p style={{ lineHeight: 1.6 }}>
              Minta teknisi menunjukkan ID card terbaru, lalu pindai ulang QR code di kartu
              tersebut. Bila ragu, hubungi Call Center MODENA di <strong>1500-715</strong>.
            </p>
            <p className="stamp" style={{ marginTop: '14px' }}>
              <Clock size={13} />
              Diperiksa {timestamp} WIB
            </p>
          </div>
        </div>
      </main>
    );
  }

  const cardInfo = technician.technician_id_cards?.[0] ?? null;
  const { isValid, isTechnicianActive, isCardActive, isExpired, formattedExpiryDate } =
    evaluateCardStatus(technician.technician_status, cardInfo);

  // Waktu verifikasi real-time (WIB)
  const timestamp = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  const levelText = getLevelCardLabel(technician.technician_level);

  const invalidReason = !isTechnicianActive
    ? 'Teknisi ini sudah tidak aktif di MODENA.'
    : !cardInfo
      ? 'ID card untuk teknisi ini belum diterbitkan.'
      : !isCardActive
        ? 'ID card ini sedang ditangguhkan.'
        : `ID card ini sudah kedaluwarsa sejak ${formattedExpiryDate}.`;

  return (
    <main className="public-page">
      <PublicHeader />
      <div className="public-body">
        <div className={`verdict${isValid ? '' : ' is-invalid'}`} role="status">
          {isValid ? <ShieldCheck size={28} /> : <ShieldX size={28} />}
          <div>
            <h1 className="verdict-title">
              {isValid ? 'Teknisi resmi MODENA' : 'Kartu tidak valid'}
            </h1>
            <p className="verdict-sub">
              {isValid
                ? `${technician.technician_name} terdaftar aktif. Kartu berlaku sampai ${formattedExpiryDate}.`
                : invalidReason}
            </p>
          </div>
        </div>

        <TechnicianCard3D
          technician={technician}
          levelText={levelText}
          formattedExpiryDate={formattedExpiryDate}
          isValid={isValid}
        />

        <div className="panel panel-pad" style={{ width: '100%' }}>
          <dl className="detail-list">
            <div>
              <dt>Nama</dt>
              <dd>{technician.technician_name}</dd>
            </div>
            <div>
              <dt>ID teknisi</dt>
              <dd className="tnum">{technician.technician_id}</dd>
            </div>
            <div>
              <dt>Cabang</dt>
              <dd>{technician.branch}</dd>
            </div>
            <div>
              <dt>Service center</dt>
              <dd>{technician.service_center || '-'}</dd>
            </div>
            <div>
              <dt>Nomor kartu</dt>
              <dd className="tnum">{cardInfo?.card_number || '-'}</dd>
            </div>
            <div>
              <dt>Berlaku sampai</dt>
              <dd style={isExpired ? { color: 'var(--red-ink)' } : undefined}>
                {formattedExpiryDate}
              </dd>
            </div>
          </dl>
          <p className="stamp" style={{ marginTop: '14px' }}>
            <Clock size={13} />
            Status diperiksa langsung dari sistem MODENA pada {timestamp} WIB.
          </p>
        </div>
      </div>
    </main>
  );
}
