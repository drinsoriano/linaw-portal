import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { AuditSubmission, AuditCycle, CycleStatus, SubmissionStatus } from "../types";
import {
  submissions as mockSubmissions,
  submissions2024,
  auditCycle as defaultCycle,
  auditCycle2024,
} from "../data/submissions";
import { barangays } from "../data/barangays";
import { indicators } from "../data/indicators";

interface SubmissionsContextValue {
  submissions: AuditSubmission[];
  activeCycle: AuditCycle;
  cycles: AuditCycle[];
  getByBarangay: (barangayId: string) => AuditSubmission[];
  getLatest: (barangayId: string) => AuditSubmission | undefined;
  getById: (id: string) => AuditSubmission | undefined;
  updateSubmission: (id: string, patch: Partial<AuditSubmission>) => void;
  // Barangay self-assessment chain: Councilor → Captain (final)
  submitToCaptain: (id: string) => void;
  returnToCouncilor: (id: string, remarks: string) => void;
  captainApprove: (id: string, by: string) => void;
  // Cycle management (SYSTEM_ADMIN only)
  openNewCycle: (year: number) => void;
}

const SubmissionsContext = createContext<SubmissionsContextValue | null>(null);

const STORAGE_KEY = "linaw_audit_submissions";
const CYCLES_KEY = "linaw_audit_cycles";
const ACTIVE_CYCLE_KEY = "linaw_active_cycle_id";

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<AuditSubmission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AuditSubmission[]) : [...submissions2024, ...mockSubmissions];
    } catch {
      return mockSubmissions;
    }
  });

  const [cycles, setCycles] = useState<AuditCycle[]>(() => {
    try {
      const stored = localStorage.getItem(CYCLES_KEY);
      return stored ? (JSON.parse(stored) as AuditCycle[]) : [auditCycle2024, defaultCycle];
    } catch {
      return [defaultCycle];
    }
  });

  const [activeCycleId, setActiveCycleId] = useState<string>(() => {
    const storedId = localStorage.getItem(ACTIVE_CYCLE_KEY);
    if (!storedId) return defaultCycle.id;

    // Validate stored ID against known cycles to prevent stale/orphaned cycle IDs
    try {
      const storedCycles = localStorage.getItem(CYCLES_KEY);
      const knownCycles: AuditCycle[] = storedCycles
        ? (JSON.parse(storedCycles) as AuditCycle[])
        : [auditCycle2024, defaultCycle];
      if (knownCycles.some((c) => c.id === storedId)) return storedId;
    } catch { /* fall through */ }

    return defaultCycle.id;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(CYCLES_KEY, JSON.stringify(cycles));
  }, [cycles]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_CYCLE_KEY, activeCycleId);
  }, [activeCycleId]);

  const activeCycle = cycles.find((c) => c.id === activeCycleId) ?? cycles[0] ?? defaultCycle;

  const now = () => new Date().toISOString().split("T")[0];

  const getByBarangay = (barangayId: string) =>
    submissions.filter((s) => s.barangayId === barangayId);

  // Returns the submission for the active cycle only
  const getLatest = (barangayId: string) =>
    submissions.find((s) => s.barangayId === barangayId && s.cycleId === activeCycleId);

  const getById = (id: string) => submissions.find((s) => s.id === id);

  const updateSubmission = (id: string, patch: Partial<AuditSubmission>) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: now() } : s))
    );
  };

  const setStatus = (id: string, status: SubmissionStatus, extra: Partial<AuditSubmission> = {}) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, ...extra, updatedAt: now() } : s))
    );
  };

  // Councilor submits the completed self-assessment to the Captain for approval
  const submitToCaptain = (id: string) =>
    setStatus(id, "SUBMITTED", { submittedAt: now() });

  // Captain returns to Councilor for corrections
  const returnToCouncilor = (id: string, remarks: string) =>
    setStatus(id, "RETURNED_ENCODER", { captainRemarks: remarks });

  // Captain's approval is final — marks the self-assessment as validated
  const captainApprove = (id: string, by: string) =>
    setStatus(id, "VALIDATED", {
      validatedAt: now(),
      captainRemarks: `Approved by ${by}`,
    });

  // Opens a new annual audit cycle, closing the current one and seeding 54 blank drafts
  const openNewCycle = (year: number) => {
    if (cycles.some((c) => c.year === year)) return;

    const newCycle: AuditCycle = {
      id: `cycle-${year}`,
      year,
      label: `${year} Annual Audit`,
      status: "ACTIVE",
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    };

    const newSubs: AuditSubmission[] = barangays.map((brgy) => ({
      id: `sub-${brgy.id}-${year}`,
      barangayId: brgy.id,
      cycleId: newCycle.id,
      status: "DRAFT" as SubmissionStatus,
      responses: indicators.map((ind) => ({
        indicatorId: ind.id,
        score: null,
        notes: "",
        evidenceCount: 0,
      })),
      createdAt: now(),
      updatedAt: now(),
    }));

    setCycles((prev) =>
      prev
        .map((c) =>
          c.id === activeCycleId
            ? { ...c, status: "CLOSED" as CycleStatus, closedAt: now() }
            : c
        )
        .concat(newCycle)
    );
    setActiveCycleId(newCycle.id);
    setSubmissions((prev) => [...prev, ...newSubs]);
  };

  return (
    <SubmissionsContext.Provider
      value={{
        submissions,
        activeCycle,
        cycles,
        getByBarangay,
        getLatest,
        getById,
        updateSubmission,
        submitToCaptain,
        returnToCouncilor,
        captainApprove,
        openNewCycle,
      }}
    >
      {children}
    </SubmissionsContext.Provider>
  );
}

export function useSubmissions() {
  const ctx = useContext(SubmissionsContext);
  if (!ctx) throw new Error("useSubmissions must be used within SubmissionsProvider");
  return ctx;
}
