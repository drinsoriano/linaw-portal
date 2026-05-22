// ─── Roles ────────────────────────────────────────────────────────────────────

export type UserRole =
  | "SYSTEM_ADMIN"
  | "CENRO_EVALUATOR"
  | "BARANGAY_ENCODER"
  | "BARANGAY_CAPTAIN"
  | "RESEARCHER"
  | "PUBLIC_VIEWER";

export const ROLE_LABELS: Record<UserRole, string> = {
  SYSTEM_ADMIN: "System Administrator",
  CENRO_EVALUATOR: "CENRO Administrator / Evaluator",
  BARANGAY_ENCODER: "Barangay Encoder",
  BARANGAY_CAPTAIN: "Barangay Captain",
  RESEARCHER: "Researcher / Auditor",
  PUBLIC_VIEWER: "Public Viewer",
};

// ─── Compliance ───────────────────────────────────────────────────────────────

export type ComplianceLevel =
  | "FULLY_COMPLIANT"
  | "MOSTLY_COMPLIANT"
  | "PARTIALLY_COMPLIANT"
  | "MINIMALLY_COMPLIANT"
  | "NON_COMPLIANT";

export const COMPLIANCE_LABELS: Record<ComplianceLevel, string> = {
  FULLY_COMPLIANT: "Fully Compliant",
  MOSTLY_COMPLIANT: "Mostly Compliant",
  PARTIALLY_COMPLIANT: "Partially Compliant",
  MINIMALLY_COMPLIANT: "Minimally Compliant",
  NON_COMPLIANT: "Non-Compliant",
};

export const COMPLIANCE_COLORS: Record<ComplianceLevel, string> = {
  FULLY_COMPLIANT: "bg-green-100 text-green-800 border-green-200",
  MOSTLY_COMPLIANT: "bg-blue-100 text-blue-800 border-blue-200",
  PARTIALLY_COMPLIANT: "bg-yellow-100 text-yellow-800 border-yellow-200",
  MINIMALLY_COMPLIANT: "bg-orange-100 text-orange-800 border-orange-200",
  NON_COMPLIANT: "bg-red-100 text-red-800 border-red-200",
};

export const SCORE_DOT_COLORS: Record<ComplianceLevel, string> = {
  FULLY_COMPLIANT: "bg-green-500",
  MOSTLY_COMPLIANT: "bg-blue-500",
  PARTIALLY_COMPLIANT: "bg-yellow-500",
  MINIMALLY_COMPLIANT: "bg-orange-500",
  NON_COMPLIANT: "bg-red-500",
};

// ─── Audit ────────────────────────────────────────────────────────────────────

export type IndicatorCategory =
  | "SWM_PROGRAMS"
  | "COMMITTEE"
  | "WASTE_COLLECTION_FEES"
  | "ENV_COMMUNITY_IMPACT";

export const CATEGORY_LABELS: Record<IndicatorCategory, string> = {
  SWM_PROGRAMS: "SWM Programs",
  COMMITTEE: "Barangay SWM Committee Structure",
  WASTE_COLLECTION_FEES: "Waste Collection and Fees",
  ENV_COMMUNITY_IMPACT: "Environmental and Community Impact",
};

export const CATEGORY_SHORT: Record<IndicatorCategory, string> = {
  SWM_PROGRAMS: "SWM Programs",
  COMMITTEE: "Committee",
  WASTE_COLLECTION_FEES: "Collection & Fees",
  ENV_COMMUNITY_IMPACT: "Environmental Impact",
};

export const CATEGORY_DESCRIPTIONS: Record<IndicatorCategory, string> = {
  SWM_PROGRAMS:
    "Measures the presence and implementation of barangay solid waste management programs such as segregation, recycling, composting, IEC campaigns, MRF operation, and waste reduction activities.",
  COMMITTEE:
    "Measures whether the barangay has an organized SWM committee, assigned members, stakeholder participation, regular meetings, documentation, and functional roles.",
  WASTE_COLLECTION_FEES:
    "Measures collection schedule, collection system, waste hauling practices, covered collection vehicles, fee collection, coordination with haulers, and documentation of collection activities.",
  ENV_COMMUNITY_IMPACT:
    "Measures visible environmental outcomes such as cleanliness, reduction of waste accumulation, reduced open dumping, improved segregation behavior, community participation, and sustainability of SWM practices.",
};

export interface AuditIndicator {
  id: string;
  code: string;
  name: string;
  description: string;
  category: IndicatorCategory;
  sortOrder: number;
}

