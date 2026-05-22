import { useState } from "react";
import {
  Shield, Database, Bell, Users,
  ChevronRight, Save, RotateCcw, Calendar, Target,
  AlertTriangle, CheckCircle2, Leaf,
} from "lucide-react";
import { PageHeader } from "../components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../context/AuthContext";
import { BENCHMARK, CAP_THRESHOLD, SCORE_RANGE_LABELS } from "../lib/scoring";
import { COMPLIANCE_LABELS, COMPLIANCE_COLORS } from "../types";
import { cn } from "../lib/utils";

const AUDIT_CYCLE = {
  id: "cycle-2025-s1",
  year: 2025,
  semester: "First",
  label: "2025 First Semester",
  status: "ACTIVE" as const,
  startDate: "January 15, 2025",
  endDate: "June 30, 2025",
};

const SYSTEM_INFO = {
  version: "1.0.0-prototype",
  legalBasis: "Republic Act No. 9003",
  fullName: "Ecological Solid Waste Management Act of 2000",
  city: "Calamba City, Laguna",
  totalBarangays: 54,
  framework: "PDCA — Plan, Do, Check, Act",
  researchBase: "PUP Open University System — Dissertation Research",
};

export function SettingsPage() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole("SYSTEM_ADMIN");
  const [cycleStatus, setCycleStatus] = useState<"ACTIVE" | "CLOSED">(AUDIT_CYCLE.status);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        subtitle="LINAW Portal configuration and system information"
      >
        {isAdmin && (
          <Button size="sm" onClick={handleSave} className="gap-2">
            {saved ? (
              <><CheckCircle2 className="h-4 w-4" /> Saved</>
            ) : (
              <><Save className="h-4 w-4" /> Save Changes</>
            )}
          </Button>
        )}
      </PageHeader>

      {!isAdmin && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            You have read-only access to system settings. Contact the System Administrator to make changes.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Audit Cycle */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <CardTitle className="text-base">Audit Cycle Management</CardTitle>
                  <CardDescription>Current monitoring period for RA 9003 compliance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Active Cycle</p>
                  <p className="font-semibold text-slate-900">{AUDIT_CYCLE.label}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                      cycleStatus === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-600"
                    )}>
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        cycleStatus === "ACTIVE" ? "bg-green-500" : "bg-slate-400"
                      )} />
                      {cycleStatus}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Start Date</p>
                  <p className="font-semibold text-slate-900">{AUDIT_CYCLE.startDate}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">End Date</p>
                  <p className="font-semibold text-slate-900">{AUDIT_CYCLE.endDate}</p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant={cycleStatus === "ACTIVE" ? "outline" : "default"}
                    className={cycleStatus === "ACTIVE" ? "border-red-200 text-red-700 hover:bg-red-50" : ""}
                    onClick={() => setCycleStatus(cycleStatus === "ACTIVE" ? "CLOSED" : "ACTIVE")}
                  >
                    {cycleStatus === "ACTIVE" ? "Close Cycle" : "Reopen Cycle"}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Create New Cycle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scoring Thresholds */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <Target className="h-4 w-4 text-green-700" />
                </div>
                <div>
                  <CardTitle className="text-base">Scoring Thresholds</CardTitle>
                  <CardDescription>
                    Fixed benchmarks defined by RA 9003 and the LINAW compliance framework
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                  <p className="text-xs text-green-700 font-semibold mb-1">Full Compliance Benchmark</p>
                  <p className="text-3xl font-bold text-green-800">{BENCHMARK}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Indicators scoring ≥ {BENCHMARK} meet the expected RA 9003 standard.
                  </p>
                </div>
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-700 font-semibold mb-1">CAP Required Threshold</p>
                  <p className="text-3xl font-bold text-amber-800">{CAP_THRESHOLD}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Indicators scoring below {CAP_THRESHOLD} require a Corrective Action Plan.
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">5-Point Compliance Scale</p>
                <div className="space-y-1.5">
                  {SCORE_RANGE_LABELS.map((r) => (
                    <div key={r.range} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500 w-16 flex-shrink-0">{r.range}</span>
                      <span className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                        COMPLIANCE_COLORS[r.level]
                      )}>
                        {COMPLIANCE_LABELS[r.level]}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-3">
                  Thresholds are read-only and governed by RA 9003 and the LINAW research framework.
                  Contact the dissertation research team for methodology questions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-purple-700" />
                </div>
                <div>
                  <CardTitle className="text-base">Role-Based Access Control</CardTitle>
                  <CardDescription>User roles and their system permissions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  {
                    role: "System Administrator",
                    color: "bg-purple-100 text-purple-800",
                    perms: ["Full system access", "User management", "All barangays", "Settings"],
                  },
                  {
                    role: "CENRO Evaluator",
                    color: "bg-blue-100 text-blue-800",
                    perms: ["Validate submissions", "City-wide dashboard", "Approve reports", "All barangays"],
                  },
                  {
                    role: "Barangay Captain",
                    color: "bg-emerald-100 text-emerald-800",
                    perms: ["Review checklist", "Approve/return submissions", "Barangay dashboard"],
                  },
                  {
                    role: "Barangay Encoder",
                    color: "bg-green-100 text-green-800",
                    perms: ["Encode checklist", "Upload evidence", "Submit for approval", "Own barangay only"],
                  },
                  {
                    role: "Researcher / Auditor",
                    color: "bg-amber-100 text-amber-800",
                    perms: ["View results", "Generate reports", "Root cause analysis", "Read-only"],
                  },
                  {
                    role: "Public Viewer",
                    color: "bg-slate-100 text-slate-600",
                    perms: ["Public dashboard only", "No confidential data", "No editing"],
                  },
                ].map((item) => (
                  <div key={item.role} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold flex-shrink-0", item.color)}>
                      {item.role}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.perms.map((p) => (
                        <span key={p} className="text-[11px] text-slate-600 bg-slate-100 rounded px-1.5 py-0.5">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {isAdmin && (
                <Button variant="outline" size="sm" className="mt-3 gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Manage Users
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Current user */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#16a34a] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {user?.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">Role</span>
                  <Badge variant="outline" className="text-xs">{user?.role.replace(/_/g, " ")}</Badge>
                </div>
                {user?.barangayName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-xs">Barangay</span>
                    <span className="text-xs font-medium text-slate-900">{user.barangayName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 text-xs">Status</span>
                  <span className="text-xs font-semibold text-green-700">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About LINAW */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#16a34a] flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-base">About LINAW</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {[
                  { label: "System Version", value: SYSTEM_INFO.version },
                  { label: "Legal Basis", value: SYSTEM_INFO.legalBasis },
                  { label: "Coverage", value: SYSTEM_INFO.city },
                  { label: "Barangays", value: `${SYSTEM_INFO.totalBarangays} barangays` },
                  { label: "Framework", value: SYSTEM_INFO.framework },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-2">
                    <span className="text-[11px] text-slate-500 flex-shrink-0">{item.label}</span>
                    <span className="text-[11px] font-medium text-slate-800 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-[11px] text-green-800 font-semibold">{SYSTEM_INFO.fullName}</p>
                <p className="text-[10px] text-green-600 mt-1">{SYSTEM_INFO.researchBase}</p>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                © 2025 Calamba City LGU — CENRO &amp; PUP OUS
              </p>
            </CardContent>
          </Card>

          {/* Quick links */}
          {isAdmin && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  { label: "Manage Users", icon: Users },
                  { label: "Export All Data", icon: Database },
                  { label: "Notification Settings", icon: Bell },
                ].map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-700 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-slate-400" />
                      {label}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
