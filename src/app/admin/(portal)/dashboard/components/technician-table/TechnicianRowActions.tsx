// src/app/admin/(portal)/dashboard/components/technician-table/TechnicianRowActions.tsx
'use client';

import React from 'react';
import { MessageCircle, Pencil, Printer, RefreshCcw, Trash2 } from 'lucide-react';
import { toWhatsAppNumber } from '@/lib/technician-access';
import { Technician } from '@/types';

export interface TechnicianActionHandlers {
  onPrint: (tech: Technician) => void;
  onRegenerateQR: (tech: Technician) => void;
  onEdit: (tech: Technician) => void;
  onDelete: (id: string) => void;
  /** Terbitkan & kirim kredensial portal teknisi via WhatsApp */
  onSendAccess: (tech: Technician) => void;
}

interface TechnicianRowActionsProps extends TechnicianActionHandlers {
  tech: Technician;
  /** Admin Cabang tidak memiliki hak hapus data teknisi */
  canDelete: boolean;
}

/** Tombol aksi per baris: WhatsApp, cetak, regenerasi QR, edit, hapus. */
export const TechnicianRowActions: React.FC<TechnicianRowActionsProps> = ({
  tech,
  canDelete,
  onPrint,
  onRegenerateQR,
  onEdit,
  onDelete,
  onSendAccess,
}) => {
  // Tombol WhatsApp hanya aktif bila nomor HP teknisi valid
  const hasWhatsApp = Boolean(toWhatsAppNumber(tech.phone));

  return (
    <div className="row-actions">
      <button
        type="button"
        className="icon-btn is-whatsapp"
        onClick={() => onSendAccess(tech)}
        disabled={!hasWhatsApp}
        title={hasWhatsApp ? 'Kirim akses portal via WhatsApp' : 'Nomor HP teknisi belum diisi'}
        aria-label={`Kirim akses portal ke ${tech.technician_name}`}
      >
        <MessageCircle size={17} />
      </button>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onPrint(tech)}
        title="Cetak ID card"
        aria-label={`Cetak ID card ${tech.technician_name}`}
      >
        <Printer size={17} />
      </button>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onRegenerateQR(tech)}
        title="Buat ulang QR code"
        aria-label={`Buat ulang QR code ${tech.technician_name}`}
      >
        <RefreshCcw size={17} />
      </button>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onEdit(tech)}
        title="Ubah data"
        aria-label={`Ubah data ${tech.technician_name}`}
      >
        <Pencil size={17} />
      </button>
      {canDelete && (
        <button
          type="button"
          className="icon-btn is-danger"
          onClick={() => onDelete(tech.id)}
          title="Hapus teknisi"
          aria-label={`Hapus ${tech.technician_name}`}
        >
          <Trash2 size={17} />
        </button>
      )}
    </div>
  );
};
