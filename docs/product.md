# Product definition and MVP

**Responsibility:** Our proposed product: users, the primary journey, MVP features with acceptance criteria, screens, demo stories, and the definition of done. These are our choices, not official requirements. Each feature links to the official requirement IDs in `challenge.md` that it addresses.

## Product statement

HAOMA helps **astronauts** check and act on six health indicators **during long-duration missions, far from in-person care**, by checking each reading against evidence-labeled, owner-approved rules and the astronaut's own baseline, and saying what to do first and when to involve the flight surgeon. Restated from the owner's title, tagline, and summary (`submission.md`).

## Users and operating context

This is the single home for the user definition and the journey. Other documents link here.

- Primary user: **the astronaut**, self-assessing during a mission (owner decision 2026-11-13).
- Secondary user: **none in the MVP.** The crew medical officer and the flight surgeons receive escalations ("Tell the flight surgeon …") and saved pain reports (JSON), but they do not use the app. Roles for a medical team are deferred until a backend is approved (owner 2026-11-14).
- Operating constraints, as built: one person on one device, in a browser, with no login, no network dependency for health data, and no sensors. Data stay in that browser's localStorage. Input by keyboard, mouse, or touch. Screens from phone width to wide desktop. The daily check-in is short (one dialog for all six indicators). The mission phase and zone are set by hand in Settings → Demo controls.
- Assumptions requiring validation (none tested with astronauts):
  - Astronauts will log readings manually each day, and a short dialog fits the mission routine.
  - Readings typed by hand (from a cuff, glucometer, thermometer, or actigraphy summary) are accurate enough to act on.
  - General adult references with clear labels are useful for self-assessment and are not over-trusted.
  - "Action first, reason second" wording is understood under time pressure and stress.
  - A crew average gives helpful context and does not cause false reassurance or concern.
  - A browser on a personal device is acceptable. A real mission would need a shared or certified device and secure storage.

## Primary user journey

As implemented (`design.md` → "Information architecture"):

1. **Entry point:** Home. Six indicator cards (latest value, status badge, when measured, "Due" if not measured today), the body map, the Check-ins graph, and any Attention or Escalate banners.
2. **Self-assessment input:** **Log reading** in the header opens one dialog with a tab per indicator. The astronaut enters one or more readings with their context and saves them together.
3. **Review of results:** each card updates its badge (Normal, Attention, Escalate, or the neutral Not evaluated / No measurement). A banner appears for Attention or Escalate, with the action first and "Why?" for the rule, source, and evidence type.
4. **History and trends:** opening a card shows the indicator page: latest value with provenance, chart and table, personal baseline, simulated crew comparison, approved rules with references, and spaceflight hazards.
5. **Follow-up or escalation:** the action says what to do (re-measure, rest, adjust sleep, use self-care time) and, when needed, to tell the flight surgeon now or at the next contact. Pain can be logged on the body map and saved as a report for the flight surgeon.

## Indicator scope

Owner decision 2026-11-13. Officially, the statement requires that the software "gathers health indicators" (R-01) but names these six only as examples (E-01). Our MVP adopts all six. Evidence for each is tracked in `scientific-foundations.md`.

| Indicator | Official status | haoma MVP |
|---|---|---|
| Blood pressure | Example (E-01) | In scope |
| Heart rate | Example (E-01) | In scope |
| Blood glucose ("blood sugar") | Example (E-01) | In scope |
| Body temperature | Example (E-01) | In scope |
| Sleep duration ("daily sleep hours") | Example (E-01) | In scope |
| Mood | Example (E-01) | In scope |

## Official requirements vs. optional enhancements

- **Officially required (Core, `challenge.md`):** gather health indicators (R-01); let astronauts evaluate and act on their health status (R-02); a visual tool for self-assessment (R-03); guidance on treatments and health improvements (R-04), delivered under the approved guidance policy in `science.md`.
- **Suggested by the statement:** varied input methods (S-01), use of NASA HRP and agency resources (S-02, which E-R14 makes mandatory for Global Awards), the guiding questions (S-03a–e), clear and interactive presentation (S-04), a clickable human figure (S-05).
- **Optional enhancements:** different environments (O-01), mission-routine prompts (O-02), gamification (O-03), dynamic charts (O-04), color coding (O-05), instructions and explanations (O-06). Owner priorities are below; the other O-items are undecided.

## MVP features and priorities

Priorities were set by the owner on 2026-11-13 and are subject to refinement. A priority is **not** authorization to implement: each feature needs an approved spec in `docs/specs/` or explicit owner authorization (`implementation.md` → Phase B). Details (user value, acceptance criteria) live in each spec.

