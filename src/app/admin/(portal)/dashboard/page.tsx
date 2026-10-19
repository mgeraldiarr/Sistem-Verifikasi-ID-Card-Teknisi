// src/app/admin/(portal)/dashboard/page.tsx
'use client';

import React, { Suspense, useMemo } from 'react';
import { DSC_BRANCHES } from '@/constants/service-center';
import { useFeedbackModals } from '@/hooks/useFeedbackModals';
import { useKpiWeights } from '@/hooks/useKpiWeights';
import { downloadMasterTemplateExcel } from '@/lib/template-generator';
import { usePortal } from '../portal-context';
import { DashboardFilters } from './components/filters/DashboardFilters';
import { DashboardToolbar } from './components/DashboardToolbar';
import { PrintCardArea } from './components/PrintCardArea';
import { SkillDistributionWidget } from './components/skill-distribution/SkillDistributionWidget';
import { SyncLogWidget } from './components/SyncLogWidget';
import { TechnicianTable } from './components/technician-table/TechnicianTable';
import { TechnicianFormModal } from './components/technician-form/TechnicianFormModal';
import { useDashboardData } from './hooks/useDashboardData';
import { useDashboardFilters } from './hooks/useDashboardFilters';
import { useExcelUpload } from './hooks/useExcelUpload';
import { useTechnicianActions } from './hooks/useTechnicianActions';
import { useTechnicianForm } from './hooks/useTechnicianForm';
import { buildBranchLabel, buildPeriodLabel, computeSkillDistribution } from './utils/dashboard-stats';
import { filterTechnicians } from './utils/technician-filters';

function AdminDashboard() {
  // Profil peran & cabang kerja disediakan oleh layout portal (satu kali fetch).
  // Cabang kerja juga mengunci Admin Cabang pada cabangnya sendiri.
  const { profile, scopedBranch, selectedBranch, selectBranch } = usePortal();
  const isBranchAdmin = profile?.role === 'branch_admin';

  const { notify, askConfirm, modals } = useFeedbackModals();
  const { weights: kpiWeights } = useKpiWeights();
  const { technicians, lastSyncLog, loading, fetchData } = useDashboardData({
    scopedBranch,
    enabled: Boolean(profile),
  });

  const filters = useDashboardFilters();
  const form = useTechnicianForm({ technicians, scopedBranch, notify, onSaved: fetchData });
  const actions = useTechnicianActions({ notify, askConfirm, onChanged: fetchData });
  const excel = useExcelUpload({ scopedBranch, kpiWeights, notify, onUploaded: fetchData });

  const filteredTechnicians = useMemo(
    () =>
      filterTechnicians(technicians, {
        search: filters.searchQuery,
        branch: selectedBranch,
        level: filters.level,
        status: filters.status,
        month: filters.month,
        year: filters.year,
      }),
    [
      technicians,
      filters.searchQuery,
      selectedBranch,
      filters.level,
      filters.status,
      filters.month,
      filters.year,
    ]
  );

  const skillStats = useMemo(
    () => computeSkillDistribution(filteredTechnicians),
    [filteredTechnicians]
  );

  // Template diisi otomatis dengan teknisi yang sedang tampil (atau semua bila filter kosong)
  const handleDownloadTemplate = () =>
    downloadMasterTemplateExcel({
      technicians: filteredTechnicians.length > 0 ? filteredTechnicians : technicians,
      year: filters.year ? parseInt(filters.year, 10) : undefined,
      month: filters.month || undefined,
      branch: selectedBranch || undefined,
    });

  return (
    <>
      {/* Sidebar & kerangka halaman disediakan layout portal */}
      <div className="no-print">
        <DashboardToolbar
          subtitle={`${buildBranchLabel(selectedBranch, DSC_BRANCHES.length)}, ${buildPeriodLabel(filters.year, filters.month)}`}
          uploadingExcel={excel.uploadingExcel}
          onExcelUpload={excel.handleExcelUpload}
          onAddTechnician={() => form.openForm()}
          onDownloadTemplate={handleDownloadTemplate}
        />

        <SkillDistributionWidget stats={skillStats} loading={loading} />

        <SyncLogWidget
          lastSyncLog={lastSyncLog}
          lastFileName={excel.lastFileName}
          onRefresh={fetchData}
        />

        <DashboardFilters
          searchQuery={filters.searchQuery}
          setSearchQuery={filters.setSearchQuery}
          filterBranch={selectedBranch}
          setFilterBranch={selectBranch}
          lockedBranch={scopedBranch}
          filterMonth={filters.month}
          setFilterMonth={filters.setMonth}
          filterYear={filters.year}
          setFilterYear={filters.setYear}
          filterLevel={filters.level}
          setFilterLevel={filters.setLevel}
          filterStatus={filters.status}
          setFilterStatus={filters.setStatus}
          onResetFilters={filters.resetFilters}
          resultCount={filteredTechnicians.length}
        />

        <TechnicianTable
          loading={loading}
          technicians={filteredTechnicians}
          onToggleActive={actions.toggleActive}
          onPrint={actions.printCard}
          onRegenerateQR={actions.regenerateQr}
          onEdit={form.openForm}
          onDelete={actions.deleteTechnician}
          onSendAccess={actions.sendAccess}
          canDelete={!isBranchAdmin}
          kpiWeights={kpiWeights}
        />

        <TechnicianFormModal
          show={form.showForm}
          formId={form.formId}
          formData={form.formData}
          setFormData={form.setFormData}
          photoFile={form.photoFile}
          setPhotoFile={form.setPhotoFile}
          saving={form.saving}
          onClose={form.closeForm}
          onSave={form.handleSave}
          kpiWeights={kpiWeights}
        />
      </div>

      {/* CETAK KARTU DUA SISI */}
      <PrintCardArea printData={actions.printData} />

      {modals}
    </>
  );
}

export default function DashboardPage() {
  // Guard peran & kerangka halaman ditangani layout portal `(portal)/layout.tsx`
  return (
    <Suspense fallback={null}>
      <AdminDashboard />
    </Suspense>
  );
}
