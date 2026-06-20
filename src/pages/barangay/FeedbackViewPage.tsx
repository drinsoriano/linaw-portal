import { useState } from "react";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useFeedback } from "../../context/FeedbackContext";
import { useToast } from "../../context/ToastContext";
import type { CenroFeedback, FeedbackStatus } from "../../types";
import {
  FEEDBACK_STATUS_LABELS, FEEDBACK_STATUS_COLORS,
  FEEDBACK_PRIORITY_COLORS,
} from "../../types";
import { cn } from "../../lib/utils";

export function FeedbackViewPage() {
  const { user } = useAuth();
  const { getByBarangay, updateStatus } = useFeedback();
  const { toast } = useToast();
  const barangayId = user?.barangayId ?? "brgy-001";
  const feedbacks = getByBarangay(barangayId);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [responses, setResponses] = useState<Record<string, string>>({});

  const filtered = feedbacks.filter(
    (f) => statusFilter === "All" || f.status === statusFilter
  );

  const handleUpdateStatus = (fb: CenroFeedback, status: FeedbackStatus) => {
    const response = responses[fb.id];
    updateStatus(fb.id, status, response);
    toast({ title: "Status Updated", description: `Feedback marked as ${FEEDBACK_STATUS_LABELS[status]}.`, variant: "success" });
  };

  const openCount = feedbacks.filter((f) => f.status !== "COMPLETED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="CENRO Feedback"
        subtitle="Feedback and corrective action items issued by CENRO for your barangay"
      />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {(["NOT_STARTED", "ONGOING", "FOR_VERIFICATION", "COMPLETED"] as FeedbackStatus[]).map((s) => {
          const count = feedbacks.filter((f) => f.status === s).length;
          return (
            <div key={s} className={cn("rounded-xl border p-3", FEEDBACK_STATUS_COLORS[s] === "bg-green-100 text-green-700" ? "bg-green-50 border-green-200" : "bg-white border-slate-200")}>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{FEEDBACK_STATUS_LABELS[s]}</p>
            </div>
          );
        })}
      </div>

      {openCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <MessageSquare className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            {openCount} feedback item{openCount > 1 ? "s" : ""} require{openCount === 1 ? "s" : ""} your attention.
          </p>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
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
        <p className="text-xs text-slate-400">{filtered.length} items</p>
      </div>

      {/* Feedback cards */}
      <div className="space-y-3">
        {filtered.map((fb) => (
          <Card key={fb.id} className={cn(
            fb.priority === "CRITICAL" && "border-red-300",
            fb.priority === "HIGH" && "border-orange-200"
          )}>
            <CardContent className="p-0">
              {/* Header */}
              <div
                className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors rounded-xl"
                onClick={() => setExpanded(expanded === fb.id ? null : fb.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-semibold text-slate-900">{fb.subject}</p>
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", FEEDBACK_PRIORITY_COLORS[fb.priority])}>
                      {fb.priority}
                    </span>
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", FEEDBACK_STATUS_COLORS[fb.status])}>
                      {FEEDBACK_STATUS_LABELS[fb.status]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {fb.sourceType} · Issued by {fb.issuedBy} · {fb.createdAt}
                  </p>
                </div>
                {expanded === fb.id ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                )}
              </div>

              {/* Expanded */}
              {expanded === fb.id && (
                <div className="border-t border-slate-100 p-4 space-y-4">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-600 mb-1.5">CENRO Feedback:</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{fb.body}</p>
                  </div>

                  {fb.barangayResponse && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1.5">Our Response ({fb.respondedAt}):</p>
                      <p className="text-sm text-green-800 leading-relaxed">{fb.barangayResponse}</p>
                    </div>
                  )}

                  {fb.status !== "COMPLETED" && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-700 mb-1.5">Your Response</p>
                        <Textarea
                          className="text-sm min-h-[80px]"
                          placeholder="Describe the actions taken or planned..."
                          value={responses[fb.id] ?? fb.barangayResponse ?? ""}
                          onChange={(e) => setResponses((prev) => ({ ...prev, [fb.id]: e.target.value }))}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {fb.status === "NOT_STARTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-700 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleUpdateStatus(fb, "ONGOING")}
                          >
                            Mark Ongoing
                          </Button>
                        )}
                        {(fb.status === "ONGOING" || fb.status === "NOT_STARTED") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-amber-700 border-amber-200 hover:bg-amber-50"
                            onClick={() => handleUpdateStatus(fb, "FOR_VERIFICATION")}
                          >
                            Submit for Verification
                          </Button>
                        )}
                        {fb.status === "FOR_VERIFICATION" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUpdateStatus(fb, "COMPLETED")}
                          >
                            Mark Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {fb.status === "COMPLETED" && (
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                      ✓ Resolved — no further action required
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No feedback items for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
