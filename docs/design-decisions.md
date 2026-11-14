# UX and product design decisions

**Responsibility:** A submission-facing log of why design choices were made, what accessibility testing was actually done, and how the design changed during the hackathon. The user and journey are in `product.md`; the specification is in `design.md`.

## Decision log

| ID | Decision | User problem | Design approach | UX principle or evidence (REF ID) | Trade-off | Validation performed |
|---|---|---|---|---|---|---|
| D-01 | No reference ranges drawn on history charts; approved rules listed below the chart instead | Shaded "normal" bands would look like personal or astronaut-specific ranges, and several rules depend on symptoms, context, or a baseline that a band cannot show | Chart shows measured values and the personal baseline only; the rules section is labeled as reference information | `science.md` (do not present general-population ranges as astronaut rules) | Less at-a-glance context on the chart | Approved by the owner 2026-11-14 |

## Accessibility (tested results only)

Tested 2026-11-14. This is not a full WCAG audit; no WCAG AA or AAA conformance is claimed.

- **Contrast (automated, tokens only):** `src/test/contrast.test.ts` resolves the colour tokens for all 16 combinations (4 themes × light/dark × normal/high contrast) and computes WCAG 2 ratios. Text pairs: foreground, muted text, primary button text, and error text on their backgrounds, and text on the three status surfaces. Non-text: status icon colours, input borders, focus ring, chart lines. All pass the targets: text ≥ 4.5:1 at normal contrast (lowest 6.01:1, Earth dark) and ≥ 7:1 at high contrast (lowest 8.37:1); non-text ≥ 3:1 (lowest 4.45:1, input border, Earth light). Not measured: text over the colour-blind pattern strips (the strip sits beside text, not under it), placeholder text, chart axis labels, hover states, or rendered pages. Out-of-gamut colours are clipped in the calculation.
- **Keyboard (automated, jsdom):** `src/test/keyboard.test.tsx`: Tab reaches the indicator links on Home and Enter opens one; the entry dialog opens with Enter, takes focus, closes with Escape, and returns focus to "Add entry" (a bug found and fixed by this test); radio options and checkboxes are operable with Tab and Space; an entry can be saved with Enter; the scrollable data tables are focusable. Not tested: a manual pass in a real browser, the Recharts keyboard layer, and screen readers.
- **Non-colour status cues:** every status has its own icon and a text label; colour-blind mode adds a solid, striped, or cross-hatched strip. The second chart series (diastolic) is dashed with hollow dots. "Not evaluated" and "No measurement" have neutral, dashed badges and no status colour.
- **Text alternatives:** each chart has an accessible name and is followed by a data table with the same values (caption, column headers, row headers).
- **Layout:** checked in headless Chrome at 500 px and desktop width (Home, history page; Earth, Moon, Mars; light and dark; high contrast; big text). A true 320 px render of the seeded pages was not captured.

## What changed during the hackathon

TODO: Record significant iterations and their rationale.

## Open questions

TODO: Known usability questions and untested assumptions.
