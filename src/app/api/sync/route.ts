// src/app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getRowValue,
  mapCardStatus,
  mapLevel,
  mapStatus,
  parseExcelDate,
  parseExcelNumber,
  parseExcelPeriod,
} from '@/lib/excel';
import { SyncErrorDetail, SyncRecord } from '@/types';

// Rate limiting configuration
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute

const getClientIp = (req: NextRequest) => {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  return (req as any).ip || '127.0.0.1';
};

export async function POST(req: NextRequest) {
  const startTime = new Date().toISOString();
  
  // 1. Rate Limiting Check
  const ip = getClientIp(req);
  const now = Date.now();
  const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - rateData.lastReset > RATE_LIMIT_WINDOW) {
    rateData.count = 1;
    rateData.lastReset = now;
  } else {
    rateData.count++;
  }
  rateLimitMap.set(ip, rateData);

  if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
    return NextResponse.json(
      { error: 'Too Many Requests: Batas laju permintaan terlampaui. Silakan coba lagi nanti.' },
      { status: 429 }
    );
  }

  // 2. Content-Type Validation
  const contentType = req.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return NextResponse.json(
      { error: 'Unsupported Media Type: Content-Type harus application/json.' },
      { status: 415 }
    );
  }

  // A. Autentikasi API Key
  const apiKey = req.headers.get('x-api-key');
  const validApiKey = process.env.SYNC_API_KEY;

  if (!validApiKey || apiKey !== validApiKey) {
    return NextResponse.json(
      { error: 'Unauthorized: Akses ditolak. API Key tidak valid.' },
      { status: 401 }
    );
  }

  let totalRecords = 0;
  let processedRecords = 0;
  let newRecords = 0;
  let updatedRecords = 0;
  const errorDetails: SyncErrorDetail[] = [];
  let syncLogId: string | null = null;

  try {
    const payload: SyncRecord[] = await req.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json(
        { error: 'Bad Request: Payload harus berupa array berisi data teknisi.' },
        { status: 400 }
      );
    }

    totalRecords = payload.length;

    // 3. Inisialisasi Log Sinkronisasi awal di Database
    const { data: logData, error: logError } = await supabaseAdmin
      .from('sync_logs')
      .insert({
        start_time: startTime,
        status: 'partial',
        total_records: totalRecords,
        processed_records: 0,
        new_records: 0,
        updated_records: 0,
        error_count: 0,
        error_details: []
      })
      .select('id')
      .single();

    if (logError) {
      console.error('Gagal membuat sync log:', logError);
    } else {
      syncLogId = logData.id;
    }

    // 4. Lakukan pemrosesan record secara sekuensial (baris per baris)
    for (let i = 0; i < payload.length; i++) {
      const row = payload[i];
      const rowNum = i + 1;

      try {
        // Ekstraksi nilai kolom wajib secara fleksibel (Mendukung Bahasa Inggris & Indonesia)
        const technician_id = String(getRowValue(row, ['technician_id', 'id_teknisi', 'id teknisi', 'id']) || '').trim();
        const employee_number = String(getRowValue(row, ['employee_number', 'no_karyawan', 'no karyawan', 'nik', 'nomor_karyawan', 'nomor karyawan']) || '').trim();
        const technician_name = String(getRowValue(row, ['technician_name', 'nama_teknisi', 'nama teknisi', 'nama', 'nama_lengkap', 'nama lengkap']) || '').trim();
        const branch = String(getRowValue(row, ['branch', 'cabang', 'wilayah']) || '').trim();

        if (!technician_id || !employee_number || !technician_name || !branch) {
          throw new Error('Kolom wajib (technician_id, employee_number, technician_name, branch) tidak boleh kosong.');
        }

        // Ekstraksi nilai kolom opsional secara fleksibel
        const service_center = getRowValue(row, ['service_center', 'service center', 'lokasi', 'lokasi_service', 'lokasi service']);
        const photo_url = getRowValue(row, ['photo_url', 'photo', 'foto', 'foto_url', 'link_foto', 'link foto']);
        const phone = getRowValue(row, ['phone', 'no_hp', 'no hp', 'telepon', 'phone_number', 'kontak', 'no_telp', 'no telp']);
        const email = getRowValue(row, ['email', 'surel']);
        const rawStatus = getRowValue(row, ['technician_status', 'status_teknisi', 'status teknisi', 'status', 'status_keaktifan', 'status keaktifan']);
        const rawLevel = getRowValue(row, ['technician_level', 'level_teknisi', 'level teknisi', 'level', 'sertifikasi', 'level_sertifikasi', 'level sertifikasi']);

        const techData = {
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
          updated_at: new Date().toISOString()
        };

        // B. Upsert data ke tabel utama: technicians
        const { data: existingTech } = await supabaseAdmin
          .from('technicians')
          .select('id, qr_token')
          .eq('technician_id', techData.technician_id)
          .maybeSingle();

        let techId: string;
        let qrToken: string;

        if (existingTech) {
          // UPDATE
          const { data: updatedTech, error: updateError } = await supabaseAdmin
            .from('technicians')
            .update(techData)
            .eq('id', existingTech.id)
            .select('id, qr_token')
            .single();

          if (updateError) throw updateError;
          techId = updatedTech.id;
          qrToken = updatedTech.qr_token;
          updatedRecords++;
        } else {
          // INSERT (Baru)
          const { data: newTech, error: insertError } = await supabaseAdmin
            .from('technicians')
            .insert(techData)
            .select('id, qr_token')
            .single();

          if (insertError) throw insertError;
          techId = newTech.id;
          qrToken = newTech.qr_token;
          newRecords++;
        }

        // C. Upsert data performa ke tabel: technician_performance
        const periodRaw = getRowValue(row, ['period', 'periode', 'bulan']);
        const period = parseExcelPeriod(periodRaw);
        if (period) {
          const kpiRaw = getRowValue(row, ['kpi_score', 'kpi', 'skor kpi', 'skor_kpi', 'nilai kpi', 'nilai_kpi']);
          const csiRaw = getRowValue(row, ['csi_score', 'csi', 'skor csi', 'skor_csi', 'nilai csi', 'nilai_csi']);
          const perfRaw = getRowValue(row, ['performance_score', 'performance', 'performa', 'skor_performa', 'skor performa', 'nilai_performa', 'nilai performa']);
          const perfLvlRaw = getRowValue(row, ['performance_level', 'level_performa', 'level performa']);

          const performanceData = {
            technician_id: techId,
            period,
            kpi_score: parseExcelNumber(kpiRaw),
            csi_score: parseExcelNumber(csiRaw),
            performance_score: parseExcelNumber(perfRaw),
            performance_level: perfLvlRaw ? mapLevel(perfLvlRaw) : mapLevel(rawLevel),
            data_source: 'excel',
            updated_at: new Date().toISOString()
          };

          const { error: perfError } = await supabaseAdmin
            .from('technician_performance')
            .upsert(performanceData, { onConflict: 'technician_id,period' });

          if (perfError) throw perfError;
        }

        // D. Upsert ID Card jika data card_number disertakan
        const card_number = getRowValue(row, ['card_number', 'no_kartu', 'no kartu', 'nomor kartu', 'nomor_kartu', 'serial_number', 'serial number']);
        if (card_number) {
          const cardStatusRaw = getRowValue(row, ['card_status', 'status_kartu', 'status kartu']);
          const expiryDateRaw = getRowValue(row, ['expiry_date', 'tanggal_kadaluarsa', 'tanggal kadaluarsa', 'expired', 'masa berlaku', 'masa_berlaku']);
          const expiry_date = parseExcelDate(expiryDateRaw);

          const cardData = {
            technician_id: techId,
            card_number: String(card_number).trim(),
            qr_token: qrToken,
            card_status: mapCardStatus(cardStatusRaw),
            expiry_date: expiry_date || new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]
          };

          const { error: cardError } = await supabaseAdmin
            .from('technician_id_cards')
            .upsert(cardData, { onConflict: 'card_number' });

          if (cardError) throw cardError;
        }

        processedRecords++;
      } catch (err: any) {
        console.error(`Error pada baris ${rowNum}:`, err.message);
        errorDetails.push({
          row: rowNum,
          technician_id: String(row.technician_id || 'UNKNOWN'),
          error: err.message || 'Error tidak dikenal saat memproses baris database.'
        });
      }
    }

    // 5. Finalisasi Log Sinkronisasi ke Database
    const endTime = new Date().toISOString();
    const finalStatus = errorDetails.length === 0 ? 'success' : (processedRecords === 0 ? 'failed' : 'partial');

    if (syncLogId) {
      await supabaseAdmin
        .from('sync_logs')
        .update({
          end_time: endTime,
          status: finalStatus,
          processed_records: processedRecords,
          new_records: newRecords,
          updated_records: updatedRecords,
          error_count: errorDetails.length,
          error_details: errorDetails
        })
        .eq('id', syncLogId);
    }

    return NextResponse.json({
      status: finalStatus,
      total_records: totalRecords,
      processed_records: processedRecords,
      new_records: newRecords,
      updated_records: updatedRecords,
      error_count: errorDetails.length,
      errors: errorDetails
    });

  } catch (globalErr: any) {
    console.error('Global sync API error:', globalErr);
    return NextResponse.json(
      { error: 'Internal Server Error', details: globalErr.message },
      { status: 500 }
    );
  }
}
