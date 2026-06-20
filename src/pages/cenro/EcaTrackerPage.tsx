import { useState } from "react";
import { Search, CheckCircle2, Clock, AlertTriangle, FileText, RotateCcw } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
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

const QUARTER_LABELS = { 1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4" };

const STATUS_ICONS: Record<EcaStatus, typeof CheckCircle2> = {
  ACCEPTED: CheckCircle2,
  SUBMITTED: FileText,
  ENDORSED: FileText,
  PENDING: Clock,
  OVERDUE: AlertTriangle,
  FOR_REVISION: RotateCcw,
  DRAFT: FileText,
};

export function EcaTrackerPage() {
  const { reports, setStatus } = useEca();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [quarterFilter, setQuarterFilter] = useState<string>("All");
  const [actionReport, setActionReport] = useState<EcaReport & { barangayName: string } | null>(null);
  const [actionType, setActionType] = useState<"accept" | "revise" | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const enriched = reports.map((r) => ({
    ...r,
    barangayName: barangays.find((b) => b.id === r.barangayId)?.name ?? r.barangayId,
  }));

  const filtered = enriched.filter((r) => {
    const matchSearch = r.barangayName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchQuarter = quarterFilter === "All" || r.quarter.toString() === quarterFilter;
    return matchSearch && matchStatus && matchQuarter;
  });

  const summary = {
    accepted: reports.filter((r) => r.status === "ACCEPTED").length,
    pending: reports.filter((r) => r.status === "PENDING").length,
    atBarangay: reports.filter((r) => r.status === "SUBMITTED" || r.status === "ENDORSED").length,
    overdue: reports.filter((r) => r.status === "OVERDUE").length,
    forRevision: reports.filter((r) => r.status === "FOR_REVISION").length,
  };

  const handleAction = () => {
    if (!actionReport || !actionType) return;
    if (actionType === "accept") {
      setStatus(actionReport.id, "ACCEPTED");
      toast({ title: "ECA Report Accepted", description: `${actionReport.id} marked as accepted.`, variant: "success" });
    } else {
      setStatus(actionReport.id, "FOR_REVISION", feedbackText);
      toast({ title: "Report Returned for Revision", description: "Feedback sent to barangay.", variant: "warning" });
    }
    setActionReport(null);
    setActionType(null);
    setFeedbackText("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ECA Quarterly Report Tracker"
        subtitle="Monitor environmental compliance activity reports submitted by all barangays"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Accepted", value: summary.accepted, color: "text-green-700", bg: "bg-green-50 border-green-200" },
          { label: "Pending CENRO", value: summary.pending, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "In Barangay Review", value: summary.atBarangay, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
          { label: "For Revision", value: summary.forRevision, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "Overdue", value: summary.overdue, color: "text-red-700", bg: "bg-red-50 border-red-200" },
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
        <Select value={quarterFilter} onValueChange={setQuarterFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Quarter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Quarters</SelectItem>
            {[1, 2, 3, 4].map((q) => (
              <SelectItem key={q} value={q.toString()}>Q{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <p className="self-center text-xs text-slate-400 ml-auto">{filtered.length} reports</p>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Barangay</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Quarter / Year</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden md:table-cell">Submitted</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden lg:table-cell">Submitted By</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r) => {
                const StatusIcon = STATUS_ICONS[r.status];
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{r.barangayName}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {QUARTER_LABELS[r.quarter]} {r.year}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", ECA_STATUS_COLORS[r.status])}>
                        <StatusIcon className="h-3 w-3" />
                        {ECA_STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 hidden md:table-cell">
                      {r.submittedAt ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 hidden lg:table-cell">
                      {r.submittedBy ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
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
                          <span className="text-xs text-indigo-500 font-medium">Awaiting captain certification</span>
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
            <div className="py-12 text-center text-sm text-slate-400">No ECA reports match the current filters.</div>
          )}
        </div>
      </Card>

      {/* Action dialog */}
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

