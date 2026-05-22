import { useState, type ElementType } from "react";
import {
  FileImage, FileText, File, Upload, Search, Filter,
  Download, Eye, Trash2, FolderOpen, CheckCircle2, Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/shared/PageHeader";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { indicators } from "../data/indicators";
import { CATEGORY_LABELS } from "../types";
import type { IndicatorCategory } from "../types";
import { cn } from "../lib/utils";

// Generate mock evidence files
interface MockFile {
  id: string; indicatorId: string; indicatorCode: string; indicatorName: string;
  category: string; filename: string; fileType: "IMAGE" | "PDF" | "DOCUMENT";
  icon: ElementType; color: string; bg: string; sizeKb: number;
  uploadedAt: string; uploadedBy: string;
}

function generateMockFiles(): MockFile[] {
  const files: MockFile[] = [];
  const fileTypes = [
    { ext: "jpg", type: "IMAGE" as const, icon: FileImage, color: "text-blue-500", bg: "bg-blue-50" },
    { ext: "pdf", type: "PDF" as const, icon: FileText, color: "text-red-500", bg: "bg-red-50" },
    { ext: "docx", type: "DOCUMENT" as const, icon: File, color: "text-slate-500", bg: "bg-slate-50" },
  ];

  let id = 1;
  indicators.slice(0, 20).forEach((ind) => {
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const ft = fileTypes[i % fileTypes.length];
      files.push({
        id: `file-${id++}`,
        indicatorId: ind.id,
        indicatorCode: ind.code,
        indicatorName: ind.name,
        category: ind.category,
        filename: `${ind.code}_evidence_${i + 1}.${ft.ext}`,
        fileType: ft.type,
        icon: ft.icon,
        color: ft.color,
        bg: ft.bg,
        sizeKb: Math.floor(Math.random() * 2000) + 100,
        uploadedAt: `2025-02-${String(10 + Math.floor(Math.random() * 18)).padStart(2, "0")}`,
        uploadedBy: "Juan dela Cruz",
      });
    }
  });
  return files;
}

const mockFiles = generateMockFiles();

const CATEGORY_KEYS: IndicatorCategory[] = [
  "SWM_PROGRAMS",
  "COMMITTEE",
  "WASTE_COLLECTION_FEES",
  "ENV_COMMUNITY_IMPACT",
];

export function EvidenceRepositoryPage() {
  const { user, hasRole } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const isEncoder = hasRole("BARANGAY_ENCODER", "SYSTEM_ADMIN");

  const filtered = mockFiles.filter((f) => {
    const matchSearch =
      f.filename.toLowerCase().includes(search.toLowerCase()) ||
      f.indicatorCode.toLowerCase().includes(search.toLowerCase()) ||
      f.indicatorName.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || f.category === categoryFilter;
    const matchType = typeFilter === "All" || f.fileType === typeFilter;
    return matchSearch && matchCat && matchType;
  });

  const fileStats = {
    total: mockFiles.length,
    images: mockFiles.filter((f) => f.fileType === "IMAGE").length,
    pdfs: mockFiles.filter((f) => f.fileType === "PDF").length,
    docs: mockFiles.filter((f) => f.fileType === "DOCUMENT").length,
    totalMb: (mockFiles.reduce((a, b) => a + b.sizeKb, 0) / 1024).toFixed(1),
  };

  const brgyName = user?.barangayName ?? "Bagong Kalsada";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evidence Repository"
        subtitle={`${brgyName} — Uploaded compliance evidence for 2025 S1`}
      >
        {isEncoder && (
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4" />
            Upload Evidence
          </Button>
        )}
      </PageHeader>

      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
        <Info className="h-3.5 w-3.5 flex-shrink-0" />
        <span>
          <span className="font-semibold">Prototype notice:</span> Uploaded file previews are session-based.
          File metadata is saved locally, but actual files are not permanently stored in this frontend-only prototype.
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Files", value: fileStats.total, icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Images", value: fileStats.images, icon: FileImage, color: "text-green-600", bg: "bg-green-100" },
          { label: "PDFs", value: fileStats.pdfs, icon: FileText, color: "text-red-600", bg: "bg-red-100" },
          { label: "Storage Used", value: `${fileStats.totalMb} MB`, icon: File, color: "text-purple-600", bg: "bg-purple-100" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("rounded-xl p-2.5", stat.bg)}>
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search files or indicators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-64"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          {["All", ...CATEGORY_KEYS].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                categoryFilter === cat ? "bg-[#16a34a] text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {cat === "All" ? "All Categories" : CATEGORY_LABELS[cat as IndicatorCategory].split(" ")[0]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2">
          {["All", "IMAGE", "PDF", "DOCUMENT"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                typeFilter === type ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {type === "All" ? "All Types" : type}
            </button>
          ))}
        </div>

        <p className="self-center text-xs text-slate-500 ml-auto">{filtered.length} files</p>
      </div>

      {/* File grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((file) => {
          const Icon = file.icon;
          return (
            <Card key={file.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-4">
                {/* Preview area */}
                <div className={cn(
                  "h-28 rounded-xl flex flex-col items-center justify-center mb-3",
                  file.bg
                )}>
                  <Icon className={cn("h-10 w-10", file.color)} />
                  <span className="text-xs text-slate-500 mt-1 uppercase font-medium">
                    {file.fileType}
                  </span>
                </div>

                {/* File info */}
                <p className="text-xs font-semibold text-slate-900 truncate">{file.filename}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#16a34a] bg-green-50 rounded px-1.5 py-0.5">
                    {file.indicatorCode}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate">{file.indicatorName}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{file.uploadedAt}</span>
                  <span>{(file.sizeKb / 1024 >= 1 ? (file.sizeKb / 1024).toFixed(1) + " MB" : file.sizeKb + " KB")}</span>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-1.5">
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                    <Download className="h-3 w-3" />
                  </Button>
                  {isEncoder && (
                    <Button variant="outline" size="sm" className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <FolderOpen className="h-12 w-12 text-slate-300 mx-auto" />
          <p className="mt-3 text-slate-500 font-medium">No files found</p>
          <p className="text-sm text-slate-400">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Upload modal placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Upload Evidence</h3>
            <p className="text-sm text-slate-500 mb-4">Upload supporting documents for your audit indicators</p>

            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 mb-3">
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>File previews are session-based. Metadata is saved locally; actual files are not permanently stored.</span>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-[#16a34a] transition-colors cursor-pointer">
              <Upload className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="mt-2 text-sm font-medium text-slate-600">Drag & drop files here</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF, DOCX up to 10MB each</p>
              <Button variant="outline" size="sm" className="mt-3">
                Browse Files
              </Button>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button onClick={() => setShowUploadModal(false)}>
                <CheckCircle2 className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
