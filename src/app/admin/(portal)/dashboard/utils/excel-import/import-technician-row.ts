// src/app/admin/(portal)/dashboard/utils/excel-import/import-technician-row.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { getBranchCode, getNextSequenceNumber } from '@/constants/branch-codes';
import { calculateHybridKpi, KpiWeights } from '@/lib/kpi';
import { escapeIlike, sanitizeOrFilterValue } from '@/lib/postgrest-filters';
import { ParsedExcelRow } from './parse-excel-row';

interface ExistingTechnician {
  id: string;
  technician_id: string;
  employee_number: string;
  branch: string | null;
}

/** Perbandingan nama cabang yang toleran terhadap beda spasi & huruf besar/kecil */
export const isSameBranch = (a: string, b: string) =>
  a.trim().replace(/\s+/g, ' ').toLowerCase() === b.trim().replace(/\s+/g, ' ').toLowerCase();

const isMissingColumnError = (message?: string) =>
  Boolean(message?.includes('schema cache') || message?.includes('does not exist'));

function defaultExpiryDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 2);
  return date.toISOString().split('T')[0];
}

/**
 * Pengalokasi ID teknisi DSC-[KODE]-[NNN] selama satu kali impor.
 * ID yang sudah ada di database dimuat sekali per kode cabang, lalu setiap ID
 * baru dicatat agar baris berikutnya dalam file yang sama mendapat nomor +1.
 */
export function createTechnicianIdAllocator(supabase: SupabaseClient) {
  const idsByCode = new Map<string, string[]>();

  return {
    async allocate(branch: string): Promise<string> {
      const code = getBranchCode(branch);

      if (!idsByCode.has(code)) {
        const { data } = await supabase
          .from('technicians')
          .select('technician_id')
          .or(
            `branch.ilike.%${sanitizeOrFilterValue(branch)}%,technician_id.ilike.DSC-${code}-%,technician_id.ilike.MOD-${code}-%`
          );
        idsByCode.set(code, (data ?? []).map((t) => t.technician_id).filter(Boolean));
      }

      const list = idsByCode.get(code)!;
      const id = `DSC-${code}-${getNextSequenceNumber(list, code)}`;
      list.push(id);
      return id;
    },

    /** Catat ID yang dipakai baris ini agar tidak dialokasikan ulang */
    remember(branch: string, technicianId: string) {
      const list = idsByCode.get(getBranchCode(branch));
      if (list && !list.includes(technicianId)) list.push(technicianId);
    },
  };
}

async function findExistingTechnician(
  supabase: SupabaseClient,
  row: ParsedExcelRow
): Promise<ExistingTechnician | null> {
  const columns = 'id, technician_id, employee_number, branch';

  if (row.technicianId) {
    const { data } = await supabase
      .from('technicians')
      .select(columns)
      .eq('technician_id', row.technicianId)
      .maybeSingle();
    if (data) return data;
  }

  // Tanpa ID: cocokkan nama + cabang persis (wildcard di-escape)
  const { data } = await supabase
    .from('technicians')
    .select(columns)
    .ilike('technician_name', escapeIlike(row.technicianName))
    .ilike('branch', escapeIlike(row.branch))
    .maybeSingle();
  return data;
}

interface ImportRowContext {
  supabase: SupabaseClient;
  /** Cabang Admin Cabang (null = akses nasional) */
  restrictBranch: string | null;
  kpiWeights?: KpiWeights;
  idAllocator: ReturnType<typeof createTechnicianIdAllocator>;
}

/**
 * Menyimpan satu baris impor: data teknisi, performa periode, dan kartu ID.
 * Mengembalikan 'insert' atau 'update'; melempar Error bila baris ditolak/gagal.
 */
