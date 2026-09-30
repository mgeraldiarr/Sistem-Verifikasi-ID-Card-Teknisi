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

export default function AuthWrapper({ children, allowedRoles }: AuthWrapperProps) {
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

    // 1. Belum login sama sekali -> kembalikan ke portal login
    if (!session) {
      router.replace('/admin/login');
      return;
    }

    // 2. Akun dinonaktifkan atau profil peran belum terdaftar -> logout paksa
    if (isDeactivated || profileError) {
      signOut().finally(() => router.replace('/admin/login'));
      return;
    }

    // 3. Kata sandi awal belum dirotasi -> tahan akses sampai diganti
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
        message="Akun Anda telah dinonaktifkan oleh administrator. Silakan hubungi Super Admin MODENA untuk pengaktifan kembali."
      />
    );
  }

  if (profileError) {
    return (
      <GateScreen
        icon={<ShieldAlert size={28} color="var(--red)" />}
        title="Akses belum terdaftar"
        message={profileError}
      />
    );
  }

  if (mustChangePassword) {
    return (
      <GateScreen
        icon={<KeyRound size={28} color="var(--red)" />}
        title="Ganti kata sandi awal"
        message="Demi keamanan, kata sandi awal Anda wajib diganti sebelum portal dapat digunakan. Anda sedang dialihkan ke halaman penggantian kata sandi."
      />
    );
  }

  if (isForbidden) {
    return (
      <GateScreen
        icon={<ShieldAlert size={28} color="var(--red)" />}
        title="Akses ditolak"
        message="Peran akun Anda tidak memiliki izin untuk membuka halaman ini. Anda sedang dialihkan ke halaman yang sesuai."
      />
    );
  }

  return <>{children}</>;
}
