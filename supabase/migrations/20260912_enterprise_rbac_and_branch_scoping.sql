-- Migration: Enterprise RBAC (3-Tier) & Branch Data Scoping
-- Date: 2026-09-12
-- Description:
--   Menyiapkan arsitektur hak akses berstandar enterprise untuk 3 tingkat pengguna resmi:
--     1. super_admin   -> Akses penuh nasional (seluruh cabang DSC/ASC/SL)
--     2. branch_admin  -> Akses terbatas HANYA pada cabang miliknya (isolasi data cabang)
--     3. technician    -> Akses baca HANYA pada data dirinya sendiri (portal kartu mandiri)
--
--   Migrasi ini menggantikan kebijakan RLS lama yang hanya memeriksa domain email
--   (%@modena.com) dengan kebijakan berbasis peran dari tabel public.user_profiles.

-- =========================================================================
-- 1. TABEL MASTER CABANG (BRANCHES)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) UNIQUE NOT NULL,
    service_type VARCHAR(10) NOT NULL DEFAULT 'DSC'
        CONSTRAINT chk_branch_service_type CHECK (service_type IN ('DSC', 'ASC', 'SL')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_branches_service_type ON public.branches(service_type);

-- Seed 31 Cabang Resmi DSC MODENA (idempotent)
INSERT INTO public.branches (name, service_type)
VALUES
    ('Makassar', 'DSC'),
    ('Bandung', 'DSC'),
    ('MSC KBP Bandung', 'DSC'),
    ('Banjarmasin', 'DSC'),
    ('Medan', 'DSC'),
    ('MSC Suryo', 'DSC'),
    ('Surabaya', 'DSC'),
    ('Jakarta 1', 'DSC'),
    ('Jakarta 2', 'DSC'),
    ('Jakarta 3', 'DSC'),
    ('Jakarta 4', 'DSC'),
    ('Purwokerto', 'DSC'),
    ('Semarang', 'DSC'),
    ('Manado', 'DSC'),
    ('Kediri', 'DSC'),
    ('Solo', 'DSC'),
    ('Malang', 'DSC'),
    ('MSC Surabaya Mayjend Sungkono', 'DSC'),
    ('Samarinda', 'DSC'),
    ('Bali', 'DSC'),
    ('Pekanbaru', 'DSC'),
    ('Batam', 'DSC'),
    ('Palembang', 'DSC'),
    ('MSC Surabaya GWalk', 'DSC'),
    ('Yogyakarta', 'DSC'),
    ('MSC Kemang', 'DSC'),
    ('MSC Greenlake', 'DSC'),
    ('Aceh', 'DSC'),
    ('MSC Bogor', 'DSC'),
    ('Lampung', 'DSC'),
    ('Pontianak', 'DSC')
ON CONFLICT (name) DO NOTHING;

-- =========================================================================
-- 2. TABEL PROFIL PENGGUNA RESMI (USER_PROFILES)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL DEFAULT '',
    role VARCHAR(20) NOT NULL DEFAULT 'technician'
        CONSTRAINT chk_user_role CHECK (role IN ('super_admin', 'branch_admin', 'technician')),
    -- Nama cabang yang dipegang oleh branch_admin (NULL untuk super_admin)
    branch VARCHAR(150),
    -- UUID baris technicians milik akun teknisi (NULL untuk admin)
    technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    -- Memaksa rotasi kata sandi awal (Modena@{4 digit terakhir No HP}) pada login pertama
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Idempotent: jamin kolom tetap ada bila tabel sudah pernah dibuat sebelumnya
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_branch ON public.user_profiles(branch);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_profiles_technician_id
    ON public.user_profiles(technician_id)
    WHERE technician_id IS NOT NULL;

-- Konsistensi peran: branch_admin wajib memiliki cabang penugasan
ALTER TABLE public.user_profiles
    DROP CONSTRAINT IF EXISTS chk_user_profiles_role_scope;
ALTER TABLE public.user_profiles
    ADD CONSTRAINT chk_user_profiles_role_scope CHECK (
        role <> 'branch_admin' OR branch IS NOT NULL
    );

-- =========================================================================
-- 3. FUNGSI PEMBANTU OTORISASI (SECURITY DEFINER)
--    Dijalankan sebagai owner sehingga TIDAK memicu rekursi RLS pada user_profiles.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
    SELECT p.role
    FROM public.user_profiles p
    WHERE p.id = auth.uid() AND p.is_active = true;
$fn$;

CREATE OR REPLACE FUNCTION public.get_auth_user_branch()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
    SELECT p.branch
    FROM public.user_profiles p
    WHERE p.id = auth.uid() AND p.is_active = true;
$fn$;

CREATE OR REPLACE FUNCTION public.get_auth_technician_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
    SELECT p.technician_id
    FROM public.user_profiles p
    WHERE p.id = auth.uid() AND p.is_active = true;
$fn$;

/**
 * Menghapus penanda wajib-ganti-kata-sandi milik pengguna yang sedang login.
 * Dibungkus SECURITY DEFINER agar pengguna HANYA dapat mengubah kolom ini,
 * tanpa perlu kebijakan UPDATE mandiri yang berisiko eskalasi peran.
 */
CREATE OR REPLACE FUNCTION public.clear_must_change_password()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
    UPDATE public.user_profiles
    SET must_change_password = false
    WHERE id = auth.uid();
$fn$;

GRANT EXECUTE ON FUNCTION public.clear_must_change_password() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_user_branch() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_technician_id() TO authenticated;

-- Jaga updated_at tetap akurat
CREATE OR REPLACE FUNCTION public.trg_touch_user_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $fn$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS user_profiles_touch_trigger ON public.user_profiles;
CREATE TRIGGER user_profiles_touch_trigger
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.trg_touch_user_profiles();

-- =========================================================================
-- 4. BACKFILL: PERTAHANKAN AKSES ADMIN LAMA (%@modena.com -> super_admin)
--    Tanpa ini seluruh admin existing akan kehilangan akses begitu kebijakan
--    berbasis domain email di bawah dihapus.
-- =========================================================================

INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
SELECT
    u.id,
    u.email,
    COALESCE(NULLIF(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1)),
    'super_admin',
    true
FROM auth.users u
WHERE u.email ILIKE '%@modena.com'
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 5. KOLOM SCOPING CABANG PADA TABEL LOG
-- =========================================================================

ALTER TABLE public.sync_logs  ADD COLUMN IF NOT EXISTS branch VARCHAR(150);
ALTER TABLE public.sync_logs  ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS branch VARCHAR(150);

CREATE INDEX IF NOT EXISTS idx_sync_logs_branch  ON public.sync_logs(branch);
CREATE INDEX IF NOT EXISTS idx_audit_logs_branch ON public.audit_logs(branch);

-- Trigger audit lama diperbarui agar ikut mencatat cabang teknisi terkait
CREATE OR REPLACE FUNCTION public.trg_log_technician_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
BEGIN
    IF OLD.technician_status IS DISTINCT FROM NEW.technician_status THEN
        INSERT INTO public.audit_logs (
            user_id, action, target_table, target_id, old_values, new_values, branch
        ) VALUES (
            auth.uid(),
            'update_status',
            'technicians',
            NEW.id,
            jsonb_build_object('status', OLD.technician_status),
            jsonb_build_object('status', NEW.technician_status),
            NEW.branch
        );
    END IF;
    RETURN NEW;
END;
$fn$;

-- =========================================================================
-- 6. AKTIFKAN RLS PADA TABEL BARU
-- =========================================================================

ALTER TABLE public.branches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 7. HAPUS KEBIJAKAN LAMA BERBASIS DOMAIN EMAIL
-- =========================================================================

DROP POLICY IF EXISTS admin_all_technicians  ON public.technicians;
DROP POLICY IF EXISTS admin_all_performance  ON public.technician_performance;
DROP POLICY IF EXISTS admin_all_id_cards     ON public.technician_id_cards;
DROP POLICY IF EXISTS admin_all_sync_logs    ON public.sync_logs;
DROP POLICY IF EXISTS admin_all_audit_logs   ON public.audit_logs;

-- =========================================================================
-- 8. KEBIJAKAN RLS: branches
-- =========================================================================

DROP POLICY IF EXISTS branches_read_authenticated ON public.branches;
CREATE POLICY branches_read_authenticated ON public.branches
    FOR SELECT TO authenticated
    USING (public.get_auth_user_role() IS NOT NULL);

DROP POLICY IF EXISTS branches_super_admin_write ON public.branches;
CREATE POLICY branches_super_admin_write ON public.branches
    FOR ALL TO authenticated
    USING (public.get_auth_user_role() = 'super_admin')
    WITH CHECK (public.get_auth_user_role() = 'super_admin');

-- =========================================================================
-- 9. KEBIJAKAN RLS: user_profiles
-- =========================================================================

-- Setiap pengguna selalu boleh membaca profilnya sendiri (dibutuhkan saat login)
DROP POLICY IF EXISTS user_profiles_select_self ON public.user_profiles;
CREATE POLICY user_profiles_select_self ON public.user_profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());

