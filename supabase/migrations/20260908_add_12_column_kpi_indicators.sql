-- supabase/migrations/20260908_add_12_column_kpi_indicators.sql
-- Menambahkan 6 Indikator Evaluasi Standar 12 Kolom MODENA pada tabel technician_performance

ALTER TABLE technician_performance
  ADD COLUMN IF NOT EXISTS tat NUMERIC(5,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rtat NUMERIC(5,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS csat NUMERIC(5,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS grooming_score NUMERIC(5,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS service_score NUMERIC(5,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS repair_quality_score NUMERIC(5,2) DEFAULT NULL;

COMMENT ON COLUMN technician_performance.tat IS 'Turn Around Time (Bobot 20%)';
COMMENT ON COLUMN technician_performance.rtat IS 'Repeat Turn Around Time (Bobot 15%)';
COMMENT ON COLUMN technician_performance.csat IS 'Customer Satisfaction (Bobot 25%)';
COMMENT ON COLUMN technician_performance.grooming_score IS 'Skor Penampilan / Grooming (Bobot 10%)';
COMMENT ON COLUMN technician_performance.service_score IS 'Skor Pelayanan (Bobot 15%)';
COMMENT ON COLUMN technician_performance.repair_quality_score IS 'Skor Kualitas Perbaikan Unit (Bobot 15%)';
