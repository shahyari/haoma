# UX and design specification

**Responsibility:** How the UI should look and behave: principles, information architecture, tokens, components, health-communication rules, and responsive/input behavior. The user and journey are defined in `product.md`. The rationale for design choices and accessibility test results go in `design-decisions.md`.

## Design intent

- Audience and primary task: see `product.md`.
- Design principles: TODO: 3–5 principles

## Information architecture

Owner brainstorm Section 16 (2026-11-14):

- **Header:** the logo (with the name "haoma") links to Home on the left. The avatar on the right opens the **avatar card**, which holds the fictional profile, indicators to review, the demo-data notice, "Load simulated demo history" (when empty), and the links to **Settings** and **About**. A "Demo data" chip next to the avatar replaces the demo disclaimer on the main screen. There is no separate navigation bar.
- **Home:** six separate indicator cards (Heart rate, Blood pressure, Blood glucose, Body temperature, Sleep, Mood) in a left column, the body-figure area in the middle, and the status banners and the RULE-30 reminder in a right column (owner, 2026-11-14). Below 1280 px the banners move under the cards and the figure; on narrow screens the order is cards, figure, banners. Home and the indicator pages stretch to the full screen width; **Settings keeps the earlier fixed width** (max 1024 px, centered; owner, 2026-11-14).
- **Indicator card:** icon and name; latest value; date and time · input context (method, device or rest state) · provenance; today's check-in state ("Checked in today" / "Not yet measured today"), which replaces the separate check-in card; PHQ-2 screening state on the Mood card; the standard status badge, left-aligned at its normal size (owner, 2026-11-14). Device names are not recorded; the card shows the input context instead (owner, 2026-11-14). The whole card links to the indicator's history page.
- **Status label:** the green tier reads "Normal" (was "Within reference"). "Not evaluated" and "No measurement" stay neutral and distinct.
- **History entries are editable** (owner, 2026-11-14): each table row has an Edit button that opens the entry form with the stored values. The measurement time stays the same; the edited entry becomes a manual entry marked "(edited)" and is re-evaluated. A PHQ-2 is edited by answering both items again, because only the total is stored.
- **Indicator icons** (Lucide, approved by the owner 2026-11-14; blood pressure follows the owner's example): heart rate HeartPulse, blood pressure Droplet, glucose Pipette, temperature Thermometer, sleep Moon, mood Smile.

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

## Body map (F-04), owner prototype (2026-11-14)

The owner created the body map in the Claude app (`body-map.html`) and asked for it in the Home body-figure area to save reports of pain and issues. It replaces the earlier navigation proposal (chest, abdomen, head, whole body → indicators), which is not built.

- **3D view** (default when WebGL is available): drag to rotate, Shift-drag or right-drag to pan, scroll or pinch to zoom, click to add a pain point; Front, Back, L, R presets; Zoom and Reset buttons. Numbered markers sit on the surface with leader labels; markers hidden behind the body are dimmed.
- **2D view:** front and back outlines split into named regions, plus 12 organs on the front. Every region and organ is a button reachable with Tab; Enter or Space adds a point. This is the keyboard path, and it is used automatically when WebGL is missing.
- **Pain log** (beside the stage on wide containers, below it on narrow ones): points, max and average intensity; each point with number, region, character, surface (front, back, or organ), time, intensity bar, and note; actions Show on body, Edit, Delete; Copy JSON; Clear all with a confirmation step.
- **Dialog** (app dialog component): region as the title, intensity 1–10 (number keys work; 0 = 10), character chips (Aching, Sharp, Throbbing, Burning, Cramping, Tingling, Pressure), note. Editing also offers Delete.
- **Integration changes from the prototype (Claude):** the white-on-black HUD is mapped to theme tokens, so it follows the theme, light or dark mode, and contrast settings. The panel and dialog use the app's components. The prototype's Google Fonts are not loaded; the app fonts are used. Pulse animations are off with reduced motion. Reports are stored with the app's data, not under a separate key.
- **Wording:** "Pain log · self-reported, not a diagnostic tool". Organ names describe where the person points; nothing is interpreted, and no status or rule uses the reports.

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
