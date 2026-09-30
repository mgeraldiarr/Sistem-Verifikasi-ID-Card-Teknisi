// src/app/admin/login/components/LoginGuideModal.tsx
'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import styles from './LoginGuideModal.module.css';

interface LoginGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GuideRole = 'technician' | 'branch_admin';

interface GuideStep {
  title: string;
  body: React.ReactNode;
}

const GUIDE: Record<GuideRole, { label: string; steps: GuideStep[]; help: React.ReactNode }> = {
  technician: {
    label: 'Teknisi',
    steps: [
      {
        title: 'ID pengguna adalah ID teknisi',
        body: (
          <>
            Ketik ID yang tercetak di kartu Anda, misalnya <code>DSC-BAL-001</code>. Bukan NIK dan
            bukan email.
          </>
        ),
      },
      {
        title: 'Kata sandi awal',
        body: (
          <>
            Dikirim Admin Cabang lewat WhatsApp dengan format{' '}
            <code>Modena@{'{4 digit terakhir No HP}'}</code>.
          </>
        ),
      },
      {
        title: 'Buat kata sandi baru',
        body: 'Saat pertama kali masuk, Anda diminta membuat kata sandi pribadi sebelum kartu digital terbuka.',
      },
      {
        title: 'Lupa kata sandi',
        body: 'Pilih "Lupa kata sandi?" lalu masukkan email pribadi yang Anda daftarkan ke Admin Cabang.',
      },
    ],
    help: 'ID tidak dikenali, belum menerima kata sandi, atau email belum terdaftar? Hubungi Admin Cabang Anda.',
  },
  branch_admin: {
    label: 'Admin Cabang',
    steps: [
      {
        title: 'ID pengguna adalah ID admin',
        body: (
          <>
            Ketik ID admin dari Super Admin, misalnya <code>ADM-BAL-01</code>. Admin Cabang tidak
            masuk memakai email.
          </>
        ),
      },
      {
        title: 'Kata sandi awal',
        body: 'Diberikan langsung oleh Super Admin bersama ID admin Anda.',
      },
      {
        title: 'Buat kata sandi baru',
        body: 'Saat pertama kali masuk, Anda diminta membuat kata sandi pribadi.',
      },
      {
        title: 'Lupa kata sandi',
        body: 'Pilih "Lupa kata sandi?" lalu masukkan email pribadi yang didaftarkan Super Admin untuk akun Anda.',
      },
    ],
    help: 'Belum punya ID admin atau akun dinonaktifkan? Hubungi Super Admin MODENA.',
  },
};

export const LoginGuideModal: React.FC<LoginGuideModalProps> = ({ isOpen, onClose }) => {
  const [role, setRole] = useState<GuideRole>('technician');
  const guide = GUIDE[role];

  if (!isOpen) return null;

  return (
    <Modal
      width={460}
      onClose={onClose}
      title="Cara masuk"
      footer={
        <button type="button" className="btn btn-dark" onClick={onClose}>
          Mengerti
        </button>
      }
    >
      <div className="segmented" role="tablist" aria-label="Pilih peran">
        {(Object.keys(GUIDE) as GuideRole[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={key === role}
            onClick={() => setRole(key)}
          >
            {GUIDE[key].label}
          </button>
        ))}
      </div>

      <ul role="tabpanel" className={styles.steps}>
        {guide.steps.map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong>
            <p>{step.body}</p>
          </li>
        ))}
      </ul>

      <p className="alert alert-neutral">{guide.help}</p>
    </Modal>
  );
};
