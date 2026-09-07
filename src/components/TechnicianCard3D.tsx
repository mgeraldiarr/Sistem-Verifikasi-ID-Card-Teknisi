// src/components/TechnicianCard3D.tsx
"use client";

import React, { useState } from 'react';
import { ShieldCheck, QrCode as QrIcon, Award, RotateCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { CardStatus, TechnicianLevel, TechnicianStatus } from '@/types';

interface TechnicianData {
  technician_id: string;
  technician_name: string;
  branch: string;
  service_center: string | null;
  photo_url: string | null;
  technician_status: TechnicianStatus;
  technician_level: TechnicianLevel;
}

interface CardInfoData {
  card_number: string;
  card_status: CardStatus;
  expiry_date: string;
}

interface TechnicianCard3DProps {
  technician: TechnicianData;
  cardInfo: CardInfoData | null;
  levelText: string;
  formattedExpiryDate: string;
  isValid: boolean;
  verifyUrl?: string;
}

export default function TechnicianCard3D({
  technician,
  cardInfo,
  levelText,
  formattedExpiryDate,
  isValid,
  verifyUrl,
}: TechnicianCard3DProps) {
  // State untuk melacak apakah kartu sedang menampilkan sisi depan (false) atau belakang (true)
  const [isFlipped, setIsFlipped] = useState(false);

  // Fungsi untuk membalik kartu
  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  // Styling Warna Khas MODENA
  const CREAM = '#ECE8DA';
  const DARK = '#1C1C1A';
  const ACCENT_RED = '#DA291C';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>

      {/* Container Utama: Bingkai Tetap (Fixed Frame) Rasio CR80 (320px x 508px) */}
      <div
        style={{
          perspective: '1200px',
          width: '320px',
          height: '508px',
          position: 'relative',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'pan-y', // Menjamin scroll di layar HP tetap mulus
        }}
      >
        {/* Card Flipper Wrapper (Bereaksi saat diklik untuk berputar 180°) */}
        <div
          onClick={handleFlip}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            borderRadius: '18px',
            cursor: 'pointer',
          }}
        >

          {/* ==================== SISI DEPAN KARTU ==================== */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              backgroundColor: CREAM,
              borderRadius: '18px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #D6D2C2',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(0, 0, 0, 0.08)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            {/* Header ID Card */}
            <div style={{ padding: '14px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                fontSize: '7.5px',
                fontWeight: 800,
                backgroundColor: 'rgba(28, 28, 26, 0.08)',
                padding: '4px 9px',
                borderRadius: '4px',
                color: DARK,
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Award size={10} color={DARK} />
                {levelText}
              </span>
            </div>

            {/* Foto Profil Teknisi */}
            <div
              style={{
                flex: 1,
                margin: '12px 16px 0',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#D6D2C2',
                border: '1px solid #C5C1B1',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
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

              {/* Verified Badge Overlay */}
              {isValid && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(28, 28, 26, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#22C55E',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '9px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                >
                  <ShieldCheck size={12} color="#22C55E" />
                  <span>VERIFIED</span>
                </div>
              )}
            </div>

            {/* Strip Nama & Jabatan */}
            <div style={{ backgroundColor: DARK, color: 'white', padding: '14px 16px', textAlign: 'left', position: 'relative' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.15, textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                {technician.technician_name}
              </div>
              <div style={{ fontSize: '7.5px', fontWeight: 800, color: ACCENT_RED, marginTop: '4px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>AUTHORIZED TECHNICIAN</span>
                <span style={{ color: '#555' }}>•</span>
                <span style={{ color: '#AAA' }}>{technician.branch}</span>
              </div>
            </div>
          </div>

          {/* ==================== SISI BELAKANG KARTU ==================== */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              backgroundColor: DARK,
              color: '#FFFFFF',
              borderRadius: '18px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px',
              border: '1px solid #333330',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)',
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {/* Header Belakang */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333330', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ACCENT_RED }} />
                <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1.5px', color: '#ECE8DA' }}>
                  MODENA OFFICIAL ID
                </span>
              </div>
              <span style={{ fontSize: '8px', fontWeight: 700, color: '#888888', letterSpacing: '0.5px' }}>
                SERI: {cardInfo?.card_number || '-'}
              </span>
            </div>

            {/* Area QR Code */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px 0', gap: '10px' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '10px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {verifyUrl ? (
                  <QRCodeSVG value={verifyUrl} size={110} level="M" />
                ) : (
                  <QrIcon size={100} color={DARK} />
                )}
              </div>
              <span style={{ fontSize: '8px', color: '#AAAAAA', textAlign: 'center', letterSpacing: '0.5px' }}>
                Pindai QR Code untuk verifikasi status real-time
              </span>
            </div>

            {/* Detail ID & Cabang */}
            <div style={{ backgroundColor: '#262624', padding: '10px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '9px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>ID Karyawan:</span>
                <span style={{ fontWeight: 700, color: '#ECE8DA' }}>{technician.technician_id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Cabang / Wilayah:</span>
                <span style={{ fontWeight: 700, color: '#ECE8DA' }}>{technician.branch}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Masa Berlaku:</span>
                <span style={{ fontWeight: 700, color: isValid ? '#22C55E' : ACCENT_RED }}>{formattedExpiryDate}</span>
              </div>
            </div>

            {/* Ketentuan & Call Center */}
            <div style={{ borderTop: '1px solid #333330', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '7.5px', color: '#777777', lineHeight: 1.3 }}>
              <div>
                Kartu ini milik PT MODENA Indonesia.<br />
                Jika ditemukan, harap kembalikan ke cabang terdekat.
              </div>
              <div style={{ textAlign: 'right', fontWeight: 700, color: '#AAAAAA' }}>
                Call Center:<br />
                <span style={{ color: ACCENT_RED }}>1500-715</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Tombol Aksi Flip-Flop */}
      <button
        type="button"
        onClick={handleFlip}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#1C1C1A',
          color: '#ECE8DA',
          border: '1px solid #333330',
          padding: '10px 22px',
          borderRadius: '30px',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          transition: 'all 0.25s ease',
        }}
      >
        <RotateCw size={15} style={{ transform: isFlipped ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s ease' }} />
        <span>{isFlipped ? 'Lihat Sisi Depan' : 'Lihat Sisi Belakang'}</span>
      </button>

      {/* Petunjuk Tambahan */}
      <span style={{ fontSize: '0.75rem', color: '#888888', fontStyle: 'italic' }}>
        💡 Ketuk kartu atau klik tombol di atas untuk membalik kartu
      </span>
    </div>
  );
}
