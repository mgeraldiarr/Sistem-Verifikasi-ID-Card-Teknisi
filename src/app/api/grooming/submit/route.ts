// src/app/api/grooming/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { authenticateCaller, jsonError } from '@/lib/server/api-auth';
import { GroomingReport } from '@/types';

export const dynamic = 'force-dynamic';

const STORAGE_BUCKET = 'employee-photos';

/**
 * Endpoint server-side untuk mengunggah foto grooming dan menyimpan laporan ke database.
 * Menggunakan `supabaseAdmin` (Service Role) agar tidak terhalang policy RLS Storage.
 */
export async function POST(req: NextRequest) {
  // 1. Verifikasi sesi login & peran (hanya teknisi, super admin, atau branch admin)
  const auth = await authenticateCaller(
    req,
    ['technician', 'super_admin', 'branch_admin'],
    'Peran Anda tidak memiliki izin untuk mengirimkan laporan grooming.'
  );
  if ('error' in auth) return auth.error;
  const caller = auth.caller;

  try {
    // 2. Baca FormData
    const formData = await req.formData();
    const photoFull = formData.get('photo_full') as File | null;
    const photoFace = formData.get('photo_face') as File | null;
    const technicianId = (formData.get('technician_id') as string | null)?.trim();
    const technicianName = (formData.get('technician_name') as string | null)?.trim();
    const branch = (formData.get('branch') as string | null)?.trim();
    const serviceType = ((formData.get('service_type') as string | null) || 'DSC').trim();
    const periodWeek = (formData.get('period_week') as string | null)?.trim();
    const isMonday = formData.get('is_monday') === 'true';
    const uniformChecked = formData.get('uniform_checked') === 'true';
    const pantsChecked = formData.get('pants_checked') === 'true';
    const hairChecked = formData.get('hair_checked') === 'true';
    const faceChecked = formData.get('face_checked') === 'true';
    const notes = (formData.get('notes') as string | null)?.trim() || null;

    if (!photoFull || !photoFace) {
      return jsonError('Foto badan penuh dan foto wajah close-up wajib disertakan.', 400);
    }

    if (!technicianId || !periodWeek) {
      return jsonError('Data ID teknisi dan periode minggu wajib diisi.', 400);
    }

    // 3. Jika pengguna adalah teknisi, validasi kepemilikan akun teknisi
    if (caller.role === 'technician') {
      if (caller.technician_id) {
        const { data: techRow } = await supabaseAdmin
          .from('technicians')
          .select('technician_id')
          .eq('id', caller.technician_id)
          .maybeSingle();

        if (techRow && techRow.technician_id !== technicianId) {
          return jsonError('Anda hanya dapat mengirimkan laporan atas ID teknisi Anda sendiri.', 403);
        }
      }
    }

    // 4. Pastikan bucket storage tersedia
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === STORAGE_BUCKET);
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, { public: true });
    }

    // 5. Unggah kedua foto ke Supabase Storage via Service Role (bypass RLS storage)
    const fullBuffer = Buffer.from(await photoFull.arrayBuffer());
    const faceBuffer = Buffer.from(await photoFace.arrayBuffer());

    const fullFileName = `grooming/full-${technicianId}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.jpg`;
    const faceFileName = `grooming/face-${technicianId}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.jpg`;

    const [fullUploadRes, faceUploadRes] = await Promise.all([
      supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(fullFileName, fullBuffer, { contentType: 'image/jpeg', upsert: true }),
      supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(faceFileName, faceBuffer, { contentType: 'image/jpeg', upsert: true }),
    ]);

    if (fullUploadRes.error) {
      console.error('Error uploading full photo:', fullUploadRes.error);
      return jsonError(`Gagal mengunggah foto badan penuh: ${fullUploadRes.error.message}`, 500);
    }

    if (faceUploadRes.error) {
      console.error('Error uploading face photo:', faceUploadRes.error);
      return jsonError(`Gagal mengunggah foto wajah: ${faceUploadRes.error.message}`, 500);
    }

    const photoFullUrl = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(fullFileName).data.publicUrl;
    const photoFaceUrl = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(faceFileName).data.publicUrl;

    // 6. Simpan atau perbarui record ke tabel technician_grooming_reports
    const { data: report, error: insertError } = await supabaseAdmin
      .from('technician_grooming_reports')
      .upsert(
        {
          technician_id: technicianId,
          technician_name: technicianName || technicianId,
          branch: branch || 'Service Center',
          service_type: serviceType,
          period_week: periodWeek,
          is_monday: isMonday,
          uniform_checked: uniformChecked,
          pants_checked: pantsChecked,
          hair_checked: hairChecked,
          face_checked: faceChecked,
          photo_full_url: photoFullUrl,
          photo_face_url: photoFaceUrl,
          notes: notes,
          status: 'submitted',
          rejection_reason: null,
          reviewed_by: null,
          reviewed_at: null,
        },
        { onConflict: 'technician_id,period_week' }
      )
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting grooming report:', insertError);
      return jsonError(`Gagal menyimpan data laporan grooming: ${insertError.message}`, 500);
    }

    return NextResponse.json({ success: true, data: report as GroomingReport });
  } catch (err: unknown) {
    console.error('Unexpected error in grooming submit API:', err);
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan pada server saat memproses laporan.';
    return jsonError(msg, 500);
  }
}
