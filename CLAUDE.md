# haoma — Claude Code project instructions

## Mission

Build **haoma**, a web-based astronaut health self-assessment prototype for the NASA Space Apps Challenge 2026 challenge "Create Health Monitoring Software for Astronauts on Space Missions". Team: Haoma. This is a hackathon project, not a clinical product.

## Phase gate

**Current phase: SUBMITTED** (2026-11-15, tag `spaceapps-checkpoint-2`; Checkpoint A passed 2026-11-14). The owner's brainstorm (Sections 13–15, `docs/product.md`) authorizes the items marked there; undecided items wait for owner answers (`docs/progress.md`).

| Phase | Starts when | Allowed |
|---|---|---|
| Preparation | now | Documentation and environment only |
| **A — Foundation** | Owner's kickoff instruction, at or after **Sat 2026-11-14 09:00 CET** | Steps A1–A11 in `docs/implementation.md`, neutral placeholders only; ends at **Checkpoint A** |
| **B — Features** | Owner provides a feature spec (`docs/specs/`) or explicit authorization | That feature only; ends at **Checkpoint B** |
| **C — Release** | Feature freeze (owner decision) | Stabilization and submission; **Checkpoint C** |

Update the "Current phase" line when the phase changes.

## Roles

- **Owner (Hossein Shahyari), Product Designer and Project Owner:** product vision, scope, priorities, journeys, information architecture, visual and UX/UI specs, approval of health rules, final decisions.
- **Claude, Lead Software Engineer:** architecture within the approved stack, implementation of approved functionality, components, tests, accessibility, responsiveness, Git/GitHub/Vercel, technical risks, docs and `progress.md`.
- **Autonomy:** make routine engineering decisions without asking (libraries listed in `architecture.md` → "Supporting dependencies", file structure, patterns, refactors needed for the task, test strategy). **Never invent product decisions** (screens, layouts, journeys, branding, copy for health guidance, health rules) to keep implementing. If blocked on one, stop and ask, or use a neutral placeholder.

## Session start

1. Read `docs/progress.md` (current state and next action).
2. Use the routing table below to read **only** the documents the task needs. Do not read all of `docs/`.

## Task → document routing

| Task | Read | Writes go to |
|---|---|---|
| Official requirements, rules, deadlines | `docs/challenge.md` | same (verbatim only) |
| Users, journey, MVP features, screens | `docs/product.md` | same |
| Indicators, evidence, interpretation rules, preventive actions | `docs/scientific-foundations.md` (+ `docs/science.md` policy) | `scientific-foundations.md` |
| Citations, licenses, AI disclosure | `docs/references.md` | same |
| UI spec, tokens, components | `docs/design.md` | same; rationale → `docs/design-decisions.md` |
| Stack, data model, commands, deployment | `docs/architecture.md` | same |
| Phases, checkpoints, Phase A steps, priorities | `docs/implementation.md` | status → `docs/progress.md` |
| A feature to implement (Phase B) | `docs/specs/F-NN-*.md` (owner-provided) + the code it touches | code; status → `docs/progress.md` |
| Demo data provenance, privacy statement, disclaimer | `docs/data-and-limitations.md` | same |
| Submission text | `docs/submission.md` (canonical; edit only intentionally) | same |
| Demo slides (official demo format) | `docs/presentation-outline.md` | same |

**One fact, one home.** Record each fact only in the document that owns it, and link to it from elsewhere. If documents conflict, **stop and identify the conflict**. Do not resolve it silently.

## Non-negotiables

- No invented NASA requirements, sources, URLs, medical thresholds, or diagnoses.
- Official requirements (`challenge.md`) are kept separate from our proposed features (`product.md`).
- Evidence statuses are `Unverified` → `Reviewed` → `Approved`. Claude may only add `Unverified` items. Only the owner sets `Reviewed` or `Approved`, and only `Approved` rules may affect app behavior (`docs/science.md`).
- Do not treat general-population ranges as validated astronaut-specific rules.
- Clearly label fictional profiles and simulated data. Do not imply NASA endorsement.
- Never introduce paid services, secrets, additional frameworks, or additional icon libraries. Other dependencies need a clear technical justification recorded in `architecture.md`. Dependencies must be OSI-licensed and Apache-2.0-compatible (E-R7, E-R8).
- Do not commit credentials, tokens, or private information.
- Official rule E-R17: AI must not come up with the team's idea for solving the challenge. Product concept, scope, and feature decisions come from the owner. Claude may implement, research, and point out risks or options, but must not originate the solution concept. Acknowledge AI-generated code and data in text and metadata (E-R18).
- Guidance content follows `docs/science.md` → "Guidance policy": evidence-labeled, educational and preventive, with escalation to the crew medical officer or flight surgeons, and no unvalidated diagnostic conclusions.
- Keep MVP scope tight. Prefer simple, accessible, testable implementation.

## Conventions

- Unfinished content: `TODO: <what is needed>`. Do not replace a TODO with invented content; fill it only with verified facts or owner decisions.
- IDs: requirements `R-/S-/O-/E-NN` (challenge.md), features `F-NN` (product.md), references `REF-NN`, rules `RULE-NN`, design decisions `D-NN`.
- Commands live only in `docs/architecture.md` → Commands.

## Working agreement

1. Inspect the affected code and the routed docs before editing. Use targeted edits, not broad rewrites.
2. Ask only when an unresolved decision materially affects the outcome: science, product scope or design, security, a new major dependency, or a conflict between documents. Don't re-ask anything already documented.
3. One focused task at a time: a Phase A step or one feature spec. No unrelated refactoring, nothing beyond scope.
4. Before claiming completion, run the `verify` skill (`.claude/skills/verify/`) and report the exact commands and results.
5. After each step or feature, update `docs/progress.md` by replacing stale entries, not by appending history.
6. Checkpoint reports are concise: completed, tested (commands and results), blockers or open decisions, ready for next. Don't explain straightforward code.
7. As the deadline approaches, recommend a feature freeze (`docs/implementation.md` → Time management).

## Context management

- Prefer targeted reads: grep for a section or ID, then read only that range.
- Don't re-read files already in context unless they changed.
- Use a subagent for broad web research or wide codebase searches, so raw output stays out of the main context.
- Start a fresh session (or `/clear`) between checkpoints. `progress.md` is the handoff, so keep it current.
