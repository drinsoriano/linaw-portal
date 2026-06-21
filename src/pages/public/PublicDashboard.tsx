import { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  Leaf, Search, BarChart3, Building2, CheckCircle2, TrendingUp,
  BookOpen, Calendar, ChevronDown, ChevronRight, Recycle, Factory,
  FileImage, FileText, File, FolderOpen,
  Phone, MessageSquare, Mail, ExternalLink, MessageCircle,
  Megaphone, Users, Paperclip,
} from "lucide-react";
import type { EcaReport, IndicatorCategory, IECActivity } from "../../types";
import { barangays } from "../../data/barangays";
import { indicators } from "../../data/indicators";
import { useSubmissions } from "../../context/SubmissionsContext";
import { useEca } from "../../context/EcaContext";
import { useContact } from "../../context/ContactContext";
import { useIEC } from "../../context/IECContext";
import { ScoreBadge } from "../../components/shared/ScoreBadge";
import { BarangayScoreChart } from "../../components/charts/BarangayScoreChart";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { ECA_STATUS_LABELS, ECA_STATUS_COLORS, CATEGORY_LABELS } from "../../types";
import { cn } from "../../lib/utils";

const QUARTER_LABELS: Record<number, string> = {
  1: "Q1 (Jan–Mar)", 2: "Q2 (Apr–Jun)", 3: "Q3 (Jul–Sep)", 4: "Q4 (Oct–Dec)",
};

const AUDIT_CATEGORY_KEYS: IndicatorCategory[] = [
  "SWM_PROGRAMS", "COMMITTEE", "WASTE_COLLECTION_FEES", "ENV_COMMUNITY_IMPACT",
];

