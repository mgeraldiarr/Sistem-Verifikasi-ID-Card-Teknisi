// src/app/admin/(portal)/components/sidebar/SidebarPrimitives.tsx
'use client';

import React from 'react';

/** Tombol cabang di daftar navigasi DSC */
export function BranchButton({
  label,
  isSelected,
  onClick,
  count,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button type="button" className="sb-branch" onClick={onClick} aria-pressed={isSelected}>
      <span className="sb-branch-label">{label}</span>
      {typeof count === 'number' && count > 0 && <span className="sb-branch-count">{count}</span>}
    </button>
  );
}
