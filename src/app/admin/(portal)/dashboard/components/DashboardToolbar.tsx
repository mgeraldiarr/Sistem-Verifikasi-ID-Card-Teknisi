// src/app/admin/(portal)/dashboard/components/DashboardToolbar.tsx
'use client';

import React from 'react';
import { FileDown, FileUp, Loader2, Plus } from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { downloadMasterTemplateExcel } from '@/lib/template-generator';

interface DashboardToolbarProps {
  /** Konteks data yang sedang tampil, misal "DSC Bandung · YTD 2026" */
  subtitle: React.ReactNode;
  uploadingExcel: boolean;
  onExcelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddTechnician: () => void;
  onDownloadTemplate?: () => void;
}

/** Judul halaman dashboard beserta aksi utama: template, upload Excel, tambah teknisi. */
export const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  subtitle,
  uploadingExcel,
  onExcelUpload,
  onAddTechnician,
  onDownloadTemplate,
}) => (
  <PageHeading
    title="Daftar teknisi"
    subtitle={subtitle}
    actions={
      <>
        <button
          type="button"
          onClick={() => (onDownloadTemplate ? onDownloadTemplate() : downloadMasterTemplateExcel())}
          className="btn btn-secondary"
          title="Unduh template Excel evaluasi teknisi, terisi teknisi yang sedang tampil"
        >
          <FileDown size={16} />
          <span>Template</span>
        </button>

        <label
          htmlFor="excel-file-input"
          className="btn btn-secondary"
          aria-disabled={uploadingExcel}
          style={uploadingExcel ? { opacity: 0.6, cursor: 'progress' } : undefined}
        >
          {uploadingExcel ? <Loader2 size={16} className="spin" /> : <FileUp size={16} />}
          <span>{uploadingExcel ? 'Memproses…' : 'Upload Excel'}</span>
          <input
            id="excel-file-input"
            name="excel_file_input"
            type="file"
            accept=".xlsx, .xls"
            onChange={onExcelUpload}
            disabled={uploadingExcel}
            className="sr-only"
          />
        </label>

        <button type="button" onClick={onAddTechnician} className="btn btn-primary">
          <Plus size={16} />
          <span>Tambah teknisi</span>
        </button>
      </>
    }
  />
);
