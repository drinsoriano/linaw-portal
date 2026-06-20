import type { FinancialRecord } from "../types";

export const mockFinancials: FinancialRecord[] = [
  {
    id: "fin-001",
    barangayId: "brgy-001",
    month: 1,
    year: 2025,
    feeCollected: 18500,
    recyclingIncome: 10990,
    expenses: 14200,
    notes: "January collection includes arrears from December. Recycling income from MRF sale of mixed recyclables.",
  },
  {
    id: "fin-002",
    barangayId: "brgy-001",
    month: 2,
    year: 2025,
    feeCollected: 19200,
    recyclingIncome: 11780,
    expenses: 13800,
    notes: "February collection improved. New household registrations added 8 new paying households.",
  },
  {
    id: "fin-003",
    barangayId: "brgy-001",
    month: 3,
    year: 2025,
    feeCollected: 17800,
    recyclingIncome: 12450,
    expenses: 15600,
    notes: "March expenses higher due to MRF cleaning and minor equipment repair (composting bin replacement).",
  },
  {
    id: "fin-004",
    barangayId: "brgy-001",
    month: 4,
    year: 2025,
    feeCollected: 20100,
    recyclingIncome: 14500,
    expenses: 13200,
    notes: "April collection highest so far. IEC campaign on fee compliance held on April 10 yielded positive results.",
  },
  {
    id: "fin-005",
    barangayId: "brgy-001",
    month: 5,
    year: 2025,
    feeCollected: 19450,
    recyclingIncome: 13120,
    expenses: 14000,
    notes: "May normal operations. Recycling income slightly lower due to market price dip for PET bottles.",
  },
  {
    id: "fin-006",
    barangayId: "brgy-001",
    month: 6,
    year: 2025,
    feeCollected: 21000,
    recyclingIncome: 15800,
    expenses: 16500,
    notes: "June — half-year peak. Expenses include barangay clean-up drive and school waste campaign materials.",
  },
  {
    id: "fin-007",
    barangayId: "brgy-001",
    month: 7,
    year: 2025,
    feeCollected: 18900,
    recyclingIncome: 12900,
    expenses: 13500,
    notes: "July — slightly lower fee collection due to holiday months. Normal recycling income.",
  },
  {
    id: "fin-008",
    barangayId: "brgy-001",
    month: 8,
    year: 2025,
    feeCollected: 20500,
    recyclingIncome: 14200,
    expenses: 14800,
    notes: "August — Linggo ng Wika campaign added new participants. Good fee compliance.",
  },
  {
    id: "fin-009",
    barangayId: "brgy-001",
    month: 9,
    year: 2025,
    feeCollected: 19800,
    recyclingIncome: 13500,
    expenses: 15200,
    notes: "September — expenses include quarterly deworming of MRF waste sorters.",
  },
  {
    id: "fin-010",
    barangayId: "brgy-002",
    month: 1,
    year: 2025,
    feeCollected: 24500,
    recyclingIncome: 18200,
    expenses: 17800,
    notes: "Parian consistently high fee collection. Well-organized barangay collection system.",
  },
  {
    id: "fin-011",
    barangayId: "brgy-002",
    month: 2,
    year: 2025,
    feeCollected: 23800,
    recyclingIncome: 17900,
    expenses: 16500,
    notes: "February normal operations.",
  },
  {
    id: "fin-012",
    barangayId: "brgy-002",
    month: 3,
    year: 2025,
    feeCollected: 25100,
    recyclingIncome: 19400,
    expenses: 18200,
    notes: "March strong performance. Recycling income up due to bulk paper sales.",
  },
];

export function getFinancialsByBarangay(barangayId: string, year: number): FinancialRecord[] {
  return mockFinancials
    .filter((f) => f.barangayId === barangayId && f.year === year)
    .sort((a, b) => a.month - b.month);
}

export function computeYTDSummary(barangayId: string, year: number) {
  const records = getFinancialsByBarangay(barangayId, year);
  return {
    totalFeeCollected: records.reduce((s, r) => s + r.feeCollected, 0),
    totalRecyclingIncome: records.reduce((s, r) => s + r.recyclingIncome, 0),
    totalExpenses: records.reduce((s, r) => s + r.expenses, 0),
    netBalance: records.reduce((s, r) => s + r.feeCollected + r.recyclingIncome - r.expenses, 0),
    monthsRecorded: records.length,
  };
}