DROP POLICY IF EXISTS user_profiles_super_admin_all ON public.user_profiles;
CREATE POLICY user_profiles_super_admin_all ON public.user_profiles
    FOR ALL TO authenticated
    USING (public.get_auth_user_role() = 'super_admin')
    WITH CHECK (public.get_auth_user_role() = 'super_admin');

-- Admin Cabang hanya melihat/mengelola akun milik cabangnya
DROP POLICY IF EXISTS user_profiles_branch_admin_select ON public.user_profiles;
CREATE POLICY user_profiles_branch_admin_select ON public.user_profiles
    FOR SELECT TO authenticated
    USING (
        public.get_auth_user_role() = 'branch_admin'
        AND branch IS NOT DISTINCT FROM public.get_auth_user_branch()
    );

DROP POLICY IF EXISTS user_profiles_branch_admin_update ON public.user_profiles;
CREATE POLICY user_profiles_branch_admin_update ON public.user_profiles
    FOR UPDATE TO authenticated
    USING (
        public.get_auth_user_role() = 'branch_admin'
        AND role = 'technician'
        AND branch IS NOT DISTINCT FROM public.get_auth_user_branch()
    )
    WITH CHECK (
        public.get_auth_user_role() = 'branch_admin'
        AND role = 'technician'
        AND branch IS NOT DISTINCT FROM public.get_auth_user_branch()
    );

