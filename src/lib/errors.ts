// src/lib/errors.ts

/** Pesan error yang aman ditampilkan, baik dari Error biasa maupun error objek Supabase. */
export function getErrorMessage(err: unknown, fallback = 'Terjadi kesalahan.'): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return typeof err === 'string' ? err : fallback;
}
