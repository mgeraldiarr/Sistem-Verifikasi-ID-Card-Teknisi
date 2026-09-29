// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { createRateLimiter, getClientIp } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Pesan tunggal untuk semua kegagalan agar ID/email tidak bisa dienumerasi
const GENERIC_ERROR =
  'ID Pengguna atau kata sandi salah. Periksa kembali kredensial Anda.';

// Batasi percobaan masuk per-IP (5 percobaan / menit) untuk menahan tebak kata sandi
const loginLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 5 });

type LoginKind = 'technician' | 'branch_admin' | 'super_admin';

interface ResolvedLogin {
  email: string;
  /** Peran yang diizinkan untuk jenis ID ini; dicocokkan lagi setelah verifikasi sandi */
  kind: LoginKind;
}

// Format ID resmi: DSC-BAL-001 (teknisi) & ADM-BAL-01 (Admin Cabang).
// Karakter dibatasi agar aman dipakai pada filter PostgREST.
const TECHNICIAN_ID_PATTERN = /^DSC-[A-Z0-9]{2,6}-\d{1,6}$/;
const ADMIN_ID_PATTERN = /^ADM-[A-Z0-9]{2,6}-\d{1,6}$/;

/**
 * Memetakan ID Pengguna ke email akun login-nya.
 * - ADM-...  -> user_profiles.admin_id (Admin Cabang)
 * - DSC-...  -> technicians.technician_id (Teknisi)
 * - email    -> khusus Super Admin
 * Dijalankan dengan service role di server sehingga tidak menembus RLS klien.
 */
async function resolveIdentifier(identifier: string): Promise<ResolvedLogin | null> {
  if (identifier.includes('@')) {
    return { email: identifier.toLowerCase(), kind: 'super_admin' };
  }

  const id = identifier.toUpperCase();

  if (ADMIN_ID_PATTERN.test(id)) {
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('email, is_active')
      .eq('admin_id', id)
      .maybeSingle();

    if (!profile || !profile.is_active) return null;
    return { email: profile.email, kind: 'branch_admin' };
  }

  if (TECHNICIAN_ID_PATTERN.test(id)) {
    const { data: technician } = await supabaseAdmin
      .from('technicians')
      .select('id')
      .eq('technician_id', id)
      .maybeSingle();

    if (!technician) return null;

    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('email, is_active')
      .eq('technician_id', technician.id)
      .maybeSingle();

    if (!profile || !profile.is_active) return null;
    return { email: profile.email, kind: 'technician' };
  }

  return null;
}

export async function POST(req: NextRequest) {
  // 1. Rate limiting
  if (!loginLimiter.allow(getClientIp(req))) {
    return NextResponse.json(
      {
        error:
          'Terlalu banyak percobaan masuk. Silakan tunggu satu menit sebelum mencoba lagi.',
      },
      { status: 429 }
    );
  }

  // 2. Validasi payload
  let body: { identifier?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }

  const identifier = String(body.identifier ?? '').trim();
  const password = String(body.password ?? '');

  if (!identifier || !password) {
    return NextResponse.json(
      { error: 'ID Pengguna dan kata sandi wajib diisi.' },
      { status: 400 }
    );
  }

  // 3. Petakan ID Pengguna ke email akun
  const resolved = await resolveIdentifier(identifier);
  if (!resolved) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }
  const { email } = resolved;

  // 4. Verifikasi kredensial memakai anon key (bukan service role)
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await authClient.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  // 5. Pastikan akun punya profil peran resmi dan masih aktif
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role, is_active, must_change_password')
    .eq('id', data.session.user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json(
      {
        error:
          'Akun ini belum memiliki profil peran resmi. Hubungi Super Admin untuk aktivasi akses.',
      },
      { status: 403 }
    );
  }

  // Jenis ID harus sesuai peran akun: email hanya untuk Super Admin,
  // ADM- hanya untuk Admin Cabang, DSC- hanya untuk Teknisi.
  if (profile.role !== resolved.kind) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  if (!profile.is_active) {
    return NextResponse.json(
      {
        error:
          'Akun Anda telah dinonaktifkan oleh administrator. Hubungi Super Admin MODENA.',
      },
      { status: 403 }
    );
  }

  // 6. Kembalikan token sesi agar klien memanggil supabase.auth.setSession()
  return NextResponse.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    role: profile.role,
    must_change_password: Boolean(profile.must_change_password),
  });
}