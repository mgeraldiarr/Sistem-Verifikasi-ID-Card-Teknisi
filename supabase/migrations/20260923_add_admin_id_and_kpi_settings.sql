-- Migration: Menambahkan admin_id pada user_profiles dan tabel kpi_settings
-- Date: 2026-09-23

-- =========================================================================
-- 1. KOLOM admin_id PADA TABEL user_profiles
-- =========================================================================

-- Tambahkan kolom admin_id unik untuk identitas resmi admin (Super Admin / Branch Admin)
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS admin_id VARCHAR(50) UNIQUE;

-- Buat index pencarian cepat berdasarkan admin_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_admin_id 
    ON public.user_profiles(admin_id);

-- =========================================================================
-- 2. TABEL PENGATURAN BOBOT KPI (kpi_settings)
--    Menyimpan konfigurasi bobot persentase dinamis di tingkat sistem
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.kpi_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    tat_weight NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    rtat_weight NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    csat_weight NUMERIC(5,2) NOT NULL DEFAULT 25.00,
    grooming_weight NUMERIC(5,2) NOT NULL DEFAULT 10.00,
    service_weight NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    repair_quality_weight NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Seed pengaturan default (Total = 100%) jika belum ada
INSERT INTO public.kpi_settings (
    setting_key, 
    tat_weight, 
    rtat_weight, 
    csat_weight, 
    grooming_weight, 
    service_weight, 
    repair_quality_weight
)
VALUES (
    'default_weights', 
    20.00, 
    15.00, 
    25.00, 
    10.00, 
    15.00, 
    15.00
)
ON CONFLICT (setting_key) DO NOTHING;

-- RLS (Row Level Security) untuk kpi_settings
ALTER TABLE public.kpi_settings ENABLE ROW LEVEL SECURITY;

-- Semua pengguna terautentikasi boleh membaca bobot KPI
CREATE POLICY "Authenticated users can read kpi_settings"
    ON public.kpi_settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Hanya Super Admin yang boleh mengubah bobot KPI
CREATE POLICY "Only super_admin can update kpi_settings"
    ON public.kpi_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );
