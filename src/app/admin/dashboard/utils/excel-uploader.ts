// src/app/admin/dashboard/utils/excel-uploader.ts
import * as XLSX from 'xlsx';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getRowValue,
  mapCardStatus,
  mapLevel,
  mapStatus,
  parseExcelDate,
  parseExcelNumber,
  parseExcelPeriod,
} from '@/lib/excel';
import { ExcelUploadResult, SyncErrorDetail } from '@/types';

interface ProcessExcelUploadOptions {
  file: File;
  supabase: SupabaseClient;
}

export async function processExcelUpload({
  file,
  supabase,
}: ProcessExcelUploadOptions): Promise<ExcelUploadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (!data || data.length === 0) {
          throw new Error('File Excel kosong atau tidak memiliki data.');
        }

        // 1. Bersihkan baris kosong (abaikan baris kosong di bagian bawah Excel)
        const activeRows = data.filter((row) => {
          return Object.values(row).some(
            (val) => val !== null && val !== undefined && String(val).trim() !== ''
          );
        });

        if (activeRows.length === 0) {
          throw new Error('Tidak ada data baris yang valid di file Excel.');
        }

        let successCount = 0;
        let updateCount = 0;
        let insertCount = 0;
        const errorDetails: SyncErrorDetail[] = [];

        // 2. Proses baris demi baris secara independen
        for (let idx = 0; idx < activeRows.length; idx++) {
          const row = activeRows[idx];
          const rowNum = idx + 1;

          try {
            // Ekstraksi nilai kolom wajib
            const technician_id = String(
              getRowValue(row, ['technician_id', 'id_teknisi', 'id teknisi', 'id']) || ''
            ).trim();
            const employee_number = String(
              getRowValue(row, [
                'employee_number',
                'no_karyawan',
                'no karyawan',
                'nik',
                'nomor_karyawan',
                'nomor karyawan',
              ]) || ''
            ).trim();
            const technician_name = String(
              getRowValue(row, [
                'technician_name',
                'nama_teknisi',
                'nama teknisi',
                'nama',
                'nama_lengkap',
                'nama lengkap',
              ]) || ''
            ).trim();
            const branch = String(
              getRowValue(row, ['branch', 'cabang', 'wilayah']) || ''
            ).trim();

            if (!technician_id || !employee_number || !technician_name || !branch) {
              const missing = [];
              if (!technician_id) missing.push('ID/ID Teknisi');
              if (!employee_number) missing.push('NIK/No Karyawan');
              if (!technician_name) missing.push('Nama');
              if (!branch) missing.push('Cabang');
              throw new Error(`Kolom wajib tidak lengkap: ${missing.join(', ')}`);
            }

            // Ekstraksi nilai kolom opsional
            const service_center = getRowValue(row, [
              'service_center',
              'service center',
              'lokasi',
              'lokasi_service',
              'lokasi service',
            ]);
            const photo_url = getRowValue(row, [
              'photo_url',
              'photo',
              'foto',
              'foto_url',
              'link_foto',
              'link foto',
            ]);
            const phone = getRowValue(row, [
              'phone',
              'no_hp',
              'no hp',
              'telepon',
              'phone_number',
              'kontak',
              'no_telp',
              'no telp',
            ]);
            const email = getRowValue(row, ['email', 'surel']);
            const rawStatus = getRowValue(row, [
              'technician_status',
              'status_teknisi',
              'status teknisi',
              'status',
              'status_keaktifan',
              'status keaktifan',
            ]);
            const rawLevel = getRowValue(row, [
              'technician_level',
              'level_teknisi',
              'level teknisi',
              'level',
              'sertifikasi',
              'level_sertifikasi',
              'level sertifikasi',
            ]);

            const techPayload = {
              technician_id,
              employee_number,
              technician_name,
              branch,
              service_center: service_center ? String(service_center).trim() : null,
              photo_url: photo_url ? String(photo_url).trim() : null,
              phone: phone ? String(phone).trim() : null,
              email: email ? String(email).trim() : null,
              technician_status: mapStatus(rawStatus),
              technician_level: mapLevel(rawLevel),
              updated_at: new Date().toISOString(),
            };

            // A. Cek duplikasi teknisi
            const { data: existing } = await supabase
              .from('technicians')
              .select('id, qr_token')
              .eq('technician_id', techPayload.technician_id)
              .maybeSingle();

            let techId = '';
            let qrToken = '';

            if (existing) {
              const { data: updated, error } = await supabase
                .from('technicians')
                .update(techPayload)
                .eq('id', existing.id)
                .select('id, qr_token')
                .single();
              if (error) throw error;
              techId = updated.id;
              qrToken = updated.qr_token;
              updateCount++;
            } else {
              const { data: inserted, error } = await supabase
                .from('technicians')
                .insert([techPayload])
                .select('id, qr_token')
                .single();
              if (error) throw error;
              techId = inserted.id;
              qrToken = inserted.qr_token;
              insertCount++;
            }

            // B. Hubungkan data performa
            const periodRaw = getRowValue(row, ['period', 'periode', 'bulan']);
            const period = parseExcelPeriod(periodRaw);
            if (period) {
              const kpiRaw = getRowValue(row, [
                'kpi_score',
                'kpi',
                'skor kpi',
                'skor_kpi',
                'nilai kpi',
                'nilai_kpi',
              ]);
              const csiRaw = getRowValue(row, [
                'csi_score',
                'csi',
                'skor csi',
                'skor_csi',
                'nilai csi',
                'nilai_csi',
              ]);
              const perfRaw = getRowValue(row, [
                'performance_score',
                'performance',
                'performa',
                'skor_performa',
                'skor performa',
                'nilai_performa',
                'nilai performa',
              ]);
              const perfLvlRaw = getRowValue(row, [
                'performance_level',
                'level_performa',
                'level performa',
              ]);

              const perfPayload = {
                technician_id: techId,
                period,
                kpi_score: parseExcelNumber(kpiRaw),
                csi_score: parseExcelNumber(csiRaw),
                performance_score: parseExcelNumber(perfRaw),
                performance_level: perfLvlRaw ? mapLevel(perfLvlRaw) : mapLevel(rawLevel),
                data_source: 'excel',
                updated_at: new Date().toISOString(),
              };

              const { error: perfError } = await supabase
                .from('technician_performance')
                .upsert(perfPayload, { onConflict: 'technician_id,period' });
              if (perfError) throw perfError;
            }

            // C. Hubungkan data ID Card
            const card_number = getRowValue(row, [
              'card_number',
              'no_kartu',
              'no kartu',
              'nomor kartu',
              'nomor_kartu',
              'serial_number',
              'serial number',
            ]);
            if (card_number) {
              const cardStatusRaw = getRowValue(row, [
                'card_status',
                'status_kartu',
                'status kartu',
              ]);
              const expiryDateRaw = getRowValue(row, [
                'expiry_date',
                'tanggal_kadaluarsa',
                'tanggal kadaluarsa',
                'expired',
                'masa berlaku',
                'masa_berlaku',
              ]);
              const expiry_date = parseExcelDate(expiryDateRaw);

              const cardPayload = {
                technician_id: techId,
                card_number: String(card_number).trim(),
                qr_token: qrToken,
                card_status: mapCardStatus(cardStatusRaw),
                expiry_date:
                  expiry_date ||
                  new Date(new Date().setFullYear(new Date().getFullYear() + 2))
                    .toISOString()
                    .split('T')[0],
              };

              const { error: cardError } = await supabase
                .from('technician_id_cards')
                .upsert(cardPayload, { onConflict: 'card_number' });
              if (cardError) throw cardError;
            }

            successCount++;
          } catch (err: any) {
            errorDetails.push({
              row: rowNum,
              technician_id: String(row.technician_id || 'UNKNOWN'),
              error: err.message || 'Error tidak dikenal saat menyimpan.',
            });
          }
        }

        // Tulis log sinkronisasi
        const finalStatus =
          errorDetails.length === 0
            ? 'success'
            : successCount === 0
              ? 'failed'
              : 'partial';

        await supabase.from('sync_logs').insert({
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          status: finalStatus,
          total_records: activeRows.length,
          processed_records: successCount,
          new_records: insertCount,
          updated_records: updateCount,
          error_count: errorDetails.length,
          error_details: errorDetails,
        });

        resolve({
          status: finalStatus,
          totalRows: activeRows.length,
          successCount,
          insertCount,
          updateCount,
          errorDetails,
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
