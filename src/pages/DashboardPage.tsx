// no useState needed — all data is derived from imports
import {
  Building2, CheckCircle2, TrendingUp, AlertTriangle,
  BarChart3, FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/shared/PageHeader";
import { StatCard } from "../components/shared/StatCard";
import { StatusBadge } from "../components/shared/StatusBadge";
import { ScoreBadge } from "../components/shared/ScoreBadge";
import { BarangayScoreChart } from "../components/charts/BarangayScoreChart";
import { CategoryRadarChart } from "../components/charts/CategoryRadarChart";
import { ComplianceTrendChart } from "../components/charts/ComplianceTrendChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { barangays } from "../data/barangays";
import { submissions, cityStats, trendData } from "../data/submissions";
import { useNavigate } from "react-router-dom";
import { finalOverallScore } from "../lib/scoring";
import { CATEGORY_SHORT } from "../types";

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

export function DashboardPage() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const isPublic = hasRole("CITIZEN");

  // Build barangay score chart data
  const chartData = submissions
    .filter((s) => finalOverallScore(s) !== undefined)
    .sort((a, b) => (finalOverallScore(b) ?? 0) - (finalOverallScore(a) ?? 0))
    .map((s) => {
      const brgy = barangays.find((b) => b.id === s.barangayId);
      return {
        name: brgy?.name ?? s.barangayId,
        score: finalOverallScore(s) ?? 0,
        status: s.status,
      };
    });

  // Recent submissions
  const recentSubs = submissions
    .filter((s) => s.status !== "DRAFT")
    .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          isPublic
            ? "Public Compliance Dashboard"
            : user?.role === "BARANGAY_SECRETARY" || user?.role === "BARANGAY_COUNCILOR" || user?.role === "BARANGAY_CAPTAIN"
            ? `${user.barangayName} — Compliance Overview`
            : "City-Wide Compliance Dashboard"
        }
        subtitle="Calamba City RA 9003 Compliance Monitoring — 2025 First Semester"
      >
        {!isPublic && (
          <Button variant="outline" size="sm" onClick={() => navigate("/reports")}>
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        )}
      </PageHeader>

      {/* KPI Cards */}
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
          subtitle={`${Math.round((cityStats.validated / 54) * 100)}% completion`}
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
          valueColor={
            cityStats.cityAverage >= 4.21
              ? "text-green-700"
              : cityStats.cityAverage >= 3.41
              ? "text-blue-700"
              : "text-yellow-700"
          }
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

      {/* Compliance distribution */}
      {!isPublic && (
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Fully Compliant", count: cityStats.fullyCompliant, color: "bg-green-500", range: "≥4.21" },
            { label: "Mostly Compliant", count: cityStats.mostlyCompliant, color: "bg-blue-500", range: "3.41–4.20" },
            { label: "Partially Compliant", count: cityStats.partiallyCompliant, color: "bg-yellow-500", range: "2.61–3.40" },
            { label: "Reviewed", count: cityStats.reviewed, color: "bg-purple-500", range: "Pending CENRO" },
            { label: "In Progress", count: cityStats.draft + cityStats.submitted, color: "bg-slate-400", range: "Draft/Submitted" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className={`h-1.5 rounded-full ${item.color} mb-3`} />
              <p className="text-2xl font-bold text-slate-900">{item.count}</p>
              <p className="text-xs font-medium text-slate-700 mt-0.5">{item.label}</p>
              <p className="text-[10px] text-slate-400">{item.range}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Barangay Compliance Scores</CardTitle>
            <CardDescription>
              {chartData.length} barangays with validated scores — sorted by score. Dashed lines: benchmark (4.21) and tolerance (3.41).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <BarangayScoreChart data={chartData} height={300} />
          </CardContent>
        </Card>

        {/* Radar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Breakdown</CardTitle>
            <CardDescription>City average per compliance category vs. 4.21 benchmark</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <CategoryRadarChart data={radarData} height={280} />
          </CardContent>
        </Card>
      </div>

      {/* Trend + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Compliance Trend</CardTitle>
            <CardDescription>City average score and fully compliant barangays across audit cycles</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ComplianceTrendChart data={trendData} height={250} />
          </CardContent>
        </Card>

        {/* Recent submissions */}
        {!isPublic && (
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
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {brgy?.name}
                        </p>
                        <StatusBadge status={sub.status} />
                      </div>
                      {finalOverallScore(sub) != null && (
                        <span className="text-xs font-bold text-slate-700">
                          {finalOverallScore(sub)!.toFixed(2)}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full text-xs text-slate-500"
                onClick={() => navigate("/barangays")}
              >
                View all barangays →
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Category summary table */}
      {!isPublic && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Compliance Summary</CardTitle>
            <CardDescription>City-wide average scores per audit category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Category</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500">Indicators</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500">City Average</th>
                    <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500">Compliance Level</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Gap to 4.21</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { cat: "SWM Programs", indicators: 11, avg: 3.72 },
                    { cat: "Committee Structure", indicators: 9, avg: 3.89 },
                    { cat: "Collection & Fees", indicators: 9, avg: 3.58 },
                    { cat: "Environmental Impact", indicators: 10, avg: 3.61 },
                  ].map((row) => (
                    <tr key={row.cat} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-medium text-slate-900">{row.cat}</td>
                      <td className="py-3 px-3 text-center text-slate-600">{row.indicators}</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">{row.avg.toFixed(2)}</td>
                      <td className="py-3 px-3 text-center">
                        <ScoreBadge score={row.avg} showScore={false} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-amber-400"
                              style={{ width: `${((4.21 - row.avg) / 4.21) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-amber-700 font-medium w-10 text-right">
                            -{(4.21 - row.avg).toFixed(2)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
