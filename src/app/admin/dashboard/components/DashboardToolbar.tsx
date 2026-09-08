// src/app/admin/dashboard/components/DashboardToolbar.tsx
'use client';

import React from 'react';
import { Calendar, FileSpreadsheet, Loader2, Plus } from 'lucide-react';
import { downloadMasterTemplateExcel } from '@/lib/template-generator';

interface DashboardToolbarProps {
  uploadingExcel: boolean;
  onExcelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddTechnician: () => void;
  onDownloadTemplate?: () => void;
}

export const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  uploadingExcel,
  onExcelUpload,
  onAddTechnician,
  onDownloadTemplate,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
        }}
      >
        Daftar Teknisi
      </h2>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onDownloadTemplate || downloadMasterTemplateExcel}
          className="modena-btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderRadius: '4px',
            padding: '10px 16px',
            fontSize: '0.825rem',
            cursor: 'pointer',
          }}
          title="Download Master Template Excel 12 Kolom Evaluasi Teknisi MODENA"
        >
          <FileSpreadsheet size={16} color="var(--accent-red)" />
          <span>Download Template</span>
        </button>

        <label
          htmlFor="excel-file-input"
          className="modena-btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderRadius: '4px',
            padding: '10px 18px',
            fontSize: '0.825rem',
            cursor: 'pointer',
          }}
        >
          {uploadingExcel ? (
            <>
              <Loader2 size={16} className="animate-spin-custom" /> Memproses...
            </>
          ) : (
            <>
              <Calendar size={16} /> Upload Excel
            </>
          )}
          <input
            id="excel-file-input"
            name="excel_file_input"
            type="file"
            accept=".xlsx, .xls"
            onChange={onExcelUpload}
            disabled={uploadingExcel}
            style={{ display: 'none' }}
          />
        </label>
        <button
          onClick={onAddTechnician}
          className="modena-btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderRadius: '4px',
            padding: '10px 18px',
            fontSize: '0.825rem',
          }}
        >
          <Plus size={16} /> Tambah Teknisi
        </button>
      </div>
    </div>
  );
};
