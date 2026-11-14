# Hackathon implementation plan

**Responsibility:** The workflow, phases, checkpoints, acceptance criteria, priorities, time guidance, and launch checklist. Current status goes in `progress.md`, not here.

**Event:** Local Event, Berlin (Europe/Berlin, CET = UTC+1)
**Start:** Saturday 2026-11-14, 09:00 CET (`challenge.md` T-1)
**Submission deadline:** Sunday 2026-11-15, 23:59 CET
**Team:** Hossein Shahyari (solo), working with Claude Code
**Status:** PREPARATION ONLY. Phase A begins only when the owner sends the kickoff instruction at or after 09:00 CET Saturday (`challenge.md` E-R2).

## Roles

| Owner: Hossein Shahyari (Product Designer and Project Owner) | Claude Code (Lead Software Engineer) |
|---|---|
| Product vision, feature brainstorming, prioritization | Technical architecture within the approved stack |
| User journeys, information architecture, interactions | Implementing approved functionality |
| Visual direction and UX/UI specifications | Implementation approaches, reusable components and utilities |
| Reviewing scientific interpretations; approving health rules (`science.md`) | Code quality, accessibility, responsiveness |
| Evaluating implementations and giving feedback | Automated tests and verification (`verify` skill) |
| Final decisions on product scope and design | Git, GitHub, Vercel deployment workflows |
| | Identifying technical risks and proposing solutions |
| | Keeping documentation and `progress.md` current |

Claude operates autonomously on routine engineering decisions within the approved stack. Claude does **not** invent product decisions (scope, screens, journeys, visual branding, health rules) to keep implementing. This is also required by official rule E-R17.

## Pre-event checklist (completed)

- [x] Challenge statement, Resources tab, and submission and judging guides captured (`challenge.md`).
- [x] License Apache-2.0; Q-01 to Q-04 resolved; full stack approved (`architecture.md`).
- [x] Node v26.13.1 LTS (user-local `fnm`); `gh` authenticated as `shahyari`; Vercel CLI logged in.
- [x] Development workflow aligned (this file, `CLAUDE.md`).

## Phase A — Technical foundation

Authorized by the owner's kickoff instruction at or after Saturday 09:00 CET. Claude works independently while the owner designs the product experience.

| Step | Scope | Acceptance criteria |
|---|---|---|
| A1 | GitHub repository | `git init -b main`; first commit = preparation docs + Apache-2.0 `LICENSE`; `gh repo create haoma --public --source=. --push`; public visibility checked in a private browser window |
| A2 | App scaffold | Vite + React + TypeScript app at the repo root using current stable versions and the official setup instructions; `engines.node` = `26.x` |
| A3 | Dev environment and structure | Tailwind CSS and shadcn/ui configured per the official docs (`lucide-react` is the only icon set); folder structure documented in `architecture.md`; `.claude/settings.json` with command permissions |
| A4 | Design tokens and base components | Tokens defined as CSS variables with **neutral placeholder values** (`design.md`); a small set of shadcn base components added; no final branding |
| A5 | Routing and responsive shell | Minimal app shell with routing and neutral placeholder pages; works from 320 px to desktop; keyboard-reachable navigation; skip link |
| A6 | Indicator models | TypeScript types for the six indicators following `scientific-foundations.md` (Indicator summary, Team-set parameters, Mission phase): BP mmHg sys/dia at rest; HR bpm at rest; glucose mg/dL + context (Fasting / Non-fasting / Unknown) + device (Fingerstick / CGM); temperature °C + method (oral / forehead) + "exercised in the last 30 min" flag; sleep hours + source (self-report / actigraphy); mood PHQ-2 (0–6, 14-day cadence) + optional daily 1–5 rating; optional symptom flags per entry; mission phase (In flight / Approaching landing / Post-landing); team-set parameters P-1–P-8 as a typed, configurable constant. Models only: **no rule logic** (rules are `Approved`, but they are implemented in Phase B through a feature spec) |
| A7 | Persistence and validation | Versioned localStorage wrapper with a fallback when storage is unavailable; structural validation only (see "Phase A boundaries") |
| A8 | Scripts | `dev`, `build`, `preview`, `test`, `lint`, `typecheck`, `format`; commands recorded in `architecture.md` → Commands |
| A9 | Error and empty states | App-level error boundary; reusable empty, loading, and error state components |
| A10 | Deployment | Vercel project linked to the GitHub repo; the production URL loads the shell; smoke test in `architecture.md` passes |
| A11 | Verification | `verify` passes; unit tests cover storage and validation; `progress.md` updated → **Checkpoint A** |

