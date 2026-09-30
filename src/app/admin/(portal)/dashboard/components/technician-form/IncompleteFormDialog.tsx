// src/app/admin/(portal)/dashboard/components/technician-form/IncompleteFormDialog.tsx
'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { formStyles } from './form-styles';

interface IncompleteFormDialogProps {
  missingFields: string[];
  onClose: () => void;
}

/** Peringatan saat simpan dibatalkan karena ada field wajib yang masih kosong. */
export const IncompleteFormDialog: React.FC<IncompleteFormDialogProps> = ({
  missingFields,
  onClose,
}) => (
  <Modal
    role="alertdialog"
    width={440}
    zIndex={110}
    onClose={onClose}
    title="Data belum lengkap"
    description={`${missingFields.length} kolom wajib masih kosong dan sudah ditandai merah di form.`}
    footer={
      <button type="button" onClick={onClose} className="btn btn-dark" autoFocus>
        Lengkapi data
      </button>
    }
  >
    <ul className={formStyles.missingList} style={{ marginTop: 0 }}>
      {missingFields.map((field) => (
        <li key={field}>{field}</li>
      ))}
    </ul>
  </Modal>
);
