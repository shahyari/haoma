# Progress and handoff log

**Responsibility:** Current status only. Read this first in every session. Keep it short: replace stale entries instead of appending history.

**Last updated:** 2026-11-14
**Current phase:** B — Features. Owner review of 2026-11-14 approved the history view and set product decisions (below).
**Build status:** Passing. Repository https://github.com/shahyari/haoma (public). Production https://haomaho.vercel.app.

## Completed

- Phase A foundation (Checkpoint A). Display settings (`design.md` → "Display settings").
- Rule evaluation RULE-01–RULE-30 (`src/rules/`) with three distinct neutral states: **No measurement**, **Not evaluated**, **Normal**.
- Home (Section 16): logo links Home; avatar card with the fictional profile Alex Morgan, indicators to review, demo-data notice, Settings and About; "Demo data" chip; six separate indicator cards (check-in state merged in; PHQ-2 state on Mood; standard left-aligned badge); green tier labeled "Normal"; banners in a right column; full-width layout except Settings (fixed width); body-figure placeholder unchanged.
- Body map (owner prototype, 2026-11-14) in the Home figure area: 3D (WebGL) and 2D (SVG, keyboard-accessible) body model; pain logs with date and time, add, edit, delete, show on body, clear all; links to related indicators; Save report moves the chosen logs into a report (temporary banner with View report); Reports page (avatar menu and button next to 3D/2D) with View, Open JSON, Download JSON, Delete, and Import JSON; report view shows the logs read-only on the body map; report file includes astronaut name and save date; fills the viewport height and the free width; theme-aware; lazy-loaded; never interpreted.
- Every page except Home: fixed width; Settings, About, Reports: Back button.
- Section 17: Settings in two cards (Appearances; Units and Formats: °C/°F, mg/dL or mmol/L, three date formats, display and entry only); avatar card per the wireframe with Mission zone, Mission phase, Load demo data, Clear data. Pain-log date and time below Character with the shadcn date picker.
- History entries are editable (Edit per row; time kept; marked "Manual entry (edited)"; re-evaluated).
- Per-indicator history view (`/indicators/:id`): latest value, unit, time, provenance; status with rule, action, evidence labels, REF IDs; personal baseline; chart plus accessible table; approved rules listed separately. Chart library lazy-loaded (main bundle 780 → 423 kB).
- OD-14 applied (owner decisions on the audit, `scientific-foundations.md`): AU-1 sleep label; AU-3 heart-rate rest state, rest-only rules and baseline, descriptive count of readings above 100; AU-4 systolic < 90 OR diastolic < 60; AU-5 PHQ-2 current for 14 days, with the owner's four labels; AU-6 timestamps and separate check-in completeness; AU-7 time-of-day clause removed. Tests added for each.
- OD-15 applied: temperature method required for new entries; RULE-14–RULE-17 for oral readings only; forehead and legacy readings ("Method not recorded") shown with trend and same-method baseline difference, unclassified; one chart line per method; "keeps rising" trigger removed. PHQ-2 single cutoff 3 (score 2 alone no longer Attention; REF-56 documents the ≥ 2 alternative). Heart rate: rate rules resting-only, RULE-08 symptom-based escalation for any reading.
- Owner logo applied as favicon and header mark (TP-16).
- OD-16 applied: RULE-17 = single oral reading ≥ 40.6 °C (urgent review); new RULE-31 = measurement review for 39.4 ≤ x < 40.6 °C; RULE-16 precedence kept (no tier drops as temperature rises); unclassified forehead readings explained; reported symptoms shown with the latest reading; REF-56 approved; REF-57/58 (NHLBI) added `Unverified`; proposals P16-1–P16-4 documented, not implemented.
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
| 2026-11-14 | Section 17 (Settings, avatar card); fixed width for every page except Home; save banner back in the pain log; pain date and time below Character with the shadcn date picker; unticked logs stay in the pain log (confirmed) | `design.md` |
| 2026-11-14 | Reports: saving moves logs into the report; success banner with View report; report view on the body map; open, download, and import JSON; file includes astronaut name and save date | `design.md` |
| 2026-11-14 | Body map follow-ups: region → indicator links, Save report and Reports page, date and time per log, Max card removed, average kept, full-height and full-width body map, fixed width and Back for About and Settings | `design.md` |
| 2026-11-14 | Body map: owner prototype `body-map.html` integrated in the Home figure area for self-reported pain; replaces the navigation proposal | `design.md` |
| 2026-11-14 | Brainstorm Section 16: Home layout (cards, avatar card, Demo data chip, "Normal" label, full width, logo links Home) | `design.md` |
| 2026-11-14 | OD-16: RULE-17 split (≥ 40.6 °C urgent; RULE-31 review 39.4–40.5 °C), forehead explanation, REF-56 approved | `scientific-foundations.md`, `references.md` |
| 2026-11-14 | OD-15: temperature method-specific rules, PHQ-2 single cutoff 3, RULE-08 symptom-based for any reading; owner logo | `scientific-foundations.md`, `references.md` |
| 2026-11-14 | Release schedule: freeze Sun 18:00 CET, internal target Sun 22:00 CET, deadline Sun 23:59 CET | `implementation.md` |
| 2026-11-14 | OD-13: OSDR cross-check applied (C-5 to C-8); REF-54 Polaris Dawn, REF-55 OSD-575 added as `Unverified`; no rule changed | `scientific-foundations.md`, `references.md` |