| ID | Feature | Priority | Addresses (challenge.md, proposed) | Spec | Depends on |
|---|---|---|---|---|---|
| F-01 | Daily health self-assessment (six indicators) | P0 | R-01, R-05, E-01 | Implemented. Authorized by owner brainstorm Sections 13–16 and the usability review (2026-11-15); `src/features/entry/`, `src/domain/` | Phase A models and storage |
| F-02 | Health overview | P0 | R-02, R-03 | Implemented. Home (Section 16); `src/pages/HomePage.tsx`, `src/features/home/` | F-01 |
| F-03 | Historical trends | P0 | R-03, O-04 | Implemented. Indicator pages (owner approval 2026-11-14) and Crew Average Comparison (owner spec 2026-11-15); `src/pages/IndicatorPage.tsx`, `src/features/history/`, `src/crew/` | F-01 |
| F-05 | Evidence-backed explanations and escalation guidance | P0 | R-02, R-04, S-03, O-06 | Implemented. RULE-01–RULE-31 (RULE-28 not evaluated, AU-8); `src/rules/`; UX copy review 2026-11-15 | `Approved` entries in `scientific-foundations.md` |
| F-06 | Fictional astronaut demo scenarios | P0 | Demo and judging (E-R11) | Implemented. Seeded demo (`src/demo/`, `data-and-limitations.md`); scenarios below and in `submission.md` | F-01; `data-and-limitations.md` |
| F-04 | Interactive body map | P1 | S-05 | Implemented. Owner prototype `body-map.html` (2026-11-14); `src/features/bodymap/`, Reports pages | F-02 |
| F-07 | Mission routine reminders | P2 | O-02 | Not implemented. Only the "Due" chips, PHQ-2 cadence, and the RULE-30 reminder exist; no schedule or notifications | F-01 |
| F-08 | Gamification | P2 | O-03 | Deferred (owner 2026-11-14: XP and levels) | F-01 |

No `docs/specs/F-NN-*.md` files exist. Features were authorized by the owner in the brainstorm (Sections 13–17), the owner's reviews, and the crew-comparison spec, as recorded in `progress.md` → "Decisions made".

## Owner brainstorm, 2026-11-14 (Sections 13–15)

Source: the owner's brainstorm file. This table tracks what is built; details that are still undecided are listed in `progress.md`.

| Item | Feature | State |
|---|---|---|
| Home: three areas (indicators; body figure with status banners; profile card and tasks card) | F-02 | Superseded by Section 16 (2026-11-14): separate indicator cards and the body-figure area; profile, Settings, About, and the demo notice in the avatar card (`design.md` → "Information architecture") |
| Six indicators with latest value and status; open an indicator to enter a value | F-01, F-02 | Built |
| Yellow/red banner with icon and wording, expandable to instructions and actions | F-05 | Built (RULE-01–RULE-31, evidence labels, REF IDs; action first, "Why?" second). Banners do not point at body parts: the body map is a self-reported pain log and is not linked to statuses |
| Per-indicator history: latest value, chart, data table, personal baseline, approved rules with references | F-03 | Built (owner approval 2026-11-14). No averaged statuses; no reference ranges drawn on charts. Crew averages built (next row). Earth values and zone values not built |
| Comparison with other crew members (same time window and total average) | F-03, F-06 | Built as **Crew Average Comparison** (owner spec 2026-11-15, replacing the 2026-11-14 deferral) on each indicator's history page: summary, optional crew-average line on the chart, crew columns in the table. Contextual comparison only, never a clinical interpretation; simulated crew data (`design.md` → "Crew comparison", `scientific-foundations.md` → "Crew comparison parameters") |
| Clickable human figure, colour-coded per body part | F-04 | Built as the owner's body map and pain log (prototype `body-map.html`, 2026-11-14): 3D and 2D body model in the Home figure area; self-reported pain logs with date and time, intensity, character, and note; links to related indicators; saved reports on the Reports page with JSON download; no interpretation (`design.md` → "Body map") |
| Profile card (avatar, XP and level, name, role, mission, health score) | F-06, F-08 | One provisional fictional profile (`data-and-limitations.md`) with check-ins completed today and indicators to review, shown separately. No overall health score (owner 2026-11-14). XP and levels deferred |
| Tasks card (assessments due from the schedule) | F-07 | Merged into the indicator cards (Section 16): each card shows whether it was measured today; the Mood card shows the PHQ-2 screening state. No notifications |
| Reading external sensors and wearables | — | Deferred. Entries record provenance (manual or simulated); an "imported" value is added when an import exists |
| Display settings (Sections 14 and 17) | — | Built (`design.md` → "Display settings"): Appearance and Units and formats cards; zone, mission phase, demo data, and clear data under Settings → Demo controls (2026-11-15) |
| Roles: Director, Admin, User (Section 15) | — | Deferred until a backend is approved. Clinical rules stay read-only (owner 2026-11-14) |
| Zone-based medical reference values | — | Not built: no supported source. Zone themes stay (owner 2026-11-14) |