export async function importTechnicianRow(
  row: ParsedExcelRow,
  { supabase, restrictBranch, kpiWeights, idAllocator }: ImportRowContext
): Promise<'insert' | 'update'> {
  // Admin Cabang hanya boleh mengunggah data cabangnya sendiri
  if (restrictBranch && !isSameBranch(row.branch, restrictBranch)) {
    throw new Error(
      `Baris ini milik cabang "${row.branch}", sedangkan Anda hanya berwenang atas cabang "${restrictBranch}". Data ditolak.`
    );
  }

  const existing = await findExistingTechnician(supabase, row);

  // Cegah Admin Cabang "memindahkan" teknisi cabang lain lewat technician_id di file
  if (restrictBranch && existing?.branch && !isSameBranch(existing.branch, restrictBranch)) {
    throw new Error(
      `Teknisi "${row.technicianName}" sudah terdaftar di cabang "${existing.branch}" dan tidak dapat dipindahkan oleh Admin Cabang "${restrictBranch}".`
    );
  }

  const technicianId =
    row.technicianId || existing?.technician_id || (await idAllocator.allocate(row.branch));
  const employeeNumber =
    row.employeeNumber ||
    existing?.employee_number ||
    `10${Math.floor(100000 + Math.random() * 900000)}`;
  idAllocator.remember(row.branch, technicianId);

  // Skor & level: pakai nilai klien bila ada, selain itu hitung dari 6 indikator
  const { score, level } = calculateHybridKpi(row.indicators, row.clientScore, row.clientLevel, kpiWeights);

  // 1. Data teknisi
  const techPayload = {
    technician_id: technicianId,
    employee_number: employeeNumber,
    technician_name: row.technicianName,
    branch: row.branch,
    service_center: row.serviceCenter,
    photo_url: row.photoUrl,
    phone: row.phone,
    email: row.email,
    technician_status: row.technicianStatus,
    technician_level: level,
    updated_at: new Date().toISOString(),
  };

  const techQuery = existing
    ? supabase.from('technicians').update(techPayload).eq('id', existing.id)
    : supabase.from('technicians').insert([techPayload]);
  const { data: saved, error: techError } = await techQuery.select('id, qr_token').single();
  if (techError) throw techError;

  // 2. Performa periode (upsert per teknisi + periode)
  const csat = row.indicators.csat;
  const basePerformance = {
    technician_id: saved.id,
    period: row.period,
    kpi_score: score,
    // csi_score lama berskala 1-10
    csi_score: csat > 0 && csat <= 10 ? csat : Math.round((csat / 10) * 10) / 10,
    performance_score: score,
    performance_level: level,
    data_source: 'excel_12_col',
    updated_at: new Date().toISOString(),
  };

  const { error: perfError } = await supabase.from('technician_performance').upsert(
    {
      ...basePerformance,
      tat: row.indicators.tat || null,
      rtat: row.indicators.rtat || null,
      csat: row.indicators.csat || null,
      grooming_score: row.indicators.grooming_score || null,
      service_score: row.indicators.service_score || null,
      repair_quality_score: row.indicators.repair_quality_score || null,
    },
    { onConflict: 'technician_id,period' }
  );

  if (isMissingColumnError(perfError?.message)) {
    // Database lama tanpa 6 kolom indikator: simpan skor totalnya saja
    const { error } = await supabase
      .from('technician_performance')
      .upsert(basePerformance, { onConflict: 'technician_id,period' });
    if (error) throw error;
  } else if (perfError) {
    throw perfError;
  }

  // 3. Kartu ID — kartu yang sudah ada tetap memakai nomor seri lamanya
  const { data: existingCard } = await supabase
    .from('technician_id_cards')
    .select('card_number')
    .eq('technician_id', saved.id)
    .maybeSingle();

  const { error: cardError } = await supabase.from('technician_id_cards').upsert(
    {
      technician_id: saved.id,
      card_number: existingCard?.card_number ?? row.cardNumber ?? technicianId,
      qr_token: saved.qr_token,
      card_status: row.cardStatus,
      expiry_date: row.expiryDate || defaultExpiryDate(),
    },
    { onConflict: 'card_number' }
  );
  if (cardError) throw cardError;

  return existing ? 'update' : 'insert';
}