## Outstanding decisions (owner)

1. RULE-16 precedence: a single oral 39.4–40.5 °C reading still escalates through RULE-16 when there is no baseline yet, the reading is more than 0.5 °C above the baseline, or symptoms are reported. Keep, or cap RULE-16 below 39.4 °C (`scientific-foundations.md` → "OD-16 implementation and verification").
2. Proposals P16-1 to P16-4 (`scientific-foundations.md` → "OD-16 proposals"): symptom-only heart-rate rule (RULE-32), RULE-08 split and wording, RULE-17/RULE-31 wording, temperature symptom list.
3. REF-57, REF-58 (NHLBI): approve. AHA warning-signs page: PDF export needed (automated access blocked).
4. Body map: confirm the region → indicator links (`design.md` → "Body map").
5. Section 17: mission phase placed in the avatar card (not in the wireframe); "Measurement system" applied to blood glucose (mg/dL or mmol/L); mission name, mission day, and the indicators-to-review count no longer shown. Confirm or change.
5. Evidence: approve C-5 and C-7 (Heart rate row is `Unverified` since OD-13).
6. Auto-mode source (LED lighting), zone source, condition-based suggestions.
7. Berlin Local Event name and local judging times.

## Environment status (2026-11-14)

- Node v26.13.1 + npm 11.20.0 via user-local `fnm`. GitHub CLI and Vercel CLI (`npx vercel`) logged in as `shahyari`.
- Vercel project `haoma` (`prj_IBHh…`), connected to `shahyari/haoma`; pushes to `main` deploy to production. Aliases of the production deployment: haomaho.vercel.app (documented URL), haoma-mu.vercel.app (redirects to haomaho, set by the owner), haoma-ho-shah.vercel.app, haoma-git-main-ho-shah.vercel.app. Checked 2026-11-14: the production deployment's source is git, `shahyari/haoma`, branch `main`, at the latest pushed commit.

## Unresolved scientific questions

SQ-01–SQ-08 in `scientific-foundations.md`. RULE-01–RULE-30 are `Approved` (owner, 2026-11-14) and implemented in `src/rules/`.

## Verification

- 2026-11-14 (after the body map): `npm run format:check` clean; `npm run lint` 0 problems; `npm run typecheck` exit 0; `npm test` 15 files, 282 tests passed; `npm run build` exit 0, no chunk-size warning. Body map checked in headless Chrome with WebGL (light and dark, 1600 px and 500 px).
- Covers: rule boundaries, overlaps, precedence; temperature methods and legacy records; heart-rate rest state and symptom-based escalation; PHQ-2 single cutoff and 14-day validity; a sweep that no reading without an applicable rule is shown as Normal; temperature tier never drops as the value rises (36.0–42.0 °C); symptom-only scenarios; demo scenario snapshot (all six Normal); keyboard (jsdom); token contrast; persistence.
- Not done: manual keyboard pass in a real browser, screen reader, true 320 px render of seeded pages. No WCAG conformance is claimed.

## Next action

Owner decisions 1–4 above. Unblocked meanwhile: a real-browser keyboard and responsive pass; slide deck and submission text before the freeze (Sun 18:00 CET).
