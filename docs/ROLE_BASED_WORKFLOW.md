# LINAW Web Portal — Role-Based Workflow

This document describes what each user role can access and do within the LINAW Web Portal, based on the implemented routes, sidebar navigation, and RBAC guards.

---

## Roles Summary

| Role | Scope | Primary Function |
|---|---|---|
| `CENRO_EVALUATOR` | City-wide (all 54 barangays) | Monitor, review, validate, issue feedback |
| `BARANGAY_SECRETARY` | Own barangay only | Encode ECA form, log operational data |
| `BARANGAY_COUNCILOR` | Own barangay only | Encode ECA form, log operational data |
| `BARANGAY_CAPTAIN` | Own barangay only | Certify and submit reports to CENRO |
| `BARANGAY_ENCODER` | Own barangay only | Legacy encoder role (audit + ECA) |
| `SYSTEM_ADMIN` | System-wide | Full access + user management |
| `RESEARCHER` | Read-only analytics | Cross-barangay analysis, reports |
| `CITIZEN` | Public | View open data, submit concerns |

---

## 1. CENRO Evaluator

**Login redirects to:** `/cenro/dashboard`

### What CENRO Can Access
- City-wide compliance overview dashboard
- ECA submission tracker (all 54 barangays)
- Barangay performance ranking
- Hauler accreditation management
- Feedback and corrective action issuance
- RA 9003 audit compliance results
- Report generation

### Workflow

```mermaid
flowchart TD
    A([CENRO Login]) --> B[City Overview Dashboard\n/cenro/dashboard]

    B --> C[View city-wide\ncompliance statistics]
    B --> D[ECA Tracker\n/cenro/eca-tracker]
    B --> E[Performance Ranking\n/cenro/ranking]
    B --> F[Hauler Accreditation\n/cenro/haulers]
    B --> G[Feedback Management\n/cenro/feedback]
    B --> H[Compliance Results\n/results]

    D --> D1{Review ECA\nSubmission}
    D1 -->|Accept| D2[Mark ACCEPTED ✓]
    D1 -->|Return| D3[Mark FOR_REVISION\n+ attach feedback]
    D3 --> D4[Barangay notified\nto revise and resubmit]

    H --> H1{Review Audit\nSubmission}
    H1 -->|Validate| H2[Mark VALIDATED ✓\nScore confirmed]
    H1 -->|Return to Captain| H3[RETURNED_CAPTAIN]
    H1 -->|Reject| H4[REJECTED]
    H2 --> H5{Score ≥ CAP_THRESHOLD?}
    H5 -->|No – score below 3.41| H6[Flag for CAP requirement]
    H5 -->|Yes| H7[No corrective action needed]

    G --> G1[Issue feedback to barangay]
    G1 --> G2[Link to ECA / Audit / Collection / Financial]
    G2 --> G3[Set priority: LOW / MEDIUM / HIGH / CRITICAL]
    G3 --> G4[Monitor barangay response status]
    G4 --> G5[Mark FOR_VERIFICATION or COMPLETED]

    F --> F1[View accredited haulers]
    F1 --> F2{Accreditation valid?}
    F2 -->|Expired| F3[Mark EXPIRED]
    F2 -->|Violation| F4[Mark SUSPENDED]
    F2 -->|Active| F5[Log compliance status]
```

---

## 2. Barangay Secretary

**Login redirects to:** `/barangay/dashboard`

### What the Secretary Can Access
- Barangay dashboard (own barangay only)
- ECA quarterly report — **prepare and save drafts only** (cannot submit to CENRO)
- RA 9003 audit checklist encoding
- Evidence repository (upload per indicator)
- Waste collection monitoring log
- Recycler registry
- Financial summary
- Incident reports
- IEC activities log
- CENRO feedback (view and respond)

### Workflow

