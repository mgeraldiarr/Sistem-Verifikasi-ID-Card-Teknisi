// src/app/admin/(portal)/grooming/components/GroomingWeekPicker.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  dateStringToIsoWeek,
  getIsoWeekString,
  getWeekDateRangeLabel,
  shiftIsoWeek,
} from '@/lib/grooming/period';

interface GroomingWeekPickerProps {
  value: string; // ISO week string (contoh: "2026-W45") atau "" untuk semua periode
  onChange: (week: string) => void;
}

export const GroomingWeekPicker: React.FC<GroomingWeekPickerProps> = ({
  value,
  onChange,
}) => {
  const currentWeek = getIsoWeekString();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar atau tekan Escape
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

  const activeWeek = value || currentWeek;
  const isCurrentWeek = value === currentWeek;
  const isAllPeriod = !value;

  // Format label ringkas untuk tombol trigger
  const triggerLabel = isAllPeriod
    ? 'Semua Periode'
    : isCurrentWeek
      ? `Minggu Ini (${getWeekDateRangeLabel(currentWeek)})`
      : getWeekDateRangeLabel(value);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = shiftIsoWeek(activeWeek, -1);
    onChange(nextVal);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = shiftIsoWeek(activeWeek, 1);
    onChange(nextVal);
  };

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const isoWeek = dateStringToIsoWeek(e.target.value);
      onChange(isoWeek);
      setOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minWidth: 0,
      }}
    >
      {/* Trigger Button - Standar Select MODENA */}
      <div
        className="input-wrap"
        style={{
          width: '100%',
          position: 'relative',
        }}
      >
        <CalendarIcon size={14} className="input-icon" />

        <button
          type="button"
          className="select"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="dialog"
          style={{
            width: '100%',
            textAlign: 'left',
            paddingLeft: '32px',
            paddingRight: '28px',
            fontSize: '13px',
            fontWeight: isCurrentWeek ? 600 : 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
            cursor: 'pointer',
          }}
          title={triggerLabel}
        >
          {triggerLabel}
        </button>

        <ChevronDown
          size={14}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: `translateY(-50%) ${open ? 'rotate(180deg)' : ''}`,
            transition: 'transform 0.15s ease',
            color: 'var(--ink-3)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Popover Kalender & Navigasi Minggu */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-pop)',
            padding: '14px',
            width: '290px',
            maxWidth: '90vw',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Header Navigasi Geser Minggu */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <button
              type="button"
              className="icon-btn"
              onClick={handlePrev}
              title="Minggu sebelumnya"
              style={{ width: '28px', height: '28px' }}
            >
              <ChevronLeft size={16} />
            </button>

            <div style={{ textAlign: 'center', minWidth: 0 }}>
              <strong
                style={{
                  fontSize: '13px',
                  display: 'block',
                  color: 'var(--ink)',
                  whiteSpace: 'nowrap',
                }}
              >
                {getWeekDateRangeLabel(activeWeek)}
              </strong>
              <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>
                {isCurrentWeek ? '● Minggu Ini' : `Periode ${activeWeek}`}
              </span>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={handleNext}
              title="Minggu berikutnya"
              style={{ width: '28px', height: '28px' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Tombol Pilihan Cepat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              type="button"
              onClick={() => {
                onChange(currentWeek);
                setOpen(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{
                justifyContent: 'flex-start',
                fontSize: '12.5px',
                background: isCurrentWeek ? 'var(--surface-sunk)' : undefined,
                fontWeight: isCurrentWeek ? 700 : 500,
              }}
            >
              <span>Minggu Ini ({getWeekDateRangeLabel(currentWeek)})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onChange(shiftIsoWeek(currentWeek, -1));
                setOpen(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '12.5px' }}
            >
              <span>Minggu Lalu ({getWeekDateRangeLabel(shiftIsoWeek(currentWeek, -1))})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="btn btn-secondary btn-sm"
              style={{
                justifyContent: 'flex-start',
                fontSize: '12.5px',
                background: isAllPeriod ? 'var(--surface-sunk)' : undefined,
                fontWeight: isAllPeriod ? 700 : 500,
              }}
            >
              <span>Semua Periode (Semua Riwayat)</span>
            </button>
          </div>

          {/* Pemilih Tanggal Kalender Visual */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
            <label
              htmlFor="grooming-date-picker"
              style={{
                display: 'block',
                fontSize: '11.5px',
                fontWeight: 600,
                color: 'var(--ink-2)',
                marginBottom: '4px',
              }}
            >
              Atau klik tanggal dari kalender:
            </label>
            <input
              id="grooming-date-picker"
              type="date"
              className="input"
              style={{ width: '100%', fontSize: '12.5px', padding: '6px 8px' }}
              onChange={handleDatePick}
            />
            <span
              style={{
                display: 'block',
                fontSize: '11px',
                color: 'var(--ink-3)',
                marginTop: '4px',
                lineHeight: 1.4,
              }}
            >
              Sistem akan otomatis memilih minggu dari tanggal tersebut.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
