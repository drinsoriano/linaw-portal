# LINAW Web Portal — PDCA Workflow Mapping

The LINAW portal is structured around the **Plan-Do-Check-Act (PDCA)** continuous improvement cycle as the governance framework for RA 9003 barangay compliance monitoring. This document maps each phase of the PDCA cycle to the implemented modules and workflows.

---

## PDCA Overview

```mermaid
flowchart LR
    P([PLAN\nPrepare compliance\nbaseline and targets])
    D([DO\nSubmit reports and\nencode operational data])
    C([CHECK\nCENRO reviews and\nscores are computed])
    A([ACT\nIssue feedback and\nimprove compliance])

    P --> D --> C --> A --> P

    style P fill:#16a34a,color:#fff,stroke:#15803d
    style D fill:#2563eb,color:#fff,stroke:#1d4ed8
    style C fill:#d97706,color:#fff,stroke:#b45309
    style A fill:#dc2626,color:#fff,stroke:#b91c1c
```

---

## PLAN — Establish Compliance Baseline and Targets

> **Purpose:** Set up the governance structure, identify the reporting scope, and prepare barangay-level compliance documentation before the submission cycle begins.

### Portal Modules in this Phase

| Module | Route | Description |
|---|---|---|
| Barangay Profile | `/barangays` | Establishes the 54-barangay registry with population, district, captain, and contact details |
| RA 9003 Audit Checklist | `/audit` | 39 indicators across 4 categories prepared for scoring (DRAFT state) |
| ECA Quarterly Reporting | `/barangay/eca` | ECA form prepared by Secretary/Councilor for the reporting quarter |
| Recycler Registry | `/barangay/recyclers` | Recycler network mapped; baseline monthly recovery volumes established |
| Collection Monitoring | `/barangay/collection` | Collection schedule and hauler assignments planned |
| IEC Activities | `/barangay/iec` | IEC campaign calendar prepared |

### Key Data Objects
- `Barangay` records — 54 barangays, Calamba City
- `AuditCycle` — defines the period (semester, year, active dates)
- `AuditSubmission` (DRAFT) — blank submissions seeded per cycle
- `EcaReport` (DRAFT) — quarterly report prepared but not submitted

```mermaid
flowchart TD
    P1[Barangay Profile\n/barangays] --> P2[54 Barangays\nregistered with population\nand governance data]
    P3[Audit Cycle Setup\ncycle-2025-1] --> P4[39-indicator checklist\nassigned to each barangay]
    P5[ECA Form Preparation\n/barangay/eca] --> P6[Secretary/Councilor\nfills quarterly report\nsections — DRAFT]
    P7[Collection Schedule Planning\n/barangay/collection] --> P8[Hauler assignments\nroute planning]
    P9[Recycler Registry\n/barangay/recyclers] --> P10[Monthly recovery baseline\nestablished]
    P11[IEC Campaign Calendar\n/barangay/iec] --> P12[Training, campaigns,\nschool events planned]
```

---

## DO — Encode, Submit, and Log Compliance Activities

> **Purpose:** Barangay users execute their compliance tasks and submit documentation to the system for the active audit cycle.

### Portal Modules in this Phase

| Module | Route | Actor | Description |
|---|---|---|---|
| RA 9003 Audit | `/audit` | Encoder / Secretary | Scores 39 indicators (Likert 1–5) |
| Evidence Upload | `/evidence` | Encoder / Secretary | Attaches proof per indicator |
| ECA Report | `/barangay/eca` | Captain | Certifies and submits to CENRO |
| Collection Log | `/barangay/collection` | Secretary | Logs actual collection activity per day |
| Incident Reports | `/barangay/incidents` | Secretary | Reports open dumping, missed collection, PPE violations |
| Financial Summary | `/barangay/financial` | Secretary | Records fee collection, recycling income, expenses |
| IEC Activities | `/barangay/iec` | Secretary | Records completed IEC events and participant counts |
| Recycler Recovery | `/barangay/recyclers` | Secretary | Logs monthly recyclable volume per recycler |

