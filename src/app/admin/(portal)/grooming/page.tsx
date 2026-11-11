// src/app/admin/(portal)/grooming/page.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Loader2,
  RotateCcw,
  Search,
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
import { BranchSelect } from '../dashboard/components/filters/BranchSelect';
import { usePortal } from '../portal-context';
import { GroomingDetailModal } from './components/GroomingDetailModal';
import { GroomingWeekPicker } from './components/GroomingWeekPicker';
import styles from './components/GroomingFilters.module.css';

export default function AdminGroomingPage() {
  const { scopedBranch } = usePortal();
  const { notify, modals } = useFeedbackModals();

  const [filterBranch, setFilterBranch] = useState<string>(scopedBranch ?? '');
  const effectiveBranch = scopedBranch ?? filterBranch;

  const currentIsoWeek = getIsoWeekString();
  const [periodWeek, setPeriodWeek] = useState(currentIsoWeek);
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
  }, [periodWeek, effectiveBranch, statusFilter, searchQuery, notify]);

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
      notify('warning', 'Grooming Ditolak', 'Catatan evaluasi telah dicatat dan teknisi dapat mengirimkan foto perbaikan.');
      await fetchReports();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menolak laporan.';
      notify('error', 'Gagal Memproses', msg);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setPeriodWeek(currentIsoWeek);
    setStatusFilter('all');
    setFilterBranch(scopedBranch ?? '');
  };

  const hasActiveFilter =
    Boolean(searchQuery) ||
    periodWeek !== currentIsoWeek ||
    statusFilter !== 'all' ||
    Boolean(filterBranch && !scopedBranch);

  return (
    <>
      <PageHeading
        title="Monitoring Grooming Teknisi"
        subtitle={
          periodWeek
            ? `Pantau kepatuhan kerapian seragam & audit foto mingguan teknisi sebelum kunjungan servis pertama • Periode ${getWeekDateRangeLabel(periodWeek)}`
            : 'Pantau kepatuhan kerapian seragam & audit foto mingguan teknisi dari seluruh periode'
        }
      />

      {/* Ringkasan Statistik Kepatuhan Mingguan */}
      <StatRow>
        <StatCard value={stats.total} label="Total Laporan Masuk" />
        <StatCard
          value={`${stats.mondayRate}%`}
          label={`Kepatuhan Hari Senin (${stats.mondayCount} tepat waktu)`}
        />
        <StatCard value={stats.approved} label="Grooming Disetujui" />
        <StatCard value={stats.pending} label="Menunggu Review" />
      </StatRow>

      {/* Toolbar & Filter Bar - Standar MODENA Design System */}
      <div className={styles.filters} role="search">
        {/* Input Pencarian */}
        <div className={`input-wrap ${styles.searchWrap}`}>
          <Search size={16} className="input-icon" />
          <input
            id="grooming-search"
            name="grooming_search"
            type="search"
            className="input"
            placeholder="Cari nama, ID teknisi, atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.controls}>
          {/* Pemilih Cabang */}
          <div className={styles.branchWrap}>
            <BranchSelect
              value={filterBranch}
              onChange={setFilterBranch}
              lockedBranch={scopedBranch}
              scope={''}
            />
          </div>

          {/* Pemilih Periode Minggu / Kalender (Mudah Tanpa Hitung ISO Week) */}
          <div className={styles.weekWrap}>
            <GroomingWeekPicker value={periodWeek} onChange={setPeriodWeek} />
          </div>

          {/* Filter Status Review */}
          <div className={`input-wrap ${styles.statusWrap}`}>
            <Filter size={15} className="input-icon" />
            <select
              id="status-filter"
              name="status_filter"
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GroomingStatus | 'all')}
            >
              <option value="all">Semua Status</option>
              <option value="submitted">Menunggu Review</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Perlu Perbaikan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ringkasan Hasil & Reset */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          fontSize: '13px',
          color: 'var(--ink-3)',
        }}
      >
        <span>
          {loading ? 'Memuat laporan...' : `${reports.length} laporan ditampilkan`}
        </span>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '12px', padding: '4px 8px', gap: '4px' }}
          >
            <RotateCcw size={12} />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      {/* Panel Tabel Laporan Grooming */}
      <div className="table-panel">
        {!loading && reports.length === 0 ? (
          <div className="table-empty">
            <Sparkles size={28} color="var(--ink-3)" style={{ margin: '0 auto 10px' }} />
            <strong>Belum Ada Laporan Grooming</strong>
            <span>
              Tidak ada data laporan grooming untuk periode <strong>{periodWeek}</strong> dengan kriteria filter saat ini.
            </span>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: '90px' }}>Foto Audit</th>
                <th scope="col">Teknisi</th>
                <th scope="col">Cabang</th>
                <th scope="col">Waktu Lapor</th>
                <th scope="col">Kepatuhan Waktu</th>
                <th scope="col">Status Review</th>
                <th scope="col" className="col-actions">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <Loader2 size={24} className="spin" color="var(--red)" style={{ margin: '0 auto 8px' }} />
                    <span style={{ fontSize: '13px', color: 'var(--ink-3)' }}>Memuat data laporan grooming...</span>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    {/* Thumbnail foto mini dengan watermark inspect */}
                    <td>
                      <div
                        style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}
                        onClick={() => setSelectedReport(report)}
                        title="Klik untuk membuka detail verifikasi"
                      >
                        <div
                          style={{
                            width: '38px',
                            height: '48px',
                            borderRadius: 'var(--r-sm)',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 0 0 1px var(--line)',
                            background: 'var(--surface-sunk)',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={report.photo_full_url}
                            alt="Badan"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            title="Foto Badan Penuh"
                          />
                        </div>
                        <div
                          style={{
                            width: '38px',
                            height: '48px',
                            borderRadius: 'var(--r-sm)',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 0 0 1px var(--line)',
                            background: 'var(--surface-sunk)',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={report.photo_face_url}
                            alt="Wajah"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            title="Foto Wajah"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Teknisi */}
                    <td className="cell-primary">
                      <div className="cell-strong" style={{ color: 'var(--ink)' }}>
                        {report.technician_name}
                      </div>
                      <div className="cell-sub tnum" style={{ fontFamily: 'monospace' }}>
                        {report.technician_id}
                      </div>
                    </td>

                    {/* Cabang & Lingkup */}
                    <td data-label="Cabang">
                      <div className="cell-strong">
                        <span className="badge" style={{ marginRight: '6px' }}>
                          {report.service_type}
                        </span>
                        {report.branch}
                      </div>
                    </td>

                    {/* Waktu Lapor */}
                    <td data-label="Waktu Lapor">
                      <div className="cell-strong" style={{ fontSize: '13px' }}>
                        {formatWibTimestamp(new Date(report.submission_time))}
                      </div>
                    </td>

                    {/* Kepatuhan Waktu */}
                    <td data-label="Kepatuhan Waktu">
                      {report.is_monday ? (
                        <span className="badge badge-ok">
                          <CheckCircle2 size={12} />
                          <span>Senin (Tepat Waktu)</span>
                        </span>
                      ) : (
                        <span className="badge badge-warn">
                          <Clock size={12} />
                          <span>Susulan (Di Luar Senin)</span>
                        </span>
                      )}
                    </td>

                    {/* Status Review */}
                    <td data-label="Status Review">
                      {report.status === 'approved' ? (
                        <span className="badge badge-ok">
                          <CheckCircle2 size={12} />
                          <span>Disetujui</span>
                        </span>
                      ) : report.status === 'rejected' ? (
                        <span className="badge badge-red">
                          <XCircle size={12} />
                          <span>Perlu Perbaikan</span>
                        </span>
                      ) : (
                        <span className="badge badge-warn">
                          <Clock size={12} />
                          <span>Menunggu Review</span>
                        </span>
                      )}
                    </td>

                    {/* Aksi Tinjau */}
                    <td className="col-actions">
                      <button
                        type="button"
                        onClick={() => setSelectedReport(report)}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '6px' }}
                        title="Tinjau foto watermark & checklist SOP"
                      >
                        <Eye size={14} />
                        <span>Tinjau</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Review Detail Verifikasi */}
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
