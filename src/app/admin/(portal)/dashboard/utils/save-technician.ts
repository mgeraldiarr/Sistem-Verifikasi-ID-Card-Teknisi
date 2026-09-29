// src/app/admin/(portal)/dashboard/utils/save-technician.ts
import { supabase } from '@/lib/supabase';
import { Technician, TechnicianFormData } from '@/types';

const PHOTO_BUCKET = 'employee-photos';
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

/** Ekstensi ditentukan dari tipe MIME, bukan dari nama file kiriman pengguna. */
const ALLOWED_PHOTO_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

/** Memeriksa foto sebelum diunggah. Mengembalikan pesan error, atau null bila valid. */
export function validateTechnicianPhoto(file: File): string | null {
  if (!ALLOWED_PHOTO_TYPES[file.type]) return 'Foto harus berformat JPG atau PNG.';
  if (file.size > MAX_PHOTO_BYTES) return 'Ukuran foto melebihi batas maksimal 2MB.';
  return null;
}

/** Mengunggah foto teknisi dan mengembalikan URL publiknya. Melempar error bila gagal. */
export async function uploadTechnicianPhoto(file: File): Promise<string> {
  const invalid = validateTechnicianPhoto(file);
  if (invalid) throw new Error(invalid);

  const fileName = `tech-${crypto.randomUUID()}.${ALLOWED_PHOTO_TYPES[file.type]}`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(fileName, file, { contentType: file.type });

  if (error) throw new Error(`Gagal upload foto: ${error.message}`);

  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(fileName).data.publicUrl;
}

/** csi_score lama berskala 1-10, sedangkan CSAT baru berskala 0-100. */
function toCsiScore(csat: number): number {
  return csat > 0 && csat <= 10 ? csat : Math.round((csat / 10) * 10) / 10;
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function hasPerformanceData(form: TechnicianFormData): boolean {
  return [
    form.tat,
    form.rtat,
    form.csat,
    form.grooming_score,
    form.service_score,
    form.repair_quality_score,
    form.performance_score,
  ].some((value) => value !== undefined);
}

interface SaveTechnicianOptions {
  /** id baris teknisi yang diedit; null = data baru */
  formId: string | null;
  formData: TechnicianFormData;
  /** Data teknisi sebelum diedit (untuk foto lama & periode KPI) */
  existing: Technician | undefined;
  photoUrl: string | null;
}

/**
 * Menyimpan teknisi beserta kartu ID dan 6 indikator KPI periode berjalan.
 * Melempar error Supabase bila salah satu langkah gagal.
 */
export async function saveTechnician({
  formId,
  formData,
  existing,
  photoUrl,
}: SaveTechnicianOptions): Promise<void> {
  const techPayload = {
    technician_id: formData.technician_id,
    employee_number: formData.employee_number,
    technician_name: formData.technician_name,
    branch: formData.branch,
    service_center: formData.service_center || null,
    phone: formData.phone || null,
    email: formData.email || null,
    technician_status: formData.technician_status,
    technician_level: formData.technician_level,
    photo_url: photoUrl || null,
    updated_at: new Date().toISOString(),
  };

  // 1. Data teknisi
  const query = formId
    ? supabase.from('technicians').update(techPayload).eq('id', formId)
    : supabase.from('technicians').insert([techPayload]);

  const { data: saved, error: techError } = await query.select('id, qr_token').single();
  if (techError) throw techError;

  // 2. Kartu ID — nomor seri = ID teknisi (kartu lama tetap memakai nomor aslinya)
  const cardNumber = formData.card_number || formData.technician_id;
  if (cardNumber) {
    const { error: cardError } = await supabase.from('technician_id_cards').upsert(
      {
        technician_id: saved.id,
        card_number: cardNumber,
        qr_token: saved.qr_token,
        card_status: formData.card_status,
        expiry_date: formData.expiry_date,
      },
      { onConflict: 'card_number' }
    );
    if (cardError) throw cardError;
  }

  // 3. Performa (6 indikator KPI)
  if (!hasPerformanceData(formData)) return;

  const period = existing?.technician_performance?.[0]?.period || currentPeriod();
  const finalScore = formData.performance_score ?? 0;

  const basePerformance = {
    technician_id: saved.id,
    period,
    kpi_score: finalScore,
    csi_score: toCsiScore(formData.csat ?? 0),
    performance_score: finalScore,
    performance_level: formData.technician_level,
    data_source: 'web_form',
    updated_at: new Date().toISOString(),
  };

  const { error: perfError } = await supabase.from('technician_performance').upsert(
    {
      ...basePerformance,
      tat: formData.tat ?? null,
      rtat: formData.rtat ?? null,
      csat: formData.csat ?? null,
      grooming_score: formData.grooming_score ?? null,
      service_score: formData.service_score ?? null,
      repair_quality_score: formData.repair_quality_score ?? null,
    },
    { onConflict: 'technician_id,period' }
  );

  // Database lama yang belum dimigrasi 6 kolom indikator: simpan skor totalnya saja
  const isMissingColumn =
    perfError?.message?.includes('schema cache') || perfError?.message?.includes('does not exist');

  if (isMissingColumn) {
    await supabase
      .from('technician_performance')
      .upsert(basePerformance, { onConflict: 'technician_id,period' });
  } else if (perfError) {
    throw perfError;
  }
}
