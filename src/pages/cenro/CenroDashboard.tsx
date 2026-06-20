import { useNavigate } from "react-router-dom";
import {
  Building2, CheckCircle2, TrendingUp, AlertTriangle,
  ClipboardList, MessageSquare, BarChart3, FileText,
} from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { StatCard } from "../../components/shared/StatCard";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { ScoreBadge } from "../../components/shared/ScoreBadge";
import { BarangayScoreChart } from "../../components/charts/BarangayScoreChart";
import { CategoryRadarChart } from "../../components/charts/CategoryRadarChart";
import { ComplianceTrendChart } from "../../components/charts/ComplianceTrendChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { barangays } from "../../data/barangays";
import { submissions, cityStats, trendData } from "../../data/submissions";
import { useEca } from "../../context/EcaContext";
import { useFeedback } from "../../context/FeedbackContext";
import { CATEGORY_SHORT } from "../../types";

const CITY_CATEGORY_AVERAGES = {
  SWM_PROGRAMS: 3.72,
  COMMITTEE: 3.89,
  WASTE_COLLECTION_FEES: 3.58,
  ENV_COMMUNITY_IMPACT: 3.61,
};

const radarData = Object.entries(CATEGORY_SHORT).map(([key, label]) => ({
  category: label,
  score: CITY_CATEGORY_AVERAGES[key as keyof typeof CITY_CATEGORY_AVERAGES],
  benchmark: 4.21,
}));

export function CenroDashboard() {
  const navigate = useNavigate();
  const { reports } = useEca();
  const { feedbacks } = useFeedback();

  const chartData = submissions
    .filter((s) => s.overallScore !== undefined)
    .sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))
    .map((s) => {
      const brgy = barangays.find((b) => b.id === s.barangayId);
      return { name: brgy?.name ?? s.barangayId, score: s.overallScore ?? 0, status: s.status };
    });

  const recentSubs = submissions
    .filter((s) => s.status !== "DRAFT")
    .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))
    .slice(0, 8);

  const ecaAccepted = reports.filter((r) => r.status === "ACCEPTED").length;
  const ecaPending = reports.filter((r) => r.status === "PENDING" || r.status === "SUBMITTED").length;
  const ecaOverdue = reports.filter((r) => r.status === "OVERDUE").length;
  const ecaForRevision = reports.filter((r) => r.status === "FOR_REVISION").length;

  const openFeedbacks = feedbacks.filter((f) => f.status !== "COMPLETED").length;
  const criticalFeedbacks = feedbacks.filter((f) => f.priority === "CRITICAL" || f.priority === "HIGH").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="City-Wide Compliance Dashboard"
        subtitle="Calamba City RA 9003 — CENRO Overview · 2025 First Semester"
      >
        <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </PageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Barangays"
          value={cityStats.totalBarangays}
          subtitle="Calamba City, Laguna"
          icon={Building2}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Validated"
          value={cityStats.validated}
          subtitle={`${Math.round((cityStats.validated / 54) * 100)}% audit completion`}
          icon={CheckCircle2}
          iconColor="text-green-600"
          iconBg="bg-green-100"
          trend={{ value: 8, label: "vs last semester", positive: true }}
        />
        <StatCard
          title="City Average Score"
          value={cityStats.cityAverage.toFixed(2)}
          subtitle="Overall compliance score"
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
          valueColor={cityStats.cityAverage >= 4.21 ? "text-green-700" : "text-blue-700"}
          trend={{ value: 5.2, label: "vs 2024 S2", positive: true }}
        />
        <StatCard
          title="Fully Compliant"
          value={`${cityStats.fullyCompliant} / ${cityStats.totalBarangays}`}
          subtitle="Score ≥ 4.21 benchmark"
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
        />
      </div>

      {/* Module summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/cenro/eca-tracker")}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-green-700" />
            </div>
            <p className="text-sm font-semibold text-slate-700">ECA Reports</p>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-green-700 font-semibold">{ecaAccepted} Accepted</span>
            <span className="text-blue-700 font-semibold">{ecaPending} Pending</span>
            <span className="text-amber-700 font-semibold">{ecaForRevision} For Revision</span>
            <span className="text-red-700 font-semibold">{ecaOverdue} Overdue</span>
          </div>
        </div>

        <div
          className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/cenro/feedback")}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-amber-700" />
            </div>
            <p className="text-sm font-semibold text-slate-700">CENRO Feedback</p>
          </div>
          <div className="space-y-1 text-xs">
            <p className="text-slate-900 font-semibold">{openFeedbacks} open feedback items</p>
            <p className="text-red-700 font-semibold">{criticalFeedbacks} high/critical priority</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-blue-700" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Compliance Distribution</p>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-green-700 font-semibold">{cityStats.fullyCompliant} Fully</span>
            <span className="text-blue-700 font-semibold">{cityStats.mostlyCompliant} Mostly</span>
            <span className="text-yellow-700 font-semibold">{cityStats.partiallyCompliant} Partial</span>
            <span className="text-slate-600 font-semibold">{cityStats.draft + cityStats.submitted} Pending</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-purple-700" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Submission Status</p>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-green-700 font-semibold">{cityStats.validated} Validated</span>
            <span className="text-purple-700 font-semibold">{cityStats.reviewed} Reviewed</span>
            <span className="text-blue-700 font-semibold">{cityStats.submitted} Submitted</span>
            <span className="text-slate-600 font-semibold">{cityStats.draft} Draft</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Barangay Compliance Scores</CardTitle>
            <CardDescription>
              {chartData.length} barangays sorted by score. Dashed lines: benchmark (4.21) and CAP threshold (3.41).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <BarangayScoreChart data={chartData} height={300} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Breakdown</CardTitle>
            <CardDescription>City average per category vs. 4.21 benchmark</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <CategoryRadarChart data={radarData} height={280} />
          </CardContent>
        </Card>
      </div>

      {/* Trend + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Compliance Trend</CardTitle>
            <CardDescription>City average score across audit cycles</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ComplianceTrendChart data={trendData} height={250} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest submission updates</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {recentSubs.map((sub) => {
                const brgy = barangays.find((b) => b.id === sub.barangayId);
                return (
                  <li
                    key={sub.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                    onClick={() => navigate(`/results/${sub.id}`)}
                  >
                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-4 w-4 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{brgy?.name}</p>
                      <StatusBadge status={sub.status} />
                    </div>
                    {sub.overallScore && (
                      <ScoreBadge score={sub.overallScore} size="sm" />
                    )}
                  </li>
                );
              })}
            </ul>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full text-xs text-slate-500"
              onClick={() => navigate("/cenro/ranking")}
            >
              View full ranking →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
