# Progress and handoff log

**Responsibility:** Current status only. Read this first in every session. Keep it short: replace stale entries instead of appending history.

**Last updated:** 2026-11-14
**Current phase:** A — Foundation complete (**Checkpoint A**). Next: Phase B, waiting for the first feature spec.
**Build status:** Passing. Repository https://github.com/shahyari/haoma (public). Production https://haoma-mu.vercel.app.

## Completed

- Preparation: documentation, evidence base (RULE-01–RULE-30 `Approved`), workflow, environment.
- Phase A, steps A1–A11 (`implementation.md`): public repo with Apache-2.0 license; Vite + React + TypeScript scaffold; Tailwind + shadcn/ui (12 base components incl. chart/Recharts); neutral placeholder tokens; router and responsive shell with skip link and three temporary placeholder pages; indicator models, mission phase, parameters P-1–P-8; structural validation; versioned localStorage store with memory fallback; error boundary and empty/loading/error states; scripts; Vercel project connected to GitHub. Structure and commands: `architecture.md`.
- Not built, by design: product screens, navigation/IA, branding, any rule or interpretation logic, demo data.

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
| 2026-11-14 | Kickoff received 09:00 CET; repo created and Phase A executed | `implementation.md` |
| 2026-11-14 | OD-13: OSDR cross-check applied (C-5 to C-8); REF-54 Polaris Dawn, REF-55 OSD-575 added as `Unverified`; no rule changed | `scientific-foundations.md`, `references.md` |

## Outstanding decisions (owner)

1. Feature specs for Phase B (`docs/specs/`); F-01 is the natural first one. Phase B is blocked until one arrives.
2. Visual direction and design-token values, and whether to keep the `design.md` token names (`--color-*` overlaps Tailwind's namespace; see the note in `design.md`).
3. Feature-freeze time (proposal: Sun 18:00 CET freeze, Sun 22:00 CET submission target).
4. Evidence: approve C-5 and C-7 (Heart rate row is `Unverified` since OD-13; REF-54, REF-55) and the optional items (`scientific-foundations.md` → "Still open").
5. Berlin Local Event name and local judging times (ask the Local Lead).
6. Symptom catalog (IDs and wording per indicator) for the `symptoms` field: needed by the F-01/F-05 specs.
7. Numeric plausibility bounds for inputs (e.g., a maximum for sleep hours): none are encoded; they need a spec or an `Approved` source.
8. Engineering notes to confirm: linter is oxlint (the Vite template no longer ships ESLint); shadcn style `radix-nova` with system fonts as the neutral placeholder; Vercel assigned the URL `haoma-mu.vercel.app`.

## Environment status (2026-11-14)

- Node v26.13.1 + npm 11.20.0 via user-local `fnm`. GitHub CLI logged in as `shahyari`. Vercel CLI via `npx vercel`, logged in as `shahyari`; project `haoma` linked (`.vercel/` is git-ignored) and connected to the GitHub repo.

## Unresolved scientific questions

SQ-01–SQ-08 in `scientific-foundations.md`. RULE-01–RULE-30 are `Approved` (owner, 2026-11-14); none is implemented in code yet.

## Verification

- Target: `verify foundation`, 2026-11-14.
- Commands: `npm run lint` → 0 problems; `npm run typecheck` → exit 0; `npm test` → 4 files, 40 tests passed; `npm run build` → exit 0.
- Checked: 320 px and 1280 px renders; anonymous access to the production URL (`/`, `/foundation`, `/about`, deep link); no secrets tracked; no health thresholds in code.
- Result: PASS.

## Next action

Wait for the owner's first feature spec (`docs/specs/F-NN-*.md`, `Status: Approved`), then run the Phase B feature loop (`implementation.md`). Remove `FoundationPage` and the temporary routes when real screens replace them.
