# Contributing to JunkedOut

Thanks for your interest in contributing to **JunkedOut**.

JunkedOut is an open-source transparency platform that analyzes real-world hiring experiences to expose systemic barriers and improve labor market fairness. Contributions are welcome from developers, data scientists, legal experts, researchers, and practitioners.

Before contributing, please read:

- [MANIFESTO.md](./MANIFESTO.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

---

## Ways to contribute

You can help in several areas:

### Software development

- Frontend (Next.js)
- Backend/API (Next.js routes, Supabase)
- Data processing pipelines and analytics
- Security hardening and abuse prevention
- Testing and CI

### Data science & methodology

- Data quality rules and validation frameworks
- Bias and sampling analysis
- Scoring models (transparent, defensible, non-gameable)
- Dashboard/report methodology and confidence indicators

### Legal & policy

- GDPR posture and documentation
- Defamation risk controls and takedown process design
- Platform governance and moderation policies

### Moderation & QA

- Validation checklists and evidence-handling rules
- Redaction/anonymisation guidance
- Abuse detection playbooks

### Documentation & research

- Writing and improving docs (clear, actionable, non-marketing)
- Contributor onboarding improvements
- Issue templates and decision records

---

## Ground rules (read this first)

### 1) Evidence-based, not accusatory

JunkedOut is not a shaming platform. Contributions must support:

- aggregation,
- methodological clarity,
- defensible claims,
- and risk controls.

### 2) Privacy-first by default

Do not submit or commit:

- personal data (names, emails, phone numbers),
- credentials/secrets,
- raw evidence files that contain identifiers.

If your change touches data collection, anonymisation, or retention, explain the privacy impact in the PR.

### 3) Founder-led governance

JunkedOut is founder-led. Discussion is open; decisions are documented.
Major technical/policy changes require a written proposal and a recorded decision.

---

## Getting started (fast)

### Step 1 — Find or create an Issue

- Check existing Issues first.
- If none match, open a new Issue describing:
  - the problem,
  - the proposed approach,
  - risks (privacy/security/abuse),
  - acceptance criteria (what “done” means).

### Step 2 — Comment to claim it

Comment on the Issue to avoid duplication:

- “I’d like to take this. ETA: **. Approach: **.”

### Step 3 — Work in a fork + pull request

Contributors should:

- fork the repo,
- create a feature branch,
- open a Pull Request (PR) back to `main`.

Direct pushes to `main` are not expected.

---

## Development workflow (expected)

### Branch naming

Use a descriptive branch name:

- `feat/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`
- `sec/<short-name>`

### Commit messages

Use short, clear messages:

- `feat: add …`
- `fix: correct …`
- `docs: update …`
- `sec: harden …`

### Pull requests

A PR should include:

- what changed,
- why it changed,
- how to test,
- any risks/tradeoffs,
- screenshots for UI changes (if relevant).

If the PR changes behavior that impacts privacy, moderation, scoring, or publishing:

- include a short “Risk & abuse considerations” section.

---

## Quality and safety checks (non-negotiable)

### Tests

If you add or modify behavior:

- add or update tests where reasonable.

### No secrets in code

Never commit:

- `.env`, `.env.local`, credentials, service role keys,
- API tokens, private URLs.

If you suspect secrets were committed:

- stop and report it immediately (see Security below).

### Dependency hygiene

Avoid adding new dependencies unless necessary.
If you must add one, explain:

- why it’s needed,
- why alternatives won’t work,
- security implications.

---

## Proposals for major changes

If you want to propose changes like:

- replacing Supabase,
- adding a new language/framework,
- new scoring architecture,
- public naming/defamation policy changes,
- new data fields impacting identifiability,

Create an Issue labeled **proposal** with:

1. Summary
2. Motivation
3. Alternatives considered
4. Risks (privacy/security/abuse/legal)
5. Migration/rollback plan
6. Acceptance criteria

Major proposals may require a decision record.

---

## Communication

Use GitHub Issues and PRs as the primary channel.
If you need to contact the team directly:

- General contact: **contact@junkedout.org**
- Security: **security@junkedout.org**
- Founder: **founder@junkedout.org**

---

## Security

If you find a security vulnerability or suspect credential exposure:

- Do **not** open a public Issue with details.
- Email **security@junkedout.org** with:
  - what you found,
  - where,
  - how to reproduce,
  - potential impact.

---

## License

By contributing, you agree that your contributions will be licensed under the project’s license (AGPLv3), as described in [LICENSE](./LICENSE).

Thank you for helping build a fairer, more transparent hiring ecosystem.
