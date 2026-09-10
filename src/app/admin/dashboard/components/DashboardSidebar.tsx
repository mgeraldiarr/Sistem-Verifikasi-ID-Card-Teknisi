// src/app/admin/dashboard/components/DashboardSidebar.tsx
'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  SERVICE_SCOPES,
  DSC_BRANCHES,
} from '@/constants/service-center';

interface DashboardSidebarProps {
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  totalTechnicians: number;
  techniciansBranchCounts?: Record<string, number>;
  onLogout: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  selectedBranch,
  onSelectBranch,
  totalTechnicians,
  techniciansBranchCounts = {},
  onLogout,
}) => {
  const [isDscExpanded, setIsDscExpanded] = useState(true);
  const [branchSearch, setBranchSearch] = useState('');

  const filteredBranches = DSC_BRANCHES.filter((branch) =>
    branch.toLowerCase().includes(branchSearch.toLowerCase())
  );

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
        backgroundColor: '#1C1C1A',
        zIndex: 30,
      }}
    >
      {/* ========== HEADER: LOGO MODENA ========== */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexShrink: 0,
        }}
      >
        <img
          src="/modena-logo-white.png"
          alt="MODENA"
          style={{
            height: '1.5rem',
            width: 'auto',
            objectFit: 'contain',
          }}
        />
        <div
          style={{
            height: '16px',
            width: '1px',
            backgroundColor: 'rgba(255,255,255,0.12)',
          }}
        />
        <span
          style={{
            color: '#ECE8DA',
            fontWeight: 500,
            fontSize: '0.675rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            opacity: 0.6,
          }}
        >
          Technician Portal
        </span>
      </div>

      {/* ========== KONTEN SIDEBAR: SCROLLABLE ========== */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.125rem 0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.125rem',
        }}
      >
        {/* Section Label: Ruang Lingkup Layanan */}
        <div>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#ECE8DA',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              paddingLeft: '4px',
              opacity: 0.45,
            }}
          >
            <Layers size={12} color="#DA291C" />
            <span>Ruang Lingkup Layanan</span>
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#ECE8DA',
              paddingLeft: '4px',
              opacity: 0.6,
            }}
          >
            Total Terdaftar:{' '}
            <strong style={{ color: '#FFFFFF', opacity: 1 }}>
              {totalTechnicians} Teknisi
            </strong>
          </div>
        </div>

        {/* Navigasi Service Scope (DSC, ASC, SL) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {SERVICE_SCOPES.map((scope) => {
            const isDsc = scope.code === 'DSC';

            return (
              <div
                key={scope.code}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                {/* Card Scope Item */}
                <div
                  onClick={() => {
                    if (isDsc) {
                      setIsDscExpanded(!isDscExpanded);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: isDsc
                      ? 'rgba(236, 232, 218, 0.08)'
                      : 'rgba(236, 232, 218, 0.03)',
                    cursor: isDsc ? 'pointer' : 'default',
                    opacity: scope.isActive ? 1 : 0.5,
                    border: isDsc
                      ? '1px solid rgba(236, 232, 218, 0.1)'
                      : '1px solid rgba(236, 232, 218, 0.05)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                    }}
                  >
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '7px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isDsc ? '#DA291C' : 'rgba(236, 232, 218, 0.08)',
                        color: isDsc ? '#FFFFFF' : 'rgba(236, 232, 218, 0.4)',
                        flexShrink: 0,
                      }}
                    >
                      {scope.code === 'DSC' && <Building2 size={15} />}
                      {scope.code === 'ASC' && <Shield size={15} />}
                      {scope.code === 'SL' && <Wrench size={15} />}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: scope.isActive
                            ? '#FFFFFF'
                            : 'rgba(236, 232, 218, 0.4)',
                          lineHeight: 1.2,
                        }}
                      >
                        {scope.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          color: 'rgba(236, 232, 218, 0.35)',
                          marginTop: '1px',
                        }}
                      >
                        {scope.fullName}
                      </div>
                    </div>
                  </div>

                  {/* Badge Status / Toggle Icon */}
                  {scope.badge ? (
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(236, 232, 218, 0.08)',
                        color: 'rgba(236, 232, 218, 0.4)',
                        padding: '2px 7px',
                        borderRadius: '10px',
                        border: '1px solid rgba(236, 232, 218, 0.06)',
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
                        gap: '3px',
                        color: 'rgba(236, 232, 218, 0.5)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: '#DA291C',
                          color: '#FFFFFF',
                          padding: '1px 6px',
                          borderRadius: '10px',
                        }}
                      >
                        31
                      </span>
                      {isDscExpanded ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </span>
                  )}
                </div>

                {/* Submenu 31 Cabang Resmi DSC */}
                {isDsc && isDscExpanded && (
                  <div
                    style={{
                      marginLeft: '0.5rem',
                      paddingLeft: '0.65rem',
                      borderLeft: '2px solid rgba(236, 232, 218, 0.1)',
                      marginTop: '0.35rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                    }}
                  >
                    {/* Filter Pencarian Cabang */}
                    <div style={{ position: 'relative', margin: '0.15rem 0' }}>
                      <Search
                        size={12}
                        color="rgba(236, 232, 218, 0.3)"
                        style={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                      />
                      <input
                        id="sidebar-branch-search"
                        name="sidebar_branch_search"
                        type="text"
                        placeholder="Cari cabang DSC..."
                        value={branchSearch}
                        onChange={(e) => setBranchSearch(e.target.value)}
                        style={{
                          width: '100%',
                          fontSize: '0.725rem',
                          padding: '5px 8px 5px 24px',
                          borderRadius: '6px',
                          border: '1px solid rgba(236, 232, 218, 0.1)',
                          backgroundColor: 'rgba(236, 232, 218, 0.05)',
                          color: '#ECE8DA',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Tombol "Semua Cabang" */}
                    <button
                      type="button"
                      onClick={() => onSelectBranch('')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        backgroundColor:
                          selectedBranch === ''
                            ? '#DA291C'
                            : 'transparent',
                        color:
                          selectedBranch === ''
                            ? '#FFFFFF'
                            : 'rgba(236, 232, 218, 0.6)',
                        border: selectedBranch === ''
                          ? '1px solid #DA291C'
                          : '1px solid transparent',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        fontSize: '0.725rem',
                        fontWeight: selectedBranch === '' ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>Semua Cabang DSC</span>
                      {selectedBranch === '' && <Check size={12} color="#FFFFFF" />}
                    </button>

                    {/* Daftar 31 Cabang */}
                    <div
                      style={{
                        maxHeight: '340px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1px',
                        paddingRight: '4px',
                      }}
                    >
                      {filteredBranches.length === 0 ? (
                        <div
                          style={{
                            fontSize: '0.725rem',
                            color: 'rgba(236, 232, 218, 0.3)',
                            padding: '0.5rem',
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
                            <button
                              key={branch}
                              type="button"
                              onClick={() => onSelectBranch(branch)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                textAlign: 'left',
                                backgroundColor: isSelected
                                  ? '#DA291C'
                                  : 'transparent',
                                color: isSelected
                                  ? '#FFFFFF'
                                  : 'rgba(236, 232, 218, 0.6)',
                                border: isSelected
                                  ? '1px solid #DA291C'
                                  : '1px solid transparent',
                                padding: '5px 8px',
                                borderRadius: '6px',
                                fontSize: '0.725rem',
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
                                <MapPin
                                  size={11}
                                  color={isSelected ? '#FFFFFF' : 'rgba(236, 232, 218, 0.25)'}
                                  style={{ flexShrink: 0 }}
                                />
                                <span
                                  style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {branch}
                                </span>
                              </div>

                              {typeof count === 'number' && count > 0 && (
                                <span
                                  style={{
                                    fontSize: '0.625rem',
                                    padding: '1px 5px',
                                    borderRadius: '8px',
                                    backgroundColor: isSelected
                                      ? 'rgba(255,255,255,0.2)'
                                      : 'rgba(236, 232, 218, 0.08)',
                                    color: isSelected
                                      ? '#FFFFFF'
                                      : 'rgba(236, 232, 218, 0.4)',
                                    fontWeight: 700,
                                  }}
                                >
                                  {count}
                                </span>
                              )}
                            </button>
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

      {/* ========== FOOTER: TOMBOL LOGOUT ========== */}
      <div
        style={{
          padding: '0.75rem 0.875rem',
          borderTop: '1px solid rgba(236, 232, 218, 0.08)',
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
            border: '1px solid rgba(236, 232, 218, 0.1)',
            backgroundColor: 'rgba(236, 232, 218, 0.05)',
            color: 'rgba(236, 232, 218, 0.5)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#DA291C';
            e.currentTarget.style.borderColor = '#DA291C';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(236, 232, 218, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(236, 232, 218, 0.1)';
            e.currentTarget.style.color = 'rgba(236, 232, 218, 0.5)';
          }}
        >
          <LogOut size={14} />
          <span>Keluar dari Portal</span>
        </button>
      </div>
    </aside>
  );
};