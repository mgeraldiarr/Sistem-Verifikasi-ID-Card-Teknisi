// src/app/admin/login/components/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, HelpCircle, Loader2 } from 'lucide-react';
import { getRoleHomeRoute } from '@/hooks/useAuthProfile';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';

interface LoginFormProps {
  onError: (message: string | null) => void;
  /** Pindah ke form lupa kata sandi; email diisi otomatis bila pengguna mengetik email */
  onForgotPassword: (prefillEmail: string) => void;
  onOpenGuide: () => void;
}

/**
 * Login berbasis ID Pengguna: DSC-... (Teknisi), ADM-... (Admin Cabang),
 * atau email (khusus Super Admin). Pemetaan ID -> akun dilakukan di server.
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onError, onForgotPassword, onOpenGuide }) => {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const payload = await res.json();

      if (!res.ok) {
        onError(payload.error || 'Gagal masuk. Silakan coba lagi.');
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
      });
      if (sessionError) {
        onError(sessionError.message);
        return;
      }

      // Kata sandi awal wajib dirotasi sebelum portal dapat dipakai; selain itu
      // arahkan sesuai peran (admin -> dashboard, teknisi -> kartu digital)
      router.replace(
        payload.must_change_password
          ? '/admin/reset-password'
          : getRoleHomeRoute(payload.role as UserRole)
      );
    } catch {
      onError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="field">
          <label htmlFor="login-identifier" className="label">
            ID pengguna atau email
          </label>
          <input
            id="login-identifier"
            name="login_identifier"
            type="text"
            autoComplete="username"
            autoCapitalize="characters"
            spellCheck={false}
            required
            className="input"
            style={{ minHeight: '44px' }}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="DSC-BAL-001"
          />
        </div>

        <div className="field">
          <label htmlFor="login-password" className="label">
            Kata sandi
            <button
              type="button"
              className="btn-link label-aside"
              onClick={() => onForgotPassword(identifier.includes('@') ? identifier.trim() : '')}
            >
              Lupa kata sandi?
            </button>
          </label>
          <div className="input-wrap">
            <input
              id="login-password"
              name="login_password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="input"
              style={{ minHeight: '44px', paddingRight: '44px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="icon-btn input-trail"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block"
          style={{ minHeight: '46px', marginTop: '4px' }}
        >
          {loading && <Loader2 size={18} className="spin" />}
          {loading ? 'Memeriksa…' : 'Masuk'}
        </button>
      </form>

      <button
        type="button"
        onClick={onOpenGuide}
        className="btn btn-ghost btn-block"
        style={{ marginTop: '12px' }}
      >
        <HelpCircle size={16} />
        Belum tahu ID atau kata sandi Anda?
      </button>
    </>
  );
};
