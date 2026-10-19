// src/app/admin/(portal)/accounts/components/CreateAccountModal.tsx
'use client';

import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { getBranchCode } from '@/constants/branch-codes';
import { CreateAccountInput } from '../hooks/useAccounts';

interface CreateAccountModalProps {
  branchNames: string[];
  onClose: () => void;
  /** Mengembalikan pesan error, atau null bila akun berhasil dibuat */
  onCreate: (input: CreateAccountInput) => Promise<string | null>;
}

interface FormState {
  email: string;
  full_name: string;
  role: CreateAccountInput['role'];
  branch: string;
  password: string;
}

const EMPTY_FORM: FormState = {
  email: '',
  full_name: '',
  role: 'branch_admin',
  branch: '',
  password: '',
};

const FORM_ID = 'create-account-form';

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  branchNames,
  onClose,
  onCreate,
}) => {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isBranchAdmin = form.role === 'branch_admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isBranchAdmin && !form.branch) {
      setError('Pilih cabang penugasan untuk Admin Cabang.');
      return;
    }
    if (form.password.length < 8) {
      setError('Kata sandi awal minimal 8 karakter.');
      return;
    }

    setCreating(true);
    const createError = await onCreate({
      email: form.email,
      full_name: form.full_name,
      role: form.role,
      branch: isBranchAdmin ? form.branch : null,
      password: form.password,
    });
    setCreating(false);

    if (createError) {
      setError(createError);
      return;
    }
    onClose();
  };

  return (
    <Modal
      width={460}
      onClose={onClose}
      dismissible={!creating}
      title="Tambah akun admin"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={creating}>
            Batal
          </button>
          <button type="submit" form={FORM_ID} disabled={creating} className="btn btn-primary">
            {creating && <Loader2 size={16} className="spin" />}
            Buat akun
          </button>
        </>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="field">
          <span id="new-role-label" className="label">
            Peran
          </span>
          <div className="segmented" role="radiogroup" aria-labelledby="new-role-label">
            <button
              type="button"
              role="radio"
              aria-checked={isBranchAdmin}
              onClick={() => setField('role', 'branch_admin')}
            >
              Admin Cabang
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={!isBranchAdmin}
              onClick={() => setField('role', 'super_admin')}
            >
              Super Admin
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="new-full-name" className="label">
            Nama lengkap
          </label>
          <input
            id="new-full-name"
            name="new_full_name"
            type="text"
            required
            className="input"
            value={form.full_name}
            onChange={(e) => setField('full_name', e.target.value)}
            placeholder="Budi Santoso"
          />
        </div>

        <div className="field">
          <label htmlFor="new-email" className="label">
            {isBranchAdmin ? 'Email pribadi' : 'Email MODENA'}
          </label>
          <input
            id="new-email"
            name="new_email"
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder={isBranchAdmin ? 'nama.pribadi@gmail.com' : 'nama@modena.com'}
          />
          {isBranchAdmin && (
            <p className="hint">Dipakai untuk mengatur ulang kata sandi bila lupa.</p>
          )}
        </div>

        {isBranchAdmin && (
          <div className="field">
            <label htmlFor="new-branch" className="label">
              Cabang penugasan
            </label>
            <select
              id="new-branch"
              name="new_branch"
              required
              className="select"
              value={form.branch}
              onChange={(e) => setField('branch', e.target.value)}
            >
              <option value="">Pilih cabang</option>
              {branchNames.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            <p className="hint">
              ID login dibuat otomatis
              {form.branch && (
                <>
                  {' '}
                  dengan format <strong className="tnum">ADM-{getBranchCode(form.branch)}-NN</strong>
                </>
              )}{' '}
              dan ditampilkan setelah akun dibuat.
            </p>
          </div>
        )}

        <div className="field">
          <label htmlFor="new-password" className="label">
            Kata sandi awal
          </label>
          <input
            id="new-password"
            name="new_password"
            type="text"
            autoComplete="off"
            required
            className="input"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            placeholder="Minimal 8 karakter"
          />
          <p className="hint">
            Sampaikan secara pribadi. Pemilik akun wajib menggantinya saat pertama kali masuk.
          </p>
        </div>
      </form>
    </Modal>
  );
};
