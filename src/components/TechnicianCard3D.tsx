// src/components/TechnicianCard3D.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { RotateCw, ShieldCheck, QrCode as QrIcon, Award, Play, Pause, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface TechnicianData {
  technician_id: string;
  technician_name: string;
  branch: string;
  service_center: string | null;
  photo_url: string | null;
  technician_status: 'active' | 'inactive';
  technician_level: 'beginner' | 'intermediate' | 'advance';
}

interface CardInfoData {
  card_number: string;
  card_status: 'active' | 'suspended' | 'expired';
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
  // State untuk Rotasi 360 Derajat (X dan Y)
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number }>({
    x: 0,
    y: 0,
    rotX: 0,
    rotY: 0,
  });

  const animFrameRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Styling Warna MODENA
  const CREAM = '#ECE8DA';
  const DARK = '#1C1C1A';
  const ACCENT_RED = '#DA291C';

  // Loop Animasi Auto-Spin 360°
  useEffect(() => {
    if (isAutoSpinning) {
      const spin = () => {
        setRotateY(prev => (prev + 1.2) % 360);
        animFrameRef.current = requestAnimationFrame(spin);
      };
      animFrameRef.current = requestAnimationFrame(spin);
    } else if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoSpinning]);

  // Penanganan Drag Mouse untuk Rotasi Bebas 360°
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoSpinning(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotateX,
      rotY: rotateY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStartRef.current) return;

    if (isDragging) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      setRotateY(dragStartRef.current.rotY + deltaX * 0.8);
      setRotateX(Math.max(-60, Math.min(60, dragStartRef.current.rotX - deltaY * 0.6)));
    }

    // Hitung posisi kilapan cahaya (Glare)
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      setGlarePos({ x: glareX, y: glareY, opacity: 0.35 });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  // Penanganan Drag Sentuhan Layar HP (Touch Gestures 360°)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    setIsDragging(true);
    setIsAutoSpinning(false);
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      rotX: rotateX,
      rotY: rotateY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;

    setRotateY(dragStartRef.current.rotY + deltaX * 1.0);
    setRotateX(Math.max(-60, Math.min(60, dragStartRef.current.rotX - deltaY * 0.8)));

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const glareX = ((touch.clientX - rect.left) / rect.width) * 100;
      const glareY = ((touch.clientY - rect.top) / rect.height) * 100;
      setGlarePos({ x: glareX, y: glareY, opacity: 0.35 });
    }
  };

  // Tombol Aksi Kontrol 360°
  const toggleAutoSpin = () => {
    setIsAutoSpinning(prev => !prev);
  };

  const flip180 = () => {
    setIsAutoSpinning(false);
    setRotateY(prev => (prev + 180) % 360);
  };

  const resetPosition = () => {
    setIsAutoSpinning(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
      
      {/* Panel Kontrol Rotasi 360° Interaktif */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={toggleAutoSpin}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            backgroundColor: isAutoSpinning ? ACCENT_RED : DARK,
            color: '#FFFFFF',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
          }}
        >
          {isAutoSpinning ? <Pause size={14} /> : <Play size={14} />}
          <span>{isAutoSpinning ? 'Hentikan Putaran' : 'Putar 360° Otomatis'}</span>
        </button>

        <button
          onClick={flip180}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#333330',
            color: '#FFFFFF',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
          }}
        >
          <RotateCw size={14} />
          <span>Balik 180°</span>
        </button>

        <button
          onClick={resetPosition}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.8rem',
            backgroundColor: '#E5E7EB',
            color: DARK,
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Reset Posisi Depan"
        >
          <RefreshCw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* Container Utama 3D Perspective */}
      <div
        style={{
          perspective: '1200px',
          width: '320px',
          height: '508px',
          cursor: isDragging ? 'grabbing' : 'grab',
          position: 'relative',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        {/* Card Motion 360° Wrapper */}
        <div
          ref={cardRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
            transition: isDragging || isAutoSpinning ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            borderRadius: '18px',
          }}
        >
          {/* Layer Pantulan Cahaya (Holographic Glare) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '18px',
              zIndex: 30,
              pointerEvents: 'none',
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glarePos.opacity}) 0%, rgba(255,255,255,0) 70%)`,
              backfaceVisibility: 'hidden'
            }}
          />

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
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 4px 10px rgba(0, 0, 0, 0.1)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(1px)', // Mencegah clipping 3D
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
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
              transform: 'rotateY(180deg) translateZ(1px)', // Pemutaran 180 derajat
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

            {/* Watermark Ketentuan & Call Center */}
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

      {/* Petunjuk Penggunaan untuk Konsumen */}
      <span style={{ fontSize: '0.75rem', color: '#888888', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
        💡 Drag / Usap kartu ke kanan/kiri/atas/bawah untuk memutar 360° secara bebas
      </span>
    </div>
  );
}
