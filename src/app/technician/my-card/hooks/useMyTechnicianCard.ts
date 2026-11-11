// src/app/technician/my-card/hooks/useMyTechnicianCard.ts
'use client';

import { useEffect, useMemo, useState } from 'react';
import { evaluateCardStatus, getLevelCardLabel } from '@/lib/card-status';
import { supabase } from '@/lib/supabase';
import { Technician } from '@/types';

const FULL_TECHNICIAN_COLUMNS = `
  id,
  technician_id,
  employee_number,
  technician_name,
  branch,
  service_type,
  service_center,
  photo_url,
  phone,
  email,
  technician_status,
  technician_level,
  qr_token,
  created_at,
  technician_performance (
    period,
    kpi_score,
    csi_score,
    performance_score,
    performance_level,
    tat,
    rtat,
    csat,
    grooming_score,
    service_score,
    repair_quality_score
  ),
  technician_id_cards!technician_id_cards_technician_id_fkey (
    card_number,
    card_status,
    expiry_date
  )
`;

const BASIC_TECHNICIAN_COLUMNS = `
  id,
  technician_id,
  employee_number,
  technician_name,
  branch,
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

      const fetchColumns = (columns: string) =>
        supabase
          .from('technicians')
          .select(columns)
          .eq('id', technicianRowId)
          .maybeSingle<Technician>();

      let { data, error: fetchError } = await fetchColumns(FULL_TECHNICIAN_COLUMNS);

      // Fallback query bila ada kolom baru yang belum ada di Supabase
      if (fetchError) {
        ({ data, error: fetchError } = await fetchColumns(BASIC_TECHNICIAN_COLUMNS));
      }

      if (cancelled) return;

      if (fetchError) {
        setError(`Gagal memuat kartu digital: ${fetchError.message}`);
      } else if (!data) {
        setError('Data teknisi Anda tidak ditemukan dalam sistem.');
      } else {
        setTechnician(data);
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
      return { isValid: false, formattedExpiryDate: '-', statusLabel: 'Memuat data', levelText: '' };
    }

    const cardInfo = technician.technician_id_cards?.[0] ?? null;
    const status = evaluateCardStatus(technician.technician_status, cardInfo);

    let statusLabel = 'Kartu digital aktif';
    if (!status.isTechnicianActive) statusLabel = 'Status teknisi nonaktif';
    else if (!status.hasCard) statusLabel = 'Kartu belum diterbitkan';
    else if (!status.isCardActive) statusLabel = 'Kartu ditangguhkan';
    else if (status.isExpired) statusLabel = 'Kartu kedaluwarsa';

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
