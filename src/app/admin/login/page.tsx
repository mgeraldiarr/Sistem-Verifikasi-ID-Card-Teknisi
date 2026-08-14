// src/app/admin/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Otentikasi menggunakan Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Jika sukses, arahkan ke dashboard
      router.push('/admin/dashboard');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-charcoal)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>

      <div className="modena-card" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-primary)' }}>

        {/* Header Form */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/modena-logo-official.png"
            alt="MODENA"
            style={{
              height: '1.8rem',        /* Mengatur tinggi logo agar proporsional */
              width: 'auto',
              objectFit: 'contain',
              display: 'inline-block',
              marginBottom: '0.25rem'
            }}
          />

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Lock size={16} /> Admin Portal
          </p>
        </div>

        {/* Pesan Error */}
        {error && (
          <div style={{ backgroundColor: 'var(--status-inactive-glow)', color: 'var(--status-inactive)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center', fontWeight: 600 }}>
            Login Gagal: {error}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', fontSize: '1rem' }}
              placeholder="admin@perusahaan.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontFamily: 'inherit', fontSize: '1rem' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="modena-btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            {loading ? <Loader2 size={18} className="animate-spin-custom" /> : 'MASUK'}
          </button>
        </form>

      </div>
    </div>
  );
}