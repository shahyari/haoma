# Progress and handoff log

**Responsibility:** Current status only. Read this first in every session. Keep it short: replace stale entries instead of appending history.

**Last updated:** 2026-11-14
**Current phase:** B — Features. Owner review of 2026-11-14 approved the history view and set product decisions (below).
**Build status:** Passing. Repository https://github.com/shahyari/haoma (public). Production https://haomaho.vercel.app.

## Completed

- Phase A foundation (Checkpoint A). Display settings (`design.md` → "Display settings").
- Rule evaluation RULE-01–RULE-30 (`src/rules/`) with three distinct neutral states: **No measurement**, **Not evaluated**, **Within reference**.
- Home: indicator list with the latest reading's timestamp and status, Attention/Escalate banners, RULE-30 reminder, fictional profile Alex Morgan (Flight Engineer, Aster-1 Lunar Transit Mission, Mission Day 42), check-ins completed today and indicators to review (no health score), daily check-in, PHQ-2 screening state, "Load simulated demo history".
- Per-indicator history view (`/indicators/:id`): latest value, unit, time, provenance; status with rule, action, evidence labels, REF IDs; personal baseline; chart plus accessible table; approved rules listed separately. Chart library lazy-loaded (main bundle 780 → 423 kB).
- OD-14 applied (owner decisions on the audit, `scientific-foundations.md`): AU-1 sleep label; AU-3 heart-rate rest state, rest-only rules and baseline, descriptive count of readings above 100; AU-4 systolic < 90 OR diastolic < 60; AU-5 PHQ-2 current for 14 days, with the owner's four labels; AU-6 timestamps and separate check-in completeness; AU-7 time-of-day clause removed. Tests added for each.
- AU-2 temperature: revised, evidence-backed proposal written (`scientific-foundations.md` → "AU-2 revised proposal"); display-only note for forehead readings; no rule changed.
- Body figure: interaction proposal written (`design.md` → "Body figure"); not built.

## Decisions made

| Date | Decision | Reference |
|---|---|---|
| 2026-11-12 | `scientific-foundations.md` is authoritative for indicators and rules; `science.md` holds the policy; `references.md` is the bibliography | `science.md` |
| 2026-11-12 | Evidence statuses Unverified / Reviewed / Approved; only the owner sets Reviewed or Approved | `science.md` |
| 2026-11-12 | Placeholders use `TODO:`; `.claude/settings.json` deferred until the stack is approved | `CLAUDE.md` |
| 2026-11-13 | Q-01 guidance policy approved | `science.md` → Guidance policy |
| 2026-11-13 | License: Apache-2.0 for original code | `architecture.md` |
| 2026-11-13 | Primary user: astronaut. MVP indicators: all six from the statement | `product.md` |
| 2026-11-13 | Full stack approved: React, TypeScript, Vite, shadcn/ui, Tailwind CSS, Lucide, Recharts, npm, localStorage, Vitest, Vercel | `architecture.md` |
| 2026-11-13 | Repository created and pushed at event start, Sat 2026-11-14 09:00 CET (Q-02) | `implementation.md` |
| 2026-11-13 | React + Tailwind + shadcn; Lucide (`lucide-react`) as the only icon library (C-02) | `architecture.md` |
| 2026-11-13 | Berlin Local Event (CET); solo team: Hossein Shahyari (Q-03) | `challenge.md` |
| 2026-11-13 | Demo format: slides, ≤7 (Q-04) | `presentation-outline.md` |
| 2026-11-13 | NASA HRP hazard pages added (REF-12–REF-16) | `references.md` |
| 2026-11-13 | Workflow: owner = product and design, Claude = lead engineer; Phase A foundation, then spec-driven Phase B; checkpoints A/B/C | `implementation.md` |
| 2026-11-13 | Priorities P0/P1/P2 set; camera measurement excluded | `product.md` |
| 2026-11-13 | Owner's indicator research imported; fourth label "Team design decision" added | `scientific-foundations.md`, `science.md` |
| 2026-11-14 | OD-1–OD-9 applied: RULE-01–RULE-30, parameters P-1–P-8, mission phase, REF-17–REF-49; research compiled with Claude assistance (disclosed) | `scientific-foundations.md`, `references.md` |
| 2026-11-14 | All rules RULE-01–RULE-30 and all references set to `Approved` by the owner | `scientific-foundations.md`, `references.md` |
| 2026-11-14 | Evidence policy: source hierarchy (1 / 2a / 2b / 3), Mayo Clinic approved as a 2b source, population and limitations required per source; OD-10 (Mayo 20 mmHg as RULE-26 explanation only) | `science.md`, `references.md` |
| 2026-11-14 | OD-11: MedlinePlus approved as a 2b source (REF-50, temperature); REF-46 primary for fasting glucose; Kroenke 2003 (REF-51) for PHQ-2, with score 2 as a team decision | `scientific-foundations.md`, `references.md`, `science.md` |
| 2026-11-14 | OD-12: low glucose is symptom-gated (Endocrine Society guideline, REF-53); the OSDR search found no human glucose thresholds (OSD-370 recorded as REF-52, context only) | `scientific-foundations.md`, `references.md` |
| 2026-11-14 | Owner review: history view approved; no overall health score; XP deferred; 2D SVG body figure (spec pending); one fictional profile; simple daily check-in; no averaged statuses; crew comparison, sensors, roles, real-time reporting deferred; clinical rules read-only; no zone-specific reference ranges | `product.md` |
| 2026-11-14 | Owner brainstorm Sections 13–15 received; Section 14 and the decided parts of Section 13 implemented | `product.md`, `design.md` |
| 2026-11-14 | Kickoff received 09:00 CET; repo created and Phase A executed | `implementation.md` |
| 2026-11-14 | OD-14: audit decisions (AU-1, AU-3–AU-7 applied; AU-2 to revise), PHQ-2 labels, D-01 charts approved, provisional demo profile, body-figure direction, lazy-load charts | `scientific-foundations.md`, `design.md`, `data-and-limitations.md` |
| 2026-11-14 | Release schedule: freeze Sun 18:00 CET, internal target Sun 22:00 CET, deadline Sun 23:59 CET | `implementation.md` |
| 2026-11-14 | OD-13: OSDR cross-check applied (C-5 to C-8); REF-54 Polaris Dawn, REF-55 OSD-575 added as `Unverified`; no rule changed | `scientific-foundations.md`, `references.md` |

