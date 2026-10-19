// src/app/admin/(portal)/branches/components/CreateBranchModal.tsx
'use client';

import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { SERVICE_SCOPES } from '@/constants/service-center';
import { ServiceTypeCode } from '@/types';

interface CreateBranchModalProps {
  /** Lingkup yang sedang dibuka di halaman Kelola Cabang */
  defaultServiceType: ServiceTypeCode;
  onClose: () => void;
  /** Mengembalikan pesan error, atau null bila cabang berhasil ditambahkan */
  onCreate: (name: string, serviceType: ServiceTypeCode) => Promise<string | null>;
}

const FORM_ID = 'create-branch-form';

export const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  defaultServiceType,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState<ServiceTypeCode>(defaultServiceType);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const selectedScope = SERVICE_SCOPES.find((s) => s.code === serviceType)!;

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
    <Modal
      width={420}
      onClose={onClose}
      dismissible={!creating}
      title="Tambah cabang"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={creating}>
            Batal
          </button>
          <button type="submit" form={FORM_ID} disabled={creating} className="btn btn-primary">
            {creating && <Loader2 size={16} className="spin" />}
            Simpan cabang
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
          <span id="branch-type-label" className="label">
            Lingkup layanan
          </span>
          <div className="segmented" role="radiogroup" aria-labelledby="branch-type-label">
            {SERVICE_SCOPES.map((scope) => (
              <button
                key={scope.code}
                type="button"
                role="radio"
                aria-checked={serviceType === scope.code}
                title={scope.fullName}
                onClick={() => setServiceType(scope.code)}
              >
                {scope.code}
              </button>
            ))}
          </div>
          <p className="hint">{selectedScope.fullName}</p>
        </div>

        <div className="field">
          <label htmlFor="branch-name" className="label">
            Nama cabang {serviceType}
          </label>
          <input
            id="branch-name"
            name="branch_name"
            type="text"
            required
            maxLength={100}
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cirebon"
          />
        </div>
      </form>
    </Modal>
  );
};
