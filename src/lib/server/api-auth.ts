// src/lib/server/api-auth.ts
import 'server-only';
import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { UserRole } from '@/types';

export interface CallerProfile {
  id: string;
  role: UserRole;
  branch: string | null;
  is_active: boolean;
}

export type AuthResult = { caller: CallerProfile } | { error: NextResponse };

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Memvalidasi token sesi pemanggil (header `Authorization: Bearer <token>`)
 * dan mengembalikan profil perannya.
 *
 * Route yang memakai service role WAJIB memanggil ini, karena service role
 * melewati RLS dan tidak memeriksa hak akses dengan sendirinya.
 */
export async function authenticateCaller(
  req: NextRequest,
  allowedRoles: UserRole[] = ['super_admin', 'branch_admin'],
  forbiddenMessage = 'Peran Anda tidak berwenang melakukan tindakan ini.'
): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';

  if (!token) {
    return { error: jsonError('Sesi tidak ditemukan. Silakan masuk kembali.', 401) };
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return { error: jsonError('Sesi tidak valid atau telah berakhir.', 401) };
  }

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id, role, branch, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    return {
      error: jsonError('Akun Anda tidak aktif atau belum memiliki profil peran resmi.', 403),
    };
  }

  if (!allowedRoles.includes(profile.role as UserRole)) {
    return { error: jsonError(forbiddenMessage, 403) };
  }

  return { caller: profile as CallerProfile };
}

/** Membaca body JSON; mengembalikan null bila format tidak valid. */
export async function readJsonBody<T = Record<string, unknown>>(
  req: NextRequest
): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Validasi UUID sebelum dipakai pada query, agar input asing ditolak lebih awal. */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/** Membandingkan rahasia (API key, token) dalam waktu konstan agar tidak bisa ditebak lewat timing. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
