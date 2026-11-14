# UX and design specification

**Responsibility:** How the UI should look and behave: principles, information architecture, tokens, components, health-communication rules, and responsive/input behavior. The user and journey are defined in `product.md`. The rationale for design choices and accessibility test results go in `design-decisions.md`.

## Design intent

- Audience and primary task: see `product.md`.
- Design principles: TODO: 3–5 principles

## Information architecture

Owner brainstorm Section 16 (2026-11-14):

- **Header:** the logo (with the name "haoma") links to Home on the left. The avatar on the right opens the **avatar card**, which holds the fictional profile, indicators to review, the demo-data notice, "Load simulated demo history" (when empty), and the links to **Settings** and **About**. A "Demo data" chip next to the avatar replaces the demo disclaimer on the main screen. There is no separate navigation bar.
- **Home:** six separate indicator cards (Heart rate, Blood pressure, Blood glucose, Body temperature, Sleep, Mood) in a left column, and the body-figure area on the right, with the status banners and the RULE-30 reminder above it. On narrow screens the cards come first, then the figure area. The layout stretches to the full screen width (no fixed container width).
- **Indicator card:** icon and name; latest value; date and time · input context (method, device or rest state) · provenance; today's check-in state ("Checked in today" / "Not yet measured today"), which replaces the separate check-in card; PHQ-2 screening state on the Mood card; status badge across the bottom. The whole card links to the indicator's history page.
- **Status label:** the green tier reads "Normal" (was "Within reference"). "Not evaluated" and "No measurement" stay neutral and distinct.
- **Indicator icons** (Lucide, Claude's choice; blood pressure follows the owner's example): heart rate HeartPulse, blood pressure Droplet, glucose Pipette, temperature Thermometer, sleep Moon, mood Smile.

## Display settings (owner brainstorm, Section 14, 2026-11-14)

This replaces the earlier placeholder token table. Implemented in `src/index.css` and `src/settings/`.

| Setting | Options | Default | Implementation |
|---|---|---|---|
| Theme | Earth = Tailwind mist; Space = Tailwind slate; Moon = Tailwind zinc; Mars = neutral with a small orange hue. Auto-selected from the zone, also selectable manually | Auto | `data-theme` on `<html>`; each theme supplies the gray scale `--g-50`…`--g-950`. Mars uses Tailwind neutral lightness steps with chroma 0.004–0.022 at hue 50 |
| Mode | Dark, Light, Auto | Auto | `.dark` class. TODO: Auto should follow the habitat LED lighting system, not the clock; the link in the brainstorm is incomplete and no data source is defined. Until then Auto follows the device light/dark preference |
| Contrast | Normal (WCAG AA), High (WCAG AAA) | Normal | `data-contrast`; picks different steps of the gray scale and darker/lighter status colours. High contrast is suggested when the device reports `prefers-contrast: more`. Token contrast is measured for all 16 combinations by `src/test/contrast.test.ts` (results in `design-decisions.md`) |
| Base font size | Small, Medium, Big | Medium | `data-font-size`: 87.5% / 100% / 125% root size |
| Numbers | Monospaced font for all numbers | — | `.num` class and numeric inputs; system monospace stack |
| Colour-blind mode | Off / On; patterns alongside the three status colours | Off | `data-colorblind`; solid, diagonal-stripe, and cross-hatch strips for Normal, Attention, Escalate |

Status colours (green, yellow, red) are the tokens `--status-normal`, `--status-attention`, `--status-escalate`. Status is always shown with an icon and a text label as well.

TODO (owner): how the app learns the astronaut's condition for the "suggested" options (big text, colour-blind mode, high contrast). Today only the device contrast preference is used. TODO: where the zone comes from (now a manual setting, default Space).

## Components

| Component | States | Interaction | Accessibility |
|---|---|---|---|
| TODO: component | TODO: default/focus/error/... | TODO: behavior | TODO: label/keyboard |

## Body figure (F-04): interaction proposal (Claude, 2026-11-14) — awaiting owner approval

Owner direction (2026-11-14): an original, lightweight 2D SVG silhouette as accessible navigation; regions chest (blood pressure, heart rate), abdomen (glucose), head (sleep, mood), and whole body (temperature); several indicators may share a region; no colour may suggest organ damage or a diagnosis; keyboard access and a text equivalent.

Proposal:

1. **Place:** replaces the placeholder in the middle column of Home, above the status banners. One front view, about 240 px tall on phones.
2. **Regions:** four focusable regions with a hit area of at least 44 × 44 px: Head, Chest, Abdomen, and **Whole body** as a labeled button directly under the figure. An outline around the whole silhouette would be hard to see and to tap.
3. **Activation:** click, tap, Enter, or Space opens a small popover that lists the region's indicators. Each entry shows the latest value, its status badge, and a link to its history page. Escape closes the popover and returns focus to the region. Using the same popover for every region, including the single-indicator ones, keeps the interaction predictable.
4. **Status on the figure:** regions stay neutral, with no organ shapes and no fills. A region with items to review gets a small badge with the status icon and a count, for example "1 to review". The figure caption says: "The figure is for navigation. Badges show the status of the linked measurements, not the condition of a body part."
5. **Text equivalent:** the SVG is a `role="group"` named "Body figure: navigation to indicators". Each region is a button whose name lists its indicators and its count to review, for example "Chest: blood pressure, heart rate, 1 to review". The Indicators card on Home remains the full text navigation to all six indicators.
6. **Keyboard order:** Head, Chest, Abdomen, Whole body.

Questions for the owner:

- (a) Is the popover for every region acceptable, or should single-indicator regions open the history page directly?
- (b) Badge only (recommended), or a status-tinted outline on the region?
- (c) Whole body as a separate button (recommended), or an outline around the silhouette?

## Health communication

- Never rely on color alone for attention states. This also applies to the optional color coding (`challenge.md` O-05).
- Clearly distinguish missing, normal-for-baseline, and needs-review states. Define the labels only after science review (`science.md`).
- Show measurement units and input context.
- Mark demo and simulated data visibly.
- Explain uncertainty and avoid false precision.
- Never present unvalidated diagnostic conclusions as fact. Each guidance item shows its evidence-type label (Spaceflight evidence / General clinical reference / Team design decision / Simulated demo logic). A rule shows separate labels for its threshold basis and its action wording when they differ, per `science.md` → "Guidance policy".
- Escalation prompts name the recipient (crew medical officer or flight surgeons) and the readings that triggered them.

## Responsive / input behavior

- Supported viewports: TODO: sizes
- Keyboard: TODO: requirements
- Touch: TODO: requirements
- Reduced motion: TODO: requirements

## Design assets

- Figma link: TODO: URL or none
- Logo: owner-supplied `logo.svg` (2026-11-14), used as the favicon (`public/favicon.svg`, white in dark mode) and as the header mark (`src/components/Logo.tsx`, filled with the text colour). Recorded as TP-16 in `references.md`.
- Icons: Lucide only (TP-08). Fonts: TODO: sources (record them in `references.md`)
- Screenshots / prototypes: TODO: paths
