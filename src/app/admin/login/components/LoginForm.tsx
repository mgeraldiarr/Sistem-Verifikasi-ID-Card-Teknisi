// src/app/admin/login/components/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, HelpCircle, Loader2 } from 'lucide-react';
import { getRoleHomeRoute } from '@/hooks/useAuthProfile';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';
import { inputStyle, labelStyle, linkButtonStyle, submitButtonStyle } from './login-styles';

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
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <div>
          <label htmlFor="login-identifier" style={labelStyle}>
            Login
          </label>
          <input
            id="login-identifier"
            name="login_identifier"
            type="text"
            autoComplete="username"
            autoCapitalize="characters"
            spellCheck={false}
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            style={inputStyle}
            placeholder="Email atau ID Pengguna"
          />
        </div>

        <div>
          <label htmlFor="login-password" style={labelStyle}>
            Kata Sandi
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="login-password"
              name="login_password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: '2.5rem' }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              style={{
                position: 'absolute',
                right: '0.75rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="modena-btn-primary"
          style={{ ...submitButtonStyle, marginTop: '0.5rem' }}
        >
          {loading ? <Loader2 size={18} className="animate-spin-custom" /> : 'Masuk'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => onForgotPassword(identifier.includes('@') ? identifier.trim() : '')}
        style={{ ...linkButtonStyle, textDecoration: 'underline' }}
      >
        Lupa Kata Sandi?
      </button>

      {/* Panduan masuk untuk Teknisi & Admin Cabang */}
      <div
        style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <button
          type="button"
          onClick={onOpenGuide}
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--text-primary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <HelpCircle size={15} color="var(--accent-red)" />
          <span>Panduan Masuk</span>
        </button>
      </div>
    </>
  );
};