function scoreChipClass(score: number): string {
  if (score >= 5) return "bg-green-100 text-green-800";
  if (score >= 4) return "bg-blue-100 text-blue-800";
  if (score >= 3) return "bg-yellow-100 text-yellow-800";
  if (score >= 2) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const EV_FT_CONFIGS = [
  { ext: "jpg", label: "IMG", bg: "bg-blue-50", textCls: "text-blue-600" },
  { ext: "pdf", label: "PDF", bg: "bg-red-50", textCls: "text-red-600" },
  { ext: "docx", label: "DOC", bg: "bg-slate-50", textCls: "text-slate-500" },
];

function genEvFiles(indicatorCode: string, count: number, bIdx: number) {
  return Array.from({ length: count }, (_, i) => {
    const ftIdx = Math.floor(seededRand(bIdx * 31 + indicatorCode.charCodeAt(0) + i * 7) * 3) % 3;
    const sizeKb = Math.floor(seededRand(bIdx * 17 + i * 13 + indicatorCode.charCodeAt(0)) * 1800) + 200;
    return {
      id: `${bIdx}-${indicatorCode}-${i}`,
      filename: `${indicatorCode}_evidence_${i + 1}.${EV_FT_CONFIGS[ftIdx].ext}`,
      ftIdx,
      sizeKb,
      indicatorCode,
    };
  });
}

interface ContactChannelsProps {
  callPhone?: string;
  smsPhone?: string;
  email?: string;
  facebookPage?: string;
  messengerLink?: string;
}

function ContactChannels({ callPhone, smsPhone, email, facebookPage, messengerLink }: ContactChannelsProps) {
  const channels: { href: string; icon: typeof Phone; label: string; className: string }[] = [];
  if (callPhone) channels.push({ href: `tel:${callPhone}`, icon: Phone, label: callPhone, className: "text-green-700 bg-green-50 hover:bg-green-100" });
  if (smsPhone) channels.push({ href: `sms:${smsPhone}`, icon: MessageSquare, label: smsPhone, className: "text-blue-700 bg-blue-50 hover:bg-blue-100" });
  if (email) channels.push({ href: `mailto:${email}`, icon: Mail, label: email, className: "text-slate-700 bg-slate-50 hover:bg-slate-100" });
  if (facebookPage) channels.push({ href: `https://www.facebook.com/${facebookPage.replace(/^https?:\/\/(www\.)?facebook\.com\//i, "").replace(/\s/g, "")}`, icon: ExternalLink, label: facebookPage, className: "text-indigo-700 bg-indigo-50 hover:bg-indigo-100" });
  if (messengerLink) channels.push({ href: messengerLink.startsWith("http") ? messengerLink : `https://${messengerLink}`, icon: MessageCircle, label: "Messenger", className: "text-purple-700 bg-purple-50 hover:bg-purple-100" });

  if (channels.length === 0) {
    return <span className="text-xs text-slate-400 italic">No contact details available</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {channels.map((ch) => {
        const Icon = ch.icon;
        return (
          <a
            key={ch.href}
            href={ch.href}
            target={ch.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors", ch.className)}
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[160px]">{ch.label}</span>
          </a>
        );
      })}
    </div>
  );
}

function getField(report: EcaReport, fieldId: string): string {
  for (const section of report.sections) {
    const field = section.fields.find((f) => f.id === fieldId);
    if (field !== undefined) return String(field.value ?? "");
  }
  return "";
}

export function PublicDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [ecaSearch, setEcaSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [iecSearch, setIecSearch] = useState("");
  const [iecTypeFilter, setIecTypeFilter] = useState("All");
  const [viewAttachActivity, setViewAttachActivity] = useState<IECActivity | null>(null);
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);
  const [expandedEcaId, setExpandedEcaId] = useState<string | null>(null);
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);
  const { submissions, activeCycle, cycles } = useSubmissions();
  const { reports, getByPeriod } = useEca();
  const { getContactByBarangay, cenroContact } = useContact();
  const { activities: allIECActivities } = useIEC();

  // Only show cycles that have at least one validated submission, newest first
  const cyclesWithData = cycles
    .filter((c) => submissions.some((s) => s.cycleId === c.id && s.status === "VALIDATED"))
    .sort((a, b) => b.year - a.year);

  const [selectedCycleId, setSelectedCycleId] = useState(
    cyclesWithData[0]?.id ?? activeCycle.id
  );

  // RA 9003 — selected cycle only, validated submissions sorted by score
  const scored = submissions
    .filter((s) => s.cycleId === selectedCycleId && s.overallScore !== undefined && s.status === "VALIDATED")
    .sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0));

  const chartData = scored.map((s) => ({
    name: barangays.find((b) => b.id === s.barangayId)?.name ?? s.barangayId,
    score: s.overallScore ?? 0,
    status: s.status,
  }));

  const filteredScored = scored.filter((s) => {
    const brgy = barangays.find((b) => b.id === s.barangayId);
    return brgy?.name.toLowerCase().includes(search.toLowerCase());
  });

  const totalValidated = scored.length;
  const cityAverage = scored.length > 0
    ? scored.reduce((acc, s) => acc + (s.overallScore ?? 0), 0) / scored.length
    : 0;
  const fullyCompliant = scored.filter((s) => (s.overallScore ?? 0) >= 4.21).length;
  const mostlyCompliant = scored.filter((s) => (s.overallScore ?? 0) >= 3.41 && (s.overallScore ?? 0) < 4.21).length;
  const partiallyCompliant = scored.filter((s) => (s.overallScore ?? 0) < 3.41).length;

  // ECA — period-based (year + quarter) with year/quarter selectors
  const ecaYearsWithData = [
    ...new Set(reports.filter((r) => r.status === "ACCEPTED").map((r) => r.year)),
  ].sort((a, b) => b - a);

  const [selectedEcaYear, setSelectedEcaYear] = useState<number>(
    ecaYearsWithData[0] ?? new Date().getFullYear()
  );

  const ecaQuartersInYear = [
    ...new Set(
      reports
        .filter((r) => r.status === "ACCEPTED" && r.year === selectedEcaYear)
        .map((r) => r.quarter)
    ),
  ].sort() as (1 | 2 | 3 | 4)[];

  const [selectedEcaQuarter, setSelectedEcaQuarter] = useState<1 | 2 | 3 | 4>(
    ecaQuartersInYear[ecaQuartersInYear.length - 1] ?? 1
  );

  const handleEcaYearChange = (year: number) => {
    setSelectedEcaYear(year);
    const qs = [
      ...new Set(
        reports
          .filter((r) => r.status === "ACCEPTED" && r.year === year)
          .map((r) => r.quarter)
      ),
    ].sort() as (1 | 2 | 3 | 4)[];
    setSelectedEcaQuarter(qs[qs.length - 1] ?? 1);
  };

  const periodEcaReports = getByPeriod(selectedEcaYear, selectedEcaQuarter);

  // Join with all 54 barangays — null means no submission for this period
  const ecaTableRows = barangays.map((brgy) => ({
    barangay: brgy,
    report: periodEcaReports.find((r) => r.barangayId === brgy.id) ?? null,
  }));

  const filteredEca = ecaTableRows.filter(({ barangay }) =>
    barangay.name.toLowerCase().includes(ecaSearch.toLowerCase())
  );

  const ecaAccepted = periodEcaReports.filter((r) => r.status === "ACCEPTED").length;
  const ecaPending = periodEcaReports.filter((r) => r.status === "PENDING").length;

  const segRates = periodEcaReports
    .map((r) => {
      const fromField = parseFloat(getField(r, "s3"));
      return !isNaN(fromField) && fromField > 0 ? fromField : (r.summaryMetrics?.complianceRate ?? NaN);
    })
    .filter((v) => !isNaN(v) && v > 0);
  const avgSegRate = segRates.length > 0
    ? (segRates.reduce((a, b) => a + b, 0) / segRates.length).toFixed(1)
    : null;

  const mrfCount = periodEcaReports.filter((r) => getField(r, "m1") === "Yes").length;

  const totalDivertedKg = periodEcaReports
    .map((r) => parseFloat(getField(r, "wg8")) || 0)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0f2d1a] text-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#16a34a] flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">LINAW Open Data</p>
              <p className="text-[10px] text-green-400">Calamba City RA 9003 Compliance Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="bg-[#16a34a] hover:bg-green-700"
              onClick={() => navigate("/login")}
            >
              Staff Login
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Calamba City Solid Waste Management Compliance
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Open data on how all 54 barangays of Calamba City, Laguna are complying with RA 9003 — the Ecological Solid Waste Management Act.
          </p>
        </div>

        <Tabs defaultValue="ra9003">
          <TabsList className="h-auto bg-slate-100 p-1">
            <TabsTrigger value="ra9003" className="flex items-center gap-2 data-[state=active]:bg-white">
              <BarChart3 className="h-4 w-4" />
              RA 9003 Audit Results
            </TabsTrigger>
            <TabsTrigger value="eca" className="flex items-center gap-2 data-[state=active]:bg-white">
              <BookOpen className="h-4 w-4" />
              ECA Quarterly Reports
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Phone className="h-4 w-4" />
              Contact Us
            </TabsTrigger>
            <TabsTrigger value="iec" className="flex items-center gap-2 data-[state=active]:bg-white">
              <Megaphone className="h-4 w-4" />
              IEC Activities
            </TabsTrigger>
          </TabsList>

          {/* ── RA 9003 Tab ── */}
          <TabsContent value="ra9003" className="mt-6 space-y-6">
            {cyclesWithData.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 font-medium">Audit Year:</span>
                {cyclesWithData.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCycleId(c.id)}
                    className={cn(
                      "text-xs rounded-full px-3 py-1 font-semibold border transition-colors",
                      selectedCycleId === c.id
                        ? "bg-[#16a34a] text-white border-[#16a34a]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-green-400"
                    )}
                  >
                    {c.year}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Barangays", value: 54, icon: Building2, color: "text-blue-600", bg: "bg-blue-100" },
                { label: "Validated Reports", value: totalValidated, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
                { label: "City Average Score", value: cityAverage.toFixed(2), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" },
                { label: "Fully Compliant", value: fullyCompliant, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-100" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center mb-3", s.bg)}>
                      <Icon className={cn("h-5 w-5", s.color)} />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Fully Compliant", count: fullyCompliant, color: "bg-green-500", range: "≥ 4.21" },
                { label: "Mostly Compliant", count: mostlyCompliant, color: "bg-blue-500", range: "3.41 – 4.20" },
                { label: "Below CAP Threshold", count: partiallyCompliant, color: "bg-yellow-500", range: "< 3.41" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className={`h-1.5 rounded-full ${item.color} mb-3`} />
                  <p className="text-2xl font-bold text-slate-900">{item.count}</p>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">{item.label}</p>
                  <p className="text-[10px] text-slate-400">{item.range}</p>
                </div>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Barangay Compliance Scores — {cycles.find((c) => c.id === selectedCycleId)?.label ?? ""}
                </CardTitle>
                <CardDescription>
                  Sorted by score, highest to lowest. Dashed lines: benchmark 4.21 and CAP threshold 3.41.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <BarangayScoreChart data={chartData} height={280} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="text-base">Barangay Compliance Table</CardTitle>
                    <CardDescription>
                      {scored.length} barangays with validated scores · {cycles.find((c) => c.id === selectedCycleId)?.label ?? ""} · Click any row to see all 39 indicators
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search barangay..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-52"
                    />
                  </div>
                </div>
                {/* Score scale legend */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Score scale:</span>
                  {([5, 4, 3, 2, 1] as const).map((sc) => (
                    <span key={sc} className={cn("text-[10px] font-bold rounded px-1.5 py-0.5", scoreChipClass(sc))}>
                      {sc}
                    </span>
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1">· Benchmark ≥4.21 · CAP required &lt;3.41</span>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 w-12">Rank</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Barangay</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden md:table-cell">District</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Score</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Compliance Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScored.map((s, idx) => {
                      const brgy = barangays.find((b) => b.id === s.barangayId);
                      const score = s.overallScore ?? 0;
                      const level = score >= 4.21 ? "Fully Compliant"
                        : score >= 3.41 ? "Mostly Compliant"
                        : score >= 2.61 ? "Partially Compliant"
                        : "Minimally Compliant";
                      const levelColor = score >= 4.21 ? "text-green-700 bg-green-100"
                        : score >= 3.41 ? "text-blue-700 bg-blue-100"
                        : "text-yellow-700 bg-yellow-100";
                      const isExpanded = expandedAuditId === s.barangayId;
                      const brgyIdx = barangays.findIndex((b) => b.id === s.barangayId);
                      const allEvFiles = s.responses.flatMap((r) => {
                        const ind = indicators.find((i) => i.id === r.indicatorId);
                        if (!ind) return [];
                        const count = r.evidenceCount ?? (r.score !== null ? Math.floor(seededRand(brgyIdx * 13 + ind.sortOrder) * 4) + 1 : 0);
                        if (!count) return [];
                        return genEvFiles(ind.code, count, brgyIdx);
                      });
                      const isEvidenceExpanded = expandedEvidenceId === s.barangayId;

                      return (
                        <Fragment key={s.id}>
                          <tr
                            className={cn("hover:bg-slate-50 cursor-pointer border-b border-slate-100", idx < 3 && "bg-green-50/40")}
                            onClick={() => setExpandedAuditId(isExpanded ? null : s.barangayId)}
                          >
                            <td className="py-3 px-4 text-center text-sm font-bold text-slate-600">#{idx + 1}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {isExpanded
                                  ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                  : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
                                <span className="font-semibold text-slate-900">{brgy?.name ?? s.barangayId}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 hidden md:table-cell">{brgy?.district}</td>
                            <td className="py-3 px-4 text-center">
                              <ScoreBadge score={score} size="sm" />
                            </td>
                            <td className="py-3 px-4">
                              <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", levelColor)}>
                                {level}
                              </span>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-slate-50">
                              <td colSpan={5} className="px-5 py-4 border-b border-slate-200">
                                {/* 4 category panels */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {AUDIT_CATEGORY_KEYS.map((cat) => {
                                    const catInds = indicators
                                      .filter((i) => i.category === cat)
                                      .sort((a, b) => a.sortOrder - b.sortOrder);
                                    const catAvg = s.categoryScores?.[cat];
                                    return (
                                      <div key={cat} className="bg-white rounded-lg border border-slate-200 p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                            {CATEGORY_LABELS[cat]}
                                          </p>
                                          {catAvg !== undefined && <ScoreBadge score={catAvg} size="sm" />}
                                        </div>
                                        <div className="space-y-1">
                                          {catInds.map((ind) => {
                                            const resp = s.responses.find((r) => r.indicatorId === ind.id);
                                            const sc = resp?.score ?? null;
                                            const needsCap = sc !== null && sc < 3.41;
                                            const belowBenchmark = sc !== null && sc < 4.21;
                                            return (
                                              <div
                                                key={ind.id}
                                                className={cn(
                                                  "flex items-center gap-2 rounded px-1.5 py-1",
                                                  needsCap ? "bg-red-50" : belowBenchmark ? "bg-yellow-50/60" : ""
                                                )}
                                              >
                                                <span className="text-[10px] font-mono font-bold text-slate-400 w-14 shrink-0">{ind.code}</span>
                                                <p className="text-[10px] text-slate-700 flex-1 leading-tight">{ind.name}</p>
                                                {sc !== null ? (
                                                  <span className={cn("text-[10px] font-bold rounded px-1.5 py-0.5 shrink-0", scoreChipClass(sc))}>
                                                    {sc}
                                                  </span>
                                                ) : (
                                                  <span className="text-[10px] text-slate-300 shrink-0">—</span>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Captain certification */}
                                {s.captainRemarks && (
                                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-start gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-green-800 leading-relaxed">
                                      <span className="font-semibold">Certified by Punong Barangay:</span>{" "}
                                      {s.captainRemarks}
                                      {s.validatedAt && (
                                        <span className="ml-2 text-green-600">
                                          — {new Date(s.validatedAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                )}

                                {/* Evidence files */}
                                {allEvFiles.length > 0 && (
                                  <div className="mt-3">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedEvidenceId(isEvidenceExpanded ? null : s.barangayId);
                                      }}
                                      className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                                    >
                                      <FolderOpen className="h-3 w-3" />
                                      {isEvidenceExpanded ? "Hide" : "View"} {allEvFiles.length} evidence file{allEvFiles.length !== 1 ? "s" : ""}
                                      {isEvidenceExpanded
                                        ? <ChevronDown className="h-3 w-3" />
                                        : <ChevronRight className="h-3 w-3" />}
                                    </button>
                                    {isEvidenceExpanded && (
                                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                                        {allEvFiles.map((f) => {
                                          const EvIcon = f.ftIdx === 0 ? FileImage : f.ftIdx === 1 ? FileText : File;
                                          const ftCfg = EV_FT_CONFIGS[f.ftIdx];
                                          return (
                                            <div key={f.id} className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2">
                                              <div className={cn("h-7 w-7 rounded flex items-center justify-center shrink-0", ftCfg.bg)}>
                                                <EvIcon className={cn("h-4 w-4", ftCfg.textCls)} />
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-medium text-slate-800 truncate">{f.filename}</p>
                                                <p className="text-[9px] text-slate-400">
                                                  {f.sizeKb >= 1024 ? `${(f.sizeKb / 1024).toFixed(1)} MB` : `${f.sizeKb} KB`}
                                                </p>
                                              </div>
                                              <span className="text-[9px] font-bold bg-green-50 text-green-700 rounded px-1 py-0.5 shrink-0">
                                                {f.indicatorCode}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
                {filteredScored.length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-400">No barangays match your search.</div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* ── ECA Tab ── */}
          <TabsContent value="eca" className="mt-6 space-y-6">
            {/* Year selector */}
            {ecaYearsWithData.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 font-medium">Report Year:</span>
                {ecaYearsWithData.map((y) => (
                  <button
                    key={y}
                    onClick={() => handleEcaYearChange(y)}
                    className={cn(
                      "text-xs rounded-full px-3 py-1 font-semibold border transition-colors",
                      selectedEcaYear === y
                        ? "bg-[#16a34a] text-white border-[#16a34a]"
                        : "bg-white text-slate-600 border-slate-200 hover:border-green-400"
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}

            {/* Quarter selector */}
            {ecaQuartersInYear.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 font-medium">Quarter:</span>
                {ecaQuartersInYear.map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedEcaQuarter(q)}
                    className={cn(
                      "text-xs rounded-full px-3 py-1 font-semibold border transition-colors",
                      selectedEcaQuarter === q
                        ? "bg-slate-700 text-white border-slate-700"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                    )}
                  >
                    {QUARTER_LABELS[q]}
                  </button>
                ))}
                <span className="text-xs text-slate-400 ml-1">
                  · {periodEcaReports.length} of 54 barangays reported
                </span>
              </div>
            )}

            {/* ECA KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "ECA Accepted", value: ecaAccepted, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
                { label: "Pending CENRO Review", value: ecaPending, icon: Calendar, color: "text-amber-600", bg: "bg-amber-100" },
                { label: "Avg Segregation Rate", value: avgSegRate ? `${avgSegRate}%` : "—", icon: Recycle, color: "text-blue-600", bg: "bg-blue-100" },
                { label: "Barangays with MRF", value: mrfCount, icon: Factory, color: "text-purple-600", bg: "bg-purple-100" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center mb-3", s.bg)}>
                      <Icon className={cn("h-5 w-5", s.color)} />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Total waste diverted highlight banner */}
            {totalDivertedKg > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Recycle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    {totalDivertedKg.toLocaleString()} kg total waste diverted this quarter
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    Combined biodegradable, recyclables, and other waste kept out of landfills across reporting barangays
                  </p>
                </div>
              </div>
            )}

            {/* ECA Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="text-base">ECA Quarterly Report Status</CardTitle>
                    <CardDescription>
                      {QUARTER_LABELS[selectedEcaQuarter]} {selectedEcaYear} · Click a row to see detailed metrics · Manila Bayanihan Form 2.2
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search barangay..."
                      value={ecaSearch}
                      onChange={(e) => setEcaSearch(e.target.value)}
                      className="pl-9 w-52"
                    />
                  </div>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Barangay</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden md:table-cell">District</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Status</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 hidden sm:table-cell">Seg. Rate</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 hidden sm:table-cell">MRF</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 hidden lg:table-cell">Diversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEca.map(({ barangay, report }) => {
                      const isExpanded = expandedEcaId === barangay.id;

                      if (!report) {
                        return (
                          <tr key={barangay.id} className="border-b border-slate-50 opacity-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                                <span className="text-slate-500">{barangay.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-400 hidden md:table-cell">{barangay.district}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-xs text-slate-400 italic">No report</span>
                            </td>
                            <td className="py-3 px-4 text-center hidden sm:table-cell"><span className="text-slate-300 text-xs">—</span></td>
                            <td className="py-3 px-4 text-center hidden sm:table-cell"><span className="text-slate-300 text-xs">—</span></td>
                            <td className="py-3 px-4 text-center hidden lg:table-cell"><span className="text-slate-300 text-xs">—</span></td>
                          </tr>
                        );
                      }

                      // Derive metrics — fall back to summaryMetrics for historical records (sections: [])
                      const compRate  = report.summaryMetrics?.complianceRate;
                      const divRateNum = report.summaryMetrics?.diversionRate;
                      const segRate      = getField(report, "s3") || (compRate != null ? `${compRate}%` : "");
                      const segCompliant = getField(report, "s4") || (compRate != null ? (compRate >= 70 ? "Yes" : "No") : "");
                      const hasMrf       = getField(report, "m1") === "Yes";
                      const mrfType      = getField(report, "m2");
                      const mrfFull      = getField(report, "m3") === "Yes";
                      const mrfScore     = getField(report, "m4");
                      const divRate      = getField(report, "wg9") || (divRateNum != null ? `${divRateNum}%` : "");
                      const totalDiv     = getField(report, "wg8");
                      const biodiv       = getField(report, "wg5");
                      const recdiv       = getField(report, "wg6");
                      const hasOwnOrd    = getField(report, "or1") === "Yes";
                      const hasCityOrd   = getField(report, "or2") === "Yes";
                      const apprehends   = getField(report, "or3") === "Yes";
                      const cleanupDone  = getField(report, "wg3") === "Yes";
                      const cleanupSacks = getField(report, "wg4");

                      return (
                        <Fragment key={barangay.id}>
                          <tr
                            className="hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                            onClick={() => setExpandedEcaId(isExpanded ? null : barangay.id)}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {isExpanded
                                  ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                  : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
                                <span className="font-semibold text-slate-900">{barangay.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500 hidden md:table-cell">{barangay.district}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", ECA_STATUS_COLORS[report.status])}>
                                {ECA_STATUS_LABELS[report.status]}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center hidden sm:table-cell">
                              {segRate
                                ? <span className={cn("text-xs font-semibold", segCompliant === "Yes" ? "text-green-700" : "text-amber-700")}>{segRate}</span>
                                : <span className="text-slate-300 text-xs">—</span>}
                            </td>
                            <td className="py-3 px-4 text-center hidden sm:table-cell">
                              {hasMrf
                                ? <span className={cn("text-xs font-semibold", mrfFull ? "text-green-700" : "text-amber-700")}>{mrfFull ? "✓ Full" : "✓ Basic"}</span>
                                : <span className="text-slate-300 text-xs">—</span>}
                            </td>
                            <td className="py-3 px-4 text-center hidden lg:table-cell">
                              {divRate
                                ? <span className="text-xs font-semibold text-blue-700">{divRate}</span>
                                : <span className="text-slate-300 text-xs">—</span>}
                            </td>
                          </tr>

                          {/* Expandable detail row */}
                          {isExpanded && (
                            <tr className="bg-slate-50">
                              <td colSpan={6} className="px-6 py-4 border-b border-slate-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

                                  {/* Segregation */}
                                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Segregation at Source</p>
                                    {segRate ? (
                                      <>
                                        <p className="text-xl font-bold text-slate-900">{segRate}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Household compliance rate</p>
                                        <span className={cn(
                                          "inline-flex mt-2 rounded-full px-2 py-0.5 text-[10px] font-bold",
                                          segCompliant === "Yes" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                        )}>
                                          {segCompliant === "Yes" ? "Compliant (≥70%)" : "Below Threshold (<70%)"}
                                        </span>
                                      </>
                                    ) : (
                                      <p className="text-xs text-slate-400">No data reported</p>
                                    )}
                                  </div>

                                  {/* MRF */}
                                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Materials Recovery Facility</p>
                                    {hasMrf ? (
                                      <>
                                        <p className="text-xs font-semibold text-slate-800 leading-snug">{mrfType || "MRF Present"}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                          Status:{" "}
                                          <span className={cn("font-semibold", mrfFull ? "text-green-700" : "text-amber-700")}>
                                            {mrfFull ? "Fully Operational" : "Basic"}
                                          </span>
                                        </p>
                                        <p className="text-xs text-slate-500">Compliance score: <span className="font-bold">{mrfScore}</span></p>
                                      </>
                                    ) : (
                                      <p className="text-xs text-slate-400">No MRF reported</p>
                                    )}
                                  </div>

                                  {/* Waste Diversion */}
                                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Waste Diversion</p>
                                    {totalDiv || divRateNum != null ? (
                                      <>
                                        {totalDiv && (
                                          <>
                                            <p className="text-xl font-bold text-slate-900">
                                              {parseFloat(totalDiv).toLocaleString()} kg
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">Total diverted this quarter</p>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                              Biodeg: {parseFloat(biodiv || "0").toLocaleString()} kg
                                              {" · "}
                                              Recyclable: {parseFloat(recdiv || "0").toLocaleString()} kg
                                            </p>
                                            {cleanupDone && (
                                              <p className="text-[10px] text-green-700 mt-1">
                                                ✓ Cleanup conducted · {cleanupSacks} sacks collected
                                              </p>
                                            )}
                                          </>
                                        )}
                                        {divRate && (
                                          <p className="text-xs font-semibold text-blue-700 mt-1">Diversion rate: {divRate}</p>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-xs text-slate-400">No diversion data reported</p>
                                    )}
                                  </div>

                                  {/* Ordinances & CENRO Feedback */}
                                  <div className="bg-white rounded-lg border border-slate-200 p-3">
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Ordinances & Enforcement</p>
                                    {(hasOwnOrd || hasCityOrd || apprehends) ? (
                                      <div className="space-y-1">
                                        <p className="text-[10px] text-slate-600">
                                          <span className={hasOwnOrd ? "text-green-600 font-bold" : "text-slate-300"}>
                                            {hasOwnOrd ? "✓" : "✗"}
                                          </span>
                                          {" "}Own no-littering ordinance
                                        </p>
                                        <p className="text-[10px] text-slate-600">
                                          <span className={hasCityOrd ? "text-green-600 font-bold" : "text-slate-300"}>
                                            {hasCityOrd ? "✓" : "✗"}
                                          </span>
                                          {" "}City ordinance implemented
                                        </p>
                                        <p className="text-[10px] text-slate-600">
                                          <span className={apprehends ? "text-green-600 font-bold" : "text-slate-300"}>
                                            {apprehends ? "✓" : "✗"}
                                          </span>
                                          {" "}Apprehends RA 9003 violators
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-slate-400">No ordinance data reported</p>
                                    )}
                                    {report.cenroFeedback && report.status === "ACCEPTED" && (
                                      <div className="mt-3 pt-2 border-t border-slate-100">
                                        <p className="text-[10px] font-semibold text-slate-500 mb-1">CENRO Evaluation</p>
                                        <p className="text-[10px] text-slate-600 leading-relaxed italic">
                                          "{report.cenroFeedback}"
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
                {filteredEca.length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-400">No barangays match your search.</div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* ── Contact Us Tab ── */}
          <TabsContent value="contact" className="mt-6 space-y-6">
            {/* CENRO Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <CardTitle className="text-base">CENRO — City Environment & Natural Resources Office</CardTitle>
                    <CardDescription>Calamba City · For RA 9003 compliance inquiries and audit concerns</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ContactChannels
                  callPhone={cenroContact.callPhone}
                  smsPhone={cenroContact.smsPhone}
                  email={cenroContact.email}
                  facebookPage={cenroContact.facebookPage}
                  messengerLink={cenroContact.messengerLink}
                />
                {cenroContact.address && (
                  <p className="mt-3 text-xs text-slate-500 flex items-start gap-1.5">
                    <Building2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-400" />
                    {cenroContact.address}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Barangay Directory */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="text-base">Barangay Contact Directory</CardTitle>
                    <CardDescription>54 barangays of Calamba City — reach your barangay hall directly</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search barangay..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="pl-9 w-52"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {barangays
                    .filter((b) => b.name.toLowerCase().includes(contactSearch.toLowerCase()))
                    .map((brgy) => {
                      const contact = getContactByBarangay(brgy.id);
                      const callPhone = contact?.callPhone ?? brgy.contactPhone;
                      const smsPhone = contact?.smsPhone;
                      const email = contact?.email ?? brgy.contactEmail;
                      const facebookPage = contact?.facebookPage;
                      const messengerLink = contact?.messengerLink;
                      return (
                        <div key={brgy.id} className="px-6 py-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{brgy.name}</p>
                              <p className="text-xs text-slate-500">{brgy.district} · {brgy.captainName}</p>
                            </div>
                            <ContactChannels
                              callPhone={callPhone}
                              smsPhone={smsPhone}
                              email={email}
                              facebookPage={facebookPage}
                              messengerLink={messengerLink}
                            />
                          </div>
                        </div>
                      );
                    })}
                  {barangays.filter((b) => b.name.toLowerCase().includes(contactSearch.toLowerCase())).length === 0 && (
                    <div className="py-8 text-center text-sm text-slate-400">No barangays match your search.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── IEC Activities Tab ── */}
          <TabsContent value="iec" className="mt-6 space-y-6">
            {(() => {
              const IEC_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
                TRAINING: { label: "Training", color: "bg-purple-100 text-purple-700" },
                CAMPAIGN: { label: "Campaign", color: "bg-green-100 text-green-700" },
                SCHOOL: { label: "School", color: "bg-blue-100 text-blue-700" },
                COMMUNITY: { label: "Community", color: "bg-amber-100 text-amber-700" },
              };

              const filteredIEC = allIECActivities
                .filter((a) => {
                  const brgy = barangays.find((b) => b.id === a.barangayId);
                  const matchSearch =
                    a.title.toLowerCase().includes(iecSearch.toLowerCase()) ||
                    (brgy?.name.toLowerCase().includes(iecSearch.toLowerCase()) ?? false);
                  const matchType = iecTypeFilter === "All" || a.type === iecTypeFilter;
                  return matchSearch && matchType;
                })
                .sort((a, b) => (b.date > a.date ? 1 : -1));

              const totalParticipants = allIECActivities.reduce((s, a) => s + a.participants, 0);
              const activeBarangays = new Set(allIECActivities.map((a) => a.barangayId)).size;
              const typeCounts = Object.keys(IEC_TYPE_CONFIG).reduce<Record<string, number>>((acc, t) => {
                acc[t] = allIECActivities.filter((a) => a.type === t).length;
                return acc;
              }, {});
              const mostActiveType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

              return (
                <>
                  {/* KPI cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Activities", value: allIECActivities.length, color: "text-green-600", bg: "bg-green-100", icon: Megaphone },
                      { label: "Total Participants", value: totalParticipants.toLocaleString(), color: "text-blue-600", bg: "bg-blue-100", icon: Users },
                      { label: "Most Active Type", value: mostActiveType ? IEC_TYPE_CONFIG[mostActiveType[0]].label : "—", color: "text-purple-600", bg: "bg-purple-100", icon: BookOpen },
                      { label: "Barangays Active", value: activeBarangays, color: "text-amber-600", bg: "bg-amber-100", icon: Building2 },
                    ].map((s) => {
                      const Icon = s.icon;
                      return (
                        <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
                          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center mb-3", s.bg)}>
                            <Icon className={cn("h-5 w-5", s.color)} />
                          </div>
                          <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search title or barangay..."
                        value={iecSearch}
                        onChange={(e) => setIecSearch(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      {(["All", "TRAINING", "CAMPAIGN", "SCHOOL", "COMMUNITY"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setIecTypeFilter(t)}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                            iecTypeFilter === t ? "bg-[#16a34a] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {t === "All" ? "All" : IEC_TYPE_CONFIG[t].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table */}
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b border-slate-200">
                          <tr>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Date</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Barangay</th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Type</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Title</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Participants</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredIEC.map((a) => {
                            const brgy = barangays.find((b) => b.id === a.barangayId);
                            const cfg = IEC_TYPE_CONFIG[a.type];
                            return (
                              <tr key={a.id} className="hover:bg-slate-50">
                                <td className="py-3 px-4 text-sm text-slate-700 whitespace-nowrap">{a.date}</td>
                                <td className="py-3 px-4 text-sm text-slate-700">{brgy?.name ?? a.barangayId}</td>
                                <td className="py-3 px-4 text-center">
                                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", cfg.color)}>
                                    {cfg.label}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-medium text-slate-900 max-w-xs">
                                  <p className="truncate">{a.title}</p>
                                  {a.attachments?.length ? (
                                    <button
                                      onClick={() => setViewAttachActivity(a)}
                                      className="inline-flex items-center gap-0.5 text-[10px] text-green-600 hover:text-green-800 hover:underline mt-0.5 transition-colors"
                                    >
                                      <Paperclip className="h-3 w-3" />
                                      {a.attachments.length} attachment{a.attachments.length > 1 ? "s" : ""}
                                    </button>
                                  ) : null}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-slate-900">{a.participants}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {filteredIEC.length === 0 && (
                        <div className="py-8 text-center text-sm text-slate-400">No IEC activities match your search.</div>
                      )}
                    </div>
                  </Card>
                </>
              );
            })()}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center py-6 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Data from LINAW Web Portal — Calamba City Environment and Natural Resources Office (CENRO) · RA 9003 Compliance Monitoring · 2025
          </p>
        </div>
      </main>

      {/* IEC Attachment Viewer */}
      <Dialog open={!!viewAttachActivity} onOpenChange={(open) => { if (!open) setViewAttachActivity(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Paperclip className="h-4 w-4 text-slate-500" />
              {viewAttachActivity?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {viewAttachActivity?.attachments?.map((att, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden">
                {att.mimeType.startsWith("image/") ? (
                  <div>
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="w-full object-contain max-h-[50vh]"
                    />
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-600 truncate">{att.name}</span>
                      <a
                        href={att.dataUrl}
                        download={att.name}
                        className="text-xs text-green-700 hover:text-green-900 font-medium ml-3 shrink-0"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 flex items-center gap-3 bg-slate-50">
                    <div className="h-10 w-10 rounded bg-red-100 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <span className="text-sm text-slate-700 truncate flex-1">{att.name}</span>
                    <a
                      href={att.dataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-700 hover:text-green-900 font-medium shrink-0"
                    >
                      Open PDF
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
