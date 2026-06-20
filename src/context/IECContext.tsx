import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { IECActivity } from "../types";
import { mockIECActivities } from "../data/iecActivities";

interface IECContextValue {
  activities: IECActivity[];
  getByBarangay: (barangayId: string) => IECActivity[];
  addActivity: (draft: Omit<IECActivity, "id">) => void;
  updateActivity: (id: string, patch: Partial<IECActivity>) => void;
  deleteActivity: (id: string) => void;
}

const IECContext = createContext<IECContextValue | null>(null);

const STORAGE_KEY = "linaw_iec_activities";

export function IECProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<IECActivity[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as IECActivity[]) : mockIECActivities;
    } catch {
      return mockIECActivities;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  }, [activities]);

  const getByBarangay = (barangayId: string) =>
    activities
      .filter((a) => a.barangayId === barangayId)
      .sort((a, b) => (b.date > a.date ? 1 : -1));

  const addActivity = (draft: Omit<IECActivity, "id">) => {
    const newActivity: IECActivity = { ...draft, id: `iec-${Date.now()}` };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const updateActivity = (id: string, patch: Partial<IECActivity>) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <IECContext.Provider value={{ activities, getByBarangay, addActivity, updateActivity, deleteActivity }}>
      {children}
    </IECContext.Provider>
  );
}

export function useIEC() {
  const ctx = useContext(IECContext);
  if (!ctx) throw new Error("useIEC must be used within IECProvider");
  return ctx;
}
