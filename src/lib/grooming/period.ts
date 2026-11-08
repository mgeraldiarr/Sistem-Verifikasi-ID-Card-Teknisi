// src/lib/grooming/period.ts

/**
 * Menghitung format minggu kerja standar ISO 8601 (YYYY-Www).
 * Contoh: "2026-W45"
 */
export function getIsoWeekString(date = new Date()): string {
  const target = new Date(date.valueOf());
  // ISO week date week starts on Monday, so correct day index (0 = Sunday -> 7)
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = new Date(firstThursday).getFullYear();
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Memeriksa apakah tanggal saat ini adalah hari Senin (WIB).
 */
export function isMondayInWib(date = new Date()): boolean {
  // Offset WIB adalah UTC+7
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + 7 * 3600000);
  return wibDate.getDay() === 1; // 1 = Senin
}

/**
 * Format timestamp lokal Indonesia (WIB) untuk stempel watermark dan tampilan.
 * Format: "DD/MM/YYYY HH:mm WIB"
 */
export function formatWibTimestamp(date = new Date()): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);

  const pad = (n: number) => String(n).padStart(2, '0');
  const d = pad(wib.getDate());
  const m = pad(wib.getMonth() + 1);
  const y = wib.getFullYear();
  const hh = pad(wib.getHours());
  const mm = pad(wib.getMinutes());

  return `${d}/${m}/${y} ${hh}:${mm} WIB`;
}

/**
 * Mendapatkan rentang tanggal Senin-Minggu dari string ISO week ("YYYY-Www").
 */
export function getWeekDateRangeLabel(isoWeek: string): string {
  const match = isoWeek.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return isoWeek;

  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);

  // Ambil tanggal 4 Januari dari tahun tersebut (selalu di minggu 1)
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = (jan4.getDay() + 6) % 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - dayOfWeek);

  const monday = new Date(mondayWeek1);
  monday.setDate(mondayWeek1.getDate() + (week - 1) * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  return `${monday.getDate()} ${months[monday.getMonth()]} - ${sunday.getDate()} ${months[sunday.getMonth()]} ${sunday.getFullYear()}`;
}
