# Technical architecture

**Responsibility:** The single home for stack decisions, the data model, data flow, engineering security constraints, project commands, and deployment. Stack decisions are final as of 2026-11-13; the data model below still needs confirmation.

## Constraints

- Browser-based demonstration, publicly accessible, no mandatory login.
- No paid services required.
- All fictional/demo data explicitly labeled.
- Scientific guidance must be traceable to `scientific-foundations.md`.
- Dependencies must be OSI-licensed or freely available, and compatible with Apache-2.0 (`challenge.md` E-R7, E-R8). Record them in `references.md`.
- Original code is licensed Apache-2.0 (Approved).

## Decisions

Status values: **Approved** (final; implementation still waits for the event start), **Required** (forced by an approved choice). All stack rows approved by the owner on 2026-11-13. Versions and licenses were read from the npm registry on 2026-11-13. Nothing is installed.

| Topic | Decision | Reason / notes | Status |
|---|---|---|---|
| License | Apache License 2.0 for original code | Owner decision 2026-11-13. OSI-approved and matches the Space Apps default (E-R7). Add the LICENSE file at repository setup (Sat 2026-11-14, 09:00 CET). | **Approved** |
| Language | TypeScript (Apache-2.0) | Typed data model and validation | **Approved** |
| Build | Vite 8 (MIT) | Fast dev server; static output fits Vercel | **Approved** |
| Package manager | npm | Already installed | **Approved** |
| Framework | React (MIT) | Owner decision 2026-11-13; required by shadcn (C-02 resolved) | **Approved** |
| Component library | shadcn (MIT), with Tailwind CSS (MIT) | Owner decision 2026-11-13; accessible primitives | **Approved** |
| Icons | Lucide, `lucide-react` (ISC), the only icon library | Owner decision 2026-11-13. Default icon set of shadcn/ui; prefer the icons shadcn components already use. No additional icon libraries unless absolutely necessary (owner approval required). | **Approved** |
| Persistence | Browser `localStorage` | No backend or accounts; no data leaves the device | **Approved** |
| Hosting | Vercel (Hobby, free) | Static deploy and preview URLs | **Approved** |
| Testing | Vitest 5 (MIT) | Native Vite integration | **Approved** |
| Charts | Recharts (MIT) via shadcn chart component | Recommended for the React + shadcn stack; see "Chart recommendation" | **Approved** |
| Runtime | Node.js 26 LTS (installed: v26.13.1 via user-local `fnm`) | Required ≥ 22.12 by Vite 8 and Vitest 5; 26.x is also Vercel's default runtime. Pin `"engines": { "node": "26.x" }` in `package.json` at Phase A step A2. See C-01 | **Required** (follows from approved Vite 8 / Vitest 5) |

## Stack review (2026-11-13)

### Concerns

- **C-01 — RESOLVED 2026-11-13:** Node v26.13.1 (LTS) installed via `fnm` (user-local). Original note: **Node version.** The local Node is v22.11.0. Vite 8 requires `^20.19.0 || >=22.12.0`, Vitest 5 requires `^22.12.0 || ^24.0.0 || >=26.0.0`, and jsdom (the usual DOM test environment) requires `^22.22.2 || ^24.15.0`. **Upgrade Node to the current 24 LTS before the event.** Pin it with `engines` in `package.json` and the Vercel project settings.
- **C-02 — RESOLVED 2026-11-13:** owner chose Option A (React + Tailwind + shadcn) with Lucide icons (`lucide-react`, the shadcn default). The original analysis follows for the record.
- **C-02 (original analysis): shadcn vs. "no framework".** shadcn/ui distributes React components built on accessible primitives and styled with Tailwind, so it cannot be used without React. Choose one:
  - **Option A (recommended): React + Tailwind + shadcn.** This justifies a framework:
    - accessible dialogs, tabs, tooltips, and forms out of the box (keyboard and ARIA handled);
    - shadcn's chart component is built on Recharts, so charts match the UI;
    - the fastest route to a polished UI in 48 hours, and the most familiar stack for Claude Code.
    
    Cost: more dependencies and a larger bundle.
  - **Option B: vanilla TypeScript, no shadcn.** Native semantic HTML (`<dialog>`, `<details>`, form controls) plus our CSS tokens. Fewest dependencies, but every interactive component and its accessibility is built by hand, and stateful views (trends, body figure) take more time.
- **C-03: localStorage.**
  - Data is per browser and per device, and is lost if site data is cleared.
  - It is unavailable or ephemeral in some private-browsing modes.
  - The capacity is ample for six indicators.
  
  Requirements: a versioned storage key; graceful fallback when storage is unavailable; "Load demo data" and "Clear my data" controls; a privacy statement in `data-and-limitations.md`.
