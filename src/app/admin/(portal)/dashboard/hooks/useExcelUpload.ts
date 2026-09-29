// src/app/admin/(portal)/dashboard/hooks/useExcelUpload.ts
'use client';

import React, { useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { KpiWeights } from '@/lib/kpi';
import { supabase } from '@/lib/supabase';
import { NotificationType } from '@/types';
import { processExcelUpload } from '../utils/excel-import/process-excel-upload';

const LAST_FILE_KEY = 'last_uploaded_file_name';

function readLastFileName(): string | null {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(LAST_FILE_KEY) : null;
  } catch {
    return null;
  }
}

interface UseExcelUploadOptions {
  scopedBranch: string | null;
  kpiWeights: KpiWeights;
  notify: (type: NotificationType, title: string, message: string) => void;
  onUploaded: () => void;
}

/** Upload & sinkronisasi file Excel teknisi, beserta ringkasan hasilnya. */
export function useExcelUpload({ scopedBranch, kpiWeights, notify, onUploaded }: UseExcelUploadOptions) {
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [lastFileName, setLastFileName] = useState<string | null>(readLastFileName);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingExcel(true);
    try {
      const result = await processExcelUpload({
        file,
        supabase,
        restrictBranch: scopedBranch,
        kpiWeights,
      });

      try {
        localStorage.setItem(LAST_FILE_KEY, file.name);
      } catch {
        // Penyimpanan lokal tidak tersedia (mode privat); cukup tampilkan di sesi ini
      }
      setLastFileName(file.name);

      if (result.status === 'success') {
        notify(
          'success',
          'Sinkronisasi Excel Sukses',
          `File: "${file.name}"\nBerhasil memproses seluruh data: ${result.successCount} teknisi (${result.insertCount} baru, ${result.updateCount} diperbarui).`
        );
      } else {
        const allFailed = result.errorDetails.length === result.totalRows;
        const firstError = result.errorDetails[0];
        notify(
          allFailed ? 'error' : 'warning',
          allFailed ? 'Gagal Sinkronisasi Excel' : 'Sinkronisasi Excel Selesai Sebagian',
          `File: "${file.name}"\nBerhasil: ${result.successCount}, Gagal: ${result.errorDetails.length}.\n\nError pertama (Baris ${firstError?.row || '-'}): ${firstError?.error || 'Tidak diketahui'}`
        );
      }

      onUploaded();
    } catch (err) {
      notify('error', 'Gagal Memproses Excel', getErrorMessage(err));
    } finally {
      setUploadingExcel(false);
      e.target.value = '';
    }
  };

  return { uploadingExcel, lastFileName, handleExcelUpload };
}
