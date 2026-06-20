import { useState } from "react";
import { Plus, Search, MessageSquare } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { barangays } from "../../data/barangays";
import { useFeedback } from "../../context/FeedbackContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type {
  FeedbackStatus, FeedbackPriority, FeedbackSourceType,
} from "../../types";
import {
  FEEDBACK_STATUS_COLORS, FEEDBACK_STATUS_LABELS,
  FEEDBACK_PRIORITY_COLORS,
} from "../../types";
import { cn } from "../../lib/utils";

export function FeedbackManagementPage() {
  const { user } = useAuth();
  const { feedbacks, issueFeedback } = useFeedback();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showIssue, setShowIssue] = useState(false);

  // New feedback form state
  const [newBarangayId, setNewBarangayId] = useState("");
  const [newSource, setNewSource] = useState<FeedbackSourceType>("GENERAL");
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newPriority, setNewPriority] = useState<FeedbackPriority>("MEDIUM");

  const enriched = feedbacks.map((f) => ({
    ...f,
    barangayName: barangays.find((b) => b.id === f.barangayId)?.name ?? f.barangayId,
  }));

  const filtered = enriched.filter((f) => {
    const matchSearch =
      f.barangayName.toLowerCase().includes(search.toLowerCase()) ||
      f.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleIssue = () => {
    if (!newBarangayId || !newSubject || !newBody) {
      toast({ title: "Incomplete form", description: "Please fill in all required fields.", variant: "error" });
      return;
    }
    issueFeedback({
      barangayId: newBarangayId,
      sourceType: newSource,
      referenceId: `manual-${Date.now()}`,
      subject: newSubject,
      body: newBody,
      priority: newPriority,
      issuedBy: user?.name ?? "CENRO Evaluator",
    });
    toast({ title: "Feedback issued", description: "The barangay has been notified.", variant: "success" });
    setShowIssue(false);
    setNewBarangayId("");
    setNewSubject("");
    setNewBody("");
    setNewPriority("MEDIUM");
  };

  const PRIORITY_ORDER: Record<FeedbackPriority, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback Management"
        subtitle="Issue corrective feedback to barangays and monitor their compliance responses"
      >
        <Button onClick={() => setShowIssue(true)}>
          <Plus className="h-4 w-4" />
          Issue Feedback
        </Button>
      </PageHeader>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3">
        {(["NOT_STARTED", "ONGOING", "FOR_VERIFICATION", "COMPLETED"] as FeedbackStatus[]).map((s) => {
          const count = feedbacks.filter((f) => f.status === s).length;
          return (
            <div key={s} className={cn("rounded-xl border px-4 py-3", FEEDBACK_STATUS_COLORS[s] === "bg-green-100 text-green-700" ? "bg-green-50 border-green-200" : "bg-white border-slate-200")}>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{FEEDBACK_STATUS_LABELS[s]}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search barangay or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-72"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            {(Object.keys(FEEDBACK_STATUS_LABELS) as FeedbackStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{FEEDBACK_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="self-center text-xs text-slate-400 ml-auto">{filtered.length} items</p>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Barangay</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Subject</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Priority</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden md:table-cell">Issued</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500">Responded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered
                .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
                .map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900 text-sm">{f.barangayName}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-sm text-slate-800 truncate font-medium">{f.subject}</p>
                      <p className="text-xs text-slate-500 truncate">{f.sourceType}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", FEEDBACK_PRIORITY_COLORS[f.priority])}>
                        {f.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", FEEDBACK_STATUS_COLORS[f.status])}>
                        {FEEDBACK_STATUS_LABELS[f.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 hidden md:table-cell">{f.createdAt}</td>
                    <td className="py-3 px-4 text-right text-xs text-slate-500">
                      {f.respondedAt ?? <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No feedback items match the current filters.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Issue Feedback Dialog */}
      <Dialog open={showIssue} onOpenChange={setShowIssue}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Issue Feedback to Barangay</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Barangay <span className="text-red-500">*</span></Label>
              <Select value={newBarangayId} onValueChange={setNewBarangayId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select barangay" />
                </SelectTrigger>
                <SelectContent>
                  {barangays.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Source Type</Label>
                <Select value={newSource} onValueChange={(v) => setNewSource(v as FeedbackSourceType)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["ECA", "COMPLIANCE", "COLLECTION", "FINANCIAL", "GENERAL"] as FeedbackSourceType[]).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={newPriority} onValueChange={(v) => setNewPriority(v as FeedbackPriority)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as FeedbackPriority[]).map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Subject <span className="text-red-500">*</span></Label>
              <Input
                className="mt-1.5"
                placeholder="Brief subject line"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>
            <div>
              <Label>Feedback Body <span className="text-red-500">*</span></Label>
              <Textarea
                className="mt-1.5 min-h-[120px] text-sm"
                placeholder="Describe the issue and what action is required from the barangay..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssue(false)}>Cancel</Button>
            <Button onClick={handleIssue}>Issue Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
