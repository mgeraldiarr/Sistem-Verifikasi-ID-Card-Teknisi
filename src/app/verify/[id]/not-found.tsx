// src/app/verify/[id]/not-found.tsx
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '2rem', letterSpacing: '0.15em', color: 'var(--bg-dark)' }}>
          MODENA
        </h1>
      </div>

      <div className="modena-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <AlertCircle size={56} color="var(--accent-red)" style={{ marginBottom: '0.5rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>ID Card Tidak Valid</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
          Data karyawan tidak ditemukan atau format ID salah. Pastikan Anda memindai QR Code resmi dari ID Card perusahaan.
        </p>
        
        {/* Kita bisa mengarahkan kembali ke scanner */}
        <Link href="/scan" className="modena-btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
          BUKA SCANNER
        </Link>
      </div>

    </div>
  );
}