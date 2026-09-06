// src/components/ui/NotificationModal.tsx
'use client';

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { NotificationState } from '@/types';

interface NotificationModalProps {
  notification: NotificationState;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose,
}) => {
  if (!notification.show) return null;

  const iconColor =
    notification.type === 'success'
      ? 'var(--status-active)'
      : notification.type === 'error'
        ? 'var(--accent-red)'
        : '#F59E0B';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 100,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="modena-card"
        style={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          padding: '2.5rem 2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            color: iconColor,
          }}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 size={48} />
          ) : (
            <AlertCircle size={48} />
          )}
        </div>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            color: 'var(--text-primary)',
          }}
        >
          {notification.title}
        </h3>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            marginBottom: '2rem',
            lineHeight: '1.5',
            whiteSpace: 'pre-line',
          }}
        >
          {notification.message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="modena-btn-primary"
          style={{
            width: '100%',
            padding: '10px 20px',
            borderRadius: '4px',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};
