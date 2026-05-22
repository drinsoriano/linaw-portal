# LINAW Web Portal

**LINAW Web Portal** is a frontend prototype of a digital compliance monitoring and reporting system for barangay-level implementation of Republic Act No. 9003, also known as the Ecological Solid Waste Management Act of 2000.

The system is designed for the solid waste management compliance monitoring of the 54 barangays of Calamba City, Laguna. It supports digital audit encoding, evidence-based validation, compliance scoring, dashboard analytics, PDCA-based corrective action planning, and report generation.

> LINAW is not a general garbage collection or pickup scheduling app. It is a digital compliance governance portal focused on RA 9003 implementation, audit monitoring, validation, and continuous improvement.

---

## Project Purpose

The LINAW Web Portal aims to convert the manual barangay solid waste management compliance audit into a structured, role-based, and evidence-driven digital monitoring system.

The portal is developed as part of a dissertation project titled:

**“Reengineering Compliance and Community Impact in Solid Waste Management Implementation: A Localized Initiative for Networked Applications on Waste Management Framework (LINAW).”**

---

## Core Features

- Role-based login and navigation
- Barangay profile management
- Digital LINAW audit checklist
- Evidence upload and validation workflow
- Compliance scoring and interpretation
- City-wide and barangay-level dashboard
- Compliance results visualization
- Root cause analysis
- PDCA corrective action planning
- Reports page
- User management
- System settings
- Public summary dashboard
- Frontend-only local persistence using `localStorage`

---

## LINAW Framework

The system follows the **Plan-Do-Check-Act (PDCA)** cycle.

### Plan

- Assess barangay-level solid waste management compliance
- Identify gaps in RA 9003 implementation
- Define audit indicators and benchmark scores
- Prepare improvement strategies

### Do

- Encode barangay audit checklist responses
- Upload supporting evidence
- Submit audit records for review

### Check

- Review and validate audit submissions
- Compute compliance scores
- Identify weak indicators
- Display results through dashboards and reports

### Act

- Create corrective action plans
- Analyze root causes using Why-Why Analysis and Fishbone categories
- Monitor improvement progress
- Generate follow-up reports

---

## User Roles

The portal supports the following user roles:

### System Administrator

- Manages users, barangays, audit indicators, scoring settings, and system settings
- Can view all dashboards and reports

### CENRO Administrator / Evaluator

- Reviews barangay submissions
- Validates audit scores and evidence
- Returns submissions for revision
- Approves compliance reports
- Monitors city-wide compliance

### Barangay Encoder

- Updates assigned barangay profile
- Encodes audit checklist
- Uploads evidence
- Saves drafts
- Submits records for approval

### Barangay Captain / Approver

- Reviews barangay submission
- Approves or returns submission to encoder
- Views barangay dashboard and action plans

### Researcher / Auditor

- Views and analyzes audit results
- Generates reports
- Creates root cause analysis
- Recommends PDCA-based action plans

### Public Viewer

- Views only aggregated and non-sensitive public dashboard data

---

## Audit Categories

The LINAW audit tool is organized into four categories:

1. **SWM Programs**  
   Measures barangay solid waste management programs such as segregation, recycling, composting, IEC campaigns, MRF operation, and waste reduction activities.

2. **Barangay SWM Committee Structure**  
   Measures committee creation, assigned members, stakeholder participation, regular meetings, documentation, and functional roles.

3. **Waste Collection and Fees**  
   Measures collection schedule, collection system, waste hauling practices, covered collection vehicles, fee collection, coordination with haulers, and documentation of collection activities.

4. **Environmental and Community Impact**  
   Measures visible environmental outcomes such as cleanliness, reduced open dumping, waste volume reduction, segregation behavior, community participation, and sustainability of SWM practices.

---

## Scoring Scale

The portal uses a 5-point compliance scoring scale:

| Score | Interpretation |
|---|---|
| 5 | Fully Compliant |
| 4 | Mostly Compliant |
| 3 | Partially Compliant |
| 2 | Minimally Compliant |
| 1 | Non-Compliant |

Compliance interpretation:

| Range | Compliance Level |
|---|---|
| 4.21–5.00 | Fully Compliant |
| 3.41–4.20 | Mostly Compliant |
| 2.61–3.40 | Partially Compliant |
| 1.81–2.60 | Minimally Compliant |
| 1.00–1.80 | Non-Compliant |

The benchmark score of **4.21** is used as the LINAW research-defined expected full compliance benchmark. It is not a statutory threshold directly stated in RA 9003.

---

## Technology Stack

This project uses:

- **React**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- **Lucide React**
- **Recharts**
- **React Router DOM**
- **localStorage** for frontend-only persistence

No backend is currently implemented. The system is intended as a dissertation prototype and demonstration portal.