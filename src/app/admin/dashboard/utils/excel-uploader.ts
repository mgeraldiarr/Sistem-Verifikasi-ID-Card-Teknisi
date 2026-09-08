// src/app/admin/dashboard/utils/excel-uploader.ts
import * as XLSX from 'xlsx';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getRowValue,
  mapCardStatus,
  mapStatus,
  parseExcelDate,
  parseExcelNumber,
  parseExcelPeriod,
  parseMonthNameToPeriod,
} from '@/lib/excel';
import { calculateHybridKpi } from '@/lib/kpi';
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
            // Ekstraksi identitas utama (Mendukung 12 Kolom Standar MODENA & Format Legacy)
            const technician_name = String(
              getRowValue(row, [
                'technician full names',
                'technician full name',
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

            if (!technician_name || !branch) {
              const missing = [];
              if (!technician_name) missing.push('Technician Full Names / Nama');
              if (!branch) missing.push('Branch / Cabang');
              throw new Error(`Kolom wajib tidak lengkap: ${missing.join(', ')}`);
            }

            let technician_id = String(
              getRowValue(row, ['technician_id', 'id_teknisi', 'id teknisi', 'id']) || ''
            ).trim();

            let employee_number = String(
              getRowValue(row, [
                'employee_number',
                'no_karyawan',
                'no karyawan',
                'nik',
                'nomor_karyawan',
                'nomor karyawan',
              ]) || ''
            ).trim();

            // A. Cari apakah teknisi sudah ada sebelumnya (by ID atau by Name + Branch)
            let existingTech: any = null;
            if (technician_id) {
              const { data } = await supabase
                .from('technicians')
                .select('id, qr_token, technician_id, employee_number, technician_level')
                .eq('technician_id', technician_id)
                .maybeSingle();
              existingTech = data;
            }

            if (!existingTech) {
              const { data } = await supabase
                .from('technicians')
                .select('id, qr_token, technician_id, employee_number, technician_level')
                .ilike('technician_name', technician_name)
                .ilike('branch', branch)
                .maybeSingle();
              existingTech = data;
            }

            // Jika teknisi sudah ada, gunakan ID & NIK terdaftarnya
            if (existingTech) {
              if (!technician_id) technician_id = existingTech.technician_id;
              if (!employee_number) employee_number = existingTech.employee_number;
            } else {
              // Jika teknisi baru dan file 12 kolom tidak menyertakan ID/NIK, generate otomatis
              if (!technician_id) {
                const branchCode = branch
                  .replace(/[^a-zA-Z]/g, '')
                  .slice(0, 3)
                  .toUpperCase() || 'MOD';
                technician_id = `MOD-${branchCode}-${Math.floor(1000 + Math.random() * 9000)}`;
              }
              if (!employee_number) {
                employee_number = `10${Math.floor(100000 + Math.random() * 900000)}`;
              }
            }

            // B. Ekstraksi 6 Indikator Evaluasi Standar
            const tatRaw = getRowValue(row, [
              'tat',
              'turn around time',
              'turn_around_time',
            ]);
            const rtatRaw = getRowValue(row, [
              'rtat',
              'repeat turn around time',
              'repeat_turn_around_time',
            ]);
            const csatRaw = getRowValue(row, [
              'csat',
              'customer satisfaction',
              'customer_satisfaction',
              'csi',
              'csi_score',
            ]);
            const groomingRaw = getRowValue(row, [
              'penampilan',
              'grooming',
              'grooming_score',
              'skor penampilan',
              'skor_penampilan',
            ]);
            const serviceRaw = getRowValue(row, [
              'pelayanan',
              'service',
              'service_score',
              'skor pelayanan',
              'skor_pelayanan',
            ]);
            const repairQualityRaw = getRowValue(row, [
              'hasil perbaikan',
              'hasil_perbaikan',
              'repair quality',
              'repair_quality',
              'kualitas perbaikan',
              'kualitas_perbaikan',
            ]);

            // C. Ekstraksi Nilai dari Klien (Kolom 11 & 12)
            const clientScoreRaw = getRowValue(row, [
              'technician level',
              'technician_level',
              'skor kpi',
              'skor_kpi',
              'kpi',
              'kpi_score',
              'skor total',
              'skor_total',
              'total score',
              'performance_score',
            ]);
            const clientStatusRaw = getRowValue(row, [
              'status',
              'level',
              'level teknisi',
              'level_teknisi',
              'status level',
              'performance_level',
            ]);

            const tatNum = parseExcelNumber(tatRaw);
            const rtatNum = parseExcelNumber(rtatRaw);
            const csatNum = parseExcelNumber(csatRaw);
            const groomingNum = parseExcelNumber(groomingRaw);
            const serviceNum = parseExcelNumber(serviceRaw);
            const repairQualityNum = parseExcelNumber(repairQualityRaw);

            const clientScoreParsed =
              clientScoreRaw !== undefined &&
              clientScoreRaw !== null &&
              String(clientScoreRaw).trim() !== ''
                ? parseExcelNumber(clientScoreRaw)
                : null;

            // D. Hitung Skor & Level dengan Mekanisme Penilaian Hybrid
            const { score: finalScore, level: finalLevel } = calculateHybridKpi(
              {
                tat: tatNum,
                rtat: rtatNum,
                csat: csatNum,
                grooming_score: groomingNum,
                service_score: serviceNum,
                repair_quality_score: repairQualityNum,
              },
              clientScoreParsed,
              clientStatusRaw ? String(clientStatusRaw) : null
            );

            // E. Ekstraksi Informasi Tambahan Profil
            const service_center = getRowValue(row, [
              'service_center',
              'service center',
              'lokasi',
              'lokasi_service',
            ]);
            const photo_url = getRowValue(row, [
              'photo_url',
              'photo',
              'foto',
              'foto_url',
              'link_foto',
            ]);
            const phone = getRowValue(row, [
              'phone',
              'no_hp',
              'no hp',
              'telepon',
              'kontak',
            ]);
            const email = getRowValue(row, ['email', 'surel']);
            const rawKeaktifan = getRowValue(row, [
              'technician_status',
              'status_keaktifan',
              'status keaktifan',
              'keaktifan',
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
              technician_status: mapStatus(rawKeaktifan),
              technician_level: finalLevel,
              updated_at: new Date().toISOString(),
            };

            let techId = '';
            let qrToken = '';

            if (existingTech) {
              const { data: updated, error } = await supabase
                .from('technicians')
                .update(techPayload)
                .eq('id', existingTech.id)
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

            // F. Simpan Rekam Performa (12 Kolom Evaluasi)
            const yearRaw = getRowValue(row, ['year', 'tahun']);
            const monthRaw = getRowValue(row, ['month', 'bulan', 'periode', 'period']);
            let period = parseMonthNameToPeriod(yearRaw, monthRaw);
            if (!period) {
              period = parseExcelPeriod(monthRaw) || parseExcelPeriod(yearRaw);
            }
            if (!period) {
              const now = new Date();
              period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            }

            const csiCalculated =
              csatNum > 0 && csatNum <= 10
                ? csatNum
                : Math.round((csatNum / 10) * 10) / 10;

            const perfPayload = {
              technician_id: techId,
              period,
              kpi_score: finalScore,
              csi_score: csiCalculated,
              performance_score: finalScore,
              performance_level: finalLevel,
              tat: tatNum || null,
              rtat: rtatNum || null,
              csat: csatNum || null,
              grooming_score: groomingNum || null,
              service_score: serviceNum || null,
              repair_quality_score: repairQualityNum || null,
              data_source: 'excel_12_col',
              updated_at: new Date().toISOString(),
            };

            const { error: perfError } = await supabase
              .from('technician_performance')
              .upsert(perfPayload, { onConflict: 'technician_id,period' });

            // Fallback otomatis jika database Supabase belum menjalankan migrasi 6 kolom indikator
            if (
              perfError &&
              (perfError.message?.includes('schema cache') ||
                perfError.message?.includes('does not exist'))
            ) {
              const fallbackPerfPayload = {
                technician_id: techId,
                period,
                kpi_score: finalScore,
                csi_score: csiCalculated,
                performance_score: finalScore,
                performance_level: finalLevel,
                data_source: 'excel_12_col',
                updated_at: new Date().toISOString(),
              };
              const { error: fallbackError } = await supabase
                .from('technician_performance')
                .upsert(fallbackPerfPayload, { onConflict: 'technician_id,period' });
              if (fallbackError) throw fallbackError;
            } else if (perfError) {
              throw perfError;
            }

            // G. Hubungkan atau Terbitkan ID Card
            const card_number = getRowValue(row, [
              'card_number',
              'no_kartu',
              'no kartu',
              'nomor kartu',
              'nomor_kartu',
              'serial_number',
            ]);
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
            ]);
            const expiry_date = parseExcelDate(expiryDateRaw);

            // Default card number jika tidak disediakan di file 12 kolom
            const defaultCardNumber =
              card_number ? String(card_number).trim() : `CARD-${technician_id.replace(/^MOD-/, '')}`;

            // Cek apakah sudah ada kartu untuk teknisi ini
            const { data: existingCard } = await supabase
              .from('technician_id_cards')
              .select('id, card_number')
              .eq('technician_id', techId)
              .maybeSingle();

            const finalCardNumber = existingCard ? existingCard.card_number : defaultCardNumber;

            const cardPayload = {
              technician_id: techId,
              card_number: finalCardNumber,
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

            successCount++;
          } catch (err: any) {
            errorDetails.push({
              row: rowNum,
              technician_id: String(row['Technician Full Names'] || row.technician_id || 'UNKNOWN'),
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
