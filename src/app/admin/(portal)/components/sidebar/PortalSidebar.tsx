// src/app/admin/(portal)/components/sidebar/PortalSidebar.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut, X } from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';
import { ServiceTypeCode, UserProfile } from '@/types';
import { ServiceScopeList } from './ServiceScopeList';
import { SidebarAdminMenu } from './SidebarAdminMenu';
import { SidebarUserCard } from './SidebarUserCard';

interface PortalSidebarProps {
  /** Drawer terbuka (hanya berpengaruh di layar < 1024px) */
  isOpen: boolean;
  onClose: () => void;
  /** Lingkup aktif ('' = semua lingkup) */
  selectedScope: ServiceTypeCode | '';
  selectedBranch: string;
  onSelectScope: (scope: ServiceTypeCode | '') => void;
  onSelectBranch: (branch: string) => void;
  totalTechnicians: number;
  techniciansBranchCounts?: Record<string, number>;
  techniciansScopeCounts?: Partial<Record<ServiceTypeCode, number>>;
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
  selectedScope,
  selectedBranch,
  onSelectScope,
  onSelectBranch,
  totalTechnicians,
  techniciansBranchCounts = {},
  techniciansScopeCounts = {},
  onLogout,
  profile = null,
  lockedBranch = null,
}) => {
  const pathname = usePathname();
  const isLocked = Boolean(lockedBranch);
  const isSuperAdmin = profile?.role === 'super_admin';

  // Master cabang dari tabel `branches` (fallback ke konstanta bila belum dimigrasi).
  // Admin Cabang hanya melihat cabangnya sendiri.
  const { branchesByScope } = useBranches();
  const visibleBranchesByScope = useMemo(() => {
    if (!isLocked) return branchesByScope;
    const onlyLocked = (names: string[]) => names.filter((branch) => branch === lockedBranch);
    const scoped = {
      DSC: onlyLocked(branchesByScope.DSC),
      ASC: onlyLocked(branchesByScope.ASC),
      SL: onlyLocked(branchesByScope.SL),
    };
    // Cabang Admin Cabang yang belum terdaftar di master tetap tampil (bawaan DSC)
    const found = scoped.DSC.length + scoped.ASC.length + scoped.SL.length > 0;
    return found || !lockedBranch ? scoped : { ...scoped, DSC: [lockedBranch] };
  }, [isLocked, lockedBranch, branchesByScope]);

  // Daftar cabang terbuka pada lingkup yang sedang aktif (termasuk lingkup Admin Cabang);
  // tanpa lingkup aktif semuanya tertutup.
  const activeScope = selectedScope || null;
  const [expandedScope, setExpandedScope] = useState<ServiceTypeCode | null>(activeScope);

  // Lingkup aktif bisa berubah dari URL, filter dashboard, atau profil yang baru dimuat
  useEffect(() => {
    if (activeScope) setExpandedScope(activeScope);
  }, [activeScope]);

  /** Klik lingkup: tampilkan semua teknisinya; klik lagi lingkup yang aktif untuk melipat */
  const handleScopeClick = (scope: ServiceTypeCode) => {
    if (isLocked || (scope === selectedScope && !selectedBranch)) {
      setExpandedScope((prev) => (prev === scope ? null : scope));
      return;
    }
    setExpandedScope(scope);
    onSelectScope(scope);
  };

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
          branchesByScope={visibleBranchesByScope}
          selectedScope={selectedScope}
          selectedBranch={selectedBranch}
          onSelectAll={() => onSelectScope('')}
          onSelectScope={handleScopeClick}
          onSelectBranch={onSelectBranch}
          branchCounts={techniciansBranchCounts}
          scopeCounts={techniciansScopeCounts}
          totalTechnicians={totalTechnicians}
          isLocked={isLocked}
          expandedScope={expandedScope}
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
