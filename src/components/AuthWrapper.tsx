// src/components/AuthWrapper.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, Lock, KeyRound } from 'lucide-react';
import { getRoleHomeRoute, useAuthProfile } from '@/hooks/useAuthProfile';
import { UserRole } from '@/types';

interface AuthWrapperProps {
  children: React.ReactNode;
  /**
   * Daftar peran yang diizinkan mengakses halaman ini.
   * Kosongkan untuk mengizinkan seluruh peran yang sudah login & aktif.
   */
  allowedRoles?: UserRole[];
  /** Tampilan kustom saat status autentikasi sedang dimuat (misal: Skeleton UI) */
  fallback?: React.ReactNode;
}

/** Layar netral bertema MODENA untuk status loading / blokir akses */
function GateScreen({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode;
  title?: string;
  message?: string;
}) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        padding: '32px var(--gutter)',
        textAlign: 'center',
      }}
    >
      {icon}
      {title && <h1 style={{ fontSize: '17px', fontWeight: 600 }}>{title}</h1>}
      {message && (
        <p className="text-2" style={{ maxWidth: '380px', lineHeight: 1.6 }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default function AuthWrapper({ children, allowedRoles, fallback }: AuthWrapperProps) {
  const router = useRouter();
  const {
    loading,
    session,
    profile,
    profileError,
    mustChangePassword,
    signOut,
  } = useAuthProfile();

  const role = profile?.role ?? null;
  const isDeactivated = Boolean(profile && !profile.is_active);
  const isForbidden = Boolean(
    role && allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)
  );

  useEffect(() => {
    if (loading) return;

    // 1. Tidak punya sesi -> paksa login
    if (!session) {
      router.replace('/admin/login');
      return;
    }

    // 2. Akun dinonaktifkan -> putuskan sesi dan beri tahu
    if (isDeactivated) {
      signOut().then(() => router.replace('/admin/login'));
      return;
    }

    // 3. Wajib ganti kata sandi -> arahkan ke halaman rotasi sandi awal
    if (mustChangePassword) {
      router.replace('/admin/reset-password');
      return;
    }

    // 4. Peran tidak berhak atas halaman ini (403) -> alihkan ke beranda perannya
    if (isForbidden) {
      router.replace(getRoleHomeRoute(role));
    }
  }, [
    loading,
    session,
    isDeactivated,
    profileError,
    mustChangePassword,
    isForbidden,
    role,
    router,
    signOut,
  ]);

  if (loading) {
    if (fallback) return <>{fallback}</>;

    return (
      <GateScreen
        icon={
          <Loader2 size={28} color="var(--ink-3)" className="spin" aria-label="Memuat" />
        }
      />
    );
  }

  if (!session) {
    return (
      <GateScreen
        icon={<Lock size={28} color="var(--ink-3)" />}
        title="Mengalihkan ke halaman masuk"
        message="Sesi Anda tidak ditemukan atau telah berakhir."
      />
    );
  }

  if (isDeactivated) {
    return (
      <GateScreen
        icon={<ShieldAlert size={28} color="var(--red)" />}
        title="Akun dinonaktifkan"
        message="Akses Anda telah ditutup oleh Super Admin. Hubungi administrator untuk informasi lebih lanjut."
      />
    );
  }

  if (profileError && !profile) {
    return (
      <GateScreen
        icon={<ShieldAlert size={28} color="var(--red)" />}
        title="Gagal memuat profil akun"
        message={profileError}
      />
    );
  }

  if (mustChangePassword) {
    return (
      <GateScreen
        icon={<KeyRound size={28} color="var(--warn)" />}
        title="Perlu ganti kata sandi"
        message="Anda harus mengganti kata sandi awal sebelum dapat menggunakan portal."
      />
    );
  }

  if (isForbidden) {
    return (
      <GateScreen
        icon={<ShieldAlert size={28} color="var(--red)" />}
        title="Akses ditolak (403)"
        message="Akun Anda tidak memiliki izin untuk membuka halaman ini."
      />
    );
  }

  return <>{children}</>;
}
