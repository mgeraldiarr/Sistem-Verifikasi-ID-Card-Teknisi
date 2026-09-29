// src/app/technician/my-card/hooks/useMyTechnicianCard.ts
'use client';

import { useEffect, useMemo, useState } from 'react';
import { evaluateCardStatus, getLevelCardLabel } from '@/lib/card-status';
import { supabase } from '@/lib/supabase';
import { Technician } from '@/types';

const TECHNICIAN_COLUMNS = `
  id,
  technician_id,
  employee_number,
  technician_name,
  branch,
  service_center,
  photo_url,
  phone,
  email,
  technician_status,
  technician_level,
  qr_token,
  created_at,
  technician_id_cards!technician_id_cards_technician_id_fkey (
    card_number,
    card_status,
    expiry_date
  )
`;

/**
 * Data kartu digital milik teknisi yang sedang login.
 * RLS hanya mengizinkan teknisi membaca baris datanya sendiri.
 */
export function useMyTechnicianCard(technicianRowId: string | null, profileLoading: boolean) {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profileLoading) return;

    if (!technicianRowId) {
      setLoading(false);
      setError(
        'Akun Anda belum terhubung ke data teknisi mana pun. Hubungi Admin Cabang untuk menautkan akun Anda.'
      );
      return;
    }

    let cancelled = false;

    const fetchTechnician = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('technicians')
        .select(TECHNICIAN_COLUMNS)
        .eq('id', technicianRowId)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        setError(`Gagal memuat kartu digital: ${fetchError.message}`);
      } else if (!data) {
        setError('Data teknisi Anda tidak ditemukan dalam sistem.');
      } else {
        setTechnician(data as unknown as Technician);
        setError(null);
      }
      setLoading(false);
    };

    fetchTechnician();
    return () => {
      cancelled = true;
    };
  }, [profileLoading, technicianRowId]);

  const card = useMemo(() => {
    if (!technician) {
      return { isValid: false, formattedExpiryDate: '-', statusLabel: 'MEMUAT DATA', levelText: '' };
    }

    const cardInfo = technician.technician_id_cards?.[0] ?? null;
    const status = evaluateCardStatus(technician.technician_status, cardInfo);

    let statusLabel = 'KARTU DIGITAL AKTIF';
    if (!status.isTechnicianActive) statusLabel = 'STATUS TEKNISI NONAKTIF';
    else if (!status.hasCard) statusLabel = 'KARTU BELUM DITERBITKAN';
    else if (!status.isCardActive) statusLabel = 'KARTU DITANGGUHKAN';
    else if (status.isExpired) statusLabel = 'KARTU KADALUARSA';

    return {
      isValid: status.isValid,
      formattedExpiryDate: status.formattedExpiryDate,
      statusLabel,
      levelText: getLevelCardLabel(technician.technician_level),
    };
  }, [technician]);

  const qrToken = technician?.qr_token;
  const verifyUrl = useMemo(() => {
    if (!qrToken || typeof window === 'undefined') return undefined;
    return `${window.location.origin}/verify/${qrToken}`;
  }, [qrToken]);

  return { technician, loading, error, verifyUrl, ...card };
}
