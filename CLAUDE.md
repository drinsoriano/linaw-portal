# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (localhost:5173)
npm run build      # Type-check + production build (tsc -b && vite build)
npm run lint       # ESLint
npm run preview    # Preview production build
```

There is no test runner configured. Type correctness is the primary quality gate — always verify with `npm run build` before considering a task done.

## TypeScript Strictness — Critical Rules

`tsconfig.app.json` enforces these, and **`npm run build` will fail** on violations:

- **`noUnusedLocals` / `noUnusedParameters`** — Every imported identifier and parameter must be used. Unused imports are build errors, not warnings.
- **`verbatimModuleSyntax`** — Type-only imports must use `import type { X }` syntax, or be omitted and inferred.
- **`jsx: "react-jsx"`** — New JSX transform. **Never write `import React from "react"`** — it will fail with TS6133. Import only what you use: `import { useState, useEffect } from "react"`.
- When you need `ReactNode` or `ElementType`, import them directly: `import { ReactNode } from "react"`, not `React.ReactNode`.
- `React.SomeType` in type positions is allowed when React is imported as a value, but prefer named imports to avoid unused-import errors.

## Architecture Overview

### Domain Context
LINAW (Localized Initiative for Networked Applications on Waste Management) is an RA 9003 (Ecological Solid Waste Management Act) compliance monitoring portal for Calamba City's 54 barangays. The scoring model:
- **BENCHMARK = 4.21** — full compliance threshold (indicators below this are flagged)
- **CAP_THRESHOLD = 3.41** — below this requires a Corrective Action Plan
- **5-point Likert scale**: 1 (Non-Compliant) → 5 (Fully Compliant)
- **39 audit indicators** across 4 categories: SWM Programs (11), Committee (9), Collection & Fees (9), Environmental Impact (10). Indicator names/descriptions match the actual *LINAW Audit Tool: RA 9003 Compliance Assessment Checklist* — do not invent or rename indicators.

Three parallel workflows exist (each with its own status enum):
- **RA 9003 Audit**: DRAFT → SUBMITTED → REVIEWED → VALIDATED (or RETURNED_ENCODER / RETURNED_CAPTAIN / REJECTED)
- **ECA Quarterly Report**: DRAFT → SUBMITTED → ENDORSED → PENDING → ACCEPTED (or FOR_REVISION / OVERDUE). Three-tier chain: Secretary encodes & submits for committee review → Councilor (Committee Chair on Environment) reviews & endorses to Captain → Captain certifies & officially submits to CENRO.
- **CENRO Feedback**: NOT_STARTED → ONGOING → FOR_VERIFICATION → COMPLETED

### ECA Form Reference
The ECA report is based on **Manila Bayanihan Form 2.2 (Barangay DCF)** — the physical quarterly Solid Waste Management data collection form. Its sections:
1. **General Information** — barangay name, location, population, households
2. **SWM Committee** — E.O. existence, committee composition (Kagawad, SK Chairman, HOA, schools, NGOs, junkshop owners, etc.)
3. **Mandatory Segregation** — household compliance rate (≥70% = compliant)
4. **Segregation & Collection** — waste types collected, collection scheme
5. **Functional MRF** — MRF existence, type, and operability score
6. **Waste Generation & Diversion** — per capita gen, quarterly estimate, clean-up activities, waste diverted by type (biodegradable/recyclable/others), waste diversion % vs target
7. **No-Littering Ordinances** — ordinance existence, apprehension records
8. **Next Steps** — key legal provisions (RA 9003 §49–50), reasons for low compliance, remediation steps

The form's signature block directly drives the 3-tier approval chain: **"Accomplished by: Committee Chair on Environment"** (= `BARANGAY_COUNCILOR`) → **"Certified Correct: Punong Barangay"** (= `BARANGAY_CAPTAIN`).

> The current `ecaReports.ts` mock sections are a simplified subset of the real form. Do not add new ECA sections without user direction.

### Frontend Only
No backend. All state lives in React context + localStorage. Mock data is seeded from `src/data/`. Only four localStorage keys persist across reloads: `linaw_user`, `linaw_eca_reports`, `linaw_feedbacks`, `linaw_citizen_reports`. All other module edits (audit, collection, recycler, financial, IEC, haulers, CAP) are in-memory mock reads that reset on refresh.

Architecture and workflow documentation lives in `docs/` (Mermaid diagrams). See `docs/LINAW_SYSTEM_WORKFLOW.md` for the consolidated reference.

### Directory Structure
```
src/
  data/           # Static mock data (read-only source of truth for seeding)
    barangays.ts      — 54 Barangay objects
    indicators.ts     — 39 AuditIndicator objects + CATEGORIES array
    submissions.ts    — Generated AuditSubmission[] for all 54 barangays + cityStats + trendData
    ecaReports.ts     — mockEcaReports[] (ECA quarterly reports, seeds EcaContext)
    feedbacks.ts      — mockFeedbacks[] (CENRO feedback, seeds FeedbackContext)
    correctiveActions.ts — mockCorrectiveActions[]
    collectionLogs.ts — mockCollectionLogs[]
    recyclers.ts      — mockRecyclers[] + mockMonthlyRecovery[]
    haulers.ts        — mockHaulers[]
    financials.ts     — mockFinancials[] + getFinancialsByBarangay() + computeYTDSummary()
    iecActivities.ts  — mockIECActivities[]
    ngoPartners.ts    — mockNGOPartners[] (no page yet — planned NGO Directory)
    users.ts          — mockUsers[] + ROLE_LOGIN_PRESETS
  types/          # All TypeScript interfaces and enums
    index.ts          — Single source of all domain types + STATUS_COLORS/LABELS maps
  lib/
    scoring.ts        — computeOverallScore(), computeCategoryScore(), getComplianceLevel(),
                        BENCHMARK, CAP_THRESHOLD, LIKERT_DESCRIPTIONS, SCORE_RANGE_LABELS
    utils.ts          — cn() Tailwind class merger
  context/        # React contexts — all wrapped in App.tsx
    AuthContext.tsx     — useAuth(), hasRole(), canEdit/canValidate/canAdmin(), login/logout
    EcaContext.tsx      — useEca(): getByBarangay, getLatest, updateReport, setStatus,
                          submitForReview (Secretary→SUBMITTED), endorseReport (Councilor→ENDORSED),
                          certifyToCenro (Captain→PENDING), returnReport (return down chain with remarks)
    FeedbackContext.tsx — useFeedback(): getByBarangay, issueFeedback, updateStatus
    ToastContext.tsx    — useToast(): toast({title, description, variant})
  components/
    layout/       — AppLayout (Outlet wrapper), Sidebar (role-filtered nav), Header
    shared/       — PageHeader, StatCard, ScoreBadge/ScoreBar, StatusBadge
    charts/       — BarangayScoreChart, CategoryRadarChart, ComplianceTrendChart, IndicatorBarChart
    ui/           — shadcn/ui subset: badge, button, card, dialog, input, label,
                    progress, select, separator, tabs, textarea
  pages/          — Root: Login, Dashboard, BarangayProfile, AuditChecklist, EvidenceRepository,
                    ComplianceResults, PDCAActionPlan, RootCauseAnalysis, Reports, UserManagement, Settings
    cenro/        — CenroDashboard, EcaTracker, PerformanceRanking, HaulerAccreditation, FeedbackManagement
    barangay/     — BarangayDashboard, EcaReport, CollectionMonitoring, RecyclerRegistry,
                    FinancialSummary, IncidentReport, IECActivities, FeedbackView
    public/       — PublicDashboard (/public, no auth), CitizenReport (/citizen/report, no auth)
