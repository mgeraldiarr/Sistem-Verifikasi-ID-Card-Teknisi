// src/app/admin/(portal)/dashboard/components/technician-form/form-styles.tsx
import React from 'react';
import styles from './TechnicianForm.module.css';

export { styles as formStyles };

/** Kelas input dengan sorotan merah bila field wajib masih kosong */
export const fieldClass = (base: 'input' | 'select', hasError: boolean) =>
  hasError ? `${base} has-error` : base;

export const RequiredMark: React.FC = () => (
  <span className="req" aria-hidden="true">
    *
  </span>
);

/** Keterangan kecil di sisi kanan label: "Otomatis", "Kode BAL", dll. */
export const LabelAside: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="label-aside">{children}</span>
);

/** Judul kelompok field di dalam form */
export const FormSection: React.FC<{
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, aside, children }) => (
  <fieldset className={styles.section}>
    <legend className={styles.sectionHead}>
      <span>{title}</span>
      {aside}
    </legend>
    <div className={styles.sectionBody}>{children}</div>
  </fieldset>
);
