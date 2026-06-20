import type { EcaReport } from "../types";

const COMMITTEE_MEMBERS = [
  "Kagawad",
  "SK Chairman",
  "President of Home Owners Association",
  "Private/Public School Principal / Representative",
  "Parent Teachers Assoc. President / Representative",
  "Religious Organization / Representative",
  "Business Community / Representative",
  "Environmental NGO / Representative",
  "Pres. Market Vendors Assoc. / Representative",
  "Junkshop Owners Assoc. / Representative",
];

const MRF_TYPES = [
  "Established MRF operated by the barangay",
  "MRS cum MRF / covered by MOA with junkshops",
  "Clustered with a barangay owning an MRF",
  "Centralized MRF",
  "Others",
];

const WASTE_TYPES = ["Recyclables", "Compost / Biodegradable", "Residual", "Others"];

const COLLECTION_SCHEMES = [
  "Separate day collection of different wastes",
  "Same day collection of different wastes on separate trucks",
  "Others",
];

const NEXT_STEPS_CATEGORIES = [
  "Segregation at Source",
  "Functional MRFs",
  "Waste Generation and Waste Diversion",
  "No Littering Ordinances",
];

interface SectionOpts {
  hasCommittee?: boolean;
  committeeMembers?: string[];
  mrfType?: string;
  mrfOperational?: boolean;
  wasteTypes?: string[];
  collectionScheme?: string;
  totalHouseholds?: number;
  compliantHouseholds?: number;
  perCapita?: number;
  population?: number;
  cleanupConducted?: boolean;
  cleanupSacks?: number;
  biodiverted?: number;
  recyclablesDiverted?: number;
  othersDiverted?: number;
  hasNoLittering?: boolean;
  cityOrdinance?: boolean;
  apprehendViolators?: boolean;
}

