// src/app/admin/(portal)/dashboard/components/filters/MonthYearPicker.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { MONTH_NAMES } from '@/constants/months';

interface MonthYearPickerProps {
  /** Format YYYY-MM */
  month: string;
  /** Format YYYY */
  year: string;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

const yearNavButtonStyle: React.CSSProperties = {
  border: 'none',
  background: '#F3F4F6',
  borderRadius: '6px',
  padding: '4px 8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

function initialCalendarYear(year: string, month: string): number {
  if (year) return parseInt(year, 10);
  if (month) return parseInt(month.split('-')[0], 10);
  return new Date().getFullYear();
}

function getButtonLabel(year: string, month: string): string {
  if (month) {
    const [y, m] = month.split('-');
    return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
  }
  if (year) return `Tahun ${year}`;
  return 'Pilih Bulan / Tahun';
}

/** Tombol filter waktu dengan popover pemilih bulan (grid 12 bulan) atau satu tahun penuh. */
export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  month,
  year,
  onMonthChange,
  onYearChange,
}) => {
  const [open, setOpen] = useState(false);
  const [calendarYear, setCalendarYear] = useState(() => initialCalendarYear(year, month));
  const containerRef = useRef<HTMLDivElement>(null);

  // Ikuti perubahan filter dari luar (misal tombol Reset)
  useEffect(() => {
    if (year || month) setCalendarYear(initialCalendarYear(year, month));
  }, [year, month]);

  // Tutup popover saat mengklik di luar area kalender
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const hasFilter = Boolean(month || year);
  const isFullYearSelected = year === String(calendarYear) && !month;

  const selectMonth = (monthIndex: number) => {
    onMonthChange(`${calendarYear}-${String(monthIndex + 1).padStart(2, '0')}`);
    onYearChange(String(calendarYear));
    setOpen(false);
  };

  const selectFullYear = () => {
    onYearChange(String(calendarYear));
    onMonthChange(''); // semua bulan di tahun tersebut
    setOpen(false);
  };

  const clearFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMonthChange('');
    onYearChange('');
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '8px',
          border: hasFilter ? '1px solid #1C1C1A' : '1px solid var(--border-color, #D1D5DB)',
          backgroundColor: hasFilter ? '#1C1C1A' : '#FFFFFF',
          color: hasFilter ? '#ECE8DA' : '#374151',
          fontSize: '0.825rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: hasFilter ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <CalendarIcon size={15} color={hasFilter ? '#ECE8DA' : 'var(--accent-red, #DA291C)'} />
        <span>{getButtonLabel(year, month)}</span>

        {hasFilter && (
          <span
            onClick={clearFilter}
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

      {open && (
        <div
          role="dialog"
          aria-label="Pilih bulan atau tahun"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 50,
            width: '300px',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 15px 30px -5px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.06)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Navigasi tahun */}
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
              aria-label="Tahun sebelumnya"
              onClick={() => setCalendarYear((prev) => prev - 1)}
              style={yearNavButtonStyle}
            >
              <ChevronLeft size={16} />
            </button>
            <div
              style={{ fontSize: '1rem', fontWeight: 800, color: '#1C1C1A', letterSpacing: '0.02em' }}
            >
              {calendarYear}
            </div>
            <button
              type="button"
              aria-label="Tahun berikutnya"
              onClick={() => setCalendarYear((prev) => prev + 1)}
              style={yearNavButtonStyle}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Satu tahun penuh */}
          <button
            type="button"
            onClick={selectFullYear}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: '6px',
              backgroundColor: isFullYearSelected ? '#1C1C1A' : '#F9FAFB',
              color: isFullYearSelected ? '#ECE8DA' : '#374151',
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
            {isFullYearSelected && <Check size={14} color="#22C55E" />}
          </button>

          {/* Grid 12 bulan */}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {MONTH_NAMES.map((name, idx) => {
                const isSelected = month === `${calendarYear}-${String(idx + 1).padStart(2, '0')}`;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => selectMonth(idx)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #1C1C1A' : '1px solid #E5E7EB',
                      backgroundColor: isSelected ? '#1C1C1A' : '#FFFFFF',
                      color: isSelected ? '#ECE8DA' : '#374151',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#F3F4F6';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#FFFFFF';
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
  );
};
