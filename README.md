# 🪪 Sistem Verifikasi ID Card Teknisi (MODENA Style)

Aplikasi berbasis web untuk mengelola, mensinkronisasi data, dan memverifikasi ID Card Teknisi secara digital menggunakan Next.js dan Supabase. Sistem dilengkapi dengan sinkronisasi Excel cerdas (manual & otomatis via Power Automate) dan halaman verifikasi publik bertema MODENA Premium.

---

## ✨ Fitur Utama

1. **Dashboard Admin Portal HR (MODENA Style)**:
   * **Manajemen Teknisi**: Melihat data teknisi (Nama, NIK/No Karyawan, Cabang, Level Sertifikasi, Status Keaktifan).
   * **Sinkronisasi Excel Cerdas**: 
     * Mendukung pengunggahan data manual Excel (bahasa Inggris/Indonesia) dengan toleransi error desimal, pemetaan kolom otomatis, dan penyaringan baris kosong.
     * Integrasi API sinkronisasi otomatis (`/api/sync`) yang dapat dipicu oleh Microsoft Power Automate di OneDrive/SharePoint secara real-time.
     * Menggunakan Supabase Realtime agar layar dashboard langsung ter-update begitu data database berubah tanpa perlu memuat ulang halaman (no-refresh).
   * **Manajemen Status**: Mengaktifkan atau memblokir akses ID Card teknisi secara instan.
   * **Cetak ID Card**: Layout cetak standar kartu nama fisik CR80 (dua sisi: Depan & Belakang) bertema Cream & Charcoal MODENA.

2. **Verifikasi Digital Teknisi (`/verify/[token]`)**:
   * Halaman validasi publik yang diakses oleh konsumen saat memindai QR Code di kartu fisik teknisi.
   * Desain visual disesuaikan dengan kartu fisik (Warna Cream `#ECE8DA`, Charcoal `#1C1C1A`, Merah MODENA `#DA291C`, logo MODENA, level sertifikasi, dan foto profil bulat besar).
   * Menampilkan status validasi real-time seperti **"TEKNISI AKTIF"**, **"TEKNISI NONAKTIF / BLOKIR"**, atau **"KARTU KADALUARSA"** secara aman dengan mem-bypass RLS melalui server-side query.
   * Bebas dari tombol navigasi eksternal untuk menjaga privasi portal admin.

---

## 🛠️ Teknologi yang Digunakan

* **Frontend**: Next.js 16 (App Router, TypeScript, React)
* **Styling**: Vanilla CSS (kustom tema MODENA Premium)
* **Database & Storage**: Supabase (Postgres Database, Realtime replication & Storage Bucket)
* **Pustaka Pendukung**:
   * `lucide-react` (Koleksi Ikon)
   * `xlsx` (Pembaca File Excel di Sisi Klien)
   * `qrcode.react` (Generator QR Code)

---

## 🚀 Panduan Memulai & Cara Menjalankan

### 1. Prasyarat
* **Node.js** (versi 18.x atau yang terbaru)
* **NPM** (bawaan Node.js)

### 2. Kloning Repositori & Instal Dependensi
```bash
git clone https://github.com/mgeraldiarr/Sistem-Verifikasi-ID-Card-Karyawan.git
cd Sistem-Verifikasi-ID-Card-Karyawan
npm install
```

### 3. Konfigurasi Environment Variables (`.env.local`)
Buat file bernama `.env.local` di direktori utama:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SYNC_SECRET_TOKEN=your-random-secure-secret-token
```

### 4. Setup Database di Supabase
Jalankan file skema SQL yang terletak di repositori untuk membuat tabel berikut:
* `technicians` (Data profil teknisi dan token QR unik)
* `technician_performance` (Data KPI, CSI, dan level performa per periode)
* `technician_id_cards` (Nomor kartu seri fisik dan tanggal expired)
* `sync_logs` (Riwayat status sinkronisasi Excel)

---

## 💻 Cara Menjalankan Server Development

Jalankan server pengembangan lokal dengan perintah:
```bash
npm run dev
```

Akses aplikasi di browser Anda:
* **Dashboard Admin / Login HR**: `http://localhost:3000/admin/login` -> diarahkan ke `/admin/dashboard`
* **Halaman Verifikasi Publik**: `http://localhost:3000/verify/[qr_token]` (ganti dengan UUID token QR teknisi)

---

## 📦 Build untuk Produksi
```bash
npm run build
npm run start
```
