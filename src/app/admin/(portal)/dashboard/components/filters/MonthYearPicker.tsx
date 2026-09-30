// src/app/admin/(portal)/dashboard/components/filters/MonthYearPicker.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { MONTH_NAMES } from '@/constants/months';
import styles from './MonthYearPicker.module.css';

interface MonthYearPickerProps {
  /** Format YYYY-MM */
  month: string;
  /** Format YYYY */
  year: string;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

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
  if (year) return `Sepanjang ${year}`;
  return 'Semua periode';
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

  // Tutup popover saat mengklik di luar area kalender atau menekan Escape
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
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

  const clearFilter = () => {
    onMonthChange('');
    onYearChange('');
  };

  return (
    <div className={styles.root} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`select ${styles.trigger} ${hasFilter ? styles.active : ''}`}
      >
        <CalendarIcon size={14} className={styles.triggerIcon} />
        <span className={styles.triggerLabel}>{getButtonLabel(year, month)}</span>
      </button>

      {hasFilter && (
        <button
          type="button"
          onClick={clearFilter}
          className={styles.clear}
          aria-label="Hapus filter periode"
          title="Hapus filter periode"
        >
          <X size={14} />
        </button>
      )}

      {open && (
        <div role="dialog" aria-label="Pilih bulan atau tahun" className={`popover ${styles.popover}`}>
          <div className={styles.yearNav}>
            <button
              type="button"
              className="icon-btn"
              aria-label="Tahun sebelumnya"
              onClick={() => setCalendarYear((prev) => prev - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span className={styles.year}>{calendarYear}</span>
            <button
              type="button"
              className="icon-btn"
              aria-label="Tahun berikutnya"
              onClick={() => setCalendarYear((prev) => prev + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className={styles.months}>
            {MONTH_NAMES.map((name, idx) => {
              const isSelected = month === `${calendarYear}-${String(idx + 1).padStart(2, '0')}`;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => selectMonth(idx)}
                  className={styles.month}
                >
                  {name.slice(0, 3)}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={selectFullYear}
            aria-pressed={isFullYearSelected}
            className={`${styles.month} ${styles.fullYear}`}
          >
            Sepanjang tahun {calendarYear}
          </button>
        </div>
      )}
    </div>
  );
};
