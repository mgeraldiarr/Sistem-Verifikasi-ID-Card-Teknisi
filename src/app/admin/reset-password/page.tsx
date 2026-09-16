// src/app/admin/reset-password/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getRoleHomeRoute, useAuthProfile } from '@/hooks/useAuthProfile';
import { KeyRound, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: '1rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '0.5rem',
};

/**
 * Halaman tujuan tautan reset kata sandi dari Supabase Auth.
 * Supabase memulihkan sesi sementara (event PASSWORD_RECOVERY) saat halaman dibuka.
 */
export default function ResetPasswordPage() {
  const router = useRouter();

  // Mode paksa: pengguna login dengan kata sandi awal yang belum dirotasi
  const { profile, mustChangePassword, refresh } = useAuthProfile();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  // Dibekukan saat submit: `mustChangePassword` menjadi false setelah refresh()
  const [wasForced, setWasForced] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setLoading(false);
      setError(updateError.message);
      return;
    }

    if (mustChangePassword) {
      setWasForced(true);

      // Rotasi wajib selesai: bersihkan penanda lalu lanjutkan ke beranda peran
      const { error: rpcError } = await supabase.rpc('clear_must_change_password');
      setLoading(false);

      if (rpcError) {
        setError(
          `Kata sandi berhasil diganti, tetapi status akun gagal diperbarui: ${rpcError.message}`
        );
        return;
      }

      setDone(true);
      await refresh();
      router.replace(getRoleHomeRoute(profile?.role ?? null));
      return;
    }

    setLoading(false);
    setDone(true);
    await supabase.auth.signOut();
    setTimeout(() => router.replace('/admin/login'), 2500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-charcoal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="modena-card"
        style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-primary)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img
            src="/modena-logo-official.png"
            alt="MODENA"
            style={{ height: '1.8rem', width: 'auto', objectFit: 'contain' }}
          />
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <KeyRound size={16} /> Atur Kata Sandi Baru
          </p>
        </div>

        {done ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'center',
            }}
          >
            <CheckCircle2 size={40} color="var(--status-active)" />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Kata sandi berhasil diperbarui.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {wasForced
                ? 'Anda akan diarahkan ke portal Anda...'
                : 'Anda akan diarahkan ke halaman masuk...'}
            </p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <Loader2 size={32} color="var(--bg-dark)" className="animate-spin-custom" />
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginTop: '0.85rem',
                lineHeight: 1.6,
              }}
            >
              Memverifikasi tautan pemulihan. Bila halaman ini tidak berubah, tautan
              kemungkinan sudah kedaluwarsa — silakan minta tautan baru dari halaman masuk.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {mustChangePassword && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.6rem',
                  alignItems: 'flex-start',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'var(--status-inactive-glow)',
                  border: '1px dashed rgba(218,41,28,0.3)',
                }}
              >
                <ShieldAlert
                  size={16}
                  color="var(--accent-red)"
                  style={{ flexShrink: 0, marginTop: '2px' }}
                />
                <p
                  style={{
                    fontSize: '0.775rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Anda masih memakai <strong>kata sandi awal</strong>. Demi keamanan akun,
                  ganti kata sandi terlebih dahulu sebelum membuka portal.
                </p>
              </div>
            )}

            {error && (
              <div
                style={{
                  backgroundColor: 'var(--status-inactive-glow)',
                  color: 'var(--status-inactive)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.825rem',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="new-password" style={labelStyle}>
                Kata Sandi Baru
              </label>
              <input
                id="new-password"
                name="new_password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" style={labelStyle}>
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                id="confirm-password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                placeholder="Ulangi kata sandi baru"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="modena-btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin-custom" />
              ) : (
                'SIMPAN KATA SANDI'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
