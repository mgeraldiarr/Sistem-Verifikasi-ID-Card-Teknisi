'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';

interface LogoutModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <Modal
      width={400}
      onClose={onClose}
      title="Keluar dari portal?"
      description="Anda perlu masuk kembali dengan ID dan kata sandi untuk membuka portal."
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Batal
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-primary" autoFocus>
            Keluar
          </button>
        </>
      }
    />
  );
};
