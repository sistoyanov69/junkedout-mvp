# JunkedOut – Logical Platform Architecture

This document defines the **high-level logical architecture** of the JunkedOut platform.
It focuses on **domains, trust boundaries, responsibilities, and data flows**.

---

## 1) Platform Logical Architecture (Modules & Data Flows)

```mermaid
flowchart LR
  %% Visual classes (GitHub-safe)
  classDef public fill:#E6F4EA,stroke:#2F855A,stroke-width:2px,color:#0F172A
  classDef restricted fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#0F172A
  classDef governance fill:#E0E7FF,stroke:#4338CA,stroke-width:2px,color:#0F172A
  classDef security fill:#FEE2E2,stroke:#991B1B,stroke-width:2px,color:#0F172A
  classDef neutral fill:#F3F4F6,stroke:#6B7280,stroke-width:1.5px,color:#0F172A
  subgraph Z0["Public Zone (Read-only)"]
    PUB_UI["Public Experience Layer\n- Employer pages\n- Published aggregates\n- Methodology & rule versions"]
    PUB_SNAP["Publication Snapshots (Public Dataset)\n- Aggregated metrics\n- Context cards\n- Snapshot timestamps\n- Rule versions"]
    EMP_PUB["Employer Canonical (Public Fields)\n- Legal name (verified)\n- Jurisdiction\n- Public identifiers"]
  end

  subgraph Z1["Restricted Zone (Controlled Access)"]
    INTAKE["Submission & Intake\n- Validation\n- Rate limits\n- Risk flags\n- Intake signals"]
    DRAFT["Report Drafts (Restricted)\n- Structured answers\n- Free-text\n- Employer reference"]
    EVID["Evidence Store (Restricted)\n- Evidence assets\n- Hashes\n- Redactions\n- Access logs"]
    RESOLVE["Employer Identity Resolution\n- Reference → legal entity\n- Confidence\n- Approval if ambiguous"]
    MOD["Moderation & Case Management\n- Triage\n- PII redaction\n- Evidence assessment\n- Accept / Reject / Hold"]
    NORM["Normalized Reports (Restricted)\n- Extracted facts\n- Structured fields only"]
    SCORE["Scoring & Aggregation Engine\n- Versioned rules\n- Weighting\n- Time windows\n- Uncertainty"]
    PUB_MGR["Publication & Release Management\n- Threshold gating\n- Safety checks\n- Snapshot creation"]
  end

  subgraph Z2["Governance, Compliance & Security"]
    GOV["Governance & Policy\n- Versioned policies\n- Decision logs\n- Role definitions"]
    PRIV["Privacy & GDPR Ops\n- Classification\n- Retention\n- DSAR handling"]
    SEC["Security & Audit\n- RBAC/ABAC\n- Tamper-evident logs\n- Monitoring"]
    AUDIT["Audit Event Stream\n- Moderation actions\n- Evidence access\n- Publication approvals"]
  end

  USER["Reporter"] --> INTAKE
  INTAKE --> DRAFT
  INTAKE --> EVID
  INTAKE --> MOD

  DRAFT --> RESOLVE
  RESOLVE --> MOD
  EVID --> MOD

  MOD --> NORM
  NORM --> SCORE
  SCORE --> PUB_MGR
  PUB_MGR --> PUB_SNAP
  PUB_SNAP --> PUB_UI

  RESOLVE --> EMP_PUB
  EMP_PUB --> PUB_UI

  GOV --> INTAKE
  GOV --> MOD
  GOV --> SCORE
  GOV --> PUB_MGR

  PRIV --> INTAKE
  PRIV --> DRAFT
  PRIV --> EVID
  PRIV --> PUB_MGR

  SEC --> INTAKE
  SEC --> MOD
  SEC --> EVID
  SEC --> PUB_UI

  INTAKE --> AUDIT
  MOD --> AUDIT
  SCORE --> AUDIT
  PUB_MGR --> AUDIT
  EVID --> AUDIT

  %% Class assignments
  class PUB_UI,PUB_SNAP,EMP_PUB public
  class INTAKE,DRAFT,EVID,RESOLVE,MOD,NORM,SCORE,PUB_MGR restricted
  class GOV,PRIV governance
  class SEC,AUDIT security
  class USER neutral
```

---

## 2) Data Classification Boundaries

```mermaid
flowchart TB
  %% Visual classes (GitHub-safe)
  classDef public fill:#E6F4EA,stroke:#2F855A,stroke-width:2px,color:#0F172A
  classDef restricted fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#0F172A
  classDef high fill:#FEE2E2,stroke:#991B1B,stroke-width:2px,color:#0F172A
  subgraph PUBLIC["PUBLIC"]
    P1["Publication Snapshots\n- Aggregated metrics\n- Context summaries\n- Rule versions"]
    P2["Employer Canonical (Public Fields)\n- Legal name\n- Jurisdiction"]
  end

  subgraph RESTRICTED["RESTRICTED"]
    R1["ReportDraft\n- Submitted content"]
    R2["ReportNormalized\n- Moderated structured facts"]
    R3["ModerationCase\n- Decisions & rationale"]
    R4["EmployerResolution\n- Matching & confidence"]
  end

  subgraph HIGH["HIGHLY RESTRICTED"]
    H1["Reporter PII"]
    H2["Raw Evidence (Pre-redaction)"]
  end

  R1 --> R2 --> P1
  R4 --> P2
  H2 --> R2

  %% Class assignments
  class P1,P2 public
  class R1,R2,R3,R4 restricted
  class H1,H2 high
```

---

## 3) Submission → Publication Lifecycle

```mermaid
sequenceDiagram
  autonumber
  actor U as Reporter
  participant I as Intake
  participant D as Draft Store
  participant E as Evidence Store
  participant R as Employer Resolution
  participant M as Moderation
  participant N as Normalized Reports
  participant S as Scoring
  participant P as Publication
  participant W as Public UI

  U->>I: Submit report + evidence
  I->>D: Store report draft
  I->>E: Store evidence (hash logged)
  I->>M: Create moderation case

  D->>R: Employer reference
  R->>M: Resolved legal entity

  E->>M: Evidence access (audited)
  M->>N: Accepted normalized facts
  N->>S: Aggregation input
  S->>P: Employer aggregates
  P->>W: Publish snapshot
```

---

## 4) Architectural Invariants

- Legal employer (legal entity) is the **only canonical unit**.
- No raw submissions or evidence are ever public.
- Aggregates are computed **only from moderated, normalized data**.
- All decisions are **policy-versioned and auditable**.
- Governance, privacy, and security are **first-class domains**, not add-ons.
