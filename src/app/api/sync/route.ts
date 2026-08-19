// src/app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Interface untuk validasi payload data Excel yang masuk
interface SyncRecord {
  technician_id: string; // Format: MOD-Txxx
  employee_number: string;
  technician_name: string;
  branch: string;
  service_center?: string;
  photo_url?: string;
  phone?: string;
  email?: string;
  technician_status: 'active' | 'inactive';
  technician_level: 'beginner' | 'intermediate' | 'advance';
  period: string; // Format: YYYY-MM
  kpi_score: number;
  csi_score: number;
  performance_score: number;
  performance_level: 'beginner' | 'intermediate' | 'advance';
  card_number?: string;
  card_status?: 'active' | 'suspended' | 'expired';
  expiry_date?: string; // Format: YYYY-MM-DD
}

// HELPER SINKRONISASI EXCEL (Mendukung Header Inggris/Indonesia, Tanggal Excel, & Translasi Nilai)
const getRowValue = (row: any, keys: string[]) => {
  for (const rawKey of Object.keys(row)) {
    const normKey = rawKey.toLowerCase().replace(/[\s_\-\/]/g, '');
    if (keys.some(k => k.toLowerCase().replace(/[\s_\-\/]/g, '') === normKey)) {
      return row[rawKey];
    }
  }
  return undefined;
};

const parseExcelDate = (val: any) => {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return null;
};

const parseExcelNumber = (val: any) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const str = String(val).trim().replace(',', '.');
  const num = Number(str);
  return isNaN(num) ? 0 : num;
};

const parseExcelPeriod = (val: any) => {
  if (!val) return null;
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}$/.test(str)) return str;
  const parts = str.split(/[\/\-]/);
  if (parts.length === 2) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}`;
    } else {
      return `${parts[1]}-${parts[0].padStart(2, '0')}`;
    }
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  return null;
};

const mapStatus = (val: any): 'active' | 'inactive' => {
  if (!val) return 'active';
  const str = String(val).trim().toLowerCase();
  if (['aktif', 'active', 'yes', '1', 'true', 'aktif/active'].includes(str)) return 'active';
  if (['nonaktif', 'tidak aktif', 'inactive', 'no', '0', 'false', 'blokir', 'diblokir', 'non-aktif', 'non_aktif'].includes(str)) return 'inactive';
  return 'active';
};

const mapLevel = (val: any): 'beginner' | 'intermediate' | 'advance' => {
  if (!val) return 'beginner';
  const str = String(val).trim().toLowerCase();
  if (['beginner', 'pemula', 'basic', 'begginer'].includes(str)) return 'beginner';
  if (['intermediate', 'menengah', 'madya'].includes(str)) return 'intermediate';
  if (['advance', 'advanced', 'mahir', 'senior', 'adv'].includes(str)) return 'advance';
  return 'beginner';
};

const mapCardStatus = (val: any): 'active' | 'suspended' | 'expired' => {
  if (!val) return 'active';
  const str = String(val).trim().toLowerCase();
  if (['aktif', 'active', 'yes', '1', 'true'].includes(str)) return 'active';
  if (['suspended', 'ditangguhkan', 'suspend', 'tangguh'].includes(str)) return 'suspended';
  if (['expired', 'kadaluarsa', 'habis', 'exp'].includes(str)) return 'expired';
  return 'active';
};

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

  // 3. Otorisasi Token Rahasia (Bypass RLS via Service-to-Server)
  const authHeader = req.headers.get('authorization');
  const secretToken = process.env.SYNC_SECRET_TOKEN;

  if (!secretToken) {
    return NextResponse.json(
      { error: 'SYNC_SECRET_TOKEN belum dikonfigurasi di server.' },
      { status: 500 }
    );
  }

  if (!authHeader || authHeader !== `Bearer ${secretToken}`) {
    return NextResponse.json(
      { error: 'Unauthorized: Token sinkronisasi tidak valid.' },
      { status: 401 }
    );
  }

  let syncLogId: string | null = null;
  let totalRecords = 0;
  let processedRecords = 0;
  let newRecords = 0;
  let updatedRecords = 0;
  const errorDetails: Array<{ row: number; technician_id?: string; error: string }> = [];

  try {
    // 4. Baca dan Batasi Ukuran Body Payload (Maksimal 2 MB)
    const bodyText = await req.text();
    if (bodyText.length > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Payload Too Large: Ukuran payload maksimal adalah 2 MB.' },
        { status: 413 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(bodyText);
    } catch (parseErr) {
      return NextResponse.json(
        { error: 'Bad Request: Format JSON tidak valid.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(payload)) {
      return NextResponse.json(
        { error: 'Format payload tidak valid. Harus berupa JSON Array.' },
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
