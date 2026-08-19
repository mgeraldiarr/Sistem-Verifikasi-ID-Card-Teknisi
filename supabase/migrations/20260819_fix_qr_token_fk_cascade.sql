-- Migration: Fix QR Token Foreign Key Cascade
-- Date: 2026-08-19
-- Description: Mengizinkan regenerasi qr_token pada tabel technicians dengan menambahkan ON UPDATE CASCADE pada tabel technician_id_cards.

ALTER TABLE technician_id_cards 
DROP CONSTRAINT IF EXISTS technician_id_cards_qr_token_fkey;

ALTER TABLE technician_id_cards 
ADD CONSTRAINT technician_id_cards_qr_token_fkey 
FOREIGN KEY (qr_token) 
REFERENCES technicians(qr_token) 
ON UPDATE CASCADE 
ON DELETE CASCADE;
