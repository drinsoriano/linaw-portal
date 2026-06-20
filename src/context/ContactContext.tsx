import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { BarangayContactInfo, CenroContactInfo } from "../types";
import { mockBarangayContacts, mockCenroContact } from "../data/contacts";

interface ContactStorageShape {
  barangays: BarangayContactInfo[];
  cenro: CenroContactInfo;
}

interface ContactContextValue {
  barangayContacts: BarangayContactInfo[];
  cenroContact: CenroContactInfo;
  getContactByBarangay: (barangayId: string) => BarangayContactInfo | undefined;
  updateBarangayContact: (barangayId: string, patch: Partial<BarangayContactInfo>) => void;
  updateCenroContact: (patch: Partial<CenroContactInfo>) => void;
}

const ContactContext = createContext<ContactContextValue | null>(null);

const STORAGE_KEY = "linaw_contacts";

const now = () => new Date().toISOString().split("T")[0];

export function ContactProvider({ children }: { children: ReactNode }) {
  const [barangayContacts, setBarangayContacts] = useState<BarangayContactInfo[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ContactStorageShape;
        return parsed.barangays ?? mockBarangayContacts;
      }
    } catch { /* fall through */ }
    return mockBarangayContacts;
  });

  const [cenroContact, setCenroContact] = useState<CenroContactInfo>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ContactStorageShape;
        return parsed.cenro ?? mockCenroContact;
      }
    } catch { /* fall through */ }
    return mockCenroContact;
  });

  useEffect(() => {
    const payload: ContactStorageShape = { barangays: barangayContacts, cenro: cenroContact };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [barangayContacts, cenroContact]);

  const getContactByBarangay = (barangayId: string) =>
    barangayContacts.find((c) => c.barangayId === barangayId);

  const updateBarangayContact = (barangayId: string, patch: Partial<BarangayContactInfo>) => {
    setBarangayContacts((prev) => {
      const exists = prev.some((c) => c.barangayId === barangayId);
      if (exists) {
        return prev.map((c) =>
          c.barangayId === barangayId ? { ...c, ...patch, updatedAt: now() } : c
        );
      }
      return [
        ...prev,
        { barangayId, updatedAt: now(), updatedBy: "", ...patch } as BarangayContactInfo,
      ];
    });
  };

  const updateCenroContact = (patch: Partial<CenroContactInfo>) => {
    setCenroContact((prev) => ({ ...prev, ...patch, updatedAt: now() }));
  };

  return (
    <ContactContext.Provider
      value={{
        barangayContacts,
        cenroContact,
        getContactByBarangay,
        updateBarangayContact,
        updateCenroContact,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
}

export function useContact() {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error("useContact must be used within ContactProvider");
  return ctx;
}
