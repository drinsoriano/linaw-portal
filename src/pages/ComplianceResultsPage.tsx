import { useState } from "react";
import { Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/shared/PageHeader";
import { ScoreBadge, ScoreBar } from "../components/shared/ScoreBadge";
import { StatusBadge } from "../components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { indicators } from "../data/indicators";
import { submissions } from "../data/submissions";
import { barangays } from "../data/barangays";
import { IndicatorBarChart } from "../components/charts/IndicatorBarChart";
import { CategoryRadarChart } from "../components/charts/CategoryRadarChart";
import { CATEGORY_LABELS, CATEGORY_SHORT } from "../types";
import type { IndicatorCategory } from "../types";
import { cn } from "../lib/utils";

const CATEGORY_KEYS: IndicatorCategory[] = [
  "SWM_PROGRAMS",
  "COMMITTEE",
  "WASTE_COLLECTION_FEES",
  "ENV_COMMUNITY_IMPACT",
];

export function ComplianceResultsPage() {
  const { hasRole } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState<string>("brgy-001");
  const [view, setView] = useState<"barangay" | "city">(
    hasRole("CENRO_EVALUATOR", "SYSTEM_ADMIN", "RESEARCHER") ? "city" : "barangay"
  );

  const validatedSubs = submissions.filter((s) => s.overallScore !== undefined);
  const selectedSub = submissions.find((s) => s.barangayId === selectedBarangay) ?? submissions[0];
  const brgy = barangays.find((b) => b.id === selectedSub.barangayId);

  const filteredBarangays = barangays.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  // Build indicator data for the selected submission
  const buildIndicatorData = (cat: IndicatorCategory) => {
    const catInds = indicators.filter((i) => i.category === cat).sort((a, b) => a.sortOrder - b.sortOrder);
    return catInds.map((ind) => {
      const resp = selectedSub.responses.find((r) => r.indicatorId === ind.id);
      const score = resp?.cenroScore ?? resp?.score ?? 0;
      return { code: ind.code, name: ind.name, score };
    });
  };

  // Radar data for selected barangay
  const radarData = CATEGORY_KEYS.map((cat) => ({
    category: CATEGORY_SHORT[cat],
    score: selectedSub.categoryScores?.[cat] ?? 0,
    benchmark: 4.21,
  }));

  // City-wide indicator averages
  const cityIndicatorAvgs = indicators.map((ind) => {
    const scores = validatedSubs
      .map((s) => {
        const r = s.responses.find((r2) => r2.indicatorId === ind.id);
        return r?.cenroScore ?? r?.score ?? null;
      })
      .filter((s): s is number => s !== null);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { code: ind.code, name: ind.name, score: parseFloat(avg.toFixed(2)), category: ind.category };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance Results"
        subtitle="RA 9003 compliance scores by indicator and category"
      >
        {hasRole("CENRO_EVALUATOR", "SYSTEM_ADMIN", "RESEARCHER") && (
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setView("barangay")}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors", view === "barangay" ? "bg-[#16a34a] text-white" : "bg-white text-slate-600 hover:bg-slate-50")}
            >
              Barangay View
            </button>
            <button
              onClick={() => setView("city")}
              className={cn("px-3 py-1.5 text-xs font-medium transition-colors border-l border-slate-200", view === "city" ? "bg-[#16a34a] text-white" : "bg-white text-slate-600 hover:bg-slate-50")}
            >
              City-Wide View
            </button>
          </div>
        )}
      </PageHeader>

      {view === "barangay" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Barangay selector */}
          {hasRole("CENRO_EVALUATOR", "SYSTEM_ADMIN", "RESEARCHER") && (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9" />
              </div>
              <div className="bg-white rounded-xl border border-slate-200 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
                {filteredBarangays.map((b) => {
                  const sub = submissions.find((s) => s.barangayId === b.id);
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBarangay(b.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0",
                        selectedBarangay === b.id && "bg-green-50 border-l-2 border-[#16a34a]"
                      )}
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{b.name}</p>
                        <p className="text-[10px] text-slate-400">{b.district}</p>
                      </div>
                      {sub?.overallScore ? (
                        <span className={cn("text-xs font-bold",
                          sub.overallScore >= 4.21 ? "text-green-700" : sub.overallScore >= 3.41 ? "text-blue-700" : "text-yellow-700"
                        )}>
                          {sub.overallScore.toFixed(2)}
                        </span>
                      ) : (
                        <StatusBadge status={sub?.status ?? "DRAFT"} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detail */}
          <div className={cn("space-y-5", hasRole("CENRO_EVALUATOR", "SYSTEM_ADMIN", "RESEARCHER") ? "lg:col-span-3" : "col-span-4")}>
            {/* Header */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{brgy?.name}</h2>
                    <p className="text-sm text-slate-500">{brgy?.district} · 2025 First Semester</p>
                    <div className="flex items-center gap-3 mt-3">
                      <StatusBadge status={selectedSub.status} />
                      {selectedSub.overallScore && <ScoreBadge score={selectedSub.overallScore} size="lg" />}
                    </div>
                  </div>
                  <div className="text-right">
                    {selectedSub.overallScore && (
                      <>
                        <p className="text-4xl font-black text-slate-900">{selectedSub.overallScore.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">Overall Score / 5.00</p>
                        <p className={cn("text-xs font-medium mt-1",
                          selectedSub.overallScore >= 4.21 ? "text-green-600" : "text-amber-600"
                        )}>
                          {selectedSub.overallScore >= 4.21 ? "✓ Meets benchmark" : `↓ ${(4.21 - selectedSub.overallScore).toFixed(2)} below benchmark`}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Category scores */}
                {selectedSub.categoryScores && (
                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CATEGORY_KEYS.map((cat) => {
                      const score = selectedSub.categoryScores?.[cat] ?? 0;
                      return (
                        <div key={cat} className="bg-slate-50 rounded-xl p-3">
                          <p className="text-[10px] text-slate-500 font-medium">{CATEGORY_SHORT[cat]}</p>
                          <p className="text-lg font-black text-slate-900 mt-1">{score.toFixed(2)}</p>
                          <ScoreBar score={score} showLabel={false} className="mt-1.5" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Radar + per-category bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Category Radar</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CategoryRadarChart data={radarData} height={250} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Flagged Indicators</CardTitle>
                  <CardDescription>Indicators below 4.21 benchmark</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                    {selectedSub.responses
                      .filter((r) => (r.cenroScore ?? r.score ?? 0) < 4.21 && (r.cenroScore ?? r.score ?? 0) > 0)
                      .sort((a, b) => (a.cenroScore ?? a.score ?? 0) - (b.cenroScore ?? b.score ?? 0))
                      .slice(0, 12)
                      .map((r) => {
                        const ind = indicators.find((i) => i.id === r.indicatorId);
                        const score = r.cenroScore ?? r.score ?? 0;
                        return (
                          <div key={r.indicatorId} className="flex items-center gap-2">
                            <span className={cn("text-[10px] font-bold rounded px-1.5 py-0.5 flex-shrink-0",
                              score < 3.41 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                            )}>
                              {ind?.code}
                            </span>
                            <ScoreBar score={score} className="flex-1" />
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Per-category indicator charts */}
            <Tabs defaultValue="SWM_PROGRAMS">
              <TabsList className="w-full">
                {CATEGORY_KEYS.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="flex-1 text-xs">
                    {CATEGORY_SHORT[cat]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {CATEGORY_KEYS.map((cat) => (
                <TabsContent key={cat} value={cat}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">{CATEGORY_LABELS[cat]}</CardTitle>
                      <CardDescription>Indicator scores vs. 4.21 benchmark</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <IndicatorBarChart data={buildIndicatorData(cat)} height={indicators.filter((i) => i.category === cat).length * 36} />
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      ) : (
        /* City-wide view */
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORY_KEYS.map((cat) => {
              const catData = cityIndicatorAvgs.filter((d) => d.category === cat);
              const avg = catData.reduce((a, b) => a + b.score, 0) / catData.length;
              return (
                <Card key={cat}>
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500 font-medium">{CATEGORY_SHORT[cat]}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{avg.toFixed(2)}</p>
                    <ScoreBar score={avg} showLabel={false} className="mt-2" />
                    <ScoreBadge score={avg} showScore={false} size="sm" className="mt-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {CATEGORY_KEYS.map((cat) => {
            const catData = cityIndicatorAvgs.filter((d) => d.category === cat);
            return (
              <Card key={cat}>
                <CardHeader>
                  <CardTitle className="text-sm">{CATEGORY_LABELS[cat]}</CardTitle>
                  <CardDescription>City-wide average per indicator — {validatedSubs.length} validated barangays</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <IndicatorBarChart data={catData} height={catData.length * 40} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