```mermaid
flowchart TD
    A([Secretary Login]) --> B[Barangay Dashboard\n/barangay/dashboard]

    B --> C[ECA Quarterly Report\n/barangay/eca]
    B --> D[RA 9003 Audit\n/audit]
    B --> E[Operational Logs]
    B --> F[CENRO Feedback\n/barangay/feedback]

    C --> C1[Select Quarter / Year]
    C1 --> C2[Fill in ECA form sections]
    C2 --> C3[Attach supporting documents\nPDF, Excel, Word, Image]
    C3 --> C4[Save as DRAFT]
    C4 -->|Captain must\nsubmit to CENRO| C5[Awaiting Captain\nsubmission]

    D --> D1[Open 39-indicator checklist]
    D1 --> D2[Score each indicator\n1 = Non-Compliant\n5 = Fully Compliant]
    D2 --> D3[Add notes per indicator]
    D3 --> D4[Upload evidence per indicator\n/evidence]
    D4 --> D5[Submit checklist\nStatus: SUBMITTED]
    D5 --> D6[Awaiting Captain\nendorsement to CENRO]

    E --> E1[Collection Monitoring\n/barangay/collection]
    E --> E2[Recycler Registry\n/barangay/recyclers]
    E --> E3[Financial Summary\n/barangay/financial]
    E --> E4[Incident Reports\n/barangay/incidents]
    E --> E5[IEC Activities\n/barangay/iec]

    F --> F1[View feedback from CENRO]
    F1 --> F2[Set response status:\nNot Started / Ongoing /\nFor Verification / Completed]
    F2 --> F3[Write barangay response]
```

---

## 3. Barangay Councilor

**Login redirects to:** `/barangay/dashboard`