export interface IndicatorResponse {
  indicatorId: string;
  barangayScore: number | null;
  notes: string;
  evidenceCount: number;
  validatedScore?: number | null;
}

export type SubmissionStatus =
  | "DRAFT"
  | "SUBMITTED_TO_CAPTAIN"
  | "RETURNED_TO_ENCODER"
  | "APPROVED_BY_CAPTAIN"
  | "RETURNED_TO_CAPTAIN"
  | "VALIDATED_BY_CENRO"
  | "REJECTED_BY_CENRO";

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED_TO_CAPTAIN: "Submitted to Captain",
  RETURNED_TO_ENCODER: "Returned to Encoder",
  APPROVED_BY_CAPTAIN: "Approved by Captain",
  RETURNED_TO_CAPTAIN: "Returned to Captain",
  VALIDATED_BY_CENRO: "Validated by CENRO",
  REJECTED_BY_CENRO: "Rejected by CENRO",
};

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED_TO_CAPTAIN: "bg-blue-100 text-blue-700",
  RETURNED_TO_ENCODER: "bg-orange-100 text-orange-700",
  APPROVED_BY_CAPTAIN: "bg-purple-100 text-purple-700",
  RETURNED_TO_CAPTAIN: "bg-amber-100 text-amber-700",
  VALIDATED_BY_CENRO: "bg-green-100 text-green-700",
  REJECTED_BY_CENRO: "bg-red-100 text-red-700",
};

export interface AuditSubmission {
  id: string;
  barangayId: string;
  cycleId: string;
  status: SubmissionStatus;
  responses: IndicatorResponse[];
  overallScore?: number;
  categoryScores?: Record<IndicatorCategory, number>;
  validatedOverallScore?: number;
  validatedCategoryScores?: Record<IndicatorCategory, number>;
  encoderRemarks?: string;
  captainRemarks?: string;
  cenroRemarks?: string;
  submittedAt?: string;
  reviewedAt?: string;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Barangay ─────────────────────────────────────────────────────────────────

export type District =
  | "District I"
  | "District II"
  | "District III"
  | "District IV"
  | "Poblacion";

export interface Barangay {
  id: string;
  name: string;
  district: District;
  captainName: string;
  population: number;
  areaHectares: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isActive: boolean;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  barangayId?: string;
  barangayName?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Audit Cycle ──────────────────────────────────────────────────────────────

export type CycleSemester = "FIRST" | "SECOND";
export type CycleStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";

export interface AuditCycle {
  id: string;
  year: number;
  semester: CycleSemester;
  label: string;
  status: CycleStatus;
  startDate: string;
  endDate: string;
}

// ─── Corrective Action / CAP ──────────────────────────────────────────────────

export type CAPStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";

export type FishboneFactor =
  | "MAN"
  | "MACHINE"
  | "METHOD"
  | "MATERIAL"
  | "MEASUREMENT"
  | "ENVIRONMENT";

export interface CorrectiveAction {
  id: string;
  submissionId: string;
  indicatorId: string;
  indicatorCode: string;
  indicatorName: string;
  score: number;
  why1?: string;
  why2?: string;
  why3?: string;
  why4?: string;
  why5?: string;
  rootCause?: string;
  fishboneFactor?: FishboneFactor;
  fishboneDetail?: string;
  actionPlan: string;
  owner: string;
  targetDate: string;
  status: CAPStatus;
  progressNotes?: string;
}

// ─── Evidence ─────────────────────────────────────────────────────────────────

export type EvidenceFileType = "IMAGE" | "PDF" | "DOCUMENT" | "OTHER";

export interface EvidenceFile {
  id: string;
  responseId: string;
  indicatorId: string;
  indicatorCode: string;
  filename: string;
  originalName: string;
  fileType: EvidenceFileType;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  url?: string;
}

// ─── Scoring Result ───────────────────────────────────────────────────────────

export interface CategoryScoreResult {
  category: IndicatorCategory;
  averageScore: number;
  complianceLevel: ComplianceLevel;
  answeredCount: number;
  totalIndicators: number;
  indicatorsBelowBenchmark: string[];
  indicatorsRequiringCAP: string[];
}

export interface OverallScoreResult {
  overallScore: number;
  complianceLevel: ComplianceLevel;
  categoryBreakdown: CategoryScoreResult[];
  totalBelowBenchmark: number;
  totalRequiringCAP: number;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
