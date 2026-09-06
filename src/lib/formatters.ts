// src/lib/formatters.ts

/**
 * Format waktu ISO/string ke format lokal Indonesia (Asia/Jakarta, WIB)
 */
export const formatTimeWIB = (timeString: string): string => {
  if (!timeString) return '-';
  try {
    return (
      new Date(timeString).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'medium',
        timeStyle: 'short',
      }) + ' WIB'
    );
  } catch {
    return timeString;
  }
};
