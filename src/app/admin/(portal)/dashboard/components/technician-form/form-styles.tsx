// src/app/admin/(portal)/dashboard/components/technician-form/form-styles.tsx
import React from 'react';

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  outline: 'none',
  fontSize: '0.875rem',
};

/** Input yang dikunci sistem (ID & level otomatis) */
export const lockedInputStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: '#f8fafc',
  cursor: 'not-allowed',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.825rem',
  fontWeight: 600,
  marginBottom: '0.4rem',
};

/** Label dengan ikon / badge di dalamnya */
export const iconLabelStyle: React.CSSProperties = {
  ...labelStyle,
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
};

/** Label dengan teks di kiri dan badge di kanan */
export const splitLabelStyle: React.CSSProperties = {
  ...labelStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const twoColumnGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
};

/** Sorotan merah untuk field wajib yang masih kosong */
export const ERROR_FIELD_STYLE: React.CSSProperties = {
  border: '1.5px solid #EF4444',
  boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.25)',
  backgroundColor: '#FEF2F2',
};

export const RequiredMark: React.FC = () => <span style={{ color: '#ef4444' }}>*</span>;

/** Badge kecil "Otomatis" / "Lingkup DSC" / "Kode: BAL" di samping label */
export const LabelBadge: React.FC<{
  tone?: 'blue' | 'green';
  bold?: boolean;
  children: React.ReactNode;
}> = ({ tone = 'blue', bold = false, children }) => (
  <span
    style={{
      fontSize: '0.725rem',
      fontWeight: bold ? 700 : tone === 'blue' ? 500 : 600,
      color: tone === 'blue' ? '#0284c7' : '#059669',
      backgroundColor: tone === 'blue' ? '#e0f2fe' : '#d1fae5',
      padding: '1px 6px',
      borderRadius: '4px',
    }}
  >
    {children}
  </span>
);
