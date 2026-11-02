// src/components/ui/Skeleton.tsx
'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  circle?: boolean;
}

/**
 * Komponen atom Skeleton dengan animasi kilau (shimmer) halus.
 * Dipakai sebagai placeholder konten yang sedang dimuat agar layout tidak bergeser (anti-CLS).
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  radius,
  circle = false,
  className = '',
  style,
  ...props
}) => {
  const inlineStyle: React.CSSProperties = {
    width: width ?? '100%',
    height: height ?? '1rem',
    borderRadius: circle ? '50%' : (radius ?? 'var(--r-sm)'),
    ...style,
  };

  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={inlineStyle}
      aria-hidden="true"
      {...props}
    />
  );
};

