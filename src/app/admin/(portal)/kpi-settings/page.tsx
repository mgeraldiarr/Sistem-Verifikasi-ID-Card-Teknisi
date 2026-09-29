// src/app/admin/(portal)/kpi-settings/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Info, Loader2, RotateCcw, Save, SlidersHorizontal } from 'lucide-react';
import { PageHeading } from '@/components/PageHeading';
import { NotificationModal } from '@/components/ui/NotificationModal';
import { useKpiWeights } from '@/hooks/useKpiWeights';
import { DEFAULT_KPI_WEIGHTS, KpiWeights, validateKpiWeights } from '@/lib/kpi';
import { NotificationState, NotificationType } from '@/types';
import { SuperAdminOnly } from '../portal-context';

const INDICATORS: { key: keyof KpiWeights; label: string; hint: string }[] = [
  { key: 'tat', label: 'TAT', hint: 'Turn Around Time — kecepatan penyelesaian servis' },
  { key: 'rtat', label: 'RTAT', hint: 'Repeat TAT — servis ulang untuk kasus yang sama' },
  { key: 'csat', label: 'CSAT', hint: 'Kepuasan pelanggan' },
  { key: 'grooming', label: 'Penampilan', hint: 'Kerapian & seragam (grooming)' },
  { key: 'service', label: 'Pelayanan', hint: 'Sikap & komunikasi dengan pelanggan' },
  { key: 'repair_quality', label: 'Hasil Perbaikan', hint: 'Kualitas hasil pekerjaan' },
];

const LEVEL_RULES = [
  { label: 'Beginner', range: '< 70', color: '#6B7280' },
  { label: 'Intermediate', range: '70 – 84', color: '#2563EB' },
  { label: 'Advance', range: '≥ 85', color: '#16A34A' },
];

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: 'var(--text-primary)',
};

const inputStyle: React.CSSProperties = {
  width: '88px',
  padding: '0.55rem 1.6rem 0.55rem 0.7rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  fontSize: '0.9rem',
  fontWeight: 700,
  textAlign: 'right',
  outline: 'none',
  fontFamily: 'inherit',
};

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

  const totalColor = validation.isValid ? '#16A34A' : 'var(--accent-red)';

  return (
    <>
      <PageHeading
        title="Bobot KPI"
        subtitle="Atur persentase 6 indikator evaluasi teknisi. Total wajib 100%."
        icon={<SlidersHorizontal size={19} />}
      />

      {usingFallback && !loading && (
        <div
          className="modena-card"
          style={{
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'flex-start',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            border: '1px solid #FCD34D',
            backgroundColor: '#FFFBEB',
            fontSize: '0.8rem',
            lineHeight: 1.55,
            color: '#92400E',
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            Pengaturan bobot belum ditemukan di database, sehingga sistem memakai bobot bawaan.
            Menyimpan di halaman ini akan membuat pengaturannya.
          </span>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* DAFTAR INDIKATOR */}
        <div className="modena-card" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '3.5rem', display: 'flex', justifyContent: 'center' }}>
              <Loader2 size={32} color="var(--bg-dark)" className="animate-spin-custom" />
            </div>
          ) : (
            <>
              {INDICATORS.map(({ key, label, hint }) => {
                const changed = Number(draft[key]) !== Number(weights[key]);
                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '0.9rem 1.1rem',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <label htmlFor={`kpi-weight-${key}`} style={labelStyle}>
                        {label}
                        {changed && (
                          <span
                            style={{
                              marginLeft: '0.45rem',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              color: 'var(--text-muted)',
                            }}
                          >
                            (sebelumnya {weights[key]}%)
                          </span>
                        )}
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {hint}
                      </span>
                    </div>

                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <input
                        id={`kpi-weight-${key}`}
                        name={`kpi_weight_${key}`}
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        inputMode="decimal"
                        value={draft[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        disabled={saving}
                        style={{
                          ...inputStyle,
                          borderColor: changed ? 'var(--bg-dark)' : 'var(--border-color)',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          right: '0.6rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          pointerEvents: 'none',
                        }}
                      >
                        %
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* TOTAL */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '1rem 1.1rem',
                  backgroundColor: '#F9FAFB',
                  borderBottomLeftRadius: 'inherit',
                  borderBottomRightRadius: 'inherit',
                }}
              >
                <div>
                  <span style={{ ...labelStyle, fontSize: '0.85rem' }}>Total</span>
                  <span style={{ fontSize: '0.75rem', color: totalColor, fontWeight: 600 }}>
                    {validation.isValid
                      ? 'Sudah tepat 100%'
                      : remaining > 0
                        ? `Kurang ${remaining}%`
                        : `Lebih ${Math.abs(remaining)}%`}
                  </span>
                </div>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: totalColor }}>
                  {validation.total}%
                </span>
              </div>
            </>
          )}
        </div>

        {/* PANEL SAMPING: ATURAN LEVEL & AKSI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="modena-card" style={{ padding: '1rem 1.1rem' }}>
            <span style={{ ...labelStyle, marginBottom: '0.6rem' }}>
              Penentuan Level Otomatis
            </span>
            {LEVEL_RULES.map((rule) => (
              <div
                key={rule.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0',
                  fontSize: '0.82rem',
                }}
              >
                <span style={{ fontWeight: 700, color: rule.color }}>{rule.label}</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Skor {rule.range}
                </span>
              </div>
            ))}
            <p
              style={{
                display: 'flex',
                gap: '0.45rem',
                margin: '0.6rem 0 0',
                fontSize: '0.75rem',
                lineHeight: 1.55,
                color: 'var(--text-secondary)',
              }}
            >
              <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              Skor terbobot = Σ (skor indikator × bobot). Perubahan bobot tidak menghitung
              ulang skor teknisi yang sudah tersimpan.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || saving || !isDirty || !validation.isValid}
              className="modena-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                opacity: loading || saving || !isDirty || !validation.isValid ? 0.55 : 1,
                cursor:
                  loading || saving || !isDirty || !validation.isValid ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? <Loader2 size={16} className="animate-spin-custom" /> : <Save size={16} />}
              Simpan Bobot
            </button>

            <button
              type="button"
              onClick={() => setDraft(DEFAULT_KPI_WEIGHTS)}
              disabled={loading || saving || isDefault}
              className="modena-btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                opacity: loading || saving || isDefault ? 0.55 : 1,
              }}
            >
              <RotateCcw size={15} /> Kembalikan Bawaan
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
