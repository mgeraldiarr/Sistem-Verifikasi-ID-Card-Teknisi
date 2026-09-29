// src/app/admin/(portal)/dashboard/components/technician-table/TechnicianRowActions.tsx
'use client';

import React from 'react';
import { Edit, MessageCircle, Printer, RefreshCcw, Trash2 } from 'lucide-react';
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

const iconButtonStyle: React.CSSProperties = {
  padding: '6px',
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
};

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
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
      <button
        type="button"
        onClick={() => onSendAccess(tech)}
        disabled={!hasWhatsApp}
        title={hasWhatsApp ? 'Kirim Akses Portal via WhatsApp' : 'Nomor HP teknisi belum terisi'}
        aria-label={`Kirim akses portal ${tech.technician_name}`}
        style={{
          ...iconButtonStyle,
          color: hasWhatsApp ? '#128C7E' : 'var(--text-muted)',
          cursor: hasWhatsApp ? 'pointer' : 'not-allowed',
        }}
      >
        <MessageCircle size={18} />
      </button>
      <button
        type="button"
        onClick={() => onPrint(tech)}
        title="Cetak ID Card"
        aria-label={`Cetak ID card ${tech.technician_name}`}
        style={iconButtonStyle}
      >
        <Printer size={18} />
      </button>
      <button
        type="button"
        onClick={() => onRegenerateQR(tech)}
        title="Regenerasi QR Code Token"
        aria-label={`Regenerasi QR ${tech.technician_name}`}
        style={iconButtonStyle}
      >
        <RefreshCcw size={18} />
      </button>
      <button
        type="button"
        onClick={() => onEdit(tech)}
        title="Edit Data"
        aria-label={`Edit ${tech.technician_name}`}
        style={iconButtonStyle}
      >
        <Edit size={18} />
      </button>
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(tech.id)}
          title="Hapus Data"
          aria-label={`Hapus ${tech.technician_name}`}
          style={{ ...iconButtonStyle, color: 'var(--accent-red)' }}
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};
