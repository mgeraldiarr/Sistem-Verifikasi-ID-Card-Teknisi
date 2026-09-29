// src/constants/branch-codes.ts

/**
 * 1. KAMUS PEMETAAN KODE CABANG (DICTIONARY)
 * Memetakan seluruh cabang resmi DSC MODENA ke kode 3-4 karakter.
 */
export const BRANCH_CODE_MAP: Record<string, string> = {
    // 32 Cabang Resmi DSC MODENA
    'Bali': 'BAL',
    'Makassar': 'MKS',
    'Balikpapan': 'BPN',
    'Bandung': 'BDG',
    'MSC KBP Bandung': 'KBP',
    'Banjarmasin': 'BJM',
    'Medan': 'MDN',
    'MSC Suryo': 'SRY',
    'Surabaya': 'SBY',
    'Jakarta 1': 'JKT1',
    'Jakarta 2': 'JKT2',
    'Jakarta 3': 'JKT3',
    'Jakarta 4': 'JKT4',
    'Purwokerto': 'PWT',
    'Semarang': 'SMG',
    'Manado': 'MND',
    'Kediri': 'KDR',
    'Solo': 'SLO',
    'Malang': 'MLG',
    'MSC Surabaya Mayjend Sungkono': 'MSY',
    'Samarinda': 'SMD',
    'Pekanbaru': 'PKU',
    'Batam': 'BTM',
    'Palembang': 'PLM',
    'MSC Surabaya GWalk': 'GWL',
    'Yogyakarta': 'YOG',
    'MSC Kemang': 'KMG',
    'MSC Greenlake': 'GLK',
    'Aceh': 'ACH',
    'MSC Bogor': 'BGR',
    'Lampung': 'LPG',
    'Pontianak': 'PTK',

    // Alias / Kota Tambahan yang Sering Diketik
    'Denpasar': 'BAL',
    'Jakarta': 'JKT',
    'Jogja': 'YOG',
    'Bogor': 'BGR',
};

/**
 * 2. FUNGSI PEMBANTU: getBranchCode
 * Mencari kode cabang dengan toleransi huruf besar/kecil & typo ringan.
 */
export function getBranchCode(branchName: string): string {
    if (!branchName || !branchName.trim()) return 'MOD';

    const clean = branchName.trim();
    const lower = clean.toLowerCase();

    // A. Pencocokan langsung (Case-Insensitive)
    for (const [name, code] of Object.entries(BRANCH_CODE_MAP)) {
        if (name.toLowerCase() === lower) {
            return code;
        }
    }

    // B. Toleransi typo atau pengetikan sebagian (misal: "balikpad" -> "BPN", "makkas" -> "MKS")
    if (lower.includes('balikp')) return 'BPN';
    if (lower.includes('makas') || lower.includes('makkas')) return 'MKS';
    if (lower.includes('bali')) return 'BAL';
    if (lower.includes('band')) return 'BDG';
    if (lower.includes('surab')) return 'SBY';
    if (lower.includes('jog') || lower.includes('yog')) return 'YOG';

    // C. Fallback: jika cabang baru/kustom diinput, ambil 3 karakter alfanumerik pertama
    const alphanumericOnly = clean.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return alphanumericOnly.slice(0, 3) || 'MOD';
}

/**
 * 3. FUNGSI GENERATOR ID TEKNISI
 * Format standar MODENA: MOD-[KODE]-[4 DIGIT ANGKA] (contoh: MOD-BAL-5688)
 */
export function generateTechnicianId(branchName: string, suffix?: string): string {
    const code = getBranchCode(branchName);
    const digits = suffix || Math.floor(1000 + Math.random() * 9000).toString();
    return `MOD-${code}-${digits}`;
}

/**
 * 4. FUNGSI GENERATOR NOMOR KARTU
 * Format standar kartu fisik: CARD-[KODE]-[4 DIGIT ANGKA] (contoh: CARD-BAL-5688)
 */
export function generateCardNumber(technicianId: string): string {
    if (!technicianId) return '';
    return `CARD-${technicianId.replace(/^(?:MOD|DSC|ASC|SL)-/, '')}`;
}

/**
 * 5. FUNGSI ALGORITMA: getNextSequenceNumber
 * Mengambil nomor urut tertinggi yang ada lalu menambah 1 (Max + 1).
 * Nomor milik teknisi yang sudah dihapus TIDAK dipakai ulang, agar kartu fisik lama
 * tidak pernah tertukar identitasnya dengan teknisi baru.
 * - Jika cabang baru -> menghasilkan '001'.
 * - Jika ada nomor [1, 3] -> menghasilkan '004'.
 */
export function getNextSequenceNumber(existingIds: string[], code: string): string {
    let highest = 0;
    const pattern = new RegExp(`^(?:DSC|MOD|ASC|SL)-${code}-(\\d+)$`, 'i');

    for (const id of existingIds) {
        if (!id) continue;
        // Deteksi pola akhiran angka: misal DSC-BAL-001, MOD-BAL-001, dsb.
        const match = id.trim().match(pattern);
        if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > highest) {
                highest = num;
            }
        }
    }

    return String(highest + 1).padStart(3, '0');
}

/**
 * 6. FUNGSI GENERATOR ID TEKNISI TERURUT (SEQUENTIAL)
 * Format resmi: DSC-[KODE]-[3 DIGIT URUT] (contoh: DSC-BAL-001, DSC-MKS-001)
 */
export function generateSequentialTechnicianId(
    branchName: string,
    existingIds: string[],
    prefix: 'DSC' | 'ASC' | 'SL' = 'DSC'
): string {
    const code = getBranchCode(branchName);
    const seq = getNextSequenceNumber(existingIds, code);
    return `${prefix}-${code}-${seq}`;
}


/**
 * 7. FUNGSI GENERATOR ID ADMIN CABANG (LOGIN ID)
 * Format resmi: ADM-[KODE]-[2 DIGIT URUT] (contoh: ADM-BAL-01)
 * Memakai nomor tertinggi + 1 agar ID admin yang sudah dihapus tidak dipakai ulang.
 */
export function generateAdminId(branchName: string, existingAdminIds: string[]): string {
    const code = getBranchCode(branchName);
    const pattern = new RegExp(`^ADM-${code}-(\d+)$`, 'i');

    let highest = 0;
    for (const id of existingAdminIds) {
        const match = id?.trim().match(pattern);
        if (match) highest = Math.max(highest, parseInt(match[1], 10) || 0);
    }

    return `ADM-${code}-${String(highest + 1).padStart(2, '0')}`;
}