## Explicitly out of scope

- Unvalidated diagnostic conclusions and treatment instructions without `Approved` evidence (guidance policy in `science.md`)
- Camera-based physiological measurement (owner decision 2026-11-13). The statement suggests camera input (S-01) but does not require it.

## Screen inventory

As implemented. Routes in `src/app/routes.tsx`. Every page except Home is lazy-loaded and shows a loading state, and an error boundary catches failures.

| Screen | Main action | States | Accessibility |
|---|---|---|---|
| Home (`/`) | Read today's status; open Log reading; open an indicator; log pain | No readings yet; Due; Normal / Attention / Escalate / Not evaluated / No measurement; banners; empty pain log | Skip link; cards are links; status as icon and text; activity cells have accessible labels; 2D body map regions are buttons in the Tab order |
| Log reading dialog | Enter one or more readings and save together | Empty; filled tab (check); tab with errors (alert icon, "Nothing saved. Fix the marked tab: …"); saved | Focus moves into the dialog, Escape closes it, and focus returns; labelled fields and radio groups; keyboard-tested in jsdom |
| Indicator page (`/indicators/:id`) | Review the latest status and trend; add, edit, or delete a reading | No readings; latest with status; baseline not yet available (fewer than 5); crew average not available; paged table; delete confirmation | Chart has an accessible name and is followed by a data table with caption and headers; icon buttons have full accessible names |
| Reports (`/reports`) | View, open, download, delete, or import pain reports | No reports; list; import error ("Not a Haoma report…"); delete confirmation | Buttons with text labels; confirmation dialog |
| Report (`/reports/:id`) | View a saved report on the body map, read-only | Report found; not found | 2D view regions are not interactive in read-only mode; logs listed as text |
| Settings (`/settings`) | Change appearance, units, and date format; demo controls | Defaults; confirmation dialogs for Load demo data and Clear data | Radio groups and checkboxes with 36 px targets; contrast, text size, assistive patterns |
| About (`/about`) | Read the purpose, disclaimer, and spaceflight hazards | Static | Headings; links named by source |
| Not found | Go back | Static | Back button |

## Demo stories

All demo profiles are fictional and all demo measurements are simulated. Record their provenance in `data-and-limitations.md`.

Both use the seeded demo: Alex Morgan, Flight Engineer on the fictional Aster-1 Lunar Transit Mission, with 14 days of simulated history and four simulated readings this morning. Full walk-through in `submission.md` → "Demonstration scenario". The deck (slides 4 and 5) shows the same stories.

- **Scenario A, routine check-in:** Glucose and temperature are Due. Alex logs 88 mg/dL, fasting, fingerstick. Result: Normal (RULE-09, General clinical reference). The Due chip goes away and the Check-ins graph fills in.
- **Scenario B, a change that needs attention:** this morning's simulated blood pressure 128/82 mmHg (RULE-02) and 6.2 h of sleep (RULE-19) are at Attention. Home shows banners with the action first ("Re-measure after rest and watch the trend") and "Why?". The Blood pressure page shows the trend, the personal baseline, and the simulated crew average for the same day, which never changes the status.

## Definition of done

Checked 2026-11-15 (commands and results in `progress.md` → "Verification").

- [x] Every Core requirement in `challenge.md` has evidence in the app or the submission (R-04 is partly addressed by design: preventive guidance and escalation, no treatment instructions).
- [x] The core journey works end to end without sign-in (component tests; production returns 200 without login).
- [x] Data source and simulation labels are visible ("Demo data" chip, "Simulated" on readings, "Simulated crew data", "Fictional Flight Engineer").
- [ ] Critical interactions work by keyboard. Automated jsdom keyboard tests pass; a manual pass in a real browser has not been done.
- [x] No unsupported medical claims; only Approved rules are active (`src/rules/` holds only Approved rules; RULE-28 is approved but not evaluated).
- [x] The app builds and the deployed demo is reachable (`npm run build`; https://haomaho.vercel.app returns 200).
