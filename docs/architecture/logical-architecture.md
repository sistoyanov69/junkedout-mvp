# JunkedOut – Logical Platform Architecture

This document defines the **high-level logical architecture** of the JunkedOut platform.
It focuses on **domains, trust boundaries, responsibilities, and data flows**.

---

## 1) Platform Logical Architecture (Modules & Data Flows)

```mermaid
%%{init: {"theme":"base","themeVariables":{"background":"#FFFFFF","primaryTextColor":"#0F172A","lineColor":"#6B7280","fontSize":"14px"}}}%%
flowchart LR
  %% Visual classes (stable)
  classDef public fill:#E6F4EA,stroke:#2F855A,stroke-width:2px,color:#0F172A
  classDef restricted fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#0F172A
  classDef governance fill:#E0E7FF,stroke:#4338CA,stroke-width:2px,color:#0F172A
  classDef security fill:#FEE2E2,stroke:#991B1B,stroke-width:2px,color:#0F172A
  classDef neutral fill:#F3F4F6,stroke:#6B7280,stroke-width:1.5px,color:#0F172A

  subgraph Z0["Public Zone (Read-only)"]
    PUB_UI["Public Experience Layer\n- Employer pages\n- Published aggregates\n- Methodology & rule versions"]:::public
    PUB_SNAP["Publication Snapshots (Public Dataset)\n- Aggregated metrics\n- Context cards\n- Snapshot timestamps\n- Rule versions"]:::public
    EMP_PUB["Employer Canonical (Public Fields)\n- Legal name (verified)\n- Jurisdiction\n- Public identifiers"]:::public
  end

  subgraph Z1["Restricted Zone (Controlled Access)"]
    INTAKE["Submission & Intake\n- Validation\n- Rate limits\n- Risk flags\n- Intake signals"]:::restricted
    DRAFT["Report Drafts (Restricted)\n- Structured answers\n- Free-text\n- Employer reference"]:::restricted
    EVID["Evidence Store (Restricted)\n- Evidence assets\n- Hashes\n- Redactions\n- Access logs"]:::restricted
    RESOLVE["Employer Identity Resolution\n- Reference → legal entity\n- Confidence\n- Approval if ambiguous"]:::restricted
    MOD["Moderation & Case Management\n- Triage\n- PII redaction\n- Evidence assessment\n- Accept / Reject / Hold"]:::restricted
    NORM["Normalized Reports (Restricted)\n- Extracted facts\n- Structured fields only"]:::restricted
    SCORE["Scoring & Aggregation Engine\n- Versioned rules\n- Weighting\n- Time windows\n- Uncertainty"]:::restricted
    PUB_MGR["Publication & Release Management\n- Threshold gating\n- Safety checks\n- Snapshot creation"]:::restricted
  end

  subgraph Z2["Governance, Compliance & Security"]
    GOV["Governance & Policy\n- Versioned policies\n- Decision logs\n- Role definitions"]:::governance
    PRIV["Privacy & GDPR Ops\n- Classification\n- Retention\n- DSAR handling"]:::governance
    SEC["Security & Audit\n- RBAC/ABAC\n- Tamper-evident logs\n- Monitoring"]:::security
    AUDIT["Audit Event Stream\n- Moderation actions\n- Evidence access\n- Publication approvals"]:::security
  end

  USER["Reporter"]:::neutral --> INTAKE
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
```

---

## 2) Data Classification Boundaries

```mermaid
%%{init: {"theme":"base","themeVariables":{"background":"#FFFFFF","primaryTextColor":"#0F172A","lineColor":"#6B7280","fontSize":"14px"}}}%%
flowchart TB
  classDef public fill:#E6F4EA,stroke:#2F855A,stroke-width:2px,color:#0F172A
  classDef restricted fill:#FEF3C7,stroke:#B45309,stroke-width:2px,color:#0F172A
  classDef highrisk fill:#FEE2E2,stroke:#991B1B,stroke-width:2px,color:#0F172A

  subgraph PUBLIC["PUBLIC"]
    P1["Publication Snapshots\n- Aggregated metrics\n- Context summaries\n- Rule versions"]:::public
    P2["Employer Canonical (Public Fields)\n- Legal name\n- Jurisdiction"]:::public
  end

  subgraph RESTRICTED["RESTRICTED"]
    R1["ReportDraft\n- Submitted content"]:::restricted
    R2["ReportNormalized\n- Moderated structured facts"]:::restricted
    R3["ModerationCase\n- Decisions & rationale"]:::restricted
    R4["EmployerResolution\n- Matching & confidence"]:::restricted
  end

  subgraph HIGH["HIGHLY RESTRICTED"]
    H1["Reporter PII"]:::highrisk
    H2["Raw Evidence (Pre-redaction)"]:::highrisk
  end

  R1 --> R2 --> P1
  R4 --> P2
  H2 --> R2
```

---

## 3) Submission → Publication Lifecycle

```mermaid
%%{init: {"theme":"base","themeVariables":{"background":"#FFFFFF","primaryTextColor":"#0F172A","lineColor":"#6B7280","fontSize":"14px","actorBkg":"#FEF3C7","actorBorder":"#B45309","actorTextColor":"#0F172A","signalColor":"#6B7280","signalTextColor":"#0F172A","activationBkgColor":"#E5E7EB","activationBorderColor":"#6B7280"}}}%%
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
