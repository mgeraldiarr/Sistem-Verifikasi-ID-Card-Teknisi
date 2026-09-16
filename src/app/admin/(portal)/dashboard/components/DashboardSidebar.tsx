// src/app/admin/(portal)/dashboard/components/DashboardSidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Shield,
  Wrench,
  ChevronDown,
  ChevronRight,
  Search,
  MapPin,
  Check,
  Layers,
  LogOut,
  Lock,
  Crown,
  UserCog,
  LayoutDashboard,
  User,
} from 'lucide-react';
import { SERVICE_SCOPES } from '@/constants/service-center';
import { useBranches } from '@/hooks/useBranches';
import { UserProfile } from '@/types';

/* ─────────────────────────────────────────────
 * Palet warna — disejajarkan dengan brand MODENA
 * ───────────────────────────────────────────── */
const C = {
  bg: '#1C1C1A',
  bgElevated: '#242422',
  bgHover: '#2C2C29',
  accent: '#DA291C',
  accentSoft: 'rgba(218, 41, 28, 0.14)',
  accentBorder: 'rgba(218, 41, 28, 0.40)',
  cream: '#ECE8DA',
  creamSoft: 'rgba(236, 232, 218, 0.55)',
  creamMuted: 'rgba(236, 232, 218, 0.35)',
  creamFaint: 'rgba(236, 232, 218, 0.12)',
  creamGhost: 'rgba(236, 232, 218, 0.06)',
  divider: 'rgba(255, 255, 255, 0.07)',
  white: '#FFFFFF',
} as const;

interface DashboardSidebarProps {
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

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
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

  /**
   * Status ekspansi lingkup layanan (DSC):
   * - Super Admin login: default dalam keadaan tertutup (false).
   * - Admin Cabang (lockedBranch): default terbuka (true) agar cabang tugasnya langsung terlihat.
   * - Ada filter cabang aktif pada URL: default terbuka (true) agar posisinya terlihat.
   */
  const [isDscExpanded, setIsDscExpanded] = useState<boolean>(() => {
    if (lockedBranch) return true;
    if (selectedBranch) return true;
    return false; // Default tertutup untuk Super Admin saat login
  });
  const [branchSearch, setBranchSearch] = useState('');

  // Sinkronisasi bila Admin Cabang selesai dimuat setelah render awal
  React.useEffect(() => {
    if (lockedBranch) {
      setIsDscExpanded(true);
    }
  }, [lockedBranch]);

  // Master cabang dibaca dari tabel `branches` (fallback ke konstanta bila belum dimigrasi)
  const { branchNames } = useBranches();

  // Admin Cabang hanya melihat cabangnya sendiri pada daftar navigasi
  const visibleBranches = isLocked
    ? branchNames.filter((branch) => branch === lockedBranch)
    : branchNames;

  const filteredBranches = visibleBranches.filter((branch) =>
    branch.toLowerCase().includes(branchSearch.toLowerCase())
  );

  /** Inisial nama untuk avatar */
  const initials = (profile?.full_name || profile?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
      {/* ══════════════════════════════════════════════
       *  HEADER — LOGO MODENA
       * ══════════════════════════════════════════════ */}
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
        <div
          style={{
            height: '14px',
            width: '1px',
            backgroundColor: C.creamFaint,
          }}
        />
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

      {/* ══════════════════════════════════════════════
       *  IDENTITAS PENGGUNA — avatar ringkas + badge peran
       * ══════════════════════════════════════════════ */}
      {profile && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderBottom: `1px solid ${C.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.7rem',
            flexShrink: 0,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: isSuperAdmin ? C.accentSoft : C.creamGhost,
              border: `1.5px solid ${isSuperAdmin ? C.accentBorder : C.creamFaint}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: isSuperAdmin ? '#FF6B5E' : C.creamSoft,
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            {initials || <User size={15} />}
          </div>

          {/* Nama + badge */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: C.white,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
              }}
              title={profile.full_name || profile.email}
            >
              {profile.full_name || profile.email}
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '3px',
                padding: '1px 7px 1px 5px',
                borderRadius: '999px',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                backgroundColor: isSuperAdmin ? C.accentSoft : C.creamGhost,
                color: isSuperAdmin ? '#FF6B5E' : C.creamSoft,
                border: `1px solid ${isSuperAdmin ? C.accentBorder : C.creamFaint}`,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {isSuperAdmin ? <Crown size={9} /> : <Building2 size={9} />}
              {isSuperAdmin
                ? 'Super Admin'
                : profile.role === 'branch_admin'
                  ? `Admin — ${profile.branch || '—'}`
                  : 'Peran Belum Ditetapkan'}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
       *  NAVIGASI ADMIN — hanya muncul untuk Super Admin
       * ══════════════════════════════════════════════ */}
      {isSuperAdmin && (
        <div
          style={{
            padding: '0.75rem 0.875rem 0.625rem',
            borderBottom: `1px solid ${C.divider}`,
            flexShrink: 0,
          }}
        >
          <SectionLabel text="Menu" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '0.4rem' }}>
            {[
              {
                href: '/admin/dashboard',
                label: 'Dashboard Teknisi',
                icon: <LayoutDashboard size={15} />,
              },
              { href: '/admin/accounts', label: 'Kelola Akun', icon: <UserCog size={15} /> },
              { href: '/admin/branches', label: 'Kelola Cabang', icon: <Building2 size={15} /> },
            ].map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
       *  AREA SCROLLABLE — Lingkup Layanan + Cabang DSC
       * ══════════════════════════════════════════════ */}
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
        {/* Label seksi + ringkasan */}
        <div style={{ paddingLeft: '2px' }}>
          <SectionLabel text="Lingkup Layanan" icon={<Layers size={11} color={C.accent} />} />
          <div
            style={{
              fontSize: '0.75rem',
              color: C.creamSoft,
              marginTop: '0.3rem',
            }}
          >
            Total:{' '}
            <strong style={{ color: C.white }}>
              {totalTechnicians}
            </strong>{' '}
            teknisi
          </div>
        </div>

