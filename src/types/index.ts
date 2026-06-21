// ─── Roles ────────────────────────────────────────────────────────────────────

export type UserRole =
  | "SYSTEM_ADMIN"
  | "CENRO_EVALUATOR"
  | "BARANGAY_SECRETARY"    // encodes ECA + RA 9003 audit, uploads evidence, submits for committee review
  | "BARANGAY_COUNCILOR"    // Committee Chair / Kagawad on Environment — reviews & endorses SWM content
  | "BARANGAY_CAPTAIN"      // certifies and submits to CENRO
  | "RESEARCHER"
  | "CITIZEN";              // public dashboard access only

export const ROLE_LABELS: Record<UserRole, string> = {
  SYSTEM_ADMIN: "System Administrator",
  CENRO_EVALUATOR: "CENRO Administrator / Evaluator",
  BARANGAY_SECRETARY: "Barangay Secretary",
  BARANGAY_COUNCILOR: "Barangay Councilor",
  BARANGAY_CAPTAIN: "Barangay Captain",
  RESEARCHER: "Researcher / Auditor",
  CITIZEN: "Citizen / Public Viewer",
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
  score: number | null; // 1–5
  notes: string;
  evidenceCount: number;
  cenroScore?: number | null;
}

export type SubmissionStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "RETURNED_ENCODER"
  | "REVIEWED"
  | "RETURNED_CAPTAIN"
  | "VALIDATED"
  | "REJECTED";

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  RETURNED_ENCODER: "Returned to Encoder",
  REVIEWED: "Reviewed",
  RETURNED_CAPTAIN: "Returned to Captain",
  VALIDATED: "Validated",
  REJECTED: "Rejected",
};

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  RETURNED_ENCODER: "bg-orange-100 text-orange-700",
  REVIEWED: "bg-purple-100 text-purple-700",
  RETURNED_CAPTAIN: "bg-amber-100 text-amber-700",
  VALIDATED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export interface AuditSubmission {
  id: string;
  barangayId: string;
  cycleId: string;
  status: SubmissionStatus;
  responses: IndicatorResponse[];
  overallScore?: number;
  categoryScores?: Record<IndicatorCategory, number>;
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

export type CycleStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";

export interface AuditCycle {
  id: string;
  year: number;
  label: string;
  status: CycleStatus;
  startDate: string;
  endDate: string;
  closedAt?: string;
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

// ─── ECA Reporting ────────────────────────────────────────────────────────────

export type EcaStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "ENDORSED"
  | "PENDING"
  | "OVERDUE"
  | "FOR_REVISION"
  | "ACCEPTED";

export const ECA_STATUS_LABELS: Record<EcaStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "For Committee Review",
  ENDORSED: "Endorsed to Captain",
  PENDING: "Pending CENRO Review",
  OVERDUE: "Overdue",
  FOR_REVISION: "For Revision",
  ACCEPTED: "Accepted",
};

export const ECA_STATUS_COLORS: Record<EcaStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  ENDORSED: "bg-indigo-100 text-indigo-700",
  PENDING: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700",
  FOR_REVISION: "bg-orange-100 text-orange-700",
  ACCEPTED: "bg-green-100 text-green-700",
};

export interface EcaField {
  id: string;
  label: string;
  value: string | number;
  type: "text" | "number" | "date" | "textarea" | "boolean" | "checkbox" | "computed" | "select";
  unit?: string;
  options?: string[];  // for "checkbox" (multi-select) and "select" (single-select) types
  hint?: string;       // for "computed": describes the formula; for "boolean": threshold note
}

export interface NoteReply {
  id: string;
  role: "BARANGAY_COUNCILOR" | "BARANGAY_CAPTAIN" | "BARANGAY_SECRETARY";
  by: string;
  text: string;
  createdAt: string;
}

export interface SectionReviewNote {
  id: string;
  round: number;                                        // increments each time Secretary resubmits
  role: "BARANGAY_COUNCILOR" | "BARANGAY_CAPTAIN";    // only that role can edit their own note
  by: string;                                           // reviewer's display name
  note: string;
  createdAt: string;    // full ISO timestamp
  resolved?: boolean;   // Secretary marked this concern as addressed
  replies?: NoteReply[];  // threaded replies from any of the three roles
}

export interface EcaSection {
  id: string;
  label: string;
  fields: EcaField[];
  reviewNotes?: SectionReviewNote[];
}

export interface EcaAttachment {
  id: string;
  filename: string;
  fileType: "PDF" | "EXCEL" | "WORD" | "IMAGE" | "OTHER";
  sizeBytes: number;
  url?: string;
  uploadedAt: string;
}

