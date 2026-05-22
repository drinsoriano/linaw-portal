import { cn } from "../../lib/utils";
import { getComplianceLevel, BENCHMARK } from "../../lib/scoring";
import { COMPLIANCE_LABELS } from "../../types";

interface ScoreBadgeProps {
  score: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

const LEVEL_CLASSES: Record<string, string> = {
  FULLY_COMPLIANT: "bg-green-100 text-green-800 border border-green-200",
  MOSTLY_COMPLIANT: "bg-blue-100 text-blue-800 border border-blue-200",
  PARTIALLY_COMPLIANT: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  MINIMALLY_COMPLIANT: "bg-orange-100 text-orange-800 border border-orange-200",
  NON_COMPLIANT: "bg-red-100 text-red-800 border border-red-200",
};

export function ScoreBadge({ score, showScore = true, size = "md", className }: ScoreBadgeProps) {
  const level = getComplianceLevel(score);
  const label = COMPLIANCE_LABELS[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        SIZE_CLASSES[size],
        LEVEL_CLASSES[level],
        className
      )}
    >
      {showScore && <span className="font-bold">{score.toFixed(2)}</span>}
      <span>{label}</span>
    </span>
  );
}

interface ScoreBarProps {
  score: number;
  maxScore?: number;
  showLabel?: boolean;
  className?: string;
}

export function ScoreBar({ score, maxScore = 5, showLabel = true, className }: ScoreBarProps) {
  const pct = (score / maxScore) * 100;
  const benchmarkPct = (BENCHMARK / maxScore) * 100;
  const color =
    score >= 4.21 ? "bg-green-500" :
    score >= 3.41 ? "bg-blue-500" :
    score >= 2.61 ? "bg-yellow-500" :
    score >= 1.81 ? "bg-orange-500" : "bg-red-500";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1 h-2 rounded-full bg-slate-100 overflow-visible">
        <div
          className={cn("absolute left-0 top-0 h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
        {/* Benchmark marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-slate-500 rounded-full"
          style={{ left: `${benchmarkPct}%` }}
          title={`Benchmark: ${BENCHMARK}`}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-700 w-8 text-right">
          {score.toFixed(2)}
        </span>
      )}
    </div>
  );
}