        {/* Kartu 3 scope layanan: DSC / ASC / SL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SERVICE_SCOPES.map((scope) => {
            const isDsc = scope.code === 'DSC';

            return (
              <div key={scope.code}>
                {/* ── Kartu Scope ── */}
                <button
                  type="button"
                  onClick={() => {
                    if (isDsc) setIsDscExpanded(!isDscExpanded);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.7rem',
                    borderRadius: '8px',
                    backgroundColor: isDsc
                      ? isDscExpanded
                        ? C.bgHover
                        : C.bgElevated
                      : C.creamGhost,
                    cursor: isDsc ? 'pointer' : 'default',
                    opacity: scope.isActive ? 1 : 0.5,
                    border: isDsc
                      ? `1px solid ${isDscExpanded ? C.accentBorder : C.creamFaint}`
                      : `1px solid ${C.creamGhost}`,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (isDsc) {
                      e.currentTarget.style.backgroundColor = C.bgHover;
                      e.currentTarget.style.borderColor = C.creamSoft;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isDsc) {
                      e.currentTarget.style.backgroundColor = isDscExpanded ? C.bgHover : C.bgElevated;
                      e.currentTarget.style.borderColor = isDscExpanded ? C.accentBorder : C.creamFaint;
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    {/* Ikon scope */}
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isDsc ? C.accent : C.creamGhost,
                        color: isDsc ? C.white : C.creamMuted,
                        flexShrink: 0,
                      }}
                    >
                      {scope.code === 'DSC' && <Building2 size={14} />}
                      {scope.code === 'ASC' && <Shield size={14} />}
                      {scope.code === 'SL' && <Wrench size={14} />}
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <div
                        style={{
                          fontSize: '0.775rem',
                          fontWeight: 700,
                          color: scope.isActive ? C.white : C.creamMuted,
                          lineHeight: 1.2,
                        }}
                      >
                        {scope.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.625rem',
                          color: C.creamMuted,
                          marginTop: '1px',
                        }}
                      >
                        {scope.fullName}
                      </div>
                    </div>
                  </div>

                  {/* Badge / chevron */}
                  {scope.badge ? (
                    <span
                      style={{
                        fontSize: '0.575rem',
                        fontWeight: 700,
                        backgroundColor: C.creamGhost,
                        color: C.creamMuted,
                        padding: '2px 7px',
                        borderRadius: '10px',
                        border: `1px solid ${C.creamGhost}`,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {scope.badge}
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: C.creamSoft,
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 800,
                          backgroundColor: C.accent,
                          color: C.white,
                          padding: '0px 6px',
                          borderRadius: '10px',
                          lineHeight: '18px',
                        }}
                      >
                        {isLocked ? 1 : branchNames.length}
                      </span>
                      {isDscExpanded ? (
                        <ChevronDown size={13} />
                      ) : (
                        <ChevronRight size={13} />
                      )}
                    </span>
                  )}
                </button>

