'use client';

import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F3F2EC',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: 'var(--font-sans, Arial, sans-serif)',
      textAlign: 'center'
    }}>
      {/* Header Logo MODENA */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <img
          src="/modena-logo-official.png"
          alt="MODENA"
          style={{ height: '1.8rem', width: 'auto', objectFit: 'contain' }}
        />
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: '#707070', fontWeight: 700 }}>
          AUTHORIZED SERVICE
        </span>
      </div>

      {/* Card 404 Container */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '2.5rem 1.5rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        border: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DA291C'
        }}>
          <AlertTriangle size={32} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1C1C1A', margin: 0 }}>
          404 - Halaman Tidak Ditemukan
        </h1>

        <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
         Halaman tidak ditemukan atau data ID Card tidak terdaftar dalam sistem verifikasi resmi MODENA.
        </p>

      </div>
    </div>
  );
}
