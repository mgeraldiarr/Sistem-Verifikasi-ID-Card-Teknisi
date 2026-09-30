// src/app/admin/(portal)/components/sidebar/PortalSidebar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut, X } from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';
import { UserProfile } from '@/types';
import { ServiceScopeList } from './ServiceScopeList';
import { SidebarAdminMenu } from './SidebarAdminMenu';
import { SidebarUserCard } from './SidebarUserCard';

interface PortalSidebarProps {
  /** Drawer terbuka (hanya berpengaruh di layar < 1024px) */
  isOpen: boolean;
  onClose: () => void;
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
  isOpen,
  onClose,
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
    <aside className={`sidebar no-print${isOpen ? ' is-open' : ''}`} aria-label="Navigasi portal">
      <div className="sb-brand">
        <img src="/modena-logo-white.png" alt="MODENA" />
        <span className="sb-brand-name">Portal Teknisi</span>
        <button
          type="button"
          className="icon-btn sidebar-close"
          onClick={onClose}
          aria-label="Tutup menu"
        >
          <X size={18} />
        </button>
      </div>

      {profile && <SidebarUserCard profile={profile} />}

      {isSuperAdmin && <SidebarAdminMenu pathname={pathname} />}

      <div className="sb-scroll">
        <div className="sb-section-title">
          <span>Lingkup layanan</span>
          <span>
            <strong className="tnum">{totalTechnicians}</strong> teknisi
          </span>
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

      <div className="sb-foot">
        <button type="button" className="sb-link" onClick={onLogout}>
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};
