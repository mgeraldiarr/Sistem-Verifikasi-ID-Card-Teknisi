// src/app/scan/page.tsx
"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, Loader2 } from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerInitialized = useRef(false);

  useEffect(() => {
    // Hindari inisialisasi ganda jika sudah berhasil scan
    if (scanResult) return;
    
    // Mencegah inisialisasi ganda oleh React Strict Mode
    if (scannerInitialized.current) return;
    scannerInitialized.current = true;

    // Konfigurasi Scanner
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        // Mendukung kamera utama (belakang) atau depan
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText: string) => {
      // Validasi sederhana: pastikan URL mengarah ke sistem kita (/verify/)
      if (decodedText.includes('/verify/')) {
        setScanResult(decodedText);
        
        // Memberikan efek getaran (Haptic Feedback) jika didukung HP
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(200);
        }

        // Pindah ke URL profil
        router.push(decodedText);
      } else {
        setError('QR Code tidak dikenali. Harap scan ID Card perusahaan resmi.');
        setTimeout(() => setError(null), 3500); // Hapus pesan error setelah 3.5 detik
      }
    };

    const onScanFailure = (errorMessage: string) => {
      // Diabaikan: Fungsi ini terpanggil terus menerus ketika tidak ada QR yang tertangkap
    };

    // Render scanner ke div dengan id="reader"
    scanner.render(onScanSuccess, onScanFailure);

    // Membersihkan kamera (unmount) jika pengguna berpindah halaman
    let isCleaningUp = false;
    return () => {
      if (!isCleaningUp) {
        isCleaningUp = true;
        scannerInitialized.current = false;
        scanner.clear().catch(() => {}); // Tangkap error secara diam-diam
      }
    };
  }, [scanResult, router]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.75rem', letterSpacing: '0.15em', color: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Camera size={28} /> SCANNER
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Arahkan QR Code ID Card ke dalam area kotak
        </p>
      </div>

      <div className="modena-card" style={{ width: '100%', maxWidth: '400px', padding: '1rem' }}>
        
        {/* CSS Kustom untuk merapikan elemen bawaan html5-qrcode agar sesuai gaya MODENA */}
        <style dangerouslySetInnerHTML={{__html: `
          #reader {
            border: none !important;
            border-radius: 12px;
            overflow: hidden;
            background: #000;
          }
          #reader video {
            object-fit: cover !important;
            border-radius: 12px;
          }
          #reader button {
            background-color: var(--bg-dark) !important;
            color: white !important;
            border: none !important;
            padding: 8px 16px !important;
            border-radius: 4px !important;
            font-family: var(--font-sans) !important;
            font-weight: 600 !important;
            font-size: 0.875rem !important;
            cursor: pointer !important;
            margin: 8px 4px !important;
            transition: background-color 0.3s;
          }
          #reader button:hover {
            background-color: var(--accent-red) !important;
          }
          #reader select {
            padding: 8px !important;
            border-radius: 4px !important;
            border: 1px solid var(--border-color) !important;
            font-family: var(--font-sans) !important;
            margin-bottom: 8px !important;
            width: 100%;
          }
          #reader a {
            display: none !important; /* Menyembunyikan link atribusi agar bersih */
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-custom {
            animation: spin 1s linear infinite;
          }
        `}} />

        {error && (
          <div style={{ backgroundColor: 'var(--status-inactive-glow)', color: 'var(--status-inactive)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {scanResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: '1rem' }}>
            <Loader2 size={36} color="var(--status-active)" className="animate-spin-custom" />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Memverifikasi ID Card...</p>
          </div>
        ) : (
          <div id="reader" style={{ width: '100%' }}></div>
        )}
      </div>
    </div>
  );
}