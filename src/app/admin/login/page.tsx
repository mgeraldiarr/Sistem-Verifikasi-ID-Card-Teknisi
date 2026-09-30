// src/app/admin/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, MailCheck } from 'lucide-react';
import { getRoleHomeRoute } from '@/hooks/useAuthProfile';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { LoginForm } from './components/LoginForm';
import { LoginGuideModal } from './components/LoginGuideModal';

type FormMode = 'login' | 'forgot';

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
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card-body">
          <img src="/modena-logo-official.png" alt="MODENA" className="auth-logo" />
          <h1 className="auth-title">
            {mode === 'login' ? 'Masuk ke portal teknisi' : 'Atur ulang kata sandi'}
          </h1>
          <p className="auth-sub">
            {mode === 'login'
              ? 'Gunakan ID teknisi, ID admin cabang, atau email Super Admin.'
              : 'Kami kirim tautan untuk membuat kata sandi baru ke email Anda.'}
          </p>

          {(error || info) && (
            <div style={{ marginTop: '20px' }}>
              {error && (
                <div role="alert" className="alert alert-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
              {info && (
                <div role="status" className="alert alert-ok">
                  <MailCheck size={16} />
                  <span>{info}</span>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '24px' }}>
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
        </div>
        <div className="auth-strip">MODENA Authorized Service</div>
      </div>

      <LoginGuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </main>
  );
}
