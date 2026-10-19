import { ShieldX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="public-page">
      <header className="public-head">
        <img src="/modena-logo-official.png" alt="MODENA" />
        <span>Verifikasi teknisi resmi</span>
      </header>
      <div className="public-body">
        <div className="verdict is-invalid" role="status">
          <ShieldX size={28} />
          <div>
            <h1 className="verdict-title">Halaman tidak ditemukan</h1>
            <p className="verdict-sub">
              Alamat ini tidak ada, atau ID card yang dipindai tidak terdaftar di sistem
              verifikasi MODENA.
            </p>
          </div>
        </div>
        <div className="panel panel-pad" style={{ width: '100%' }}>
          <p style={{ lineHeight: 1.6 }}>
            Bila Anda memindai QR code dari ID card teknisi, pastikan seluruh QR code terlihat
            jelas lalu pindai ulang. Bila tetap gagal, hubungi Call Center MODENA di{' '}
            <strong>1500-715</strong>.
          </p>
        </div>
      </div>
    </main>
  );
}
