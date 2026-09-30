'use client';

import React from 'react';
import { IdCardBack, IdCardFront } from '@/components/id-card/IdCard';
import { evaluateCardStatus, getLevelCardLabel } from '@/lib/card-status';
import { Technician } from '@/types';

interface PrintCardAreaProps {
  printData: Technician | null;
}

/** 1em kartu = 1/32 lebar kartu PVC CR80 (53.98mm), sehingga desain layar tercetak presisi */
const PRINT_SCALE: React.CSSProperties = { fontSize: 'calc(53.98mm / 32)' };

/**
 * Area cetak kartu dua sisi. Hanya tampil saat `window.print()`; tiap sisi dicetak
 * pada halaman seukuran kartu (lihat `@page cr80` di globals.css).
 */
export const PrintCardArea: React.FC<PrintCardAreaProps> = ({ printData }) => {
  if (!printData) return null;

  const card = printData.technician_id_cards?.[0] ?? null;
  const { formattedExpiryDate } = evaluateCardStatus(printData.technician_status, card);
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${printData.qr_token}`;

  return (
    <div className="print-area" style={{ display: 'none' }}>
      <div className="print-card-sheet" style={{ display: 'flex', gap: '10mm', flexWrap: 'wrap', padding: '10mm' }}>
        <div className="print-card-side" style={PRINT_SCALE}>
          <IdCardFront
            technician={printData}
            levelText={getLevelCardLabel(printData.technician_level)}
            variant="print"
          />
        </div>

        <div className="print-card-side" style={PRINT_SCALE}>
          <IdCardBack
            technician={printData}
            verifyUrl={verifyUrl}
            formattedExpiryDate={formattedExpiryDate}
            variant="print"
          />
        </div>
      </div>
    </div>
  );
};
