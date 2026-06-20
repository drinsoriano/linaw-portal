# LINAW Web Portal — Data Flow Diagram

> **Important:** The current implementation is **frontend-only**. There is no backend server or database. All data originates from static mock files in `src/data/`. Mutable state (ECA reports, feedback, user session) is persisted in the browser's `localStorage`. This document reflects the actual data flow of the prototype as implemented.

---

## Data Architecture Summary

| Layer | Technology | Purpose |
|---|---|---|
| Static seed data | `src/data/*.ts` files | Initial mock data for all entities |
| Runtime state | React Context (`EcaContext`, `FeedbackContext`, `AuthContext`) | Mutable in-session state |
| Client persistence | `localStorage` (browser) | Survives page refresh; simulates a database |
| Computed state | `src/lib/scoring.ts` | Derives compliance scores from indicator responses |
| UI | React components | Reads and displays state; writes mutations back to context |

**No API calls are made in the current prototype.** All reads and writes are in-memory or localStorage.

---

## Level 0 — Context Diagram

```mermaid
graph LR
    BARANGAY([Barangay Users\nSecretary / Councilor /\nCaptain / Encoder])
    CENRO([CENRO Evaluator])
    CITIZEN([Citizen / Public])

    LINAW[[LINAW Web Portal\nFrontend Application\nReact + TypeScript + Vite]]

    BARANGAY -->|Audit responses\nECA report data\nCollection/recycler/financial logs| LINAW
    LINAW -->|Compliance scores\nECA status\nCENRO feedback\nCAP requirements| BARANGAY

    CENRO -->|Validation decisions\nFeedback / corrective actions\nHauler accreditation updates| LINAW
    LINAW -->|City-wide dashboards\nSubmission tracker\nPerformance rankings\nCompliance analytics| CENRO

    CITIZEN -->|Concern submissions\nDashboard queries| LINAW
    LINAW -->|Open data: scores, ECA status,\nrankings, diversion rates| CITIZEN
```

---

## Level 1 — Internal Data Flow

```mermaid
flowchart TD
    subgraph SEED["Seed Data — src/data/"]
        SD1[barangays.ts\n54 Barangay records]
        SD2[indicators.ts\n39 AuditIndicators]
        SD3[submissions.ts\n54 AuditSubmissions\n+ scores + responses]
        SD4[ecaReports.ts\nEcaReport records\nper barangay/quarter]
        SD5[feedbacks.ts\nCenroFeedback records]
        SD6[haulers.ts\nHaulerRecord list]
        SD7[financials.ts\nFinancialRecord per month]
        SD8[recyclers.ts\nRecyclerEntry + recovery]
        SD9[collectionLogs.ts\nCollectionLog entries]
        SD10[correctiveActions.ts\nCorrectiveAction records]
        SD11[users.ts\nAppUser presets per role]
    end

    subgraph CTX["React Context — Runtime State"]
        CTX1[AuthContext\nuser: AppUser\nlocalstorage: linaw_user]
        CTX2[EcaContext\nreports: EcaReport\nlocalstorage: linaw_eca_reports]
        CTX3[FeedbackContext\nfeedbacks: CenroFeedback\nlocalstorage: linaw_feedbacks]
        CTX4[ToastContext\ntoasts: Toast\ntransient only]
    end

    subgraph COMPUTE["Computed Data — src/lib/scoring.ts"]
        COMP1[computeOverallScore\nresponses × indicators → OverallScoreResult]
        COMP2[computeCategoryScore\nper IndicatorCategory]
        COMP3[getComplianceLevel\nscore → ComplianceLevel enum]
        COMP4[getScoreColor / getBarColor\nscore → Tailwind color string]
    end

    subgraph PAGES["UI Pages — Reads and Writes"]
        PG1[LoginPage\nReads: SD11\nWrites: CTX1]
        PG2[AuditChecklistPage\nReads: SD2, SD3\nWrites: SD3 in-memory]
        PG3[EvidenceRepositoryPage\nReads: SD3\nWrites: SD3 in-memory]
        PG4[ComplianceResultsPage\nReads: SD3, COMP1-4\nDisplays: scores + CAP flags]
        PG5[EcaReportPage\nReads: CTX2\nWrites: CTX2]
        PG6[EcaTrackerPage\nReads: CTX2, SD1\nWrites: CTX2 status]
        PG7[FeedbackViewPage\nReads: CTX3\nWrites: CTX3 status + response]
        PG8[FeedbackManagementPage\nReads: CTX3, SD1\nWrites: CTX3]
        PG9[FinancialSummaryPage\nReads: SD7]
        PG10[RecyclerRegistryPage\nReads: SD8\nWrites: SD8 in-memory]
        PG11[CollectionMonitoringPage\nReads: SD9\nWrites: SD9 in-memory]
        PG12[PDCAActionPlanPage\nReads: SD10, SD3\nWrites: SD10 in-memory]
        PG13[PublicDashboard\nReads: SD1, SD3 - public subset only]
        PG14[CenroDashboard\nReads: SD1, SD3, CTX2, SD9, SD5]
    end

    subgraph LS["localStorage — Persistence"]
        LS1[linaw_user]
        LS2[linaw_eca_reports]
        LS3[linaw_feedbacks]
    end

    %% Seed → Context initialization
    SD4 -->|fallback seed| CTX2
    SD5 -->|fallback seed| CTX3
    SD11 -->|preset lookup| CTX1

    %% Context → localStorage
    CTX1 <--> LS1
    CTX2 <--> LS2
    CTX3 <--> LS3

    %% Seed → Pages (direct import, read-only)
    SD1 --> PG14
    SD2 --> PG2
    SD3 --> PG2
    SD3 --> PG3
    SD3 --> PG4
    SD3 --> PG14
    SD3 --> PG13
    SD6 -.->|HaulerAccreditationPage| PG14
    SD7 --> PG9
    SD8 --> PG10
    SD9 --> PG11
    SD10 --> PG12

    %% Context → Pages
    CTX1 --> PG1
    CTX2 --> PG5
    CTX2 --> PG6
    CTX3 --> PG7
    CTX3 --> PG8

    %% Scoring computation
    SD3 --> COMP1
    SD2 --> COMP1
    COMP1 --> PG4
    COMP2 --> PG4
    COMP3 --> PG4
    COMP4 --> PG2

    %% User action writes
    PG5 -->|updateReport / submitReport| CTX2
    PG6 -->|setStatus| CTX2
    PG7 -->|updateStatus + barangayResponse| CTX3
    PG8 -->|issueFeedback| CTX3
```