export interface EcaReport {
  id: string;
  barangayId: string;
  quarter: 1 | 2 | 3 | 4;
  year: number;
  status: EcaStatus;
  revisionRound: number;   // starts at 0; increments on each Secretary resubmission
  sections: EcaSection[];
  attachments: EcaAttachment[];
  summaryMetrics?: {
    complianceRate: number;  // household compliance %
    diversionRate: number;   // waste diversion %
  };
  preparedBy?: string;     // Secretary who encoded and submitted
  preparedAt?: string;
  submittedAt?: string;
  submittedBy?: string;
  endorsedAt?: string;
  endorsedBy?: string;
  certifiedBy?: string;    // Captain who certified to CENRO
  certifiedAt?: string;
  reviewRemarks?: string;
  reviewedAt?: string;
  cenroFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Recycler Registry ────────────────────────────────────────────────────────

export type RecyclerType = "INDIVIDUAL" | "JUNKSHOP" | "GROUP";

export interface RecyclerEntry {
  id: string;
  barangayId: string;
  name: string;
  type: RecyclerType;
  contact: string;
  address: string;
  materials: string[];
  monthlyKg: number;
  registeredAt: string;
  isActive: boolean;
}

export interface MonthlyRecovery {
  id: string;
  recyclerId: string;
  month: number;
  year: number;
  materialType: string;
  volumeKg: number;
  incomeEstimate: number;
}

// ─── Waste Collection ─────────────────────────────────────────────────────────

export interface CollectionLog {
  id: string;
  barangayId: string;
  date: string;
  haulerName: string;
  truckPlate: string;
  routesCompleted: string[];
  wasteVolKg: number;
  missedAreas: string[];
  ppePassed: boolean;
  vehiclePassed: boolean;
  notes: string;
}

export type IncidentStatus = "OPEN" | "RESOLVED";

export interface IncidentReport {
  id: string;
  barangayId: string;
  date: string;
  type: string;
  description: string;
  location: string;
  photoUrl?: string;
  status: IncidentStatus;
  reportedBy: string;
  resolvedAt?: string;
}

// ─── Contact Directory ────────────────────────────────────────────────────────

export interface BarangayContactInfo {
  barangayId: string;
  callPhone?: string;
  smsPhone?: string;
  email?: string;
  facebookPage?: string;
  messengerLink?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CenroContactInfo {
  callPhone?: string;
  smsPhone?: string;
  email?: string;
  facebookPage?: string;
  messengerLink?: string;
  address?: string;
  updatedAt: string;
  updatedBy: string;
}

// ─── Hauler Accreditation ─────────────────────────────────────────────────────

export type HaulerStatus = "ACTIVE" | "EXPIRED" | "SUSPENDED";

export interface HaulerRecord {
  id: string;
  companyName: string;
  accreditationNo: string;
  validFrom: string;
  validUntil: string;
  status: HaulerStatus;
  safetyPassed: boolean;
  violations: string[];
  charterUploaded: boolean;
  linkedBarangays: string[];
  contactPerson: string;
  contactPhone: string;
}

// ─── Financial ────────────────────────────────────────────────────────────────

export interface FinancialRecord {
  id: string;
  barangayId: string;
  month: number;
  year: number;
  feeCollected: number;
  recyclingIncome: number;
  expenses: number;
  notes: string;
}

// ─── IEC / Citizen Engagement ─────────────────────────────────────────────────

export type IECActivityType = "TRAINING" | "CAMPAIGN" | "SCHOOL" | "COMMUNITY";

export interface IECAttachment {
  name: string;
  mimeType: string;
  dataUrl: string;
}

export interface IECActivity {
  id: string;
  barangayId: string;
  date: string;
  type: IECActivityType;
  title: string;
  participants: number;
  description: string;
  ordinance?: string;
  attachments?: IECAttachment[];
  photoUrl?: string;
}

// ─── NGO & Partners ───────────────────────────────────────────────────────────

export interface NGOPartner {
  id: string;
  name: string;
  area: string;
  barangayId?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  activities: string[];
  linkedAt: string;
  isActive: boolean;
}

// ─── CENRO Feedback ───────────────────────────────────────────────────────────

export type FeedbackStatus = "NOT_STARTED" | "ONGOING" | "FOR_VERIFICATION" | "COMPLETED";
export type FeedbackSourceType = "ECA" | "COMPLIANCE" | "COLLECTION" | "FINANCIAL" | "GENERAL";
export type FeedbackPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  NOT_STARTED: "Not Started",
  ONGOING: "Ongoing",
  FOR_VERIFICATION: "For Verification",
  COMPLETED: "Completed",
};

export const FEEDBACK_STATUS_COLORS: Record<FeedbackStatus, string> = {
  NOT_STARTED: "bg-red-100 text-red-700",
  ONGOING: "bg-blue-100 text-blue-700",
  FOR_VERIFICATION: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export const FEEDBACK_PRIORITY_COLORS: Record<FeedbackPriority, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export interface CenroFeedback {
  id: string;
  barangayId: string;
  sourceType: FeedbackSourceType;
  referenceId: string;
  subject: string;
  body: string;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  respondedAt?: string;
  barangayResponse?: string;
  createdAt: string;
  issuedBy: string;
}

// ─── Citizen Report ───────────────────────────────────────────────────────────

export interface CitizenReport {
  id: string;
  barangayId: string;
  concernType: string;
  description: string;
  contactName?: string;
  contactEmail?: string;
  submittedAt: string;
  status: "RECEIVED" | "ACKNOWLEDGED" | "RESOLVED";
}
