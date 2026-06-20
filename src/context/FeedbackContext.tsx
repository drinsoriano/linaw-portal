import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { CenroFeedback, FeedbackStatus } from "../types";
import { mockFeedbacks } from "../data/feedbacks";

interface FeedbackContextValue {
  feedbacks: CenroFeedback[];
  getByBarangay: (barangayId: string) => CenroFeedback[];
  issueFeedback: (fb: Omit<CenroFeedback, "id" | "createdAt" | "status">) => void;
  updateStatus: (id: string, status: FeedbackStatus, response?: string) => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const STORAGE_KEY = "linaw_feedbacks";

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<CenroFeedback[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CenroFeedback[]) : mockFeedbacks;
    } catch {
      return mockFeedbacks;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
  }, [feedbacks]);

  const getByBarangay = (barangayId: string) =>
    feedbacks
      .filter((f) => f.barangayId === barangayId)
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

  const issueFeedback = (fb: Omit<CenroFeedback, "id" | "createdAt" | "status">) => {
    const newFb: CenroFeedback = {
      ...fb,
      id: `fb-${Date.now()}`,
      status: "NOT_STARTED",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setFeedbacks((prev) => [newFb, ...prev]);
  };

  const updateStatus = (id: string, status: FeedbackStatus, response?: string) => {
    const now = new Date().toISOString().split("T")[0];
    setFeedbacks((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status,
              ...(response !== undefined ? { barangayResponse: response, respondedAt: now } : {}),
            }
          : f
      )
    );
  };

  return (
    <FeedbackContext.Provider value={{ feedbacks, getByBarangay, issueFeedback, updateStatus }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider");
  return ctx;
}
