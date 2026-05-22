import { useState } from "react";
import { AlertTriangle, ChevronRight, Lightbulb } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/shared/PageHeader";
import { ScoreBadge } from "../components/shared/ScoreBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { mockCorrectiveActions } from "../data/correctiveActions";
import { cn } from "../lib/utils";
import type { FishboneFactor } from "../types";

const FISHBONE_FACTORS: { key: FishboneFactor; label: string; color: string; bg: string }[] = [
  { key: "MAN", label: "Man / People", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  { key: "MACHINE", label: "Machine / Equipment", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  { key: "METHOD", label: "Method / Process", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  { key: "MATERIAL", label: "Material / Resource", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  { key: "MEASUREMENT", label: "Measurement / Data", color: "text-cyan-700", bg: "bg-cyan-50 border-cyan-200" },
  { key: "ENVIRONMENT", label: "Environment / Policy", color: "text-red-700", bg: "bg-red-50 border-red-200" },
];

export function RootCauseAnalysisPage() {
  const { hasRole } = useAuth();
  const isEditable = hasRole("SYSTEM_ADMIN", "CENRO_EVALUATOR", "RESEARCHER");

  const [selectedCap, setSelectedCap] = useState(mockCorrectiveActions[0]);
  const [whyAnswers, setWhyAnswers] = useState<string[]>([
    selectedCap.why1 ?? "",
    selectedCap.why2 ?? "",
    selectedCap.why3 ?? "",
    selectedCap.why4 ?? "",
    selectedCap.why5 ?? "",
  ]);
  const [selectedFactor, setSelectedFactor] = useState<FishboneFactor | null>(selectedCap.fishboneFactor ?? null);

  const WHY_PROMPTS = [
    "Why is the indicator non-compliant or below benchmark?",
    "Why does that happen?",
    "Why does that occur?",
    "Why is that the case?",
    "What is the fundamental root cause?",
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Root Cause Analysis"
        subtitle="5-Whys and Fishbone (Ishikawa) analysis for flagged indicators"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Indicator selector */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">Flagged Indicators</h3>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {mockCorrectiveActions.map((cap) => (
              <button
                key={cap.id}
                onClick={() => {
                  setSelectedCap(cap);
                  setWhyAnswers([cap.why1 ?? "", cap.why2 ?? "", cap.why3 ?? "", cap.why4 ?? "", cap.why5 ?? ""]);
                  setSelectedFactor(cap.fishboneFactor ?? null);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0",
                  selectedCap.id === cap.id && "bg-red-50 border-l-2 border-red-500"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-800 bg-red-100 rounded px-1.5 py-0.5">
                      {cap.indicatorCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5 truncate">{cap.indicatorName}</p>
                </div>
                <ScoreBadge score={cap.score} size="sm" />
              </button>
            ))}
          </div>

          {/* Fishbone legend */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-700">Fishbone Categories</h4>
            {FISHBONE_FACTORS.map((f) => (
              <div
                key={f.key}
                className={cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5", f.bg,
                  selectedFactor === f.key && "ring-2 ring-offset-1 ring-slate-400"
                )}
              >
                <div className="h-2 w-2 rounded-full bg-current" style={{ color: f.color.replace("text-", "") }} />
                <span className={cn("text-xs font-medium", f.color)}>{f.label}</span>
                {selectedCap.fishboneFactor === f.key && (
                  <span className="ml-auto text-[10px] font-semibold text-slate-600">Selected</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Analysis workspace */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{selectedCap.indicatorCode} — {selectedCap.indicatorName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Score: <span className="font-semibold">{selectedCap.score}</span> — below 3.41 CAP threshold</p>
                </div>
                <ScoreBadge score={selectedCap.score} size="sm" />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="whywhy">
            <TabsList className="w-full">
              <TabsTrigger value="whywhy" className="flex-1">5-Why Analysis</TabsTrigger>
              <TabsTrigger value="fishbone" className="flex-1">Fishbone Diagram</TabsTrigger>
            </TabsList>

            {/* 5-Why */}
            <TabsContent value="whywhy">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">5-Why Root Cause Analysis</CardTitle>
                  <CardDescription>Ask "Why?" 5 times to reach the fundamental root cause</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {WHY_PROMPTS.map((prompt, idx) => {
                    const isUnlocked = idx === 0 || whyAnswers[idx - 1].trim().length > 0;
                    const isLast = idx === 4;
                    return (
                      <div key={idx} className={cn("relative", !isUnlocked && "opacity-40 pointer-events-none")}>
                        {idx < 4 && (
                          <div className="absolute left-4 top-full w-0.5 h-4 bg-slate-200 z-10" />
                        )}
                        <div className={cn("rounded-xl border p-3", isLast ? "border-amber-200 bg-amber-50" : "border-slate-200")}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={cn(
                              "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0",
                              isLast ? "bg-amber-600" : "bg-slate-700"
                            )}>
                              {idx + 1}
                            </div>
                            <p className={cn("text-xs font-semibold", isLast ? "text-amber-800" : "text-slate-700")}>
                              Why {idx + 1}: {isLast ? "Root Cause" : ""}
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-500 mb-2 italic">{prompt}</p>
                          {!isEditable ? (
                            <p className="text-xs text-slate-700 bg-white rounded-lg p-2.5 border border-slate-200 min-h-[50px]">
                              {whyAnswers[idx] || <span className="text-slate-400">Not answered</span>}
                            </p>
                          ) : (
                            <Textarea
                              value={whyAnswers[idx]}
                              onChange={(e) => {
                                const updated = [...whyAnswers];
                                updated[idx] = e.target.value;
                                setWhyAnswers(updated);
                              }}
                              placeholder={idx === 0 ? "Start with the most visible problem..." : "Why does that happen?"}
                              className={cn("text-xs min-h-[64px]", isLast && "border-amber-300 focus-visible:ring-amber-400")}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Root cause summary */}
                  {selectedCap.rootCause && (
                    <div className="flex gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                      <Lightbulb className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-green-800">Identified Root Cause</p>
                        <p className="text-xs text-green-900 mt-1">{selectedCap.rootCause}</p>
                      </div>
                    </div>
                  )}

                  {isEditable && (
                    <Button className="w-full">
                      <ChevronRight className="h-4 w-4" />
                      Save Analysis & Proceed to Action Plan
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fishbone */}
            <TabsContent value="fishbone">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Fishbone (Ishikawa) Diagram</CardTitle>
                  <CardDescription>Categorize root causes by contributing factor</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Central problem */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-red-600 text-white rounded-xl px-4 py-3 text-center max-w-xs">
                      <p className="text-xs font-bold">{selectedCap.indicatorCode}</p>
                      <p className="text-[10px] mt-0.5">{selectedCap.indicatorName}</p>
                      <p className="text-xs font-black mt-1">Score: {selectedCap.score}</p>
                    </div>
                  </div>

                  {/* Factor grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {FISHBONE_FACTORS.map((factor) => {
                      const isActualFactor = selectedCap.fishboneFactor === factor.key;
                      return (
                        <button
                          key={factor.key}
                          onClick={() => isEditable && setSelectedFactor(factor.key)}
                          className={cn(
                            "rounded-xl border p-3 text-left transition-all",
                            factor.bg,
                            isActualFactor && "ring-2 ring-offset-1 ring-slate-500 shadow-md",
                            !isEditable && "cursor-default"
                          )}
                        >
                          <p className={cn("text-xs font-bold", factor.color)}>{factor.label}</p>
                          {isActualFactor && selectedCap.fishboneDetail && (
                            <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                              {selectedCap.fishboneDetail}
                            </p>
                          )}
                          {isActualFactor && (
                            <span className="inline-block mt-2 text-[10px] font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                              ✓ Root Factor
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isEditable && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-slate-700 mb-1.5">Detail / Specific Contributing Factor</p>
                      <Textarea
                        defaultValue={selectedCap.fishboneDetail}
                        placeholder="Describe the specific contributing factor for the selected category..."
                        className="text-xs"
                      />
                      <Button className="mt-3">
                        Save Fishbone Analysis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
