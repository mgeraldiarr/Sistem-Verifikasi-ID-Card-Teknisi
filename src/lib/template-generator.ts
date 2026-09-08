// src/lib/template-generator.ts
import * as XLSX from 'xlsx';

export function downloadMasterTemplateExcel() {
  // 1. Data Sheet Template Evaluasi (12 Kolom Standar)
  const templateData = [
    {
      Year: 2026,
      Month: 'Jan',
      Branch: 'Bali',
      'Technician Full Names': 'I Wayan Sudira',
      TAT: 90,
      RTAT: 85,
      CSAT: 95,
      Penampilan: 90,
      Pelayanan: 92,
      'Hasil Perbaikan': 88,
      'Technician Level': 90.5,
      Status: 'Advance',
    },
    {
      Year: 2026,
      Month: 'Jan',
      Branch: 'Jakarta Selatan',
      'Technician Full Names': 'Bambang Pamungkas',
      TAT: 80,
      RTAT: 75,
      CSAT: 85,
      Penampilan: 80,
      Pelayanan: 80,
      'Hasil Perbaikan': 78,
      'Technician Level': '', // Dikosongkan -> Sistem otomatis menghitung skor total
      Status: '', // Dikosongkan -> Sistem otomatis menetapkan level (Intermediate)
    },
    {
      Year: 2026,
      Month: 'Jan',
      Branch: 'Surabaya',
      'Technician Full Names': 'Dimas Pratama',
      TAT: 65,
      RTAT: 60,
      CSAT: 70,
      Penampilan: 70,
      Pelayanan: 65,
      'Hasil Perbaikan': 60,
      'Technician Level': '', // Dikosongkan -> Otomatis dihitung
      Status: '', // Dikosongkan -> Otomatis Beginner (< 70)
    },
  ];

  // 2. Data Sheet Panduan Pengisian
  const guideData = [
    {
      No: 1,
      'Nama Kolom': 'Year',
      Wajib: 'Ya',
      Keterangan: 'Tahun periode evaluasi (contoh: 2026).',
    },
    {
      No: 2,
      'Nama Kolom': 'Month',
      Wajib: 'Ya',
      Keterangan: 'Bulan periode (contoh: Jan, Feb, Mar, s/d Des).',
    },
    {
      No: 3,
      'Nama Kolom': 'Branch',
      Wajib: 'Ya',
      Keterangan: 'Nama cabang DSC MODENA (contoh: Bali, Jakarta Selatan, Surabaya, Medan, dll).',
    },
    {
      No: 4,
      'Nama Kolom': 'Technician Full Names',
      Wajib: 'Ya',
      Keterangan: 'Nama lengkap teknisi resmi MODENA.',
    },
    {
      No: 5,
      'Nama Kolom': 'TAT',
      Wajib: 'Ya',
      Keterangan: 'Turn Around Time (Bobot 20%, skala 0–100).',
    },
    {
      No: 6,
      'Nama Kolom': 'RTAT',
      Wajib: 'Ya',
      Keterangan: 'Repeat Turn Around Time (Bobot 15%, skala 0–100).',
    },
    {
      No: 7,
      'Nama Kolom': 'CSAT',
      Wajib: 'Ya',
      Keterangan: 'Customer Satisfaction (Bobot 25%, skala 0–100 atau 0–10).',
    },
    {
      No: 8,
      'Nama Kolom': 'Penampilan',
      Wajib: 'Ya',
      Keterangan: 'Skor Grooming/Kerapian teknisi (Bobot 10%, skala 0–100).',
    },
    {
      No: 9,
      'Nama Kolom': 'Pelayanan',
      Wajib: 'Ya',
      Keterangan: 'Skor Pelayanan teknisi ke konsumen (Bobot 15%, skala 0–100).',
    },
    {
      No: 10,
      'Nama Kolom': 'Hasil Perbaikan',
      Wajib: 'Ya',
      Keterangan: 'Skor Kualitas Perbaikan unit (Bobot 15%, skala 0–100).',
    },
    {
      No: 11,
      'Nama Kolom': 'Technician Level',
      Wajib: 'Opsional',
      Keterangan:
        'Skor Total KPI (0–100). Jika diisi, sistem memprioritaskan skor klien. Jika kosong, sistem menghitung otomatis dari 6 indikator di atas.',
    },
    {
      No: 12,
      'Nama Kolom': 'Status',
      Wajib: 'Opsional',
      Keterangan:
        'Kategori Level: Beginner (< 70), Intermediate (70–84), Advance (>= 85). Jika kosong, sistem otomatis menetapkan berdasarkan skor.',
    },
  ];

  // 3. Konversi ke Worksheet
  const wsTemplate = XLSX.utils.json_to_sheet(templateData);
  const wsGuide = XLSX.utils.json_to_sheet(guideData);

  // Lebar Kolom Estetik & Rapi
  wsTemplate['!cols'] = [
    { wch: 8 }, // Year
    { wch: 10 }, // Month
    { wch: 20 }, // Branch
    { wch: 28 }, // Technician Full Names
    { wch: 10 }, // TAT
    { wch: 10 }, // RTAT
    { wch: 10 }, // CSAT
    { wch: 14 }, // Penampilan
    { wch: 12 }, // Pelayanan
    { wch: 16 }, // Hasil Perbaikan
    { wch: 18 }, // Technician Level
    { wch: 16 }, // Status
  ];

  wsGuide['!cols'] = [
    { wch: 6 }, // No
    { wch: 24 }, // Nama Kolom
    { wch: 12 }, // Wajib
    { wch: 65 }, // Keterangan
  ];

  // 4. Bangun Workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Evaluasi');
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Panduan_Pengisian');

  // 5. Trigger download file di browser
  XLSX.writeFile(wb, 'Template_Evaluasi_Teknisi_MODENA.xlsx');
}
