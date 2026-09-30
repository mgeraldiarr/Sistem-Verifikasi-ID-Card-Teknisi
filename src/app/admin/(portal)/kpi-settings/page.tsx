// src/app/admin/(portal)/kpi-settings/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { NotificationModal } from '@/components/ui/NotificationModal';
import { useKpiWeights } from '@/hooks/useKpiWeights';
import { DEFAULT_KPI_WEIGHTS, KpiWeights, validateKpiWeights } from '@/lib/kpi';
import { NotificationState, NotificationType } from '@/types';
import { SuperAdminOnly } from '../portal-context';
import styles from './kpi-settings.module.css';

const INDICATORS: { key: keyof KpiWeights; label: string; hint: string }[] = [
  { key: 'tat', label: 'TAT', hint: 'Turn around time, kecepatan penyelesaian servis' },
  { key: 'rtat', label: 'RTAT', hint: 'Repeat TAT, servis ulang untuk kasus yang sama' },
  { key: 'csat', label: 'CSAT', hint: 'Kepuasan pelanggan' },
  { key: 'grooming', label: 'Penampilan', hint: 'Kerapian & seragam (grooming)' },
  { key: 'service', label: 'Pelayanan', hint: 'Sikap & komunikasi dengan pelanggan' },
  { key: 'repair_quality', label: 'Hasil perbaikan', hint: 'Kualitas hasil pekerjaan' },
];

const LEVEL_RULES: { level: 'beginner' | 'intermediate' | 'advance'; label: string; range: string }[] = [
  { level: 'beginner', label: 'Beginner', range: 'di bawah 70' },
  { level: 'intermediate', label: 'Intermediate', range: '70–84' },
  { level: 'advance', label: 'Advance', range: '85 ke atas' },
];

function sameWeights(a: KpiWeights, b: KpiWeights) {
  return INDICATORS.every(({ key }) => Number(a[key]) === Number(b[key]));
}

function KpiSettingsContent() {
  const { weights, loading, usingFallback, save } = useKpiWeights();
  const [draft, setDraft] = useState<KpiWeights>(weights);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    title: '',
    message: '',
  });

  const notify = (type: NotificationType, title: string, message: string) =>
    setNotification({ show: true, type, title, message });

  // Isi ulang draf setiap kali bobot tersimpan berubah (selesai memuat / sesudah simpan)
  useEffect(() => {
    setDraft(weights);
  }, [weights]);

  const validation = useMemo(() => validateKpiWeights(draft), [draft]);
  const isDirty = !sameWeights(draft, weights);
  const isDefault = sameWeights(draft, DEFAULT_KPI_WEIGHTS);
  const remaining = Math.round((100 - validation.total) * 100) / 100;

  const handleChange = (key: keyof KpiWeights, raw: string) => {
    const num = raw === '' ? 0 : Number(raw);
    if (isNaN(num)) return;
    setDraft((prev) => ({ ...prev, [key]: Math.min(100, Math.max(0, num)) }));
  };

  const handleSave = async () => {
    if (!validation.isValid) return;
    setSaving(true);
    const error = await save(draft);
    setSaving(false);

    if (error) {
      notify(
        'error',
        'Gagal Menyimpan Bobot',
        `${error}\n\nPastikan migrasi 20260923_add_admin_id_and_kpi_settings sudah dijalankan.`
      );
      return;
    }

    notify(
      'success',
      'Bobot KPI Tersimpan',
      'Bobot baru berlaku untuk input & upload berikutnya. Skor teknisi yang sudah tersimpan tidak dihitung ulang otomatis.'
    );
  };

  const cannotSave = loading || saving || !isDirty || !validation.isValid;

  return (
    <>
      <PageHeading
        title="Bobot KPI"
        subtitle="Persentase tiap indikator dalam skor KPI teknisi. Jumlah keenam bobot harus tepat 100%."
      />

      {usingFallback && !loading && (
        <div className="alert alert-warn" style={{ marginBottom: '16px' }}>
          <AlertTriangle size={16} />
          <span>
            Pengaturan bobot belum ada di database, jadi sistem memakai bobot bawaan. Menyimpan di
            halaman ini akan membuat pengaturannya.
          </span>
        </div>
      )}

      <div className={styles.layout}>
        <div className="panel">
          {loading ? (
            <div className="table-loading" aria-label="Memuat bobot">
              <Loader2 size={24} className="spin" />
            </div>
          ) : (
            <>
              {INDICATORS.map(({ key, label, hint }) => {
                const changed = Number(draft[key]) !== Number(weights[key]);
                return (
                  <div key={key} className={styles.row}>
                    <div style={{ minWidth: 0 }}>
                      <label htmlFor={`kpi-weight-${key}`} className="label">
                        {label}
                        {changed && <span className="label-aside">semula {weights[key]}%</span>}
                      </label>
                      <p className="hint">{hint}</p>
                    </div>

                    <div className={`input-wrap ${styles.weight}`}>
                      <input
                        id={`kpi-weight-${key}`}
                        name={`kpi_weight_${key}`}
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        inputMode="decimal"
                        className="input tnum"
                        value={draft[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        disabled={saving}
                        style={changed ? { borderColor: 'var(--ink)' } : undefined}
                      />
                      <span className="input-suffix">%</span>
                    </div>
                  </div>
                );
              })}

              <div className={styles.total} aria-live="polite">
                <div className={styles.totalHead}>
                  <span>
                    Total
                    <span className={validation.isValid ? styles.ok : styles.off}>
                      {validation.isValid
                        ? 'pas 100%'
                        : remaining > 0
                          ? `kurang ${remaining}%`
                          : `lebih ${Math.abs(remaining)}%`}
                    </span>
                  </span>
                  <strong className={validation.isValid ? undefined : styles.offValue}>
                    {validation.total}%
                  </strong>
                </div>
                <div className={styles.meter}>
                  <span
                    className={validation.isValid ? styles.meterOk : styles.meterOff}
                    style={{ width: `${Math.min(100, validation.total)}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.side}>
          <div className="panel panel-pad">
            <h2 className={styles.sideTitle}>Cara level ditentukan</h2>
            <dl className={styles.rules}>
              {LEVEL_RULES.map((rule) => (
                <div key={rule.level}>
                  <dt className={`level level-${rule.level}`}>{rule.label}</dt>
                  <dd className="tnum">skor {rule.range}</dd>
                </div>
              ))}
            </dl>
            <p className="hint" style={{ marginTop: '12px' }}>
              Skor KPI adalah jumlah skor tiap indikator dikali bobotnya. Mengubah bobot tidak
              menghitung ulang skor teknisi yang sudah tersimpan.
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleSave}
              disabled={cannotSave}
              className="btn btn-primary"
            >
              {saving && <Loader2 size={16} className="spin" />}
              Simpan bobot
            </button>
            <button
              type="button"
              onClick={() => setDraft(DEFAULT_KPI_WEIGHTS)}
              disabled={loading || saving || isDefault}
              className="btn btn-secondary"
            >
              <RotateCcw size={15} />
              Pakai bobot bawaan
            </button>
          </div>
        </div>
      </div>

      <NotificationModal
        notification={notification}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
      />
    </>
  );
}

export default function KpiSettingsPage() {
  return (
    <SuperAdminOnly>
      <KpiSettingsContent />
    </SuperAdminOnly>
  );
}
