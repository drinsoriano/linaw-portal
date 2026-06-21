import type { AuditSubmission, AuditCycle, IndicatorResponse, SubmissionStatus } from "../types";
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
const CYCLE_ID_2024 = "cycle-2024";

// Indices whose DRAFT submissions are pre-filled for demo (enables Submit button immediately)
const DEMO_PREFILL = new Set([0]); // index 0 = brgy-001 (Bagong Kalsada)

const STATUS_DISTRIBUTION: SubmissionStatus[] = [
  // brgy-001: DRAFT — Captain pre-filled for demo (DEMO_PREFILL index 0)
  "DRAFT",
  "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED",
  "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED",
  "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED",
  "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED",
  "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED",
  "VALIDATED", "VALIDATED",
  "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED", "VALIDATED",
  "VALIDATED", "VALIDATED",
  "DRAFT", "DRAFT",
  "DRAFT", "DRAFT", "DRAFT", "DRAFT", "DRAFT",
  "DRAFT", "DRAFT", "DRAFT", "DRAFT", "DRAFT",
  "DRAFT", "DRAFT", "DRAFT", "DRAFT",
];

// ─── Helper: generate historical VALIDATED submissions for any closed cycle ───

function makeHistoricalSubs(cycleId: string, year: number, seedOffset: number): AuditSubmission[] {
  // yearFactor scales average scores down for earlier years (2020 ≈ 0.80, 2023 ≈ 0.95)
  const yearFactor = 0.80 + (year - 2020) * 0.05;
  const categoryKeys = ["SWM_PROGRAMS", "COMMITTEE", "WASTE_COLLECTION_FEES", "ENV_COMMUNITY_IMPACT"] as const;

  return barangays.map((brgy, idx) => {
    const responses: IndicatorResponse[] = indicators.map((ind) => {
      const rawScore = generateScore(ind.id, idx + seedOffset) * yearFactor + (1 - yearFactor);
      return {
        indicatorId: ind.id,
        score: Math.max(1, Math.min(5, Math.round(rawScore))),
        notes: "",
        evidenceCount: 1,
      };
    });

    const categoryScores: Record<string, number> = {};
    for (const cat of categoryKeys) {
      const catIndicators = indicators.filter((i) => i.category === cat);
      const catResponses = responses.filter((r) =>
        catIndicators.some((i) => i.id === r.indicatorId) && r.score !== null
      );
      if (catResponses.length > 0) {
        const avg = catResponses.reduce((acc, r) => acc + (r.score ?? 0), 0) / catResponses.length;
        categoryScores[cat] = parseFloat(avg.toFixed(2));
      }
    }

    const catAvgs = Object.values(categoryScores);
    const overall = catAvgs.length > 0
      ? parseFloat((catAvgs.reduce((a, b) => a + b, 0) / catAvgs.length).toFixed(2))
      : undefined;

    return {
      id: `sub-${brgy.id}-${year}`,
      barangayId: brgy.id,
      cycleId,
      status: "VALIDATED" as SubmissionStatus,
      responses,
      overallScore: overall,
      categoryScores: categoryScores as Record<typeof categoryKeys[number], number>,
      captainRemarks: "Self-assessment certified by Punong Barangay.",
      validatedAt: `${year}-06-${String(15 + (idx % 14)).padStart(2, "0")}`,
      createdAt: `${year}-04-01`,
      updatedAt: `${year}-06-30`,
    };
  });
}

// ─── 2020–2023 Historical Cycles ─────────────────────────────────────────────

export const auditCycle2020: AuditCycle = {
  id: "cycle-2020", year: 2020, label: "2020 Annual Audit",
  status: "CLOSED", startDate: "2020-04-01", endDate: "2020-06-30", closedAt: "2021-01-06",
};
export const auditCycle2021: AuditCycle = {
  id: "cycle-2021", year: 2021, label: "2021 Annual Audit",
  status: "CLOSED", startDate: "2021-04-01", endDate: "2021-06-30", closedAt: "2022-01-04",
};
export const auditCycle2022: AuditCycle = {
  id: "cycle-2022", year: 2022, label: "2022 Annual Audit",
  status: "CLOSED", startDate: "2022-04-01", endDate: "2022-06-30", closedAt: "2023-01-05",
};
export const auditCycle2023: AuditCycle = {
  id: "cycle-2023", year: 2023, label: "2023 Annual Audit",
  status: "CLOSED", startDate: "2023-04-01", endDate: "2023-06-30", closedAt: "2024-01-08",
};

