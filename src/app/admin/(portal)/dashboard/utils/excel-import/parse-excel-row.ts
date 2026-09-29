// src/app/admin/(portal)/dashboard/utils/excel-import/parse-excel-row.ts
import {
  getRowValue,
  mapCardStatus,
  mapStatus,
  parseExcelDate,
  parseExcelNumber,
  parseExcelPeriod,
  parseMonthNameToPeriod,
} from '@/lib/excel';
import { KpiIndicators } from '@/lib/kpi';
import { CardStatus, TechnicianStatus } from '@/types';
import { COLUMN_ALIASES as COL } from './excel-columns';

export type ExcelRow = Record<string, unknown>;

export interface ParsedExcelRow {
  technicianName: string;
  branch: string;
  /** Kosong bila file tidak mencantumkan ID (akan dibuat otomatis untuk teknisi baru) */
  technicianId: string;
  employeeNumber: string;
  indicators: Required<{ [K in keyof KpiIndicators]: number }>;
  clientScore: number | null;
  clientLevel: string | null;
  serviceCenter: string | null;
  photoUrl: string | null;
  phone: string | null;
  email: string | null;
  technicianStatus: TechnicianStatus;
  /** Format YYYY-MM */
  period: string;
  cardNumber: string | null;
  cardStatus: CardStatus;
  expiryDate: string | null;
}

const text = (value: unknown): string => (value === undefined || value === null ? '' : String(value).trim());
const optionalText = (value: unknown): string | null => text(value) || null;

/** Hanya URL http(s) yang diterima sebagai foto; skema lain (javascript:, data:) diabaikan. */
function safePhotoUrl(value: unknown): string | null {
  const url = text(value);
  return /^https?:\/\//i.test(url) ? url : null;
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Baris yang seluruh selnya kosong (sering muncul di bagian bawah file Excel). */
export function isBlankRow(row: ExcelRow): boolean {
  return !Object.values(row).some((value) => text(value) !== '');
}

/**
 * Mengubah satu baris Excel menjadi data terstruktur.
 * Fungsi murni: tidak menyentuh database, melempar Error bila kolom wajib kosong.
 */
export function parseExcelRow(row: ExcelRow): ParsedExcelRow {
  const technicianName = text(getRowValue(row, [...COL.technicianName]));
  const branch = text(getRowValue(row, [...COL.branch]));

  if (!technicianName || !branch) {
    const missing = [];
    if (!technicianName) missing.push('Technician Full Names / Nama');
    if (!branch) missing.push('Branch / Cabang');
    throw new Error(`Kolom wajib tidak lengkap: ${missing.join(', ')}`);
  }

  const clientScoreRaw = getRowValue(row, [...COL.clientScore]);
  const clientLevelRaw = getRowValue(row, [...COL.clientLevel]);

  const yearRaw = getRowValue(row, [...COL.year]);
  const monthRaw = getRowValue(row, [...COL.month]);
  const period =
    parseMonthNameToPeriod(yearRaw, monthRaw) ||
    parseExcelPeriod(monthRaw) ||
    parseExcelPeriod(yearRaw) ||
    currentPeriod();

  return {
    technicianName,
    branch,
    technicianId: text(getRowValue(row, [...COL.technicianId])),
    employeeNumber: text(getRowValue(row, [...COL.employeeNumber])),
    indicators: {
      tat: parseExcelNumber(getRowValue(row, [...COL.tat])),
      rtat: parseExcelNumber(getRowValue(row, [...COL.rtat])),
      csat: parseExcelNumber(getRowValue(row, [...COL.csat])),
      grooming_score: parseExcelNumber(getRowValue(row, [...COL.grooming])),
      service_score: parseExcelNumber(getRowValue(row, [...COL.service])),
      repair_quality_score: parseExcelNumber(getRowValue(row, [...COL.repairQuality])),
    },
    clientScore: text(clientScoreRaw) !== '' ? parseExcelNumber(clientScoreRaw) : null,
    clientLevel: clientLevelRaw ? String(clientLevelRaw) : null,
    serviceCenter: optionalText(getRowValue(row, [...COL.serviceCenter])),
    photoUrl: safePhotoUrl(getRowValue(row, [...COL.photoUrl])),
    phone: optionalText(getRowValue(row, [...COL.phone])),
    email: optionalText(getRowValue(row, [...COL.email])),
    technicianStatus: mapStatus(getRowValue(row, [...COL.activeStatus])),
    period,
    cardNumber: optionalText(getRowValue(row, [...COL.cardNumber])),
    cardStatus: mapCardStatus(getRowValue(row, [...COL.cardStatus])),
    expiryDate: parseExcelDate(getRowValue(row, [...COL.expiryDate])),
  };
}
