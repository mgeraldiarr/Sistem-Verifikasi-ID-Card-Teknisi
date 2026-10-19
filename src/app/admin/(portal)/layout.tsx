// src/app/admin/(portal)/layout.tsx
'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Menu } from 'lucide-react';
import AuthWrapper from '@/components/AuthWrapper';
import { useAuthProfile } from '@/hooks/useAuthProfile';
import { useTechnicianBranchCounts } from '@/hooks/useTechnicianBranchCounts';
import { supabase } from '@/lib/supabase';
import { PortalSidebar } from './components/sidebar/PortalSidebar';
import { LogoutModal } from './components/LogoutModal';
import { PortalProvider } from './portal-context';

/** Parameter filter yang diingat per cabang saat pengguna berpindah cabang */
const FILTER_KEYS = ['q', 'month', 'year', 'level', 'status'] as const;
type FilterKey = (typeof FILTER_KEYS)[number];
type BranchFilterState = Partial<Record<FilterKey, string>>;

function PortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { profile, scopedBranch, refresh: refreshProfile } = useAuthProfile();
  const { counts, total } = useTechnicianBranchCounts();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // Sidebar tampil sebagai drawer di layar < 1024px
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Tutup drawer setiap kali halaman atau cabang kerja berganti
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  // Memori filter per cabang: disimpan di ref karena hanya dibaca saat berpindah cabang
  const branchFilterMemory = useRef<Record<string, BranchFilterState>>({});

  const urlBranch = searchParams.get('branch') || '';
  // Admin Cabang selalu terkunci pada cabangnya, apa pun isi parameter URL
  const selectedBranch = scopedBranch ?? urlBranch;

  /**
   * Berpindah cabang kerja.
   *
   * Filter aktif cabang sekarang disimpan lebih dulu, lalu filter yang pernah
   * dipakai di cabang tujuan dipulihkan — perilaku memori filter per cabang.
   * Navigasi selalu menuju dashboard karena cabang adalah konteks data teknisi.
   */
  const selectBranch = useCallback(
    (nextBranch: string) => {
      if (scopedBranch) return; // isolasi cabang: tidak boleh berpindah

      const currentKey = urlBranch || 'all';
      const nextKey = nextBranch || 'all';

      // Simpan filter cabang yang sedang aktif
      const snapshot: BranchFilterState = {};
      FILTER_KEYS.forEach((key) => {
        const value = searchParams.get(key);
        if (value) snapshot[key] = value;
      });
      branchFilterMemory.current[currentKey] = snapshot;

      // Pulihkan filter cabang tujuan
      const saved = branchFilterMemory.current[nextKey] ?? {};
      const params = new URLSearchParams();
      if (nextBranch) params.set('branch', nextBranch);
      FILTER_KEYS.forEach((key) => {
        const value = saved[key];
        if (value) params.set(key, value);
      });

      const qs = params.toString();
      const target = qs ? `/admin/dashboard?${qs}` : '/admin/dashboard';

      // Tetap di dashboard -> replace (hindari menumpuk riwayat filter).
      // Datang dari halaman lain -> push agar tombol kembali tetap wajar.
      if (pathname === '/admin/dashboard') {
        router.replace(target, { scroll: false });
      } else {
        router.push(target);
      }
    },
    [pathname, router, scopedBranch, searchParams, urlBranch]
  );

  const confirmLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }, [router]);

  return (
    <PortalProvider
      value={{ profile, scopedBranch, selectedBranch, selectBranch, refreshProfile }}
    >
      <div className="portal-shell">
        <header className="topbar no-print">
          <img src="/modena-logo-white.png" alt="MODENA" />
          <span className="topbar-context">{selectedBranch || 'Semua cabang DSC'}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu"
            aria-expanded={drawerOpen}
          >
            <Menu size={22} />
          </button>
        </header>

        {drawerOpen && (
          <div className="sidebar-scrim no-print" onClick={() => setDrawerOpen(false)} />
        )}

        {/* Sidebar persisten — tidak ikut remount saat berpindah halaman */}
        <PortalSidebar
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          selectedBranch={selectedBranch}
          onSelectBranch={selectBranch}
          totalTechnicians={total}
          techniciansBranchCounts={counts}
          onLogout={() => setShowLogoutModal(true)}
          profile={profile}
          lockedBranch={scopedBranch}
        />

        <main className="portal-main">
          <div className="portal-content">{children}</div>
        </main>

        <div className="no-print">
          <LogoutModal
            show={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={confirmLogout}
          />
        </div>
      </div>
    </PortalProvider>
  );
}

function ShellFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Loader2 size={28} color="var(--ink-3)" className="spin" />
    </div>
  );
}

/**
 * Layout portal admin.
 *
 * Guard otentikasi dipasang di sini, bukan di tiap halaman, sehingga setiap
 * rute baru di bawah grup ini otomatis terlindungi tanpa perlu diingat-ingat.
 * Akun teknisi ditolak dan dialihkan ke /technician/my-card.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper allowedRoles={['super_admin', 'branch_admin']}>
      <Suspense fallback={<ShellFallback />}>
        <PortalShell>{children}</PortalShell>
      </Suspense>
    </AuthWrapper>
  );
}
