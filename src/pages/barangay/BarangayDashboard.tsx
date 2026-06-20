import { useNavigate } from "react-router-dom";
import {
  ClipboardList, MessageSquare, Recycle, Truck,
  BookOpen, ArrowRight, TrendingUp,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { ScoreBadge, ScoreBar } from "../../components/shared/ScoreBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { barangays } from "../../data/barangays";
import { submissions } from "../../data/submissions";
import { mockRecyclers } from "../../data/recyclers";
import { useEca } from "../../context/EcaContext";
import { useFeedback } from "../../context/FeedbackContext";
import { CATEGORY_LABELS, ECA_STATUS_COLORS, ECA_STATUS_LABELS } from "../../types";
import { cn } from "../../lib/utils";

export function BarangayDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getLatest } = useEca();
  const { getByBarangay } = useFeedback();

  const barangayId = user?.barangayId ?? "brgy-001";
  const brgy = barangays.find((b) => b.id === barangayId);
  const submission = submissions.find((s) => s.barangayId === barangayId);
  const latestEca = getLatest(barangayId);
  const feedbacks = getByBarangay(barangayId);
  const openFeedbacks = feedbacks.filter((f) => f.status !== "COMPLETED").length;
  const criticalFeedbacks = feedbacks.filter((f) => f.priority === "CRITICAL" || f.priority === "HIGH").length;

  const recyclers = mockRecyclers.filter((r) => r.barangayId === barangayId && r.isActive);
  const totalRecyclerKg = recyclers.reduce((s, r) => s + r.monthlyKg, 0);

  const score = submission?.overallScore;
  const categoryScores = submission?.categoryScores;

  return (
    <div className="space-y-6">
      <PageHeader
        title={brgy?.name ?? "My Barangay"}
        subtitle={`${brgy?.district ?? ""} · Compliance Overview · 2025 First Semester`}
      >
        <Button size="sm" onClick={() => navigate("/barangay/eca")}>
          <BookOpen className="h-4 w-4" />
          Submit ECA
        </Button>
        <Button size="sm" variant="outline" onClick={() => navigate("/audit")}>
          <ClipboardList className="h-4 w-4" />
          RA 9003 Audit
        </Button>
      </PageHeader>

      {/* Score + ECA row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall score */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Overall Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            {score !== undefined ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <ScoreBadge score={score} size="lg" />
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Benchmark</p>
                    <p className="text-sm font-semibold text-slate-700">4.21</p>
                  </div>
                </div>
                <ScoreBar score={score} />
                <p className={cn(
                  "text-xs font-medium",
                  score >= 4.21 ? "text-green-700" : score >= 3.41 ? "text-blue-700" : "text-red-700"
                )}>
                  {score >= 4.21 ? "✓ Meets benchmark" : score >= 3.41 ? "Below benchmark — monitor" : "⚠ CAP required"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No validated score yet</p>
            )}
          </CardContent>
        </Card>

        {/* ECA status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Latest ECA Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestEca ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Q{latestEca.quarter} {latestEca.year}</span>
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", ECA_STATUS_COLORS[latestEca.status])}>
                    {ECA_STATUS_LABELS[latestEca.status]}
                  </span>
                </div>
                {latestEca.cenroFeedback && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 leading-relaxed">
                    CENRO: {latestEca.cenroFeedback.slice(0, 100)}{latestEca.cenroFeedback.length > 100 ? "..." : ""}
                  </p>
                )}
                <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/barangay/eca")}>
                  View / Edit ECA
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-slate-400 mb-2">No ECA submitted yet</p>
                <Button size="sm" onClick={() => navigate("/barangay/eca")}>Start Q3 ECA</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CENRO Feedback */}
        <Card className={cn(criticalFeedbacks > 0 && "border-red-200")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber-600" />
              CENRO Feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-900">{openFeedbacks}</span>
              <span className="text-xs text-slate-500">open items</span>
            </div>
            {criticalFeedbacks > 0 && (
              <p className="text-xs text-red-700 bg-red-50 rounded-lg px-2 py-1.5 font-medium">
                {criticalFeedbacks} high/critical priority — action needed
              </p>
            )}
            <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/barangay/feedback")}>
              View All Feedback
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Category scores */}
      {categoryScores && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.entries(categoryScores) as [keyof typeof categoryScores, number][]).map(([cat, catScore]) => (
                <div key={cat} className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600">{CATEGORY_LABELS[cat]}</p>
                  <ScoreBadge score={catScore} size="sm" />
                  <ScoreBar score={catScore} />
                  {catScore < 4.21 && (
                    <p className="text-[10px] text-amber-600">-{(4.21 - catScore).toFixed(2)} to benchmark</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div
          className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-sm transition-shadow"
          onClick={() => navigate("/barangay/recyclers")}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Recycle className="h-4 w-4 text-green-700" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Recycler Registry</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{recyclers.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalRecyclerKg.toLocaleString()} kg/month total
          </p>
        </div>

        <div
          className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-sm transition-shadow"
          onClick={() => navigate("/barangay/collection")}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-blue-700" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Collection Monitoring</p>
          </div>
          <p className="text-xs text-slate-500">3x/week schedule</p>
          <p className="text-xs text-slate-400">View logs →</p>
        </div>

        <div
          className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-sm transition-shadow"
          onClick={() => navigate("/barangay/financial")}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-700" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Financial Summary</p>
          </div>
          <p className="text-xs text-slate-500">Fee collection & recycling income</p>
          <p className="text-xs text-slate-400">View records →</p>
        </div>
      </div>
    </div>
  );
}
