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
LINAW is an RA 9003 (Ecological Solid Waste Management Act) compliance monitoring portal for Calamba City's 54 barangays. The scoring model:
- **BENCHMARK = 4.21** — full compliance threshold (indicators below this are flagged)
- **CAP_THRESHOLD = 3.41** — below this requires a Corrective Action Plan
- **5-point Likert scale**: 1 (Non-Compliant) → 5 (Fully Compliant)
- **39 audit indicators** across 4 categories: SWM Programs (11), Committee (9), Collection & Fees (9), Environmental Impact (10)
- **Submission workflow**: DRAFT → SUBMITTED → REVIEWED → VALIDATED (or RETURNED_ENCODER / RETURNED_CAPTAIN / REJECTED)

### Frontend Only
No backend. All state lives in React context + localStorage. Mock data is seeded from `src/data/`.

### Directory Structure
```
src/
  data/           # Static mock data (read-only source of truth for seeding)
    barangays.ts      — 54 Barangay objects
    indicators.ts     — 39 AuditIndicator objects + CATEGORIES array
    submissions.ts    — Generated AuditSubmission[] for all 54 barangays + cityStats + trendData
    correctiveActions.ts — mockCorrectiveActions[]
    users.ts          — mockUsers[] + ROLE_LOGIN_PRESETS
  types/          # All TypeScript interfaces and enums
    index.ts          — Single source of all domain types
  lib/
    scoring.ts        — computeOverallScore(), computeCategoryScore(), getComplianceLevel(),
                        BENCHMARK, CAP_THRESHOLD, LIKERT_DESCRIPTIONS, SCORE_RANGE_LABELS
    utils.ts          — cn() Tailwind class merger
  context/        # React contexts (AuthContext exists; SubmissionsContext/CAPContext/ToastContext are Phase 2)
    AuthContext.tsx   — useAuth(), hasRole(), login(), logout(), localStorage persistence
  components/
    layout/       — AppLayout (Outlet wrapper), Sidebar (role-filtered nav), Header
    shared/       — PageHeader, StatCard, ScoreBadge/ScoreBar, StatusBadge
    charts/       — BarangayScoreChart, CategoryRadarChart, ComplianceTrendChart, IndicatorBarChart
    ui/           — shadcn/ui subset: badge, button, card, dialog, input, label,
                    progress, select, separator, tabs, textarea
  pages/          — One file per page, named *Page.tsx
```

### RBAC Pattern
Every page and sidebar item uses `hasRole()` from `useAuth()` to gate visibility and editing:
```tsx
const { user, hasRole } = useAuth();
const isEncoder = hasRole("BARANGAY_ENCODER", "SYSTEM_ADMIN");
```
The 6 roles: `SYSTEM_ADMIN`, `CENRO_EVALUATOR`, `BARANGAY_ENCODER`, `BARANGAY_CAPTAIN`, `RESEARCHER`, `PUBLIC_VIEWER`.

Barangay-scoped users (`BARANGAY_ENCODER`, `BARANGAY_CAPTAIN`) are restricted to `user.barangayId`. CENRO and Admin see all 54 barangays.

### Data Flow (Current State)
Pages currently import directly from `src/data/submissions.ts` (static). Phase 2 introduces `SubmissionsContext` wrapping mutable state seeded from that static data, with localStorage persistence. The pattern is:
1. Context initializes from `localStorage.getItem("linaw_submissions")`, falling back to `data/submissions.ts`
2. Mutations call `localStorage.setItem(...)` via `useEffect`
3. Pages switch from `import { submissions }` to `const { submissions } = useSubmissions()`

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
