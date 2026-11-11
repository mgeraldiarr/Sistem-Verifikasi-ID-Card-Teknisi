// src/app/technician/grooming/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AuthWrapper from '@/components/AuthWrapper';

function RedirectToMyCardGrooming() {
  const router = useRouter();

  useEffect(() => {
    // Alihkan langsung ke tab grooming pada halaman kartu digital
    router.replace('/technician/my-card?tab=grooming');
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '12px',
      }}
    >
      <Loader2 size={32} className="spin" color="var(--red)" />
      <span style={{ fontSize: '13px', color: 'var(--ink-2)' }}>
        Membuka formulir monitoring grooming...
      </span>
    </div>
  );
}

export default function TechnicianGroomingPage() {
  return (
    <AuthWrapper allowedRoles={['technician']}>
      <RedirectToMyCardGrooming />
    </AuthWrapper>
  );
}
