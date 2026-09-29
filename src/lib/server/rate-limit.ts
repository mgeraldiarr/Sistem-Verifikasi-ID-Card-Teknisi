// src/lib/server/rate-limit.ts
import 'server-only';
import { NextRequest } from 'next/server';

/**
 * Rate limiter sederhana per-IP berbasis memori.
 *
 * Catatan: penghitung tersimpan per instance server. Di lingkungan dengan banyak
 * instance, batas efektifnya bisa lebih longgar; gunakan penyimpanan bersama
 * (mis. Redis) bila butuh batas yang ketat.
 */
export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; windowStart: number }>();

  return {
    /** true bila permintaan dari `key` masih di bawah batas */
    allow(key: string): boolean {
      const now = Date.now();
      const record = hits.get(key);

      if (!record || now - record.windowStart > windowMs) {
        hits.set(key, { count: 1, windowStart: now });
        // Bersihkan entri kedaluwarsa agar Map tidak tumbuh tanpa batas
        if (hits.size > 5000) {
          for (const [k, v] of hits) {
            if (now - v.windowStart > windowMs) hits.delete(k);
          }
        }
        return true;
      }

      record.count++;
      return record.count <= max;
    },
  };
}

export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}
