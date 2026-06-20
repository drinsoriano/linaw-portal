import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronUp, ChevronDown, FileUp,
  AlertCircle, Clock, Eye,
  CheckCircle2, RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSubmissions } from "../context/SubmissionsContext";
import { useToast } from "../context/ToastContext";
import { PageHeader } from "../components/shared/PageHeader";
import { ScoreBadge, ScoreBar } from "../components/shared/ScoreBadge";
import { StatusBadge } from "../components/shared/StatusBadge";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { indicators } from "../data/indicators";
import { barangays } from "../data/barangays";
import type { IndicatorCategory, SubmissionStatus } from "../types";
import { CATEGORY_LABELS } from "../types";
import { cn } from "../lib/utils";

const CATEGORY_KEYS: IndicatorCategory[] = [
  "SWM_PROGRAMS",
  "COMMITTEE",
  "WASTE_COLLECTION_FEES",
  "ENV_COMMUNITY_IMPACT",
];

const SCORE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Non-Compliant", color: "bg-red-500 border-red-500 text-white" },
  2: { label: "Minimally Compliant", color: "bg-orange-500 border-orange-500 text-white" },
  3: { label: "Partially Compliant", color: "bg-yellow-500 border-yellow-500 text-white" },
  4: { label: "Mostly Compliant", color: "bg-blue-500 border-blue-500 text-white" },
  5: { label: "Fully Compliant", color: "bg-green-500 border-green-500 text-white" },
};

const STATUS_TIMELINE: { status: SubmissionStatus; label: string; icon: typeof CheckCircle2 }[] = [
  { status: "DRAFT", label: "In Progress", icon: Clock },
  { status: "VALIDATED", label: "Finalized", icon: CheckCircle2 },
];

const STATUS_ORDER: SubmissionStatus[] = ["DRAFT", "VALIDATED"];

interface IndicatorState {
  score: number | null;
  notes: string;
}

