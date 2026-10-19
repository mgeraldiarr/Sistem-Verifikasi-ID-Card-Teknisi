import React from 'react';

interface StatCardProps {
  value: number;
  label: string;
  icon?: React.ReactNode;
}

/** Satu sel angka ringkasan (jumlah akun, cabang, dll.) di dalam `StatRow`. */
export const StatCard: React.FC<StatCardProps> = ({ value, label, icon }) => (
  <div className="stat">
    <div className="stat-value">{value}</div>
    <div className="stat-label">
      {icon}
      {label}
    </div>
  </div>
);

/** Baris sel angka yang menyatu dalam satu panel. */
export const StatRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="stat-row">{children}</div>
);