docs/             # Mermaid workflow documentation (see LINAW_SYSTEM_WORKFLOW.md)
```

### RBAC Pattern
Every page and sidebar item uses `hasRole()` from `useAuth()` to gate visibility and editing:
```tsx
const { user, hasRole } = useAuth();
const isCaptain = hasRole("BARANGAY_CAPTAIN");
```
The 7 roles: `SYSTEM_ADMIN`, `CENRO_EVALUATOR`, `BARANGAY_SECRETARY`, `BARANGAY_COUNCILOR`, `BARANGAY_CAPTAIN`, `RESEARCHER`, `CITIZEN`.
- `BARANGAY_SECRETARY` — encodes ECA + RA 9003 audit + uploads evidence (formerly split into Secretary + Encoder; merged into one)
- `BARANGAY_COUNCILOR` — Committee Chair on Environment; reviews & endorses SWM content to the Captain

Login redirect by role (smart redirect on `/`): CENRO → `/cenro/dashboard`; any Barangay role → `/barangay/dashboard`; CITIZEN → `/public`; Admin/Researcher → `/dashboard`.

Barangay-scoped users (`BARANGAY_SECRETARY`, `BARANGAY_COUNCILOR`, `BARANGAY_CAPTAIN`) are restricted to `user.barangayId`. CENRO and Admin see all 54 barangays. Convenience helpers on `useAuth()`: `canEdit()` (Admin/Secretary), `canValidate()` (Admin/CENRO), `canAdmin()` (Admin only).

### Data Flow (Current State)
Mutable entities use a context-over-localStorage pattern (`EcaContext`, `FeedbackContext`):
1. Context initializes from `localStorage.getItem("linaw_eca_reports")`, falling back to the matching `data/*.ts` mock
2. Mutations persist via `localStorage.setItem(...)`
3. Pages consume via the hook, e.g. `const { reports } = useEca()`

The RA 9003 audit pages (`AuditChecklistPage`, `ComplianceResultsPage`, `CenroDashboard`) still import directly from `src/data/submissions.ts` (static, in-memory) — there is no SubmissionsContext yet. Likewise collection/recycler/financial/IEC/hauler pages read their mock files directly. A SubmissionsContext to make audit data mutable/persistent is the natural next step if needed.

### Installed Radix UI Packages
Only these are installed (do not assume others): `avatar`, `checkbox`, `dialog`, `dropdown-menu`, `label`, `progress`, `select`, `separator`, `slot`, `switch`, `tabs`, `toast`.

The `src/components/ui/` directory only has: `badge`, `button`, `card`, `dialog`, `input`, `label`, `progress`, `select`, `separator`, `tabs`, `textarea`. Use these; do not import from ui/ paths that don't exist.

### Scoring Utilities
All score computation lives in `src/lib/scoring.ts`. Use these functions rather than inline logic:
- `getComplianceLevel(score)` → `ComplianceLevel`
- `computeOverallScore(responses, indicators)` → `OverallScoreResult`
- `computeCategoryScore(responses, indicators, category)` → `CategoryScoreResult`
- `getScoreColor(score)`, `getScoreBg(score)`, `getBarColor(score)` — Tailwind color strings for UI

### Key Design Conventions
- Primary green: `#16a34a` (used directly, not via Tailwind token)
- Sidebar background: `#0f2d1a` (dark green)
- `cn()` from `src/lib/utils` for all conditional Tailwind classes
- All page components are named exports (`export function FooPage()`)
- `PageHeader` shared component accepts `title`, `subtitle`, and optional `children` for action buttons
