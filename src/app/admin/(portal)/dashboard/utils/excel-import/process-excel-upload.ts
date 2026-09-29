// src/app/admin/(portal)/dashboard/utils/excel-import/process-excel-upload.ts
import * as XLSX from 'xlsx';
import { SupabaseClient } from '@supabase/supabase-js';
import { getErrorMessage } from '@/lib/errors';
import { KpiWeights } from '@/lib/kpi';
import { ExcelUploadResult, SyncErrorDetail } from '@/types';
import { createTechnicianIdAllocator, importTechnicianRow } from './import-technician-row';
import { ExcelRow, isBlankRow, parseExcelRow } from './parse-excel-row';

/** Batas ukuran file; juga membatasi dampak celah parser `xlsx` terhadap file jahat. */
const MAX_EXCEL_BYTES = 5 * 1024 * 1024;

interface ProcessExcelUploadOptions {
  file: File;
  supabase: SupabaseClient;
  /**
   * Isolasi data cabang: bila diisi (Admin Cabang), hanya baris Excel milik cabang
   * tersebut yang diproses. Baris cabang lain ditolak agar tidak mengotori cabang lain.
   * null/undefined = akses nasional (Super Admin).
   */
  restrictBranch?: string | null;
  /** Bobot KPI aktif dari pengaturan sistem; kosong = bobot tersimpan lokal / bawaan */
  kpiWeights?: KpiWeights;
}

async function readRows(file: File): Promise<ExcelRow[]> {
  if (file.size > MAX_EXCEL_BYTES) {
    throw new Error('Ukuran file Excel melebihi batas maksimal 5MB.');
  }

  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = sheet ? (XLSX.utils.sheet_to_json(sheet) as ExcelRow[]) : [];

  if (rows.length === 0) throw new Error('File Excel kosong atau tidak memiliki data.');

  const activeRows = rows.filter((row) => !isBlankRow(row));
  if (activeRows.length === 0) throw new Error('Tidak ada data baris yang valid di file Excel.');
  return activeRows;
}

/**
 * Mengimpor file Excel teknisi baris per baris. Baris yang gagal dicatat dan
 * dilewati (tidak membatalkan baris lain), lalu hasilnya ditulis ke `sync_logs`.
 */
export async function processExcelUpload({
  file,
  supabase,
  restrictBranch = null,
  kpiWeights,
}: ProcessExcelUploadOptions): Promise<ExcelUploadResult> {
  const startTime = new Date().toISOString();
  const rows = await readRows(file);

  const context = {
    supabase,
    restrictBranch,
    kpiWeights,
    idAllocator: createTechnicianIdAllocator(supabase),
  };

  let insertCount = 0;
  let updateCount = 0;
  const errorDetails: SyncErrorDetail[] = [];

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    try {
      const outcome = await importTechnicianRow(parseExcelRow(row), context);
      if (outcome === 'insert') insertCount++;
      else updateCount++;
    } catch (err) {
      errorDetails.push({
        row: idx + 1,
        technician_id: String(row['Technician Full Names'] || row.technician_id || 'UNKNOWN'),
        error: getErrorMessage(err, 'Error tidak dikenal saat menyimpan.'),
      });
    }
  }

  const successCount = insertCount + updateCount;
  const status =
    errorDetails.length === 0 ? 'success' : successCount === 0 ? 'failed' : 'partial';

  const syncLog = {
    start_time: startTime,
    end_time: new Date().toISOString(),
    status,
    total_records: rows.length,
    processed_records: successCount,
    new_records: insertCount,
    updated_records: updateCount,
    error_count: errorDetails.length,
    error_details: errorDetails,
  };

  const { error: logError } = await supabase
    .from('sync_logs')
    .insert({ ...syncLog, branch: restrictBranch });

  // Database lama tanpa kolom `branch` di sync_logs
  if (logError?.message?.includes('schema cache') || logError?.message?.includes('does not exist')) {
    await supabase.from('sync_logs').insert(syncLog);
  }

  return { status, totalRows: rows.length, successCount, insertCount, updateCount, errorDetails };
}
