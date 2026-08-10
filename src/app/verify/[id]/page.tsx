// src/app/verify/[id]/page.tsx
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { CheckCircle, XCircle, Lock } from 'lucide-react';

// Di Next.js 15, params adalah sebuah Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyPage({ params }: PageProps) {
  const { id } = await params;

  // Validasi format UUID sederhana untuk mencegah error database
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  // Mengambil data karyawan dari Supabase
  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  // Jika error atau data tidak ditemukan, alihkan ke halaman 404 (not-found)
  if (error || !employee) {
    notFound();
  }

  // Waktu verifikasi real-time
  const timestamp = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem' }}>
      
      {/* Header Logo MODENA */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '2rem', letterSpacing: '0.15em', color: 'var(--bg-dark)' }}>
          MODENA
        </h1>
      </div>

      {/* Main Card Karyawan */}
      <div className="modena-card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
        
        {/* Badge Status Keaktifan */}
        <div style={{
          backgroundColor: employee.is_active ? 'var(--status-active)' : 'var(--status-inactive)',
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
          boxShadow: employee.is_active ? '0 4px 12px var(--status-active-glow)' : '0 4px 12px var(--status-inactive-glow)'
        }}>
          {employee.is_active ? <CheckCircle size={24} /> : <XCircle size={24} />}
          {employee.is_active ? 'KARYAWAN AKTIF' : 'TIDAK AKTIF / DIBLOKIR'}
        </div>

        {/* Foto Profil */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            width: '140px', 
            height: '140px', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: '2px solid var(--border-color)',
            backgroundColor: '#F3F4F6'
          }}>
            {employee.photo_url ? (
              <img 
                src={employee.photo_url} 
                alt={employee.full_name} 
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{employee.full_name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{employee.position}</p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', margin: '0' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Kode Karyawan</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{employee.employee_code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Cabang / Lokasi</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{employee.branch_name}</span>
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
          color: 'var(--text-muted)'
        }}>
          <Lock size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ lineHeight: '1.4' }}>
            Diverifikasi secara digital pada:<br/>
            <strong style={{ color: 'var(--text-secondary)' }}>{timestamp} WIB</strong>
          </p>
        </div>

      </div>
    </div>
  );
}