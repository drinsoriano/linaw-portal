import type { AuditIndicator, IndicatorCategory } from "../types";
import { CATEGORY_DESCRIPTIONS } from "../types";

export const indicators: AuditIndicator[] = [
  // SWM Programs (11)
  {
    id: "P1",
    code: "P1",
    name: "Barangay SWM Plan",
    description:
      "Barangay Solid Waste Management Plan aligned with the city/municipal SWM plan and RA 9003 requirements.",
    category: "SWM_PROGRAMS",
    sortOrder: 1,
  },
  {
    id: "P2.1",
    code: "P2.1",
    name: "Waste Segregation at Source",
    description:
      "Implementation of waste segregation at source covering biodegradable, non-biodegradable, residual, and special wastes.",
    category: "SWM_PROGRAMS",
    sortOrder: 2,
  },
  {
    id: "P2.2",
    code: "P2.2",
    name: "Recycling Program",
    description:
      "Existence of a recycling program including MRF operation or drop-off points with coordination with junk shops.",
    category: "SWM_PROGRAMS",
    sortOrder: 3,
  },
  {
    id: "P2.2.1",
    code: "P2.2.1",
    name: "5-Year Recycling Strategy",
    description:
      "Documented 5-year recycling strategy with annual targets for waste diversion and recycling rates.",
    category: "SWM_PROGRAMS",
    sortOrder: 4,
  },
  {
    id: "P2.3",
    code: "P2.3",
    name: "Residual Waste Classification",
    description:
      "Proper classification of residual waste and documented disposal practices compliant with RA 9003.",
    category: "SWM_PROGRAMS",
    sortOrder: 5,
  },
  {
    id: "P3",
    code: "P3",
    name: "Composting Program",
    description:
      "Active composting program (backyard or communal) with documentation of compost production and distribution.",
    category: "SWM_PROGRAMS",
    sortOrder: 6,
  },
  {
    id: "P4",
    code: "P4",
    name: "IEC Campaign Activities",
    description:
      "Information, Education, and Communication campaigns conducted for SWM awareness among households.",
    category: "SWM_PROGRAMS",
    sortOrder: 7,
  },
  {
    id: "P5.1",
    code: "P5.1",
    name: "HOA Participation in SWM",
    description:
      "Active participation of Homeowners' Associations in SWM programs and compliance activities.",
    category: "SWM_PROGRAMS",
    sortOrder: 8,
  },
  {
    id: "P6.1",
    code: "P6.1",
    name: "SWM Budget Allocation",
    description:
      "Documented budget allocation for SWM activities in the barangay annual budget.",
    category: "SWM_PROGRAMS",
    sortOrder: 9,
  },
  {
    id: "P6.2",
    code: "P6.2",
    name: "SWM Ordinance Enforcement",
    description:
      "Active enforcement of barangay SWM ordinances including sanctions for violations.",
    category: "SWM_PROGRAMS",
    sortOrder: 10,
  },
  {
    id: "P6.3",
    code: "P6.3",
    name: "SWM Monitoring and Reporting",
    description:
      "Regular monitoring and reporting of SWM activities to higher LGU authorities.",
    category: "SWM_PROGRAMS",
    sortOrder: 11,
  },

  // Barangay SWM Committee (9)
  {
    id: "C1",
    code: "C1",
    name: "Kagawad Representative",
    description:
      "A Kagawad (Barangay Councilor) designated as SWM committee chair with documented appointment.",
    category: "COMMITTEE",
    sortOrder: 12,
  },
  {
    id: "C2",
    code: "C2",
    name: "SK Chair / Representative",
    description:
      "Sangguniang Kabataan (SK) chairperson or representative included in the SWM committee.",
    category: "COMMITTEE",
    sortOrder: 13,
  },
  {
    id: "C3",
    code: "C3",
    name: "HOA President Representative",
    description:
      "Homeowners' Association president or representative included in and active in the SWM committee.",
    category: "COMMITTEE",
    sortOrder: 14,
  },
  {
    id: "C4",
    code: "C4",
    name: "School Representative",
    description:
      "Representative from a school within the barangay included in the SWM committee.",
    category: "COMMITTEE",
    sortOrder: 15,
  },
  {
    id: "C5",
    code: "C5",
    name: "PTA President / Representative",
    description:
      "One (1) Parents and Teachers Association president or representative included in and active in the SWM committee.",
    category: "COMMITTEE",
    sortOrder: 16,
  },
  {
    id: "C6",
    code: "C6",
    name: "Religious Organization Representative",
    description:
      "One (1) religious organization representative included in the SWM committee.",
    category: "COMMITTEE",
    sortOrder: 17,
  },
  {
    id: "C7",
    code: "C7",
    name: "Business Sector Representative",
    description:
      "Local business sector representative included in the SWM committee.",
    category: "COMMITTEE",
    sortOrder: 18,
  },
  {
    id: "C8",
    code: "C8",
    name: "NGO / PO Representative",
    description:
      "Non-Government Organization or People's Organization representative in the SWM committee.",
    category: "COMMITTEE",
    sortOrder: 19,
  },
  {
    id: "C9",
    code: "C9",
    name: "Vendors / Junkshop Representative",
    description:
      "Vendors, junkshop, or recycler representative included in the SWM committee.",
    category: "COMMITTEE",
    sortOrder: 20,
  },

  // Waste Collection and Fees (9)
  {
    id: "WCF1.1",
    code: "WCF1.1",
    name: "Recyclable and Reusable Waste Collection",
    description:
      "Separate collection of recyclable and reusable wastes on a documented schedule (e.g., 'Libreng Hakot ng Basura' program).",
    category: "WASTE_COLLECTION_FEES",
    sortOrder: 21,
  },
  {
    id: "WCF1.2",
    code: "WCF1.2",
    name: "Compostable Waste Collection",
    description:
      "Separate collection of compostable/biodegradable wastes (e.g., yard/garden wastes) on a documented schedule.",
    category: "WASTE_COLLECTION_FEES",
    sortOrder: 22,
  },
  {
    id: "WCF1.3",
    code: "WCF1.3",
    name: "Residual / Special Waste Schedule",
    description:
      "Documented and practiced collection schedule for residual and special wastes.",
    category: "WASTE_COLLECTION_FEES",
    sortOrder: 23,
  },
  {
    id: "WCF2",
    code: "WCF2",
    name: "PPE Provision for Collectors",
    description:
      "Personal Protective Equipment provided to waste collectors (gloves, masks, boots, vests).",
    category: "WASTE_COLLECTION_FEES",
    sortOrder: 24,
  },
  {
    id: "WCF3",
    code: "WCF3",
    name: "Worker Training on SWM",
    description:
      "Training program for waste collectors and SWM workers on proper handling and health safety.",
    category: "WASTE_COLLECTION_FEES",
    sortOrder: 25,
  },
  {
    id: "WCF4",
    code: "WCF4",
    name: "Transport Coordination",
    description:
      "Coordination with city hauler for timely and efficient transport of collected wastes.",
    category: "WASTE_COLLECTION_FEES",
    sortOrder: 26,
  },
  {
    id: "WCF5",
    code: "WCF5",
    name: "Covered Waste Hauling",
    description:
      "Waste hauling vehicles and containers are properly covered to prevent spillage and exposure.",
    category: "WASTE_COLLECTION_FEES",
    sortOrder: 27,
  },
  {
    id: "WCF6",
    code: "WCF6",
    name: "Fee Computation and Collection",
    description:
      "Documented system for computing and collecting garbage fees from households and establishments.",
    category: "WASTE_COLLECTION_FEES",
    sortOrder: 28,
  },
  {
    id: "WCF7",
    code: "WCF7",
    name: "COA Alignment of Collections",
    description:
      "Garbage fee collections are aligned with Commission on Audit (COA) standards and properly liquidated.",
    category: "WASTE_COLLECTION_FEES",
    sortOrder: 29,
  },

  // Environmental and Community Impact (10)
  {
    id: "ECI1",
    code: "ECI1",
    name: "Community Participation",
    description:
      "Level of community participation in SWM activities, clean-up drives, and environmental programs.",
    category: "ENV_COMMUNITY_IMPACT",
    sortOrder: 30,
  },
  {
    id: "ECI2",
    code: "ECI2",
    name: "Waste Volume Reduction",
    description:
      "Measurable reduction in the volume of waste generated and disposed at the barangay level.",
    category: "ENV_COMMUNITY_IMPACT",
    sortOrder: 31,
  },
  {
    id: "ECI3",
    code: "ECI3",
    name: "Open Dumping Reduction",
    description:
      "Reduction or elimination of open dumping incidents within the barangay.",
    category: "ENV_COMMUNITY_IMPACT",
    sortOrder: 32,
  },
  {
    id: "ECI4",
    code: "ECI4",
    name: "Cleanliness of Public Areas",
    description:
      "Visible cleanliness and maintenance of streets, canals, and public areas within the barangay.",
    category: "ENV_COMMUNITY_IMPACT",
    sortOrder: 33,
  },
  {
    id: "ECI5",
    code: "ECI5",
    name: "Household Segregation Behavior",
    description:
      "Improved and consistent waste segregation behavior at the household level.",
    category: "ENV_COMMUNITY_IMPACT",
    sortOrder: 34,
  },
  {
    id: "ECI6",
    code: "ECI6",
    name: "Waste Diversion Rate",
    description:
      "Percentage of waste diverted from landfill through recycling, composting, and reuse.",
    category: "ENV_COMMUNITY_IMPACT",
    sortOrder: 35,
  },
  {
    id: "ECI7",
    code: "ECI7",
    name: "MRF / Composting Facility Status",
    description:
      "Operational status of the Materials Recovery Facility (MRF) or composting facility.",
    category: "ENV_COMMUNITY_IMPACT",
    sortOrder: 36,
  },
  {
    id: "ECI8",
    code: "ECI8",
    name: "Health Outcome Improvements",
    description:
      "Improvements in health outcomes related to SWM, including reduced vector-borne disease risk.",
    category: "ENV_COMMUNITY_IMPACT",
    sortOrder: 37,
  },
  {
    id: "ECI9",
    code: "ECI9",
    name: "Environmental Monitoring",
    description:
      "Regular environmental monitoring and documentation of SWM impacts.",
    category: "ENV_COMMUNITY_IMPACT",
    sortOrder: 38,
  },
  {
    id: "ECI10",
    code: "ECI10",
    name: "Community Awareness and Sustainability",
    description:
      "Level of community awareness on SWM and sustainability of implemented programs.",
    category: "ENV_COMMUNITY_IMPACT",
    sortOrder: 39,
  },
];

export const CATEGORIES: Array<{
  key: IndicatorCategory;
  label: string;
  short: string;
  count: number;
  description: string;
}> = [
  {
    key: "SWM_PROGRAMS",
    label: "SWM Programs",
    short: "SWM Programs",
    count: 11,
    description: CATEGORY_DESCRIPTIONS.SWM_PROGRAMS,
  },
  {
    key: "COMMITTEE",
    label: "Barangay SWM Committee Structure",
    short: "Committee",
    count: 9,
    description: CATEGORY_DESCRIPTIONS.COMMITTEE,
  },
  {
    key: "WASTE_COLLECTION_FEES",
    label: "Waste Collection and Fees",
    short: "Collection & Fees",
    count: 9,
    description: CATEGORY_DESCRIPTIONS.WASTE_COLLECTION_FEES,
  },
  {
    key: "ENV_COMMUNITY_IMPACT",
    label: "Environmental and Community Impact",
    short: "Environmental Impact",
    count: 10,
    description: CATEGORY_DESCRIPTIONS.ENV_COMMUNITY_IMPACT,
  },
];
