// src/app/admin/dashboard/components/LogoutModal.tsx
'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  show,
  onClose,
  onConfirm,
}) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 50,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="modena-card"
        style={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          padding: '2.5rem 2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            color: 'var(--accent-red)',
          }}
        >
          <LogOut size={48} />
        </div>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            color: 'var(--text-primary)',
          }}
        >
          Konfirmasi Keluar
        </h3>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            marginBottom: '2rem',
            lineHeight: '1.5',
          }}
        >
          Apakah Anda yakin ingin keluar dari Dashboard Portal Admin MODENA?
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="modena-btn-secondary"
            style={{ flex: 1, padding: '10px 20px', borderRadius: '4px' }}
          >
            BATAL
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="modena-btn-primary"
            style={{
              flex: 1,
              padding: '10px 20px',
              borderRadius: '4px',
              backgroundColor: 'var(--accent-red)',
              color: 'white',
            }}
          >
            KELUAR
          </button>
        </div>
      </div>
    </div>
  );
};
