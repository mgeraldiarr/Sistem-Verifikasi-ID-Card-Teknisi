// src/components/ui/StatCard.tsx
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  iconBackground?: string;
  iconColor?: string;
}

/** Kartu angka ringkasan (jumlah akun, cabang, dll.) di halaman administrasi. */
export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  iconBackground = 'rgba(218,41,28,0.1)',
  iconColor = 'var(--accent-red)',
}) => (
  <div
    className="modena-card"
    style={{ padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
  >
    <span
      style={{
        width: '34px',
        height: '34px',
        borderRadius: '9px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: iconBackground,
        color: iconColor,
      }}
    >
      {icon}
    </span>
    <div>
      <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  </div>
);

export const statGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '0.85rem',
  marginBottom: '1.25rem',
};