### Phase A boundaries

- **No** final product screens, dashboard layouts, user journeys, visual branding, or medical interpretation logic. Use neutral placeholders.
- **Validation is structural only:** types, required fields, units, finite numbers, allowed enum values, non-negative where physically necessary. Do not encode health ranges or thresholds. Any numeric plausibility bounds need an owner-approved spec or an `Approved` source.
- Supporting dependencies follow `architecture.md` → "Supporting dependencies".

## Checkpoints

| Checkpoint | When | Claude delivers | Then |
|---|---|---|---|
| **A — Foundation complete** | After A11 | Concise report: completed, tested (exact commands and results), blockers, ready for Phase B | Claude waits for the first feature specification. No product screens before it arrives. |
| **B — Feature complete** | After each feature | Concise report per the feature loop below | Owner reviews; next spec |
| **C — Release readiness** | Before final submission | Full app review; critical issues resolved; docs verified; submission deliverables prepared | Owner submits |

## Phase B — Feature implementation

Features are implemented only with an **approved specification** (`docs/specs/`) or explicit owner authorization. The priority list below is not authorization to implement.

**Feature loop**

1. Review the spec and the relevant existing code.
2. Identify critical ambiguities or conflicts.
3. Ask only essential questions.
4. Implement with the existing architecture and components.
5. Run relevant tests and `verify`.
6. Fix defects.
7. Report completed work and limitations (Checkpoint B).
8. Update `progress.md`.

Avoid unrelated refactoring and anything beyond the spec.

### Priorities (owner, subject to refinement — `product.md` holds the feature list)

- **P0 — Essential:** daily self-assessment; six indicators; health overview; historical trends; evidence-backed explanations and escalation guidance; fictional astronaut demo scenarios.
- **P1 — Important:** interactive body map.
- **P2 — Optional:** mission routine reminders; gamification.
- **Excluded:** camera-based physiological measurement.

## Time management

Estimated hours are guidance, not hard limits. Priority order:

1. A functioning MVP.
2. Scientific integrity and challenge relevance.
3. Usability and accessibility.
4. Testing and reliability.
5. Submission quality.
6. Optional enhancements.

- Don't polish low-impact details while P0 work is incomplete.
- **Feature freeze:** Claude recommends a freeze when the remaining time is needed for stabilization, testing, the slide deck, and submission. Default proposal: **Sunday 18:00 CET** freeze, **Sunday 22:00 CET** submission target. The owner decides.

## Stop / cut rules

- If scientific evidence is missing or not `Approved`, disable the related automated guidance and show neutral content.
- If P0 is at risk, defer P1/P2 items and say so at the next checkpoint.
- If deployment fails, prioritize a stable minimal demo.

## Launch checklist (Checkpoint C)

- [ ] All Core requirements in `challenge.md` addressed.
- [ ] Production build passes; `verify submission` passes.
- [ ] Public demo works on desktop and mobile in a private window.
- [ ] Source links, references, and the Apache-2.0 license included.
- [ ] Simulation and safety limitations clear; canonical disclaimer present.
- [ ] Demo deck ≤ 7 slides in English at a public link.
- [ ] Official project submission completed before Sunday 23:59 CET.
