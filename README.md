# 🪪 Sistem Verifikasi ID Card Karyawan (MODENA Style)

Aplikasi berbasis web untuk mengelola, mencetak, dan memverifikasi ID Card Karyawan secara digital menggunakan Next.js dan Supabase. Sistem dilengkapi dengan QR Code dinamis yang dapat di-scan secara real-time untuk memvalidasi status keaktifan karyawan.

---

## ✨ Fitur Utama

1. **Dashboard Admin Portal HR**:
   * **CRUD Karyawan**: Tambah, edit, hapus data karyawan (Nama, Jabatan, Cabang, Kode Karyawan, Foto Profil).
   * **Manajemen Status**: Mengaktifkan atau memblokir akses ID Card karyawan secara instan.
   * **Cetak ID Card**: Layout cetak standar kartu nama fisik CR80 (dua sisi: Depan & Belakang) yang siap dicetak ke printer ID Card.
   * **Custom Logout Modal**: Sistem konfirmasi keluar dari dashboard dengan tampilan modal premium yang aman.

2. **Scanner QR Code (`/scan`)**:
   * Pemindai QR Code bawaan (*built-in*) menggunakan kamera perangkat secara real-time.
   * Dilengkapi navigasi header minimalis untuk kembali ke Dashboard Admin.
   * Validasi instan keaslian QR Code ID Card.

3. **Verifikasi Digital Karyawan (`/verify/[id]`)**:
   * Halaman validasi publik yang menampilkan status keaktifan karyawan ("AKTIF" atau "TIDAK AKTIF / DIBLOKIR").
   * Kunci keamanan digital dengan pencatatan waktu verifikasi yang presisi (WIB).

---

## 🛠️ Teknologi yang Digunakan

* **Frontend**: Next.js 15 (App Router, TypeScript, React)
* **Styling**: Vanilla CSS (desain kustom bertema MODENA Premium)
* **Database & Storage**: Supabase (Database Postgres & Storage Bucket)
* **Pustaka Pendukung**:
  * `lucide-react` (Koleksi Ikon Premium)
  * `html5-qrcode` (Scanner Kamera)
  * `qrcode.react` (Generator QR Code)

---

## 🚀 Panduan Memulai & Cara Menjalankan

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di komputer lokal Anda.

### 1. Prasyarat
Pastikan Anda sudah menginstal:
* **Node.js** (versi 18.x atau yang terbaru)
* **NPM** (bawaan Node.js) atau alternatif seperti **Yarn** / **PNPM**

### 2. Kloning Repositori
Kloning proyek ini dari GitHub ke lokal Anda:
```bash
git clone https://github.com/mgeraldiarr/Sistem-Verifikasi-ID-Card-Karyawan.git
cd Sistem-Verifikasi-ID-Card-Karyawan
```

### 3. Instal Dependensi
Jalankan perintah berikut di terminal untuk menginstal semua library yang dibutuhkan:
```bash
npm install
```

### 4. Konfigurasi Environment Variables (`.env.local`)
Buat file baru bernama `.env.local` di direktori utama proyek Anda, lalu isi dengan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Setup Database & Storage di Supabase

Untuk menjalankan aplikasi ini dengan benar, Anda harus mengonfigurasi database dan storage di akun Supabase Anda:

#### A. Skema Tabel Database (`employees`)
Buat tabel baru bernama `employees` dengan kolom sebagai berikut:
```sql
create table public.employees (
  id uuid default gen_random_uuid() primary key,
  employee_code text unique not null,
  full_name text not null,
  branch_name text not null,
  position text not null,
  photo_url text,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### B. Setup Storage Bucket
1. Masuk ke dashboard Supabase Anda -> **Storage**.
2. Buat bucket baru bernama **`employee-photos`**.
3. Pastikan Anda mengubah pengaturan bucket tersebut menjadi **Public** agar foto karyawan dapat diakses dan ditampilkan di kartu nama.

---

## 💻 Cara Menjalankan Server Development

Setelah semua konfigurasi selesai, jalankan server pengembangan lokal dengan perintah:
```bash
npm run dev
```

Buka browser Anda dan akses halaman di:
* **Halaman Utama / Login Admin**: `http://localhost:3000` (atau ke `/admin/login`)
* **Dashboard Admin**: `http://localhost:3000/admin/dashboard`
* **Scanner**: `http://localhost:3000/scan`

---

## 📦 Build untuk Produksi
Untuk melakukan build aplikasi siap rilis, gunakan perintah:
```bash
npm run build
npm run start
```