```mermaid
flowchart TD
    D1[Encode Audit Checklist\n/audit] --> D2[39 indicators scored\nLikert 1–5 + notes]
    D2 --> D3[Upload Evidence\n/evidence\nPDF / Images / Documents]
    D3 --> D4[Audit status: SUBMITTED]
    D4 --> D5{Captain Review}
    D5 -->|Approve| D6[Status: REVIEWED\nForwarded to CENRO]
    D5 -->|Return| D7[Status: RETURNED_ENCODER\nCorrections needed]
    D7 --> D1

    D8[ECA Form — Captain Submits\n/barangay/eca] --> D9[ECA status: SUBMITTED\nForwarded to CENRO]

    D10[Log Collection Activities\n/barangay/collection] --> D11[CollectionLog recorded\ndate, volume, PPE, route]
    D12[Log Incidents\n/barangay/incidents] --> D13[IncidentReport: OPEN]
    D14[Log Financial Data\n/barangay/financial] --> D15[FinancialRecord: fees + income + expenses]
    D16[Log IEC Activities\n/barangay/iec] --> D17[IECActivity recorded\nparticipants + event type]
    D18[Update Recycler Registry\n/barangay/recyclers] --> D19[MonthlyRecovery logged\nvolume in kg + income]
```

---

## CHECK — Review, Score, and Track Compliance

> **Purpose:** CENRO evaluates barangay submissions, reviews scores, tracks ECA submissions, and identifies non-compliant barangays requiring intervention.

### Portal Modules in this Phase

| Module | Route | Actor | Description |
|---|---|---|---|
| CENRO Dashboard | `/cenro/dashboard` | CENRO | City-wide compliance overview and statistics |
| Compliance Results | `/results` | CENRO | Per-barangay audit scores and indicator breakdown |
| ECA Tracker | `/cenro/eca-tracker` | CENRO | Tracks ECA submission status across all 54 barangays |
| Performance Ranking | `/cenro/ranking` | CENRO | Sorted compliance ranking of all barangays |
| Reports | `/reports` | CENRO / Admin | Trend data, export to PDF/CSV |
| Hauler Accreditation | `/cenro/haulers` | CENRO | Reviews hauler compliance and accreditation status |

```mermaid
flowchart TD
    C1[CENRO Dashboard\n/cenro/dashboard] --> C2[City-wide compliance\nscore summary]
    C2 --> C3{Any barangay\nbelow CAP_THRESHOLD\n3.41?}

    C1 --> C4[ECA Tracker\n/cenro/eca-tracker]
    C4 --> C5{ECA Status?}
    C5 -->|PENDING| C6[Review ECA report]
    C6 -->|Accept| C7[Status: ACCEPTED ✓]
    C6 -->|Return| C8[Status: FOR_REVISION\nFeedback attached]

    C1 --> C9[Compliance Results\n/results]
    C9 --> C10[View per-indicator scores]
    C10 --> C11[Identify indicators\nbelow BENCHMARK 4.21]
    C10 --> C12[Validate or return\naudit submission]
    C12 -->|Validate| C13[Status: VALIDATED ✓]
    C12 -->|Return| C14[Status: RETURNED_CAPTAIN]

    C1 --> C15[Performance Ranking\n/cenro/ranking]
    C15 --> C16[Identify top and\nbottom performing barangays]

    C3 -->|Yes| C17[Trigger ACT phase\nfeedback + CAP]
    C3 -->|No| C18[Continue monitoring\nnext cycle]
```

---

## ACT — Improve, Respond, and Close the Loop

> **Purpose:** CENRO issues corrective feedback; barangays respond with action plans; improvements are tracked and the cycle restarts with better baselines.

### Portal Modules in this Phase

| Module | Route | Actor | Description |
|---|---|---|---|
| Feedback Management | `/cenro/feedback` | CENRO | Issues corrective action recommendations |
| Feedback View | `/barangay/feedback` | Barangay | Reviews and responds to CENRO feedback |
| PDCA Action Plan | `/action-plan` | Captain / Encoder | Tracks corrective actions per indicator |
| Root Cause Analysis | `/rca` | Admin / Researcher | 5-Why and Fishbone analysis tools |

