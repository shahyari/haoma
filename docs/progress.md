# Progress and handoff log

**Responsibility:** Current status only. Read this first in every session. Keep it short: replace stale entries instead of appending history.

**Last updated:** 2026-11-15
**Current phase:** B — Features. Owner review of 2026-11-14 approved the history view and set product decisions (below).
**Build status:** Passing. Repository https://github.com/shahyari/haoma (public). Production https://haomaho.vercel.app.

## Submission checkpoints

| Tag | Date | Commit | Production | Deployment | Verified |
|---|---|---|---|---|---|
| `spaceapps-checkpoint-1` | 2026-11-15 09:19 CET | `24c9d958cd7ad9cab8da13e95c86df2637f28704` | https://haomaho.vercel.app | https://haoma-ask1k2prl-ho-shah.vercel.app (`dpl_5cTyHAefM8Myhxi3AThFHzJUCUnm`, Ready) | format, lint, typecheck, 330 tests, build; live routes 200, latest copy in the live bundle, no runtime errors in Chrome |

## Completed

- Demo pain logs (owner 2026-11-15): three simulated pain logs (Head, Left lower back, Left knee; note "Simulated demo entry.") seeded on the first visit so the body map is not empty; refreshed with the demo readings while untouched. Tests in `src/demo/demo.test.ts`.
- RIDGE hazards (owner 2026-11-15): "Spaceflight hazards" section on every indicator page (linked HRP risk and hazards; no REF IDs on screen) and a RIDGE section on About (radiation stated as not measured; links the NASA page); Sleep → Isolation and confinement (owner, REF-63); Heart rate row approved by the owner. Background only, no rule or status changed. Tests in `src/domain/hazards.test.ts`.
- Sex as an optional profile attribute (owner 2026-11-15): `sex` in stored data (default Not set; older data reads as Not set), control in Settings → Demo controls, evidence note SN-01 on the blood pressure page approved by the owner 2026-11-15 and shown for Female in Approaching landing and Post-landing; no rule, threshold, or status changed. REF-59–REF-62 approved. Tests in `src/domain/sex.test.ts`.
- UX copy review applied (owner, 2026-11-15; OD-17 for rule wording): action first with a "Why?" layer, no OD-/P- codes on screen, one form for contacting the flight surgeon, "Log reading", "Last measured …", "Check-ins", clearer errors; badges stay Normal / Attention / Escalate.
- Settings → Appearance: Contrast labels "Normal" / "High" (no WCAG levels); "Monospaced numbers" option (on by default) between Text size and Assistive patterns, replacing the footer note (owner, 2026-11-15).
- Clear data and Load demo data confirm in a dialog that states what is deleted and kept (owner, 2026-11-15).
- Header (owner, 2026-11-15): "Haoma" with the Demo data chip on the left; Log entry next to the avatar on every page; Home summary strip removed.
- Home columns (owner, 2026-11-15): 1 : 2 : 1 from 1280 px (equal side columns), 1 : 2 from 1024 px.
- Layout review (owner, 2026-11-15): shared `PageLayout` for Settings, About, Reports, Report, indicator and not-found pages (centred, 1024 px, same spacing); consistent Settings row spacing (title, hint, control, 8 px); larger astronaut name in the avatar card.
- **Crew Average Comparison** (owner spec 2026-11-15) on all six indicator pages, below History; your readings are solid primary lines told apart by markers (filled / outlined circle / outlined square), crew averages dash-dot in the secondary colour; legend and tooltip show the same line samples: summary (latest vs. crew average, signed difference, members, period, neutral wording, unavailable state), optional dash-dot crew line in the chart with n in the tooltip, crew columns in the table; like-with-like matching per indicator, same mission day, viewer excluded, minimum cohort 3, PHQ-2 never compared; simulated crew of five (`src/crew/`). No rule, status, or baseline changed.
- Home layout (owner, 2026-11-15): activity graph moved to the right column, banners below it, so the cards get more vertical room.
- Owner consistency review (2026-11-15): number monospaced and unit in the normal font, smaller (`Measurement` component); "Demo data" chip is a secondary Badge that opens the demo notice; body map hint no longer overlaps Save report / Clear all when the figure and pain log stack (Home at 1024 px, report page). Activity grid capped at 320 px.
- Owner usability review (2026-11-15), all five items: demo data relative to today with this morning's sleep and blood pressure at Attention (banners on first load; untouched stale demo data regenerated on load); Home **Log entry** dialog with six tabs that saves one or more indicators together; neutral **Due** chip next to the unchanged badge when there is no reading today (status follows AU-6); activity graph (contribution calendar) and summary strip above the cards; demo controls moved from the avatar card to Settings → Demo controls (`design.md`).
- Phase A foundation (Checkpoint A). Display settings (`design.md` → "Display settings").
- Rule evaluation RULE-01–RULE-30 (`src/rules/`) with three distinct neutral states: **No measurement**, **Not evaluated**, **Normal**.
- Home (Section 16): logo links Home; avatar card with the fictional profile Alex Morgan, indicators to review, demo-data notice, Settings and About; "Demo data" chip; six separate indicator cards (check-in state merged in; PHQ-2 state on Mood; standard left-aligned badge); green tier labeled "Normal"; banners in a right column; full-width layout; the body map fills the figure area (next item).
- Body map (owner prototype, 2026-11-14) in the Home figure area: 3D (WebGL) and 2D (SVG, keyboard-accessible) body model; pain logs with date and time, add, edit, delete, show on body, clear all; links to related indicators; Save report moves the chosen logs into a report (temporary banner with View report); Reports page (avatar menu and button next to 3D/2D) with View, Open JSON, Download JSON, Delete, and Import JSON; report view shows the logs read-only on the body map; report file includes astronaut name and save date; fills the viewport height and the free width; theme-aware; lazy-loaded; never interpreted.
- Every page except Home: fixed width and an outline Back button.
- Demo data loads automatically on the first visit (nothing stored yet); Clear data stores an empty dataset so it is not reloaded. Body map 3D/2D toggle moved to the bottom right of the figure, styled like the Zoom/Reset/view buttons.
- Public README describes the built app.
- Section 17: Settings in two cards (Appearances; Units and Formats: °C/°F, mg/dL or mmol/L, three date formats, display and entry only); avatar card per the wireframe with Mission zone, Mission phase, Load demo data, Clear data. Pain-log date and time below Character with the shadcn date picker.
- History entries are editable (Edit per row; time kept; marked "Manual entry (edited)"; re-evaluated) and deletable after confirmation; the table is paginated (10 / 25 / 50 rows per page, owner 2026-11-15).
- Per-indicator history view (`/indicators/:id`): latest value, unit, time, provenance; status with rule, action, evidence labels, REF IDs; personal baseline; chart plus accessible table; approved rules listed separately. Chart library lazy-loaded (main bundle 780 → 423 kB).
- OD-14 applied (owner decisions on the audit, `scientific-foundations.md`): AU-1 sleep label; AU-3 heart-rate rest state, rest-only rules and baseline, descriptive count of readings above 100; AU-4 systolic < 90 OR diastolic < 60; AU-5 PHQ-2 current for 14 days, with the owner's four labels; AU-6 timestamps and separate check-in completeness; AU-7 time-of-day clause removed. Tests added for each.
- OD-15 applied: temperature method required for new entries; RULE-14–RULE-17 for oral readings only; forehead and legacy readings ("Method not recorded") shown with trend and same-method baseline difference, unclassified; one chart line per method; "keeps rising" trigger removed. PHQ-2 single cutoff 3 (score 2 alone no longer Attention; REF-56 documents the ≥ 2 alternative). Heart rate: rate rules resting-only, RULE-08 symptom-based escalation for any reading.
- Owner logo applied as favicon and header mark (TP-16).
- OD-16 applied: RULE-17 = single oral reading ≥ 40.6 °C (urgent review); new RULE-31 = measurement review for 39.4 ≤ x < 40.6 °C; RULE-16 precedence kept (no tier drops as temperature rises); unclassified forehead readings explained; reported symptoms shown with the latest reading; REF-56 approved; REF-57/58 (NHLBI) added `Unverified`; proposals P16-1–P16-4 documented, not implemented.

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
| 2026-11-14 | Owner review: history view approved; no overall health score; XP deferred; body figure (since built as the owner's body map); one fictional profile; simple daily check-in; no averaged statuses; crew comparison, sensors, roles, real-time reporting deferred; clinical rules read-only; no zone-specific reference ranges | `product.md` |
| 2026-11-14 | Owner brainstorm Sections 13–15 received; Section 14 and the decided parts of Section 13 implemented | `product.md`, `design.md` |
| 2026-11-14 | Kickoff received 09:00 CET; repo created and Phase A executed | `implementation.md` |
| 2026-11-14 | OD-14: audit decisions (AU-1, AU-3–AU-7 applied; AU-2 to revise), PHQ-2 labels, D-01 charts approved, provisional demo profile, body-figure direction, lazy-load charts | `scientific-foundations.md`, `design.md`, `data-and-limitations.md` |
| 2026-11-14 | Mission phase stays in the avatar card; glucose unit choice kept (a common pattern); mission name, mission day, indicators-to-review not shown; cards show "Measured … ago" / "Not measured today" with the badge top right; badges are shadcn default size, fully rounded, tier wording only; outline "Back" button everywhere | `design.md` |
| 2026-11-14 | Section 17 (Settings, avatar card); fixed width for every page except Home; save banner back in the pain log; pain date and time below Character with the shadcn date picker; unticked logs stay in the pain log (confirmed) | `design.md` |
| 2026-11-14 | Reports: saving moves logs into the report; success banner with View report; report view on the body map; open, download, and import JSON; file includes astronaut name and save date | `design.md` |
| 2026-11-14 | Body map follow-ups: region → indicator links, Save report and Reports page, date and time per log, Max card removed, average kept, full-height and full-width body map, fixed width and Back for About and Settings | `design.md` |
| 2026-11-15 | Crew Average Comparison built (replaces the 2026-11-14 deferral); parameters P-9–P-11 proposed by Claude | `product.md`, `design.md`, `scientific-foundations.md`, `data-and-limitations.md` |
| 2026-11-15 | Consistency review: units in the normal font, Demo data chip opens the notice, body map hint fix | `design.md` |
| 2026-11-15 | Usability review: demo relative to today with two Attention readings; Log entry dialog; Due marker (status unchanged, AU-6); activity graph and summary strip; demo controls in Settings | `design.md`, `data-and-limitations.md` |
| 2026-11-14 | Demo data loads on the first visit; 3D/2D toggle at the bottom right of the figure in the figure-button style | `design.md`, `data-and-limitations.md` |
| 2026-11-14 | Body map: owner prototype `body-map.html` integrated in the Home figure area for self-reported pain; replaces the navigation proposal | `design.md` |
| 2026-11-14 | Brainstorm Section 16: Home layout (cards, avatar card, Demo data chip, "Normal" label, full width, logo links Home) | `design.md` |
| 2026-11-15 | RIDGE hazards shown as background on indicator pages and About; Sleep linked to isolation and confinement; Heart rate row approved | `scientific-foundations.md` → "Spaceflight hazards (RIDGE)" |
| 2026-11-15 | Sex: optional profile attribute for evidence notes only; no split tool or sex-specific thresholds | `scientific-foundations.md` → "Sex as an optional profile attribute" |
| 2026-11-14 | OD-16: RULE-17 split (≥ 40.6 °C urgent; RULE-31 review 39.4–40.5 °C), forehead explanation, REF-56 approved | `scientific-foundations.md`, `references.md` |
| 2026-11-14 | OD-15: temperature method-specific rules, PHQ-2 single cutoff 3, RULE-08 symptom-based for any reading; owner logo | `scientific-foundations.md`, `references.md` |
| 2026-11-14 | Release schedule: freeze Sun 18:00 CET, internal target Sun 22:00 CET, deadline Sun 23:59 CET | `implementation.md` |
| 2026-11-14 | OD-13: OSDR cross-check applied (C-5 to C-8); REF-54 Polaris Dawn, REF-55 OSD-575 added as `Unverified`; no rule changed | `scientific-foundations.md`, `references.md` |

## Outstanding decisions (owner)

1. Crew comparison parameters P-9 (minimum cohort 3), P-10 (same mission day), P-11 ("close to" = within 0.5 crew SD): confirm (`scientific-foundations.md` → "Crew comparison parameters").
2. RULE-16 precedence: a single oral 39.4–40.5 °C reading still escalates through RULE-16 when there is no baseline yet, the reading is more than 0.5 °C above the baseline, or symptoms are reported. Keep, or cap RULE-16 below 39.4 °C (`scientific-foundations.md` → "OD-16 implementation and verification").
3. Proposals P16-1 to P16-4 (`scientific-foundations.md` → "OD-16 proposals"): symptom-only heart-rate rule (RULE-32), RULE-08 split and wording, RULE-17/RULE-31 wording, temperature symptom list.
4. REF-57, REF-58 approved 2026-11-15. AHA warning-signs page: PDF export needed (automated access blocked).
5. Body map: confirm the region → indicator links (`design.md` → "Body map").
6. Evidence: approve C-5 and C-7 (the Heart rate row itself was approved 2026-11-15).
7. Auto-mode source (LED lighting), zone source, condition-based suggestions.
8. Berlin Local Event name and local judging times.
9. Placement of the Sex control.

## Environment status (2026-11-14)

- Node v26.13.1 + npm 11.20.0 via user-local `fnm`. GitHub CLI and Vercel CLI (`npx vercel`) logged in as `shahyari`.
- Vercel project `haoma` (`prj_IBHh…`), connected to `shahyari/haoma`; pushes to `main` deploy to production. Aliases of the production deployment: haomaho.vercel.app (documented URL), haoma-mu.vercel.app (redirects to haomaho, set by the owner), haoma-ho-shah.vercel.app, haoma-git-main-ho-shah.vercel.app. Checked 2026-11-14: the production deployment's source is git, `shahyari/haoma`, branch `main`, at the latest pushed commit.

## Unresolved scientific questions

SQ-01–SQ-08 in `scientific-foundations.md`. RULE-01–RULE-30 are `Approved` (owner, 2026-11-14) and implemented in `src/rules/`.

## Verification

- 2026-11-15 (crew comparison, Home layout, usability and consistency reviews): `npm run format:check` clean; `npm run lint` exit 0; `npm run typecheck` exit 0; `npm test` 16 files, 330 tests passed; `npm run build` exit 0 (chart stays a lazy chunk). `src/rules/` unchanged. Checked in headless Chrome: all six indicator pages at 1280 px (summary, chart lines and tooltip, table, unavailable days), blood pressure at phone width, Home layout at 1600 px.
- Covers: rule boundaries, overlaps, precedence; temperature methods and legacy records; heart-rate rest state and symptom-based escalation; PHQ-2 single cutoff and 14-day validity; a sweep that no reading without an applicable rule is shown as Normal; temperature tier never drops as the value rises; symptom-only scenarios; demo scenario snapshot (sleep and blood pressure Attention, others Normal, no Escalate) and demo refresh; multi-indicator Log entry (partial failure saves nothing); Due marker outside the badge; activity graph and summary strip; Demo controls in Settings; keyboard (jsdom); token contrast; persistence.
- Not done: manual keyboard pass in a real browser, screen reader, true 320 px render of seeded pages. No WCAG conformance is claimed.

## Next action

Owner decisions 1–4 above. Unblocked meanwhile: a real-browser keyboard and responsive pass; slide deck and submission text before the freeze (Sun 18:00 CET).
