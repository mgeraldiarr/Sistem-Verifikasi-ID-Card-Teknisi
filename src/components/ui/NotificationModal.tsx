'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { NotificationState, NotificationType } from '@/types';
import { Modal } from './Modal';

interface NotificationModalProps {
  notification: NotificationState;
  onClose: () => void;
}

const TONE: Record<NotificationType, { className: string; icon: React.ReactNode }> = {
  success: { className: 'is-ok', icon: <CheckCircle2 size={20} /> },
  error: { className: 'is-danger', icon: <AlertCircle size={20} /> },
  warning: { className: 'is-warn', icon: <AlertTriangle size={20} /> },
  info: { className: '', icon: <Info size={20} /> },
};

export const NotificationModal: React.FC<NotificationModalProps> = ({ notification, onClose }) => {
  if (!notification.show) return null;
  const tone = TONE[notification.type] ?? TONE.info;

  return (
    <Modal
      width={420}
      zIndex={120}
      onClose={onClose}
      title={notification.title}
      footer={
        <button type="button" onClick={onClose} className="btn btn-dark" autoFocus>
          Tutup
        </button>
      }
    >
      <div className={`dialog-icon ${tone.className}`}>{tone.icon}</div>
      <p className="dialog-message" style={{ marginTop: 0 }}>
        {notification.message}
      </p>
    </Modal>
  );
};
