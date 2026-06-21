import { useState } from "react";
import {
  FileText, Download, Eye, BarChart3,
  ClipboardList, FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { useSubmissions } from "../context/SubmissionsContext";
import { barangays } from "../data/barangays";
import { cn } from "../lib/utils";

const REPORT_TYPES = [
  {
    id: "audit",
    label: "Audit Report",
    description: "Complete audit checklist results with indicator scores, evidence references, and CENRO remarks.",
    icon: ClipboardList,
    color: "text-blue-700",
    bg: "bg-blue-100",
    formats: ["PDF", "Excel"],
    scope: "per-barangay",
  },
  {
    id: "compliance",
    label: "Compliance Summary",
    description: "City-wide compliance summary with category averages, benchmark comparison, and ranking.",
    icon: BarChart3,
    color: "text-green-700",
    bg: "bg-green-100",
    formats: ["PDF", "Excel"],
    scope: "city-wide",
  },
  {
    id: "cap",
    label: "CAP Report",
    description: "Corrective Action Plan report with Why-Why analysis, root causes, and action item status.",
    icon: FileText,
    color: "text-purple-700",
    bg: "bg-purple-100",
    formats: ["PDF"],
    scope: "per-barangay",
  },
  {
    id: "indicator",
    label: "Indicator Analysis",
    description: "Detailed indicator-level report comparing all barangays for a specific indicator.",
    icon: FileSpreadsheet,
    color: "text-amber-700",
    bg: "bg-amber-100",
    formats: ["Excel"],
    scope: "city-wide",
  },
];

const RECENT_REPORTS = [
  { id: 1, name: "City Compliance Summary — 2025 S1", date: "Mar 15, 2025", type: "Compliance Summary", format: "PDF", size: "1.2 MB" },
  { id: 2, name: "Bagong Kalsada Audit Report — 2025 S1", date: "Mar 12, 2025", type: "Audit Report", format: "PDF", size: "890 KB" },
  { id: 3, name: "WCF5 Indicator Analysis — All Barangays", date: "Mar 10, 2025", type: "Indicator Analysis", format: "Excel", size: "450 KB" },
  { id: 4, name: "Bagong Kalsada CAP Report", date: "Mar 8, 2025", type: "CAP Report", format: "PDF", size: "320 KB" },
  { id: 5, name: "City Compliance Summary — 2024 S2", date: "Jan 20, 2025", type: "Compliance Summary", format: "PDF", size: "1.1 MB" },
];

export function ReportsPage() {
  useAuth(); // preserves auth context requirement
  const { submissions, activeCycle } = useSubmissions();
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string>("brgy-001");
  const [generating, setGenerating] = useState(false);

  const cycleSubs = submissions.filter((s) => s.cycleId === activeCycle.id);
  const validatedBarangays = cycleSubs
    .filter((s) => s.status === "VALIDATED" || s.status === "REVIEWED")
    .map((s) => barangays.find((b) => b.id === s.barangayId))
    .filter(Boolean);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setGenerating(false);
    alert("Report generated! (Demo — PDF download simulated)");
  };

  const selectedType = REPORT_TYPES.find((r) => r.id === selectedReportType);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate and download compliance reports for audit cycles"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report type selector */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Select Report Type</h3>
          <div className="space-y-3">
            {REPORT_TYPES.map((report) => {
              const Icon = report.icon;
              const isSelected = selectedReportType === report.id;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReportType(report.id)}
                  className={cn(
                    "w-full text-left rounded-xl border-2 p-4 transition-all",
                    isSelected
                      ? "border-[#16a34a] bg-green-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("rounded-xl p-2.5", report.bg)}>
                      <Icon className={cn("h-5 w-5", report.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{report.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{report.description}</p>
                      <div className="flex gap-1 mt-2">
                        {report.formats.map((f) => (
                          <span key={f} className="text-[10px] font-semibold bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">
                            {f}
                          </span>
                        ))}
                        <span className="text-[10px] text-slate-400 self-center ml-1">
                          {report.scope === "city-wide" ? "City-wide" : "Per barangay"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report configuration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Configure Report</h3>

          {!selectedType ? (
            <div className="h-48 flex items-center justify-center bg-white rounded-xl border border-dashed border-slate-300">
              <div className="text-center">
                <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-400 mt-2">Select a report type</p>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{selectedType.label}</CardTitle>
                <CardDescription>{selectedType.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1.5">Audit Cycle</p>
                  <Select defaultValue="2025-s1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-s1">2025 — First Semester</SelectItem>
                      <SelectItem value="2024-s2">2024 — Second Semester</SelectItem>
                      <SelectItem value="2024-s1">2024 — First Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedType.scope === "per-barangay" && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-1.5">Barangay</p>
                    <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {validatedBarangays.map((b) => (
                          <SelectItem key={b!.id} value={b!.id}>{b!.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1.5">Format</p>
                  <div className="flex gap-2">
                    {selectedType.formats.map((fmt) => (
                      <button
                        key={fmt}
                        className="flex-1 rounded-lg border-2 border-[#16a34a] bg-green-50 text-green-800 text-sm font-semibold py-2"
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1.5">Include Sections</p>
                  <div className="space-y-1.5">
                    {["Cover page", "Executive summary", "Category breakdown", "Per-indicator scores", "Evidence references", "CENRO remarks"].map((section) => (
                      <label key={section} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-[#16a34a]" />
                        <span className="text-xs text-slate-700">{section}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  className="w-full"
                  disabled={generating}
                >
                  {generating ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent reports */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700">Recent Reports</h3>
          <div className="space-y-2">
            {RECENT_REPORTS.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 leading-snug">{report.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">{report.date}</span>
                        <span className={cn(
                          "text-[10px] font-semibold rounded px-1.5 py-0.5",
                          report.format === "PDF" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        )}>
                          {report.format}
                        </span>
                        <span className="text-[10px] text-slate-400">{report.size}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
