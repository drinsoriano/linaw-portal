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
    id: "user-003",
    name: "Juan dela Cruz",
    email: "encoder.bagongkalsada@linaw.calamba.gov.ph",
    role: "BARANGAY_ENCODER",
    barangayId: "brgy-001",
    barangayName: "Bagong Kalsada",
    isActive: true,
    createdAt: "2024-02-01",
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
    name: "Public User",
    email: "public@linaw.calamba.gov.ph",
    role: "PUBLIC_VIEWER",
    isActive: true,
    createdAt: "2024-03-01",
  },
];

export const ROLE_LOGIN_PRESETS: Record<UserRole, AppUser> = {
  SYSTEM_ADMIN: mockUsers[0],
  CENRO_EVALUATOR: mockUsers[1],
  BARANGAY_ENCODER: mockUsers[2],
  BARANGAY_CAPTAIN: mockUsers[3],
  RESEARCHER: mockUsers[4],
  PUBLIC_VIEWER: mockUsers[5],
};
