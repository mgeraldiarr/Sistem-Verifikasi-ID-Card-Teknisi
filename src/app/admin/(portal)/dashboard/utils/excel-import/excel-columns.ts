// src/app/admin/(portal)/dashboard/utils/excel-import/excel-columns.ts

/**
 * Nama-nama header yang dikenali untuk setiap kolom Excel.
 * Mendukung template 12 kolom standar MODENA maupun format lama (legacy).
 * Pencocokan tidak peka huruf besar/kecil (lihat `getRowValue`).
 */
export const COLUMN_ALIASES = {
  technicianName: [
    'technician full names',
    'technician full name',
    'technician_name',
    'nama_teknisi',
    'nama teknisi',
    'nama',
    'nama_lengkap',
    'nama lengkap',
  ],
  branch: ['branch', 'cabang', 'wilayah'],
  technicianId: ['technician_id', 'id_teknisi', 'id teknisi', 'id'],
  employeeNumber: [
    'employee_number',
    'no_karyawan',
    'no karyawan',
    'nik',
    'nomor_karyawan',
    'nomor karyawan',
  ],

  // 6 indikator evaluasi
  tat: ['tat', 'turn around time', 'turn_around_time'],
  rtat: ['rtat', 'repeat turn around time', 'repeat_turn_around_time'],
  csat: ['csat', 'customer satisfaction', 'customer_satisfaction', 'csi', 'csi_score'],
  grooming: ['penampilan', 'grooming', 'grooming_score', 'skor penampilan', 'skor_penampilan'],
  service: ['pelayanan', 'service', 'service_score', 'skor pelayanan', 'skor_pelayanan'],
  repairQuality: [
    'hasil perbaikan',
    'hasil_perbaikan',
    'repair quality',
    'repair_quality',
    'kualitas perbaikan',
    'kualitas_perbaikan',
  ],

  // Kolom 11 & 12: skor & level dari klien (opsional, menimpa hasil hitung otomatis)
  clientScore: [
    'technician level',
    'technician_level',
    'skor kpi',
    'skor_kpi',
    'kpi',
    'kpi_score',
    'skor total',
    'skor_total',
    'total score',
    'performance_score',
  ],
  clientLevel: [
    'status',
    'level',
    'level teknisi',
    'level_teknisi',
    'status level',
    'performance_level',
  ],

  // Profil tambahan
  serviceCenter: ['service_center', 'service center', 'lokasi', 'lokasi_service'],
  photoUrl: ['photo_url', 'photo', 'foto', 'foto_url', 'link_foto'],
  phone: ['phone', 'no_hp', 'no hp', 'telepon', 'kontak'],
  email: ['email', 'surel'],
  activeStatus: ['technician_status', 'status_keaktifan', 'status keaktifan', 'keaktifan'],

  // Periode
  year: ['year', 'tahun'],
  month: ['month', 'bulan', 'periode', 'period'],

  // Kartu ID
  cardNumber: [
    'card_number',
    'no_kartu',
    'no kartu',
    'nomor kartu',
    'nomor_kartu',
    'serial_number',
  ],
  cardStatus: ['card_status', 'status_kartu', 'status kartu'],
  expiryDate: [
    'expiry_date',
    'tanggal_kadaluarsa',
    'tanggal kadaluarsa',
    'expired',
    'masa berlaku',
  ],
} as const;
