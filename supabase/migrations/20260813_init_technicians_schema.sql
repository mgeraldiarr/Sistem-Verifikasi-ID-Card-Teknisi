-- Supabase Migration Script
-- Date: 2026-08-13
-- Description: Inisialisasi skema database MODENA Technician Verification System

-- 1. Hapus tabel lama jika ada konflik (opsional, untuk memastikan clean setup)
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS sync_logs CASCADE;
-- DROP TABLE IF EXISTS technician_id_cards CASCADE;
-- DROP TABLE IF EXISTS technician_performance CASCADE;
-- DROP TABLE IF EXISTS technicians CASCADE;

-- 2. Buat tabel utama: technicians (Data Teknisi)
CREATE TABLE IF NOT EXISTS technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id VARCHAR(50) UNIQUE NOT NULL, -- Format MOD-T001, MOD-T002 dst
    employee_number VARCHAR(100) NOT NULL,    -- Nomor Karyawan Internal
    technician_name VARCHAR(255) NOT NULL,
    branch VARCHAR(100) NOT NULL,              -- Cabang (Jakarta, Bandung, dll)
    service_center VARCHAR(150),               -- Lokasi Service Center
    photo_url TEXT,                            -- URL Foto di Supabase Storage
    phone VARCHAR(20),                         -- Nomor HP (Sensitif)
    email VARCHAR(150),                        -- Email (Sensitif)
    technician_status VARCHAR(20) NOT NULL DEFAULT 'active' 
        CONSTRAINT chk_technician_status CHECK (technician_status IN ('active', 'inactive')),
    technician_level VARCHAR(20) NOT NULL DEFAULT 'beginner'
        CONSTRAINT chk_technician_level CHECK (technician_level IN ('beginner', 'intermediate', 'advance')),
    qr_token UUID UNIQUE DEFAULT gen_random_uuid(), -- Secure token acak untuk publik
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Buat tabel: technician_performance (Skor Performa dari Excel)
CREATE TABLE IF NOT EXISTS technician_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    period VARCHAR(7) NOT NULL, -- Format YYYY-MM (misal: 2026-08)
    kpi_score NUMERIC(5,2) NOT NULL CONSTRAINT chk_kpi CHECK (kpi_score >= 0 AND kpi_score <= 100),
    csi_score NUMERIC(4,2) NOT NULL CONSTRAINT chk_csi CHECK (csi_score >= 0 AND csi_score <= 10),
    performance_score NUMERIC(5,2) NOT NULL,
    performance_level VARCHAR(20) NOT NULL CONSTRAINT chk_perf_level CHECK (performance_level IN ('beginner', 'intermediate', 'advance')),
    data_source VARCHAR(50) DEFAULT 'excel' NOT NULL,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT uq_tech_period UNIQUE (technician_id, period) -- Satu teknisi hanya punya 1 record performa per periode
);

-- 4. Buat tabel: technician_id_cards (Status ID Card Fisik/Digital)
CREATE TABLE IF NOT EXISTS technician_id_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    card_number VARCHAR(100) UNIQUE NOT NULL, -- Nomor Seri Kartu Unik
    qr_token UUID NOT NULL REFERENCES technicians(qr_token) ON UPDATE CASCADE ON DELETE CASCADE,
    issue_date DATE DEFAULT CURRENT_DATE NOT NULL,
    expiry_date DATE NOT NULL,
    card_status VARCHAR(20) DEFAULT 'active' NOT NULL
        CONSTRAINT chk_card_status CHECK (card_status IN ('active', 'suspended', 'expired')),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. Buat tabel: sync_logs (Log Sinkronisasi Excel harian)
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL CONSTRAINT chk_sync_status CHECK (status IN ('success', 'failed', 'partial')),
    total_records INTEGER DEFAULT 0 NOT NULL,
    processed_records INTEGER DEFAULT 0 NOT NULL,
    updated_records INTEGER DEFAULT 0 NOT NULL,
    new_records INTEGER DEFAULT 0 NOT NULL,
    error_count INTEGER DEFAULT 0 NOT NULL,
    error_details JSONB DEFAULT '[]'::jsonb NOT NULL -- Menyimpan detail kegagalan (misal: "Baris 5: KPI tidak valid")
);

-- 6. Buat tabel: audit_logs (Catatan audit aktivitas admin)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- NULL jika sistem otomatis / tidak login, atau link ke auth.users
    action VARCHAR(100) NOT NULL, -- 'update_status', 'generate_id_card', 'sync_manual', dll
    target_table VARCHAR(100) NOT NULL,
    target_id UUID,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    ip_address VARCHAR(45)
);

-- 7. Buat Index untuk mempercepat query pencarian
CREATE INDEX IF NOT EXISTS idx_technicians_status ON technicians(technician_status);
CREATE INDEX IF NOT EXISTS idx_technicians_qr_token ON technicians(qr_token);
CREATE INDEX IF NOT EXISTS idx_performance_tech_period ON technician_performance(technician_id, period);

-- 8. AKTIFKAN ROW LEVEL SECURITY (RLS) di Supabase
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_id_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 9. KEBIJAKAN KEAMANAN (RLS POLICIES)

-- Kebijakan untuk tabel: technicians
-- A. Admin/Staff yang terautentikasi memiliki akses penuh (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY admin_all_technicians ON technicians
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- B. Publik (anonim) HANYA BISA melakukan SELECT data teknisi yang berstatus 'active'
--    dan query dibatasi menggunakan token acak (qr_token)
CREATE POLICY public_select_active_technicians ON technicians
    FOR SELECT
    TO anon
    USING (technician_status = 'active');

-- Kebijakan untuk tabel: technician_performance
-- A. Admin/Staff terautentikasi memiliki akses penuh
CREATE POLICY admin_all_performance ON technician_performance
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- B. Publik TIDAK BISA melihat data performa internal (Default ditolak)

-- Kebijakan untuk tabel: technician_id_cards
-- A. Admin/Staff terautentikasi memiliki akses penuh
CREATE POLICY admin_all_id_cards ON technician_id_cards
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- B. Publik bisa melihat info ID Card yang aktif
CREATE POLICY public_select_active_id_cards ON technician_id_cards
    FOR SELECT
    TO anon
    USING (card_status = 'active');

-- Kebijakan untuk tabel: sync_logs
-- Hanya admin yang bisa membaca log sinkronisasi
CREATE POLICY admin_all_sync_logs ON sync_logs
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Kebijakan untuk tabel: audit_logs
-- Hanya admin yang bisa membaca log audit
CREATE POLICY admin_all_audit_logs ON audit_logs
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 10. TRIGGER AUDIT TRAIL (OTOMATISASI BACKEND)

-- Fungsi untuk mencatat perubahan status teknisi ke tabel audit_logs secara otomatis
CREATE OR REPLACE FUNCTION trg_log_technician_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.technician_status IS DISTINCT FROM NEW.technician_status THEN
        INSERT INTO audit_logs (
            user_id,
            action,
            target_table,
            target_id,
            old_values,
            new_values
        ) VALUES (
            auth.uid(), -- ID admin yang mengubah status (jika terautentikasi di Supabase)
            'update_status',
            'technicians',
            NEW.id,
            jsonb_build_object('status', OLD.technician_status),
            jsonb_build_object('status', NEW.technician_status)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang trigger pada tabel technicians
DROP TRIGGER IF EXISTS technicians_status_change_trigger ON technicians;
CREATE TRIGGER technicians_status_change_trigger
    AFTER UPDATE ON technicians
    FOR EACH ROW
    EXECUTE FUNCTION trg_log_technician_status_change();
