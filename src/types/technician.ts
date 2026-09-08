// src/types/technician.ts

export type TechnicianStatus = 'active' | 'inactive';

export type TechnicianLevel = 'beginner' | 'intermediate' | 'advance';

export type CardStatus = 'active' | 'suspended' | 'expired';

export interface TechnicianPerformance {
  period: string;
  kpi_score: number;
  csi_score: number;
  performance_score: number;
  performance_level: string;
  tat?: number;
  rtat?: number;
  csat?: number;
  grooming_score?: number;
  service_score?: number;
  repair_quality_score?: number;
}

export interface TechnicianIdCard {
  card_number: string;
  card_status: CardStatus;
  expiry_date: string;
  qr_token?: string;
}

export interface Technician {
  id: string;
  technician_id: string; // e.g. MOD-T001
  employee_number: string;
  technician_name: string;
  branch: string;
  service_center: string | null;
  photo_url: string | null;
  phone: string | null;
  email: string | null;
  technician_status: TechnicianStatus;
  technician_level: TechnicianLevel;
  qr_token: string;
  created_at: string;
  technician_performance?: TechnicianPerformance[];
  technician_id_cards?: TechnicianIdCard[];
}

export interface TechnicianFormData {
  technician_id: string;
  employee_number: string;
  technician_name: string;
  branch: string;
  service_center: string;
  phone: string;
  email: string;
  technician_status: TechnicianStatus;
  technician_level: TechnicianLevel;
  card_number: string;
  card_status: CardStatus;
  expiry_date: string;
  // 6 Indikator Evaluasi 12 Kolom
  tat?: number;
  rtat?: number;
  csat?: number;
  grooming_score?: number;
  service_score?: number;
  repair_quality_score?: number;
  performance_score?: number;
}

export interface TechnicianPublicData {
  technician_id: string;
  technician_name: string;
  branch: string;
  service_center: string | null;
  photo_url: string | null;
  technician_status: TechnicianStatus;
  technician_level: TechnicianLevel;
  technician_id_cards?: TechnicianIdCard[];
}
