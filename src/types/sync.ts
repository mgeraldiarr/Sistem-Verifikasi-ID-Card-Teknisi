// src/types/sync.ts
import { CardStatus, TechnicianLevel, TechnicianStatus } from './technician';

export interface SyncLog {
  id: string;
  start_time: string;
  end_time: string | null;
  status: 'success' | 'failed' | 'partial';
  total_records: number;
  processed_records: number;
  new_records: number;
  updated_records: number;
  error_count: number;
  error_details: any;
}

export interface SyncRecord {
  technician_id: string;
  employee_number: string;
  technician_name: string;
  branch: string;
  service_center?: string;
  photo_url?: string;
  phone?: string;
  email?: string;
  technician_status: TechnicianStatus;
  technician_level: TechnicianLevel;
  period: string;
  kpi_score: number;
  csi_score: number;
  performance_score: number;
  performance_level: TechnicianLevel;
  card_number?: string;
  card_status?: CardStatus;
  expiry_date?: string;
}

export interface SyncErrorDetail {
  row: number;
  technician_id: string;
  error: string;
}

export interface ExcelUploadResult {
  status: 'success' | 'failed' | 'partial';
  totalRows: number;
  successCount: number;
  insertCount: number;
  updateCount: number;
  errorDetails: SyncErrorDetail[];
}
