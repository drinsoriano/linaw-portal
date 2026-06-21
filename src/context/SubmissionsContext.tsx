import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { AuditSubmission, AuditCycle, CycleStatus, SubmissionStatus } from "../types";
import {
  submissions as mockSubmissions,
  submissions2024,
  submissions2023,
  submissions2022,
  submissions2021,
  submissions2020,
  auditCycle as defaultCycle,
  auditCycle2024,
  auditCycle2023,
  auditCycle2022,
  auditCycle2021,
  auditCycle2020,
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
  switchActiveCycle: (cycleId: string) => void;
}

const SubmissionsContext = createContext<SubmissionsContextValue | null>(null);

const STORAGE_KEY = "linaw_audit_submissions";
const CYCLES_KEY = "linaw_audit_cycles";
const ACTIVE_CYCLE_KEY = "linaw_active_cycle_id";

const SEED_SUBS = [...submissions2020, ...submissions2021, ...submissions2022, ...submissions2023, ...submissions2024, ...mockSubmissions];
const SEED_CYCLES = [auditCycle2020, auditCycle2021, auditCycle2022, auditCycle2023, auditCycle2024, defaultCycle];

export function SubmissionsProvider({ children }: { children: ReactNode }) {

  const [submissions, setSubmissions] = useState<AuditSubmission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return SEED_SUBS;
      const storedSubs = JSON.parse(stored) as AuditSubmission[];
      // Merge any seed submissions whose IDs are missing from stored data (adds new historical years)
      const existingIds = new Set(storedSubs.map((s) => s.id));
      const missing = SEED_SUBS.filter((s) => !existingIds.has(s.id));
      return missing.length > 0 ? [...missing, ...storedSubs] : storedSubs;
    } catch {
      return SEED_SUBS;
    }
  });

  const [cycles, setCycles] = useState<AuditCycle[]>(() => {
    try {
      const stored = localStorage.getItem(CYCLES_KEY);
      if (!stored) return SEED_CYCLES;
      const storedCycles = JSON.parse(stored) as AuditCycle[];
      // Merge any seed cycles whose IDs are missing from stored data
      const existingIds = new Set(storedCycles.map((c) => c.id));
      const missing = SEED_CYCLES.filter((c) => !existingIds.has(c.id));
      return missing.length > 0 ? [...missing, ...storedCycles] : storedCycles;
    } catch {
      return SEED_CYCLES;
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
        : [auditCycle2020, auditCycle2021, auditCycle2022, auditCycle2023, auditCycle2024, defaultCycle];
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

  // Guard: if the active cycle has no submissions (e.g. stale localStorage after a clear),
  // auto-seed 54 blank DRAFTs so barangay pages never show "No submission found".
  useEffect(() => {
    const date = new Date().toISOString().split("T")[0];
    setSubmissions((prev) => {
      if (prev.some((s) => s.cycleId === activeCycleId)) return prev;
      const yearMatch = activeCycleId.match(/cycle-(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      return [
        ...prev,
        ...barangays.map((brgy) => ({
          id: `sub-${brgy.id}-${year}`,
          barangayId: brgy.id,
          cycleId: activeCycleId,
          status: "DRAFT" as SubmissionStatus,
          responses: indicators.map((ind) => ({
            indicatorId: ind.id,
            score: null,
            notes: "",
            evidenceCount: 0,
          })),
          createdAt: date,
          updatedAt: date,
        })),
      ];
    });
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

  // Makes any cycle the active one — used by CENRO to switch simulation year.
  // Also seeds 54 blank DRAFTs for the target cycle if submissions don't exist yet.
  const switchActiveCycle = (cycleId: string) => {
    setCycles((prev) =>
      prev.map((c) =>
        c.id === cycleId
          ? { ...c, status: "ACTIVE" as CycleStatus }
          : c.status === "ACTIVE"
          ? { ...c, status: "CLOSED" as CycleStatus, closedAt: c.closedAt ?? now() }
          : c
      )
    );
    setActiveCycleId(cycleId);
    setSubmissions((prev) => {
      const hasSubs = prev.some((s) => s.cycleId === cycleId);
      if (hasSubs) return prev;
      // Extract 4-digit year from id like "cycle-2026" or "cycle-2025-1"
      const yearMatch = cycleId.match(/cycle-(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      const newSubs: AuditSubmission[] = barangays.map((brgy) => ({
        id: `sub-${brgy.id}-${year}`,
        barangayId: brgy.id,
        cycleId,
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
      return [...prev, ...newSubs];
    });
  };

  // Opens a new annual audit cycle, closing the current one and seeding 54 blank drafts
  const openNewCycle = (year: number) => {
    if (cycles.some((c) => c.year === year)) return;

    const newCycle: AuditCycle = {
      id: `cycle-${year}`,
      year,
      label: `${year} Annual Audit`,
      status: "ACTIVE",
      startDate: `${year}-04-01`,  // Q2 — official audit window
      endDate: `${year}-06-30`,
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
        switchActiveCycle,
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