```mermaid
flowchart TD
    A1[CENRO Identifies\nLow-Scoring Barangays] --> A2[Feedback Management\n/cenro/feedback]
    A2 --> A3[Issue feedback linked to:\nECA / Audit / Collection / Financial]
    A3 --> A4[Set priority:\nLOW / MEDIUM / HIGH / CRITICAL]
    A4 --> A5[Barangay receives feedback\n/barangay/feedback]

    A5 --> A6{Barangay\nResponse Status}
    A6 -->|Initial| A7[NOT_STARTED]
    A7 --> A8[ONGOING\nbarangay begins action]
    A8 --> A9[FOR_VERIFICATION\nbarangay submits proof]
    A9 --> A10[CENRO reviews\nand marks COMPLETED ✓]

    A5 --> A11[PDCA Action Plan\n/action-plan]
    A11 --> A12[Review CAP-flagged indicators\nscore below 3.41]
    A12 --> A13[Create corrective action\nper indicator]
    A13 --> A14[Assign owner + target date]
    A14 --> A15[Track status:\nOPEN → IN_PROGRESS → COMPLETED]

    A16[Root Cause Analysis\n/rca] --> A17[5-Why analysis\nper low-scoring indicator]
    A17 --> A18[Fishbone diagram\nMAN / MACHINE / METHOD /\nMATERIAL / MEASUREMENT / ENVIRONMENT]
    A18 --> A19[Root cause identified]
    A19 --> A13

    A10 --> A20[Improved barangay\ncompliance baseline]
    A20 --> A21([Next PDCA Cycle\n↩ Returns to PLAN])
```

---

## Full PDCA Cycle — Consolidated View

```mermaid
flowchart LR
    subgraph PLAN["PLAN"]
        P1[Barangay Profile Setup]
        P2[Audit Cycle Activation]
        P3[ECA Form Preparation]
        P4[Collection Schedule Planning]
    end

    subgraph DO["DO"]
        D1[Audit Indicator Encoding]
        D2[Evidence Upload]
        D3[ECA Submission]
        D4[Collection / Recycler /\nFinancial / IEC Logs]
    end

    subgraph CHECK["CHECK"]
        C1[CENRO Reviews ECA]
        C2[Audit Score Computation]
        C3[ECA Tracker & Ranking]
        C4[Compliance Results\n vs BENCHMARK & CAP]
    end

    subgraph ACT["ACT"]
        A1[CENRO Issues Feedback]
        A2[Barangay Responds]
        A3[PDCA Action Plan\n& Root Cause Analysis]
        A4[Improved Baseline\nfor Next Cycle]
    end

    PLAN --> DO --> CHECK --> ACT --> PLAN

    style PLAN fill:#16a34a,color:#fff,stroke:#15803d
    style DO fill:#2563eb,color:#fff,stroke:#1d4ed8
    style CHECK fill:#d97706,color:#fff,stroke:#b45309
    style ACT fill:#dc2626,color:#fff,stroke:#b91c1c
```

---

## PDCA Module Summary Table

| PDCA Phase | Portal Module | Route | Primary Role |
|---|---|---|---|
| **PLAN** | Barangay Profile | `/barangays` | System Admin |
| **PLAN** | Audit Cycle Setup | (data config) | System Admin |
| **PLAN** | ECA Form (Draft) | `/barangay/eca` | Secretary / Councilor |
| **PLAN** | Collection Schedule | `/barangay/collection` | Secretary |
| **PLAN** | Recycler Registry | `/barangay/recyclers` | Secretary |
| **PLAN** | IEC Activity Calendar | `/barangay/iec` | Secretary |
| **DO** | RA 9003 Audit Encoding | `/audit` | Encoder / Secretary |
| **DO** | Evidence Upload | `/evidence` | Encoder / Secretary |
| **DO** | ECA Submission | `/barangay/eca` | Captain |
| **DO** | Collection Log | `/barangay/collection` | Secretary |
| **DO** | Incident Reporting | `/barangay/incidents` | Secretary |
| **DO** | Financial Summary | `/barangay/financial` | Secretary |
| **DO** | IEC Activity Log | `/barangay/iec` | Secretary |
| **CHECK** | CENRO Dashboard | `/cenro/dashboard` | CENRO |
| **CHECK** | ECA Tracker | `/cenro/eca-tracker` | CENRO |
| **CHECK** | Compliance Results | `/results` | CENRO |
| **CHECK** | Performance Ranking | `/cenro/ranking` | CENRO |
| **CHECK** | Report Generation | `/reports` | CENRO / Admin |
| **ACT** | Feedback Management | `/cenro/feedback` | CENRO |
| **ACT** | Feedback View & Response | `/barangay/feedback` | Captain / Secretary |
| **ACT** | PDCA Action Plan | `/action-plan` | Captain / Encoder |
| **ACT** | Root Cause Analysis | `/rca` | Admin / Researcher |
