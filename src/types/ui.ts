// src/types/ui.ts

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationState {
  show: boolean;
  type: NotificationType;
  title: string;
  message: string;
  onClose?: () => void;
}

export interface ConfirmModalState {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}
