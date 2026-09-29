// src/app/admin/(portal)/components/sidebar/PortalSidebar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Layers, LogOut } from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';
import { UserProfile } from '@/types';
import { C } from './sidebar-theme';
import { SectionLabel } from './SidebarPrimitives';
import { ServiceScopeList } from './ServiceScopeList';
import { SidebarAdminMenu } from './SidebarAdminMenu';
import { SidebarUserCard } from './SidebarUserCard';

interface PortalSidebarProps {
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  totalTechnicians: number;
  techniciansBranchCounts?: Record<string, number>;
  onLogout: () => void;
  /** Profil peran pengguna yang sedang login */
  profile?: UserProfile | null;
  /**
   * Bila diisi (Admin Cabang), navigasi cabang dikunci ke cabang tersebut
   * sehingga data cabang lain tidak dapat dibuka.
   */
  lockedBranch?: string | null;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  selectedBranch,
  onSelectBranch,
  totalTechnicians,
  techniciansBranchCounts = {},
  onLogout,
  profile = null,
  lockedBranch = null,
}) => {
  const pathname = usePathname();
  const isLocked = Boolean(lockedBranch);
  const isSuperAdmin = profile?.role === 'super_admin';

  // Daftar cabang DSC terbuka bila Admin Cabang (cabangnya langsung terlihat) atau
  // ada cabang aktif di URL; Super Admin tanpa filter melihatnya tertutup.
  const [isDscExpanded, setIsDscExpanded] = useState<boolean>(
    () => Boolean(lockedBranch || selectedBranch)
  );

  // Profil Admin Cabang bisa selesai dimuat setelah render awal
  useEffect(() => {
    if (lockedBranch) setIsDscExpanded(true);
  }, [lockedBranch]);

  // Master cabang dari tabel `branches` (fallback ke konstanta bila belum dimigrasi).
  // Admin Cabang hanya melihat cabangnya sendiri.
  const { branchNames } = useBranches();
  const visibleBranches = isLocked
    ? branchNames.filter((branch) => branch === lockedBranch)
    : branchNames;

  return (
    <aside
      style={{
        width: '272px',
        minWidth: '272px',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: C.bg,
        zIndex: 30,
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* HEADER — LOGO MODENA */}
      <div
        style={{
          padding: '1.125rem 1.25rem',
          borderBottom: `1px solid ${C.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexShrink: 0,
        }}
      >
        <img
          src="/modena-logo-white.png"
          alt="MODENA"
          style={{ height: '1.35rem', width: 'auto', objectFit: 'contain' }}
        />
        <div style={{ height: '14px', width: '1px', backgroundColor: C.creamFaint }} />
        <span
          style={{
            color: C.creamMuted,
            fontWeight: 600,
            fontSize: '0.625rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Technician Portal
        </span>
      </div>

      {profile && <SidebarUserCard profile={profile} />}

      {isSuperAdmin && <SidebarAdminMenu pathname={pathname} />}

      {/* AREA SCROLLABLE — Lingkup Layanan + Cabang DSC */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.875rem 0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ paddingLeft: '2px' }}>
          <SectionLabel text="Lingkup Layanan" icon={<Layers size={11} color={C.accent} />} />
          <div style={{ fontSize: '0.75rem', color: C.creamSoft, marginTop: '0.3rem' }}>
            Total: <strong style={{ color: C.white }}>{totalTechnicians}</strong> teknisi
          </div>
        </div>

        <ServiceScopeList
          branches={visibleBranches}
          selectedBranch={selectedBranch}
          onSelectBranch={onSelectBranch}
          branchCounts={techniciansBranchCounts}
          isLocked={isLocked}
          isDscExpanded={isDscExpanded}
          onToggleDsc={() => setIsDscExpanded((prev) => !prev)}
        />
      </div>

      {/* FOOTER — TOMBOL LOGOUT */}
      <div
        style={{
          padding: '0.625rem 0.875rem 0.75rem',
          borderTop: `1px solid ${C.divider}`,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '8px 16px',
            borderRadius: '8px',
            border: `1px solid ${C.creamFaint}`,
            backgroundColor: C.creamGhost,
            color: C.creamSoft,
            fontSize: '0.775rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = C.accent;
            e.currentTarget.style.borderColor = C.accent;
            e.currentTarget.style.color = C.white;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = C.creamGhost;
            e.currentTarget.style.borderColor = C.creamFaint;
            e.currentTarget.style.color = C.creamSoft;
          }}
        >
          <LogOut size={14} />
          <span>Keluar dari Portal</span>
        </button>
      </div>
    </aside>
  );
};
