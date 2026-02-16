# Threat Model — Anonymous Intake (v0)

## Scope
This threat model covers JunkedOut v0 “anonymous intake”: submission of reports and optional contact email into a restricted datastore. Public read access is not provided. Publication is out of scope (handled by moderation and snapshotting later).

## Assets (what we protect)
1) **Confidentiality**
- Raw submissions (structured fields + narrative)
- Reporter contact email and verification tokens (PII)
- Moderation notes (future)

2) **Integrity**
- Correctness of stored records (no tampering after submission)
- Auditability (ability to prove what happened and when)

3) **Availability**
- Ability for legitimate users to submit reports
- Resilience against spam/DoS

## Trust boundaries
- **Untrusted**: anonymous client (browser), network, user-provided content
- **Trusted**: server-side submission endpoint (Next.js), Supabase service role (server-only)
- **Highly restricted**: contact data and any future evidence

## Design summary (why the model is safe)
- Database uses **Row Level Security (RLS)** to deny **SELECT/UPDATE/DELETE** for anonymous roles by default.
- Anonymous intake permits **INSERT-only** into specific tables; this is intentional and is safe because:
  - No read policies exist → client cannot enumerate or retrieve data.
  - No update/delete policies exist → client cannot alter history.
- Reporter email is stored separately in `report_contacts` (PII segregation) and is never stored in the main report table.
- Any future public content will be derived only from moderated/normalized data; raw intake is never public.

## Threats and mitigations

### T1 — Data exfiltration (anonymous reads)
**Threat:** attacker tries to read existing reports/emails.
**Mitigation:** no SELECT RLS policies for anon; reads are denied by Postgres by default. Only server/service-role can read. No public endpoints return raw data.

### T2 — Record tampering (update/delete)
**Threat:** attacker attempts to modify or delete submitted reports.
**Mitigation:** no UPDATE/DELETE RLS policies for anon; tampering denied at DB. Server can enforce append-only patterns in audit log.

### T3 — Mass spam / poisoning dataset
**Threat:** attacker submits large volumes of false reports, degrading data quality.
**Mitigations:**
- Server-side validation (schema, types, lengths, conditional constraints)
- Rate limiting (per IP / per fingerprint)
- Honeypot fields and bot detection
- “Evidence available” metadata and moderation gating before any aggregation/publication
- Moderation workflow status; aggregation uses only accepted/normalized facts (future)

### T4 — PII leakage in narrative fields
**Threat:** user includes personal data in narrative.
**Mitigations:**
- Explicit UI warning + required “no PII” consent
- Server-side PII pattern detection sets `pii_flag=true`
- Moderation required before any further processing
- Contact email stored separately from narrative

### T5 — Token abuse / email hijacking
**Threat:** attacker supplies someone else’s email or guesses tokens.
**Mitigations:**
- Confirmation tokens are random, short-lived, and stored only as **hashes**
- Confirmation required to mark email verified
- No privileged actions granted solely by unverified email

### T6 — Misconfiguration / accidental exposure
**Threat:** future changes accidentally add public read access.
**Mitigations:**
- Security Advisor review and PR checks
- Explicit “no public SELECT policies” rule for restricted tables
- Documentation and code review requirements for RLS changes
- Separate schemas/tables for public snapshots (future)

### T7 — Denial of Service
**Threat:** attacker floods endpoint.
**Mitigations:**
- Rate limiting at edge/server
- Request size limits
- Captcha can be added later if needed
- Use async email queue (future) to avoid blocking

## Residual risk and acceptance (v0)
- Write-only ingestion always carries spam risk; JunkedOut accepts this in v0 because publication is gated by moderation and normalization.
- Primary security objective in v0 is confidentiality (no leakage) and integrity (no tampering), which are enforced by RLS + server-side controls.

## Operational checks
- Regularly verify no SELECT policies exist on restricted tables for anon/authenticated roles.
- Periodically test with anon keys: SELECT must fail; INSERT must succeed only for allowed tables.
