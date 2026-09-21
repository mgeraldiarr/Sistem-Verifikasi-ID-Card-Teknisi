// src/app/admin/login/components/TechnicianGuideModal.tsx
'use client';

import React, { useEffect } from 'react';
import { X, HelpCircle, BadgeCheck, KeyRound, ShieldCheck } from 'lucide-react';

interface TechnicianGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicianGuideModal: React.FC<TechnicianGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Tutup modal saat tombol Escape ditekan
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 100,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#242422',
          border: '1px solid rgba(236, 232, 218, 0.15)',
          borderRadius: '16px',
          padding: '1.75rem',
          color: '#ECE8DA',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(218, 41, 28, 0.16)',
                border: '1px solid rgba(218, 41, 28, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FF6B5E',
                flexShrink: 0,
              }}
            >
              <HelpCircle size={20} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                Panduan Akses Teknisi
              </h3>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(236, 232, 218, 0.55)',
                  margin: '2px 0 0',
                }}
              >
                Petunjuk masuk perdana portal mandiri teknisi
              </p>
            </div>
          </div>

          {/* Tombol Tutup Silang */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(236, 232, 218, 0.5)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(236, 232, 218, 0.5)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Daftar Petunjuk */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '0.25rem 0',
          }}
        >
          {/* Poin 1: Identitas */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'rgba(218, 41, 28, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px',
              }}
            >
              <BadgeCheck size={16} color="#DA291C" />
            </div>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF' }}>
                1. Identitas Masuk (NIK)
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(236, 232, 218, 0.7)',
                  lineHeight: 1.5,
                  marginTop: '2px',
                }}
              >
                Gunakan <strong>Nomor Induk Karyawan (NIK)</strong> resmi Anda (contoh:{' '}
                <code
                  style={{
                    color: '#ECE8DA',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  10123456
                </code>
                ). Bagi Administrator, silakan gunakan email resmi.
              </div>
            </div>
          </div>

          {/* Poin 2: Kata Sandi Awal */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'rgba(218, 41, 28, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px',
              }}
            >
              <KeyRound size={16} color="#DA291C" />
            </div>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF' }}>
                2. Format Kata Sandi Awal
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(236, 232, 218, 0.7)',
                  lineHeight: 1.5,
                  marginTop: '2px',
                }}
              >
                Gunakan formula standar:
                <div style={{ marginTop: '4px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: 'rgba(218, 41, 28, 0.18)',
                      border: '1px solid rgba(218, 41, 28, 0.4)',
                      color: '#FF8A80',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    Modena@{'{4 digit terakhir No HP}'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Poin 3: Keamanan */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'rgba(13, 148, 136, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px',
              }}
            >
              <ShieldCheck size={16} color="#0D9488" />
            </div>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF' }}>
                3. Aktivasi Kata Sandi Baru
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(236, 232, 218, 0.7)',
                  lineHeight: 1.5,
                  marginTop: '2px',
                }}
              >
                Setelah berhasil masuk untuk pertama kali, sistem akan langsung meminta Anda
                membuat kata sandi pribadi baru demi keamanan data.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bantuan Cabang */}
        <div
          style={{
            borderTop: '1px solid rgba(236, 232, 218, 0.1)',
            paddingTop: '0.85rem',
            fontSize: '0.725rem',
            color: 'rgba(236, 232, 218, 0.55)',
            lineHeight: 1.5,
          }}
        >
          💡 Kendala masuk atau nomor HP belum terdaftar di sistem cabang? Silakan hubungi{' '}
          <strong style={{ color: '#FFFFFF' }}>Admin Cabang</strong> atau PIC Service Center Anda.
        </div>
      </div>
    </div>
  );
};