export const submissions2020 = makeHistoricalSubs("cycle-2020", 2020, 4000);
export const submissions2021 = makeHistoricalSubs("cycle-2021", 2021, 3000);
export const submissions2022 = makeHistoricalSubs("cycle-2022", 2022, 2000);
export const submissions2023 = makeHistoricalSubs("cycle-2023", 2023, 1000);

// ─── 2024 Historical Cycle ────────────────────────────────────────────────────

export const auditCycle2024: AuditCycle = {
  id: CYCLE_ID_2024,
  year: 2024,
  label: "2024 Annual Audit",
  status: "CLOSED",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  closedAt: "2025-01-10",
};

export const submissions2024: AuditSubmission[] = barangays.map((brgy, idx) => {
  const responses2024: IndicatorResponse[] = indicators.map((ind) => ({
    indicatorId: ind.id,
    score: generateScore(ind.id, idx + 500), // seed offset +500 → different-but-realistic scores
    notes: "",
    evidenceCount: Math.floor(seededRand(idx * 13 + ind.sortOrder + 500) * 3) + 1,
  }));

  const categoryKeys = ["SWM_PROGRAMS", "COMMITTEE", "WASTE_COLLECTION_FEES", "ENV_COMMUNITY_IMPACT"] as const;
  const categoryScores2024: Record<string, number> = {};

  for (const cat of categoryKeys) {
    const catIndicators = indicators.filter((i) => i.category === cat);
    const catResponses = responses2024.filter((r) =>
      catIndicators.some((i) => i.id === r.indicatorId) && r.score !== null
    );
    if (catResponses.length > 0) {
      const avg = catResponses.reduce((acc, r) => acc + (r.score ?? 0), 0) / catResponses.length;
      categoryScores2024[cat] = parseFloat(avg.toFixed(2));
    }
  }

  const catAvgs2024 = Object.values(categoryScores2024);
  const overall2024 = catAvgs2024.length > 0
    ? parseFloat((catAvgs2024.reduce((a, b) => a + b, 0) / catAvgs2024.length).toFixed(2))
    : undefined;

  return {
    id: `sub-${brgy.id}-2024`,
    barangayId: brgy.id,
    cycleId: CYCLE_ID_2024,
    status: "VALIDATED",
    responses: responses2024,
    overallScore: overall2024,
    categoryScores: categoryScores2024 as Record<typeof categoryKeys[number], number>,
    encoderRemarks: "All indicators encoded with supporting evidence.",
    captainRemarks: "Reviewed and verified. Submission approved.",
    submittedAt: `2024-02-${String(10 + (idx % 18)).padStart(2, "0")}`,
    reviewedAt: `2024-02-${String(20 + (idx % 8)).padStart(2, "0")}`,
    validatedAt: `2024-03-${String(1 + (idx % 25)).padStart(2, "0")}`,
    createdAt: "2024-01-01",
    updatedAt: "2024-03-15",
  };
});

// ─── 2025 Active Cycle ────────────────────────────────────────────────────────

export const auditCycle = {
  id: CYCLE_ID,
  year: 2025,
  label: "2025 Annual Audit",
  status: "ACTIVE" as const,
  startDate: "2025-01-01",
  endDate: "2025-12-31",
};

export const submissions: AuditSubmission[] = barangays.map((brgy, idx) => {
  const status = STATUS_DISTRIBUTION[idx] ?? "DRAFT";
  const isScored = status === "VALIDATED" || (status === "DRAFT" && DEMO_PREFILL.has(idx));

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
    captainRemarks: status === "VALIDATED"
      ? "Self-assessment certified by Punong Barangay."
      : undefined,
    submittedAt: isScored ? `2025-05-${String(10 + (idx % 18)).padStart(2, "0")}` : undefined,
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
  { cycle: "2020", average: 2.89, compliant: 1, total: 54 },
  { cycle: "2021", average: 3.08, compliant: 2, total: 54 },
  { cycle: "2022", average: 3.29, compliant: 6, total: 54 },
  { cycle: "2023", average: 3.52, compliant: 11, total: 54 },
  { cycle: "2024", average: 3.71, compliant: 19, total: 54 },
  { cycle: "2025", average: cityStats.cityAverage, compliant: cityStats.fullyCompliant, total: 54 },
];
