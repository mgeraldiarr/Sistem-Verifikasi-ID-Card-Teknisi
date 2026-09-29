// src/lib/postgrest-filters.ts

/**
 * Meng-escape wildcard `%` dan `_` agar nilai dicocokkan persis oleh `.ilike()`,
 * bukan sebagai pola (misal nama "A_i" tidak ikut cocok dengan "Ani").
 */
export function escapeIlike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Membuang karakter sintaks filter PostgREST (`,` `(` `)` `"` `*` `%` `\`) dari nilai
 * yang disisipkan ke `.or()`, agar input tidak bisa menambah kondisi filter lain.
 */
export function sanitizeOrFilterValue(value: string): string {
  return value.replace(/[,()*%\\"]/g, '').trim();
}