-- =========================================================================
-- 10. KEBIJAKAN RLS: technicians
-- =========================================================================

DROP POLICY IF EXISTS technicians_super_admin_all ON public.technicians;
CREATE POLICY technicians_super_admin_all ON public.technicians
    FOR ALL TO authenticated
    USING (public.get_auth_user_role() = 'super_admin')
    WITH CHECK (public.get_auth_user_role() = 'super_admin');

DROP POLICY IF EXISTS technicians_branch_admin_select ON public.technicians;
CREATE POLICY technicians_branch_admin_select ON public.technicians
    FOR SELECT TO authenticated
    USING (
        public.get_auth_user_role() = 'branch_admin'
        AND branch = public.get_auth_user_branch()
    );

DROP POLICY IF EXISTS technicians_branch_admin_insert ON public.technicians;
CREATE POLICY technicians_branch_admin_insert ON public.technicians
    FOR INSERT TO authenticated
    WITH CHECK (
        public.get_auth_user_role() = 'branch_admin'
        AND branch = public.get_auth_user_branch()
    );

DROP POLICY IF EXISTS technicians_branch_admin_update ON public.technicians;
CREATE POLICY technicians_branch_admin_update ON public.technicians
    FOR UPDATE TO authenticated
    USING (
        public.get_auth_user_role() = 'branch_admin'
        AND branch = public.get_auth_user_branch()
    )
    WITH CHECK (
        public.get_auth_user_role() = 'branch_admin'
        AND branch = public.get_auth_user_branch()
    );

DROP POLICY IF EXISTS technicians_technician_select_own ON public.technicians;
CREATE POLICY technicians_technician_select_own ON public.technicians
    FOR SELECT TO authenticated
    USING (
        public.get_auth_user_role() = 'technician'
        AND id = public.get_auth_technician_id()
    );

-- =========================================================================
-- 11. KEBIJAKAN RLS: technician_performance
-- =========================================================================

DROP POLICY IF EXISTS performance_super_admin_all ON public.technician_performance;
CREATE POLICY performance_super_admin_all ON public.technician_performance
    FOR ALL TO authenticated
    USING (public.get_auth_user_role() = 'super_admin')
    WITH CHECK (public.get_auth_user_role() = 'super_admin');

DROP POLICY IF EXISTS performance_branch_admin_select ON public.technician_performance;
CREATE POLICY performance_branch_admin_select ON public.technician_performance
    FOR SELECT TO authenticated
    USING (
        public.get_auth_user_role() = 'branch_admin'
        AND EXISTS (
            SELECT 1 FROM public.technicians t
            WHERE t.id = technician_performance.technician_id
              AND t.branch = public.get_auth_user_branch()
        )
    );

DROP POLICY IF EXISTS performance_branch_admin_insert ON public.technician_performance;
CREATE POLICY performance_branch_admin_insert ON public.technician_performance
    FOR INSERT TO authenticated
    WITH CHECK (
        public.get_auth_user_role() = 'branch_admin'
        AND EXISTS (
            SELECT 1 FROM public.technicians t
            WHERE t.id = technician_performance.technician_id
              AND t.branch = public.get_auth_user_branch()
        )
    );

DROP POLICY IF EXISTS performance_branch_admin_update ON public.technician_performance;
CREATE POLICY performance_branch_admin_update ON public.technician_performance
    FOR UPDATE TO authenticated
    USING (
        public.get_auth_user_role() = 'branch_admin'
        AND EXISTS (
            SELECT 1 FROM public.technicians t
            WHERE t.id = technician_performance.technician_id
              AND t.branch = public.get_auth_user_branch()
        )
    )
    WITH CHECK (
        public.get_auth_user_role() = 'branch_admin'
        AND EXISTS (
            SELECT 1 FROM public.technicians t
            WHERE t.id = technician_performance.technician_id
              AND t.branch = public.get_auth_user_branch()
        )
    );