## Outstanding decisions (owner)

1. AU-2 temperature: decide AU-2a–e (`scientific-foundations.md` → "AU-2 revised proposal").
2. PHQ-2 score 2: keep the RULE-22 🟡 level alongside the "Below screening cutoff" label, or drop it.
3. Heart rate: keep applying the RULE-08 symptom clause to after-activity readings (current, conservative), or limit it to resting readings.
4. Body figure: approve the interaction proposal, including questions (a)–(c) (`design.md` → "Body figure").
5. Evidence: approve C-5 and C-7 (Heart rate row is `Unverified` since OD-13).
6. Settings and About placement in the navigation; auto-mode source (LED lighting), zone source, condition-based suggestions.
7. Berlin Local Event name and local judging times.

## Environment status (2026-11-14)

- Node v26.13.1 + npm 11.20.0 via user-local `fnm`. GitHub CLI and Vercel CLI (`npx vercel`) logged in as `shahyari`.
- Vercel project `haoma` (`prj_IBHh…`), connected to `shahyari/haoma`; pushes to `main` deploy to production. Aliases of the production deployment: haomaho.vercel.app (documented URL), haoma-mu.vercel.app (redirects to haomaho, set by the owner), haoma-ho-shah.vercel.app, haoma-git-main-ho-shah.vercel.app. Checked 2026-11-14: the production deployment's source is git, `shahyari/haoma`, branch `main`, at the latest pushed commit.

## Unresolved scientific questions

SQ-01–SQ-08 in `scientific-foundations.md`. RULE-01–RULE-30 are `Approved` (owner, 2026-11-14) and implemented in `src/rules/`.

## Verification

- 2026-11-14 (after OD-14): `npm run format:check` clean; `npm run lint` 0 problems; `npm run typecheck` exit 0; `npm test` 12 files, 195 tests passed; `npm run build` exit 0, no chunk-size warning.
- Covers: rule boundaries, overlaps, precedence; OD-14 behaviour (AU-1, AU-3, AU-4, AU-5); missing-data states; keyboard (jsdom); token contrast for 16 combinations; localStorage persistence. Results: `design-decisions.md` → Accessibility.
- Not done: manual keyboard pass in a real browser, screen reader, true 320 px render of seeded pages. No WCAG conformance is claimed.

## Next action

Owner decisions 1–4 above. Unblocked meanwhile: a real-browser keyboard and responsive pass; slide deck and submission text before the freeze (Sun 18:00 CET).
