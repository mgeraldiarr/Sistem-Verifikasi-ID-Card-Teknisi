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
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        padding: '2rem 1.25rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      {icon}
      {title && (
        <h2
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {title}
        </h2>
      )}
      {message && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            margin: 0,
            maxWidth: '380px',
            lineHeight: 1.6,
          }}
        >
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
          <Loader2 size={48} color="var(--bg-dark)" className="animate-spin-custom" />
        }
      />
    );
  }

  if (!session) {
    return (
      <GateScreen
        icon={<Lock size={40} color="var(--text-muted)" />}
        title="Mengalihkan ke Halaman Login"
        message="Sesi Anda tidak ditemukan atau telah berakhir."
      />
    );
  }

  if (isDeactivated) {
    return (
      <GateScreen
        icon={<ShieldAlert size={40} color="var(--accent-red)" />}
        title="Akun Dinonaktifkan"
        message="Akun Anda telah dinonaktifkan oleh administrator. Silakan hubungi Super Admin MODENA untuk pengaktifan kembali."
      />
    );
  }

  if (profileError) {
    return (
      <GateScreen
        icon={<ShieldAlert size={40} color="var(--accent-red)" />}
        title="Akses Belum Terdaftar"
        message={profileError}
      />
    );
  }

  if (mustChangePassword) {
    return (
      <GateScreen
        icon={<KeyRound size={40} color="var(--accent-red)" />}
        title="Ganti Kata Sandi Awal"
        message="Demi keamanan, kata sandi awal Anda wajib diganti sebelum portal dapat digunakan. Anda sedang dialihkan ke halaman penggantian kata sandi."
      />
    );
  }

  if (isForbidden) {
    return (
      <GateScreen
        icon={<ShieldAlert size={40} color="var(--accent-red)" />}
        title="403 — Akses Ditolak"
        message="Peran akun Anda tidak memiliki izin untuk membuka halaman ini. Anda sedang dialihkan ke halaman yang sesuai."
      />
    );
  }

  return <>{children}</>;
}
