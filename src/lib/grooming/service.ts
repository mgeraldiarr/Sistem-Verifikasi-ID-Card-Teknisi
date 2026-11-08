// src/lib/grooming/service.ts
import { supabase } from '@/lib/supabase';
import { GroomingReport, GroomingStatus, ServiceTypeCode } from '@/types';
import { getIsoWeekString } from './period';

const STORAGE_BUCKET = 'employee-photos';

/**
 * Mengunggah file foto grooming ke Supabase Storage.
 */
export async function uploadGroomingPhoto(file: File, pathPrefix: string): Promise<string> {
  const fileExt = 'jpg';
  const fileName = `grooming/${pathPrefix}-${crypto.randomUUID()}.${fileExt}`;

  // Coba unggah ke bucket employee-photos
  let { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, file, { contentType: 'image/jpeg', upsert: true });

  // Fallback bila bucket khusus 'grooming-photos' dipakai di beberapa environment
  if (error && error.message.toLowerCase().includes('bucket not found')) {
    const fallbackRes = await supabase.storage
      .from('grooming-photos')
      .upload(fileName, file, { contentType: 'image/jpeg', upsert: true });
    if (!fallbackRes.error) {
      return supabase.storage.from('grooming-photos').getPublicUrl(fileName).data.publicUrl;
    }
  }

  if (error) {
    throw new Error(`Gagal mengunggah foto grooming: ${error.message}`);
  }

  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName).data.publicUrl;
}

export interface SubmitGroomingParams {
  technician_id: string;
  technician_name: string;
  branch: string;
  service_type: ServiceTypeCode;
  period_week: string;
  is_monday: boolean;
  uniform_checked: boolean;
  pants_checked: boolean;
  hair_checked: boolean;
  face_checked: boolean;
  photo_full_file: File;
  photo_face_file: File;
  notes?: string;
}

/**
 * Mengirim laporan grooming mingguan.
 * Menggunakan endpoint server-side /api/grooming/submit (Service Role)
 * dengan auto-refresh token JWT jika sesi telah mendekati/melewati waktu kedaluwarsa.
 */
export async function submitGroomingReport(params: SubmitGroomingParams): Promise<GroomingReport> {
  // 1. Ambil sesi aktif; jika token sudah mendekati kedaluwarsa, lakukan refresh otomatis
  let session = (await supabase.auth.getSession()).data.session;

  const isExpiredOrClose = session?.expires_at
    ? session.expires_at * 1000 < Date.now() + 60 * 1000
    : true;

  if (isExpiredOrClose) {
    const refreshRes = await supabase.auth.refreshSession();
    if (refreshRes.data.session) {
      session = refreshRes.data.session;
    }
  }

  if (!session?.access_token) {
    throw new Error('Sesi autentikasi telah berakhir. Silakan login kembali ke portal.');
  }

  const buildFormData = () => {
    const formData = new FormData();
    formData.append('photo_full', params.photo_full_file);
    formData.append('photo_face', params.photo_face_file);
    formData.append('technician_id', params.technician_id);
    formData.append('technician_name', params.technician_name);
    formData.append('branch', params.branch);
    formData.append('service_type', params.service_type);
    formData.append('period_week', params.period_week);
    formData.append('is_monday', String(params.is_monday));
    formData.append('uniform_checked', String(params.uniform_checked));
    formData.append('pants_checked', String(params.pants_checked));
    formData.append('hair_checked', String(params.hair_checked));
    formData.append('face_checked', String(params.face_checked));
    if (params.notes) {
      formData.append('notes', params.notes);
    }
    return formData;
  };

  let res = await fetch('/api/grooming/submit', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: buildFormData(),
  });

  // 2. Jika server mengembalikan 401 (token kedaluwarsa di server), refresh token sekali lagi dan coba ulang
  if (res.status === 401) {
    const refreshRes = await supabase.auth.refreshSession();
    if (refreshRes.data.session?.access_token) {
      session = refreshRes.data.session;
      res = await fetch('/api/grooming/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: buildFormData(),
      });
    }
  }

  const resJson = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(resJson.error || 'Gagal mengirimkan laporan grooming.');
  }

  return resJson.data as GroomingReport;
}

/**
 * Mengambil laporan grooming teknisi untuk minggu tertentu (default: minggu ini).
 */
export async function getTechnicianWeekGrooming(
  technicianId: string,
  periodWeek = getIsoWeekString()
): Promise<GroomingReport | null> {
  const { data, error } = await supabase
    .from('technician_grooming_reports')
    .select('*')
    .eq('technician_id', technicianId)
    .eq('period_week', periodWeek)
    .maybeSingle();

  if (error) {
    // Tangani bila tabel belum dibuat di Supabase agar tidak membuat UI error
    if (error.code === 'PGRST205' || error.message?.includes('not find the table')) {
      console.warn(
        'Tabel public.technician_grooming_reports belum dibuat di Supabase. Harap jalankan migrasi supabase/migrations/20261108_create_grooming_reports.sql di Supabase SQL Editor.'
      );
      return null;
    }
    console.error('Error fetching weekly grooming report:', error.message || error);
    return null;
  }

  return data as GroomingReport | null;
}

/**
 * Filter opsi untuk query admin
 */
export interface AdminGroomingFilters {
  period_week?: string;
  branch?: string;
  service_type?: string;
  status?: GroomingStatus | 'all';
  search?: string;
}

/**
 * Mengambil seluruh laporan grooming untuk portal admin.
 */
export async function getAdminGroomingReports(filters: AdminGroomingFilters): Promise<GroomingReport[]> {
  let query = supabase
    .from('technician_grooming_reports')
    .select('*')
    .order('submission_time', { ascending: false });

  if (filters.period_week) {
    query = query.eq('period_week', filters.period_week);
  }
  if (filters.branch) {
    query = query.eq('branch', filters.branch);
  }
  if (filters.service_type) {
    query = query.eq('service_type', filters.service_type);
  }
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('not find the table')) {
      console.warn(
        'Tabel public.technician_grooming_reports belum dibuat di Supabase. Harap jalankan migrasi supabase/migrations/20261108_create_grooming_reports.sql di Supabase SQL Editor.'
      );
      return [];
    }
    console.error('Error fetching admin grooming reports:', error.message || error);
    return [];
  }

  let list = (data || []) as GroomingReport[];
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (r) =>
        r.technician_name.toLowerCase().includes(q) ||
        r.technician_id.toLowerCase().includes(q) ||
        r.branch.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Admin memberikan status review: Approved / Rejected
 */
export async function reviewGroomingReport(
  reportId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('technician_grooming_reports')
    .update({
      status,
      reviewed_by: user?.id || null,
      reviewed_at: new Date().toISOString(),
      rejection_reason: status === 'rejected' ? rejectionReason || null : null,
    })
    .eq('id', reportId);

  if (error) {
    throw new Error(`Gagal memproses review: ${error.message}`);
  }

  return true;
}