                {/* ── Submenu cabang DSC ── */}
                {isDsc && isDscExpanded && (
                  <div
                    style={{
                      marginLeft: '14px',
                      marginTop: '6px',
                      paddingLeft: '12px',
                      borderLeft: `2px solid ${C.creamFaint}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    {/* Pencarian cabang — disembunyikan saat terkunci */}
                    {!isLocked && (
                      <div style={{ position: 'relative', marginBottom: '4px' }}>
                        <Search
                          size={12}
                          color={C.creamMuted}
                          style={{
                            position: 'absolute',
                            left: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                          }}
                        />
                        <input
                          id="sidebar-branch-search"
                          name="sidebar_branch_search"
                          type="text"
                          placeholder="Cari cabang..."
                          value={branchSearch}
                          onChange={(e) => setBranchSearch(e.target.value)}
                          style={{
                            width: '100%',
                            fontSize: '0.7rem',
                            padding: '6px 8px 6px 26px',
                            borderRadius: '6px',
                            border: `1px solid ${C.creamFaint}`,
                            backgroundColor: C.creamGhost,
                            color: C.cream,
                            outline: 'none',
                            transition: 'border-color 0.15s ease',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = C.accent;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = C.creamFaint;
                          }}
                        />
                      </div>
                    )}

                    {/* Tombol "Semua Cabang" — hanya untuk akses nasional */}
                    {!isLocked && (
                      <BranchButton
                        label="Semua Cabang DSC"
                        isSelected={selectedBranch === ''}
                        onClick={() => onSelectBranch('')}
                        showCheck
                      />
                    )}

                    {/* Banner isolasi cabang */}
                    {isLocked && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 8px',
                          marginBottom: '4px',
                          borderRadius: '6px',
                          backgroundColor: C.accentSoft,
                          border: `1px solid ${C.accentBorder}`,
                          color: 'rgba(236, 232, 218, 0.75)',
                          fontSize: '0.65rem',
                          lineHeight: 1.4,
                        }}
                      >
                        <Lock size={11} color={C.accent} style={{ flexShrink: 0 }} />
                        <span>Akses terkunci pada cabang Anda</span>
                      </div>
                    )}

                    {/* Daftar cabang (scrollable) */}
                    <div
                      style={{
                        maxHeight: '320px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1px',
                        paddingRight: '2px',
                      }}
                    >
                      {filteredBranches.length === 0 ? (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: C.creamMuted,
                            padding: '0.75rem 0.5rem',
                            textAlign: 'center',
                          }}
                        >
                          Cabang tidak ditemukan
                        </div>
                      ) : (
                        filteredBranches.map((branch) => {
                          const isSelected = selectedBranch === branch;
                          const count = techniciansBranchCounts[branch];

                          return (
                            <BranchButton
                              key={branch}
                              label={branch}
                              isSelected={isSelected}
                              onClick={() => onSelectBranch(branch)}
                              count={count}
                              icon={
                                <MapPin
                                  size={11}
                                  color={
                                    isSelected ? C.white : 'rgba(236, 232, 218, 0.22)'
                                  }
                                  style={{ flexShrink: 0 }}
                                />
                              }
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
       *  FOOTER — TOMBOL LOGOUT
       * ══════════════════════════════════════════════ */}
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

/* ═══════════════════════════════════════════════
 * SUB-KOMPONEN INTERNAL
 * ═══════════════════════════════════════════════ */

/** Label seksi kecil (uppercase, muted) */
function SectionLabel({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: C.creamMuted,
        textTransform: 'uppercase',
      }}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}

/** Tautan navigasi utama (Dashboard, Kelola Akun, dll.) */
function NavLink({
  href,
  label,
  icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.55rem',
        padding: '7px 10px',
        borderRadius: '7px',
        backgroundColor: isActive ? C.accentSoft : 'transparent',
        border: isActive
          ? `1px solid ${C.accentBorder}`
          : '1px solid transparent',
        color: isActive ? C.white : C.creamSoft,
        fontSize: '0.775rem',
        fontWeight: isActive ? 700 : 500,
        transition: 'all 0.15s ease',
        textDecoration: 'none',
      }}
    >
      <span
        style={{
          color: isActive ? '#FF6B5E' : C.accent,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}

/** Tombol cabang di daftar navigasi DSC */
function BranchButton({
  label,
  isSelected,
  onClick,
  count,
  icon,
  showCheck,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  count?: number;
  icon?: React.ReactNode;
  showCheck?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'left',
        width: '100%',
        backgroundColor: isSelected ? C.accent : 'transparent',
        color: isSelected ? C.white : C.creamSoft,
        border: isSelected
          ? `1px solid ${C.accent}`
          : '1px solid transparent',
        padding: '5px 8px',
        borderRadius: '6px',
        fontSize: '0.7rem',
        fontWeight: isSelected ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflow: 'hidden',
        }}
      >
        {icon}
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      </div>

      {showCheck && isSelected && <Check size={12} color={C.white} />}

      {typeof count === 'number' && count > 0 && (
        <span
          style={{
            fontSize: '0.6rem',
            padding: '1px 6px',
            borderRadius: '8px',
            backgroundColor: isSelected
              ? 'rgba(255, 255, 255, 0.2)'
              : C.creamGhost,
            color: isSelected ? C.white : C.creamMuted,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}