- **C-04: Vercel.**
  - Needs a Vercel account. Git-based deploys need the GitHub repo, which will be created at the event start (Sat 2026-11-14, 09:00 CET).
  - Fallback: deploy with the Vercel CLI via `npx` at the event.
  - The Hobby plan is for non-commercial use, which suits a hackathon.
  - Optionally request FortiGuard classification for the deploy URL (E-R20).
- **C-05: Testing scope.** Vitest for validation and rule logic (pure functions), plus component tests in jsdom. Accessibility is checked manually (keyboard pass, contrast) and optionally with `axe-core`. Skip end-to-end browser tests unless time allows.
- **C-06: Licenses.** All candidate packages checked are MIT, ISC, or Apache-2.0, which are compatible with Apache-2.0. Record installed versions in `references.md`.

### Chart recommendation

Our needs: time series for six indicators (blood pressure has two series); keyboard and screen-reader access (an accessible chart plus a data-table fallback); status cues that don't rely on color alone; a small footprint; an OSI license.

| Option | Fits | Notes |
|---|---|---|
| **Recharts** (MIT) via shadcn charts | Option A | SVG; consistent with shadcn styling; has a built-in keyboard accessibility layer. Recommended with Option A. |
| Hand-rolled SVG line charts | Option B | Zero dependencies and full control over accessibility. Feasible for simple line charts. Recommended with Option B. |
| Chart.js (MIT) | Either | Canvas-based, so it needs a separate accessible fallback for screen readers. |
| uPlot (MIT) | Either | Very small and fast. Canvas-based, sparse defaults, accessibility is up to us. |

Whichever option is chosen, provide a data-table view of every chart for accessibility and judging.

## Supporting dependencies (engineering choices, Claude)

These are routine tooling choices within the approved stack, delegated to Claude by the owner's workflow (`implementation.md` → Roles). Each is justified here; record installed versions and licenses in `references.md`. Anything not on this list that adds a framework, icon library, paid service, or major runtime dependency needs owner approval.

| Purpose | Choice | Justification |
|---|---|---|
| shadcn/ui transitive deps | Whatever the official shadcn CLI installs (e.g., Radix primitives, `class-variance-authority`, `clsx`, `tailwind-merge`) | Required by shadcn/ui |
| Routing (A5) | `react-router` (MIT), unless the Phase A shell needs no more than a few views, in which case use minimal in-app state | De facto standard; small; supports deep links on Vercel with an SPA rewrite |
| Linting | Linter config from the official Vite React-TS template: **oxlint** (MIT) as of `create-vite` on 2026-11-14 (the template no longer ships ESLint) | Ships with the scaffold |
| Formatting (A8) | Prettier (MIT), dev-only | Consistent formatting; zero runtime cost |
| Component tests | `@testing-library/react` (MIT) + `jsdom` (MIT), dev-only | Standard Vitest companions |
| Keyboard tests | `@testing-library/user-event` (MIT), dev-only | Simulates real Tab, Enter, Space, and Escape sequences, which `fireEvent` cannot (added 2026-11-14) |
| Accessibility checks | `axe-core` (MPL-2.0; dev-only), optional | Automated a11y smoke checks. MPL-2.0 applies to the library itself and is used for testing only. |
| Validation | Hand-written TypeScript validators (no schema library) | Six indicators don't justify an extra dependency |
| Date picker | shadcn `calendar` component, which installs `react-day-picker` 10.0.2 (MIT) and `date-fns` 4.4.0 (MIT) | Owner asked for the shadcn default date-time picker instead of the browser's (2026-11-14). Loaded only with the body map chunk |

## Project structure (Phase A)

