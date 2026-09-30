"use client";

import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { TechnicianLevel, TechnicianStatus } from '@/types';
import { IdCardBack, IdCardFront } from './id-card/IdCard';

interface TechnicianData {
  technician_id: string;
  technician_name: string;
  branch: string;
  service_center: string | null;
  photo_url: string | null;
  technician_status: TechnicianStatus;
  technician_level: TechnicianLevel;
}

interface TechnicianCard3DProps {
  technician: TechnicianData;
  levelText: string;
  formattedExpiryDate: string;
  isValid: boolean;
  verifyUrl?: string;
}

/** Kartu ID digital dua sisi; ketuk kartu atau tombol untuk membalik. */
export default function TechnicianCard3D({
  technician,
  levelText,
  formattedExpiryDate,
  isValid,
  verifyUrl,
}: TechnicianCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flip = () => setIsFlipped((prev) => !prev);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
      {/* Ukuran kartu mengikuti font-size .id-card-stage (10px = 320 x 508px) */}
      <div className="id-card-stage">
        <div
          className="id-card-flipper"
          onClick={flip}
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
          aria-label={isFlipped ? 'Sisi belakang kartu' : 'Sisi depan kartu'}
        >
          <div className="id-card-face" aria-hidden={isFlipped}>
            <IdCardFront technician={technician} levelText={levelText} />
          </div>
          <div className="id-card-face is-back" aria-hidden={!isFlipped}>
            <IdCardBack
              technician={technician}
              verifyUrl={verifyUrl}
              formattedExpiryDate={formattedExpiryDate}
              expiryAlert={!isValid}
            />
          </div>
        </div>
      </div>

      <button type="button" onClick={flip} className="btn btn-secondary btn-sm">
        <RotateCw
          size={14}
          style={{ transform: isFlipped ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s ease' }}
        />
        {isFlipped ? 'Lihat sisi depan' : 'Lihat sisi belakang'}
      </button>
    </div>
  );
}
