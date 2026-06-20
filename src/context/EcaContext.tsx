import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { EcaReport, EcaStatus } from "../types";
import { mockEcaReports } from "../data/ecaReports";

interface EcaContextValue {
  reports: EcaReport[];
  getByBarangay: (barangayId: string) => EcaReport[];
  getLatest: (barangayId: string) => EcaReport | undefined;
  updateReport: (id: string, patch: Partial<EcaReport>) => void;
  setStatus: (id: string, status: EcaStatus, feedback?: string) => void;
  // Barangay 3-tier approval chain
  submitForReview: (id: string, by: string) => void;   // Secretary  → SUBMITTED (committee review)
  endorseReport: (id: string, by: string) => void;     // Councilor  → ENDORSED (to captain)
  certifyToCenro: (id: string, by: string) => void;    // Captain    → PENDING (to CENRO)
  returnReport: (id: string, toStatus: EcaStatus, remarks: string) => void; // step back down the chain
}

const EcaContext = createContext<EcaContextValue | null>(null);

const STORAGE_KEY = "linaw_eca_reports";

export function EcaProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<EcaReport[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return mockEcaReports;
      const parsed = JSON.parse(stored) as EcaReport[];
      return parsed.length > 0 ? parsed : mockEcaReports;
    } catch {
      return mockEcaReports;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  const getByBarangay = (barangayId: string) =>
    reports.filter((r) => r.barangayId === barangayId)
      .sort((a, b) => a.year !== b.year ? b.year - a.year : b.quarter - a.quarter);

  const getLatest = (barangayId: string) => getByBarangay(barangayId)[0];

  const updateReport = (id: string, patch: Partial<EcaReport>) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString().split("T")[0] } : r
      )
    );
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

  // Secretary submits; each submission starts a new revision round so reviewers' new notes are separated from history
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

  // Councilor (Committee Chair on Environment) endorses to the captain
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

  // Captain certifies and officially submits to CENRO
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

  // Councilor/Captain returns the report down the chain with remarks
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
        getByBarangay,
        getLatest,
        updateReport,
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