export function AuditChecklistPage() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const { submissions, activeCycle, cycles, getLatest, captainApprove, updateSubmission, openNewCycle } = useSubmissions();
  const { toast } = useToast();

  const isCouncilor = hasRole("BARANGAY_COUNCILOR");
  const isCaptain = hasRole("BARANGAY_CAPTAIN");
  const isAdmin = hasRole("SYSTEM_ADMIN");

  const barangayId = user?.barangayId ?? "brgy-001";
  const submission = getLatest(barangayId);
  const brgy = barangays.find((b) => b.id === (submission?.barangayId ?? barangayId));

  const [localScores, setLocalScores] = useState<Record<string, IndicatorState>>(() => {
    const init: Record<string, IndicatorState> = {};
    indicators.forEach((ind) => {
      const resp = submission?.responses.find((r) => r.indicatorId === ind.id);
      init[ind.id] = { score: resp?.score ?? null, notes: resp?.notes ?? "" };
    });
    return init;
  });

  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<IndicatorCategory>("SWM_PROGRAMS");
  const [showNewCycleConfirm, setShowNewCycleConfirm] = useState(false);

  const activeCycleSubs = submissions.filter((s) => s.cycleId === activeCycle.id);
  const validatedCount = activeCycleSubs.filter((s) => s.status === "VALIDATED").length;
  const closedCycles = cycles.filter((c) => c.status === "CLOSED");

  const getProgress = (cat: IndicatorCategory) => {
    const catInds = indicators.filter((i) => i.category === cat);
    const answered = catInds.filter((i) => localScores[i.id]?.score !== null).length;
    return { answered, total: catInds.length, pct: Math.round((answered / catInds.length) * 100) };
  };

  const getCategoryAvg = (cat: IndicatorCategory) => {
    const catInds = indicators.filter((i) => i.category === cat);
    const scored = catInds.filter((i) => localScores[i.id]?.score !== null);
    if (scored.length === 0) return null;
    return scored.reduce((acc, i) => acc + (localScores[i.id]?.score ?? 0), 0) / scored.length;
  };

  const totalAnswered = Object.values(localScores).filter((s) => s.score !== null).length;
  const totalPct = Math.round((totalAnswered / indicators.length) * 100);

  const isEditing = isCaptain && submission?.status === "DRAFT";

  const timelineIndex = submission
    ? STATUS_ORDER.indexOf(submission.status === "VALIDATED" ? "VALIDATED" : "DRAFT")
    : 0;

  if (!submission) {
    return (
      <div className="space-y-6">
        <PageHeader title="LINAW Audit Checklist" subtitle="RA 9003 Compliance Self-Assessment" />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-400 text-sm">No audit submission found for this barangay.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFinalize = () => {
    captainApprove(submission.id, user?.name ?? "Punong Barangay");
    toast({ title: "Self-Assessment Finalized", description: "The RA 9003 audit has been certified and finalized by the Barangay Captain.", variant: "success" });
  };

  const handleReopen = () => {
    updateSubmission(submission.id, { status: "DRAFT", validatedAt: undefined, captainRemarks: undefined });
    toast({ title: "Self-Assessment Reopened", description: "The audit has been reset to Draft. You may edit scores and re-finalize.", variant: "info" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="LINAW Audit Checklist"
        subtitle={`${brgy?.name ?? ""} — ${activeCycle.label} · RA 9003 Self-Assessment`}
      >
        <StatusBadge status={submission.status} />

        {/* Captain — finalize self-assessment */}
        {isCaptain && isEditing && (
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleFinalize} disabled={totalPct < 100}>
            <CheckCircle2 className="h-4 w-4" />
            Finalize Self-Assessment
          </Button>
        )}

        {/* Captain — reopen for simulation / correction */}
        {isCaptain && submission.status === "VALIDATED" && (
          <Button size="sm" variant="outline" onClick={handleReopen}>
            <RefreshCw className="h-4 w-4" />
            Reopen
          </Button>
        )}
      </PageHeader>

      {/* Councilor read-only notice */}
      {isCouncilor && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700">
            The RA 9003 self-assessment is completed and certified by the Barangay Captain. You are viewing this form in read-only mode.
          </p>
        </div>
      )}

      {/* Admin — cycle management */}
      {isAdmin && (
        <Card className="border-indigo-200 bg-indigo-50/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Audit Cycle Management</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active: <span className="font-medium text-slate-700">{activeCycle.label}</span>
                  {" · "}
                  {validatedCount} / {activeCycleSubs.length} barangays validated
                </p>
              </div>
              {!showNewCycleConfirm ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={cycles.some((c) => c.year === activeCycle.year + 1)}
                  onClick={() => setShowNewCycleConfirm(true)}
                >
                  <RefreshCw className="h-4 w-4" />
                  Open {activeCycle.year + 1} Cycle
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs text-amber-700">
                    Open {activeCycle.year + 1} cycle? 54 blank audits will be created.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setShowNewCycleConfirm(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      openNewCycle(activeCycle.year + 1);
                      setShowNewCycleConfirm(false);
                      toast({ title: "New Cycle Opened", description: `${activeCycle.year + 1} Annual Audit cycle is now active. All 54 barangays start with a blank DRAFT.`, variant: "success" });
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              )}
            </div>
            {closedCycles.length > 0 && (
              <div className="pt-2 border-t border-indigo-100">
                <p className="text-xs font-semibold text-slate-500 mb-1.5">Past Cycles</p>
                <div className="flex flex-wrap gap-2">
                  {closedCycles.map((c) => (
                    <span key={c.id} className="text-[11px] bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-500">
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status timeline */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">Approval Status</p>
          <div className="flex items-center gap-0">
            {STATUS_TIMELINE.map((step, idx) => {
              const isDone = timelineIndex > idx;
              const isCurrent = timelineIndex === idx;
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center border-2",
                      isDone ? "bg-green-500 border-green-500" : isCurrent ? "bg-blue-500 border-blue-500" : "bg-white border-slate-300"
                    )}>
                      <Icon className={cn("h-4 w-4", isDone || isCurrent ? "text-white" : "text-slate-400")} />
                    </div>
                    <p className={cn("text-[10px] mt-1 font-medium text-center max-w-[70px]", isCurrent ? "text-blue-700" : isDone ? "text-green-700" : "text-slate-400")}>
                      {step.label}
                    </p>
                  </div>
                  {idx < STATUS_TIMELINE.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-1", isDone ? "bg-green-400" : "bg-slate-200")} />
                  )}
                </div>
              );
            })}
          </div>

          {submission.captainRemarks && submission.status === "VALIDATED" && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-800 mb-1">Validation Note:</p>
              <p className="text-xs text-green-700 leading-relaxed">{submission.captainRemarks}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-semibold text-slate-700">Overall Completion</p>
                <p className="text-sm font-bold text-slate-900">{totalAnswered} / {indicators.length} indicators</p>
              </div>
              <Progress value={totalPct} className="h-2" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{totalPct}%</p>
              <p className="text-xs text-slate-500">Complete</p>
            </div>
          </div>
          {isCaptain && isEditing && totalPct < 100 && (
            <p className="mt-2 text-xs text-amber-600">Score all {indicators.length} indicators to enable the Finalize button.</p>
          )}
        </CardContent>
      </Card>

      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as IndicatorCategory)}>
        <TabsList className="h-auto p-1 flex-wrap gap-1 bg-slate-100 w-full">
          {CATEGORY_KEYS.map((cat) => {
            const prog = getProgress(cat);
            const avg = getCategoryAvg(cat);
            return (
              <TabsTrigger
                key={cat}
                value={cat}
                className="flex-1 min-w-[180px] flex-col h-auto py-2 gap-0.5 data-[state=active]:bg-white"
              >
                <span className="text-xs font-semibold">{CATEGORY_LABELS[cat]}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500">{prog.answered}/{prog.total}</span>
                  {avg !== null && (
                    <span className={cn(
                      "text-[10px] font-bold",
                      avg >= 4.21 ? "text-green-700" : avg >= 3.41 ? "text-blue-700" : "text-yellow-700"
                    )}>
                      {avg.toFixed(2)}
                    </span>
                  )}
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CATEGORY_KEYS.map((cat) => {
          const catInds = indicators.filter((i) => i.category === cat).sort((a, b) => a.sortOrder - b.sortOrder);
          const avg = getCategoryAvg(cat);

          return (
            <TabsContent key={cat} value={cat} className="mt-4 space-y-3">
              {avg !== null && (
                <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-700">{CATEGORY_LABELS[cat]} Average</p>
                  <ScoreBadge score={avg} size="md" />
                </div>
              )}

              {catInds.map((ind) => {
                const state = localScores[ind.id];
                const isExpanded = expandedIndicator === ind.id;
                const isBelowBenchmark = state.score !== null && state.score < 4.21;
                const requiresCAP = state.score !== null && state.score < 3.41;
                const resp = submission.responses.find((r) => r.indicatorId === ind.id);

                return (
                  <Card key={ind.id} className={cn(
                    "transition-shadow",
                    requiresCAP && "border-red-200 bg-red-50/30",
                    isBelowBenchmark && !requiresCAP && "border-yellow-200"
                  )}>
                    <CardContent className="p-0">
                      <div
                        className="flex items-start gap-3 p-4 cursor-pointer"
                        onClick={() => setExpandedIndicator(isExpanded ? null : ind.id)}
                      >
                        <div className={cn(
                          "flex-shrink-0 rounded-lg px-2 py-1 text-xs font-bold",
                          state.score !== null ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                          {ind.code}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">{ind.name}</p>
                            {requiresCAP && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-red-700 bg-red-100 rounded-full px-2 py-0.5 font-semibold">
                                <AlertCircle className="h-2.5 w-2.5" /> CAP Required
                              </span>
                            )}
                          </div>
                          {state.score !== null && (
                            <ScoreBar score={state.score} className="mt-2 max-w-sm" />
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {state.score !== null ? (
                            <ScoreBadge score={state.score} size="sm" />
                          ) : (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Not scored
                            </span>
                          )}
                          {resp?.evidenceCount ? (
                            <span className="text-[10px] bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-semibold">
                              {resp.evidenceCount} files
                            </span>
                          ) : null}
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-100 p-4 space-y-4">
                          <p className="text-xs text-slate-600 leading-relaxed">{ind.description}</p>

                          {isEditing ? (
                            <div>
                              <p className="text-xs font-semibold text-slate-700 mb-2">Compliance Score</p>
                              <div className="flex gap-2 flex-wrap">
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <button
                                    key={score}
                                    onClick={() => setLocalScores((prev) => ({ ...prev, [ind.id]: { ...prev[ind.id], score } }))}
                                    className={cn(
                                      "flex flex-col items-center rounded-xl border-2 px-4 py-3 transition-all min-w-[100px]",
                                      state.score === score
                                        ? SCORE_LABELS[score].color + " shadow-md scale-105"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                    )}
                                  >
                                    <span className="text-xl font-bold">{score}</span>
                                    <span className="text-[10px] font-medium mt-0.5 text-center leading-tight">
                                      {SCORE_LABELS[score].label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                              <p className="text-xs text-slate-500">Compliance Score:</p>
                              {state.score ? <ScoreBadge score={state.score} size="sm" /> : <span className="text-xs text-slate-400">Not scored</span>}
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-semibold text-slate-700 mb-1.5">Field Notes / Remarks</p>
                            {isEditing ? (
                              <Textarea
                                value={state.notes}
                                onChange={(e) => setLocalScores((prev) => ({ ...prev, [ind.id]: { ...prev[ind.id], notes: e.target.value } }))}
                                placeholder="Enter field notes, observations, and remarks..."
                                className="text-xs min-h-[80px]"
                              />
                            ) : (
                              <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 min-h-[60px]">
                                {state.notes || <span className="text-slate-400 italic">No notes</span>}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold text-slate-700">Evidence Files</p>
                              <p className="text-xs text-slate-500">
                                {resp?.evidenceCount ? `${resp.evidenceCount} file(s) uploaded` : "No files uploaded"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {resp?.evidenceCount ? (
                                <Button variant="outline" size="sm" onClick={() => navigate("/evidence")}>
                                  <Eye className="h-3.5 w-3.5" /> View
                                </Button>
                              ) : null}
                              {isEditing && (
                                <Button variant="outline" size="sm">
                                  <FileUp className="h-3.5 w-3.5" /> Upload Evidence
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
