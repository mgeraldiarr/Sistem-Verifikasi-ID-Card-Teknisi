-- Migration: Secure RLS Policies for Technicians and Admin Tables
-- Date: 2026-08-19
-- Description: Menghapus kebijakan SELECT anonim publik yang memicu kebocoran data dan memperketat otorisasi admin hanya untuk email berdomain @modena.com.

-- =========================================================================
-- 1. HAPUS KEBIJAKAN SELEK PUBLIK (ANON) YANG TIDAK AMAN (MENCEGAH KEBOCORAN DATA)
-- =========================================================================

DROP POLICY IF EXISTS public_select_active_technicians ON technicians;
DROP POLICY IF EXISTS public_select_active_id_cards ON technician_id_cards;

-- =========================================================================
-- 2. HAPUS KEBIJAKAN ADMIN LAMA YANG TERLALU BEBAS (Authenticated All)
-- =========================================================================

DROP POLICY IF EXISTS admin_all_technicians ON technicians;
DROP POLICY IF EXISTS admin_all_performance ON technician_performance;
DROP POLICY IF EXISTS admin_all_id_cards ON technician_id_cards;
DROP POLICY IF EXISTS admin_all_sync_logs ON sync_logs;
DROP POLICY IF EXISTS admin_all_audit_logs ON audit_logs;

-- =========================================================================
-- 3. BUAT KEBIJAKAN BARU YANG KETAT UNTUK ADMIN/STAFF RESMI
-- =========================================================================

-- Fungsi bantu atau kondisi pemeriksaan admin:
-- Pengguna harus terautentikasi dan emailnya harus berakhiran '@modena.com' (misalnya admin@modena.com)
-- Kondisi: (auth.uid() IS NOT NULL AND auth.jwt() ->> 'email' LIKE '%@modena.com')

-- A. Kebijakan Tabel: technicians
CREATE POLICY admin_all_technicians ON technicians
    FOR ALL
    TO authenticated
    USING (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'email' LIKE '%@modena.com'
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'email' LIKE '%@modena.com'
    );

-- B. Kebijakan Tabel: technician_performance
CREATE POLICY admin_all_performance ON technician_performance
    FOR ALL
    TO authenticated
    USING (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'email' LIKE '%@modena.com'
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'email' LIKE '%@modena.com'
    );

-- C. Kebijakan Tabel: technician_id_cards
CREATE POLICY admin_all_id_cards ON technician_id_cards
    FOR ALL
    TO authenticated
    USING (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'email' LIKE '%@modena.com'
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'email' LIKE '%@modena.com'
    );

-- D. Kebijakan Tabel: sync_logs
CREATE POLICY admin_all_sync_logs ON sync_logs
    FOR ALL
    TO authenticated
    USING (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'email' LIKE '%@modena.com'
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'email' LIKE '%@modena.com'
    );

-- E. Kebijakan Tabel: audit_logs
CREATE POLICY admin_all_audit_logs ON audit_logs
    FOR ALL
    TO authenticated
    USING (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'email' LIKE '%@modena.com'
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND 
        auth.jwt() ->> 'email' LIKE '%@modena.com'
    );
