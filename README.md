# HAOMA — Health Assessment, Observation & Mission Assistance

**A mission-aware health companion for astronauts.**

> **Status: working prototype**, built during the NASA Space Apps Challenge 2026 hackathon (November 14–15, 2026). Development started at the event start, in line with the rule that teams may not begin working on challenges before the hackathon.

**Challenge:** [Create Health Monitoring Software for Astronauts on Space Missions](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/)
**Team:** Haoma
**Participants:** Hossein Shahyari
**Event:** Local Event, Berlin

## Explore

- **Live app:** https://haomaho.vercel.app. The fictional demo history loads automatically on the first visit.
- **Demo deck (official demo, 7 slides, PDF):** [`docs/demo/haoma-space-apps-2026-demo.pdf`](docs/demo/haoma-space-apps-2026-demo.pdf)
- **Submission checkpoint:** tag [`spaceapps-checkpoint-1`](https://github.com/shahyari/haoma/releases/tag/spaceapps-checkpoint-1) (commit `24c9d95`, verified in production on 2026-11-15)
- **NASA project page:** TODO: project page URL

## About

The official challenge asks teams to build health monitoring software that gathers health indicators and enables astronauts to evaluate and act on the status of their health during long-duration space missions. HAOMA is a web-based self-assessment prototype for that challenge.

An astronaut logs six health indicators in a short daily check-in. Each reading is checked against owner-approved, evidence-labeled rules and the astronaut's own baseline, and shown as Normal, Attention, or Escalate. Every result says what to do first and why, and when to involve the flight surgeon. The app also shows the history of each indicator, an optional comparison with the crew average, and a 3D/2D body map for self-reported pain. Everything runs in the browser; no data leaves the device.

**Safety statement:** HAOMA is a hackathon prototype for education and demonstration. It is not a medical device, is not clinically validated, and does not replace a flight surgeon or other medical professional. Demonstration data are fictional unless specifically identified otherwise.

This project is not endorsed by NASA.

## Problem

On long-duration missions, astronauts face the hazards of human spaceflight (radiation, isolation and confinement, distance from Earth, altered gravity, closed environments; NASA Human Research Program, REF-01) far from in-person medical care. The challenge (REF-02) asks for software that gathers health indicators and helps astronauts evaluate and act on their health status.

## Solution

- **Daily check-in:** **Log reading**, in the header on every page, opens one dialog with a tab per indicator (heart rate, blood pressure, blood glucose, body temperature, sleep, mood). One save stores one or more readings, with the context that changes their meaning: at rest or after activity, fasting or not, glucose device, oral or forehead thermometer, sleep source.
- **Home:** six indicator cards with the latest value, a status badge (Normal, Attention, Escalate, or the neutral Not evaluated / No measurement), when it was measured ("Last measured yesterday"), and a "Due" marker when there is no reading today. A **Check-ins** graph shows logging over the last 24 weeks. Warnings for Attention and Escalate show the action first; **Why?** opens the rule, its source, and its evidence type. The body map sits in the middle.
- **Indicator pages:** the latest value with provenance, status, and the rule behind it; the personal baseline; a chart with an accessible data table, paged (10, 25, or 50 rows), with Edit and Delete (after confirmation) on each reading; the approved rules for that indicator with their references.
- **Crew comparison:** on each indicator page, the latest reading against the average of the other crew members on the same mission day. Only comparable readings count (for example resting heart rate, the same temperature method), never the PHQ-2, and only when at least 3 members contribute; only aggregates are shown. An optional dash-dot line on the chart and crew columns in the table. It is mission context, not a reference range, and never changes a status. The crew data are simulated.
- **Body map and pain log:** a 3D (WebGL) and 2D (SVG, keyboard-accessible) body model. Pain logs record region, intensity, character, date and time, and a note, with links to related indicators. Logs can be saved as reports for the flight surgeon, viewed read-only on the body map, and opened, downloaded, or imported as JSON. Pain logs are self-reported and never interpreted.
- **Settings:** theme, mode, contrast (Normal, High), text size, monospaced numbers, assistive patterns, units, and date format; demo controls (mission zone, mission phase, load demo data, clear data), with a confirmation dialog before anything is deleted.

## Demo scenario

The fictional profile **Alex Morgan**, Flight Engineer on the invented **Aster-1 Lunar Transit Mission**, has a simulated 14-day history of all six indicators, one PHQ-2 screening, and four readings from this morning. The history loads automatically on a first visit, stays relative to today, and can be reloaded from Settings. All values are simulated. This morning's sleep (6.2 h) and blood pressure (128/82) are deliberately at Attention, and the rest are Normal; entering a new value (for example a high oral temperature) shows how the app evaluates it, explains why, and recommends an action. The person, mission, crew, and data are fictional ([`docs/data-and-limitations.md`](docs/data-and-limitations.md)).

## Features actually implemented

- Multi-indicator check-in and per-indicator entry, with validation and unit choices (°C/°F, mg/dL or mmol/L)
- Rule evaluation RULE-01–RULE-31 with three distinct neutral states (No measurement, Not evaluated, Normal); no overall health score and no averaged statuses
- Two-layer guidance: the action first, then the reason, source, and evidence type
- Per-indicator history with chart, paged data table, personal baseline, and editable and deletable entries
- Crew average comparison with like-with-like matching and a minimum group of 3 (simulated crew)
- 3D/2D body map with pain logs, saved reports, and JSON export and import
- Fictional demo profile and simulated history, labeled as such, loaded on the first visit
- Display settings: four themes linked to the mission zone, light/dark mode, high contrast, text size, monospaced numbers, assistive patterns
- Browser-only persistence (localStorage, with an in-memory fallback)
- 330 automated tests (rule boundaries, scenarios, keyboard, contrast, persistence)

## Scientific grounding

Indicators and rules are defined in [`docs/scientific-foundations.md`](docs/scientific-foundations.md); only rules the owner has set to `Approved` affect the app. Sources include NASA Human Research Program hazard and risk pages, NASA technical reports, NASA Open Science Data Repository datasets (OSD-575, OSD-370), the Canadian Space Agency and JAXA, the American Heart Association, the American Diabetes Association, the Endocrine Society, MedlinePlus (U.S. National Library of Medicine), Mayo Clinic, and peer-reviewed studies such as Kroenke et al. 2003 for the PHQ-2 ([`docs/references.md`](docs/references.md)). Most thresholds are general adult clinical references, not validated astronaut-specific thresholds, and the app says so.

## Data and limitations

- Health values are entered by the user or come from the simulated demo history; the crew used for comparison is simulated too. There are no sensors, no accounts, and no server; data stay in this browser.
- Thresholds are general-population references, not validated for astronauts or for spaceflight conditions.
- The pain log is self-reported and is not evaluated.
- Not tested with a screen reader; no WCAG conformance is claimed.

See [`docs/data-and-limitations.md`](docs/data-and-limitations.md).

## Run locally

Requires Node.js 26.

```sh
npm install
npm run dev
```

Other commands (tests, lint, build) are listed in [`docs/architecture.md`](docs/architecture.md) → Commands.

## Technology

React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui (Radix UI), Lucide icons, Recharts, React Router, date-fns, react-day-picker; Vitest and Testing Library; oxlint and Prettier; deployed on Vercel. The body map uses a dependency-free WebGL/SVG engine ported from the owner's prototype. Details: [`docs/architecture.md`](docs/architecture.md).

## Documentation

Each document has one responsibility. `CLAUDE.md` routes development tasks to them.

| Document | Purpose |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Claude Code instructions: phase gate, routing, non-negotiables |
| [`docs/challenge.md`](docs/challenge.md) | Official challenge text, event rules, requirements matrix |
| [`docs/product.md`](docs/product.md) | Users, journey, MVP features, definition of done |
| [`docs/science.md`](docs/science.md) | Scientific integrity and evidence policy |
| [`docs/scientific-foundations.md`](docs/scientific-foundations.md) | Indicators, evidence, interpretation rules (authoritative) |
| [`docs/references.md`](docs/references.md) | Bibliography (`REF-NN`), third-party licenses, AI disclosure |
| [`docs/design.md`](docs/design.md) | UX specification and design tokens |
| [`docs/design-decisions.md`](docs/design-decisions.md) | Design rationale and accessibility results |
| [`docs/architecture.md`](docs/architecture.md) | Stack decisions, data model, commands, deployment |
| [`docs/implementation.md`](docs/implementation.md) | Roles, phases, checkpoints, Phase A steps, priorities |
| [`docs/specs/`](docs/specs/README.md) | Owner-provided feature specifications (Phase B) |
| [`docs/progress.md`](docs/progress.md) | Current status and handoff log |
| [`docs/data-and-limitations.md`](docs/data-and-limitations.md) | Data provenance, privacy, limitations, canonical disclaimer |
| [`docs/submission.md`](docs/submission.md) | Canonical NASA submission text |
| [`docs/presentation-outline.md`](docs/presentation-outline.md) | Demo slide deck outline (official demo format, ≤7 slides) |
| [`docs/demo/`](docs/demo/haoma-space-apps-2026-demo.pdf) | The demo deck as submitted (PDF) |
| [`docs/demo-script.md`](docs/demo-script.md) | Inactive: 30-second video script, kept as a fallback |
| [`.claude/skills/verify/`](.claude/skills/verify/SKILL.md) | Claude Code verification skill |

Unfinished items are marked `TODO:`.

## Credits, sources, and licenses

Sources are listed in [`docs/references.md`](docs/references.md) (`REF-NN`), together with third-party code, the deck's typefaces (Inter and Space Grotesk, SIL Open Font License 1.1), and their licenses. **AI assistance:** code, the simulated demo and crew data, parts of the research, the demo deck, and drafts of the submission text were produced with AI assistance (Claude), under the owner's direction; product decisions are the team's. Details are in the AI-assistance section of [`docs/references.md`](docs/references.md).

## License

Original project code is licensed under the [Apache License 2.0](LICENSE). Third-party components keep their own licenses (see [`docs/references.md`](docs/references.md)).
