// src/app/admin/(portal)/branches/components/CreateBranchModal.tsx
'use client';

import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import {
  formErrorStyle,
  inputStyle,
  labelStyle,
  modalOverlayStyle,
} from '@/components/ui/admin-styles';
import { SERVICE_SCOPES } from '@/constants/service-center';
import { ServiceTypeCode } from '@/types';

interface CreateBranchModalProps {
  onClose: () => void;
  /** Mengembalikan pesan error, atau null bila cabang berhasil ditambahkan */
  onCreate: (name: string, serviceType: ServiceTypeCode) => Promise<string | null>;
}

export const CreateBranchModal: React.FC<CreateBranchModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState<ServiceTypeCode>('DSC');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const createError = await onCreate(name, serviceType);
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
        aria-labelledby="create-branch-title"
        style={{ width: '100%', maxWidth: '420px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <h2 id="create-branch-title" style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
            Tambah Cabang
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
            <label htmlFor="branch-name" style={labelStyle}>
              Nama Cabang
            </label>
            <input
              id="branch-name"
              name="branch_name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Contoh: Cirebon"
            />
          </div>

          <div>
            <label htmlFor="branch-type" style={labelStyle}>
              Ruang Lingkup Layanan
            </label>
            <select
              id="branch-type"
              name="branch_type"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceTypeCode)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {SERVICE_SCOPES.map((scope) => (
                <option key={scope.code} value={scope.code}>
                  {scope.code} — {scope.fullName}
                  {scope.isActive ? '' : ' (Belum Aktif)'}
                </option>
              ))}
            </select>
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
            {creating ? <Loader2 size={17} className="animate-spin-custom" /> : 'SIMPAN CABANG'}
          </button>
        </form>
      </div>
    </div>
  );
};
