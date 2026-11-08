-- =========================================================================
-- Migration: Monitoring Grooming Mingguan Teknisi After Sales MODENA
-- Date: 2026-11-08 (Updated with RLS type-cast fix)
-- =========================================================================

-- 1. TABEL technician_grooming_reports
CREATE TABLE IF NOT EXISTS public.technician_grooming_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id VARCHAR(50) NOT NULL,
    technician_name VARCHAR(150) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    service_type VARCHAR(20) NOT NULL DEFAULT 'DSC',
    period_week VARCHAR(20) NOT NULL, -- Format ISO 8601: "YYYY-Www" (misal: "2026-W45")
    submission_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_monday BOOLEAN NOT NULL DEFAULT false,
    uniform_checked BOOLEAN NOT NULL DEFAULT true,
    pants_checked BOOLEAN NOT NULL DEFAULT true,
    hair_checked BOOLEAN NOT NULL DEFAULT true,
    face_checked BOOLEAN NOT NULL DEFAULT true,
    photo_full_url TEXT NOT NULL,
    photo_face_url TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. INDEX & UNIQUE CONSTRAINT
-- Memastikan 1 teknisi hanya memiliki 1 laporan valid per minggu
CREATE UNIQUE INDEX IF NOT EXISTS idx_grooming_tech_period 
    ON public.technician_grooming_reports(technician_id, period_week);

CREATE INDEX IF NOT EXISTS idx_grooming_period_branch 
    ON public.technician_grooming_reports(period_week, branch);

CREATE INDEX IF NOT EXISTS idx_grooming_status 
    ON public.technician_grooming_reports(status);

CREATE INDEX IF NOT EXISTS idx_grooming_created_at 
    ON public.technician_grooming_reports(created_at DESC);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.technician_grooming_reports ENABLE ROW LEVEL SECURITY;

-- Bersihkan policy lama agar script aman dijalankan berulang kali
DROP POLICY IF EXISTS "super_admin_manage_grooming" ON public.technician_grooming_reports;
DROP POLICY IF EXISTS "branch_admin_manage_grooming" ON public.technician_grooming_reports;
DROP POLICY IF EXISTS "technician_view_own_grooming" ON public.technician_grooming_reports;
DROP POLICY IF EXISTS "technician_insert_own_grooming" ON public.technician_grooming_reports;

-- Super Admin: Akses penuh baca & review
CREATE POLICY "super_admin_manage_grooming"
    ON public.technician_grooming_reports
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
        )
    );

-- Admin Cabang: Baca & review laporan khusus cabangnya
CREATE POLICY "branch_admin_manage_grooming"
    ON public.technician_grooming_reports
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() 
              AND role = 'branch_admin' 
              AND is_active = true
              AND branch = technician_grooming_reports.branch
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() 
              AND role = 'branch_admin' 
              AND is_active = true
              AND branch = technician_grooming_reports.branch
        )
    );

-- Teknisi: Membaca laporan miliknya sendiri
-- Catatan: user_profiles.technician_id bertipe UUID yang mereferensikan baris technicians.id,
-- sedangkan technician_grooming_reports.technician_id bertipe VARCHAR(50) (ID string seperti DSC-JKT-001).
-- Kita join ke tabel technicians agar tipe perbandingannya cocok (UUID = UUID dan VARCHAR = VARCHAR).
CREATE POLICY "technician_view_own_grooming"
    ON public.technician_grooming_reports
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles p
            JOIN public.technicians t ON t.id = p.technician_id
            WHERE p.id = auth.uid() 
              AND p.role = 'technician' 
              AND p.is_active = true
              AND t.technician_id = technician_grooming_reports.technician_id
        )
    );

-- Teknisi: Mengirimkan laporan miliknya sendiri
CREATE POLICY "technician_insert_own_grooming"
    ON public.technician_grooming_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles p
            JOIN public.technicians t ON t.id = p.technician_id
            WHERE p.id = auth.uid() 
              AND p.role = 'technician' 
              AND p.is_active = true
              AND t.technician_id = technician_grooming_reports.technician_id
        )
    );

-- =========================================================================
-- 4. SUPABASE STORAGE (BUCKET & POLICIES)
-- =========================================================================
-- Memastikan bucket 'employee-photos' ada dan dapat dibaca publik
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-photos', 'employee-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Izin upload (INSERT) bagi user yang login (authenticated) ke bucket employee-photos
DROP POLICY IF EXISTS "authenticated_upload_employee_photos" ON storage.objects;
CREATE POLICY "authenticated_upload_employee_photos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'employee-photos');

-- Izin membaca file publik
DROP POLICY IF EXISTS "public_read_employee_photos" ON storage.objects;
CREATE POLICY "public_read_employee_photos"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'employee-photos');

-- Izin update bagi user yang login
DROP POLICY IF EXISTS "authenticated_update_employee_photos" ON storage.objects;
CREATE POLICY "authenticated_update_employee_photos"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'employee-photos');