### What the Councilor Can Access
Identical to Barangay Secretary. The Councilor role is parallel to the Secretary — both prepare ECA forms and encode operational data. Neither can submit to CENRO (that is the Captain's role).

### Workflow

```mermaid
flowchart TD
    A([Councilor Login]) --> B[Barangay Dashboard\n/barangay/dashboard]

    B --> C[ECA Report — Prepare Draft\n/barangay/eca]
    B --> D[RA 9003 Audit Encoding\n/audit]
    B --> E[Operational Logs]
    B --> F[CENRO Feedback — View & Respond\n/barangay/feedback]

    C --> C1[Fill form sections\nbased on Manila Bayanihan Form 2.2]
    C1 --> C2[Attach PDF / Excel / images]
    C2 --> C3[Save DRAFT]
    C3 --> C4[Notify Captain\nfor certification and submission]

    D --> D1[Encode 39 audit indicators\nLikert scale 1–5]
    D1 --> D2[Attach evidence files\n/evidence]
    D2 --> D3[Submit for Captain review]

    E --> E1[Collection Monitoring]
    E --> E2[Recycler Registry]
    E --> E3[Financial Summary]
    E --> E4[Incident Reports]
    E --> E5[IEC Activities]

    F --> F1[Review CENRO observations]
    F1 --> F2[Update response status]
```

---

## 4. Barangay Captain

**Login redirects to:** `/barangay/dashboard`

### What the Captain Can Access
- All barangay pages
- **Submit ECA report to CENRO** (exclusive to Captain)
- **Endorse RA 9003 audit to CENRO** (reviews REVIEWED submissions)
- PDCA action plan tracking
- CENRO feedback (view and respond)

### Workflow

```mermaid
flowchart TD
    A([Captain Login]) --> B[Barangay Dashboard\n/barangay/dashboard]

    B --> C[ECA Report\n/barangay/eca]
    B --> D[RA 9003 Audit Review\n/audit]
    B --> E[PDCA Action Plan\n/action-plan]
    B --> F[CENRO Feedback\n/barangay/feedback]
    B --> G[Operational Logs]

    C --> C1[Review draft prepared\nby Secretary / Councilor]
    C1 --> C2{ECA Ready\nto Submit?}
    C2 -->|Yes — Captain certifies| C3[Click Submit to CENRO]
    C3 --> C4[ECA Status: SUBMITTED → PENDING]
    C4 --> C5{CENRO Decision}
    C5 -->|Accepted| C6[ECA: ACCEPTED ✓]
    C5 -->|For Revision| C7[ECA: FOR_REVISION]
    C7 --> C1
    C2 -->|No — needs revision| C8[Inform Secretary / Councilor\nto update draft]

    D --> D1[Review encoder submission]
    D1 --> D2{Audit Accurate?}
    D2 -->|Approve| D3[Status: REVIEWED\nForwarded to CENRO]
    D2 -->|Return| D4[Status: RETURNED_ENCODER]
    D4 --> D5[Encoder corrects and resubmits]
    D3 --> D6{CENRO Decision}
    D6 -->|Validated| D7[VALIDATED ✓\nFinal Score Confirmed]
    D6 -->|Returned| D8[RETURNED_CAPTAIN\nCaptain reviews again]
    D8 --> D1

    E --> E1[View CAP-flagged indicators\nScore below 3.41]
    E1 --> E2[Create / update corrective action]
    E2 --> E3[Assign owner + target date]
    E3 --> E4[Track status:\nOPEN → IN_PROGRESS → COMPLETED]

    F --> F1[View CENRO observations]
    F1 --> F2[Update status and write response]
```

---

## 5. Citizen

**Access:** No login required for public pages.

### What the Citizen Can Access
- Open Data Public Dashboard (`/public`) — no authentication needed
- Citizen Concern Submission Form (`/citizen/report`) — no authentication needed
- Cannot access any barangay or CENRO administrative pages

### Workflow

```mermaid
flowchart TD
    A([Citizen visits LINAW portal]) --> B{Authenticated?}
    B -->|No — direct URL| C[Public Dashboard\n/public]
    B -->|Logs in as CITIZEN| C

    C --> D[View city-wide compliance summary]
    C --> E[Browse barangay compliance percentages]
    C --> F[View ECA submission status\nper barangay]
    C --> G[View performance ranking]
    C --> H[View environmental activity summaries]

    C --> I[Submit a Concern\n/citizen/report]
    I --> J[Fill concern form:\nBarangay, Concern Type,\nDescription, Contact info optional]
    J --> K[Submit]
    K --> L[Status: RECEIVED]
    L --> M[CENRO or Barangay\nacknowledges concern]
    M --> N[Status: ACKNOWLEDGED → RESOLVED]

    D --> O[View diversion rate trend charts]
    E --> P[Filter by district or barangay]
    G --> Q[Annual performance comparison\nacross all 54 barangays]
```

---

## Access Matrix Summary

| Page / Module | CENRO | Secretary | Councilor | Captain | Encoder | Admin | Researcher | Citizen |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `/cenro/dashboard` | ✓ | | | | | ✓ | | |
| `/cenro/eca-tracker` | ✓ | | | | | ✓ | | |
| `/cenro/ranking` | ✓ | | | | | ✓ | | |
| `/cenro/haulers` | ✓ | | | | | ✓ | | |
| `/cenro/feedback` | ✓ | | | | | ✓ | | |
| `/barangay/dashboard` | | ✓ | ✓ | ✓ | ✓ | | | |
| `/barangay/eca` (view+draft) | | ✓ | ✓ | ✓ | ✓ | | | |
| `/barangay/eca` (submit to CENRO) | | | | ✓ | | | | |
| `/audit` | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `/evidence` | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| `/barangay/collection` | | ✓ | ✓ | ✓ | ✓ | | | |
| `/barangay/recyclers` | | ✓ | ✓ | ✓ | ✓ | | | |
| `/barangay/financial` | | ✓ | ✓ | ✓ | ✓ | | | |
| `/barangay/incidents` | | ✓ | ✓ | ✓ | ✓ | | | |
| `/barangay/iec` | | ✓ | ✓ | ✓ | ✓ | | | |
| `/barangay/feedback` | | ✓ | ✓ | ✓ | ✓ | | | |
| `/action-plan` | | | | ✓ | ✓ | ✓ | ✓ | |
| `/results` | ✓ | | | | | ✓ | ✓ | |
| `/reports` | ✓ | | | | | ✓ | ✓ | |
| `/rca` | | | | | | ✓ | ✓ | |
| `/users` | | | | | | ✓ | | |
| `/settings` | | | | | | ✓ | | |
| `/public` | | | | | | | | ✓ (open) |
| `/citizen/report` | | | | | | | | ✓ (open) |
