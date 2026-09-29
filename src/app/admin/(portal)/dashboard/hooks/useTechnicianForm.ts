// src/app/admin/(portal)/dashboard/hooks/useTechnicianForm.ts
'use client';

import React, { useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { NotificationType, Technician, TechnicianFormData } from '@/types';
import { saveTechnician, uploadTechnicianPhoto } from '../utils/save-technician';

const EMPTY_FORM: TechnicianFormData = {
  technician_id: '',
  employee_number: '',
  technician_name: '',
  branch: '',
  service_center: '',
  phone: '',
  email: '',
  technician_status: 'active',
  technician_level: 'beginner',
  card_number: '',
  card_status: 'active',
  expiry_date: '',
};

/** Masa berlaku bawaan kartu baru: 2 tahun dari hari ini (YYYY-MM-DD). */
function defaultExpiryDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 2);
  return date.toISOString().split('T')[0];
}

function toFormData(tech: Technician): TechnicianFormData {
  const card = tech.technician_id_cards?.[0];
  const perf = tech.technician_performance?.[0];
  return {
    technician_id: tech.technician_id,
    employee_number: tech.employee_number,
    technician_name: tech.technician_name,
    branch: tech.branch,
    service_center: tech.service_center || '',
    phone: tech.phone || '',
    email: tech.email || '',
    technician_status: tech.technician_status,
    technician_level: tech.technician_level,
    card_number: card?.card_number || '',
    card_status: card?.card_status || 'active',
    expiry_date: card?.expiry_date || '',
    tat: perf?.tat,
    rtat: perf?.rtat,
    // Data lama hanya punya csi_score (skala 1-10)
    csat: perf?.csat ?? (perf?.csi_score ? perf.csi_score * 10 : undefined),
    grooming_score: perf?.grooming_score,
    service_score: perf?.service_score,
    repair_quality_score: perf?.repair_quality_score,
    performance_score: perf?.kpi_score ?? perf?.performance_score,
  };
}

interface UseTechnicianFormOptions {
  technicians: Technician[];
  /** Cabang yang dikunci untuk Admin Cabang (null = akses nasional) */
  scopedBranch: string | null;
  notify: (type: NotificationType, title: string, message: string) => void;
  onSaved: () => void;
}

/** State & aksi modal tambah/edit teknisi. */
export function useTechnicianForm({ technicians, scopedBranch, notify, onSaved }: UseTechnicianFormOptions) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TechnicianFormData>(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const openForm = (tech?: Technician) => {
    if (tech) {
      setFormId(tech.id);
      setFormData(toFormData(tech));
    } else {
      setFormId(null);
      setFormData({
        ...EMPTY_FORM,
        // Admin Cabang hanya boleh mendaftarkan teknisi di cabangnya sendiri
        branch: scopedBranch ?? '',
        expiry_date: defaultExpiryDate(),
      });
    }
    setPhotoFile(null);
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Isolasi data cabang: Admin Cabang tidak boleh menulis data cabang lain
    if (scopedBranch && formData.branch !== scopedBranch) {
      notify(
        'error',
        'Akses Ditolak',
        `Anda hanya berwenang mengelola data cabang ${scopedBranch}. Cabang "${formData.branch || '-'}" tidak diizinkan.`
      );
      return;
    }

    const existing = formId ? technicians.find((t) => t.id === formId) : undefined;

    setSaving(true);
    try {
      const photoUrl = photoFile
        ? await uploadTechnicianPhoto(photoFile)
        : existing?.photo_url ?? null;

      await saveTechnician({ formId, formData, existing, photoUrl });
      setShowForm(false);
      onSaved();
    } catch (err) {
      notify('error', 'Gagal Menyimpan Data', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return {
    showForm,
    saving,
    formId,
    formData,
    setFormData,
    photoFile,
    setPhotoFile,
    openForm,
    closeForm,
    handleSave,
  };
}
