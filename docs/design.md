# UX and design specification

**Responsibility:** How the UI should look and behave: principles, information architecture, tokens, components, health-communication rules, and responsive/input behavior. The user and journey are defined in `product.md`. The rationale for design choices and accessibility test results go in `design-decisions.md`.

## Design intent

- Audience and primary task: see `product.md`.
- Design principles: TODO: 3–5 principles

## Information architecture

TODO: screens / navigation hierarchy (screens are listed in `product.md`)

## Design tokens

The owner defines the values (visual direction). During Phase A, Claude implements these tokens as CSS variables with **neutral placeholder values**, to be replaced when the owner specifies them. Placeholders are not design decisions.

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | TODO: hex | Page background |
| `--color-text` | TODO: hex | Primary text |
| `--color-accent` | TODO: hex | Interactive accent |
| `--space-1` | TODO: value | Spacing scale |
| `--radius-md` | TODO: value | Cards and controls |
| `--font-body` | TODO: font stack | Main text |

**Phase A implementation (2026-11-14).** `--color-bg`, `--color-text`, `--color-accent`, `--space-1`, and `--font-body` are defined in `src/index.css` with neutral placeholder values (white, near-black, near-black, 0.25rem, system font stack), and the shadcn/ui variables derive from them (`--background`, `--foreground`, `--primary`, Tailwind spacing, `--font-sans`). `--radius-md` is produced by the shadcn scale as `--radius` × 0.8, so change `--radius` (placeholder 0.625rem). Naming note: Tailwind reserves the `--color-*` namespace and shadcn already uses `--accent` for hover surfaces. The current names work, but TODO: owner to confirm the token names or adopt the shadcn names when the visual direction is set.

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
