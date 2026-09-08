-- Migration: Tambah Kolom service_type untuk Lingkup Layanan (DSC, ASC, SL)
-- Date: 2026-09-07
-- Description: Menambahkan kolom service_type dengan default 'DSC' agar kompatibel dengan arsitektur multi-scope layanan MODENA.

ALTER TABLE technicians 
ADD COLUMN IF NOT EXISTS service_type VARCHAR(10) DEFAULT 'DSC' NOT NULL
CONSTRAINT chk_service_type CHECK (service_type IN ('DSC', 'ASC', 'SL'));

-- Berikan komentar deskriptif pada kolom untuk dokumentasi schema database
COMMENT ON COLUMN technicians.service_type IS 'Lingkup Layanan: DSC (Direct Service Center - Active), ASC (Authorized Service Center - Coming Soon), SL (Service Local - Coming Soon)';
