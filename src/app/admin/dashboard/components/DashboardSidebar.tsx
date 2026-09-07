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
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  selectedBranch,
  onSelectBranch,
  totalTechnicians,
  techniciansBranchCounts = {},
}) => {
  const [isDscExpanded, setIsDscExpanded] = useState(true);
  const [branchSearch, setBranchSearch] = useState('');

  // Filter 31 cabang berdasarkan input pencarian lokal di sidebar
  const filteredBranches = DSC_BRANCHES.filter((branch) =>
    branch.toLowerCase().includes(branchSearch.toLowerCase())
  );

  return (
    <aside
      style={{
        width: '280px',
        minWidth: '280px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--border-color, #E5E7EB)',
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        gap: '1.25rem',
      }}
    >
      {/* Header Sidebar: Ruang Lingkup Layanan */}
      <div>
        <div
          style={{
            fontSize: '0.725rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#888888',
            textTransform: 'uppercase',
            marginBottom: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Layers size={14} color="var(--accent-red, #DA291C)" />
          <span>Ruang Lingkup Layanan</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#555555' }}>
          Total Terdaftar:{' '}
          <strong style={{ color: '#1C1C1A' }}>{totalTechnicians} Teknisi</strong>
        </div>
      </div>

      {/* Navigasi Service Scope (DSC, ASC, SL) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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
                  padding: '0.75rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: isDsc ? 'rgba(28, 28, 26, 0.04)' : '#FAFAFA',
                  cursor: isDsc ? 'pointer' : 'default',
                  opacity: scope.isActive ? 1 : 0.65,
                  border: isDsc ? '1px solid #D6D2C2' : '1px dashed #E5E7EB',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isDsc ? '#1C1C1A' : '#E5E7EB',
                      color: isDsc ? '#FFFFFF' : '#6B7280',
                      flexShrink: 0,
                    }}
                  >
                    {scope.code === 'DSC' && <Building2 size={17} />}
                    {scope.code === 'ASC' && <Shield size={17} />}
                    {scope.code === 'SL' && <Wrench size={17} />}
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: scope.isActive ? '#1C1C1A' : '#777777',
                        lineHeight: 1.2,
                      }}
                    >
                      {scope.label}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: '#888888',
                        marginTop: '2px',
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
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      backgroundColor: '#F3F4F6',
                      color: '#6B7280',
                      padding: '2px 7px',
                      borderRadius: '12px',
                      border: '1px solid #E5E7EB',
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
                      color: '#666',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: '#1C1C1A',
                        color: '#ECE8DA',
                        padding: '1px 6px',
                        borderRadius: '10px',
                      }}
                    >
                      31
                    </span>
                    {isDscExpanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </span>
                )}
              </div>

              {/* Submenu 31 Cabang Resmi DSC */}
              {isDsc && isDscExpanded && (
                <div
                  style={{
                    marginLeft: '0.5rem',
                    paddingLeft: '0.75rem',
                    borderLeft: '2px solid #E5E7EB',
                    marginTop: '0.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  {/* Filter Pencarian Cabang di Sidebar */}
                  <div style={{ position: 'relative', margin: '0.2rem 0' }}>
                    <Search
                      size={13}
                      color="#888"
                      style={{
                        position: 'absolute',
                        left: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Cari cabang DSC..."
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '0.75rem',
                        padding: '5px 8px 5px 26px',
                        borderRadius: '6px',
                        border: '1px solid #E5E7EB',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Tombol Tampilkan "Semua Cabang" */}
                  <button
                    type="button"
                    onClick={() => onSelectBranch('')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      backgroundColor:
                        selectedBranch === '' ? '#1C1C1A' : 'transparent',
                      color: selectedBranch === '' ? '#ECE8DA' : '#333333',
                      border: 'none',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: selectedBranch === '' ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>Semua Cabang DSC</span>
                    {selectedBranch === '' && <Check size={13} color="#22C55E" />}
                  </button>

                  {/* Daftar 31 Cabang dengan scrollbar */}
                  <div
                    style={{
                      maxHeight: '340px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      paddingRight: '4px',
                    }}
                  >
                    {filteredBranches.length === 0 ? (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#9CA3AF',
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
                                ? '#1C1C1A'
                                : 'transparent',
                              color: isSelected ? '#FFFFFF' : '#4B5563',
                              border: 'none',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
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
                                size={12}
                                color={isSelected ? '#DA291C' : '#9CA3AF'}
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
                                  fontSize: '0.65rem',
                                  padding: '1px 5px',
                                  borderRadius: '8px',
                                  backgroundColor: isSelected
                                    ? 'rgba(255,255,255,0.2)'
                                    : '#F3F4F6',
                                  color: isSelected ? '#FFFFFF' : '#6B7280',
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
    </aside>
  );
};