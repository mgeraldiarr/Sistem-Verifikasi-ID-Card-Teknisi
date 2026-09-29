// src/components/ui/admin-styles.ts
import type React from 'react';

/** Gaya bersama tabel & form halaman administrasi (Kelola Akun, Kelola Cabang). */

export const thStyle: React.CSSProperties = {
  padding: '0.9rem 1rem',
  fontWeight: 700,
  color: 'var(--text-secondary)',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

export const tdStyle: React.CSSProperties = {
  padding: '0.85rem 1rem',
  fontSize: '0.825rem',
  color: 'var(--text-primary)',
  verticalAlign: 'middle',
};

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.7rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  fontSize: '0.875rem',
  outline: 'none',
  fontFamily: 'inherit',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.775rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '0.35rem',
};

export const hintStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  color: 'var(--text-secondary)',
  marginTop: '0.4rem',
  lineHeight: 1.5,
};

export const formErrorStyle: React.CSSProperties = {
  backgroundColor: 'var(--status-inactive-glow)',
  color: 'var(--status-inactive)',
  padding: '0.7rem',
  borderRadius: '8px',
  marginBottom: '1rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  textAlign: 'center',
};

export const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  zIndex: 100,
};
