// src/app/admin/login/components/login-styles.ts
import type React from 'react';

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: '1rem',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '0.5rem',
};

export const submitButtonStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.5rem',
};

export const linkButtonStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '0.85rem',
  background: 'transparent',
  color: 'var(--text-secondary)',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
};
