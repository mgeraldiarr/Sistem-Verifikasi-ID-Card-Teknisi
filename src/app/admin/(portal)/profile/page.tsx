// src/app/admin/(portal)/profile/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Save, ShieldCheck, User } from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { useFeedbackModals } from '@/hooks/useFeedbackModals';
import { supabase } from '@/lib/supabase';
import { SuperAdminOnly, usePortal } from '../portal-context';

function AdminProfileContent() {
  const { profile, refreshProfile } = usePortal();
  const { notify, modals } = useFeedbackModals();

  // State Form Ubah Profil
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Sinkronisasi data awal saat profil selesai dimuat
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile?.full_name]);

  /** Simpan perubahan nama profil */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const trimmed = fullName.trim();
    if (!trimmed) {
      notify('warning', 'Nama Wajib Diisi', 'Nama lengkap tidak boleh kosong.');
      return;
    }

    setSavingProfile(true);
    try {
      // 1. Update tabel user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ full_name: trimmed })
        .eq('id', profile.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // 2. Update user metadata di Auth
      await supabase.auth.updateUser({
        data: { full_name: trimmed },
      });

      // 3. Muat ulang profil konteks agar sidebar langsung ter-update seketika
      await refreshProfile();

      notify('success', 'Profil Berhasil Disimpan', 'Nama profil Anda telah berhasil diperbarui.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan profil.';
      notify('error', 'Gagal Menyimpan Profil', msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'SA';
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeading
        title="Profil saya"
        subtitle="Kelola informasi pribadi akun Super Admin Anda."
      />

      {/* Kartu Ringkasan Akun */}
      <div
        className="panel panel-pad"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          background: 'var(--surface)',
        }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '16px',
            background: 'var(--surface-dark-2)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 700,
            flexShrink: 0,
            border: '1px solid var(--line-dark)',
          }}
        >
          {getInitials(profile?.full_name)}
        </div>

        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
              {profile?.full_name || 'Super Admin MODENA'}
            </h2>
            <span className="badge badge-red" style={{ fontWeight: 600 }}>
              <ShieldCheck size={13} style={{ marginRight: '2px' }} />
              Super Admin
            </span>
          </div>

          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--ink-2)' }}>
            {profile?.email || '-'}
          </p>

          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--ink-3)' }}>
            Akses Penuh Nasional • Hak Akses Tertinggi
          </p>
        </div>
      </div>

      {/* Form Edit Informasi Pengguna */}
      <div className="panel panel-pad" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} />
            Informasi Profil
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-3)' }}>
            Ubah nama lengkap yang ditampilkan di sistem, sidebar, dan riwayat aktivitas.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="field">
            <label htmlFor="profile-full-name" className="label">
              Nama lengkap
            </label>
            <input
              id="profile-full-name"
              type="text"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap Anda"
              required
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="profile-email" className="label">
                Email terdaftar
              </label>
              <input
                id="profile-email"
                type="email"
                className="input"
                value={profile?.email || ''}
                readOnly
                disabled
              />
            </div>

            <div className="field">
              <label htmlFor="profile-role" className="label">
                Peran & Cakupan
              </label>
              <input
                id="profile-role"
                type="text"
                className="input"
                value="Super Admin (Nasional)"
                readOnly
                disabled
              />
            </div>
          </div>

          <p className="hint" style={{ marginTop: '-6px' }}>
            Email dan peran merupakan identitas resmi MODENA yang dikelola terpusat dan tidak dapat diubah sembarangan.
          </p>

          <div style={{ paddingTop: '12px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={savingProfile || fullName.trim() === profile?.full_name}
              className="btn btn-primary"
            >
              {savingProfile ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {modals}
    </div>
  );
}

export default function AdminProfilePage() {
  return (
    <SuperAdminOnly>
      <AdminProfileContent />
    </SuperAdminOnly>
  );
}