function buildSections(opts: SectionOpts = {}) {
  const totalDiverted = (opts.biodiverted ?? 0) + (opts.recyclablesDiverted ?? 0) + (opts.othersDiverted ?? 0);
  const estWasteGen = opts.population ? Math.round(((opts.perCapita ?? 0.45) * opts.population * 365) / 4) : 0;
  const diversionRate = estWasteGen > 0 && totalDiverted > 0
    ? ((totalDiverted / estWasteGen) * 100).toFixed(1)
    : "";
  const complianceRate = opts.totalHouseholds && opts.compliantHouseholds
    ? ((opts.compliantHouseholds / opts.totalHouseholds) * 100).toFixed(1)
    : "";

  return [
    {
      id: "sec-general",
      label: "General Information",
      fields: [
        { id: "g1", label: "Name of Barangay", value: "", type: "text" as const },
        { id: "g2", label: "City / Municipality Location", value: "Calamba City", type: "text" as const },
        { id: "g3", label: "Provincial Location", value: "Laguna", type: "text" as const },
        { id: "g4", label: "Regional Location", value: "Region IV-A (CALABARZON)", type: "text" as const },
        { id: "g5", label: "Total Population", value: opts.population ?? "", type: "number" as const },
        { id: "g6", label: "No. of Households", value: opts.totalHouseholds ?? "", type: "number" as const },
      ],
    },
    {
      id: "sec-committee",
      label: "Barangay SWM Committee",
      fields: [
        {
          id: "c1",
          label: "1.1 Does the barangay have a Barangay SWM Committee created through an Executive Order (E.O.)?",
          value: opts.hasCommittee ? "Yes" : "",
          type: "boolean" as const,
        },
        { id: "c2", label: "1.2 Executive Order No.", value: "", type: "text" as const },
        { id: "c3", label: "1.2 Date of Approval", value: "", type: "date" as const },
        {
          id: "c4",
          label: "2.1 Committee Composition (check all present members)",
          value: opts.committeeMembers ? opts.committeeMembers.join(",") : "",
          type: "checkbox" as const,
          options: COMMITTEE_MEMBERS,
        },
      ],
    },
    {
      id: "sec-segregation",
      label: "Mandatory Segregation of Wastes at Source",
      fields: [
        { id: "s1", label: "3.1 Total number of households", value: opts.totalHouseholds ?? "", type: "number" as const },
        {
          id: "s2",
          label: "3.2 Total number of compliant households",
          value: opts.compliantHouseholds ?? "",
          type: "number" as const,
          hint: "Compliant = wastes segregated into residual, biodegradable, recyclable, and/or special waste in separate containers",
        },
        {
          id: "s3",
          label: "3.3 Computed compliance rate",
          value: complianceRate ? `${complianceRate}%` : "",
          type: "computed" as const,
          unit: "%",
          hint: "(Compliant Households ÷ Total Households) × 100",
        },
        {
          id: "s4",
          label: "4. Are households compliant? (≥70% = Yes)",
          value: complianceRate ? (parseFloat(complianceRate) >= 70 ? "Yes" : "No") : "",
          type: "computed" as const,
          hint: "≥70% = Compliant",
        },
      ],
    },
    {
      id: "sec-collection",
      label: "Segregation and Collection of Waste",
      fields: [
        {
          id: "col1",
          label: "5. Types of waste collected at household level",
          value: opts.wasteTypes ? opts.wasteTypes.join(",") : "",
          type: "checkbox" as const,
          options: WASTE_TYPES,
        },
        {
          id: "col2",
          label: "6. Barangay Collection Scheme",
          value: opts.collectionScheme ?? "",
          type: "select" as const,
          options: COLLECTION_SCHEMES,
        },
      ],
    },
    {
      id: "sec-mrf",
      label: "Functional Materials Recovery Facility (MRF)",
      fields: [
        {
          id: "m1",
          label: "7a. The barangay has a Materials Recovery Facility (MRF)",
          value: opts.mrfType ? "Yes" : "",
          type: "boolean" as const,
        },
        {
          id: "m2",
          label: "7a. Type of MRF",
          value: opts.mrfType ?? "",
          type: "select" as const,
          options: MRF_TYPES,
        },
        {
          id: "m3",
          label: "7b. MRF has sorting station, drop-off center, composting facility, and recycling facility (or MRS effectively addresses all waste types)",
          value: opts.mrfOperational ? "Yes" : "",
          type: "boolean" as const,
        },
        {
          id: "m4",
          label: "8. MRF Compliance Score",
          value: opts.mrfType ? (opts.mrfOperational ? "100%" : "50%") : "0%",
          type: "computed" as const,
          hint: "Having an MRF = 50 pts; Fully operational = +50 pts; 100% total = Compliant",
        },
      ],
    },
    {
      id: "sec-waste-gen",
      label: "Waste Generation and Waste Diversion",
      fields: [
        {
          id: "wg1",
          label: "9.1 Waste generation per capita (refer to WACS of 10-Year SWM Plan)",
          value: opts.perCapita ?? 0.45,
          type: "number" as const,
          unit: "kg/person/day",
        },
        {
          id: "wg2",
          label: "9.2 Estimated waste generation per quarter",
          value: estWasteGen || "",
          type: "computed" as const,
          unit: "kg",
          hint: "Per capita × Population × 365 ÷ 4 quarters",
        },
        {
          id: "wg3",
          label: "10.1 Did the barangay conduct clean-up activities (coastal, rivers, water bodies) last quarter?",
          value: opts.cleanupConducted ? "Yes" : "",
          type: "boolean" as const,
        },
        {
          id: "wg4",
          label: "10.2 Total sacks of marine debris / solid waste collected during clean-up",
          value: opts.cleanupSacks ?? "",
          type: "number" as const,
          unit: "sacks",
        },
        {
          id: "wg5",
          label: "11. Waste Diverted — Biodegradable",
          value: opts.biodiverted ?? "",
          type: "number" as const,
          unit: "kg",
        },
        {
          id: "wg6",
          label: "11. Waste Diverted — Recyclables",
          value: opts.recyclablesDiverted ?? "",
          type: "number" as const,
          unit: "kg",
        },
        {
          id: "wg7",
          label: "11. Waste Diverted — Others",
          value: opts.othersDiverted ?? "",
          type: "number" as const,
          unit: "kg",
        },
        {
          id: "wg8",
          label: "Total Volume Diverted",
          value: totalDiverted || "",
          type: "computed" as const,
          unit: "kg",
          hint: "Biodegradable + Recyclables + Others",
        },
        {
          id: "wg9",
          label: "Waste Diversion Rate",
          value: diversionRate ? `${diversionRate}%` : "",
          type: "computed" as const,
          unit: "%",
          hint: "(Total Volume Diverted ÷ Estimated Waste Generation per Quarter) × 100",
        },
      ],
    },
    {
      id: "sec-ordinance",
      label: "No-Littering and Related Ordinances",
      fields: [
        {
          id: "or1",
          label: "12. The barangay has its own No-Littering ordinance",
          value: opts.hasNoLittering ? "Yes" : "",
          type: "boolean" as const,
        },
        {
          id: "or2",
          label: "13. The City / Municipality has a No-Littering Ordinance which the barangay implements",
          value: opts.cityOrdinance ? "Yes" : "",
          type: "boolean" as const,
        },
        {
          id: "or3",
          label: "14. Does the barangay apprehend violators of R.A. 9003? (Check apprehension tickets, record of violators)",
          value: opts.apprehendViolators ? "Yes" : "",
          type: "boolean" as const,
        },
      ],
    },
    {
      id: "sec-next-steps",
      label: "Next Steps",
      fields: NEXT_STEPS_CATEGORIES.map((cat, i) => ({
        id: `ns${i + 1}`,
        label: `${cat} — Reasons for Low Compliance & Next Steps`,
        value: "",
        type: "textarea" as const,
        hint: "Cite applicable RA 9003 provisions (Sections 49 and 50) and legal consequences",
      })),
    },
  ];
}

