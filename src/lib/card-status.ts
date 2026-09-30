// src/lib/card-status.ts
import { TechnicianIdCard, TechnicianLevel, TechnicianStatus } from '@/types';

const LEVEL_CARD_LABELS: Record<TechnicianLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advance: 'Advanced',
};

/** Label level yang tercetak di kartu (digital & fisik). */
export function getLevelCardLabel(level: TechnicianLevel | string): string {
  return LEVEL_CARD_LABELS[level as TechnicianLevel] || String(level);
}

export interface CardStatusResult {
  /** Kartu sah: teknisi aktif, kartu aktif, dan belum kedaluwarsa */
  isValid: boolean;
  isTechnicianActive: boolean;
  hasCard: boolean;
  isCardActive: boolean;
  isExpired: boolean;
  /** Contoh: "29 September 2028", atau "-" bila belum ada kartu */
  formattedExpiryDate: string;
}

/**
 * Menilai keabsahan kartu ID teknisi. Dipakai bersama oleh kartu digital teknisi
 * dan halaman verifikasi QR publik agar keduanya selalu memberi status yang sama.
 */
export function evaluateCardStatus(
  technicianStatus: TechnicianStatus,
  card: Pick<TechnicianIdCard, 'card_status' | 'expiry_date'> | null | undefined
): CardStatusResult {
  const isTechnicianActive = technicianStatus === 'active';
  const isCardActive = card?.card_status === 'active';

  const expiryDate = card ? new Date(card.expiry_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isExpired = expiryDate ? expiryDate < today : false;

  return {
    isValid: isTechnicianActive && isCardActive && !isExpired,
    isTechnicianActive,
    hasCard: Boolean(card),
    isCardActive,
    isExpired,
    formattedExpiryDate: expiryDate
      ? expiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : '-',
  };
}
