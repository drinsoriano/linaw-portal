import { useState } from "react";
import { Search, CheckCircle2, Clock, AlertTriangle, FileText, RotateCcw, Eye, Download, CalendarDays } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PageHeader } from "../../components/shared/PageHeader";
import { EcaReportPDF } from "../../components/shared/EcaReportPDF";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { barangays } from "../../data/barangays";
import { useEca } from "../../context/EcaContext";
import { useToast } from "../../context/ToastContext";
import type { EcaReport, EcaStatus } from "../../types";
import { ECA_STATUS_COLORS, ECA_STATUS_LABELS } from "../../types";
import { cn } from "../../lib/utils";

const QUARTER_LABELS: Record<number, string> = { 1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4" };
const QUARTER_NAMES: Record<number, string> = { 1: "Q1 — Jan to Mar", 2: "Q2 — Apr to Jun", 3: "Q3 — Jul to Sep", 4: "Q4 — Oct to Dec" };

const STATUS_ICONS: Record<EcaStatus, typeof CheckCircle2> = {
  ACCEPTED: CheckCircle2,
  SUBMITTED: FileText,
  ENDORSED: FileText,
  PENDING: Clock,
  OVERDUE: AlertTriangle,
  FOR_REVISION: RotateCcw,
  DRAFT: FileText,
};

type EnrichedReport = EcaReport & { barangayName: string };

const YEARS = Array.from({ length: 7 }, (_, i) => 2020 + i); // 2020–2026

export function EcaTrackerPage() {
  const { getByPeriod, setActivePeriod, activePeriod, setStatus } = useEca();
  const { toast } = useToast();

  // Local view state — browsing a period without immediately changing what barangays see
  const [viewYear, setViewYear] = useState<number>(activePeriod.year);
  const [viewQuarter, setViewQuarter] = useState<1 | 2 | 3 | 4>(activePeriod.quarter);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewReport, setViewReport] = useState<EnrichedReport | null>(null);
  const [actionReport, setActionReport] = useState<EnrichedReport | null>(null);
  const [actionType, setActionType] = useState<"accept" | "revise" | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const isViewingActive = viewYear === activePeriod.year && viewQuarter === activePeriod.quarter;

  const periodReports = getByPeriod(viewYear, viewQuarter);
  const enriched: EnrichedReport[] = periodReports.map((r) => ({
    ...r,
    barangayName: barangays.find((b) => b.id === r.barangayId)?.name ?? r.barangayId,
  }));

  const filtered = enriched.filter((r) => {
    const matchSearch = r.barangayName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const noReportCount = Math.max(0, 54 - periodReports.length);
  const summary = {
    accepted: periodReports.filter((r) => r.status === "ACCEPTED").length,
    pending: periodReports.filter((r) => r.status === "PENDING").length,
    atBarangay: periodReports.filter((r) => r.status === "SUBMITTED" || r.status === "ENDORSED").length,
    forRevision: periodReports.filter((r) => r.status === "FOR_REVISION" || r.status === "OVERDUE").length,
    noReport: noReportCount,
  };

  const handleSetActive = () => {
    setActivePeriod(viewYear, viewQuarter);
    toast({
      title: "Active Period Updated",
      description: `${QUARTER_NAMES[viewQuarter]} ${viewYear} is now the active ECA period. Barangay secretaries will see this quarter.`,
      variant: "success",
    });
  };

  const handleAction = () => {
    if (!actionReport || !actionType) return;
    if (actionType === "accept") {
      setStatus(actionReport.id, "ACCEPTED");
      toast({ title: "ECA Report Accepted", description: `${actionReport.barangayName} Q${actionReport.quarter} ${actionReport.year} marked as accepted.`, variant: "success" });
    } else {
      setStatus(actionReport.id, "FOR_REVISION", feedbackText);
      toast({ title: "Report Returned for Revision", description: "Feedback sent to barangay.", variant: "warning" });
    }
    setActionReport(null);
    setActionType(null);
    setFeedbackText("");
    setViewReport(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ECA Quarterly Report Tracker"
        subtitle="Monitor environmental compliance activity reports submitted by all barangays"
      />

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
        <span className="text-sm font-medium text-slate-700">Viewing Period:</span>
        <Select value={viewYear.toString()} onValueChange={(v) => setViewYear(parseInt(v))}>
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={viewQuarter.toString()} onValueChange={(v) => setViewQuarter(parseInt(v) as 1 | 2 | 3 | 4)}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((q) => (
              <SelectItem key={q} value={q.toString()}>{QUARTER_NAMES[q]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isViewingActive ? (
          <span className="ml-2 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
            Active period — barangays are on this quarter
          </span>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-amber-700">
              Read-only. Active: <strong>{QUARTER_LABELS[activePeriod.quarter]} {activePeriod.year}</strong>
            </span>
            <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700" onClick={handleSetActive}>
              Set as Active Period
            </Button>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Accepted", value: summary.accepted, color: "text-green-700", bg: "bg-green-50 border-green-200" },
          { label: "Pending CENRO", value: summary.pending, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "In Barangay Review", value: summary.atBarangay, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
          { label: "For Revision / Overdue", value: summary.forRevision, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "No Report Yet", value: summary.noReport, color: "text-slate-500", bg: "bg-slate-50 border-slate-200" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl border p-4", s.bg)}>
            <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-slate-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search barangay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-60"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {Object.entries(ECA_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="self-center text-xs text-slate-400 ml-auto">{filtered.length} of 54 barangays</p>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Barangay</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden md:table-cell">Certified</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden lg:table-cell">Compliance %</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r) => {
                const StatusIcon = STATUS_ICONS[r.status];
                const compRate = r.summaryMetrics?.complianceRate
                  ?? (() => {
                    const s3 = r.sections.find(s => s.id === "sec-segregation");
                    const f = s3?.fields.find(f => f.id === "s3");
                    return f ? parseFloat(String(f.value)) : null;
                  })();
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{r.barangayName}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", ECA_STATUS_COLORS[r.status])}>
                        <StatusIcon className="h-3 w-3" />
                        {ECA_STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 hidden md:table-cell">
                      {r.certifiedAt ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-xs hidden lg:table-cell">
                      {compRate != null ? (
                        <span className={cn("font-semibold", compRate >= 70 ? "text-green-700" : "text-red-600")}>
                          {compRate}%
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== "DRAFT" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-600 hover:text-slate-900 text-xs"
                            onClick={() => setViewReport(r)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                        )}
                        {r.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-amber-700 border-amber-200 hover:bg-amber-50 text-xs"
                              onClick={() => { setActionReport(r); setActionType("revise"); }}
                            >
                              Return
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-xs"
                              onClick={() => { setActionReport(r); setActionType("accept"); }}
                            >
                              Accept
                            </Button>
                          </>
                        )}
                        {r.status === "SUBMITTED" && (
                          <span className="text-xs text-indigo-500 font-medium">In committee review</span>
                        )}
                        {r.status === "ENDORSED" && (
                          <span className="text-xs text-indigo-500 font-medium">Awaiting captain</span>
                        )}
                        {r.status === "ACCEPTED" && (
                          <span className="text-xs text-green-700 font-medium">✓ Accepted</span>
                        )}
                        {r.status === "OVERDUE" && (
                          <span className="text-xs text-red-500 font-medium">No submission</span>
                        )}
                        {r.status === "FOR_REVISION" && (
                          <span className="text-xs text-amber-600 font-medium">Awaiting resubmission</span>
                        )}
                        {r.status === "DRAFT" && (
                          <span className="text-xs text-slate-400">Draft</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">
              No ECA reports found for {QUARTER_LABELS[viewQuarter]} {viewYear}.
            </div>
          )}
        </div>
      </Card>

      {/* View Report Dialog */}
      <Dialog open={!!viewReport} onOpenChange={() => setViewReport(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3 pr-6">
              <span>{viewReport?.barangayName} — ECA Report</span>
              {viewReport && (
                <span className="text-xs font-normal text-slate-500">
                  Q{viewReport.quarter} {viewReport.year}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {viewReport && (
            <div className="space-y-5 py-1">
              {/* Status + PDF download */}
              <div className="flex items-center justify-between">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", ECA_STATUS_COLORS[viewReport.status])}>
                  {ECA_STATUS_LABELS[viewReport.status]}
                </span>
                <PDFDownloadLink
                  document={<EcaReportPDF report={viewReport} barangayName={viewReport.barangayName} />}
                  fileName={`ECA-Q${viewReport.quarter}-${viewReport.year}-Brgy${viewReport.barangayName.replace(/\s+/g, "")}.pdf`}
                >
                  {({ loading }) => (
                    <Button size="sm" variant="outline" disabled={loading} className="text-xs">
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      {loading ? "Generating PDF…" : "Download PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>

              {/* Summary metrics (for historical records) */}
              {viewReport.summaryMetrics && viewReport.sections.length === 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 p-3 text-center">
                    <p className={cn("text-2xl font-bold", viewReport.summaryMetrics.complianceRate >= 70 ? "text-green-700" : "text-red-600")}>
                      {viewReport.summaryMetrics.complianceRate}%
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Household Compliance Rate</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">{viewReport.summaryMetrics.diversionRate}%</p>
                    <p className="text-xs text-slate-500 mt-0.5">Waste Diversion Rate</p>
                  </div>
                </div>
              )}

              {/* Approval chain */}
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                <div className="px-4 py-2 bg-slate-50 rounded-t-lg">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Approval Chain</p>
                </div>
                {[
                  { role: "Barangay Secretary", label: "Prepared by", name: viewReport.preparedBy, date: viewReport.preparedAt },
                  { role: "Committee Chair (Councilor)", label: "Endorsed by", name: viewReport.endorsedBy, date: viewReport.endorsedAt },
                  { role: "Punong Barangay (Captain)", label: "Certified by", name: viewReport.certifiedBy, date: viewReport.certifiedAt },
                ].map((step) => (
                  <div key={step.role} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">{step.label}</p>
                      <p className={cn("font-medium", step.name ? "text-slate-800" : "text-slate-300")}>
                        {step.name ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500">{step.role}</p>
                    </div>
                    <p className="text-xs text-slate-400">{step.date ?? "—"}</p>
                  </div>
                ))}
              </div>

              {/* Sections data */}
              {viewReport.sections.length > 0 && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Report Content</p>
                  {viewReport.sections.map((section) => {
                    const filledFields = section.fields.filter((f) => f.value !== "" && f.value !== null && f.value !== undefined);
                    if (filledFields.length === 0) return null;
                    return (
                      <div key={section.id} className="rounded-lg border border-slate-200 overflow-hidden">
                        <div className="bg-[#0f2d1a] px-3 py-2">
                          <p className="text-xs font-semibold text-green-200">{section.label}</p>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {filledFields.map((field) => (
                            <div key={field.id} className="px-3 py-2 text-sm">
                              <p className="text-xs text-slate-500 mb-0.5">{field.label}</p>
                              <p className="text-slate-800 font-medium break-words">{String(field.value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CENRO feedback if any */}
              {viewReport.cenroFeedback && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Previous CENRO Feedback</p>
                  <p className="text-sm text-amber-900">{viewReport.cenroFeedback}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setViewReport(null)}>Close</Button>
            {viewReport?.status === "PENDING" && (
              <>
                <Button
                  variant="outline"
                  className="text-amber-700 border-amber-200 hover:bg-amber-50"
                  onClick={() => { setActionReport(viewReport); setActionType("revise"); }}
                >
                  Return for Revision
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => { setActionReport(viewReport); setActionType("accept"); }}
                >
                  Accept Report
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm action dialog */}
      <Dialog open={!!actionReport} onOpenChange={() => { setActionReport(null); setActionType(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "accept" ? "Accept ECA Report" : "Return for Revision"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            {actionReport && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm">
                <p className="font-semibold text-slate-800">{actionReport.barangayName}</p>
                <p className="text-xs text-slate-500">{QUARTER_LABELS[actionReport.quarter]} {actionReport.year}</p>
              </div>
            )}
            {actionType === "revise" && (
              <div>
                <Label>Revision Notes / Feedback to Barangay</Label>
                <Textarea
                  className="mt-1.5 text-sm min-h-[100px]"
                  placeholder="Describe what needs to be corrected or completed..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>
            )}
            {actionType === "accept" && (
              <p className="text-sm text-slate-600">
                This will mark the ECA report as <strong>Accepted</strong>. The barangay will be notified.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionReport(null); setActionType(null); }}>Cancel</Button>
            <Button
              onClick={handleAction}
              className={actionType === "accept" ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}
            >
              {actionType === "accept" ? "Confirm Accept" : "Return for Revision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
