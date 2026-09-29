// src/app/admin/login/components/LoginGuideModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { X, HelpCircle, BadgeCheck, KeyRound, ShieldCheck, Mail } from 'lucide-react';

interface LoginGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideRole = 'technician' | 'branch_admin';

const codeStyle: React.CSSProperties = {
  color: '#ECE8DA',
  backgroundColor: 'rgba(255,255,255,0.08)',
  padding: '1px 5px',
  borderRadius: '4px',
  fontFamily: 'monospace',
};

const highlightStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: 'rgba(218, 41, 28, 0.18)',
  border: '1px solid rgba(218, 41, 28, 0.4)',
  color: '#FF8A80',
  padding: '2px 8px',
  borderRadius: '6px',
  fontWeight: 700,
  fontSize: '0.75rem',
  fontFamily: 'monospace',
};

interface GuideStep {
  icon: React.ReactNode;
  accent?: 'red' | 'teal';
  title: string;
  body: React.ReactNode;
}

const GUIDE: Record<GuideRole, { label: string; steps: GuideStep[]; help: React.ReactNode }> = {
  technician: {
    label: 'Teknisi',
    steps: [
      {
        icon: <BadgeCheck size={16} color="#DA291C" />,
        title: 'ID Pengguna = ID Teknisi',
        body: (
          <>
            Ketik ID Teknisi yang tercetak di kartu Anda, contoh{' '}
            <code style={codeStyle}>DSC-BAL-001</code>. Bukan NIK dan bukan email.
          </>
        ),
      },
      {
        icon: <KeyRound size={16} color="#DA291C" />,
        title: 'Kata Sandi Awal',
        body: (
          <>
            Dikirim Admin Cabang lewat WhatsApp, dengan format:
            <div style={{ marginTop: '4px' }}>
              <span style={highlightStyle}>Modena@{'{4 digit terakhir No HP}'}</span>
            </div>
          </>
        ),
      },
      {
        icon: <ShieldCheck size={16} color="#0D9488" />,
        accent: 'teal',
        title: 'Buat Kata Sandi Baru',
        body: 'Saat pertama kali masuk, sistem meminta Anda membuat kata sandi pribadi baru sebelum kartu digital dapat dibuka.',
      },
      {
        icon: <Mail size={16} color="#0D9488" />,
        accent: 'teal',
        title: 'Lupa Kata Sandi',
        body: 'Klik "Lupa Kata Sandi?" lalu masukkan email pribadi yang Anda daftarkan ke Admin Cabang. Tautan atur ulang dikirim ke email tersebut.',
      },
    ],
    help: (
      <>
        💡 ID Teknisi tidak dikenali, belum menerima kata sandi, atau email belum terdaftar?
        Hubungi <strong style={{ color: '#FFFFFF' }}>Admin Cabang</strong> Anda.
      </>
    ),
  },
  branch_admin: {
    label: 'Admin Cabang',
    steps: [
      {
        icon: <BadgeCheck size={16} color="#DA291C" />,
        title: 'ID Pengguna = ID Admin',
        body: (
          <>
            Ketik ID Admin yang diberikan Super Admin, contoh{' '}
            <code style={codeStyle}>ADM-BAL-01</code>. Admin Cabang tidak masuk memakai email.
          </>
        ),
      },
      {
        icon: <KeyRound size={16} color="#DA291C" />,
        title: 'Kata Sandi Awal',
        body: 'Diberikan langsung oleh Super Admin bersama ID Admin Anda.',
      },
      {
        icon: <ShieldCheck size={16} color="#0D9488" />,
        accent: 'teal',
        title: 'Buat Kata Sandi Baru',
        body: 'Saat pertama kali masuk, sistem meminta Anda membuat kata sandi pribadi baru.',
      },
      {
        icon: <Mail size={16} color="#0D9488" />,
        accent: 'teal',
        title: 'Lupa Kata Sandi',
        body: 'Klik "Lupa Kata Sandi?" lalu masukkan email pribadi yang didaftarkan Super Admin untuk akun Anda.',
      },
    ],
    help: (
      <>
        💡 Belum memiliki ID Admin atau akun dinonaktifkan? Hubungi{' '}
        <strong style={{ color: '#FFFFFF' }}>Super Admin MODENA</strong>.
      </>
    ),
  },
};

export const LoginGuideModal: React.FC<LoginGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [role, setRole] = useState<GuideRole>('technician');
  const guide = GUIDE[role];

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
                Panduan Masuk
              </h3>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(236, 232, 218, 0.55)',
                  margin: '2px 0 0',
                }}
              >
                Cara masuk untuk Teknisi & Admin Cabang
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

        {/* Pilihan Peran */}
        <div
          role="tablist"
          aria-label="Pilih peran"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
            padding: '4px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
        >
          {(Object.keys(GUIDE) as GuideRole[]).map((key) => {
            const active = key === role;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRole(key)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  backgroundColor: active ? '#DA291C' : 'transparent',
                  color: active ? '#FFFFFF' : 'rgba(236, 232, 218, 0.65)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {GUIDE[key].label}
              </button>
            );
          })}
        </div>

        {/* Daftar Petunjuk */}
        <div
          role="tabpanel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '0.25rem 0',
          }}
        >
          {guide.steps.map((step, index) => (
            <div
              key={step.title}
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor:
                    step.accent === 'teal'
                      ? 'rgba(13, 148, 136, 0.15)'
                      : 'rgba(218, 41, 28, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                {step.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF' }}>
                  {index + 1}. {step.title}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'rgba(236, 232, 218, 0.7)',
                    lineHeight: 1.5,
                    marginTop: '2px',
                  }}
                >
                  {step.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Bantuan */}
        <div
          style={{
            borderTop: '1px solid rgba(236, 232, 218, 0.1)',
            paddingTop: '0.85rem',
            fontSize: '0.725rem',
            color: 'rgba(236, 232, 218, 0.55)',
            lineHeight: 1.5,
          }}
        >
          {guide.help}
        </div>
      </div>
    </div>
  );
};
