// src/app/admin/(portal)/portal-context.tsx
'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { UserProfile } from '@/types';

export interface PortalContextValue {
  /** Profil peran pengguna yang sedang login (diambil sekali di layout) */
  profile: UserProfile | null;
  /** Cabang yang dipaksakan untuk Admin Cabang (null = akses nasional) */
  scopedBranch: string | null;
  /** Cabang kerja aktif ('' = seluruh cabang) */
  selectedBranch: string;
  /** Mengganti cabang kerja; diabaikan bila akses terkunci pada satu cabang */
  selectBranch: (branch: string) => void;
  /** Memuat ulang profil peran (dipakai setelah mengubah akun sendiri) */
  refreshProfile: () => Promise<void>;
}

const PortalContext = createContext<PortalContextValue | null>(null);

export const PortalProvider = PortalContext.Provider;

/**
 * Mengambil konteks portal admin (profil peran + cabang kerja aktif).
 * Hanya boleh dipakai di dalam layout `(portal)`.
 */
export function usePortal(): PortalContextValue {
  const value = useContext(PortalContext);
  if (!value) {
    throw new Error('usePortal hanya dapat dipakai di dalam layout portal admin.');
  }
  return value;
}

/**
 * Pembatas halaman khusus Super Admin.
 *
 * Layout portal sudah memastikan pengguna adalah admin yang aktif, sehingga
 * komponen ini cukup membaca peran dari konteks tanpa query tambahan.
 */
export function SuperAdminOnly({ children }: { children: React.ReactNode }) {
  const { profile } = usePortal();
  const router = useRouter();

  const isAllowed = profile?.role === 'super_admin';

  useEffect(() => {
    if (profile && !isAllowed) router.replace('/admin/dashboard');
  }, [profile, isAllowed, router]);

  if (!profile) return null;

  if (!isAllowed) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.85rem',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <ShieldAlert size={38} color="var(--accent-red)" />
        <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
          403 — Khusus Super Admin
        </h2>
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            margin: 0,
            maxWidth: '360px',
            lineHeight: 1.6,
          }}
        >
          Halaman administrasi sistem hanya dapat dibuka oleh Super Admin. Anda sedang
          dialihkan kembali ke dashboard.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
