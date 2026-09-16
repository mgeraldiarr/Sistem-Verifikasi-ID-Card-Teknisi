// src/hooks/useAuthProfile.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, UserRole } from '@/types';

/**
 * Rute beranda resmi untuk masing-masing peran.
 * Teknisi tidak pernah diarahkan ke dashboard admin.
 */
export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  super_admin: '/admin/dashboard',
  branch_admin: '/admin/dashboard',
  technician: '/technician/my-card',
};

export function getRoleHomeRoute(role: UserRole | null | undefined): string {
  if (!role) return '/admin/login';
  return ROLE_HOME_ROUTE[role] ?? '/admin/login';
}

/**
 * Label badge peran yang ditampilkan di header/sidebar dashboard.
 */
export function getRoleBadgeLabel(profile: UserProfile | null): string {
  if (!profile) return 'Peran Belum Ditetapkan';
  switch (profile.role) {
    case 'super_admin':
      return 'Super Admin - Nasional';
    case 'branch_admin':
      return `Admin Cabang - ${profile.branch || 'Belum Ditetapkan'}`;
    case 'technician':
      return 'Teknisi';
    default:
      return 'Peran Belum Ditetapkan';
  }
}

export interface UseAuthProfileResult {
  loading: boolean;
  session: Session | null;
  profile: UserProfile | null;
  /** Terisi bila sesi valid tetapi baris user_profiles tidak ada / tidak terbaca */
  profileError: string | null;
  /** Cabang yang wajib dipaksakan pada seluruh query (null = akses nasional) */
  scopedBranch: string | null;
  /** true = pengguna wajib merotasi kata sandi awal sebelum memakai portal */
  mustChangePassword: boolean;
  isSuperAdmin: boolean;
  isBranchAdmin: boolean;
  isTechnician: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Membaca sesi Supabase yang aktif lalu mengambil profil peran pengguna
 * dari tabel `user_profiles` (Super Admin / Admin Cabang / Teknisi).
 */
export function useAuthProfile(): UseAuthProfileResult {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Melacak user aktif terakhir agar profil tidak di-fetch ulang saat token diperpanjang
  const lastUserIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  const loadProfile = useCallback(async (activeSession: Session | null) => {
    setSession(activeSession);

    if (!activeSession?.user) {
      setProfile(null);
      setProfileError(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        'id, email, full_name, role, branch, technician_id, is_active, must_change_password'
      )
      .eq('id', activeSession.user.id)
      .maybeSingle();

    if (error) {
      setProfile(null);
      setProfileError(error.message);
    } else if (!data) {
      setProfile(null);
      setProfileError(
        'Akun ini belum memiliki profil peran resmi. Hubungi Super Admin untuk aktivasi akses.'
      );
    } else {
      setProfile(data as UserProfile);
      setProfileError(null);
    }

    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    const {
      data: { session: current },
    } = await supabase.auth.getSession();
    await loadProfile(current);
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    /**
     * Sumber sesi bisa datang dari getSession() maupun onAuthStateChange.
     * Handler ini menjamin profil hanya di-fetch saat identitas pengguna berubah,
     * bukan pada setiap perpanjangan token rutin.
     */
    const handleSession = (nextSession: Session | null) => {
      if (cancelled) return;

      const nextUserId = nextSession?.user?.id ?? null;

      if (initializedRef.current && lastUserIdRef.current === nextUserId) {
        setSession(nextSession);
        return;
      }

      initializedRef.current = true;
      lastUserIdRef.current = nextUserId;
      loadProfile(nextSession);
    };

    supabase.auth.getSession().then(({ data: { session: current } }) => {
      handleSession(current);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => handleSession(nextSession)
    );

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const role = profile?.role ?? null;

  return {
    loading,
    session,
    profile,
    profileError,
    scopedBranch: role === 'branch_admin' ? profile?.branch ?? null : null,
    mustChangePassword: Boolean(profile?.must_change_password),
    isSuperAdmin: role === 'super_admin',
    isBranchAdmin: role === 'branch_admin',
    isTechnician: role === 'technician',
    refresh,
    signOut,
  };
}