---

## Data Flow: RA 9003 Audit Submission

```mermaid
sequenceDiagram
    participant ENC as Encoder (Browser)
    participant AC as AuditChecklistPage
    participant SD as submissions.ts (mock)
    participant SC as scoring.ts
    participant CR as ComplianceResultsPage
    participant CAP as PDCAActionPlanPage
    participant CENRO as CenroDashboard

    ENC->>AC: Opens audit checklist (39 indicators)
    AC->>SD: Reads existing submission (barangayId + cycleId)
    AC->>SC: Loads indicator list (indicators.ts)
    ENC->>AC: Enters scores (1–5) per indicator
    AC->>SD: Saves responses in-memory (DRAFT status)
    ENC->>AC: Clicks Submit
    AC->>SD: Updates status: SUBMITTED

    ENC->>CR: Opens Compliance Results
    CR->>SD: Reads responses
    CR->>SC: computeOverallScore(responses, indicators)
    SC-->>CR: OverallScoreResult {score, categoryScores}
    CR->>CR: Checks score vs BENCHMARK (4.21) and CAP_THRESHOLD (3.41)
    CR-->>ENC: Displays score, compliance level, flagged indicators

    alt Score < CAP_THRESHOLD (3.41)
        CR->>CAP: Links to PDCA Action Plan
        CAP->>SD: Reads correctiveActions.ts
        ENC->>CAP: Creates / updates corrective action
    end

    CENRO->>SD: Reads all submissions (city-wide)
    SD-->>CENRO: AuditSubmission[] for all 54 barangays
    CENRO->>CENRO: Aggregates scores and ranks barangays
```

---

## Data Flow: ECA Quarterly Reporting

```mermaid
sequenceDiagram
    participant SEC as Secretary (Browser)
    participant ECA as EcaReportPage
    participant CTX as EcaContext
    participant LS as localStorage
    participant CAP as Captain (Browser)
    participant TRK as EcaTrackerPage
    participant CEN as CENRO (Browser)

    SEC->>ECA: Opens ECA form (quarter/year selector)
    ECA->>CTX: getByBarangay(barangayId)
    CTX->>LS: linaw_eca_reports
    LS-->>CTX: EcaReport[] (or fallback: ecaReports.ts)
    CTX-->>ECA: EcaReport for selected quarter

    SEC->>ECA: Fills form sections
    SEC->>ECA: Attaches supporting documents
    SEC->>ECA: Clicks Save Draft
    ECA->>CTX: updateReport(id, {status: DRAFT})
    CTX->>LS: Persists updated report

    CAP->>ECA: Opens same report
    ECA->>CTX: getByBarangay(barangayId)
    CAP->>ECA: Reviews and clicks Submit to CENRO
    ECA->>CTX: submitReport(id, captainName)
    CTX->>CTX: status = SUBMITTED, submittedAt = now
    CTX->>LS: Persists

    CEN->>TRK: Opens ECA Tracker
    TRK->>CTX: reports (all barangays)
    CTX-->>TRK: EcaReport[] with statuses

    CEN->>TRK: Clicks Accept or Return for Revision
    TRK->>CTX: setStatus(id, ACCEPTED or FOR_REVISION, feedback)
    CTX->>LS: Persists final status

    ECA->>ECA: Captain sees updated status and feedback
```

---

## localStorage Keys Reference

| Key | Context | Type | Fallback |
|---|---|---|---|
| `linaw_user` | `AuthContext` | `AppUser \| null` | Logged out state |
| `linaw_eca_reports` | `EcaContext` | `EcaReport[]` | `mockEcaReports` from `ecaReports.ts` |
| `linaw_feedbacks` | `FeedbackContext` | `CenroFeedback[]` | `mockFeedbacks` from `feedbacks.ts` |

All other data (audit submissions, collection logs, financials, recyclers, haulers, IEC activities) is read directly from static mock files and is **not persisted** across page refreshes in the current prototype. Full persistence would require a backend API or expanding localStorage usage.
