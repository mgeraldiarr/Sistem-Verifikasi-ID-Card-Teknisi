// src/app/admin/(portal)/dashboard/components/technician-table/TechnicianTableRow.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { DEFAULT_KPI_WEIGHTS, KpiWeights } from '@/lib/kpi';
import { Technician, TechnicianLevel, TechnicianStatus } from '@/types';
import { KpiQuickPeek } from './KpiQuickPeek';
import { TechnicianActionHandlers, TechnicianRowActions } from './TechnicianRowActions';
import styles from './TechnicianTable.module.css';

export interface TechnicianTableRowProps extends TechnicianActionHandlers {
  tech: Technician;
  onToggleActive: (id: string, status: TechnicianStatus) => void;
  /** Admin Cabang tidak memiliki hak hapus data teknisi */
  canDelete?: boolean;
  /** Bobot KPI aktif untuk label indikator */
  kpiWeights?: KpiWeights;
}

const LEVEL_LABEL: Record<TechnicianLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advance: 'Advance',
};

export const TechnicianTableRow: React.FC<TechnicianTableRowProps> = ({
  tech,
  onToggleActive,
  canDelete = true,
  kpiWeights = DEFAULT_KPI_WEIGHTS,
  ...actions
}) => {
  const [showPeek, setShowPeek] = useState(false);
  const card = tech.technician_id_cards?.[0];
  const perf = tech.technician_performance?.[0];
  const level = LEVEL_LABEL[tech.technician_level] ? tech.technician_level : 'beginner';
  const isActive = tech.technician_status === 'active';

  return (
    <tr>
      {/* PROFIL */}
      <td className="cell-primary">
        <div className={styles.person}>
          <div className={styles.photo}>
            {tech.photo_url ? <img src={tech.photo_url} alt="" /> : <User size={18} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className={styles.name}>{tech.technician_name}</div>
            <div className="cell-sub tnum">{tech.technician_id}</div>
          </div>
        </div>
      </td>

      {/* CABANG */}
      <td data-label="Cabang">
        <div className="cell-strong">{tech.branch}</div>
        <div className="cell-sub">{tech.service_center || '-'}</div>
      </td>

      {/* PERFORMA + popover 6 indikator */}
      <td
        data-label="Skor KPI"
        className={styles.kpiCell}
        onMouseEnter={() => setShowPeek(true)}
        onMouseLeave={() => setShowPeek(false)}
      >
        {perf ? (
          <>
            <button
              type="button"
              className={styles.kpiButton}
              onClick={() => setShowPeek((prev) => !prev)}
              aria-expanded={showPeek}
              aria-label={`Rincian KPI ${tech.technician_name}`}
            >
              <span className={styles.kpiScore}>{perf.kpi_score ?? perf.performance_score}%</span>
              <ChevronDown size={14} className={styles.kpiChevron} />
            </button>
            <div className={`level level-${level}`}>{LEVEL_LABEL[level]}</div>
            {showPeek && <KpiQuickPeek perf={perf} kpiWeights={kpiWeights} />}
          </>
        ) : (
          <span className="text-3 text-sm">Belum dinilai</span>
        )}
      </td>

      {/* KARTU ID */}
      <td data-label="ID card">
        {card ? (
          <>
            <div className="cell-strong tnum">{card.card_number}</div>
            <div className="cell-sub">Berlaku s.d. {card.expiry_date}</div>
          </>
        ) : (
          <span className="text-3 text-sm">Belum terbit</span>
        )}
      </td>

      {/* STATUS AKTIF */}
      <td data-label="Status">
        <button
          type="button"
          onClick={() => onToggleActive(tech.id, tech.technician_status)}
          className={`status-toggle ${isActive ? 'is-on' : 'is-off'}`}
          title={isActive ? 'Klik untuk menonaktifkan' : 'Klik untuk mengaktifkan'}
        >
          {isActive ? 'Aktif' : 'Nonaktif'}
        </button>
      </td>

      {/* AKSI */}
      <td className="col-actions">
        <TechnicianRowActions tech={tech} canDelete={canDelete} {...actions} />
      </td>
    </tr>
  );
};
