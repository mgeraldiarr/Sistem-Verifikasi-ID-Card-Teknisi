// src/constants/service-center.ts

export type ServiceCenterType = 'DSC' | 'ASC' | 'SL';

export interface ServiceScopeItem {
    code: ServiceCenterType;
    label: string;
    fullName:string;
    isActive: boolean;
    badge?: string;
}

//konfigurasi 3 scope layanan

export const SERVICE_SCOPES:
ServiceScopeItem[] = [
    {
        code: 'DSC',
        label: 'DSC',
        fullName: 'Direct Service Center',
        isActive: true,
    },
    {
        code: 'ASC',
        label: 'ASC',
        fullName: 'Authorized Service Center',
        isActive: false,
        badge: 'Coming Soon',
    },
    {
        code: 'SL',
        label: 'SL',
        fullName: 'Service Local',
        isActive: false,
        badge: 'Coming Soon',
    },
];

// Daftar Cabang Resmi DSC MODENA (bawaan bila tabel branches belum dimigrasi)

export const DSC_BRANCHES = [
    'Makassar',
  'Bandung',
  'MSC KBP Bandung',
  'Banjarmasin',
  'Medan',
  'MSC Suryo',
  'Surabaya',
  'Jakarta 1',
  'Jakarta 2',
  'Jakarta 3',
  'Jakarta 4',
  'Purwokerto',
  'Semarang',
  'Manado',
  'Kediri',
  'Solo',
  'Malang',
  'MSC Surabaya Mayjend Sungkono',
  'Samarinda',
  'Bali',
  'Pekanbaru',
  'Batam',
  'Palembang',
  'MSC Surabaya GWalk',
  'Yogyakarta',
  'MSC Kemang',
  'MSC Greenlake',
  'Aceh',
  'MSC Bogor',
  'Lampung',
  'Pontianak',
  'Balikpapan',
] as const;


/**
 * Label resmi service center untuk footer kartu digital & cetak.
 * Contoh: "DIRECT SERVICE CENTER (DSC) - BALI"
 */
export function getServiceCenterCardLabel(branch: string | null | undefined): string {
    const scope = SERVICE_SCOPES.find((s) => s.code === 'DSC');
    const prefix = `${(scope?.fullName ?? 'Direct Service Center').toUpperCase()} (DSC)`;
    const cleanBranch = (branch ?? '').trim().toUpperCase();
    return cleanBranch ? `${prefix} - ${cleanBranch}` : prefix;
}

/**
 * Daftar pilihan Service Center untuk sebuah cabang DSC.
 * Opsi utama "DSC [Cabang]", ditambah MSC flagship di kota yang sama.
 */
export function getDscServiceCenterOptions(branch: string): string[] {
    if (!branch || !branch.trim()) return [];
    const clean = branch.trim();

    const stripped = clean.replace(/^(DSC|MSC)\s+/i, '');
    const options = [`DSC ${stripped}`];

    const lower = clean.toLowerCase();
    if (lower.includes('bandung')) options.push('MSC KBP Bandung');
    if (lower.includes('surabaya')) options.push('MSC Surabaya Mayjend Sungkono', 'MSC Surabaya GWalk');
    if (lower.includes('jakarta')) options.push('MSC Suryo', 'MSC Kemang', 'MSC Greenlake');
    if (lower.includes('bogor')) options.push('MSC Bogor');
    if (clean.startsWith('MSC ') && !options.includes(clean)) options.unshift(clean);

    return Array.from(new Set(options));
}