| Path | Contents |
|---|---|
| `src/main.tsx`, `src/App.tsx` | Entry point; router and app-level error boundary |
| `src/app/` | Shell (`AppShell`), route table (`routes.tsx`), `ErrorBoundary`, canonical disclaimer constant |
| `src/pages/` | Home (owner brainstorm Sections 13 and 16), indicator history (`/indicators/:id`), Reports (`/reports`), Report (`/reports/:id`, read-only body map), Settings, About, Not found |
| `src/components/ui/` | shadcn/ui components (generated by the shadcn CLI; add more with `npx shadcn@latest add <name>`) |
| `src/components/states/` | Reusable empty, loading, and error states |
| `src/domain/` | Indicator models, mission phase, team-set parameters P-1–P-8, structural validation. No rule logic |
| `src/storage/` | Versioned localStorage store with in-memory fallback |
| `src/data/` | `HealthDataProvider`: React context over the store (entries, mission phase, clear) |
| `src/rules/` | Approved rules as data (`rules.ts`, copied from `scientific-foundations.md`) and their evaluation (`evaluate.ts`). The only place with health thresholds |
| `src/settings/` | Display settings (theme, mode, contrast, font size, colour-blind mode, zone), stored under `haoma:display:v1` |
| `src/features/` | Feature components: entry dialog, Home status banner, history chart and table definitions (`history/`), daily check-in and PHQ-2 cadence (`checkin/`), body map and pain log (`bodymap/`: `links.ts`, region → related indicators; `engine.ts`, the dependency-free WebGL/SVG engine ported from the owner's prototype; `BodyMap.tsx`, the React panel and dialog) |
| `src/demo/` | Fictional profile and seeded simulated history |
| `src/test/` | Test setup and helpers, contrast measurement, keyboard and persistence tests |
| `src/index.css` | Tailwind entry and design tokens (neutral placeholders, `design.md`) |
| `vercel.json` | SPA rewrite so deep links load `index.html` |

Tests sit next to the code as `*.test.ts(x)`. Import alias: `@/` → `src/`.

**Code splitting:** every page except Home is loaded on demand (`src/app/lazyPages.tsx`), and so are the history chart (Recharts) and the body map. Main bundle 2026-11-14: 364 kB (117 kB gzip); body map chunk 121 kB (39 kB gzip, includes the date picker); chart chunk 364 kB (106 kB gzip).

Installed versions (2026-11-14): React 19.3, React Router 8.5, Vite 8.3, TypeScript 7.0, Tailwind CSS 4.3, shadcn CLI 4.23 (style `radix-nova`, base color neutral), Recharts 3.8, Vitest 5.1. The full list is in `references.md`.

## Data entities

Indicator models are implemented in `src/domain/indicators.ts` (Phase A step A6). `CrewProfile` and `DemoScenario` fields wait for the owner's specs (F-06).

- CrewProfile: TODO: fields
- HealthEntry: a union discriminated by `indicator`. Common fields: `id`, `recordedAt` (ISO 8601), `origin` (`userEntered` / `simulated`), optional `editedAt` (ISO 8601; set when an entry is edited, which also sets `origin` to `userEntered` and keeps `id` and `recordedAt`), optional `symptoms` (IDs from `src/domain/symptoms.ts`, taken from the symptom lists in the approved rules). Per indicator: blood pressure `systolicMmHg`, `diastolicMmHg`; heart rate `bpm`, optional `activity` (`rest` / `afterActivity`; required for new entries); glucose `mgDl`, `context`, `device`; temperature `celsius`, optional `method` (`oral` / `forehead`; required for new entries, absent on legacy entries), `exercisedLast30Min`; sleep `hours`, `source`; mood `kind` = `phq2` (`score` 0–6) or `dailyRating` (`rating` 1–5).
- PainLog (`src/domain/pain.ts`, one point on the body map): `id`, `recordedAt`, optional `editedAt`, `region` (name shown), `organ` / `zone` (ids from the 2D map, or null), `position` and `normal` (model coordinates, metres), `view` (`3D` / `2D`), `intensity` (integer 1–10), optional `character` (one of 7 options), optional `note` (≤ 240 characters). Stored in `AppData.painLogs` (read from the earlier field name `painReports` too). PainReport: `id`, `createdAt` (save date), optional `astronaut` (name at saving), `logs` (one or more PainLogs, moved out of `painLogs` when saved), stored in `AppData.reports`. Report file: `painReportJson` / `parsePainReportJson` in `src/domain/pain.ts` (schema `haoma.painReport.v1`). Data without these fields loads with empty lists (no schema version change).
- AppData (stored under `haoma:v1`): `schemaVersion`, `missionPhase` (app-level setting, default In flight), `entries`. Stored data that fails validation is reported as `corrupt` and left untouched; the app starts from defaults.
- EvidenceReference: TODO: claim, REF ID, applicability, status
- DemoScenario: TODO: profile, seeded entries, explanation

## Data flow

TODO: input → validation → storage → display/trend → sourced prompt

## Security and privacy constraints (engineering)

The public privacy statement is in `data-and-limitations.md`.

- No real personal health information in the public demo.
- No secrets in client code or the repository.
- Define whether user entries persist locally and how to clear them.
- Never transmit health data to an external service without explicit approval and a reviewed privacy plan.

## Commands (fill after setup)

The `verify` skill reads these.

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build` (preview the build: `npm run preview`)
- Tests: `npm test`
- Lint/typecheck: `npm run lint` and `npm run typecheck`
- Format: `npm run format` (check only: `npm run format:check`)
- Deploy: `git push origin main` (the Vercel project `haoma` is connected to `shahyari/haoma` and builds `main` as production). Manual fallback: `npx vercel --prod`
- Production URL: https://haomaho.vercel.app

## Deployment smoke test

Last run: 2026-11-14 (Checkpoint A), anonymous `curl` against the production URL.

- [x] Home page loads from the public URL.
- [x] No login required.
- [ ] Core scenario works. (Not applicable yet: no product screens.)
- [x] No secrets or personal data exposed.
