// src/app/admin/reset-password/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getRoleHomeRoute, useAuthProfile } from '@/hooks/useAuthProfile';
import { AlertCircle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';

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
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card-body">
          <img src="/modena-logo-official.png" alt="MODENA" className="auth-logo" />
          <h1 className="auth-title">Buat kata sandi baru</h1>
          <p className="auth-sub">Minimal 8 karakter. Gunakan kata sandi yang hanya Anda ketahui.</p>

          <div style={{ marginTop: '24px' }}>
            {done ? (
              <div role="status" className="alert alert-ok">
                <CheckCircle2 size={16} />
                <span>
                  Kata sandi berhasil diperbarui.{' '}
                  {wasForced
                    ? 'Anda sedang diarahkan ke portal.'
                    : 'Anda sedang diarahkan ke halaman masuk.'}
                </span>
              </div>
            ) : !ready ? (
              <div style={{ textAlign: 'center' }}>
                <Loader2 size={24} color="var(--ink-3)" className="spin" />
                <p className="hint" style={{ marginTop: '12px' }}>
                  Memeriksa tautan pemulihan. Bila halaman tidak berubah, tautan mungkin sudah
                  kedaluwarsa. Minta tautan baru dari halaman masuk.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                {mustChangePassword && (
                  <div className="alert alert-warn">
                    <ShieldAlert size={16} />
                    <span>
                      Anda masih memakai kata sandi awal. Ganti dulu sebelum membuka portal.
                    </span>
                  </div>
                )}

                {error && (
                  <div role="alert" className="alert alert-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="field">
                  <label htmlFor="new-password" className="label">
                    Kata sandi baru
                  </label>
                  <input
                    id="new-password"
                    name="new_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="input"
                    style={{ minHeight: '44px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label htmlFor="confirm-password" className="label">
                    Ulangi kata sandi baru
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="input"
                    style={{ minHeight: '44px' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block"
                  style={{ minHeight: '46px' }}
                >
                  {loading && <Loader2 size={18} className="spin" />}
                  Simpan kata sandi
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="auth-strip">MODENA Authorized Service</div>
      </div>
    </main>
  );
}
