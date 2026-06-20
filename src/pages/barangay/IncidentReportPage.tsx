import { useState } from "react";
import { Plus, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { mockIncidents } from "../../data/collectionLogs";
import { cn } from "../../lib/utils";

const INCIDENT_TYPES = [
  "Illegal Dumping",
  "Open Burning",
  "Missed Collection",
  "Clogged Drainage",
  "MRF Violation",
  "Hauler Non-Compliance",
  "Community Complaint",
  "Other",
];

export function IncidentReportPage() {
  const { user } = useAuth();
  const barangayId = user?.barangayId ?? "brgy-001";
  const incidents = mockIncidents.filter((i) => i.barangayId === barangayId);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");

  const filtered = incidents.filter((i) => filter === "ALL" || i.status === filter);
  const openCount = incidents.filter((i) => i.status === "OPEN").length;
  const resolvedCount = incidents.filter((i) => i.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident Reports"
        subtitle="Log and track waste management incidents and complaints"
      >
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Report Incident
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-3xl font-bold text-slate-900">{incidents.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Incidents</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-3xl font-bold text-red-700">{openCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Open</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-3xl font-bold text-green-700">{resolvedCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Resolved</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["ALL", "OPEN", "RESOLVED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              filter === f ? "bg-[#16a34a] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            {f === "ALL" ? `All (${incidents.length})` : f === "OPEN" ? `Open (${openCount})` : `Resolved (${resolvedCount})`}
          </button>
        ))}
      </div>

      {/* Incident cards */}
      <div className="space-y-3">
        {filtered.map((inc) => (
          <Card key={inc.id} className={cn(inc.status === "OPEN" && "border-red-200")}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  inc.status === "OPEN" ? "bg-red-100" : "bg-green-100"
                )}>
                  {inc.status === "OPEN" ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-900">{inc.type}</p>
                    <span className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                      inc.status === "OPEN" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    )}>
                      {inc.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{inc.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>{inc.date}</span>
                    <span>{inc.location}</span>
                    <span>By: {inc.reportedBy}</span>
                    {inc.resolvedAt && <span>Resolved: {inc.resolvedAt}</span>}
                  </div>
                </div>
                {inc.status === "OPEN" && (
                  <Button size="sm" variant="outline" className="flex-shrink-0 text-green-700 border-green-200 hover:bg-green-50 text-xs">
                    Mark Resolved
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-8">No incidents found.</p>
        )}
      </div>

      {/* Add dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report an Incident</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Incident Date</Label>
                <Input className="mt-1.5" type="date" />
              </div>
              <div>
                <Label>Type</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input className="mt-1.5" placeholder="Street / Purok / Sitio" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1.5 min-h-[80px] text-sm" placeholder="Describe what happened..." />
            </div>
            <div>
              <Label>Reported By</Label>
              <Input className="mt-1.5" placeholder="Name / Position" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => setShowAdd(false)}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
