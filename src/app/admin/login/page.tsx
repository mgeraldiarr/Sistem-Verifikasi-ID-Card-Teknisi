// src/app/admin/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, MailCheck } from 'lucide-react';
import { getRoleHomeRoute } from '@/hooks/useAuthProfile';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { LoginForm } from './components/LoginForm';
import { LoginGuideModal } from './components/LoginGuideModal';

type FormMode = 'login' | 'forgot';

const messageStyle: React.CSSProperties = {
  padding: '0.75rem',
  borderRadius: '8px',
  marginBottom: '1.5rem',
  textAlign: 'center',
  fontWeight: 600,
  lineHeight: 1.5,
};

/** Bila sesi masih aktif, langsung arahkan ke beranda sesuai perannya */
function useRedirectIfSignedIn() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const redirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || cancelled) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, is_active, must_change_password')
        .eq('id', session.user.id)
        .maybeSingle();

      if (cancelled || !profile?.is_active) return;
      router.replace(
        profile.must_change_password
          ? '/admin/reset-password'
          : getRoleHomeRoute(profile.role as UserRole)
      );
    };

    redirect();
    return () => {
      cancelled = true;
    };
  }, [router]);
}

export default function AdminLogin() {
  useRedirectIfSignedIn();

  const [mode, setMode] = useState<FormMode>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const switchMode = (next: FormMode) => {
    setMode(next);
    setError(null);
    setInfo(null);
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
        padding: '1.5rem 1rem',
      }}
    >
      <div
        className="modena-card"
        style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-primary)' }}
      >
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

        {error && (
          <div
            role="alert"
            style={{
              ...messageStyle,
              backgroundColor: 'var(--status-inactive-glow)',
              color: 'var(--status-inactive)',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {info && (
          <div
            role="status"
            style={{
              ...messageStyle,
              backgroundColor: 'var(--status-active-glow)',
              color: 'var(--status-active)',
              fontSize: '0.825rem',
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
          <LoginForm
            onError={setError}
            onForgotPassword={(email) => {
              setResetEmail(email);
              switchMode('forgot');
            }}
            onOpenGuide={() => setShowGuide(true)}
          />
        ) : (
          <ForgotPasswordForm
            initialEmail={resetEmail}
            onError={setError}
            onInfo={setInfo}
            onBack={() => switchMode('login')}
          />
        )}
      </div>

      <LoginGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
