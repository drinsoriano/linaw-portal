import { cn } from "../../lib/utils";
import type { SubmissionStatus } from "../../types";
import { STATUS_LABELS, STATUS_COLORS } from "../../types";

interface StatusBadgeProps {
  status: SubmissionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_COLORS[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
