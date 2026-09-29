// src/lib/admin-api.ts
import { supabase } from '@/lib/supabase';

export type AdminApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Memanggil route `/api/admin/*` dengan token sesi pengguna yang sedang login.
 * Route tersebut memeriksa ulang peran pemanggil di server sebelum bertindak.
 */
export async function callAdminApi<T = Record<string, unknown>>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body: unknown
): Promise<AdminApiResult<T>> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify(body),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: payload.error ?? 'Terjadi kesalahan.' };
    }
    return { ok: true, data: payload as T };
  } catch {
    return { ok: false, error: 'Tidak dapat menghubungi server.' };
  }
}
