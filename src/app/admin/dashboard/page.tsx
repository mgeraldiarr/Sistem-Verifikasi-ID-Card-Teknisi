// src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  LogOut, Plus, Trash2, Edit, Printer, Loader2,
  Image as ImageIcon, ScanLine, Search, Filter,
  RefreshCw, AlertCircle, CheckCircle2, Shield, RefreshCcw, Calendar
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

// Definisi Tipe Data untuk Teknisi
type Technician = {
  id: string;
  technician_id: string; // e.g. MOD-T001
  employee_number: string;
  technician_name: string;
  branch: string;
  service_center: string | null;
  photo_url: string | null;
  phone: string | null;
  email: string | null;
  technician_status: 'active' | 'inactive';
  technician_level: 'beginner' | 'intermediate' | 'advance';
  qr_token: string;
  created_at: string;
  technician_performance?: Array<{
    period: string;
    kpi_score: number;
    csi_score: number;
    performance_score: number;
    performance_level: string;
  }>;
  technician_id_cards?: Array<{
    card_number: string;
    card_status: 'active' | 'suspended' | 'expired';
    expiry_date: string;
  }>;
};

type SyncLog = {
  id: string;
  start_time: string;
  end_time: string | null;
  status: 'success' | 'failed' | 'partial';
  total_records: number;
  processed_records: number;
  new_records: number;
  updated_records: number;
  error_count: number;
  error_details: any;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [lastSyncLog, setLastSyncLog] = useState<SyncLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // State Pencarian & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // State untuk Cetak Kartu
  const [printData, setPrintData] = useState<Technician | null>(null);

  // State Form Teknisi
  const [formId, setFormId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    technician_id: '',
    employee_number: '',
    technician_name: '',
    branch: '',
    service_center: '',
    phone: '',
    email: '',
    technician_status: 'active' as 'active' | 'inactive',
    technician_level: 'beginner' as 'beginner' | 'intermediate' | 'advance',
    card_number: '',
    card_status: 'active' as 'active' | 'suspended' | 'expired',
    expiry_date: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Cek Sesi Login Admin
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return false;
    }
    return true;
  };

  // Mengambil data teknisi & log sinkronisasi terakhir dari database
  const fetchData = async () => {
    setLoading(true);
    const isAuthenticated = await checkSession();
    if (!isAuthenticated) return;

    // Fetch log sinkronisasi terakhir
    const { data: syncData } = await supabase
      .from('sync_logs')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (syncData) setLastSyncLog(syncData);

    // Fetch data teknisi beserta performa terbaru & kartu
    const { data: techData, error } = await supabase
      .from('technicians')
      .select(`
        *,
        technician_performance (
          period,
          kpi_score,
          csi_score,
          performance_score,
          performance_level
        ),
        technician_id_cards!technician_id_cards_technician_id_fkey (
          card_number,
          card_status,
          expiry_date
        )
      `)
      .order('created_at', { ascending: false });

    if (techData) setTechnicians(techData as unknown as Technician[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi Logout
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // Konfirmasi Proses Logout
  const confirmLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Membuka form (mode Tambah atau Edit)
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
      // Auto-generate format default tanggal kadaluarsa kartu (2 tahun dari sekarang)
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

  // Fungsi Upload Foto ke Storage
  const uploadPhoto = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `tech-${crypto.randomUUID()}.${fileExt}`;

    // Gunakan bucket employee-photos yang sudah ada di Supabase
    const { error: uploadError } = await supabase.storage
      .from('employee-photos')
      .upload(fileName, file);

    if (uploadError) {
      alert('Gagal mengupload foto: ' + uploadError.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from('employee-photos').getPublicUrl(fileName);
    return publicUrl;
  };

  // Menyimpan Data Teknisi & Kartu (Insert / Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let photo_url = formId ? technicians.find(t => t.id === formId)?.photo_url : '';

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
      updated_at: new Date().toISOString()
    };

    try {
      let techId = formId;
      let qrToken = '';

      if (formId) {
        // UPDATE TECHNICIAN
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
        // INSERT TECHNICIAN
        const { data, error } = await supabase
          .from('technicians')
          .insert([techPayload])
          .select('id, qr_token')
          .single();

        if (error) throw error;
        techId = data.id;
        qrToken = data.qr_token;
      }

      // Upsert ID Card jika nomor seri kartu diisi
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
      alert('Gagal menyimpan data: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Status Aktif/Tidak Aktif secara instan
  const handleToggleActive = async (id: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await supabase.from('technicians').update({ technician_status: newStatus }).eq('id', id);
    fetchData();
  };

  // Regenerasi Token QR Code (Membatalkan kartu lama)
  const handleRegenerateQR = async (tech: Technician) => {
    if (confirm(`Peringatan: Regenerasi QR Code untuk ${tech.technician_name} akan membuat kartu fisik lama hangus dan tidak dapat dipindai. Lanjutkan?`)) {
      const newToken = crypto.randomUUID();

      const { error: techError } = await supabase
        .from('technicians')
        .update({ qr_token: newToken })
        .eq('id', tech.id);

      if (techError) {
        alert('Gagal meregenerasi token: ' + techError.message);
        return;
      }

      // Pastikan data kartu juga ter-update agar link RLS aman
      await supabase
        .from('technician_id_cards')
        .update({ qr_token: newToken })
        .eq('technician_id', tech.id);

      alert('QR Code baru berhasil di-generate!');
      fetchData();
    }
  };

  // Menghapus Teknisi
  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus teknisi ini secara permanen? Data performa dan ID Card terkait juga akan dihapus.')) {
      await supabase.from('technicians').delete().eq('id', id);
      fetchData();
    }
  };

  // Memicu cetak ID Card
  const triggerPrint = (tech: Technician) => {
    setPrintData(tech);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Filter client-side
  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch =
      tech.technician_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.technician_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.employee_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = filterBranch === '' || tech.branch === filterBranch;
    const matchesLevel = filterLevel === '' || tech.technician_level === filterLevel;
    const matchesStatus = filterStatus === '' || tech.technician_status === filterStatus;

    return matchesSearch && matchesBranch && matchesLevel && matchesStatus;
  });

  // Ekstrak daftar cabang unik untuk filter dropdown
  const uniqueBranches = Array.from(new Set(technicians.map(t => t.branch)));

  // Format Waktu WIB
  const formatTimeWIB = (timeString: string) => {
    return new Date(timeString).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'short'
    }) + ' WIB';
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* DASHBOARD UTAMA */}
      <div className="no-print">

        {/* Navbar Header */}
        <header style={{ backgroundColor: 'var(--bg-dark)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-dark)' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            <img
              src="/modena-logo-white.png"
              alt="MODENA"
              style={{
                height: '1.8rem',      /* Tinggi disesuaikan dengan navbar */
                width: 'auto',
                objectFit: 'contain'
              }}
            />
            <span style={{ color: 'white', fontWeight: 400, opacity: 0.6, fontSize: '0.875rem', letterSpacing: '0.05em' }}>
              | TECHNICIAN PORTAL
            </span>
          </h1>

          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </header>

        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>

          {/* 📊 WIDGET SINKRONISASI EXCEL */}
          {lastSyncLog && (
            <div className="modena-card" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${lastSyncLog.status === 'success' ? 'var(--status-active)' : (lastSyncLog.status === 'partial' ? '#F59E0B' : 'var(--status-inactive)')}` }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  {lastSyncLog.status === 'success' ? <CheckCircle2 size={16} color="var(--status-active)" /> : <AlertCircle size={16} color={lastSyncLog.status === 'partial' ? '#F59E0B' : 'var(--status-inactive)'} />}
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    Sinkronisasi Excel Terakhir: {lastSyncLog.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Selesai pada: {formatTimeWIB(lastSyncLog.end_time || lastSyncLog.start_time)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>{lastSyncLog.total_records}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Baris</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--status-active)' }}>{lastSyncLog.new_records}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Baru</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#3B82F6' }}>{lastSyncLog.updated_records}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Diberbarui</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.15rem', color: lastSyncLog.error_count > 0 ? 'var(--status-inactive)' : 'var(--text-secondary)' }}>{lastSyncLog.error_count}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gagal</div>
                </div>
              </div>

              <button onClick={fetchData} className="modena-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '8px 16px', borderRadius: '4px' }}>
                <RefreshCw size={14} /> Segarkan
              </button>
            </div>
          )}

          {/* HEADER DAN TOOLBAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Daftar Teknisi</h2>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/scan" className="modena-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '4px', padding: '10px 18px', fontSize: '0.825rem' }}>
                <ScanLine size={16} /> Scan ID Card
              </Link>
              <button onClick={() => openForm()} className="modena-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '4px', padding: '10px 18px', fontSize: '0.825rem' }}>
                <Plus size={16} /> Tambah Teknisi
              </button>
            </div>
          </div>

          {/* 🔍 FILTER & SEARCH PANEL */}
          <div className="modena-card" style={{ marginBottom: '1.5rem', padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            {/* Input Pencarian */}
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Cari nama, ID MOD, nomor karyawan..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>

            {/* Filter Cabang */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '150px' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                value={filterBranch}
                onChange={e => setFilterBranch(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.875rem', outline: 'none' }}
              >
                <option value="">Semua Cabang</option>
                {uniqueBranches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            {/* Filter Level */}
            <div style={{ minWidth: '150px' }}>
              <select
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.875rem', outline: 'none' }}
              >
                <option value="">Semua Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advance">Advance</option>
              </select>
            </div>

            {/* Filter Status */}
            <div style={{ minWidth: '130px' }}>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.875rem', outline: 'none' }}
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* TABLE DATA */}
          <div className="modena-card" style={{ padding: '0', overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
                <Loader2 className="animate-spin-custom" size={36} color="var(--bg-dark)" />
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#F9FAFB' }}>
                    <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.825rem', textTransform: 'uppercase' }}>Teknisi</th>
                    <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.825rem', textTransform: 'uppercase' }}>Cabang / Service Center</th>
                    <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.825rem', textTransform: 'uppercase' }}>Performa (KPI/CSI)</th>
                    <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.825rem', textTransform: 'uppercase' }}>ID Card Fisik</th>
                    <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.825rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.825rem', textTransform: 'uppercase', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTechnicians.map(tech => {
                    const card = tech.technician_id_cards?.[0];
                    const perf = tech.technician_performance?.[0];

                    return (
                      <tr key={tech.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>

                        {/* Detail Profil */}
                        <td style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#F3F4F6', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                            {tech.photo_url ? <img src={tech.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon color="#A3A3A3" style={{ margin: '12px' }} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{tech.technician_name}</div>
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                              {tech.technician_id} • Level:{' '}
                              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{tech.technician_level}</span>
                            </div>
                          </div>
                        </td>

                        {/* Cabang */}
                        <td style={{ padding: '1.25rem', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          <div style={{ fontWeight: 600 }}>{tech.branch}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tech.service_center || '-'}</div>
                        </td>

                        {/* Performa */}
                        <td style={{ padding: '1.25rem', fontSize: '0.875rem' }}>
                          {perf ? (
                            <div>
                              <div>KPI: <strong style={{ color: 'var(--text-primary)' }}>{perf.kpi_score}%</strong> | CSI: <strong style={{ color: 'var(--text-primary)' }}>{perf.csi_score}/10</strong></div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Periode: {perf.period}</div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Belum ada data</span>
                          )}
                        </td>

                        {/* Info ID Card */}
                        <td style={{ padding: '1.25rem', fontSize: '0.875rem' }}>
                          {card ? (
                            <div>
                              <div style={{ fontWeight: 600 }}>{card.card_number}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Exp: {card.expiry_date}</div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Belum terbit</span>
                          )}
                        </td>

                        {/* Status Aktif */}
                        <td style={{ padding: '1.25rem' }}>
                          <button
                            onClick={() => handleToggleActive(tech.id, tech.technician_status)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: tech.technician_status === 'active' ? 'var(--status-active-glow)' : 'var(--status-inactive-glow)',
                              color: tech.technician_status === 'active' ? 'var(--status-active)' : 'var(--status-inactive)',
                              border: '1px solid transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {tech.technician_status === 'active' ? 'AKTIF' : 'NONAKTIF'}
                          </button>
                        </td>

                        {/* Aksi */}
                        <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => triggerPrint(tech)} style={{ padding: '6px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }} title="Cetak ID Card">
                              <Printer size={18} />
                            </button>
                            <button onClick={() => handleRegenerateQR(tech)} style={{ padding: '6px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }} title="Regenerasi QR Code Token">
                              <RefreshCcw size={18} />
                            </button>
                            <button onClick={() => openForm(tech)} style={{ padding: '6px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }} title="Edit Data">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(tech.id)} style={{ padding: '6px', background: 'transparent', color: 'var(--accent-red)', cursor: 'pointer' }} title="Hapus Data">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}

                  {filteredTechnicians.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Data teknisi tidak ditemukan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>

        {/* Modal Form Tambah/Edit Teknisi */}
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50, backdropFilter: 'blur(4px)' }}>
            <div className="modena-card" style={{ width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--bg-dark)' }}>
                {formId ? 'Edit Data Teknisi Modena' : 'Tambah Teknisi Modena Baru'}
              </h3>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>ID Teknisi</label>
                    <input type="text" required value={formData.technician_id} onChange={e => setFormData({ ...formData, technician_id: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }} placeholder="MOD-T001" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>Nomor Karyawan</label>
                    <input type="text" required value={formData.employee_number} onChange={e => setFormData({ ...formData, employee_number: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }} placeholder="10293847" />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>Nama Lengkap Teknisi</label>
                  <input type="text" required value={formData.technician_name} onChange={e => setFormData({ ...formData, technician_name: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }} placeholder="Contoh: Budi Santoso" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>Cabang / Wilayah</label>
                    <input type="text" required value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }} placeholder="Contoh: Jakarta" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>Service Center</label>
                    <input type="text" value={formData.service_center} onChange={e => setFormData({ ...formData, service_center: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }} placeholder="Contoh: SC Selatan" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>Level Sertifikasi</label>
                    <select value={formData.technician_level} onChange={e => setFormData({ ...formData, technician_level: e.target.value as any })} style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advance">Advance</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>Status Aktif</label>
                    <select value={formData.technician_status} onChange={e => setFormData({ ...formData, technician_status: e.target.value as any })} style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }}>
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>Nomor Telepon (Sensitif)</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }} placeholder="0812345..." />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>Email Korporat (Sensitif)</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }} placeholder="budi@modena.com" />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}></div>

                {/* Seksi ID Card Terkait */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>Nomor ID Card Fisik</label>
                    <input type="text" required={!!formId} value={formData.card_number} onChange={e => setFormData({ ...formData, card_number: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }} placeholder="CARD-T001" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>Tanggal Kadaluarsa Kartu</label>
                    <input type="date" required={!!formId} value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.4rem' }}>Foto Resmi Teknisi (Maks 2MB)</label>
                  <input type="file" accept="image/png, image/jpeg" onChange={e => setPhotoFile(e.target.files?.[0] || null)} style={{ width: '100%', padding: '0.5rem 0', fontSize: '0.875rem' }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowForm(false)} className="modena-btn-secondary" style={{ flex: 1 }}>BATAL</button>
                  <button type="submit" disabled={saving} className="modena-btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    {saving ? <Loader2 size={18} className="animate-spin-custom" /> : 'SIMPAN DATA'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Logout */}
        {showLogoutModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50, backdropFilter: 'blur(4px)' }}>
            <div className="modena-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '2.5rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--accent-red)' }}>
                <LogOut size={48} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                Konfirmasi Keluar
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                Apakah Anda yakin ingin keluar dari Dashboard Portal Admin MODENA?
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowLogoutModal(false)} className="modena-btn-secondary" style={{ flex: 1, padding: '10px 20px', borderRadius: '4px' }}>BATAL</button>
                <button type="button" onClick={confirmLogout} className="modena-btn-primary" style={{ flex: 1, padding: '10px 20px', borderRadius: '4px', backgroundColor: 'var(--accent-red)', color: 'white' }}>KELUAR</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CETAK KARTU DUA SISI */}
      <div className="print-area" style={{ display: 'none' }}>
        {printData && (() => {
          const CARD_W = '53.98mm'; // Standar kartu PVC CR80
          const CARD_H = '85.60mm';
          const CREAM = '#ECE8DA';
          const DARK = '#1C1C1A';

          const Logo = () => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2mm' }}>
              <img
                src="/logo-modena.png"
                alt="Modena Logo"
                style={{
                  width: '8mm',
                  height: '8mm',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '1px solid #D6D2C2'
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', transform: 'translateY(-0.5mm)' }}>
                <span style={{ fontSize: '7.5pt', fontWeight: 800, lineHeight: 1.1, color: DARK }}>
                  MODENA
                </span>
                <span style={{ fontSize: '6pt', fontWeight: 800, letterSpacing: '1px', lineHeight: 1.1, color: '#707070', marginTop: '0.5mm' }}>
                  AUTHORIZED
                </span>
              </div>
            </div>
          );

          // Level Teks
          const levelLabels: Record<string, string> = {
            beginner: 'BEGINNER',
            intermediate: 'INTERMEDIATE',
            advance: 'ADVANCED'
          };
          const levelText = levelLabels[printData.technician_level] || printData.technician_level.toUpperCase();

          return (
            <div style={{ display: 'flex', gap: '10mm', flexWrap: 'wrap', padding: '10mm' }}>

              {/* ============ KARTU DEPAN ============ */}
              <div
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  backgroundColor: CREAM,
                  borderRadius: '3.5mm',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  fontFamily: 'var(--font-sans, Arial, sans-serif)',
                  border: '1px solid #D6D2C2'
                }}
              >
                {/* Header logo */}
                <div style={{ padding: '4mm 4mm 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Logo />
                  <span style={{
                    fontSize: '5pt',
                    fontWeight: 700,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    padding: '1mm 2mm',
                    borderRadius: '1mm',
                    color: DARK
                  }}>
                    {levelText}
                  </span>
                </div>

                {/* Foto profil */}
                <div
                  style={{
                    flex: 1,
                    margin: '3mm 4mm 0',
                    borderRadius: '2mm',
                    overflow: 'hidden',
                    backgroundColor: '#D6D2C2',
                    border: '1px solid #C5C1B1'
                  }}
                >
                  {printData.photo_url ? (
                    <img
                      src={printData.photo_url}
                      alt={printData.technician_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon color="#A3A3A3" size={24} />
                    </div>
                  )}
                </div>

                {/* Nama & Status */}
                <div style={{ backgroundColor: DARK, color: 'white', padding: '3mm 4mm' }}>
                  <div style={{ fontSize: '9.5pt', fontWeight: 800, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '0.2px' }}>
                    {printData.technician_name}
                  </div>
                  <div style={{ fontSize: '5.5pt', fontWeight: 600, color: '#DA291C', marginTop: '1mm', letterSpacing: '0.8px' }}>
                    AUTHORIZED TECHNICIAN
                  </div>
                </div>
              </div>

              {/* ============ KARTU BELAKANG ============ */}
              <div
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  backgroundColor: CREAM,
                  borderRadius: '3.5mm',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '4mm',
                  fontFamily: 'var(--font-sans, Arial, sans-serif)',
                  border: '1px solid #D6D2C2'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Logo />
                  <Shield size={16} style={{ color: '#DA291C' }} />
                </div>

                {/* QR Code */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4mm 0' }}>
                  <QRCodeSVG
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${printData.qr_token}`}
                    size={100}
                    style={{ width: '22mm', height: '22mm' }}
                    level="M"
                  />
                </div>

                {/* Detail ID */}
                <div style={{ marginTop: '2mm', display: 'flex', flexDirection: 'column', gap: '2mm' }}>
                  <div>
                    <div style={{ fontSize: '5.5pt', fontWeight: 800, color: '#707070', letterSpacing: '0.5px' }}>ID TEKNISI</div>
                    <div style={{ fontSize: '7pt', fontWeight: 700, color: DARK }}>
                      {printData.technician_id}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '5.5pt', fontWeight: 800, color: '#707070', letterSpacing: '0.5px' }}>CABANG / WILAYAH</div>
                    <div style={{ fontSize: '7pt', fontWeight: 700, color: DARK }}>
                      {printData.branch}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '5.5pt', fontWeight: 800, color: '#707070', letterSpacing: '0.5px' }}>KONTAK LAYANAN</div>
                    <div style={{ fontSize: '6.5pt', fontWeight: 600, color: '#4A4A4A', lineHeight: '1.2', marginTop: '0.5mm' }}>
                      PT MODENA INDONESIA<br />
                      Call Center: 1500715
                    </div>
                  </div>
                </div>
              </div>

            </div>
          );
        })()}
      </div>

    </div>
  );
}