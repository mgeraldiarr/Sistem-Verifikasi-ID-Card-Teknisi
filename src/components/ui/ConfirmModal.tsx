'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ConfirmModalState } from '@/types';
import { Modal } from './Modal';

interface ConfirmModalProps {
  modal: ConfirmModalState;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ modal, onConfirm, onCancel }) => {
  if (!modal.show) return null;

  return (
    <Modal
      role="alertdialog"
      width={420}
      zIndex={110}
      onClose={onCancel}
      title={modal.title}
      footer={
        <>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Batal
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-primary" autoFocus>
            Lanjutkan
          </button>
        </>
      }
    >
      <div className="dialog-icon is-danger">
        <AlertTriangle size={20} />
      </div>
      <p className="dialog-message" style={{ marginTop: 0 }}>
        {modal.message}
      </p>
    </Modal>
  );
};