DROP POLICY IF EXISTS performance_technician_select_own ON public.technician_performance;
CREATE POLICY performance_technician_select_own ON public.technician_performance
    FOR SELECT TO authenticated
    USING (
        public.get_auth_user_role() = 'technician'
        AND technician_id = public.get_auth_technician_id()
    );

-- =========================================================================
-- 12. KEBIJAKAN RLS: technician_id_cards
-- =========================================================================

DROP POLICY IF EXISTS id_cards_super_admin_all ON public.technician_id_cards;
CREATE POLICY id_cards_super_admin_all ON public.technician_id_cards
    FOR ALL TO authenticated
    USING (public.get_auth_user_role() = 'super_admin')
    WITH CHECK (public.get_auth_user_role() = 'super_admin');

DROP POLICY IF EXISTS id_cards_branch_admin_select ON public.technician_id_cards;
CREATE POLICY id_cards_branch_admin_select ON public.technician_id_cards
    FOR SELECT TO authenticated
    USING (
        public.get_auth_user_role() = 'branch_admin'
        AND EXISTS (
            SELECT 1 FROM public.technicians t
            WHERE t.id = technician_id_cards.technician_id
              AND t.branch = public.get_auth_user_branch()
        )
    );

DROP POLICY IF EXISTS id_cards_branch_admin_insert ON public.technician_id_cards;
CREATE POLICY id_cards_branch_admin_insert ON public.technician_id_cards
    FOR INSERT TO authenticated
    WITH CHECK (
        public.get_auth_user_role() = 'branch_admin'
        AND EXISTS (
            SELECT 1 FROM public.technicians t
            WHERE t.id = technician_id_cards.technician_id
              AND t.branch = public.get_auth_user_branch()
        )
    );

DROP POLICY IF EXISTS id_cards_branch_admin_update ON public.technician_id_cards;
CREATE POLICY id_cards_branch_admin_update ON public.technician_id_cards
    FOR UPDATE TO authenticated
    USING (
        public.get_auth_user_role() = 'branch_admin'
        AND EXISTS (
            SELECT 1 FROM public.technicians t
            WHERE t.id = technician_id_cards.technician_id
              AND t.branch = public.get_auth_user_branch()
        )
    )
    WITH CHECK (
        public.get_auth_user_role() = 'branch_admin'
        AND EXISTS (
            SELECT 1 FROM public.technicians t
            WHERE t.id = technician_id_cards.technician_id
              AND t.branch = public.get_auth_user_branch()
        )
    );

DROP POLICY IF EXISTS id_cards_technician_select_own ON public.technician_id_cards;
CREATE POLICY id_cards_technician_select_own ON public.technician_id_cards
    FOR SELECT TO authenticated
    USING (
        public.get_auth_user_role() = 'technician'
        AND technician_id = public.get_auth_technician_id()
    );

-- =========================================================================
-- 13. KEBIJAKAN RLS: sync_logs (Super Admin nasional, Admin Cabang per-cabang)
-- =========================================================================

DROP POLICY IF EXISTS sync_logs_super_admin_all ON public.sync_logs;
CREATE POLICY sync_logs_super_admin_all ON public.sync_logs
    FOR ALL TO authenticated
    USING (public.get_auth_user_role() = 'super_admin')
    WITH CHECK (public.get_auth_user_role() = 'super_admin');

DROP POLICY IF EXISTS sync_logs_branch_admin_select ON public.sync_logs;
CREATE POLICY sync_logs_branch_admin_select ON public.sync_logs
    FOR SELECT TO authenticated
    USING (
        public.get_auth_user_role() = 'branch_admin'
        AND branch = public.get_auth_user_branch()
    );

DROP POLICY IF EXISTS sync_logs_branch_admin_insert ON public.sync_logs;
CREATE POLICY sync_logs_branch_admin_insert ON public.sync_logs
    FOR INSERT TO authenticated
    WITH CHECK (
        public.get_auth_user_role() = 'branch_admin'
        AND branch = public.get_auth_user_branch()
    );

-- =========================================================================
-- 14. KEBIJAKAN RLS: audit_logs
-- =========================================================================

DROP POLICY IF EXISTS audit_logs_super_admin_all ON public.audit_logs;
CREATE POLICY audit_logs_super_admin_all ON public.audit_logs
    FOR ALL TO authenticated
    USING (public.get_auth_user_role() = 'super_admin')
    WITH CHECK (public.get_auth_user_role() = 'super_admin');

DROP POLICY IF EXISTS audit_logs_branch_admin_select ON public.audit_logs;
CREATE POLICY audit_logs_branch_admin_select ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        public.get_auth_user_role() = 'branch_admin'
        AND branch = public.get_auth_user_branch()
    );
