# Progress and handoff log

**Responsibility:** Current status only. Read this first in every session. Keep it short: replace stale entries instead of appending history.

**Last updated:** 2026-11-14
**Current phase:** B — Features. Owner review of 2026-11-14 approved the history view and set product decisions (below).
**Build status:** Passing. Repository https://github.com/shahyari/haoma (public). Production https://haomaho.vercel.app.

## Completed

- Phase A foundation (Checkpoint A).
- Display settings (`design.md` → "Display settings").
- Rule evaluation RULE-01–RULE-30 (`src/rules/`), with three distinct neutral states: **No measurement**, **Not evaluated**, **Within reference** (the label for Normal).
- Home: indicator list linking to history pages, Attention/Escalate banners, RULE-30 reminder, fictional profile with "check-ins completed today" and "indicators to review" (no health score), daily check-in card with the PHQ-2 14-day cadence, "Load simulated demo history".
- Per-indicator history view (`/indicators/:id`): latest value with unit, time, and provenance; status with the applying rule, its condition, action, evidence labels, and REF IDs; personal baseline (heart rate, temperature); Recharts line chart (blood pressure as separate systolic and diastolic series; mood as separate daily-rating and PHQ-2 charts) followed by an accessible data table; empty states; approved rules listed separately as reference information.
- Rule audit (`scientific-foundations.md` → "Implementation audit", AU-1–AU-8); no approved rule was changed. RULE-20 night counting fixed.
- Mood/PHQ-2 review: wording matched to REF-40; PHQ-2 offered every 14 days only and never counted as the daily rating.
- Docs: data provenance and privacy statement (`data-and-limitations.md`), tested accessibility results (`design-decisions.md`).

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
| 2026-11-14 | OD-13: OSDR cross-check applied (C-5 to C-8); REF-54 Polaris Dawn, REF-55 OSD-575 added as `Unverified`; no rule changed | `scientific-foundations.md`, `references.md` |

## Outstanding decisions (owner)

**Rule audit (`scientific-foundations.md` → "Implementation audit")**

1. AU-1 Sleep: extend RULE-19 to "under 7 h when RULE-20 does not apply".
2. AU-2a–e Temperature: 38.0–39.3 °C near baseline without symptoms; sub-fever rise above baseline; RULE-16 symptom list; oral threshold applied to forehead readings; "keeps rising" in RULE-17.
3. AU-3 Heart rate: define "regularly above 100" (proposed P-9: ≥ 3 of the last 7 days).
4. AU-4 Blood pressure: confirm "below 90/60" = either number low (current).
5. AU-5 PHQ-2 status validity of 14 days; AU-6 optional age limit for the latest reading; AU-7 P-1 "similar time of day".
6. Mood: status label for PHQ-2 0–1 ("Within reference" vs. e.g. "Below screening cutoff").

**Product and content**

7. Body figure feature spec (2D SVG).
8. Demo profile details: name, role, mission (currently "Demo astronaut", labeled fictional).
9. D-01: no reference bands on charts (rules listed separately). Confirm or change.
10. Settings and About placement in the navigation.
11. Auto mode source (LED lighting), zone source, how condition-based suggestions are triggered.

**Other**

12. Feature-freeze time (proposal: Sun 18:00 CET freeze, Sun 22:00 CET submission target).
13. Evidence: approve C-5 and C-7 (Heart rate row is `Unverified` since OD-13).
14. Berlin Local Event name and local judging times.

## Environment status (2026-11-14)

- Node v26.13.1 + npm 11.20.0 via user-local `fnm`. GitHub CLI and Vercel CLI (`npx vercel`) logged in as `shahyari`.
- Vercel project `haoma` (`prj_IBHh…`), connected to `shahyari/haoma`; pushes to `main` deploy to production. Aliases of the production deployment: haomaho.vercel.app (documented URL), haoma-mu.vercel.app (redirects to haomaho, set by the owner), haoma-ho-shah.vercel.app, haoma-git-main-ho-shah.vercel.app. Checked 2026-11-14: the production deployment's source is git, `shahyari/haoma`, branch `main`, at the latest pushed commit.

## Unresolved scientific questions

SQ-01–SQ-08 in `scientific-foundations.md`. RULE-01–RULE-30 are `Approved` (owner, 2026-11-14); none is implemented in code yet.

## Verification

- 2026-11-14: `npm run lint` → 0 problems; `npm run typecheck` → exit 0; `npm test` → 12 files, 179 tests passed; `npm run build` → exit 0.
- Includes: rule boundaries, overlaps, and precedence; missing-data states; keyboard (jsdom); token contrast for 16 combinations; localStorage persistence across reloads. Results: `design-decisions.md` → Accessibility.
- Browser check (headless Chrome): history pages at 500 px and desktop width, light and dark.
- Not done: manual keyboard pass in a real browser, screen reader, true 320 px render of seeded pages. No WCAG conformance is claimed.

## Next action

Owner decisions on the audit items (1–6) and the body-figure spec. Buildable meanwhile without new decisions: a manual keyboard and screen-reader pass in a real browser; a 320 px layout check of the history pages.
