// src/app/admin/dashboard/components/PrintCardArea.tsx
'use client';

import React from 'react';
import { Image as ImageIcon, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Technician } from '@/types';

interface PrintCardAreaProps {
  printData: Technician | null;
}

const CARD_W = '53.98mm'; // Standar kartu PVC CR80
const CARD_H = '85.60mm';
const CREAM = '#ECE8DA';
const DARK = '#1C1C1A';

const Logo: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '2mm' }}>
    <img
      src="/logo-modena.png"
      alt="Modena Logo"
      style={{
        width: '8mm',
        height: '8mm',
        objectFit: 'cover',
        borderRadius: '50%',
        border: '1px solid #D6D2C2',
      }}
    />
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        transform: 'translateY(-0.5mm)',
      }}
    >
      <span
        style={{
          fontSize: '7.5pt',
          fontWeight: 800,
          lineHeight: 1.1,
          color: DARK,
        }}
      >
        MODENA
      </span>
      <span
        style={{
          fontSize: '6pt',
          fontWeight: 800,
          letterSpacing: '1px',
          lineHeight: 1.1,
          color: '#707070',
          marginTop: '0.5mm',
        }}
      >
        AUTHORIZED
      </span>
    </div>
  </div>
);

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'BEGINNER',
  intermediate: 'INTERMEDIATE',
  advance: 'ADVANCED',
};

export const PrintCardArea: React.FC<PrintCardAreaProps> = ({ printData }) => {
  if (!printData) return null;

  const levelText =
    LEVEL_LABELS[printData.technician_level] ||
    printData.technician_level.toUpperCase();

  return (
    <div className="print-area" style={{ display: 'none' }}>
      <div
        style={{
          display: 'flex',
          gap: '10mm',
          flexWrap: 'wrap',
          padding: '10mm',
        }}
      >
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
            border: '1px solid #D6D2C2',
          }}
        >
          {/* Header logo */}
          <div
            style={{
              padding: '4mm 4mm 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Logo />
            <span
              style={{
                fontSize: '5pt',
                fontWeight: 700,
                backgroundColor: 'rgba(0,0,0,0.05)',
                padding: '1mm 2mm',
                borderRadius: '1mm',
                color: DARK,
              }}
            >
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
              border: '1px solid #C5C1B1',
            }}
          >
            {printData.photo_url ? (
              <img
                src={printData.photo_url}
                alt={printData.technician_name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ImageIcon color="#A3A3A3" size={24} />
              </div>
            )}
          </div>

          {/* Nama & Status */}
          <div
            style={{
              backgroundColor: DARK,
              color: 'white',
              padding: '3mm 4mm',
            }}
          >
            <div
              style={{
                fontSize: '9.5pt',
                fontWeight: 800,
                lineHeight: 1.1,
                textTransform: 'uppercase',
                letterSpacing: '0.2px',
              }}
            >
              {printData.technician_name}
            </div>
            <div
              style={{
                fontSize: '5.5pt',
                fontWeight: 600,
                color: '#DA291C',
                marginTop: '1mm',
                letterSpacing: '0.8px',
              }}
            >
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
            border: '1px solid #D6D2C2',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Logo />
            <Shield size={16} style={{ color: '#DA291C' }} />
          </div>

          {/* QR Code */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '4mm 0',
            }}
          >
            <QRCodeSVG
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${printData.qr_token}`}
              size={100}
              style={{ width: '22mm', height: '22mm' }}
              level="M"
            />
          </div>

          {/* Detail ID */}
          <div
            style={{
              marginTop: '2mm',
              display: 'flex',
              flexDirection: 'column',
              gap: '2mm',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '5.5pt',
                  fontWeight: 800,
                  color: '#707070',
                  letterSpacing: '0.5px',
                }}
              >
                ID TEKNISI
              </div>
              <div
                style={{
                  fontSize: '7pt',
                  fontWeight: 700,
                  color: DARK,
                }}
              >
                {printData.technician_id}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '5.5pt',
                  fontWeight: 800,
                  color: '#707070',
                  letterSpacing: '0.5px',
                }}
              >
                CABANG / WILAYAH
              </div>
              <div
                style={{
                  fontSize: '7pt',
                  fontWeight: 700,
                  color: DARK,
                }}
              >
                {printData.branch}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '5.5pt',
                  fontWeight: 800,
                  color: '#707070',
                  letterSpacing: '0.5px',
                }}
              >
                KONTAK LAYANAN
              </div>
              <div
                style={{
                  fontSize: '6.5pt',
                  fontWeight: 600,
                  color: '#4A4A4A',
                  lineHeight: '1.2',
                  marginTop: '0.5mm',
                }}
              >
                PT MODENA INDONESIA
                <br />
                Call Center: 1500715
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
