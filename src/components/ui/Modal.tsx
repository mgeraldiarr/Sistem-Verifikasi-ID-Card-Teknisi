// src/components/ui/Modal.tsx
'use client';

import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Lebar maksimum di desktop (di HP modal tampil sebagai bottom sheet penuh) */
  width?: number;
  footer?: React.ReactNode;
  /** Tutup lewat klik latar & tombol Escape (default: true) */
  dismissible?: boolean;
  role?: 'dialog' | 'alertdialog';
  zIndex?: number;
  children?: React.ReactNode;
}

/**
 * Kerangka modal portal: kepala (judul + tombol tutup), isi yang dapat digulir,
 * dan kaki untuk tombol aksi. Menjadi bottom sheet di layar < 640px.
 */
export const Modal: React.FC<ModalProps> = ({
  onClose,
  title,
  description,
  width = 440,
  footer,
  dismissible = true,
  role = 'dialog',
  zIndex,
  children,
}) => {
  const titleId = useId();

  useEffect(() => {
    if (!dismissible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismissible, onClose]);

  // Kunci gulir halaman di belakang modal
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="modal-overlay"
      style={zIndex ? { zIndex } : undefined}
      onMouseDown={(e) => {
        if (dismissible && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ '--modal-w': `${width}px` } as React.CSSProperties}
      >
        <div className="modal-head">
          <div style={{ minWidth: 0 }}>
            <h2 id={titleId} className="modal-title">
              {title}
            </h2>
            {description && <p className="modal-desc">{description}</p>}
          </div>
          {dismissible && (
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup">
              <X size={18} />
            </button>
          )}
        </div>

        {children && <div className="modal-body">{children}</div>}
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
};
