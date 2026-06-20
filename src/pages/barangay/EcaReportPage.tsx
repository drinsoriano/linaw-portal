import { useState } from "react";
import { Save, Send, ChevronDown, ChevronUp, Paperclip, CheckCircle2, Clock, RotateCcw, Users, ThumbsUp, MessageSquare, Pencil, FileDown } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useEca } from "../../context/EcaContext";
import { useToast } from "../../context/ToastContext";
import { barangays } from "../../data/barangays";
import { EcaReportPDF } from "../../components/shared/EcaReportPDF";
import type { EcaReport, EcaStatus, SectionReviewNote, NoteReply } from "../../types";
import { ECA_STATUS_COLORS, ECA_STATUS_LABELS } from "../../types";
import { cn } from "../../lib/utils";

const QUARTER_LABELS = { 1: "Q1 (Jan-Mar)", 2: "Q2 (Apr-Jun)", 3: "Q3 (Jul-Sep)", 4: "Q4 (Oct-Dec)" };

const formatDateTime = (iso: string) => {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${date} · ${time}`;
  } catch {
    return iso;
  }
};

const STATUS_TIMELINE: { status: EcaStatus; label: string; icon: typeof CheckCircle2 }[] = [
  { status: "DRAFT", label: "Draft", icon: Clock },
  { status: "SUBMITTED", label: "Committee Review", icon: Users },
  { status: "ENDORSED", label: "Endorsed", icon: ThumbsUp },
  { status: "PENDING", label: "CENRO Review", icon: Clock },
  { status: "ACCEPTED", label: "Accepted", icon: CheckCircle2 },
];

export function EcaReportPage() {
  const { user, hasRole } = useAuth();
  const isSecretary = hasRole("BARANGAY_SECRETARY", "SYSTEM_ADMIN");
  const isCouncilor = hasRole("BARANGAY_COUNCILOR");
  const isCaptain = hasRole("BARANGAY_CAPTAIN");
  const { getByBarangay, submitForReview, endorseReport, certifyToCenro, returnReport, updateReport } = useEca();
  const { toast } = useToast();

  const barangayId = user?.barangayId ?? "brgy-001";
  const barangayName = barangays.find((b) => b.id === barangayId)?.name ?? barangayId;
  const reports = getByBarangay(barangayId);

  const currentYear = 2025;
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedQuarter, setSelectedQuarter] = useState<string>("3");
  const [expandedSection, setExpandedSection] = useState<string | null>("sec-waste");

  const report: EcaReport | undefined = reports.find(
    (r) => r.year === parseInt(selectedYear) && r.quarter === parseInt(selectedQuarter)
  );

  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  // Note editing state — keyed by sectionId
  const [editingNoteSection, setEditingNoteSection] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});
  // Reply state — keyed by note.id
  const [replyingToNote, setReplyingToNote] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  // History accordion — set of sectionIds with history expanded
  const [historyExpanded, setHistoryExpanded] = useState<Set<string>>(new Set());

  const getFieldValue = (fieldId: string, defaultVal: string | number) => {
    return fieldValues[fieldId] ?? String(defaultVal);
  };

  const setFieldValue = (fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveDraft = () => {
    toast({ title: "Draft Saved", description: "ECA report saved as draft.", variant: "success" });
  };

  const handleSubmitForReview = () => {
    if (!report) return;
    submitForReview(report.id, user?.name ?? "Barangay Secretary");
    toast({ title: "Submitted for Review", description: "Sent to the Committee Chair on Environment (Councilor) for review.", variant: "success" });
  };

  const handleEndorse = () => {
    if (!report) return;
    endorseReport(report.id, user?.name ?? "Barangay Councilor");
    toast({ title: "Report Endorsed", description: "Endorsed to the Barangay Captain for certification.", variant: "success" });
  };

  const handleCertify = () => {
    if (!report) return;
    certifyToCenro(report.id, user?.name ?? "Barangay Captain");
    toast({ title: "Submitted to CENRO", description: "The report has been certified and submitted to CENRO for review.", variant: "success" });
  };

  const handleReturn = (toStatus: EcaStatus, label: string) => {
    if (!report) return;
    returnReport(report.id, toStatus, `Returned for revision by ${user?.name ?? "barangay reviewer"}.`);
    toast({ title: "Report Returned", description: `Sent back to the ${label}.`, variant: "warning" });
  };

  // Councilor reviews during SUBMITTED; Captain reviews during ENDORSED — each only touches their own role's notes
  const canComment =
    (isCouncilor && report?.status === "SUBMITTED") ||
    (isCaptain && report?.status === "ENDORSED");

  const myReviewRole: SectionReviewNote["role"] | null = isCouncilor
    ? "BARANGAY_COUNCILOR"
    : isCaptain
    ? "BARANGAY_CAPTAIN"
    : null;

  // Any of the three roles can reply within their respective review phase
  const canReply =
    (isSecretary && (report?.status === "DRAFT" || report?.status === "FOR_REVISION")) ||
    (isCouncilor && report?.status === "SUBMITTED") ||
    (isCaptain && report?.status === "ENDORSED");

  const myReplyRole: NoteReply["role"] = isCouncilor
    ? "BARANGAY_COUNCILOR"
    : isCaptain
    ? "BARANGAY_CAPTAIN"
    : "BARANGAY_SECRETARY";

  const handleSaveNote = (sectionId: string) => {
    if (!report || !myReviewRole) return;
    const text = noteInput[sectionId]?.trim();
    if (!text) return;
    const currentRound = report.revisionRound;
    const newNote: SectionReviewNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      round: currentRound,
      role: myReviewRole,
      by: user?.name ?? "Reviewer",
      note: text,
      createdAt: new Date().toISOString(),
    };
    const updatedSections = report.sections.map((s) => {
      if (s.id !== sectionId) return s;
      // Replace existing note for same role+round; preserve all others
      const kept = (s.reviewNotes ?? []).filter((n) => !(n.round === currentRound && n.role === myReviewRole));
      return { ...s, reviewNotes: [...kept, newNote] };
    });
    updateReport(report.id, { sections: updatedSections });
    setEditingNoteSection(null);
    toast({ title: "Note Saved", description: "Section note saved for the Barangay Secretary.", variant: "success" });
  };

  const handleMarkResolved = (sectionId: string, noteId: string, resolved = true) => {
    if (!report) return;
    const updatedSections = report.sections.map((s) => {
      if (s.id !== sectionId) return s;
      return { ...s, reviewNotes: (s.reviewNotes ?? []).map((n) => (n.id === noteId ? { ...n, resolved } : n)) };
    });
    updateReport(report.id, { sections: updatedSections });
    if (resolved) setReplyingToNote(null);
  };

  const handleSendReply = (sectionId: string, noteId: string) => {
    if (!report) return;
    const text = replyInput[noteId]?.trim();
    if (!text) return;
    const newReply: NoteReply = {
      id: `reply-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: myReplyRole,
      by: user?.name ?? "User",
      text,
      createdAt: new Date().toISOString(),
    };
    const updatedSections = report.sections.map((s) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        reviewNotes: (s.reviewNotes ?? []).map((n) =>
          n.id === noteId ? { ...n, replies: [...(n.replies ?? []), newReply] } : n
        ),
      };
    });
    updateReport(report.id, { sections: updatedSections });
    setReplyingToNote(null);
    setReplyInput((prev) => ({ ...prev, [noteId]: "" }));
    toast({ title: "Reply Sent", description: "Added to the discussion thread.", variant: "success" });
  };

  const toggleHistory = (sectionId: string) => {
    setHistoryExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  // Only the Secretary may edit the form fields, and only while it is a draft or returned for revision.
  const isReadOnly = !(isSecretary && (report?.status === "DRAFT" || report?.status === "FOR_REVISION"));

  const currentStatusIndex = report
    ? STATUS_TIMELINE.findIndex((s) => s.status === report.status)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="ECA Quarterly Report"
        subtitle="Environmental Compliance Activity — Calamba City CENRO"
      >
        {/* Secretary — encode and submit for committee review */}
        {isSecretary && (report?.status === "DRAFT" || report?.status === "FOR_REVISION") && (
          <>
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button size="sm" onClick={handleSubmitForReview} disabled={!report}>
              <Send className="h-4 w-4" />
              Submit for Review
            </Button>
          </>
        )}

        {/* Councilor (Committee Chair on Environment) — review and endorse */}
        {isCouncilor && report?.status === "SUBMITTED" && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-amber-700 border-amber-200 hover:bg-amber-50"
              onClick={() => handleReturn("DRAFT", "Barangay Secretary")}
            >
              <RotateCcw className="h-4 w-4" />
              Return to Secretary
            </Button>
            <Button size="sm" onClick={handleEndorse} disabled={!report}>
              <ThumbsUp className="h-4 w-4" />
              Endorse to Captain
            </Button>
          </>
        )}

        {/* Captain — certify and submit to CENRO */}
        {isCaptain && report?.status === "ENDORSED" && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-amber-700 border-amber-200 hover:bg-amber-50"
              onClick={() => handleReturn("SUBMITTED", "Committee Chair (Councilor)")}
            >
              <RotateCcw className="h-4 w-4" />
              Return to Councilor
            </Button>
            <Button size="sm" onClick={handleCertify} disabled={!report}>
              <Send className="h-4 w-4" />
              Certify & Submit to CENRO
            </Button>
          </>
        )}

        {/* Download PDF — available to all roles whenever a report exists */}
        {report && (
          <PDFDownloadLink
            document={<EcaReportPDF report={report} barangayName={barangayName} />}
            fileName={`ECA-Q${report.quarter}-${report.year}-Brgy${barangayName.replace(/\s+/g, "")}.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" size="sm" disabled={loading} className="gap-1.5">
                <FileDown className="h-4 w-4" />
                {loading ? "Generating…" : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        )}
      </PageHeader>

      {/* Quarter selector + status timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">Select Period</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-500 mb-1">Year</p>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2023, 2024, 2025].map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Quarter</p>
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((q) => (
                      <SelectItem key={q} value={q.toString()}>Q{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {report ? (
              <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold w-full justify-center", ECA_STATUS_COLORS[report.status])}>
                {ECA_STATUS_LABELS[report.status]}
              </span>
            ) : (
              <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 w-full justify-center">
                No report yet
              </span>
            )}
          </CardContent>
        </Card>

        {/* Status timeline */}
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Submission Status</p>
            <div className="flex items-center gap-0">
              {STATUS_TIMELINE.map((step, idx) => {
                const isDone = currentStatusIndex > idx;
                const isCurrent = currentStatusIndex === idx;
                const Icon = step.icon;
                return (
                  <div key={step.status} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center border-2",
                        isDone ? "bg-green-500 border-green-500" : isCurrent ? "bg-blue-500 border-blue-500" : "bg-white border-slate-300"
                      )}>
                        <Icon className={cn("h-4 w-4", isDone || isCurrent ? "text-white" : "text-slate-400")} />
                      </div>
                      <p className={cn("text-[10px] mt-1 font-medium text-center max-w-[60px]", isCurrent ? "text-blue-700" : isDone ? "text-green-700" : "text-slate-400")}>
                        {step.label}
                      </p>
                    </div>
                    {idx < STATUS_TIMELINE.length - 1 && (
                      <div className={cn("flex-1 h-0.5 mx-1", isDone ? "bg-green-400" : "bg-slate-200")} />
                    )}
                  </div>
                );
              })}
              {report?.status === "FOR_REVISION" && (
                <div className="ml-2 flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center border-2 bg-amber-500 border-amber-500">
                    <RotateCcw className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-[10px] mt-1 font-medium text-amber-700 text-center">For Revision</p>
                </div>
              )}
            </div>
            {report?.reviewRemarks && (
              <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-orange-800 mb-1">Barangay Review Remarks:</p>
                <p className="text-xs text-orange-700 leading-relaxed">{report.reviewRemarks}</p>
              </div>
            )}
            {report?.cenroFeedback && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-800 mb-1">CENRO Feedback:</p>
                <p className="text-xs text-amber-700 leading-relaxed">{report.cenroFeedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Past quarters reference */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {reports.slice(0, 5).map((r) => (
          <button
            key={r.id}
            onClick={() => { setSelectedQuarter(r.quarter.toString()); setSelectedYear(r.year.toString()); }}
            className={cn(
              "flex-shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
              r.year.toString() === selectedYear && r.quarter.toString() === selectedQuarter
                ? "bg-[#16a34a] text-white border-[#16a34a]"
                : "bg-white text-slate-700 border-slate-200 hover:border-green-400"
            )}
          >
            {QUARTER_LABELS[r.quarter]} {r.year}
            <span className={cn("ml-2 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-bold", ECA_STATUS_COLORS[r.status])}>
              {r.status}
            </span>
          </button>
        ))}
      </div>

      {/* Report sections */}
      {report ? (
        <div className="space-y-3">
          {report.sections.map((section) => {
            const currentRound = report.revisionRound;
            const allNotes = section.reviewNotes ?? [];
            const currentNotes = allNotes.filter((n) => n.round === currentRound);
            const pastNotes = allNotes.filter((n) => n.round < currentRound);
            const myCurrentNote = myReviewRole ? currentNotes.find((n) => n.role === myReviewRole) : undefined;
            const hasCurrentNotes = currentNotes.length > 0;
            const allResolved = hasCurrentNotes && currentNotes.every((n) => n.resolved);
            const isExpanded = expandedSection === section.id;
            const canResolve = isSecretary && (report.status === "DRAFT" || report.status === "FOR_REVISION");

            return (
              <Card key={section.id}>
                <CardContent className="p-0">
                  {/* Section header */}
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <button
                      className="flex-1 flex items-center gap-2 text-left min-w-0"
                      onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                    >
                      <p className="text-sm font-semibold text-slate-800">{section.label}</p>
                      {/* Note indicator badge */}
                      {hasCurrentNotes && (
                        <span className={cn(
                          "flex-shrink-0 inline-flex h-5 w-5 rounded-full items-center justify-center",
                          allResolved ? "bg-green-100" : "bg-amber-100"
                        )}>
                          <MessageSquare className={cn("h-3 w-3", allResolved ? "text-green-600" : "text-amber-600")} />
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {/* Reviewer: show + Note only if they haven't added one yet this round */}
                      {canComment && !myCurrentNote && editingNoteSection !== section.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setNoteInput((prev) => ({ ...prev, [section.id]: "" }));
                            setEditingNoteSection(section.id);
                            if (!isExpanded) setExpandedSection(section.id);
                          }}
                          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded px-2 py-1 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          + Note
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                        className="p-1"
                      >
                        {isExpanded
                          ? <ChevronUp className="h-4 w-4 text-slate-400" />
                          : <ChevronDown className="h-4 w-4 text-slate-400" />
                        }
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4 space-y-5">

                      {/* ── Review notes area ── */}
                      {(hasCurrentNotes || editingNoteSection === section.id || pastNotes.length > 0) && (
                        <div className="space-y-3">

                          {/* Current round notes — one per reviewer role */}
                          {currentNotes.map((reviewNote) => {
                            const isCouncilorNote = reviewNote.role === "BARANGAY_COUNCILOR";
                            const isMine = canComment && reviewNote.role === myReviewRole;
                            const isReplying = replyingToNote === reviewNote.id;

                            return (
                              <div key={reviewNote.id} className="space-y-1.5">
                                {/* Note bubble */}
                                <div className={cn(
                                  "rounded-xl p-3",
                                  reviewNote.resolved
                                    ? "bg-green-50 border border-green-200"
                                    : isCouncilorNote
                                    ? "bg-amber-50 border border-amber-200"
                                    : "bg-indigo-50 border border-indigo-200"
                                )}>
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className={cn(
                                        "text-[11px] font-semibold flex items-center gap-1.5 mb-1 flex-wrap",
                                        reviewNote.resolved ? "text-green-800"
                                          : isCouncilorNote ? "text-amber-800" : "text-indigo-800"
                                      )}>
                                        <MessageSquare className="h-3 w-3 flex-shrink-0" />
                                        {isCouncilorNote ? "Committee Review" : "Captain Review"} — {reviewNote.by}
                                        {reviewNote.resolved && (
                                          <span className="flex items-center gap-1 text-green-700">
                                            · <CheckCircle2 className="h-3 w-3" /> Resolved
                                          </span>
                                        )}
                                      </p>
                                      <p className={cn(
                                        "text-xs leading-relaxed",
                                        reviewNote.resolved
                                          ? "text-green-700 line-through opacity-60"
                                          : isCouncilorNote ? "text-amber-700" : "text-indigo-700"
                                      )}>
                                        {reviewNote.note}
                                      </p>
                                      <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDateTime(reviewNote.createdAt)}
                                        {!isMine && canComment && (
                                          <span className="ml-1 text-slate-300">(read-only)</span>
                                        )}
                                      </p>
                                    </div>
                                    {/* Only the role that wrote this note can edit it */}
                                    {isMine && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNoteInput((prev) => ({ ...prev, [section.id]: reviewNote.note }));
                                          setEditingNoteSection(section.id);
                                        }}
                                        className={cn(
                                          "flex-shrink-0 transition-colors",
                                          reviewNote.resolved ? "text-green-400 hover:text-green-700" : "text-slate-300 hover:text-slate-600"
                                        )}
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Threaded replies */}
                                {(reviewNote.replies ?? []).length > 0 && (
                                  <div className="ml-4 border-l-2 border-slate-100 pl-3 space-y-1.5">
                                    {(reviewNote.replies ?? []).map((reply) => {
                                      const isCouncilorReply = reply.role === "BARANGAY_COUNCILOR";
                                      const isCaptainReply = reply.role === "BARANGAY_CAPTAIN";
                                      return (
                                        <div
                                          key={reply.id}
                                          className={cn(
                                            "rounded-lg p-2.5 border",
                                            isCouncilorReply
                                              ? "bg-amber-50 border-amber-200"
                                              : isCaptainReply
                                              ? "bg-indigo-50 border-indigo-200"
                                              : "bg-blue-50 border-blue-200"
                                          )}
                                        >
                                          <p className={cn(
                                            "text-[11px] font-semibold mb-0.5",
                                            isCouncilorReply ? "text-amber-800"
                                              : isCaptainReply ? "text-indigo-800"
                                              : "text-blue-800"
                                          )}>
                                            ↩ {isCouncilorReply ? "Committee Review" : isCaptainReply ? "Captain" : "Secretary"} — {reply.by}
                                          </p>
                                          <p className={cn(
                                            "text-xs leading-relaxed",
                                            isCouncilorReply ? "text-amber-700"
                                              : isCaptainReply ? "text-indigo-700"
                                              : "text-blue-700"
                                          )}>
                                            {reply.text}
                                          </p>
                                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDateTime(reply.createdAt)}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Resolution + reply controls (not while typing a reply) */}
                                {!isReplying && (
                                  <div className="flex items-center gap-2 pl-1 flex-wrap">
                                    {canResolve && !reviewNote.resolved && (
                                      <>
                                        <p className="text-xs text-slate-500">Is this resolved?</p>
                                        <button
                                          type="button"
                                          onClick={() => handleMarkResolved(section.id, reviewNote.id)}
                                          className="flex items-center gap-1 text-xs font-semibold text-green-700 border border-green-200 hover:bg-green-50 rounded-lg px-3 py-1 transition-colors"
                                        >
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                          Yes, Resolved
                                        </button>
                                      </>
                                    )}
                                    {canResolve && reviewNote.resolved && (
                                      <>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                        <p className="text-xs text-green-700 font-semibold">Marked as resolved</p>
                                        <button
                                          type="button"
                                          onClick={() => handleMarkResolved(section.id, reviewNote.id, false)}
                                          className="text-xs text-slate-400 hover:text-slate-600 underline"
                                        >
                                          Undo
                                        </button>
                                      </>
                                    )}
                                    {canReply && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReplyInput((prev) => ({ ...prev, [reviewNote.id]: "" }));
                                          setReplyingToNote(reviewNote.id);
                                        }}
                                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-1 transition-colors"
                                      >
                                        <MessageSquare className="h-3 w-3" />
                                        Reply
                                      </button>
                                    )}
                                  </div>
                                )}

                                {/* Reply textarea — any role with canReply */}
                                {canReply && isReplying && (
                                  <div className="ml-4 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                                    <p className="text-xs font-semibold text-slate-700">
                                      {isSecretary ? "Your reply:" : "Add to thread:"}
                                    </p>
                                    <Textarea
                                      value={replyInput[reviewNote.id] ?? ""}
                                      onChange={(e) =>
                                        setReplyInput((prev) => ({ ...prev, [reviewNote.id]: e.target.value }))
                                      }
                                      className="text-xs min-h-[72px] bg-white"
                                      placeholder={
                                        isSecretary
                                          ? "Explain how this concern was or will be addressed before resubmission..."
                                          : "Add a follow-up comment or clarification..."
                                      }
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setReplyingToNote(null)}>
                                        Cancel
                                      </Button>
                                      <Button size="sm" className="h-7 text-xs" onClick={() => handleSendReply(section.id, reviewNote.id)}>
                                        Send Reply
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Note input form — reviewer adding/editing their note */}
                          {canComment && editingNoteSection === section.id && (
                            <div className={cn(
                              "rounded-xl p-3 space-y-2",
                              isCouncilor ? "bg-amber-50 border border-amber-200" : "bg-indigo-50 border border-indigo-200"
                            )}>
                              <p className={cn(
                                "text-xs font-semibold flex items-center gap-1.5",
                                isCouncilor ? "text-amber-800" : "text-indigo-800"
                              )}>
                                <MessageSquare className="h-3.5 w-3.5" />
                                {isCouncilor ? "Committee Review Note" : "Captain Review Note"} for Barangay Secretary
                              </p>
                              <Textarea
                                value={noteInput[section.id] ?? ""}
                                onChange={(e) => setNoteInput((prev) => ({ ...prev, [section.id]: e.target.value }))}
                                className="text-xs min-h-[80px] bg-white"
                                placeholder="e.g. Please provide the E.O. number and attach a certified copy..."
                              />
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingNoteSection(null)}>
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className={cn("h-7 text-xs text-white border-0", isCouncilor ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-500 hover:bg-indigo-600")}
                                  onClick={() => handleSaveNote(section.id)}
                                >
                                  Save Note
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* History accordion */}
                          {pastNotes.length > 0 && (
                            <div>
                              <button
                                type="button"
                                onClick={() => toggleHistory(section.id)}
                                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {historyExpanded.has(section.id)
                                  ? <ChevronUp className="h-3 w-3" />
                                  : <ChevronDown className="h-3 w-3" />
                                }
                                View history ({pastNotes.length} note{pastNotes.length !== 1 ? "s" : ""} from previous rounds)
                              </button>
                              {historyExpanded.has(section.id) && (
                                <div className="mt-2 pl-3 border-l-2 border-slate-100 space-y-3">
                                  {/* Group by round, newest first */}
                                  {[...new Set(pastNotes.map((n) => n.round))].sort((a, b) => b - a).map((round) => (
                                    <div key={round}>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                                        Round {round}
                                      </p>
                                      {pastNotes.filter((n) => n.round === round).map((pastNote) => {
                                        const isPastReplying = replyingToNote === pastNote.id;
                                        return (
                                          <div key={pastNote.id} className="mb-2 space-y-1">
                                            <div className={cn(
                                              "rounded-lg p-2.5 opacity-80",
                                              pastNote.role === "BARANGAY_COUNCILOR"
                                                ? "bg-amber-50 border border-amber-100"
                                                : "bg-indigo-50 border border-indigo-100"
                                            )}>
                                              <p className={cn(
                                                "text-[11px] font-semibold flex items-center gap-1 mb-0.5",
                                                pastNote.role === "BARANGAY_COUNCILOR" ? "text-amber-700" : "text-indigo-700"
                                              )}>
                                                <MessageSquare className="h-3 w-3" />
                                                {pastNote.role === "BARANGAY_COUNCILOR" ? "Committee" : "Captain"} — {pastNote.by}
                                                {pastNote.resolved && (
                                                  <span className="flex items-center gap-0.5 ml-1 text-green-600">
                                                    · <CheckCircle2 className="h-3 w-3" /> Resolved
                                                  </span>
                                                )}
                                              </p>
                                              <p className="text-xs text-slate-600 leading-relaxed">{pastNote.note}</p>
                                              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDateTime(pastNote.createdAt)}
                                              </p>
                                            </div>
                                            {/* Threaded replies in history */}
                                            {(pastNote.replies ?? []).length > 0 && (
                                              <div className="ml-3 border-l-2 border-slate-100 pl-2 space-y-1 mt-1">
                                                {(pastNote.replies ?? []).map((reply) => {
                                                  const isCouncilorReply = reply.role === "BARANGAY_COUNCILOR";
                                                  const isCaptainReply = reply.role === "BARANGAY_CAPTAIN";
                                                  return (
                                                    <div key={reply.id} className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                                                      <p className={cn(
                                                        "text-[11px] font-semibold mb-0.5",
                                                        isCouncilorReply ? "text-amber-700"
                                                          : isCaptainReply ? "text-indigo-700"
                                                          : "text-blue-700"
                                                      )}>
                                                        ↩ {isCouncilorReply ? "Committee" : isCaptainReply ? "Captain" : "Secretary"}: {reply.by}
                                                      </p>
                                                      <p className="text-xs text-slate-600 leading-relaxed">{reply.text}</p>
                                                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDateTime(reply.createdAt)}
                                                      </p>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}
                                            {/* Reply button — history threads stay open */}
                                            {canReply && !isPastReplying && (
                                              <div className="pl-1">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setReplyInput((prev) => ({ ...prev, [pastNote.id]: "" }));
                                                    setReplyingToNote(pastNote.id);
                                                  }}
                                                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                  <MessageSquare className="h-3 w-3" />
                                                  Reply
                                                </button>
                                              </div>
                                            )}
                                            {/* Reply textarea for history thread */}
                                            {canReply && isPastReplying && (
                                              <div className="ml-3 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                                                <p className="text-xs font-semibold text-slate-700">
                                                  {isSecretary ? "Your reply:" : "Add to thread:"}
                                                </p>
                                                <Textarea
                                                  value={replyInput[pastNote.id] ?? ""}
                                                  onChange={(e) =>
                                                    setReplyInput((prev) => ({ ...prev, [pastNote.id]: e.target.value }))
                                                  }
                                                  className="text-xs min-h-[60px] bg-white"
                                                  placeholder={
                                                    isSecretary
                                                      ? "Explain how this concern was or will be addressed..."
                                                      : "Add a follow-up comment or clarification..."
                                                  }
                                                />
                                                <div className="flex gap-2 justify-end">
                                                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setReplyingToNote(null)}>
                                                    Cancel
                                                  </Button>
                                                  <Button size="sm" className="h-7 text-xs" onClick={() => handleSendReply(section.id, pastNote.id)}>
                                                    Send Reply
                                                  </Button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Form fields ── */}
                      {section.fields.map((field) => {
                        const val = getFieldValue(field.id, field.value);
                        const selectedValues = val ? val.split(",").map((v) => v.trim()) : [];

                        return (
                          <div key={field.id} className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 leading-snug block">
                              {field.label}
                              {field.unit && <span className="text-slate-400 ml-1 font-normal">({field.unit})</span>}
                            </label>
                            {field.hint && (
                              <p className="text-[11px] text-slate-400 italic">{field.hint}</p>
                            )}

                            {/* Boolean — Yes / No toggle */}
                            {field.type === "boolean" && (
                              <div className="flex gap-2">
                                {["Yes", "No"].map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    disabled={isReadOnly}
                                    onClick={() => !isReadOnly && setFieldValue(field.id, opt)}
                                    className={cn(
                                      "px-5 py-1.5 rounded-lg border-2 text-sm font-semibold transition-all",
                                      val === opt
                                        ? opt === "Yes"
                                          ? "bg-green-600 border-green-600 text-white"
                                          : "bg-red-500 border-red-500 text-white"
                                        : "bg-white border-slate-300 text-slate-500 hover:border-slate-400",
                                      isReadOnly && "cursor-default opacity-80"
                                    )}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Computed — read-only derived value */}
                            {field.type === "computed" && (
                              <div className={cn(
                                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold border",
                                val === "Yes" ? "bg-green-50 border-green-200 text-green-800"
                                  : val === "No" ? "bg-red-50 border-red-200 text-red-700"
                                  : val ? "bg-slate-50 border-slate-200 text-slate-800"
                                  : "bg-slate-50 border-slate-200 text-slate-400"
                              )}>
                                {val || "—"}
                              </div>
                            )}

                            {/* Checkbox — multi-select list */}
                            {field.type === "checkbox" && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {(field.options ?? []).map((opt) => {
                                  const checked = selectedValues.includes(opt);
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      disabled={isReadOnly}
                                      onClick={() => {
                                        if (isReadOnly) return;
                                        const next = checked
                                          ? selectedValues.filter((v) => v !== opt)
                                          : [...selectedValues, opt];
                                        setFieldValue(field.id, next.join(","));
                                      }}
                                      className={cn(
                                        "flex items-center gap-2 text-left px-3 py-2 rounded-lg border text-xs transition-all",
                                        checked
                                          ? "bg-green-50 border-green-400 text-green-800 font-semibold"
                                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300",
                                        isReadOnly && "cursor-default"
                                      )}
                                    >
                                      <span className={cn(
                                        "h-4 w-4 rounded border-2 flex-shrink-0 flex items-center justify-center",
                                        checked ? "bg-green-600 border-green-600" : "border-slate-300"
                                      )}>
                                        {checked && <span className="text-white text-[9px] font-black">✓</span>}
                                      </span>
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Select — single-choice dropdown */}
                            {field.type === "select" && (
                              <Select
                                value={val || "__none__"}
                                onValueChange={(v) => !isReadOnly && setFieldValue(field.id, v === "__none__" ? "" : v)}
                                disabled={isReadOnly}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue placeholder="Select an option..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">— Select —</SelectItem>
                                  {(field.options ?? []).map((opt) => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            {/* Textarea */}
                            {field.type === "textarea" && (
                              <Textarea
                                value={val}
                                onChange={(e) => setFieldValue(field.id, e.target.value)}
                                disabled={isReadOnly}
                                className="text-sm min-h-[80px]"
                                placeholder="Enter details..."
                              />
                            )}

                            {/* Text / number / date */}
                            {(field.type === "text" || field.type === "number" || field.type === "date") && (
                              <Input
                                type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                                value={val}
                                onChange={(e) => setFieldValue(field.id, e.target.value)}
                                disabled={isReadOnly}
                                className="text-sm"
                                placeholder={`Enter value...`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Attachments */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-800">Attachments</p>
                {!isReadOnly && (
                  <Button size="sm" variant="outline">
                    <Paperclip className="h-3.5 w-3.5" />
                    Attach File
                  </Button>
                )}
              </div>
              {report.attachments.length === 0 ? (
                <p className="text-xs text-slate-400">No attachments yet. Upload supporting documents.</p>
              ) : (
                <ul className="space-y-2">
                  {report.attachments.map((att) => (
                    <li key={att.id} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                      <Paperclip className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{att.filename}</p>
                        <p className="text-[10px] text-slate-400">{att.fileType} · {(att.sizeBytes / 1024).toFixed(0)} KB · {att.uploadedAt}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-400 text-sm">No ECA report found for Q{selectedQuarter} {selectedYear}.</p>
            <Button className="mt-4" onClick={() => updateReport("new", {})}>
              Start New Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
