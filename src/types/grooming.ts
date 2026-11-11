// src/types/grooming.ts
import { ServiceTypeCode } from './index';

export type GroomingStatus = 'submitted' | 'approved' | 'rejected';

export interface GroomingChecklist {
  uniform_checked: boolean;
  pants_checked: boolean;
  hair_checked: boolean;
  face_checked: boolean;
}

export interface GroomingReport extends GroomingChecklist {
  id: string;
  technician_id: string;
  technician_name: string;
  branch: string;
  service_type: ServiceTypeCode;
  period_week: string; // ISO 8601: e.g. "2026-W45"
  submission_time: string;
  is_monday: boolean;
  photo_full_url: string;
  photo_face_url: string;
  notes?: string | null;
  status: GroomingStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
}

export interface GroomingSubmissionPayload extends GroomingChecklist {
  technician_id: string;
  technician_name: string;
  branch: string;
  service_type: ServiceTypeCode;
  period_week: string;
  is_monday: boolean;
  photo_full_file: File | Blob;
  photo_face_file: File | Blob;
  notes?: string;
}

export interface GroomingStats {
  totalTechnicians: number;
  submittedCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  mondayComplianceRate: number; // percentage
}
