import type { AuditSubmission, IndicatorResponse, SubmissionStatus } from "../types";
import { barangays } from "./barangays";
import { indicators } from "./indicators";

// Seeded deterministic score generator for realism
function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Known low-scoring indicators from the research paper
const KNOWN_LOW: Record<string, number> = {
  "WCF5": 2.61,
  "ECI2": 3.35,
  "C3": 3.27,
  "P2.2.1": 3.38,
  "P2.3": 3.42,
  "ECI6": 3.29,
  "C7": 3.55,
  "C8": 3.48,
  "C9": 3.52,
  "P5.1": 3.88,
};

// High-scoring indicators from the research paper
const KNOWN_HIGH: Record<string, number> = {
  "WCF2": 4.54,
  "WCF3": 4.32,
  "C1": 4.80,
  "C2": 4.41,
  "C4": 4.03,
  "P6.2": 4.35,
};

function generateScore(indicatorId: string, barangayIdx: number): number {
  const base = KNOWN_LOW[indicatorId] ?? KNOWN_HIGH[indicatorId] ?? 3.6;
  const variance = (seededRand(barangayIdx * 37 + indicatorId.charCodeAt(0)) - 0.5) * 1.2;
  const raw = base + variance;
  const clamped = Math.max(1, Math.min(5, raw));
  return Math.round(clamped); // integer 1-5 for Likert
}

const CYCLE_ID = "cycle-2025-1";

const STATUS_DISTRIBUTION: SubmissionStatus[] = [
  "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED",
  "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED",
  "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED",
  "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED",
  "REVIEWED", "REVIEWED", "REVIEWED", "REVIEWED", "REVIEWED",
  "REVIEWED", "REVIEWED",
  "SUBMITTED", "SUBMITTED", "SUBMITTED", "SUBMITTED", "SUBMITTED",
  "SUBMITTED", "SUBMITTED",
  "RETURNED_ENCODER", "RETURNED_ENCODER",
  "DRAFT", "DRAFT", "DRAFT", "DRAFT", "DRAFT",
  "DRAFT", "DRAFT", "DRAFT", "DRAFT", "DRAFT",
  "DRAFT", "DRAFT", "DRAFT", "DRAFT",
];

export const auditCycle = {
  id: CYCLE_ID,
  year: 2025,
  semester: "FIRST" as const,
  label: "2025 — First Semester",
  status: "ACTIVE" as const,
  startDate: "2025-01-15",
  endDate: "2025-06-30",
};

export const submissions: AuditSubmission[] = barangays.map((brgy, idx) => {
  const status = STATUS_DISTRIBUTION[idx] ?? "DRAFT";
  const isScored = status === "VALIDATED" || status === "REVIEWED" || status === "SUBMITTED" || status === "RETURNED_ENCODER";

  const responses: IndicatorResponse[] = indicators.map((ind) => ({
    indicatorId: ind.id,
    score: isScored ? generateScore(ind.id, idx) : null,
    notes: isScored
      ? `Evidence gathered during field validation on ${new Date(2025, 0, 20 + idx % 15).toLocaleDateString("en-PH", { month: "long", day: "numeric" })}.`
      : "",
    evidenceCount: isScored ? Math.floor(seededRand(idx * 13 + ind.sortOrder) * 4) + 1 : 0,
    cenroScore: status === "VALIDATED"
      ? (seededRand(idx * 7 + ind.sortOrder) > 0.85 ? generateScore(ind.id, idx + 100) : undefined)
      : undefined,
  }));

  // Compute category scores
  const categoryKeys = ["SWM_PROGRAMS", "COMMITTEE", "WASTE_COLLECTION_FEES", "ENV_COMMUNITY_IMPACT"] as const;
  const categoryScores: Record<string, number> = {};

  for (const cat of categoryKeys) {
    const catIndicators = indicators.filter((i) => i.category === cat);
    const catResponses = responses.filter((r) =>
      catIndicators.some((i) => i.id === r.indicatorId) && r.score !== null
    );
    if (catResponses.length > 0) {
      const avg = catResponses.reduce((acc, r) => acc + (r.cenroScore ?? r.score ?? 0), 0) / catResponses.length;
      categoryScores[cat] = parseFloat(avg.toFixed(2));
    }
  }

  const catAvgs = Object.values(categoryScores);
  const overall = catAvgs.length > 0
    ? parseFloat((catAvgs.reduce((a, b) => a + b, 0) / catAvgs.length).toFixed(2))
    : undefined;

  return {
    id: `sub-${brgy.id}`,
    barangayId: brgy.id,
    cycleId: CYCLE_ID,
    status,
    responses,
    overallScore: isScored ? overall : undefined,
    categoryScores: isScored ? (categoryScores as Record<typeof categoryKeys[number], number>) : undefined,
    encoderRemarks: isScored ? "All indicators encoded with supporting evidence." : undefined,
    captainRemarks: (status === "REVIEWED" || status === "VALIDATED")
      ? "Reviewed and verified. Submission approved."
      : undefined,
    cenroRemarks: status === "VALIDATED"
      ? "Field validation completed. Compliance scores finalized."
      : undefined,
    submittedAt: isScored ? `2025-02-${String(10 + (idx % 18)).padStart(2, "0")}` : undefined,
    reviewedAt: (status === "REVIEWED" || status === "VALIDATED")
      ? `2025-02-${String(20 + (idx % 8)).padStart(2, "0")}`
      : undefined,
    validatedAt: status === "VALIDATED"
      ? `2025-03-${String(1 + (idx % 25)).padStart(2, "0")}`
      : undefined,
    createdAt: "2025-01-15",
    updatedAt: "2025-03-15",
  };
});

export function getSubmissionByBarangayId(barangayId: string): AuditSubmission | undefined {
  return submissions.find((s) => s.barangayId === barangayId);
}

export function getSubmissionById(id: string): AuditSubmission | undefined {
  return submissions.find((s) => s.id === id);
}

// City-wide summary stats
export const cityStats = {
  totalBarangays: barangays.length,
  validated: submissions.filter((s) => s.status === "VALIDATED").length,
  reviewed: submissions.filter((s) => s.status === "REVIEWED").length,
  submitted: submissions.filter((s) => s.status === "SUBMITTED").length,
  draft: submissions.filter((s) => s.status === "DRAFT" || s.status === "RETURNED_ENCODER").length,
  fullyCompliant: submissions.filter((s) => (s.overallScore ?? 0) >= 4.21).length,
  mostlyCompliant: submissions.filter((s) => {
    const s2 = s.overallScore ?? 0;
    return s2 >= 3.41 && s2 < 4.21;
  }).length,
  partiallyCompliant: submissions.filter((s) => {
    const s2 = s.overallScore ?? 0;
    return s2 >= 2.61 && s2 < 3.41;
  }).length,
  cityAverage: parseFloat(
    (
      submissions
        .filter((s) => s.overallScore !== undefined)
        .reduce((acc, s) => acc + (s.overallScore ?? 0), 0) /
      Math.max(1, submissions.filter((s) => s.overallScore !== undefined).length)
    ).toFixed(2)
  ),
};

// Historical trend data for charts
export const trendData = [
  { cycle: "2023 S1", average: 3.21, compliant: 3, total: 54 },
  { cycle: "2023 S2", average: 3.45, compliant: 8, total: 54 },
  { cycle: "2024 S1", average: 3.68, compliant: 14, total: 54 },
  { cycle: "2024 S2", average: 3.82, compliant: 19, total: 54 },
  { cycle: "2025 S1", average: cityStats.cityAverage, compliant: cityStats.fullyCompliant, total: 54 },
];
