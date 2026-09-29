// src/app/admin/login/components/ForgotPasswordForm.tsx
'use client';

import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { inputStyle, labelStyle, linkButtonStyle, submitButtonStyle } from './login-styles';

interface ForgotPasswordFormProps {
  initialEmail: string;
  onError: (message: string | null) => void;
  onInfo: (message: string | null) => void;
  onBack: () => void;
}

/** Lupa Kata Sandi resmi via reset password Supabase Auth (tautan dikirim ke email). */
export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  initialEmail,
  onError,
  onInfo,
  onBack,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError(null);
    onInfo(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) {
      onError(error.message);
    } else {
      // Pesan sama untuk email terdaftar maupun tidak, agar email tidak bisa ditebak
      onInfo(
        'Jika email tersebut terdaftar, tautan pengaturan ulang kata sandi telah dikirim. Silakan periksa kotak masuk Anda.'
      );
    }
    setLoading(false);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Tautan pengaturan ulang hanya dapat dikirim ke email. Teknisi tanpa email terdaftar
            harap menghubungi Admin Cabang.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="modena-btn-primary"
          style={submitButtonStyle}
        >
          {loading ? <Loader2 size={18} className="animate-spin-custom" /> : 'KIRIM TAUTAN RESET'}
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        style={{
          ...linkButtonStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
        }}
      >
        <ArrowLeft size={14} /> Kembali ke Halaman Masuk
      </button>
    </>
  );
};
