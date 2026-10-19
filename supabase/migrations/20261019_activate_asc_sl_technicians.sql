-- Migration: Aktivasi Teknisi Lingkup ASC & SL
-- Date: 2026-10-19
-- Description:
--   Teknisi kini dapat berlingkup DSC, ASC, atau SL. Lingkup menentukan prefiks ID teknisi
--   (DSC-BAL-001 / ASC-BAL-001 / SL-BAL-001) dan label band pada ID card.
--   Aman dijalankan ulang; kolom sudah dibuat oleh 20260907_add_service_type_scope.sql.

ALTER TABLE public.technicians
ADD COLUMN IF NOT EXISTS service_type VARCHAR(10) DEFAULT 'DSC' NOT NULL
CONSTRAINT chk_service_type CHECK (service_type IN ('DSC', 'ASC', 'SL'));

CREATE INDEX IF NOT EXISTS idx_technicians_service_type ON public.technicians(service_type);

COMMENT ON COLUMN public.technicians.service_type IS
    'Lingkup Layanan: DSC (Direct Service Center), ASC (Authorized Service Center), SL (Service Local). Sama dengan prefiks technician_id.';
