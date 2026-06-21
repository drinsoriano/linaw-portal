import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { EcaReport, EcaStatus } from "../types";
import { mockEcaReports, ecaHistoricalReports } from "../data/ecaReports";

interface ActivePeriod {
  year: number;
  quarter: 1 | 2 | 3 | 4;
}

interface EcaContextValue {
  reports: EcaReport[];
  activePeriod: ActivePeriod;
  setActivePeriod: (year: number, quarter: 1 | 2 | 3 | 4) => void;
  getByBarangay: (barangayId: string) => EcaReport[];
  getByPeriod: (year: number, quarter: 1 | 2 | 3 | 4) => EcaReport[];
  getLatest: (barangayId: string) => EcaReport | undefined;
  updateReport: (id: string, patch: Partial<EcaReport>) => void;
  addReport: (report: EcaReport) => void;
  setStatus: (id: string, status: EcaStatus, feedback?: string) => void;
  // Barangay 3-tier approval chain
  submitForReview: (id: string, by: string) => void;   // Secretary  → SUBMITTED (committee review)
  endorseReport: (id: string, by: string) => void;     // Councilor  → ENDORSED (to captain)
  certifyToCenro: (id: string, by: string) => void;    // Captain    → PENDING (to CENRO)
  returnReport: (id: string, toStatus: EcaStatus, remarks: string) => void; // step back down the chain
}

const EcaContext = createContext<EcaContextValue | null>(null);

const STORAGE_KEY = "linaw_eca_reports";
const PERIOD_KEY = "linaw_eca_active_period";

// Historical records first so mockEcaReports' detail-rich versions take priority on merge
const SEED_ECA = [...ecaHistoricalReports, ...mockEcaReports];

function currentCalendarQuarter(): 1 | 2 | 3 | 4 {
  const m = new Date().getMonth(); // 0-based
  if (m < 3) return 1;
  if (m < 6) return 2;
  if (m < 9) return 3;
  return 4;
}

export function EcaProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<EcaReport[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return SEED_ECA;
      const parsed = JSON.parse(stored) as EcaReport[];
      // Merge: any SEED_ECA ids missing from stored data get prepended
      const existingIds = new Set(parsed.map((r) => r.id));
      const missing = SEED_ECA.filter((r) => !existingIds.has(r.id));
      return missing.length > 0 ? [...missing, ...parsed] : parsed;
    } catch {
      return SEED_ECA;
    }
  });

  const [activePeriod, setActivePeriodState] = useState<ActivePeriod>(() => {
    try {
      const stored = localStorage.getItem(PERIOD_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ActivePeriod;
        if (parsed.year && [1, 2, 3, 4].includes(parsed.quarter)) return parsed;
      }
    } catch { /* fall through */ }
    return { year: new Date().getFullYear(), quarter: currentCalendarQuarter() };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(PERIOD_KEY, JSON.stringify(activePeriod));
  }, [activePeriod]);

  const setActivePeriod = (year: number, quarter: 1 | 2 | 3 | 4) => {
    setActivePeriodState({ year, quarter });
  };

  const getByBarangay = (barangayId: string) =>
    reports
      .filter((r) => r.barangayId === barangayId)
      .sort((a, b) => a.year !== b.year ? b.year - a.year : b.quarter - a.quarter);

  const getByPeriod = (year: number, quarter: 1 | 2 | 3 | 4) =>
    reports.filter((r) => r.year === year && r.quarter === quarter);

  // Returns the report for the active period (used by barangay pages)
  const getLatest = (barangayId: string) =>
    reports.find(
      (r) =>
        r.barangayId === barangayId &&
        r.year === activePeriod.year &&
        r.quarter === activePeriod.quarter
    );

  const updateReport = (id: string, patch: Partial<EcaReport>) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString().split("T")[0] } : r
      )
    );
  };

  const addReport = (report: EcaReport) => {
    setReports((prev) => [report, ...prev]);
  };

  const setStatus = (id: string, status: EcaStatus, feedback?: string) => {
    const now = new Date().toISOString().split("T")[0];
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              updatedAt: now,
              ...(["FOR_REVISION", "ACCEPTED", "PENDING"].includes(status) ? { reviewedAt: now } : {}),
              ...(feedback !== undefined ? { cenroFeedback: feedback } : {}),
            }
          : r
      )
    );
  };

  const now = () => new Date().toISOString().split("T")[0];

  const submitForReview = (id: string, by: string) => {
    const ts = now();
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "SUBMITTED", reviewRemarks: undefined, updatedAt: ts,
              revisionRound: (r.revisionRound ?? 0) + 1, preparedBy: by, preparedAt: ts }
          : r
      )
    );
  };

  const endorseReport = (id: string, by: string) => {
    const ts = now();
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "ENDORSED", endorsedBy: by, endorsedAt: ts, reviewRemarks: undefined, updatedAt: ts }
          : r
      )
    );
  };

  const certifyToCenro = (id: string, by: string) => {
    const ts = now();
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "PENDING", certifiedBy: by, certifiedAt: ts, updatedAt: ts }
          : r
      )
    );
  };

  const returnReport = (id: string, toStatus: EcaStatus, remarks: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: toStatus, reviewRemarks: remarks, updatedAt: now() }
          : r
      )
    );
  };

  return (
    <EcaContext.Provider
      value={{
        reports,
        activePeriod,
        setActivePeriod,
        getByBarangay,
        getByPeriod,
        getLatest,
        updateReport,
        addReport,
        setStatus,
        submitForReview,
        endorseReport,
        certifyToCenro,
        returnReport,
      }}
    >
      {children}
    </EcaContext.Provider>
  );
}

export function useEca() {
  const ctx = useContext(EcaContext);
  if (!ctx) throw new Error("useEca must be used within EcaProvider");
  return ctx;
}
