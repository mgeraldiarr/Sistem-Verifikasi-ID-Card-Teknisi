// src/app/admin/(portal)/grooming/page.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { StatCard, StatRow } from '@/components/ui/StatCard';
import { useFeedbackModals } from '@/hooks/useFeedbackModals';
import {
  formatWibTimestamp,
  getIsoWeekString,
  getWeekDateRangeLabel,
} from '@/lib/grooming/period';
import {
  getAdminGroomingReports,
  reviewGroomingReport,
} from '@/lib/grooming/service';
import { GroomingReport, GroomingStatus } from '@/types';
import { usePortal } from '../portal-context';
import { GroomingDetailModal } from './components/GroomingDetailModal';

export default function AdminGroomingPage() {
  const { profile, scopedBranch, selectedScope, selectedBranch } = usePortal();
  const { notify, modals } = useFeedbackModals();

  const isBranchAdmin = profile?.role === 'branch_admin';
  const effectiveBranch = scopedBranch ?? selectedBranch;

  const [periodWeek, setPeriodWeek] = useState(getIsoWeekString());
  const [statusFilter, setStatusFilter] = useState<GroomingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<GroomingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<GroomingReport | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminGroomingReports({
        period_week: periodWeek || undefined,
        branch: effectiveBranch || undefined,
        service_type: selectedBranch ? undefined : selectedScope || undefined,
        status: statusFilter,
        search: searchQuery,
      });
      setReports(data);
    } catch (err) {
      console.error('Error fetching grooming reports:', err);
      notify('error', 'Gagal Memuat Laporan', 'Tidak dapat mengambil data laporan grooming.');
    } finally {
      setLoading(false);
    }
  }, [periodWeek, effectiveBranch, selectedScope, selectedBranch, statusFilter, searchQuery, notify]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Statistik Kepatuhan
  const stats = useMemo(() => {
    const total = reports.length;
    const mondayCount = reports.filter((r) => r.is_monday).length;
    const approved = reports.filter((r) => r.status === 'approved').length;
    const pending = reports.filter((r) => r.status === 'submitted').length;
    const rejected = reports.filter((r) => r.status === 'rejected').length;
    const mondayRate = total > 0 ? Math.round((mondayCount / total) * 100) : 0;

    return { total, mondayCount, approved, pending, rejected, mondayRate };
  }, [reports]);

  const handleApprove = async (reportId: string) => {
    try {
      await reviewGroomingReport(reportId, 'approved');
      notify('success', 'Grooming Disetujui', 'Laporan grooming berhasil diverifikasi sesuai standar SOP.');
      await fetchReports();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyetujui laporan.';
      notify('error', 'Gagal Memproses', msg);
    }
  };

  const handleReject = async (reportId: string, reason: string) => {
    try {
      await reviewGroomingReport(reportId, 'rejected', reason);
      notify('warning', 'Grooming Ditolak', 'Catatan evaluasi telah dicatat dan status diperbarui menjadi Ditolak.');
      await fetchReports();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menolak laporan.';
      notify('error', 'Gagal Memproses', msg);
    }
  };

  return (
    <>
      <PageHeading
        title="Monitoring Grooming Teknisi"
        subtitle={`Pantau kepatuhan kerapian seragam & audit foto mingguan teknisi sebelum kunjungan servis pertama • Periode ${periodWeek} (${getWeekDateRangeLabel(periodWeek)})`}
        actions={
          <button type="button" onClick={fetchReports} className="btn btn-secondary btn-sm" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Muat Ulang
          </button>
        }
      />

      {/* Ringkasan Statistik */}
      <StatRow>
        <StatCard value={stats.total} label="Total Laporan Masuk" />
        <StatCard value={`${stats.mondayRate}%`} label={`Kepatuhan Hari Senin (${stats.mondayCount} tepat waktu)`} />
        <StatCard value={stats.approved} label="Grooming Disetujui" />
        <StatCard value={stats.pending} label="Menunggu Review" />
      </StatRow>

      {/* Toolbar & Filter */}
      <div className="toolbar" role="search" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div className="input-wrap grow" style={{ minWidth: '220px' }}>
          <Search size={16} className="input-icon" />
          <input
            id="grooming-search"
            type="search"
            className="input"
            placeholder="Cari nama, ID teknisi, atau cabang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Pemilih Minggu ISO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label htmlFor="period-week" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
            Minggu:
          </label>
          <input
            id="period-week"
            type="text"
            className="input"
            style={{ width: '130px', padding: '6px 10px', fontSize: '13px' }}
            placeholder="YYYY-Www"
            value={periodWeek}
            onChange={(e) => setPeriodWeek(e.target.value.trim().toUpperCase())}
          />
        </div>

        {/* Filter Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label htmlFor="status-filter" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
            Status:
          </label>
          <select
            id="status-filter"
            className="select"
            style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as GroomingStatus | 'all')}
          >
            <option value="all">Semua Status</option>
            <option value="submitted">Menunggu Review</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Tabel Laporan Grooming */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Foto</th>
              <th>Teknisi</th>
              <th>Cabang & Lingkup</th>
              <th>Waktu Lapor</th>
              <th>Kepatuhan</th>
              <th>Status Review</th>
              <th style={{ textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Loader2 size={24} className="spin" color="var(--red)" style={{ margin: '0 auto 8px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--ink-3)' }}>Memuat data laporan grooming...</span>
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <Sparkles size={28} color="var(--ink-3)" style={{ margin: '0 auto 12px' }} />
                  <strong style={{ display: 'block', fontSize: '14px', color: 'var(--ink)', marginBottom: '4px' }}>
                    Belum Ada Laporan Grooming
                  </strong>
                  <span style={{ fontSize: '12.5px', color: 'var(--ink-3)' }}>
                    Tidak ada laporan grooming untuk periode {periodWeek} dengan kriteria filter saat ini.
                  </span>
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id}>
                  {/* Thumbnail foto mini */}
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <img
                        src={report.photo_full_url}
                        alt="Badan"
                        style={{ width: '36px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                        title="Foto Badan Penuh"
                      />
                      <img
                        src={report.photo_face_url}
                        alt="Wajah"
                        style={{ width: '36px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                        title="Foto Wajah"
                      />
                    </div>
                  </td>

                  <td>
                    <strong style={{ display: 'block', color: 'var(--ink)' }}>{report.technician_name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                      {report.technician_id}
                    </span>
                  </td>

                  <td>
                    <span>{report.branch}</span>
                    <span className="badge" style={{ marginLeft: '6px', fontSize: '10.5px' }}>
                      {report.service_type}
                    </span>
                  </td>

                  <td>
                    <span style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                      {formatWibTimestamp(new Date(report.submission_time))}
                    </span>
                  </td>

                  <td>
                    {report.is_monday ? (
                      <span className="badge badge-success" style={{ gap: '4px' }}>
                        <CheckCircle2 size={11} /> Senin (Tepat Waktu)
                      </span>
                    ) : (
                      <span className="badge badge-warning" style={{ gap: '4px' }}>
                        <Clock size={11} /> Di Luar Senin
                      </span>
                    )}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        report.status === 'approved'
                          ? 'badge-success'
                          : report.status === 'rejected'
                            ? 'badge-error'
                            : 'badge-warning'
                      }`}
                    >
                      {report.status === 'approved'
                        ? 'Disetujui'
                        : report.status === 'rejected'
                          ? 'Ditolak'
                          : 'Menunggu Review'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedReport(report)}
                      className="btn btn-secondary btn-sm"
                      style={{ gap: '6px' }}
                    >
                      <Eye size={14} />
                      Tinjau
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Review Detail */}
      {selectedReport && (
        <GroomingDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {modals}
    </>
  );
}
