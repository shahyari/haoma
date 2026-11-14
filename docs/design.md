# UX and design specification

**Responsibility:** How the UI should look and behave: principles, information architecture, tokens, components, health-communication rules, and responsive/input behavior. The user and journey are defined in `product.md`. The rationale for design choices and accessibility test results go in `design-decisions.md`.

## Design intent

- Audience and primary task: see `product.md`.
- Design principles: TODO: 3–5 principles

## Information architecture

TODO: screens / navigation hierarchy (screens are listed in `product.md`)

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
- Icons / fonts / licenses: TODO: sources (record them in `references.md`)
- Screenshots / prototypes: TODO: paths
