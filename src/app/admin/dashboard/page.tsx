// src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LogOut, Plus, Trash2, Edit, Printer, Loader2, Image as ImageIcon, ScanLine } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

// Definisi Tipe Data
type Employee = {
  id: string;
  employee_code: string;
  full_name: string;
  branch_name: string;
  position: string;
  photo_url: string;
  is_active: boolean;
};

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // State untuk Cetak Kartu
  const [printData, setPrintData] = useState<Employee | null>(null);

  // State Form Karyawan
  const [formId, setFormId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    employee_code: '',
    branch_name: '',
    position: '',
    is_active: true,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Mengambil data dari database
  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setEmployees(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fungsi Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Membuka form (bisa mode Tambah atau Edit)
  const openForm = (emp?: Employee) => {
    if (emp) {
      setFormId(emp.id);
      setFormData({
        full_name: emp.full_name,
        employee_code: emp.employee_code,
        branch_name: emp.branch_name,
        position: emp.position,
        is_active: emp.is_active,
      });
    } else {
      setFormId(null);
      setFormData({ full_name: '', employee_code: '', branch_name: '', position: '', is_active: true });
    }
    setPhotoFile(null);
    setShowForm(true);
  };

  // Fungsi Upload Foto ke Storage
  const uploadPhoto = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('employee-photos')
      .upload(fileName, file);

    if (uploadError) {
      alert('Gagal mengupload foto: ' + uploadError.message);
      return null;
    }

    // Ambil URL Publik
    const { data: { publicUrl } } = supabase.storage.from('employee-photos').getPublicUrl(fileName);
    return publicUrl;
  };

  // Menyimpan Data Karyawan (Insert / Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let photo_url = formId ? employees.find(e => e.id === formId)?.photo_url : '';

    if (photoFile) {
      const uploadedUrl = await uploadPhoto(photoFile);
      if (uploadedUrl) photo_url = uploadedUrl;
    }

    const payload = {
      ...formData,
      ...(photo_url ? { photo_url } : {})
    };

    if (formId) {
      await supabase.from('employees').update(payload).eq('id', formId);
    } else {
      await supabase.from('employees').insert([payload]);
    }

    setSaving(false);
    setShowForm(false);
    fetchEmployees();
  };

  // Toggle Status Aktif/Tidak Aktif secara instan
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await supabase.from('employees').update({ is_active: !currentStatus }).eq('id', id);
    fetchEmployees();
  };

  // Menghapus Karyawan
  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus karyawan ini secara permanen?')) {
      await supabase.from('employees').delete().eq('id', id);
      fetchEmployees();
    }
  };

  // Memicu jendela dialog Print Browser
  const triggerPrint = (emp: Employee) => {
    setPrintData(emp);
    setTimeout(() => {
      window.print();
    }, 500); // Tunggu setengah detik agar layout render terlebih dahulu
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* =========================================
          BAGIAN DASHBOARD UTAMA (Disembunyikan saat Print) 
          ========================================= */}
      <div className="no-print">

        {/* Navbar Header */}
        <header style={{ backgroundColor: 'var(--bg-dark)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ color: 'white', fontWeight: 800, letterSpacing: '0.1em' }}>MODENA <span style={{ fontWeight: 400, opacity: 0.8, fontSize: '0.875rem' }}>| HR Portal</span></h1>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'white', fontWeight: 600 }}>
            <LogOut size={18} /> Logout
          </button>
        </header>

        {/* Konten Utama */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Manajemen Karyawan</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/scan" className="modena-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', borderRadius: '4px' }}>
                <ScanLine size={18} /> Scan ID Card
              </Link>
              <button onClick={() => openForm()} className="modena-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '4px' }}>
                <Plus size={18} /> Tambah Data
              </button>
            </div>
          </div>

          <div className="modena-card" style={{ padding: '0', overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
                <Loader2 className="animate-spin-custom" size={36} color="var(--bg-dark)" />
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: '#F9FAFB' }}>
                    <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Karyawan</th>
                    <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cabang</th>
                    <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status ID Card</th>
                    <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>

                      <td style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#E5E5E5' }}>
                          {emp.photo_url ? <img src={emp.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon color="#A3A3A3" style={{ margin: '13px' }} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.full_name}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{emp.employee_code} • {emp.position}</div>
                        </div>
                      </td>

                      <td style={{ padding: '1.25rem', color: 'var(--text-primary)' }}>{emp.branch_name}</td>

                      <td style={{ padding: '1.25rem' }}>
                        <button
                          onClick={() => handleToggleActive(emp.id, emp.is_active)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: emp.is_active ? 'var(--status-active-glow)' : 'var(--status-inactive-glow)',
                            color: emp.is_active ? 'var(--status-active)' : 'var(--status-inactive)',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {emp.is_active ? 'AKTIF' : 'TIDAK AKTIF'}
                        </button>
                      </td>

                      <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => triggerPrint(emp)} style={{ padding: '6px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }} title="Cetak Layout ID Card">
                            <Printer size={18} />
                          </button>
                          <button onClick={() => openForm(emp)} style={{ padding: '6px', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }} title="Edit Data">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(emp.id)} style={{ padding: '6px', background: 'transparent', color: 'var(--accent-red)', cursor: 'pointer' }} title="Hapus Data">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}

                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Belum ada data karyawan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>

        {/* Modal Form Tambah/Edit Karyawan */}
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50, backdropFilter: 'blur(4px)' }}>
            <div className="modena-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--bg-dark)' }}>
                {formId ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nama Lengkap</label>
                  <input type="text" required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="Contoh: Budi Santoso" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Kode Karyawan</label>
                  <input type="text" required value={formData.employee_code} onChange={e => setFormData({ ...formData, employee_code: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="Contoh: EMP-001" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Jabatan</label>
                  <input type="text" required value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="Contoh: Staff Keuangan" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Cabang / Lokasi</label>
                  <input type="text" required value={formData.branch_name} onChange={e => setFormData({ ...formData, branch_name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }} placeholder="Contoh: Kantor Pusat - Jakarta" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Foto Profil Resmi (Maks 2MB)</label>
                  <input type="file" accept="image/png, image/jpeg" onChange={e => setPhotoFile(e.target.files?.[0] || null)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.875rem' }} />
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
      </div>

      {/* =========================================
          BAGIAN CETAK KARTU (Hanya Terlihat Saat Ctrl+P) 
          Berkat CSS @media print di globals.css
          ========================================= */}
      <div className="print-area" style={{ display: 'none' }}>
        {printData && (() => {
          const CARD_W = '54mm';
          const CARD_H = '85.6mm';
          const CREAM = '#ECE8DA';
          const DARK = '#1C1C1A';

          const Logo = () => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2mm'  }}>
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

              {/* TEXT LOGO */}
              <div style={{ display: 'flex', flexDirection: 'column', transform: 'translateY(-0.5mm)' }}>
                <span style={{ fontSize: '7.5pt', fontWeight: 800, lineHeight: 1.1, color: DARK }}>
                  MODENA
                </span>
                <span style={{ fontSize: '7pt', fontWeight: 800, letterSpacing: '1.2px', lineHeight: 1.1, color: '#707070', marginTop: '0.5mm'}}>
                INDONESIA
                </span>
              </div>
            </div>
          );

          return (
            <div style={{ display: 'flex', gap: '10mm', flexWrap: 'wrap', padding: '10mm' }}>
              {/* ============ KARTU DEPAN ============ */}
              <div
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  backgroundColor: CREAM,
                  borderRadius: '4mm',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  fontFamily: 'var(--font-sans, Arial, sans-serif)',
                }}
              >
                {/* Header logo */}
                <div style={{ padding: '5mm 5mm 0' }}>
                  <Logo />
                </div>

                {/* Foto profil (otomatis grayscale) */}
                <div
                  style={{
                    flex: 1,
                    margin: '4mm 4mm 0',
                    borderRadius: '2mm',
                    overflow: 'hidden',
                    backgroundColor: '#D6D2C2',
                  }}
                >
                  {printData.photo_url ? (
                    <img
                      src={printData.photo_url}
                      alt={printData.full_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%' }} />
                  )}
                </div>

                {/* Nama & jabatan */}
                <div style={{ backgroundColor: DARK, color: 'white', padding: '3.5mm 5mm' }}>
                  <div style={{ fontSize: '11pt', fontWeight: 700, lineHeight: 1.1 }}>{printData.full_name}</div>
                  <div style={{ fontSize: '6pt', fontWeight: 400, color: '#C9C9C9', marginTop: '1mm' }}>
                    {printData.position}
                  </div>
                </div>
              </div>

              {/* ============ KARTU BELAKANG ============ */}
              <div
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  backgroundColor: CREAM,
                  borderRadius: '4mm',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '5mm',
                  fontFamily: 'var(--font-sans, Arial, sans-serif)',
                }}
              >
                <Logo />

                {/* QR Code */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '6mm 0' }}>
                  <QRCodeSVG
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${printData.id}`}
                    size={110}
                    style={{ width: '24mm', height: '24mm' }}
                    level="M"
                  />
                </div>

                {/* ID */}
                <div style={{ marginTop: '4mm' }}>
                  <div style={{ fontSize: '6pt', fontWeight: 700, color: DARK, letterSpacing: '0.5px' }}>ID</div>
                  <div style={{ fontSize: '7.5pt', fontWeight: 600, color: DARK, marginTop: '0.5mm' }}>
                    {printData.employee_code}
                  </div>
                </div>

                {/* Kontak */}
                <div style={{ marginTop: '4mm' }}>
                  <div style={{ fontSize: '6pt', fontWeight: 700, color: DARK, letterSpacing: '0.5px' }}>
                    CONTACT
                  </div>
                  <div style={{ fontSize: '7.5pt', fontWeight: 600, color: DARK, marginTop: '0.5mm' }}>
                    {printData.branch_name}
                  </div>
                  <div style={{ fontSize: '7.5pt', fontWeight: 600, color: DARK, marginTop: '0.5mm' }}>
                    PT. MODENA INDONESIA
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