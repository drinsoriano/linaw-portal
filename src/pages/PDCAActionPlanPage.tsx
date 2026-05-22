import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, ArrowRight,
  Plus, User, Calendar, ChevronDown, ChevronUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/shared/PageHeader";
import { ScoreBadge } from "../components/shared/ScoreBadge";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { mockCorrectiveActions } from "../data/correctiveActions";
import { submissions } from "../data/submissions";
import { indicators } from "../data/indicators";
import { effectiveScore } from "../lib/scoring";
import { cn } from "../lib/utils";

const CAP_STATUS_CONFIG = {
  OPEN: { label: "Open", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: Clock },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  OVERDUE: { label: "Overdue", color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
};

const PDCA_PHASES = [
  {
    phase: "PLAN",
    color: "bg-blue-600",
    lightBg: "bg-blue-50",
    border: "border-blue-200",
    textColor: "text-blue-800",
    description: "Identify compliance gaps and plan corrective interventions",
    actions: ["Review indicator scores below 4.21", "Identify root causes", "Define target outcomes", "Allocate resources and assign owners"],
  },
  {
    phase: "DO",
    color: "bg-green-600",
    lightBg: "bg-green-50",
    border: "border-green-200",
    textColor: "text-green-800",
    description: "Implement planned interventions at the barangay level",
    actions: ["Execute IEC campaigns", "Procure SWM equipment", "Conduct trainings", "Formalize committee roles"],
  },
  {
    phase: "CHECK",
    color: "bg-amber-600",
    lightBg: "bg-amber-50",
    border: "border-amber-200",
    textColor: "text-amber-800",
    description: "Monitor progress and measure effectiveness of interventions",
    actions: ["Re-audit flagged indicators", "Compare before/after scores", "Review field evidence", "Validate with CENRO"],
  },
  {
    phase: "ACT",
    color: "bg-purple-600",
    lightBg: "bg-purple-50",
    border: "border-purple-200",
    textColor: "text-purple-800",
    description: "Standardize successful practices and address remaining gaps",
    actions: ["Update barangay SWM ordinance", "Institutionalize best practices", "Close completed CAPs", "Plan next audit cycle"],
  },
];

export function PDCAActionPlanPage() {
  const { user, hasRole } = useAuth();
  const [expandedCap, setExpandedCap] = useState<string | null>("cap-001");
  const [, setShowAddModal] = useState(false);

  const isEditable = hasRole("SYSTEM_ADMIN", "CENRO_EVALUATOR", "BARANGAY_CAPTAIN");
  const barangayName = user?.barangayName ?? "Bagong Kalsada";

  const sub = submissions.find((s) => s.barangayId === (user?.barangayId ?? "brgy-001")) ?? submissions[0];
  const isValidated = sub.status === "VALIDATED_BY_CENRO";
  const flaggedIndicators = sub.responses
    .filter((r) => { const s = effectiveScore(r, isValidated) ?? 0; return s < 3.41 && s > 0; })
    .map((r) => {
      const ind = indicators.find((i) => i.id === r.indicatorId);
      return { ...r, indicator: ind, score: effectiveScore(r, isValidated) ?? 0 };
    })
    .sort((a, b) => a.score - b.score);

  const capStats = {
    open: mockCorrectiveActions.filter((c) => c.status === "OPEN").length,
    inProgress: mockCorrectiveActions.filter((c) => c.status === "IN_PROGRESS").length,
    completed: mockCorrectiveActions.filter((c) => c.status === "COMPLETED").length,
    overdue: mockCorrectiveActions.filter((c) => c.status === "OVERDUE").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="PDCA Action Plan"
        subtitle={`${barangayName} — Corrective actions for indicators below 3.41`}
      >
        {isEditable && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Add Action Item
          </Button>
        )}
      </PageHeader>

      {/* PDCA cycle visual */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PDCA_PHASES.map((phase, idx) => (
          <div key={phase.phase} className={cn("rounded-xl border p-4 relative", phase.lightBg, phase.border)}>
            <div className={cn("inline-flex h-7 w-7 rounded-full items-center justify-center text-white text-xs font-bold mb-2", phase.color)}>
              {idx + 1}
            </div>
            <p className={cn("text-base font-black", phase.textColor)}>{phase.phase}</p>
            <p className="text-xs text-slate-600 mt-1 leading-snug">{phase.description}</p>
            <ul className="mt-2 space-y-0.5">
              {phase.actions.map((a) => (
                <li key={a} className="flex items-start gap-1.5 text-[10px] text-slate-600">
                  <ArrowRight className="h-2.5 w-2.5 mt-0.5 flex-shrink-0 text-slate-400" />
                  {a}
                </li>
              ))}
            </ul>
            {idx < 3 && (
              <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 text-slate-400">
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CAP stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Open", value: capStats.open, color: "text-red-700 bg-red-50 border-red-200" },
          { label: "In Progress", value: capStats.inProgress, color: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Completed", value: capStats.completed, color: "text-green-700 bg-green-50 border-green-200" },
          { label: "Overdue", value: capStats.overdue, color: "text-orange-700 bg-orange-50 border-orange-200" },
        ].map((item) => (
          <div key={item.label} className={cn("rounded-xl border p-4 text-center", item.color)}>
            <p className="text-3xl font-black">{item.value}</p>
            <p className="text-sm font-medium mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flagged indicators */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 text-sm">Flagged Indicators (CAP Required)</h3>
          {flaggedIndicators.length === 0 ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />
                <p className="text-sm font-medium text-green-800 mt-2">No indicators below 3.41</p>
              </CardContent>
            </Card>
          ) : (
            flaggedIndicators.map((item) => {
              const hasCap = mockCorrectiveActions.some((c) => c.indicatorId === item.indicatorId);
              return (
                <div
                  key={item.indicatorId}
                  className="bg-white rounded-xl border border-red-200 p-3 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-800 bg-red-100 rounded px-1.5 py-0.5">
                          {item.indicator?.code}
                        </span>
                        {hasCap && (
                          <span className="text-[10px] text-green-700 bg-green-100 rounded-full px-1.5 py-0.5 font-semibold">
                            CAP Added
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 mt-1">{item.indicator?.name}</p>
                    </div>
                    <ScoreBadge score={item.score} size="sm" />
                  </div>
                  {!hasCap && isEditable && (
                    <Button size="sm" variant="outline" className="mt-2 w-full h-7 text-xs border-red-200 text-red-700">
                      <Plus className="h-3 w-3" />
                      Create CAP
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* CAP list */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-semibold text-slate-900 text-sm">Corrective Action Plans</h3>
          {mockCorrectiveActions.map((cap) => {
            const config = CAP_STATUS_CONFIG[cap.status];
            const StatusIcon = config.icon;
            const isExpanded = expandedCap === cap.id;

            return (
              <Card key={cap.id} className="overflow-hidden">
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpandedCap(isExpanded ? null : cap.id)}
                >
                  <div className={cn("rounded-lg p-2 flex-shrink-0", config.color)}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">{cap.indicatorCode}</span>
                      <span className="text-xs text-slate-600">{cap.indicatorName}</span>
                      <ScoreBadge score={cap.score} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{cap.actionPlan}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{cap.owner}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />{cap.targetDate}</span>
                      <span className={cn("px-1.5 py-0.5 rounded-full font-semibold", config.color)}>{config.label}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />}
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50">
                    {/* Why-Why summary */}
                    {cap.why1 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-2">Why-Why Analysis</p>
                        <div className="space-y-1.5">
                          {[cap.why1, cap.why2, cap.why3, cap.why4, cap.why5].filter(Boolean).map((why, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[10px] font-bold text-slate-500 bg-white rounded-full h-4 w-4 flex items-center justify-center flex-shrink-0 border border-slate-200">
                                {i + 1}
                              </span>
                              <p className="text-xs text-slate-600">{why}</p>
                            </div>
                          ))}
                        </div>
                        {cap.rootCause && (
                          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                            <p className="text-[10px] font-semibold text-amber-800">Root Cause</p>
                            <p className="text-xs text-amber-900 mt-0.5">{cap.rootCause}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action plan */}
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-1">Action Plan</p>
                      <p className="text-xs text-slate-600 bg-white rounded-lg p-2.5 border border-slate-200">
                        {cap.actionPlan}
                      </p>
                    </div>

                    {cap.progressNotes && (
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1">Progress Notes</p>
                        <p className="text-xs text-slate-600 bg-white rounded-lg p-2.5 border border-slate-200">
                          {cap.progressNotes}
                        </p>
                      </div>
                    )}

                    {isEditable && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs h-7">Update Status</Button>
                        <Button size="sm" className="text-xs h-7">
                          <CheckCircle2 className="h-3 w-3" />
                          Mark Complete
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
