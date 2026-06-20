# LINAW Web Portal — System Workflow

**LINAW** — Localized Initiative for Networked Applications on Waste Management
**Jurisdiction:** Calamba City, Laguna — 54 Barangays
**Legal Basis:** Republic Act No. 9003 (Ecological Solid Waste Management Act of 2000)

---

## Overview

The LINAW Web Portal is a role-based compliance monitoring platform that digitalizes the RA 9003 reporting, self-assessment, and governance cycle among barangays, CENRO, and the public. It supports the full submission lifecycle — from audit encoding at the barangay level to validation by CENRO — and provides open data access for citizens.

---

## High-Level System Workflow

```mermaid
flowchart TD
    A([User visits LINAW Portal]) --> B[Login Page\n/login]
    B --> C{Authenticate\nby Role}

    C -->|CENRO_EVALUATOR| D1[/cenro/dashboard]
    C -->|BARANGAY_*| D2[/barangay/dashboard]
    C -->|SYSTEM_ADMIN / RESEARCHER| D3[/dashboard]
    C -->|CITIZEN| D4[/public]

    D1 --> E1[Monitor city-wide compliance]
    D1 --> E2[Track ECA submissions]
    D1 --> E3[Review barangay audit results]
    D1 --> E4[Issue feedback / corrective actions]
    D1 --> E5[Manage hauler accreditation]

    D2 --> F1[Encode RA 9003 audit checklist]
    D2 --> F2[Upload evidence per indicator]
    D2 --> F3[Prepare ECA quarterly report]
    D2 --> F4[Log collection, recycler, financial data]
    D2 --> F5[View CENRO feedback]

    D3 --> G1[Cross-barangay analytics]
    D3 --> G2[Root cause analysis tools]
    D3 --> G3[PDCA action plan tracking]
    D3 --> G4[Report generation / export]

    D4 --> H1[View open data dashboard]
    D4 --> H2[Submit citizen concern]

    F1 --> I{Submission\nStatus Flow}
    I -->|Encoder submits| J[SUBMITTED]
    J -->|Captain reviews| K{Captain\nDecision}
    K -->|Approves| L[REVIEWED → CENRO]
    K -->|Returns| M[RETURNED_ENCODER]
    M --> F1
    L --> N{CENRO\nDecision}
    N -->|Validates| O[VALIDATED ✓]
    N -->|Returns| P[RETURNED_CAPTAIN]
    N -->|Rejects| Q[REJECTED ✗]
    P --> K

    F3 --> R{ECA\nStatus Flow}
    R -->|Captain submits| S[SUBMITTED → PENDING]
    S -->|CENRO accepts| T[ACCEPTED ✓]
    S -->|CENRO returns| U[FOR_REVISION]
    U --> F3

    E4 --> V[Feedback issued to Barangay]
    V --> W[Barangay acknowledges\nand responds]
    W --> X[CENRO marks\nFOR_VERIFICATION / COMPLETED]
```

---

## Authentication and Session Management

- Login is role-based. No password is required in the prototype — the user selects their role.
- Upon login, the session is stored in `localStorage` under the key `linaw_user`.
- The `AuthContext` provides `hasRole()`, `canEdit()`, `canValidate()`, and `canAdmin()` helpers used throughout the application for RBAC gating.
- Logout clears the session from localStorage and redirects to `/login`.

| Role | Login Redirects To |
|---|---|
| `CENRO_EVALUATOR` | `/cenro/dashboard` |
| `BARANGAY_SECRETARY` / `BARANGAY_COUNCILOR` / `BARANGAY_CAPTAIN` / `BARANGAY_ENCODER` | `/barangay/dashboard` |
| `SYSTEM_ADMIN` / `RESEARCHER` | `/dashboard` |
| `CITIZEN` | `/public` |

---

## RA 9003 Audit Submission Lifecycle

The RA 9003 compliance self-assessment follows a multi-step review chain:

| Status | Actor | Description |
|---|---|---|
| `DRAFT` | Barangay Encoder / Secretary | Initial encoding of 39 indicators (Likert 1–5) |
| `SUBMITTED` | Barangay Encoder / Secretary | Submission to Barangay Captain for review |
| `RETURNED_ENCODER` | Barangay Captain | Returns to encoder for correction |
| `REVIEWED` | Barangay Captain | Endorsed to CENRO for evaluation |
| `RETURNED_CAPTAIN` | CENRO Evaluator | Returns to Captain for revision |
| `VALIDATED` | CENRO Evaluator | Final approval — compliance score confirmed |
| `REJECTED` | CENRO Evaluator | Submission rejected — requires full resubmission |

Scoring thresholds:
- **BENCHMARK = 4.21** — Indicators below this are flagged for monitoring
- **CAP_THRESHOLD = 3.41** — Categories below this require a Corrective Action Plan (CAP)

---

## ECA Quarterly Reporting Lifecycle

The ECA (Environmental Compliance Activity) quarterly report follows a parallel but distinct workflow:

| Status | Actor | Description |
|---|---|---|
| `DRAFT` | Barangay Secretary / Councilor | Prepares the quarterly ECA form |
| `SUBMITTED` | Barangay Captain | Certifies and submits to CENRO |
| `PENDING` | CENRO Evaluator | Under review |
| `FOR_REVISION` | CENRO Evaluator | Returns with feedback to barangay |
| `ACCEPTED` | CENRO Evaluator | Approved quarterly report |
| `OVERDUE` | System | Deadline passed, no submission received |

---

## Feedback and Corrective Action Cycle

CENRO can issue feedback to any barangay linked to:
- Low ECA compliance indicators
- Below-CAP audit scores
- Missing evidence uploads
- Missed collection logs or incidents

Barangay response statuses:
`NOT_STARTED` → `ONGOING` → `FOR_VERIFICATION` → `COMPLETED`
