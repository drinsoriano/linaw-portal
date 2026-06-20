import type { AppUser, UserRole } from "../types";

export const mockUsers: AppUser[] = [
  {
    id: "user-001",
    name: "Engr. Aldrin Soriano",
    email: "admin@linaw.calamba.gov.ph",
    role: "SYSTEM_ADMIN",
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "user-002",
    name: "Maria Clara Mendez",
    email: "cenro@calamba.gov.ph",
    role: "CENRO_EVALUATOR",
    isActive: true,
    createdAt: "2024-01-20",
  },
  {
    id: "user-004",
    name: "Hon. Roberto Dela Cruz",
    email: "captain.bagongkalsada@linaw.calamba.gov.ph",
    role: "BARANGAY_CAPTAIN",
    barangayId: "brgy-001",
    barangayName: "Bagong Kalsada",
    isActive: true,
    createdAt: "2024-02-01",
  },
  {
    id: "user-005",
    name: "Dr. Sarah Vanguardia",
    email: "researcher@linaw.calamba.gov.ph",
    role: "RESEARCHER",
    isActive: true,
    createdAt: "2024-02-10",
  },
  {
    id: "user-006",
    name: "Lucia Santos",
    email: "secretary.bagongkalsada@linaw.calamba.gov.ph",
    role: "BARANGAY_SECRETARY",
    barangayId: "brgy-001",
    barangayName: "Bagong Kalsada",
    isActive: true,
    createdAt: "2024-03-01",
  },
  {
    id: "user-007",
    name: "Councilor Emilio Ramos",
    email: "councilor.bagongkalsada@linaw.calamba.gov.ph",
    role: "BARANGAY_COUNCILOR",
    barangayId: "brgy-001",
    barangayName: "Bagong Kalsada",
    isActive: true,
    createdAt: "2024-03-05",
  },
  {
    id: "user-008",
    name: "Citizen User",
    email: "citizen@linaw.calamba.gov.ph",
    role: "CITIZEN",
    isActive: true,
    createdAt: "2024-03-10",
  },
];

const byRole = (role: UserRole) => mockUsers.find((u) => u.role === role)!;

export const ROLE_LOGIN_PRESETS: Record<UserRole, AppUser> = {
  SYSTEM_ADMIN: byRole("SYSTEM_ADMIN"),
  CENRO_EVALUATOR: byRole("CENRO_EVALUATOR"),
  BARANGAY_SECRETARY: byRole("BARANGAY_SECRETARY"),
  BARANGAY_COUNCILOR: byRole("BARANGAY_COUNCILOR"),
  BARANGAY_CAPTAIN: byRole("BARANGAY_CAPTAIN"),
  RESEARCHER: byRole("RESEARCHER"),
  CITIZEN: byRole("CITIZEN"),
};
