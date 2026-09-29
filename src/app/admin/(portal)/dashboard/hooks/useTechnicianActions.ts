// src/app/admin/(portal)/dashboard/hooks/useTechnicianActions.ts
'use client';

import { useState } from 'react';
import { callAdminApi } from '@/lib/admin-api';
import { supabase } from '@/lib/supabase';
import { buildTechnicianAccessMessage, toWhatsAppNumber } from '@/lib/technician-access';
import { NotificationType, Technician, TechnicianStatus } from '@/types';

interface UseTechnicianActionsOptions {
  notify: (type: NotificationType, title: string, message: string) => void;
  askConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onChanged: () => void;
}

/** Aksi per baris tabel teknisi: status, QR, hapus, kirim akses, dan cetak kartu. */
export function useTechnicianActions({ notify, askConfirm, onChanged }: UseTechnicianActionsOptions) {
  const [printData, setPrintData] = useState<Technician | null>(null);

  const toggleActive = async (id: string, currentStatus: TechnicianStatus) => {
    const nextStatus: TechnicianStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const { error } = await supabase
      .from('technicians')
      .update({ technician_status: nextStatus })
      .eq('id', id);

    if (error) notify('error', 'Gagal Mengubah Status', error.message);
    onChanged();
  };

  const regenerateQr = (tech: Technician) => {
    askConfirm(
      'Konfirmasi Regenerasi QR',
      `Peringatan: Regenerasi QR Code untuk ${tech.technician_name} akan membuat kartu fisik lama hangus dan tidak dapat dipindai. Lanjutkan?`,
      async () => {
        const newToken = crypto.randomUUID();

        const { error } = await supabase
          .from('technicians')
          .update({ qr_token: newToken })
          .eq('id', tech.id);

        if (error) {
          notify('error', 'Gagal Regenerasi', error.message);
          return;
        }

        await supabase
          .from('technician_id_cards')
          .update({ qr_token: newToken })
          .eq('technician_id', tech.id);

        notify('success', 'Berhasil', 'QR Code baru berhasil di-generate!');
        onChanged();
      }
    );
  };

  const deleteTechnician = (id: string) => {
    askConfirm(
      'Konfirmasi Hapus Teknisi',
      'Yakin ingin menghapus teknisi ini secara permanen? Data performa dan ID Card terkait juga akan dihapus.',
      async () => {
        // `.select()` wajib: PostgREST mengembalikan sukses tanpa error
        // walau RLS menolak dan tidak ada baris yang terhapus.
        const { data, error } = await supabase.from('technicians').delete().eq('id', id).select('id');

        if (error) {
          notify('error', 'Gagal Menghapus Data', error.message);
        } else if (!data || data.length === 0) {
          notify(
            'error',
            'Akses Ditolak',
            'Data tidak terhapus. Peran akun Anda tidak memiliki izin menghapus teknisi ini.'
          );
        } else {
          notify('success', 'Terhapus', 'Data teknisi berhasil dihapus.');
          onChanged();
        }
      }
    );
  };

  /** Terbitkan akun portal teknisi lalu siapkan pesan kredensialnya di WhatsApp */
  const sendAccess = (tech: Technician) => {
    const waNumber = toWhatsAppNumber(tech.phone);

    if (!waNumber) {
      notify(
        'warning',
        'Nomor WhatsApp Tidak Tersedia',
        `Nomor HP ${tech.technician_name} belum terisi. Lengkapi data nomor HP terlebih dahulu sebelum mengirim akses portal.`
      );
      return;
    }

    askConfirm(
      'Kirim Akses Portal Teknisi',
      `Terbitkan akun portal untuk ${tech.technician_name} dan siapkan pesan WhatsApp ke ${tech.phone}?`,
      async () => {
        // Tab dibuka langsung dari klik agar tidak diblokir popup blocker, lalu diarahkan
        // setelah API selesai. `noopener` tidak dipakai di sini karena membuat window.open
        // mengembalikan null; sebagai gantinya opener diputus secara manual.
        const waWindow = window.open('about:blank', '_blank');
        if (waWindow) waWindow.opener = null;

        const result = await callAdminApi<{ created: boolean; password?: string | null }>(
          '/api/admin/technician-access',
          'POST',
          { technician_id: tech.id }
        );

        if (!result.ok) {
          waWindow?.close();
          notify('error', 'Gagal Menerbitkan Akses', result.error);
          return;
        }

        const message = buildTechnicianAccessMessage({
          technicianName: tech.technician_name,
          technicianId: tech.technician_id,
          loginUrl: `${window.location.origin}/admin/login`,
          password: result.data.password ?? null,
        });
        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

        if (waWindow) {
          waWindow.location.href = waUrl;
        } else {
          window.open(waUrl, '_blank', 'noopener');
        }

        notify(
          'success',
          result.data.created ? 'Akun Teknisi Diterbitkan' : 'Akses Siap Dikirim',
          result.data.created
            ? `Akun portal untuk ${tech.technician_name} berhasil dibuat. Pesan WhatsApp berisi ID login dan kata sandi awal telah disiapkan.`
            : `${tech.technician_name} sudah memiliki akun portal. Pesan WhatsApp berisi petunjuk masuk telah disiapkan (kata sandi lama tetap berlaku).`
        );
      }
    );
  };

  const printCard = (tech: Technician) => {
    setPrintData(tech);
    // Beri waktu kartu cetak (termasuk foto & QR) selesai dirender sebelum dialog cetak
    setTimeout(() => window.print(), 500);
  };

  return { printData, toggleActive, regenerateQr, deleteTechnician, sendAccess, printCard };
}
