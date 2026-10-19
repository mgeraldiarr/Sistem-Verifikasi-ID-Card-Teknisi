// src/components/ui/ServiceScopeTabs.tsx
'use client';

import React from 'react';
import { SERVICE_SCOPES } from '@/constants/service-center';
import { ServiceTypeCode } from '@/types';

type ScopeValue<AllowAll extends boolean> = AllowAll extends true
  ? ServiceTypeCode | ''
  : ServiceTypeCode;

interface ServiceScopeTabsProps<AllowAll extends boolean> {
  value: ScopeValue<AllowAll>;
  onChange: (scope: ScopeValue<AllowAll>) => void;
  /** Angka kecil di tiap tab, misal jumlah cabang/akun per lingkup */
  counts?: Partial<Record<ServiceTypeCode | '', number>>;
  /** Tampilkan tab "Semua" (nilai '') di depan */
  allowAll?: AllowAll;
  ariaLabel?: string;
}

/** Tab pemilih lingkup layanan DSC / ASC / SL (opsional dengan "Semua"). */
export function ServiceScopeTabs<AllowAll extends boolean = false>({
  value,
  onChange,
  counts,
  allowAll,
  ariaLabel = 'Pilih lingkup layanan',
}: ServiceScopeTabsProps<AllowAll>) {
  const tabs: { code: ServiceTypeCode | ''; label: string; title: string }[] = [
    ...(allowAll ? [{ code: '' as const, label: 'Semua', title: 'Semua lingkup layanan' }] : []),
    ...SERVICE_SCOPES.map((scope) => ({
      code: scope.code,
      label: scope.code,
      title: scope.fullName,
    })),
  ];

  return (
    <div className="segmented scope-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => (
        <button
          key={tab.code || 'all'}
          type="button"
          role="tab"
          aria-selected={value === tab.code}
          title={tab.title}
          onClick={() => onChange(tab.code as ScopeValue<AllowAll>)}
        >
          {tab.label}
          {counts && <span className="scope-tab-count tnum">{counts[tab.code] ?? 0}</span>}
        </button>
      ))}
    </div>
  );
}
