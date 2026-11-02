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
