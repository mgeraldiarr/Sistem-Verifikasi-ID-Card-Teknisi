// src/app/admin/(portal)/accounts/components/CreateAccountModal.tsx
'use client';

import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import {
  formErrorStyle,
  hintStyle,
  inputStyle,
  labelStyle,
  modalOverlayStyle,
} from '@/components/ui/admin-styles';
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
      setError('Admin Cabang wajib memiliki cabang penugasan.');
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
    <div style={modalOverlayStyle}>
      <div
        className="modena-card"
        role="dialog"
        aria-labelledby="create-account-title"
        style={{ width: '100%', maxWidth: '440px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <h2 id="create-account-title" style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
            Tambah Akun Admin
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            style={{ background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && <div style={formErrorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="new-full-name" style={labelStyle}>
              Nama Lengkap
            </label>
            <input
              id="new-full-name"
              name="new_full_name"
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setField('full_name', e.target.value)}
              style={inputStyle}
              placeholder="Budi Santoso"
            />
          </div>

          <div>
            <label htmlFor="new-role" style={labelStyle}>
              Peran
            </label>
            <select
              id="new-role"
              name="new_role"
              value={form.role}
              onChange={(e) => setField('role', e.target.value as FormState['role'])}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="branch_admin">Admin Cabang</option>
              <option value="super_admin">Super Admin (Nasional)</option>
            </select>
          </div>

          <div>
            <label htmlFor="new-email" style={labelStyle}>
              {isBranchAdmin ? 'Email Pribadi' : 'Email MODENA'}
            </label>
            <input
              id="new-email"
              name="new_email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              style={inputStyle}
              placeholder={isBranchAdmin ? 'nama.pribadi@gmail.com' : 'nama@modena.com'}
            />
          </div>

          {isBranchAdmin && (
            <div>
              <label htmlFor="new-branch" style={labelStyle}>
                Cabang Penugasan
              </label>
              <select
                id="new-branch"
                name="new_branch"
                required
                value={form.branch}
                onChange={(e) => setField('branch', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">— Pilih Cabang —</option>
                {branchNames.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              <p style={hintStyle}>
                ID login dibuat otomatis
                {form.branch && (
                  <>
                    {' '}
                    dengan format{' '}
                    <strong style={{ fontFamily: 'monospace' }}>
                      ADM-{getBranchCode(form.branch)}-NN
                    </strong>
                  </>
                )}{' '}
                dan ditampilkan setelah akun dibuat. Email pribadi dipakai untuk Lupa Kata Sandi.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="new-password" style={labelStyle}>
              Kata Sandi Awal
            </label>
            <input
              id="new-password"
              name="new_password"
              type="text"
              autoComplete="off"
              required
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              style={inputStyle}
              placeholder="Minimal 8 karakter"
            />
            <p style={hintStyle}>
              Sampaikan kata sandi ini secara pribadi. Akun wajib menggantinya saat login pertama.
            </p>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="modena-btn-primary"
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {creating ? <Loader2 size={17} className="animate-spin-custom" /> : 'BUAT AKUN'}
          </button>
        </form>
      </div>
    </div>
  );
};
