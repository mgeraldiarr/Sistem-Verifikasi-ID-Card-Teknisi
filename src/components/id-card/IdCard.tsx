// src/components/id-card/IdCard.tsx
import React from 'react';
import { QrCode, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getServiceCenterCardLabel } from '@/constants/service-center';
import styles from './IdCard.module.css';

/**
 * Desain tunggal ID card teknisi, dipakai kartu digital (layar) dan kartu cetak CR80.
 *
 * Seluruh ukuran memakai `em` pada kanvas 32em x 50.75em (rasio CR80 53.98 : 85.6),
 * jadi pemanggil cukup mengatur `font-size` pembungkus:
 * - layar: 10px  -> 320 x 507.5px
 * - cetak: calc(53.98mm / 32) -> tepat 53.98 x 85.6mm
 */

export interface IdCardData {
  technician_id: string;
  technician_name: string;
  branch: string;
  photo_url: string | null;
}

interface FaceProps {
  technician: IdCardData;
  /** 'print' menghilangkan sudut membulat & bayangan (dipotong printer kartu) */
  variant?: 'screen' | 'print';
}

const cardClass = (side: string, variant: FaceProps['variant']) =>
  [styles.card, side, variant === 'print' ? styles.print : ''].join(' ');

const ServiceBand: React.FC<{ branch: string }> = ({ branch }) => (
  <div className={styles.band}>{getServiceCenterCardLabel(branch)}</div>
);

export const IdCardFront: React.FC<FaceProps & { levelText: string }> = ({
  technician,
  levelText,
  variant = 'screen',
}) => (
  <div className={cardClass(styles.front, variant)}>
    <div className={styles.head}>
      <img src="/modena-logo-official.png" alt="MODENA" className={styles.logo} />
      <span className={styles.level}>{levelText}</span>
    </div>

    <div className={styles.photo}>
      {technician.photo_url ? (
        <img src={technician.photo_url} alt={technician.technician_name} />
      ) : (
        <span className={styles.noPhoto}>
          <User size="3.2em" strokeWidth={1.5} />
        </span>
      )}
    </div>

    <div className={styles.identity}>
      <div className={styles.name}>{technician.technician_name}</div>
      <div className={styles.role}>Authorized Technician</div>

      <dl className={styles.meta}>
        <div>
          <dt>ID teknisi</dt>
          <dd>{technician.technician_id}</dd>
        </div>
        <div>
          <dt>Cabang</dt>
          <dd>{technician.branch}</dd>
        </div>
      </dl>
    </div>

    <ServiceBand branch={technician.branch} />
  </div>
);

export const IdCardBack: React.FC<
  FaceProps & {
    /** URL verifikasi yang dikodekan ke QR; tanpa URL tampil ikon pengganti */
    verifyUrl?: string;
    formattedExpiryDate: string;
    /** Tandai tanggal berlaku dengan warna peringatan (kartu tidak sah) */
    expiryAlert?: boolean;
  }
> = ({ technician, verifyUrl, formattedExpiryDate, expiryAlert = false, variant = 'screen' }) => (
  <div className={cardClass(styles.back, variant)}>
    <div className={styles.head}>
      <img src="/modena-logo-white.png" alt="MODENA" className={styles.logo} />
      <span className={styles.backTitle}>Kartu identitas teknisi</span>
    </div>

    <div className={styles.qr}>
      {verifyUrl ? (
        <QRCodeSVG value={verifyUrl} level="M" style={{ width: '100%', height: '100%' }} />
      ) : (
        <QrCode size="100%" strokeWidth={1} color="#1c1c1a" />
      )}
    </div>
    <p className={styles.qrCaption}>Pindai untuk memeriksa status teknisi</p>

    <dl className={styles.backData}>
      <div>
        <dt>ID teknisi</dt>
        <dd>{technician.technician_id}</dd>
      </div>
      <div>
        <dt>Cabang</dt>
        <dd>{technician.branch}</dd>
      </div>
      <div>
        <dt>Berlaku sampai</dt>
        <dd className={expiryAlert ? styles.alert : undefined}>{formattedExpiryDate}</dd>
      </div>
    </dl>

    <div className={styles.fine}>
      <p>
        Milik PT MODENA Indonesia. Bila ditemukan, kembalikan ke cabang MODENA terdekat.
      </p>
      <p className={styles.callCenter}>
        Call center
        <strong>1500-715</strong>
      </p>
    </div>

    <ServiceBand branch={technician.branch} />
  </div>
);
