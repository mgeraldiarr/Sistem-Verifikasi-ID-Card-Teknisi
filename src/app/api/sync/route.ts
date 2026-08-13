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

export async function POST(req: NextRequest) {
  const startTime = new Date().toISOString();
  
  // 1. Otorisasi Token Rahasia (Bypass RLS via Service-to-Server)
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
    // 2. Baca Body Payload
    const payload = await req.json();
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
      const record = payload[i] as Partial<SyncRecord>;
      const rowNum = i + 1;

      try {
        // A. Validasi Wajib Field
        if (!record.technician_id || !record.employee_number || !record.technician_name || !record.branch) {
          throw new Error('Kolom wajib (technician_id, employee_number, technician_name, branch) tidak boleh kosong.');
        }

        // Validasi Status Teknisi
        if (record.technician_status && !['active', 'inactive'].includes(record.technician_status)) {
          throw new Error(`Status teknisi harus 'active' atau 'inactive' (Ditemukan: ${record.technician_status}).`);
        }

        // Validasi Level Teknisi
        if (record.technician_level && !['beginner', 'intermediate', 'advance'].includes(record.technician_level)) {
          throw new Error(`Level teknisi harus 'beginner', 'intermediate', atau 'advance'.`);
        }

        // Validasi Skor Angka
        if (record.kpi_score !== undefined && (record.kpi_score < 0 || record.kpi_score > 100)) {
          throw new Error('Skor KPI harus berada di kisaran 0 hingga 100.');
        }
        if (record.csi_score !== undefined && (record.csi_score < 0 || record.csi_score > 10)) {
          throw new Error('Skor CSI harus berada di kisaran 0 hingga 10.');
        }

        // Validasi Periode (Format YYYY-MM)
        if (!record.period || !/^\d{4}-\d{2}$/.test(record.period)) {
          throw new Error('Periode tidak valid. Gunakan format YYYY-MM (contoh: 2026-08).');
        }

        // B. Upsert data ke tabel utama: technicians
        // Cek dulu apakah teknisi sudah terdaftar berdasarkan technician_id unik
        const { data: existingTech } = await supabaseAdmin
          .from('technicians')
          .select('id, qr_token')
          .eq('technician_id', record.technician_id)
          .maybeSingle();

        let techId: string;
        let qrToken: string;
        let isNew = false;

        const techData = {
          technician_id: record.technician_id,
          employee_number: record.employee_number,
          technician_name: record.technician_name,
          branch: record.branch,
          service_center: record.service_center || null,
          photo_url: record.photo_url || null,
          phone: record.phone || null,
          email: record.email || null,
          technician_status: record.technician_status || 'active',
          technician_level: record.technician_level || 'beginner',
          updated_at: new Date().toISOString()
        };

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
          isNew = true;
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
        const performanceData = {
          technician_id: techId,
          period: record.period,
          kpi_score: record.kpi_score || 0,
          csi_score: record.csi_score || 0,
          performance_score: record.performance_score || 0,
          performance_level: record.performance_level || record.technician_level || 'beginner',
          data_source: 'excel',
          updated_at: new Date().toISOString()
        };

        const { error: perfError } = await supabaseAdmin
          .from('technician_performance')
          .upsert(performanceData, { onConflict: 'technician_id,period' });

        if (perfError) throw perfError;

        // D. Upsert ID Card jika data card_number disertakan
        if (record.card_number) {
          const cardData = {
            technician_id: techId,
            card_number: record.card_number,
            qr_token: qrToken,
            card_status: record.card_status || 'active',
            expiry_date: record.expiry_date || new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]
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
          technician_id: record.technician_id,
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
