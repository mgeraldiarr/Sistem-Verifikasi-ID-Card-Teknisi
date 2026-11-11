// src/lib/grooming/canvas-watermark.ts
import { formatWibTimestamp } from './period';

export type PhotoTypeLabel = 'BADAN PENUH' | 'WAJAH CLOSE-UP';

export interface WatermarkMeta {
  technicianName: string;
  technicianId: string;
  branch: string;
  photoType: PhotoTypeLabel;
  customTimestamp?: string;
}

export interface ProcessedPhotoResult {
  file: File;
  previewUrl: string;
  sizeBytes: number;
  width: number;
  height: number;
}

const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.82;

/**
 * Membaca File gambar menjadi elemen HTMLImageElement
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal memproses gambar. Format mungkin rusak.'));
    };
    img.src = url;
  });
}

/**
 * Melakukan kompresi client-side (maks 1280px) dan menyematkan stempel watermark digital
 * resmi MODENA After Sales pada bagian bawah foto.
 */
export async function processAndWatermarkPhoto(
  sourceFile: File,
  meta: WatermarkMeta
): Promise<ProcessedPhotoResult> {
  const img = await loadImage(sourceFile);

  // 1. Hitung resolusi gambar proporsional (maks 1280px pada sisi terpanjang)
  let { width, height } = img;
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }
  }

  // 2. Buat Canvas dan gambar foto asli
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context tidak tersedia pada browser ini.');

  // Render gambar
  ctx.drawImage(img, 0, 0, width, height);

  // 3. Render Watermark Stamp Ribbon di bagian bawah
  const ribbonHeight = Math.max(90, Math.round(height * 0.12));
  const ribbonY = height - ribbonHeight;

  // Background ribbon gradient gelap bertekstur
  const gradient = ctx.createLinearGradient(0, ribbonY, 0, height);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0.88)');
  gradient.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, ribbonY, width, ribbonHeight);

  // Garis aksen atas MODENA merah/gold
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, ribbonY, width, Math.max(3, Math.round(width * 0.003)));

  // Setup font sizing dinamis berdasarkan lebar foto
  const baseFontSize = Math.max(12, Math.round(width * 0.018));
  const paddingX = Math.max(16, Math.round(width * 0.025));

  // Teks Baris 1: Header Brand
  ctx.font = `bold ${Math.round(baseFontSize * 0.85)}px sans-serif`;
  ctx.fillStyle = '#94a3b8'; // Abu-abu terang
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const headerY = ribbonY + Math.round(ribbonHeight * 0.14);
  ctx.fillText('MODENA AFTER SALES • GROOMING AUDIT SOP', paddingX, headerY);

  // Teks Baris 2: Nama & ID Teknisi
  ctx.font = `bold ${Math.round(baseFontSize * 1.15)}px sans-serif`;
  ctx.fillStyle = '#ffffff';
  const nameY = headerY + Math.round(baseFontSize * 1.15);
  ctx.fillText(`${meta.technicianName} (${meta.technicianId})`, paddingX, nameY);

  // Teks Baris 3: Service Center & Waktu WIB
  const timestamp = meta.customTimestamp || formatWibTimestamp(new Date());
  ctx.font = `500 ${baseFontSize}px sans-serif`;
  ctx.fillStyle = '#cbd5e1';
  const metaY = nameY + Math.round(baseFontSize * 1.35);
  ctx.fillText(`SC: ${meta.branch} • Waktu: ${timestamp}`, paddingX, metaY);

  // Badge Tipe Foto di sisi kanan
  const badgeText = meta.photoType;
  ctx.font = `bold ${Math.round(baseFontSize * 0.95)}px sans-serif`;
  const badgeWidth = ctx.measureText(badgeText).width + paddingX * 1.2;
  const badgeHeight = Math.round(baseFontSize * 1.9);
  const badgeX = width - paddingX - badgeWidth;
  const badgeY = ribbonY + Math.round((ribbonHeight - badgeHeight) / 2);

  // Kotak badge
  ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const radius = 6;
  ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, radius) : ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
  ctx.fill();
  ctx.stroke();

  // Teks badge
  ctx.fillStyle = '#f87171';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);

  // 4. Konversi ke Blob JPEG
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal mengompresi gambar hasil watermark.'));
          return;
        }

        const cleanType = meta.photoType === 'BADAN PENUH' ? 'full' : 'face';
        const fileName = `grooming-${cleanType}-${meta.technicianId}-${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);

        resolve({
          file,
          previewUrl,
          sizeBytes: blob.size,
          width,
          height,
        });
      },
      'image/jpeg',
      JPEG_QUALITY
    );
  });
}
