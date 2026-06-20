import type {
  ComplianceLevel,
  IndicatorCategory,
  IndicatorResponse,
  AuditIndicator,
  CategoryScoreResult,
  OverallScoreResult,
} from "../types";

export const BENCHMARK = 4.21;
export const CAP_THRESHOLD = 3.41;

export const LIKERT_DESCRIPTIONS: Record<number, string> = {
  5: "All requirements are fully implemented, documented, and verified.",
  4: "Most requirements are implemented with minor gaps.",
  3: "Some requirements are implemented, but moderate gaps remain.",
  2: "Few requirements are implemented and major gaps exist.",
  1: "The requirement is not implemented or has no evidence.",
};

export const SCORE_RANGE_LABELS: Array<{
  min: number;
  max: number;
  level: ComplianceLevel;
  range: string;
}> = [
  { min: 4.21, max: 5.00, level: "FULLY_COMPLIANT",     range: "4.21–5.00" },
  { min: 3.41, max: 4.20, level: "MOSTLY_COMPLIANT",    range: "3.41–4.20" },
  { min: 2.61, max: 3.40, level: "PARTIALLY_COMPLIANT", range: "2.61–3.40" },
  { min: 1.81, max: 2.60, level: "MINIMALLY_COMPLIANT", range: "1.81–2.60" },
  { min: 1.00, max: 1.80, level: "NON_COMPLIANT",        range: "1.00–1.80" },
];

export function getComplianceLevel(score: number): ComplianceLevel {
  if (score >= 4.21) return "FULLY_COMPLIANT";
  if (score >= 3.41) return "MOSTLY_COMPLIANT";
  if (score >= 2.61) return "PARTIALLY_COMPLIANT";
  if (score >= 1.81) return "MINIMALLY_COMPLIANT";
  return "NON_COMPLIANT";
}

export function needsImprovement(score: number): boolean {
  return score < BENCHMARK;
}

export function requiresCAP(score: number): boolean {
  return score < CAP_THRESHOLD;
}

export function effectiveScore(response: IndicatorResponse): number | null {
  return response.cenroScore ?? response.score ?? null;
}

export function getLikertLabel(score: number): string {
  switch (score) {
    case 5: return "Fully Compliant";
    case 4: return "Mostly Compliant";
    case 3: return "Partially Compliant";
    case 2: return "Minimally Compliant";
    case 1: return "Non-Compliant";
    default: return "Not Scored";
  }
}

export function computeCategoryScore(
  responses: IndicatorResponse[],
  indicators: AuditIndicator[],
  category: IndicatorCategory
): CategoryScoreResult {
  const catIndicators = indicators.filter((i) => i.category === category);
  const catResponses = responses.filter((r) =>
    catIndicators.some((i) => i.id === r.indicatorId)
  );
  const answered = catResponses.filter((r) => effectiveScore(r) !== null);
  const sum = answered.reduce((acc, r) => acc + (effectiveScore(r) ?? 0), 0);
  const avg = answered.length > 0 ? sum / answered.length : 0;

  const belowBenchmark = answered
    .filter((r) => (effectiveScore(r) ?? 0) < BENCHMARK)
    .map((r) => r.indicatorId);

  const requireingCAP = answered
    .filter((r) => (effectiveScore(r) ?? 0) < CAP_THRESHOLD)
    .map((r) => r.indicatorId);

  return {
    category,
    averageScore: avg,
    complianceLevel: getComplianceLevel(avg),
    answeredCount: answered.length,
    totalIndicators: catIndicators.length,
    indicatorsBelowBenchmark: belowBenchmark,
    indicatorsRequiringCAP: requireingCAP,
  };
}

export function computeOverallScore(
  responses: IndicatorResponse[],
  indicators: AuditIndicator[]
): OverallScoreResult {
  const categories: IndicatorCategory[] = [
    "SWM_PROGRAMS",
    "COMMITTEE",
    "WASTE_COLLECTION_FEES",
    "ENV_COMMUNITY_IMPACT",
  ];

  const breakdown = categories.map((cat) =>
    computeCategoryScore(responses, indicators, cat)
  );

  const scoredCategories = breakdown.filter((c) => c.answeredCount > 0);
  const overall =
    scoredCategories.length > 0
      ? scoredCategories.reduce((acc, c) => acc + c.averageScore, 0) /
        scoredCategories.length
      : 0;

  return {
    overallScore: overall,
    complianceLevel: getComplianceLevel(overall),
    categoryBreakdown: breakdown,
    totalBelowBenchmark: breakdown.reduce(
      (acc, c) => acc + c.indicatorsBelowBenchmark.length,
      0
    ),
    totalRequiringCAP: breakdown.reduce(
      (acc, c) => acc + c.indicatorsRequiringCAP.length,
      0
    ),
  };
}

export function getScoreColor(score: number): string {
  if (score >= 4.21) return "text-green-700";
  if (score >= 3.41) return "text-blue-700";
  if (score >= 2.61) return "text-yellow-700";
  if (score >= 1.81) return "text-orange-700";
  return "text-red-700";
}

export function getScoreBg(score: number): string {
  if (score >= 4.21) return "bg-green-50 border-green-200";
  if (score >= 3.41) return "bg-blue-50 border-blue-200";
  if (score >= 2.61) return "bg-yellow-50 border-yellow-200";
  if (score >= 1.81) return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
}

export function getBarColor(score: number): string {
  if (score >= 4.21) return "#16a34a";
  if (score >= 3.41) return "#2563eb";
  if (score >= 2.61) return "#ca8a04";
  if (score >= 1.81) return "#ea580c";
  return "#dc2626";
}
