export type UserRole = 'citizen' | 'admin' | 'maintenance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string;
  avatarUrl?: string;
  badge?: string;
}

export type DefectCategory =
  | 'Pothole'
  | 'Longitudinal Crack'
  | 'Transverse Crack'
  | 'Alligator Crack';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type PriorityTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ReportStatus =
  | 'Pending Verification'
  | 'Verified'
  | 'Assigned'
  | 'In Progress'
  | 'Repaired'
  | 'Rejected';

export interface DetectionBox {
  id: string;
  x: number; // 0..1 fraction
  y: number; // 0..1 fraction
  width: number; // 0..1 fraction
  height: number; // 0..1 fraction
  label: DefectCategory;
  confidence: number; // 0..1
}

export interface DetectionResult {
  reportId?: string;
  boxes: DetectionBox[];
  defectCount: number;
  dominantCategory: DefectCategory;
  confidence: number;
  processingTimeMs: number;
  annotatedImageUrl?: string;
  inferenceMode: 'REAL_AI' | 'DEMO_BENCHMARK';
  modelName: string;
}

export interface RoadReport {
  id: string; // e.g. RG-2026-8491
  citizenId: string;
  citizenName: string;
  title: string;
  description: string;
  imageUrl: string;
  annotatedImageUrl?: string;
  lat: number;
  lng: number;
  address: string;
  category: DefectCategory;
  severity: SeverityLevel;
  severityScore: number; // 0..100
  trafficExposureScore: number; // 0..100
  safetyRiskScore: number; // 0..100
  priorityScore: number; // 0..100
  priorityTier: PriorityTier;
  priorityReason: string;
  status: ReportStatus;
  statusHistory: StatusHistoryItem[];
  detections: DetectionBox[];
  assignedTo?: {
    id: string;
    name: string;
    team: string;
  };
  repairVerification?: RepairVerification;
  isDuplicateOf?: string;
  duplicateCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatusHistoryItem {
  id: string;
  status: ReportStatus;
  updatedBy: string;
  role: UserRole;
  timestamp: string;
  notes?: string;
}

export interface RepairVerification {
  taskId: string;
  workerId: string;
  workerName: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  repairNotes: string;
  materialsUsed: string[];
  costUsd: number;
  completedAt: string;
  verifiedByAdmin?: string;
  adminApprovalStatus: 'Pending Review' | 'Approved' | 'Revision Requested';
  adminFeedback?: string;
}

export interface MaintenanceTask {
  id: string;
  reportId: string;
  reportTitle: string;
  reportCategory: DefectCategory;
  priorityScore: number;
  priorityTier: PriorityTier;
  status: ReportStatus;
  assignedWorkerId: string;
  assignedWorkerName: string;
  targetCompletionDate: string;
  instructions: string;
  equipment: string[];
  lat: number;
  lng: number;
  address: string;
  repairVerification?: RepairVerification;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string; // or 'all'
  roleTarget?: UserRole;
  title: string;
  message: string;
  reportId?: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  totalReports: number;
  totalPotholes: number;
  totalCracks: number;
  criticalDamageReports: number;
  pendingMaintenance: number;
  completedRepairs: number;
  averagePriorityScore: number;
  reportsSubmittedToday: number;
}
