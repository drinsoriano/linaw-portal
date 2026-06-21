import { useState, useMemo } from "react";
import ExcelJS from "exceljs";
import { FileSpreadsheet, Download, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "../../components/shared/PageHeader";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { barangays } from "../../data/barangays";
import { useEca } from "../../context/EcaContext";
import type { EcaReport } from "../../types";
import { cn } from "../../lib/utils";

function getField(report: EcaReport | undefined, id: string): string {
  if (!report) return "";
  for (const section of report.sections) {
    const f = section.fields.find((field) => field.id === id);
    if (f !== undefined) return String(f.value ?? "");
  }
  return "";
}

function parseNum(val: string): number {
  const n = parseFloat(val.replace(/[,%]/g, ""));
  return isNaN(n) ? 0 : n;
}

const YEARS = [2024, 2025, 2026];
const QUARTERS = [1, 2, 3, 4] as const;

const COL_WIDTHS = [5, 24, 16, 16, 16, 14, 12, 18, 16, 14, 12, 16, 14];

export function ConsolidatedEcaPage() {
  const { reports } = useEca();
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>(1);
  const [year, setYear] = useState(2025);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(barangays.map((b) => b.id))
  );

  const allSelected = selectedIds.size === barangays.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(barangays.map((b) => b.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const periodReports = useMemo(
    () => reports.filter((r) => r.quarter === quarter && r.year === year),
    [reports, quarter, year]
  );

  const reportMap = useMemo(() => {
    const m = new Map<string, EcaReport>();
    for (const r of periodReports) m.set(r.barangayId, r);
    return m;
  }, [periodReports]);

  const rows = useMemo(() => {
    return barangays
      .filter((b) => selectedIds.has(b.id))
      .map((b, idx) => {
        const report = reportMap.get(b.id);
        return {
          no: idx + 1,
          barangayId: b.id,
          name: b.name,
          popPrev: b.population,
          popCurrent: getField(report, "g5"),
          households: getField(report, "g6"),
          compliant: getField(report, "s2"),
          percentage: getField(report, "s3"),
          ewg: getField(report, "wg2"),
          bio: getField(report, "wg5"),
          rec: getField(report, "wg6"),
          others: getField(report, "wg7"),
          totalVol: getField(report, "wg8"),
          diverted: getField(report, "wg9"),
          hasReport: !!report,
        };
      });
  }, [barangays, selectedIds, reportMap]);

  const totals = useMemo(() => {
    const filled = rows.filter((r) => r.hasReport);
    const sum = (key: keyof typeof rows[0]) =>
      filled.reduce((acc, r) => acc + parseNum(String(r[key])), 0);
    const avg = (key: keyof typeof rows[0]) =>
      filled.length > 0 ? sum(key) / filled.length : 0;
    return {
      popPrev: filled.reduce((acc, r) => acc + r.popPrev, 0),
      popCurrent: sum("popCurrent"),
      households: sum("households"),
      compliant: sum("compliant"),
      percentage: avg("percentage"),
      ewg: sum("ewg"),
      bio: sum("bio"),
      rec: sum("rec"),
      others: sum("others"),
      totalVol: sum("totalVol"),
      diverted: avg("diverted"),
    };
  }, [rows]);

  const fmt = (val: string | number, isPercent = false): string => {
    if (val === "" || (val === 0 && !isPercent)) return "";
    const n = typeof val === "string" ? parseNum(val) : val;
    if (isNaN(n) || n === 0) return "";
    if (isPercent) return `${n.toFixed(2)}%`;
    return n.toLocaleString("en-PH", { maximumFractionDigits: 2 });
  };

  const handleExport = async () => {
    const prevYear = year - 1;
    const title = `Q${quarter} ${year} CONSOLIDATION — Calamba City ECA Report (${selectedIds.size} of ${barangays.length} Barangays)`;

    const headers = [
      "NO",
      "BARANGAY",
      `${prevYear} TOTAL POPULATION`,
      `${year} TOTAL POPULATION`,
      "NO. OF HOUSEHOLDS",
      "TOTAL COMPLIANT",
      "PERCENTAGE",
      "EWG PER QUARTER",
      "BIODEGRADABLE",
      "RECYCLABLES",
      "OTHERS",
      "TOTAL VOLUME",
      "WASTE DIVERTED",
    ];

    const wb = new ExcelJS.Workbook();
    wb.creator = "LINAW Portal";
    const ws = wb.addWorksheet(`Q${quarter} ${year}`);

    // Column widths
    ws.columns = COL_WIDTHS.map((w) => ({ width: w }));

    // ── Row 1: Title ──
    ws.addRow([title]);
    ws.mergeCells(1, 1, 1, 13);
    const titleCell = ws.getCell("A1");
    titleCell.font = { name: "Arial", size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 28;

    // ── Row 2: blank spacer ──
    ws.addRow([]);

    // ── Row 3: Column headers ──
    ws.addRow(headers);
    const headerRow = ws.getRow(3);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F2D1A" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: "FF1A4229" } },
        bottom: { style: "thin", color: { argb: "FF1A4229" } },
        left: { style: "thin", color: { argb: "FF1A4229" } },
        right: { style: "thin", color: { argb: "FF1A4229" } },
      };
    });

    // ── Data rows ──
    rows.forEach((r, i) => {
      const dataRow = ws.addRow([
        r.no,
        r.name,
        r.popPrev || "",
        r.popCurrent ? parseNum(r.popCurrent) : "",
        r.households ? parseNum(r.households) : "",
        r.compliant ? parseNum(r.compliant) : "",
        r.percentage || "",
        r.ewg ? parseNum(r.ewg) : "",
        r.bio ? parseNum(r.bio) : "",
        r.rec ? parseNum(r.rec) : "",
        r.others ? parseNum(r.others) : "",
        r.totalVol ? parseNum(r.totalVol) : "",
        r.diverted || "",
      ]);
      const isEven = i % 2 === 1;
      dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = { name: "Arial", size: 10 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: isEven ? "FFF8FAFC" : "FFFFFFFF" },
        };
        cell.border = {
          bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
          left: { style: "hair", color: { argb: "FFE2E8F0" } },
          right: { style: "hair", color: { argb: "FFE2E8F0" } },
        };
        if (colNumber === 1) cell.alignment = { horizontal: "center" };
        else if (colNumber === 2) cell.alignment = { horizontal: "left" };
        else cell.alignment = { horizontal: "right" };
      });
      if (!r.hasReport) {
        dataRow.getCell(2).font = { name: "Arial", size: 10, italic: true, color: { argb: "FF94A3B8" } };
      }
    });

    // ── Blank spacer before totals ──
    ws.addRow([]);

    // ── Totals row ──
    const totalsRow = ws.addRow([
      "",
      `TOTAL / AVERAGE (${rows.filter((r) => r.hasReport).length} reports)`,
      totals.popPrev || "",
      totals.popCurrent || "",
      totals.households || "",
      totals.compliant || "",
      totals.percentage ? `${totals.percentage.toFixed(2)}%` : "",
      totals.ewg || "",
      totals.bio || "",
      totals.rec || "",
      totals.others || "",
      totals.totalVol || "",
      totals.diverted ? `${totals.diverted.toFixed(2)}%` : "",
    ]);
    totalsRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: "Arial", size: 10, bold: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2F4E8" } };
      cell.border = {
        top: { style: "medium", color: { argb: "FF16A34A" } },
        bottom: { style: "medium", color: { argb: "FF16A34A" } },
        left: { style: "hair", color: { argb: "FFE2E8F0" } },
        right: { style: "hair", color: { argb: "FFE2E8F0" } },
      };
      if (colNumber <= 2) cell.alignment = { horizontal: colNumber === 1 ? "center" : "left" };
      else cell.alignment = { horizontal: "right" };
    });
    totalsRow.height = 18;

    // Download
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ECA-Consolidated-Q${quarter}-${year}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const prevYear = year - 1;
  const submittedCount = rows.filter((r) => r.hasReport).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consolidated ECA Report"
        subtitle="Generate Excel consolidation of quarterly ECA reports across all barangays"
      >
        <Button
          onClick={() => { void handleExport(); }}
          disabled={selectedIds.size === 0}
          className="bg-green-600 hover:bg-green-700 gap-2"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </PageHeader>

      {/* Period controls */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Quarter:</span>
            <Select
              value={String(quarter)}
              onValueChange={(v) => setQuarter(Number(v) as 1 | 2 | 3 | 4)}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUARTERS.map((q) => (
                  <SelectItem key={q} value={String(q)}>Q{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Year:</span>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-500">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <span>
              <span className="font-semibold text-slate-800">{submittedCount}</span> of{" "}
              <span className="font-semibold text-slate-800">{selectedIds.size}</span> selected
              barangays have Q{quarter} {year} reports
            </span>
          </div>
        </div>
      </Card>

      {/* Barangay selector */}
      <Card>
        <button
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors rounded-xl"
          onClick={() => setSelectorOpen((o) => !o)}
        >
          <span>
            Barangay Selection —{" "}
            <span className="text-green-700">{selectedIds.size} of {barangays.length} selected</span>
          </span>
          {selectorOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {selectorOpen && (
          <div className="border-t border-slate-100 px-4 pb-4">
            <div className="flex items-center gap-2 py-3 border-b border-slate-100 mb-3">
              <input
                type="checkbox"
                id="select-all"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-slate-300 text-green-600 cursor-pointer"
              />
              <label htmlFor="select-all" className="text-sm font-semibold text-slate-700 cursor-pointer">
                {allSelected ? "Deselect All Barangays" : "Select All Barangays"}
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 max-h-64 overflow-y-auto">
              {barangays.map((b) => (
                <label
                  key={b.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer transition-colors",
                    selectedIds.has(b.id)
                      ? "bg-green-50 text-green-800"
                      : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(b.id)}
                    onChange={() => toggleOne(b.id)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-green-600 cursor-pointer"
                  />
                  {b.name}
                </label>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Preview table */}
      <Card>
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            Q{quarter} {year} Consolidation Preview
          </p>
          <p className="text-xs text-slate-400">{rows.length} barangays</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#0f2d1a] text-white">
                <th className="py-2.5 px-3 text-center font-semibold whitespace-nowrap">NO</th>
                <th className="py-2.5 px-3 text-left font-semibold whitespace-nowrap">BARANGAY</th>
                <th className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">{prevYear} TOTAL POP.</th>
                <th className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">{year} TOTAL POP.</th>
                <th className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">NO. OF HH</th>
                <th className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">TOTAL COMPLIANT</th>
                <th className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">PERCENTAGE</th>
                <th className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">EWG PER QTR</th>
                <th className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">BIODEGRADABLE</th>
                <th className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">RECYCLABLES</th>
                <th className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">OTHERS</th>
                <th className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">TOTAL VOLUME</th>
                <th className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">WASTE DIVERTED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r) => (
                <tr
                  key={r.barangayId}
                  className={cn("hover:bg-slate-50 transition-colors", !r.hasReport && "opacity-50")}
                >
                  <td className="py-2 px-3 text-center text-slate-500">{r.no}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {r.name}
                    {!r.hasReport && (
                      <span className="ml-1.5 text-[10px] text-slate-400 font-normal">no report</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600">{r.popPrev.toLocaleString("en-PH")}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{fmt(r.popCurrent)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{fmt(r.households)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{fmt(r.compliant)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{r.percentage}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{fmt(r.ewg)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{fmt(r.bio)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{fmt(r.rec)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{fmt(r.others)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{fmt(r.totalVol)}</td>
                  <td className="py-2 px-3 text-right text-slate-600">{r.diverted}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border-t-2 border-slate-300 font-semibold text-slate-800">
                <td className="py-2.5 px-3" colSpan={2}>
                  TOTAL / AVERAGE ({rows.filter((r) => r.hasReport).length} reports)
                </td>
                <td className="py-2.5 px-3 text-right">{totals.popPrev.toLocaleString("en-PH")}</td>
                <td className="py-2.5 px-3 text-right">{fmt(String(totals.popCurrent))}</td>
                <td className="py-2.5 px-3 text-right">{fmt(String(totals.households))}</td>
                <td className="py-2.5 px-3 text-right">{fmt(String(totals.compliant))}</td>
                <td className="py-2.5 px-3 text-right">{fmt(totals.percentage, true)}</td>
                <td className="py-2.5 px-3 text-right">{fmt(String(totals.ewg))}</td>
                <td className="py-2.5 px-3 text-right">{fmt(String(totals.bio))}</td>
                <td className="py-2.5 px-3 text-right">{fmt(String(totals.rec))}</td>
                <td className="py-2.5 px-3 text-right">{fmt(String(totals.others))}</td>
                <td className="py-2.5 px-3 text-right">{fmt(String(totals.totalVol))}</td>
                <td className="py-2.5 px-3 text-right">{fmt(totals.diverted, true)}</td>
              </tr>
            </tfoot>
          </table>
          {rows.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">
              No barangays selected. Use the selector above to choose barangays.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
