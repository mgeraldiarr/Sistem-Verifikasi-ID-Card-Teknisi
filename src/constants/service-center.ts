// src/constants/service-center.ts

export type ServiceCenterType = 'DSC' | 'ASC' | 'SL';

export interface ServiceScopeItem {
    code: ServiceCenterType;
    label: string;
    fullName:string;
}

//konfigurasi 3 scope layanan

export const SERVICE_SCOPES:
ServiceScopeItem[] = [
    {
        code: 'DSC',
        label: 'DSC',
        fullName: 'Direct Service Center',
    },
    {
        code: 'ASC',
        label: 'ASC',
        fullName: 'Authorized Service Center',
    },
    {
        code: 'SL',
        label: 'SL',
        fullName: 'Service Local',
    },
];

export const DEFAULT_SERVICE_TYPE: ServiceCenterType = 'DSC';

/** Menormalkan nilai lingkup layanan dari database/Excel; nilai tak dikenal -> null. */
export function parseServiceType(value: unknown): ServiceCenterType | null {
    const clean = String(value ?? '').trim().toUpperCase();
    if (!clean) return null;

    const byCode = SERVICE_SCOPES.find((s) => s.code === clean);
    if (byCode) return byCode.code;

    const byName = SERVICE_SCOPES.find((s) => s.fullName.toUpperCase() === clean);
    return byName ? byName.code : null;
}

/** Lingkup layanan dari prefiks ID teknisi (DSC-/ASC-/SL-); format lama MOD- dianggap DSC. */
export function getServiceTypeFromTechnicianId(technicianId: string | null | undefined): ServiceCenterType | null {
    const match = (technicianId ?? '').trim().toUpperCase().match(/^(DSC|ASC|SL|MOD)-/);
    if (!match) return null;
    return match[1] === 'MOD' ? 'DSC' : (match[1] as ServiceCenterType);
}

/** Lingkup layanan seorang teknisi: kolom service_type, lalu prefiks ID, bawaan DSC. */
export function getTechnicianServiceType(technician: {
    service_type?: string | null;
    technician_id?: string | null;
}): ServiceCenterType {
    return (
        parseServiceType(technician.service_type) ??
        getServiceTypeFromTechnicianId(technician.technician_id) ??
        DEFAULT_SERVICE_TYPE
    );
}

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
 * Label resmi lingkup layanan untuk footer kartu digital & cetak.
 * Contoh: "DIRECT SERVICE CENTER (DSC) - BALI", "AUTHORIZED SERVICE CENTER (ASC) - MEDAN"
 */
export function getServiceCenterCardLabel(
    branch: string | null | undefined,
    serviceType?: string | null
): string {
    const code = parseServiceType(serviceType) ?? DEFAULT_SERVICE_TYPE;
    const scope = SERVICE_SCOPES.find((s) => s.code === code)!;
    const prefix = `${scope.fullName.toUpperCase()} (${scope.code})`;
    const cleanBranch = (branch ?? '').trim().toUpperCase();
    return cleanBranch ? `${prefix} - ${cleanBranch}` : prefix;
}

/**
 * Daftar pilihan Service Center untuk cabang sesuai lingkup layanannya.
 * DSC memakai daftar DSC + MSC flagship; ASC/SL cukup "[LINGKUP] [Cabang]".
 */
export function getServiceCenterOptions(branch: string, serviceType: ServiceCenterType): string[] {
    if (serviceType === 'DSC') return getDscServiceCenterOptions(branch);
    if (!branch || !branch.trim()) return [];
    return [`${serviceType} ${branch.trim().replace(/^(DSC|ASC|SL)\s+/i, '')}`];
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
