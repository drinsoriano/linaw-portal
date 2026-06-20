import { useState } from "react";
import { Search, Plus, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { mockHaulers } from "../../data/haulers";
import type { HaulerRecord, HaulerStatus } from "../../types";
import { cn } from "../../lib/utils";

const STATUS_STYLES: Record<HaulerStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  EXPIRED: "bg-red-100 text-red-700 border-red-200",
  SUSPENDED: "bg-amber-100 text-amber-700 border-amber-200",
};

export function HaulerAccreditationPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = mockHaulers.filter((h) => {
    const matchSearch =
      h.companyName.toLowerCase().includes(search.toLowerCase()) ||
      h.accreditationNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || h.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const summary = {
    active: mockHaulers.filter((h) => h.status === "ACTIVE").length,
    expired: mockHaulers.filter((h) => h.status === "EXPIRED").length,
    suspended: mockHaulers.filter((h) => h.status === "SUSPENDED").length,
  };

  const isExpiringSoon = (validUntil: string) => {
    const days = (new Date(validUntil).getTime() - Date.now()) / 86400000;
    return days > 0 && days <= 60;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hauler Accreditation"
        subtitle="Registered waste hauler companies and their accreditation status"
      >
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Add Hauler
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active", value: summary.active, color: "text-green-700", bg: "bg-green-50 border-green-200" },
          { label: "Expired", value: summary.expired, color: "text-red-700", bg: "bg-red-50 border-red-200" },
          { label: "Suspended", value: summary.suspended, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
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
            placeholder="Search company or accreditation no."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-72"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add Hauler Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Hauler Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Company Name</Label>
              <Input className="mt-1.5" placeholder="Enter company name" />
            </div>
            <div>
              <Label>Accreditation No.</Label>
              <Input className="mt-1.5" placeholder="CENRO-XXX-YYYY-NNN" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Valid From</Label>
                <Input className="mt-1.5" type="date" />
              </div>
              <div>
                <Label>Valid Until</Label>
                <Input className="mt-1.5" type="date" />
              </div>
            </div>
            <div>
              <Label>Contact Person</Label>
              <Input className="mt-1.5" placeholder="Full name" />
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input className="mt-1.5" placeholder="049-555-XXXX" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => setShowAdd(false)}>Add Hauler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map((h: HaulerRecord) => (
          <Card key={h.id} className={cn(
            "transition-shadow",
            h.status === "SUSPENDED" && "border-amber-200",
            h.status === "EXPIRED" && "border-red-200"
          )}>
            <CardContent className="p-0">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer"
                onClick={() => setExpanded(expanded === h.id ? null : h.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900">{h.companyName}</p>
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", STATUS_STYLES[h.status])}>
                      {h.status}
                    </span>
                    {isExpiringSoon(h.validUntil) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 text-xs font-semibold">
                        <AlertTriangle className="h-3 w-3" />
                        Expiring Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {h.accreditationNo} · Valid {h.validFrom} → {h.validUntil} · {h.contactPerson}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-xs">
                    {h.safetyPassed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={h.safetyPassed ? "text-green-700" : "text-red-500"}>
                      Safety {h.safetyPassed ? "OK" : "Fail"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    {h.charterUploaded ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={h.charterUploaded ? "text-green-700" : "text-red-500"}>
                      Charter
                    </span>
                  </div>
                  {expanded === h.id ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>

              {expanded === h.id && (
                <div className="border-t border-slate-100 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Contact</p>
                      <p className="text-slate-700">{h.contactPerson}</p>
                      <p className="text-slate-500 text-xs">{h.contactPhone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-1">Linked Barangays</p>
                      <p className="text-slate-700">{h.linkedBarangays.length} barangays</p>
                    </div>
                  </div>

                  {h.violations.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-600 mb-1.5">Violation History</p>
                      <ul className="space-y-1">
                        {h.violations.map((v, i) => (
                          <li key={i} className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-1.5">
                            {v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {h.violations.length === 0 && (
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                      <CheckCircle className="h-3.5 w-3.5" />
                      No violations on record
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Edit Record</Button>
                    {h.status === "ACTIVE" && (
                      <Button size="sm" variant="outline" className="text-amber-700 border-amber-200 hover:bg-amber-50">
                        Suspend
                      </Button>
                    )}
                    {h.status === "SUSPENDED" && (
                      <Button size="sm" variant="outline" className="text-green-700 border-green-200 hover:bg-green-50">
                        Reinstate
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
