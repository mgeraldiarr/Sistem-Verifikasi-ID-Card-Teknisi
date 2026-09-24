// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Pesan tunggal untuk semua kegagalan agar NIK/email tidak bisa dienumerasi
const GENERIC_ERROR =
  'NIK / Email atau kata sandi salah. Periksa kembali kredensial Anda.';

// Rate limiting sederhana per-IP (5 percobaan / menit)
const attemptMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_ATTEMPTS_PER_WINDOW = 5;

const getClientIp = (req: NextRequest) => {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
};

/**
 * Memetakan Nomor Karyawan (NIK) atau ID Teknisi ke email akun login-nya.
 * Dijalankan dengan service role di server sehingga tidak menembus RLS klien.
 */
async function resolveIdentifierToEmail(identifier: string): Promise<string | null> {
  // Identifier berbentuk email dipakai apa adanya
  if (identifier.includes('@')) return identifier.toLowerCase();

  // Batasi karakter NIK / ID Teknisi agar aman dipakai pada filter PostgREST
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(identifier)) return null;

  const { data: technicians } = await supabaseAdmin
    .from('technicians')
    .select('id')
    .or(`employee_number.eq.${identifier},technician_id.eq.${identifier}`)
    .limit(2);

  // Identifier ambigu (cocok >1 teknisi) ditolak demi keamanan
  if (!technicians || technicians.length !== 1) return null;

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('email, is_active')
    .eq('technician_id', technicians[0].id)
    .maybeSingle();

  if (!profile || !profile.is_active) return null;
  return profile.email;
}

export async function POST(req: NextRequest) {
  // 1. Rate limiting
  const ip = getClientIp(req);
  const now = Date.now();
  const record = attemptMap.get(ip) || { count: 0, lastReset: now };

  if (now - record.lastReset > RATE_LIMIT_WINDOW) {
    record.count = 1;
    record.lastReset = now;
  } else {
    record.count++;
  }
  attemptMap.set(ip, record);

  if (record.count > MAX_ATTEMPTS_PER_WINDOW) {
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
      { error: 'NIK / Email dan kata sandi wajib diisi.' },
      { status: 400 }
    );
  }

  // 3. Petakan identifier ke email akun
  const email = await resolveIdentifierToEmail(identifier);
  if (!email) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

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