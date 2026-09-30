// src/app/admin/login/components/ForgotPasswordForm.tsx
'use client';

import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="field">
          <label htmlFor="reset-email" className="label">
            Email terdaftar
          </label>
          <input
            id="reset-email"
            name="reset_email"
            type="email"
            autoComplete="email"
            required
            className="input"
            style={{ minHeight: '44px' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@gmail.com"
          />
          <p className="hint">
            Tautan hanya dapat dikirim ke email. Teknisi tanpa email terdaftar dapat menghubungi
            Admin Cabang.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block"
          style={{ minHeight: '46px' }}
        >
          {loading && <Loader2 size={18} className="spin" />}
          Kirim tautan
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="btn btn-ghost btn-block"
        style={{ marginTop: '12px' }}
      >
        <ArrowLeft size={16} />
        Kembali ke halaman masuk
      </button>
    </>
  );
};
