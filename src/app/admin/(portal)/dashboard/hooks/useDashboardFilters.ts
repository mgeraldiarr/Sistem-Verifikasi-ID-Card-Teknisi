// src/app/admin/(portal)/dashboard/hooks/useDashboardFilters.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type ParamUpdates = Record<string, string | null | undefined>;

/**
 * Filter dashboard disimpan di URL query (deep link & memori filter per cabang di layout).
 * Teks pencarian disimpan lokal agar pengetikan responsif, lalu disalin ke URL (debounce 300ms).
 */
export function useDashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const month = searchParams.get('month') || '';
  const year = searchParams.get('year') || '';
  const level = searchParams.get('level') || '';
  const status = searchParams.get('status') || '';

  const urlQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQuery);

  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  const updateQueryParams = useCallback(
    (updates: ParamUpdates) => {
      const params = new URLSearchParams(searchParams.toString());
      let hasChanged = false;

      Object.entries(updates).forEach(([key, value]) => {
        const current = params.get(key);
        if (value && current !== value) {
          params.set(key, value);
          hasChanged = true;
        } else if (!value && current !== null) {
          params.delete(key);
          hasChanged = true;
        }
      });

      if (!hasChanged) return;
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== urlQuery) updateQueryParams({ q: searchQuery || null });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, urlQuery, updateQueryParams]);

  /** Kosongkan semua filter, tetapi pertahankan cabang yang sedang dipilih */
  const resetFilters = () => {
    setSearchQuery('');
    updateQueryParams({ q: null, month: null, year: null, level: null, status: null });
  };

  return {
    searchQuery,
    setSearchQuery,
    month,
    year,
    level,
    status,
    setMonth: (value: string) => updateQueryParams({ month: value || null }),
    setYear: (value: string) => updateQueryParams({ year: value || null }),
    setLevel: (value: string) => updateQueryParams({ level: value || null }),
    setStatus: (value: string) => updateQueryParams({ status: value || null }),
    resetFilters,
  };
}
