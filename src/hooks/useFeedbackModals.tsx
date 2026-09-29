// src/hooks/useFeedbackModals.tsx
'use client';

import React, { useCallback, useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { NotificationModal } from '@/components/ui/NotificationModal';
import { ConfirmModalState, NotificationState, NotificationType } from '@/types';

const CLOSED_NOTIFICATION: NotificationState = {
  show: false,
  type: 'success',
  title: '',
  message: '',
};

const CLOSED_CONFIRM: ConfirmModalState = {
  show: false,
  title: '',
  message: '',
  onConfirm: () => {},
};

/**
 * State modal notifikasi & konfirmasi yang dipakai bersama halaman admin.
 * Render `modals` sekali di halaman, lalu panggil `notify` / `askConfirm`.
 */
export function useFeedbackModals() {
  const [notification, setNotification] = useState<NotificationState>(CLOSED_NOTIFICATION);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(CLOSED_CONFIRM);

  const notify = useCallback(
    (type: NotificationType, title: string, message: string, onClose?: () => void) =>
      setNotification({ show: true, type, title, message, onClose }),
    []
  );

  const askConfirm = useCallback(
    (title: string, message: string, onConfirm: () => void, onCancel?: () => void) =>
      setConfirmModal({ show: true, title, message, onConfirm, onCancel }),
    []
  );

  const closeConfirm = () => setConfirmModal((prev) => ({ ...prev, show: false }));

  const modals = (
    <>
      <NotificationModal
        notification={notification}
        onClose={() => {
          setNotification((prev) => ({ ...prev, show: false }));
          notification.onClose?.();
        }}
      />
      <ConfirmModal
        modal={confirmModal}
        onConfirm={() => {
          closeConfirm();
          confirmModal.onConfirm();
        }}
        onCancel={() => {
          closeConfirm();
          confirmModal.onCancel?.();
        }}
      />
    </>
  );

  return { notify, askConfirm, modals };
}
