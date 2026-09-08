// src/app/admin/dashboard/components/DashboardFilters.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Calendar as CalendarIcon,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';

interface DashboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterMonth: string; // Format: 'YYYY-MM' (contoh: '2026-08')
  setFilterMonth: (val: string) => void;
  filterYear: string; // Format: 'YYYY' (contoh: '2026')
  setFilterYear: (val: string) => void;
  filterLevel: string;
  setFilterLevel: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  onResetFilters: () => void;
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  filterLevel,
  setFilterLevel,
  filterStatus,
  setFilterStatus,
  onResetFilters,
}) => {
  // State untuk Popover Kalender (Month & Year Picker)
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Tahun yang sedang di-browse di kalender (default ke filterYear atau tahun ini)
  const [calendarYear, setCalendarYear] = useState<number>(() => {
    if (filterYear) return parseInt(filterYear, 10);
    if (filterMonth) return parseInt(filterMonth.split('-')[0], 10);
    return new Date().getFullYear();
  });

  // Sinkronisasi tahun kalender jika filterYear berubah dari luar
  useEffect(() => {
    if (filterYear) {
      setCalendarYear(parseInt(filterYear, 10));
    } else if (filterMonth) {
      setCalendarYear(parseInt(filterMonth.split('-')[0], 10));
    }
  }, [filterYear, filterMonth]);

  // Tutup popup kalender jika user mengklik di luar area kalender
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Hitung berapa banyak filter parameter yang aktif saat ini (di luar cabang kerja yang dipilih)
  const activeFilterCount = [
    searchQuery,
    filterMonth,
    filterYear,
    filterLevel,
    filterStatus,
  ].filter(Boolean).length;

  // Handler saat user memilih bulan tertentu pada kalender
  const handleSelectMonth = (monthIndex: number) => {
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const selectedMonth = `${calendarYear}-${monthStr}`;
    setFilterMonth(selectedMonth);
    setFilterYear(String(calendarYear));
    setShowCalendar(false);
  };

  // Handler saat user memilih seluruh tahun (Year-Picker)
  const handleSelectFullYear = () => {
    setFilterYear(String(calendarYear));
    setFilterMonth(''); // kosongkan filter bulan agar mencakup semua bulan di tahun tersebut
    setShowCalendar(false);
  };

  // Handler hapus filter waktu
  const handleClearDateFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFilterMonth('');
    setFilterYear('');
  };

  // Label tampilan untuk tombol kalender
  const getDateFilterLabel = () => {
    if (filterMonth) {
      const [y, m] = filterMonth.split('-');
      const monthName = MONTH_NAMES[parseInt(m, 10) - 1];
      return `${monthName} ${y}`;
    }
    if (filterYear) {
      return `Tahun ${filterYear}`;
    }
    return 'Pilih Bulan / Tahun';
  };

  const hasDateFilter = Boolean(filterMonth || filterYear);

  return (
    <div
      className="modena-card"
      style={{
        marginBottom: '1.5rem',
        padding: '18px 20px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--border-color, #E5E7EB)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* ================= BARIS 1: PENCARIAN TEKS INSTAN NAMA TEKNISI ================= */}
      <div style={{ position: 'relative', width: '100%' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted, #9CA3AF)',
          }}
        />
        <input
          id="filter-technician-search"
          name="filter_technician_search"
          type="text"
          placeholder="Cari nama lengkap teknisi, ID MOD, no. karyawan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 12px 9px 36px',
            borderRadius: '8px',
            border: '1px solid var(--border-color, #D1D5DB)',
            fontSize: '0.85rem',
            outline: 'none',
            transition: 'border-color 0.2s ease',
          }}
        />
      </div>

      {/* ================= BARIS 2: FILTER KALENDER WAKTU & RESET ================= */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid #F3F4F6',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          {/* PEMILIH WAKTU BERBASIS KALENDER (Month-Picker & Year-Picker) */}
          <div style={{ position: 'relative' }} ref={calendarRef}>
            <button
              type="button"
              onClick={() => setShowCalendar((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: hasDateFilter
                  ? '1px solid #1C1C1A'
                  : '1px solid var(--border-color, #D1D5DB)',
                backgroundColor: hasDateFilter ? '#1C1C1A' : '#FFFFFF',
                color: hasDateFilter ? '#ECE8DA' : '#374151',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: hasDateFilter
                  ? '0 2px 6px rgba(0,0,0,0.15)'
                  : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <CalendarIcon
                size={15}
                color={hasDateFilter ? '#ECE8DA' : 'var(--accent-red, #DA291C)'}
              />
              <span>{getDateFilterLabel()}</span>

              {hasDateFilter && (
                <span
                  onClick={handleClearDateFilter}
                  title="Hapus filter waktu"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    marginLeft: '4px',
                  }}
                >
                  <X size={12} color="#ECE8DA" />
                </span>
              )}
            </button>

            {/* ANTARMUKA KALENDER (MODAL/POPOVER KALENDER BULAN & TAHUN) */}
            {showCalendar && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  zIndex: 50,
                  width: '300px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  boxShadow:
                    '0 15px 30px -5px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.06)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Header Kalender: Navigasi Tahun (Year-Picker Header) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #F3F4F6',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setCalendarYear((prev) => prev - 1)}
                    style={{
                      border: 'none',
                      background: '#F3F4F6',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#1C1C1A',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {calendarYear}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCalendarYear((prev) => prev + 1)}
                    style={{
                      border: 'none',
                      background: '#F3F4F6',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Tombol Opsi: Pilih Sepanjang Tahun (Year Filter) */}
                <button
                  type="button"
                  onClick={handleSelectFullYear}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    backgroundColor:
                      filterYear === String(calendarYear) && !filterMonth
                        ? '#1C1C1A'
                        : '#F9FAFB',
                    color:
                      filterYear === String(calendarYear) && !filterMonth
                        ? '#ECE8DA'
                        : '#374151',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>Filter Sepanjang Tahun {calendarYear}</span>
                  {filterYear === String(calendarYear) && !filterMonth && (
                    <Check size={14} color="#22C55E" />
                  )}
                </button>

                {/* Grid 12 Bulan (Month-Picker Grid) */}
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#9CA3AF',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Pilih Bulan:
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '6px',
                    }}
                  >
                    {MONTH_NAMES.map((name, idx) => {
                      const monthStr = String(idx + 1).padStart(2, '0');
                      const fullMonthStr = `${calendarYear}-${monthStr}`;
                      const isSelected = filterMonth === fullMonthStr;

                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => handleSelectMonth(idx)}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '8px',
                            border: isSelected
                              ? '1px solid #1C1C1A'
                              : '1px solid #E5E7EB',
                            backgroundColor: isSelected ? '#1C1C1A' : '#FFFFFF',
                            color: isSelected ? '#ECE8DA' : '#374151',
                            fontSize: '0.75rem',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#F3F4F6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                            }
                          }}
                        >
                          {name.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter Status (Aktif / Nonaktif) */}
          <div style={{ minWidth: '130px' }}>
            <select
              id="filter-status"
              name="filter_status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #D1D5DB)',
                fontSize: '0.825rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          {/* Filter Level (Beginner / Intermediate / Advance) */}
          <div style={{ minWidth: '140px' }}>
            <select
              id="filter-level"
              name="filter_level"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #D1D5DB)',
                fontSize: '0.825rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="">Semua Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advance">Advance</option>
            </select>
          </div>
        </div>

        {/* ================= TOMBOL RESET FILTER ================= */}
        <button
          type="button"
          onClick={onResetFilters}
          disabled={activeFilterCount === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: activeFilterCount > 0 ? '#FEE2E2' : '#F3F4F6',
            color: activeFilterCount > 0 ? '#DC2626' : '#9CA3AF',
            border:
              activeFilterCount > 0 ? '1px solid #FECACA' : '1px solid #E5E7EB',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: activeFilterCount > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
        >
          <RotateCcw size={14} />
          <span>
            Reset Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </span>
        </button>
      </div>
    </div>
  );
};
