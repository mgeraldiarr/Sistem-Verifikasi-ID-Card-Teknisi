// src/components/AuthWrapper.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mengecek apakah ada sesi login (token auth) yang aktif
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login'); // Tendang ke halaman login
      } else {
        setLoading(false); // Izinkan masuk
      }
    };

    checkUser();

    // Mendengarkan jika user tiba-tiba logout
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/admin/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Tampilkan layar loading saat proses pengecekan sesi
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        <Loader2 size={48} color="var(--bg-dark)" className="animate-spin-custom" />
      </div>
    );
  }

  // Jika aman, render konten dashboard
  return <>{children}</>;
}