export const mockEcaReports: EcaReport[] = [
  {
    id: "eca-001",
    barangayId: "brgy-001",
    quarter: 1,
    year: 2025,
    status: "ACCEPTED",
    revisionRound: 1,
    preparedBy: "Lucia Santos",
    preparedAt: "2025-04-05",
    endorsedBy: "Councilor Maria Dela Cruz",
    endorsedAt: "2025-04-08",
    certifiedBy: "Kapitan Jose Santos",
    certifiedAt: "2025-04-10",
    reviewedAt: "2025-04-12",
    cenroFeedback: "ECA report is complete and properly documented. Segregation compliance noted.",
    sections: buildSections({
      hasCommittee: true,
      committeeMembers: [
        "Kagawad",
        "SK Chairman",
        "President of Home Owners Association",
        "Business Community / Representative",
      ],
      mrfType: "Established MRF operated by the barangay",
      mrfOperational: true,
      wasteTypes: ["Recyclables", "Compost / Biodegradable", "Residual"],
      collectionScheme: "Separate day collection of different wastes",
      totalHouseholds: 1820,
      compliantHouseholds: 1420,
      population: 8450,
      perCapita: 0.45,
      cleanupConducted: true,
      cleanupSacks: 12,
      biodiverted: 59560,
      recyclablesDiverted: 7840,
      othersDiverted: 600,
      hasNoLittering: true,
      cityOrdinance: true,
      apprehendViolators: true,
    }),
    attachments: [
      { id: "att-001", filename: "segregation_compliance_photo.jpg", fileType: "IMAGE", sizeBytes: 2048000, uploadedAt: "2025-04-05" },
      { id: "att-002", filename: "eca_q1_2025_signed.pdf", fileType: "PDF", sizeBytes: 512000, uploadedAt: "2025-04-05" },
    ],
    createdAt: "2025-04-02",
    updatedAt: "2025-04-12",
  },
  {
    id: "eca-002",
    barangayId: "brgy-001",
    quarter: 2,
    year: 2025,
    status: "FOR_REVISION",
    revisionRound: 1,
    preparedBy: "Lucia Santos",
    preparedAt: "2025-07-03",
    reviewedAt: "2025-07-10",
    cenroFeedback: "MRF section is incomplete. Please provide the monthly breakdown of recyclables sold per material type and attach the MRF operational log.",
    sections: buildSections({
      hasCommittee: true,
      committeeMembers: ["Kagawad", "SK Chairman"],
      wasteTypes: ["Recyclables", "Compost / Biodegradable", "Residual"],
      collectionScheme: "Separate day collection of different wastes",
      totalHouseholds: 1820,
      compliantHouseholds: 1492,
      population: 8450,
      perCapita: 0.45,
      hasNoLittering: true,
      cityOrdinance: true,
    }),
    attachments: [],
    createdAt: "2025-07-01",
    updatedAt: "2025-07-10",
  },
  {
    id: "eca-003",
    barangayId: "brgy-001",
    quarter: 3,
    year: 2025,
    status: "DRAFT",
    revisionRound: 0,
    sections: buildSections(),
    attachments: [],
    createdAt: "2025-10-01",
    updatedAt: "2025-10-01",
  },
  {
    id: "eca-004",
    barangayId: "brgy-002",
    quarter: 1,
    year: 2025,
    status: "ACCEPTED",
    revisionRound: 1,
    preparedBy: "Ana Reyes",
    preparedAt: "2025-04-08",
    endorsedBy: "Councilor Roberto Lim",
    endorsedAt: "2025-04-11",
    certifiedBy: "Kapitan Elena Cruz",
    certifiedAt: "2025-04-13",
    reviewedAt: "2025-04-15",
    sections: buildSections({ hasCommittee: true, totalHouseholds: 1200, compliantHouseholds: 950, population: 5800 }),
    attachments: [],
    createdAt: "2025-04-06",
    updatedAt: "2025-04-15",
  },
  {
    id: "eca-005",
    barangayId: "brgy-003",
    quarter: 1,
    year: 2025,
    status: "ENDORSED",
    revisionRound: 1,
    preparedBy: "Secretary Carmen Reyes",
    preparedAt: "2025-04-11",
    endorsedBy: "Councilor Carlo Bautista",
    endorsedAt: "2025-04-14",
    sections: buildSections({ hasCommittee: true, totalHouseholds: 980, compliantHouseholds: 720 }),
    attachments: [],
    createdAt: "2025-04-10",
    updatedAt: "2025-04-14",
  },
  {
    id: "eca-006",
    barangayId: "brgy-004",
    quarter: 1,
    year: 2025,
    status: "OVERDUE",
    revisionRound: 0,
    sections: buildSections(),
    attachments: [],
    createdAt: "2025-04-01",
    updatedAt: "2025-04-01",
  },
  {
    id: "eca-007",
    barangayId: "brgy-005",
    quarter: 2,
    year: 2025,
    status: "PENDING",
    revisionRound: 1,
    preparedBy: "Josefa Torres",
    preparedAt: "2025-07-01",
    endorsedBy: "Councilor Manny Buenaventura",
    endorsedAt: "2025-07-03",
    certifiedBy: "Kapitan Ricardo Torres",
    certifiedAt: "2025-07-05",
    sections: buildSections({ hasCommittee: true, totalHouseholds: 1540, compliantHouseholds: 1180, population: 7200 }),
    attachments: [],
    createdAt: "2025-07-01",
    updatedAt: "2025-07-05",
  },
];

export function getEcaByBarangay(barangayId: string): EcaReport[] {
  return mockEcaReports.filter((r) => r.barangayId === barangayId);
}

export function getLatestEca(barangayId: string): EcaReport | undefined {
  return mockEcaReports
    .filter((r) => r.barangayId === barangayId)
    .sort((a, b) => (a.year !== b.year ? b.year - a.year : b.quarter - a.quarter))[0];
}
