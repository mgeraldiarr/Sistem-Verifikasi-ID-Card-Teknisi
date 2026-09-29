// src/app/admin/(portal)/dashboard/components/technician-form/IncompleteFormDialog.tsx
'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface IncompleteFormDialogProps {
  missingFields: string[];
  onClose: () => void;
}

/** Peringatan saat simpan dibatalkan karena ada field wajib yang masih kosong. */
export const IncompleteFormDialog: React.FC<IncompleteFormDialogProps> = ({
  missingFields,
  onClose,
}) => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 100,
      backdropFilter: 'blur(5px)',
    }}
  >
    <div
      className="modena-card"
      role="alertdialog"
      aria-labelledby="incomplete-form-title"
      style={{
        width: '100%',
        maxWidth: '480px',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1.5px solid #EF4444',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div
          style={{
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            display: 'flex',
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <div>
          <h4
            id="incomplete-form-title"
            style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991B1B', margin: 0 }}
          >
            Formulir Belum Lengkap!
          </h4>
          <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '2px 0 0 0' }}>
            Sistem mewajibkan seluruh field diisi sebelum disimpan.
          </p>
        </div>
      </div>

      <p
        style={{
          fontSize: '0.825rem',
          color: '#374151',
          marginBottom: '0.75rem',
          fontWeight: 600,
        }}
      >
        Rincian data yang masih kosong ({missingFields.length} item):
      </p>

      <div
        style={{
          maxHeight: '180px',
          overflowY: 'auto',
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '1.25rem',
        }}
      >
        {missingFields.map((field) => (
          <div
            key={field}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.825rem',
              color: '#B91C1C',
              fontWeight: 600,
            }}
          >
            <span
              style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444' }}
            />
            <span>{field}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="modena-btn-primary"
        style={{
          width: '100%',
          padding: '0.75rem',
          fontWeight: 700,
          fontSize: '0.875rem',
          backgroundColor: '#DC2626',
        }}
      >
        Saya Mengerti, Lengkapi Sekarang
      </button>
    </div>
  </div>
);
