// src/app/admin/login/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Loader2, Info, ArrowLeft, MailCheck } from 'lucide-react';
import { getRoleHomeRoute } from '@/hooks/useAuthProfile';
import { UserRole } from '@/types';

type FormMode = 'login' | 'forgot';

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

export default function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Bila sesi masih aktif, langsung arahkan ke beranda sesuai perannya
  useEffect(() => {
    let cancelled = false;

    const redirectIfSignedIn = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || cancelled) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, is_active, must_change_password')
        .eq('id', session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profile?.is_active) {
        router.replace(
          profile.must_change_password
            ? '/admin/reset-password'
            : getRoleHomeRoute(profile.role as UserRole)
        );
      }
    };

    redirectIfSignedIn();
    return () => {
      cancelled = true;
    };
  }, [router]);

  /**
   * Login Dual Identifier: menerima Email ATAU Nomor Karyawan (NIK).
   * Pemetaan NIK -> email akun dilakukan di server (/api/auth/login).
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const payload = await res.json();

      if (!res.ok) {
        setError(payload.error || 'Gagal masuk. Silakan coba lagi.');
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
      });

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      // Kata sandi awal wajib dirotasi sebelum portal dapat dipakai
      if (payload.must_change_password) {
        router.replace('/admin/reset-password');
        return;
      }

      // Arahkan sesuai peran: admin -> dashboard, teknisi -> kartu digital
      router.replace(getRoleHomeRoute(payload.role as UserRole));
    } catch {
      setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  /** Lupa Kata Sandi resmi via reset password Supabase Auth */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/admin/reset-password`
        : undefined;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      resetEmail.trim(),
      { redirectTo }
    );

    if (resetError) {
      setError(resetError.message);
    } else {
      setInfo(
        'Jika email tersebut terdaftar, tautan pengaturan ulang kata sandi telah dikirim. Silakan periksa kotak masuk Anda.'
      );
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-charcoal)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="modena-card"
        style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-primary)' }}
      >
        {/* Header Form */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/modena-logo-official.png"
            alt="MODENA"
            style={{
              height: '1.8rem',
              width: 'auto',
              objectFit: 'contain',
              display: 'inline-block',
              marginBottom: '0.25rem',
            }}
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
            <Lock size={16} />
            {mode === 'login' ? 'Technician & Admin Portal' : 'Pengaturan Ulang Kata Sandi'}
          </p>
        </div>

        {/* Pesan Error */}
        {error && (
          <div
            style={{
              backgroundColor: 'var(--status-inactive-glow)',
              color: 'var(--status-inactive)',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              textAlign: 'center',
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {/* Pesan Informasi */}
        {info && (
          <div
            style={{
              backgroundColor: 'var(--status-active-glow)',
              color: 'var(--status-active)',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.825rem',
              textAlign: 'center',
              fontWeight: 600,
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center',
            }}
          >
            <MailCheck size={16} style={{ flexShrink: 0 }} />
            <span>{info}</span>
          </div>
        )}

        {mode === 'login' ? (
          <>
            <form
              onSubmit={handleLogin}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label htmlFor="login-identifier" style={labelStyle}>
                  Email atau Nomor Karyawan (NIK)
                </label>
                <input
                  id="login-identifier"
                  name="login_identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={inputStyle}
                  placeholder="admin@modena.com atau 10123456"
                />
              </div>

              <div>
                <label htmlFor="login-password" style={labelStyle}>
                  Kata Sandi
                </label>
                <input
                  id="login-password"
                  name="login_password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="modena-btn-primary"
                style={{
                  width: '100%',
                  marginTop: '0.5rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {loading ? <Loader2 size={18} className="animate-spin-custom" /> : 'MASUK'}
              </button>
            </form>

            {/* Tautan Lupa Kata Sandi */}
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                setError(null);
                setInfo(null);
                setResetEmail(identifier.includes('@') ? identifier.trim() : '');
              }}
              style={{
                width: '100%',
                marginTop: '0.85rem',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Lupa Kata Sandi?
            </button>

            {/* Teks Petunjuk Login Teknisi */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.85rem 0.9rem',
                borderRadius: '10px',
                backgroundColor: '#F9FAFB',
                border: '1px dashed var(--border-color)',
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'flex-start',
              }}
            >
              <Info
                size={15}
                color="var(--accent-red)"
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <p
                style={{
                  fontSize: '0.775rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                <strong style={{ color: 'var(--text-primary)' }}>Petunjuk Teknisi:</strong>{' '}
                Masuk menggunakan NIK Anda. Password awal resmi:{' '}
                <code
                  style={{
                    backgroundColor: '#ECE8DA',
                    color: '#1C1C1A',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  Modena@{'{4 digit terakhir No HP}'}
                </code>
              </p>
            </div>
          </>
        ) : (
          <>
            <form
              onSubmit={handleForgotPassword}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >
              <div>
                <label htmlFor="reset-email" style={labelStyle}>
                  Email Terdaftar
                </label>
                <input
                  id="reset-email"
                  name="reset_email"
                  type="email"
                  autoComplete="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  style={inputStyle}
                  placeholder="nama@modena.com"
                />
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.5rem',
                    lineHeight: 1.5,
                  }}
                >
                  Tautan pengaturan ulang hanya dapat dikirim ke email. Teknisi tanpa email
                  terdaftar harap menghubungi Admin Cabang.
                </p>
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
                  'KIRIM TAUTAN RESET'
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setInfo(null);
              }}
              style={{
                width: '100%',
                marginTop: '0.85rem',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <ArrowLeft size={14} /> Kembali ke Halaman Masuk
            </button>
          </>
        )}
      </div>
    </div>
  );
}
