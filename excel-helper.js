// excel-helper.js
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Tentukan path file di folder root proyek
const projectRoot = __dirname;
const excelFilePath = path.join(projectRoot, 'data_teknisi.xlsx');
const envPath = path.join(projectRoot, '.env.local');

// Ambil argument terminal
const args = process.argv.slice(2);
const isGenerate = args.includes('--generate');
const isSync = args.includes('--sync');

if (!isGenerate && !isSync) {
  console.log('Panduan Penggunaan:');
  console.log('  node excel-helper.js --generate   => Membuat file data_teknisi.xlsx contoh');
  console.log('  node excel-helper.js --sync       => Membaca data_teknisi.xlsx dan mengirim ke website');
  process.exit(0);
}

// ==========================================
// 1. GENERATE EXCEL FILE (--generate)
// ==========================================
if (isGenerate) {
  console.log('Membuat contoh file Excel: data_teknisi.xlsx...');

  // Data baris awal
  const sampleData = [
    {
      technician_id: "MOD-T001",
      employee_number: "20260001",
      technician_name: "Budi Santoso",
      branch: "Jakarta",
      service_center: "SC Jakarta Selatan",
      phone: "081234567890",
      email: "budi.santoso@modena.com",
      technician_status: "active",
      technician_level: "intermediate",
      period: "2026-08",
      kpi_score: 98.0,
      csi_score: 9.2,
      performance_score: 98.5,
      performance_level: "intermediate",
      card_number: "CARD-T001",
      card_status: "active",
      expiry_date: "2028-08-13"
    },
    {
      technician_id: "MOD-T002",
      employee_number: "20260002",
      technician_name: "Ahmad Rifai",
      branch: "Bandung",
      service_center: "SC Bandung Kota",
      phone: "089876543210",
      email: "ahmad.rifai@modena.com",
      technician_status: "active",
      technician_level: "beginner",
      period: "2026-08",
      kpi_score: 75.0,
      csi_score: 8.0,
      performance_score: 76.5,
      performance_level: "beginner",
      card_number: "CARD-T002",
      card_status: "active",
      expiry_date: "2028-08-13"
    },
    {
      technician_id: "MOD-T003",
      employee_number: "20260003",
      technician_name: "Denny Wijaya",
      branch: "Surabaya",
      service_center: "SC Surabaya Rungkut",
      phone: "081122334455",
      email: "denny.wijaya@modena.com",
      technician_status: "active",
      technician_level: "advance",
      period: "2026-08",
      kpi_score: 95.0,
      csi_score: 9.8,
      performance_score: 96.0,
      performance_level: "advance",
      card_number: "CARD-T003",
      card_status: "active",
      expiry_date: "2028-08-13"
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  XLSX.writeFile(workbook, excelFilePath);
  console.log(`\nSukses! File Excel berhasil dibuat di: \n  ${excelFilePath}\n`);
  console.log('Silakan buka file tersebut di Excel, edit datanya (misal ganti KPI atau tambah baris baru), lalu simpan.');
  console.log('Setelah selesai diedit, jalankan perintah berikut untuk mensinkronkan:');
  console.log('  node excel-helper.js --sync');
  process.exit(0);
}

// ==========================================
// 2. READ AND SYNC EXCEL FILE (--sync)
// ==========================================
if (isSync) {
  // A. Cek keberadaan file Excel
  if (!fs.existsSync(excelFilePath)) {
    console.error(`Error: File Excel tidak ditemukan di ${excelFilePath}.`);
    console.error('Silakan jalankan perintah berikut dulu untuk membuat file contoh:');
    console.error('  node excel-helper.js --generate');
    process.exit(1);
  }

  // B. Baca token dari .env.local
  let secretToken = '';
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const tokenLine = envContent.split('\n').find(line => line.startsWith('SYNC_SECRET_TOKEN='));
    if (tokenLine) {
      secretToken = tokenLine.split('=')[1].trim();
    }
  } catch (err) {
    console.error('Gagal membaca .env.local. Pastikan Anda berada di folder utama proyek saat menjalankan perintah ini.', err.message);
    process.exit(1);
  }

  if (!secretToken) {
    console.error('Error: SYNC_SECRET_TOKEN tidak ditemukan di file .env.local.');
    process.exit(1);
  }

  console.log(`Membaca file: ${excelFilePath}...`);

  // C. Parse file Excel ke JSON
  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Ambil data dalam format JSON array
  let excelData = XLSX.utils.sheet_to_json(worksheet);

  if (excelData.length === 0) {
    console.error('Error: File Excel kosong atau tidak memiliki baris data.');
    process.exit(1);
  }

  // Bersihkan data (pastikan tipe data angka dan string rapi)
  excelData = excelData.map(row => {
    return {
      technician_id: String(row.technician_id || '').trim(),
      employee_number: String(row.employee_number || '').trim(),
      technician_name: String(row.technician_name || '').trim(),
      branch: String(row.branch || '').trim(),
      service_center: row.service_center ? String(row.service_center).trim() : undefined,
      phone: row.phone ? String(row.phone).trim() : undefined,
      email: row.email ? String(row.email).trim() : undefined,
      technician_status: String(row.technician_status || 'active').toLowerCase().trim(),
      technician_level: String(row.technician_level || 'beginner').toLowerCase().trim(),
      period: String(row.period || '').trim(),
      kpi_score: row.kpi_score ? Number(row.kpi_score) : 0,
      csi_score: row.csi_score ? Number(row.csi_score) : 0,
      performance_score: row.performance_score ? Number(row.performance_score) : 0,
      performance_level: String(row.performance_level || row.technician_level || 'beginner').toLowerCase().trim(),
      card_number: row.card_number ? String(row.card_number).trim() : undefined,
      card_status: row.card_status ? String(row.card_status).toLowerCase().trim() : undefined,
      expiry_date: row.expiry_date ? String(row.expiry_date).trim() : undefined,
    };
  });

  console.log(`Berhasil membaca ${excelData.length} baris dari Excel.`);
  console.log('Mengirimkan data ke http://localhost:3000/api/sync...\n');

  // D. Kirim request ke local API
  fetch('http://localhost:3000/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secretToken}`
    },
    body: JSON.stringify(excelData)
  })
  .then(async response => {
    const result = await response.json();
    console.log('--- HASIL SINKRONISASI EXCEL ---');
    console.log(`Status HTTP: ${response.status}`);
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(err => {
    console.error('Gagal menghubungi server lokal. Pastikan server lokal Anda menyala (npm run dev).', err.message);
  });
}
