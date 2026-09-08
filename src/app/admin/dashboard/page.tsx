// src/app/admin/dashboard/page.tsx
'use client';

import React, { useMemo, useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AuthWrapper from '@/components/AuthWrapper';
import {
  ConfirmModalState,
  NotificationState,
  NotificationType,
  Technician,
  TechnicianFormData,
  TechnicianStatus,
} from '@/types';
import { useDashboardData } from './hooks/useDashboardData';
import { processExcelUpload } from './utils/excel-uploader';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardSidebar } from './components/DashboardSidebar';
import { SyncLogWidget } from './components/SyncLogWidget';
import { DashboardToolbar } from './components/DashboardToolbar';
import { DashboardFilters } from './components/DashboardFilters';
import { TechnicianTable } from './components/TechnicianTable';
import { TechnicianFormModal } from './components/TechnicianFormModal';
import { LogoutModal } from './components/LogoutModal';
import { PrintCardArea } from './components/PrintCardArea';
import { NotificationModal } from '@/components/ui/NotificationModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    technicians,
    lastSyncLog,
    loading,
    fetchData,
  } = useDashboardData();

  // State UI
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [lastFileName, setLastFileName] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('last_uploaded_file_name');
    }
    return null;
  });

  // State Modal Notifikasi & Konfirmasi
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showCustomAlert = (
    type: NotificationType,
    title: string,
    message: string,
    onClose?: () => void
  ) => {
    setNotification({ show: true, type, title, message, onClose });
  };

  const showCustomConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
        if (onCancel) onCancel();
        setConfirmModal((prev) => ({ ...prev, show: false }));
      },
    });
  };

  // 1. Membaca Parameter Filter Langsung dari URL Query (Deep Linking)
  const filterBranch = searchParams.get('branch') || '';
  const filterMonth = searchParams.get('month') || '';
  const filterYear = searchParams.get('year') || '';
  const filterLevel = searchParams.get('level') || '';
  const filterStatus = searchParams.get('status') || '';

  // Kunci cabang aktif saat ini ('all' untuk semua cabang, atau nama cabang)
  const currentBranchKey = filterBranch || 'all';

  // 2. Local State untuk Search Input agar pengetikan 100% responsif tanpa lag
  const urlQ = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(urlQ);

  useEffect(() => {
    setSearchQuery(urlQ);
  }, [urlQ]);

  // 3. Struktur Memori Filter Per Cabang (Per-Branch Filter Memory)
  interface BranchFilterState {
    searchQuery: string;
    filterMonth: string;
    filterYear: string;
    filterLevel: string;
    filterStatus: string;
  }

  const DEFAULT_FILTER: BranchFilterState = {
    searchQuery: '',
    filterMonth: '',
    filterYear: '',
    filterLevel: '',
    filterStatus: '',
  };

  // State memori filter untuk masing-masing cabang agar filter tidak hilang saat pindah cabang
  const [branchFilterMemory, setBranchFilterMemory] = useState<
    Record<string, BranchFilterState>
  >(() => {
    const initialBranch = searchParams.get('branch') || 'all';
    return {
      [initialBranch]: {
        searchQuery: searchParams.get('q') || '',
        filterMonth: searchParams.get('month') || '',
        filterYear: searchParams.get('year') || '',
        filterLevel: searchParams.get('level') || '',
        filterStatus: searchParams.get('status') || '',
      },
    };
  });

  // Helper untuk menyimpan filter ke memori cabang aktif
  const saveFilterToMemory = (updates: Partial<BranchFilterState>) => {
    setBranchFilterMemory((prev) => {
      const existing = prev[currentBranchKey] || DEFAULT_FILTER;
      return {
        ...prev,
        [currentBranchKey]: {
          ...existing,
          ...updates,
        },
      };
    });
  };

  // 4. Helper untuk memperbarui URL Query Parameters tanpa reload halaman
  const updateQueryParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      let hasChanged = false;

      Object.entries(updates).forEach(([key, value]) => {
        const current = params.get(key);
        if (value) {
          if (current !== value) {
            params.set(key, value);
            hasChanged = true;
          }
        } else {
          if (current !== null) {
            params.delete(key);
            hasChanged = true;
          }
        }
      });

      if (!hasChanged) return;

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // 5. Debounce update query teks pencarian ke URL & memori (300ms) saat user mengetik
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== urlQ) {
        saveFilterToMemory({ searchQuery });
        updateQueryParams({ q: searchQuery || null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, urlQ, updateQueryParams, currentBranchKey]);

  // 6. Setter untuk filter parameter yang menyinkronkan ke memori cabang dan URL
  const setFilterMonth = (val: string) => {
    saveFilterToMemory({ filterMonth: val });
    updateQueryParams({ month: val || null });
  };
  const setFilterYear = (val: string) => {
    saveFilterToMemory({ filterYear: val });
    updateQueryParams({ year: val || null });
  };
  const setFilterLevel = (val: string) => {
    saveFilterToMemory({ filterLevel: val });
    updateQueryParams({ level: val || null });
  };
  const setFilterStatus = (val: string) => {
    saveFilterToMemory({ filterStatus: val });
    updateQueryParams({ status: val || null });
  };

  // 7. Reset Filter: Bersihkan parameter filter cabang ini di memori dan URL, tapi PERTAHANKAN cabangnya!
  const handleResetFilters = () => {
    setBranchFilterMemory((prev) => ({
      ...prev,
      [currentBranchKey]: DEFAULT_FILTER,
    }));
    setSearchQuery('');
    updateQueryParams({
      q: null,
      month: null,
      year: null,
      level: null,
      status: null,
    });
  };

  // 8. Ganti Cabang dari Sidebar: Pulihkan filter yang pernah disimpan di cabang tersebut!
  const handleSelectBranch = (newBranch: string) => {
    const nextKey = newBranch || 'all';
    // Ambil riwayat filter yang pernah disetel di cabang tujuan (atau default jika belum pernah difilter)
    const saved = branchFilterMemory[nextKey] || DEFAULT_FILTER;

    // Sinkronkan local search input
    setSearchQuery(saved.searchQuery);

    // Terapkan filter cabang tersebut ke URL
    updateQueryParams({
      branch: newBranch || null,
      q: saved.searchQuery || null,
      month: saved.filterMonth || null,
      year: saved.filterYear || null,
      level: saved.filterLevel || null,
      status: saved.filterStatus || null,
    });
  };

  // State Cetak Kartu
  const [printData, setPrintData] = useState<Technician | null>(null);

  // State Form Teknisi
  const [formId, setFormId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TechnicianFormData>({
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
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Handlers
  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const openForm = (tech?: Technician) => {
    if (tech) {
      const card = tech.technician_id_cards?.[0];
      setFormId(tech.id);
      setFormData({
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
      });
    } else {
      setFormId(null);
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);
      const defaultExpiry = futureDate.toISOString().split('T')[0];

      setFormData({
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
        expiry_date: defaultExpiry,
      });
    }
    setPhotoFile(null);
    setShowForm(true);
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `tech-${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('employee-photos')
      .upload(fileName, file);

    if (uploadError) {
      showCustomAlert('error', 'Gagal Upload Foto', uploadError.message);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('employee-photos').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let photo_url = formId
      ? technicians.find((t) => t.id === formId)?.photo_url
      : '';

    if (photoFile) {
      const uploadedUrl = await uploadPhoto(photoFile);
      if (uploadedUrl) photo_url = uploadedUrl;
    }

    const techPayload = {
      technician_id: formData.technician_id,
      employee_number: formData.employee_number,
      technician_name: formData.technician_name,
      branch: formData.branch,
      service_center: formData.service_center || null,
      phone: formData.phone || null,
      email: formData.email || null,
      technician_status: formData.technician_status,
      technician_level: formData.technician_level,
      photo_url: photo_url || null,
      updated_at: new Date().toISOString(),
    };

    try {
      let techId = formId;
      let qrToken = '';

      if (formId) {
        const { data, error } = await supabase
          .from('technicians')
          .update(techPayload)
          .eq('id', formId)
          .select('id, qr_token')
          .single();

        if (error) throw error;
        techId = data.id;
        qrToken = data.qr_token;
      } else {
        const { data, error } = await supabase
          .from('technicians')
          .insert([techPayload])
          .select('id, qr_token')
          .single();

        if (error) throw error;
        techId = data.id;
        qrToken = data.qr_token;
      }

      if (formData.card_number && techId) {
        const cardPayload = {
          technician_id: techId,
          card_number: formData.card_number,
          qr_token: qrToken,
          card_status: formData.card_status,
          expiry_date: formData.expiry_date,
        };

        const { error: cardError } = await supabase
          .from('technician_id_cards')
          .upsert(cardPayload, { onConflict: 'card_number' });

        if (cardError) throw cardError;
      }

      setShowForm(false);
      fetchData();
    } catch (err: any) {
      showCustomAlert('error', 'Gagal Menyimpan Data', err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handler Upload Excel
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingExcel(true);
    try {
      const result = await processExcelUpload({ file, supabase });

      if (typeof window !== 'undefined') {
        localStorage.setItem('last_uploaded_file_name', file.name);
        setLastFileName(file.name);
      }

      if (result.status === 'success') {
        showCustomAlert(
          'success',
          'Sinkronisasi Excel Sukses',
          `File: "${file.name}"\nBerhasil memproses seluruh data: ${result.successCount} teknisi (${result.insertCount} baru, ${result.updateCount} diperbarui).`
        );
      } else {
        const firstError = result.errorDetails[0];
        showCustomAlert(
          result.errorDetails.length === result.totalRows ? 'error' : 'warning',
          result.errorDetails.length === result.totalRows
            ? 'Gagal Sinkronisasi Excel'
            : 'Sinkronisasi Excel Selesai Sebagian',
          `File: "${file.name}"\nBerhasil: ${result.successCount}, Gagal: ${result.errorDetails.length}.\n\nError pertama (Baris ${firstError?.row || '-'}): ${firstError?.error || 'Tidak diketahui'}`
        );
      }

      fetchData();
    } catch (err: any) {
      showCustomAlert('error', 'Gagal Memproses Excel', err.message);
    } finally {
      setUploadingExcel(false);
      e.target.value = '';
    }
  };

  // Toggle Status Aktif/Tidak Aktif
  const handleToggleActive = async (
    id: string,
    currentStatus: TechnicianStatus
  ) => {
    const newStatus: TechnicianStatus =
      currentStatus === 'active' ? 'inactive' : 'active';
    await supabase
      .from('technicians')
      .update({ technician_status: newStatus })
      .eq('id', id);
    fetchData();
  };

  // Regenerasi QR Token
  const handleRegenerateQR = async (tech: Technician) => {
    showCustomConfirm(
      'Konfirmasi Regenerasi QR',
      `Peringatan: Regenerasi QR Code untuk ${tech.technician_name} akan membuat kartu fisik lama hangus dan tidak dapat dipindai. Lanjutkan?`,
      async () => {
        const newToken = crypto.randomUUID();

        const { error: techError } = await supabase
          .from('technicians')
          .update({ qr_token: newToken })
          .eq('id', tech.id);

        if (techError) {
          showCustomAlert('error', 'Gagal Regenerasi', techError.message);
          return;
        }

        await supabase
          .from('technician_id_cards')
          .update({ qr_token: newToken })
          .eq('technician_id', tech.id);

        showCustomAlert('success', 'Berhasil', 'QR Code baru berhasil di-generate!');
        fetchData();
      }
    );
  };

  // Hapus Teknisi
  const handleDelete = async (id: string) => {
    showCustomConfirm(
      'Konfirmasi Hapus Teknisi',
      'Yakin ingin menghapus teknisi ini secara permanen? Data performa dan ID Card terkait juga akan dihapus.',
      async () => {
        const { error } = await supabase.from('technicians').delete().eq('id', id);
        if (error) {
          showCustomAlert('error', 'Gagal Menghapus Data', error.message);
        } else {
          showCustomAlert('success', 'Terhapus', 'Data teknisi berhasil dihapus.');
          fetchData();
        }
      }
    );
  };

  // Trigger Print ID Card
  const triggerPrint = (tech: Technician) => {
    setPrintData(tech);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Filter client-side
  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      // 1. Filter Nama Teknisi / ID / Nomor Karyawan (Pencarian Teks Instan)
      const matchesSearch =
        searchQuery === '' ||
        tech.technician_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.technician_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.employee_number.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Filter Cabang DSC
      const matchesBranch =
        filterBranch === '' ||
        tech.branch.toLowerCase() === filterBranch.toLowerCase();

      // 3. Filter Level & Status
      const matchesLevel =
        filterLevel === '' || tech.technician_level === filterLevel;
      const matchesStatus =
        filterStatus === '' || tech.technician_status === filterStatus;

      // 4. Filter Waktu Berbasis Kalender (Month & Year)
      const latestPeriod = tech.technician_performance?.[0]?.period; // contoh: '2026-08'
      const createdDate = tech.created_at ? new Date(tech.created_at) : null;
      const createdYear = createdDate ? String(createdDate.getFullYear()) : '';
      const createdMonth = createdDate
        ? String(createdDate.getMonth() + 1).padStart(2, '0')
        : '';
      const createdYearMonth =
        createdYear && createdMonth ? `${createdYear}-${createdMonth}` : '';

      // Pencocokan Bulan (YYYY-MM)
      let matchesMonth = true;
      if (filterMonth) {
        matchesMonth =
          latestPeriod === filterMonth || createdYearMonth === filterMonth;
      }

      // Pencocokan Tahun (YYYY)
      let matchesYear = true;
      if (filterYear) {
        const periodYear = latestPeriod ? latestPeriod.split('-')[0] : '';
        matchesYear = periodYear === filterYear || createdYear === filterYear;
      }

      return (
        matchesSearch &&
        matchesBranch &&
        matchesLevel &&
        matchesStatus &&
        matchesMonth &&
        matchesYear
      );
    });
  }, [
    technicians,
    searchQuery,
    filterBranch,
    filterLevel,
    filterStatus,
    filterMonth,
    filterYear,
  ]);


  const branchCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    technicians.forEach((t) => {
      if (t.branch) {
        counts[t.branch] = (counts[t.branch] || 0) + 1;
      }
    });
    return counts;
  }, [technicians]);

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* DASHBOARD UTAMA */}
      <div className="no-print">
        <DashboardHeader onLogout={handleLogout} />

        {/* Layout 2 Kolom: Sidebar (Lingkup Layanan & Cabang) + Konten Utama */}
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <DashboardSidebar
            selectedBranch={filterBranch}
            onSelectBranch={handleSelectBranch}
            totalTechnicians={technicians.length}
            techniciansBranchCounts={branchCounts}
          />

          <main
            style={{
              flex: 1,
              minWidth: 0,
              padding: '2rem 1.5rem',
            }}
          >
            {/* WIDGET SINKRONISASI EXCEL */}
            <SyncLogWidget
              lastSyncLog={lastSyncLog}
              lastFileName={lastFileName}
              onRefresh={fetchData}
            />

            {/* HEADER DAN TOOLBAR */}
            <DashboardToolbar
              uploadingExcel={uploadingExcel}
              onExcelUpload={handleExcelUpload}
              onAddTechnician={() => openForm()}
            />

            {/* FILTER & SEARCH PANEL (ADVANCED FILTERING) */}
            <DashboardFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterMonth={filterMonth}
              setFilterMonth={setFilterMonth}
              filterYear={filterYear}
              setFilterYear={setFilterYear}
              filterLevel={filterLevel}
              setFilterLevel={setFilterLevel}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onResetFilters={handleResetFilters}
            />

            {/* TABLE DATA */}
            <TechnicianTable
              loading={loading}
              technicians={filteredTechnicians}
              onToggleActive={handleToggleActive}
              onPrint={triggerPrint}
              onRegenerateQR={handleRegenerateQR}
              onEdit={openForm}
              onDelete={handleDelete}
            />
          </main>
        </div>

        {/* Modal Form Tambah/Edit Teknisi */}
        <TechnicianFormModal
          show={showForm}
          formId={formId}
          formData={formData}
          setFormData={setFormData}
          setPhotoFile={setPhotoFile}
          saving={saving}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />

        {/* Modal Logout */}
        <LogoutModal
          show={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={confirmLogout}
        />
      </div>

      {/* CETAK KARTU DUA SISI */}
      <PrintCardArea printData={printData} />

      {/* Custom Alert Modal */}
      <NotificationModal
        notification={notification}
        onClose={() => {
          setNotification((prev) => ({ ...prev, show: false }));
          if (notification.onClose) notification.onClose();
        }}
      />

      {/* Custom Confirm Modal */}
      <ConfirmModal
        modal={confirmModal}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => {
          if (confirmModal.onCancel) confirmModal.onCancel();
          setConfirmModal((prev) => ({ ...prev, show: false }));
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthWrapper>
      <Suspense fallback={null}>
        <AdminDashboard />
      </Suspense>
    </AuthWrapper>
  );
}
