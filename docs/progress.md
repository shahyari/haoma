# Progress and handoff log

**Responsibility:** Current status only. Read this first in every session. Keep it short: replace stale entries instead of appending history.

**Last updated:** 2026-11-14
**Current phase:** B — Features, working from the owner's brainstorm (Sections 13–15).
**Build status:** Passing. Repository https://github.com/shahyari/haoma (public). Production https://haomaho.vercel.app.

## Completed

- Phase A foundation (Checkpoint A).
- Display settings, Section 14 (`design.md` → "Display settings"): four zone themes, three modes, two contrast levels, three font sizes, monospaced numbers, colour-blind patterns.
- Rule evaluation for RULE-01–RULE-30 (`src/rules/`), with approved wording, evidence labels, and REF IDs.
- Home, Section 13 structure: indicator list with latest value and status, entry dialog for all six indicators (with symptoms, PHQ-2, and RULE-24), expandable Attention/Escalate banners, RULE-30 reminder; placeholders for the figure, profile, and tasks.
- Settings page: display settings, mission phase, "Clear my data".
- Feature state per brainstorm item: `product.md` → "Owner brainstorm".

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
| 2026-11-14 | Owner brainstorm Sections 13–15 received; Section 14 and the decided parts of Section 13 implemented | `product.md`, `design.md` |
| 2026-11-14 | Kickoff received 09:00 CET; repo created and Phase A executed | `implementation.md` |
| 2026-11-14 | OD-13: OSDR cross-check applied (C-5 to C-8); REF-54 Polaris Dawn, REF-55 OSD-575 added as `Unverified`; no rule changed | `scientific-foundations.md`, `references.md` |

## Outstanding decisions (owner)

**Conflicts with approved documents (not built)**

1. Section 15, Admin edits Normal/Attention/Escalate ranges and wording: `science.md` allows only `Approved` rules with cited evidence to drive behavior. Decide whether admin edits are out of scope, shown as a non-functional demo, or allowed as labeled "Team design decision" overrides.
2. Section 15, roles, reports, and real-time escalation to admins: `architecture.md` is browser-only with no accounts or backend. Only a simulated role switch inside one browser is possible.
3. Crew comparison on Home vs. Section 15 (only admins see other crew members' detail): decide what a User may see (for example, anonymous crew averages only).
4. Zone-based values (space, moon, mars): no `Approved` source gives indicator ranges per zone; `scientific-foundations.md` calls lunar/Mars use unvalidated.

**Definitions needed before building**

5. Health score: formula and evidence label. None exists in `scientific-foundations.md`.
6. XP and levels: what earns XP and the level steps.
7. Body figure: artwork (an AI-drawn figure would need a visible watermark, E-R18; a 3D model needs a new major dependency), whether two figures by biological sex are required, the indicator → body part mapping, and the "function" text per part with sources.
8. Fictional crew: names, roles, mission, Earth baseline values, and simulated history (F-06).
9. Assessment schedule for the tasks card (only the PHQ-2 14-day cadence is defined).
10. "Average status per indicator" and "trend" on Home: what exactly to show.
11. Sensors and wearables: simulated import only, or leave out.
12. Auto mode source (LED lighting; the link is incomplete), the zone source, and how the app knows the astronaut's condition for suggestions.

**Gaps in the approved rules (the app shows a neutral "no status" for these)**

13. Sleep: a single night of 6 h or less without the 3-of-7 pattern has no tier (RULE-19 covers only more than 6 and under 7).
14. Temperature: 38.0–39.3 °C within 0.5 °C of the baseline and without symptoms has no tier; so does a reading below 37.5 °C that is more than 0.5 °C above the baseline. RULE-16 does not list its symptoms (one generic "Other symptoms" flag is used). The 37.5 °C limit is stated for oral readings and is applied to forehead readings too.
15. Heart rate: "regularly above 100" (RULE-08) is undefined and not evaluated. P-1 "similar time of day" is undefined and not applied.
16. Blood pressure: "below 90/60" is implemented as systolic below 90 **or** diastolic below 60. Confirm.
17. RULE-28 (short night before an EVA) needs the schedule; not evaluated.

**Other**

18. Feature-freeze time (proposal: Sun 18:00 CET freeze, Sun 22:00 CET submission target).
19. Evidence: approve C-5 and C-7 (Heart rate row is `Unverified` since OD-13).
20. Berlin Local Event name and local judging times.
21. Settings and About are provisional pages; their place in the navigation is undecided.

## Environment status (2026-11-14)

- Node v26.13.1 + npm 11.20.0 via user-local `fnm`. GitHub CLI logged in as `shahyari`. Vercel CLI via `npx vercel`, logged in as `shahyari`; project `haoma` linked (`.vercel/` is git-ignored) and connected to the GitHub repo.

## Unresolved scientific questions

SQ-01–SQ-08 in `scientific-foundations.md`. RULE-01–RULE-30 are `Approved` (owner, 2026-11-14); none is implemented in code yet.

## Verification

- 2026-11-14: `npm run lint` → 0 problems; `npm run typecheck` → exit 0; `npm test` → 7 files, 106 tests passed; `npm run build` → exit 0.
- Checked in headless Chrome: Home at 320, 500, and 1280 px; Earth, Moon, and Mars themes; dark mode; high contrast; big text; colour-blind patterns.
- Not checked: measured contrast ratios per combination; manual keyboard pass; screen reader.

## Next action

Owner answers to the outstanding decisions above. Buildable next without further decisions: per-indicator history view with a chart and data table (personal values and the approved ranges only).
