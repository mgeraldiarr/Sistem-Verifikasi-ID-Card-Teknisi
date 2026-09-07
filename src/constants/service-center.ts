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

// Daftar 31 Cabang Resmi DSC MODENA

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
] as const;

