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
- **Non-colour status cues:** every status has its own icon and a text label; colour-blind mode adds a solid, striped, or cross-hatched strip. Since 2026-11-15, your readings are solid lines told apart by marker shape (filled circle, outlined circle, outlined square), and crew averages are dash-dot lines; the legend and tooltip show the same line samples. "Not evaluated" and "No measurement" have neutral, dashed badges and no status colour.
- **Text alternatives:** each chart has an accessible name and is followed by a data table with the same values (caption, column headers, row headers).
- **Layout:** checked in headless Chrome at 500 px and desktop width (Home, history page; Earth, Moon, Mars; light and dark; high contrast; big text). A true 320 px render of the seeded pages was not captured.

Automated checks re-run on 2026-11-15: `npm test` 19 files, 340 tests passed (includes `contrast.test.ts` and `keyboard.test.tsx`). The manual checks above have still not been done.

## What changed during the hackathon

From the commit history (2026-11-14 09:00 to 2026-11-15) and the owner's reviews recorded in `progress.md`. Each change was decided by the owner. The reasons are as stated at the time.

| When | Change | Reason | Trade-off |
|---|---|---|---|
| 11-14 midday | History view per indicator with chart, table, baseline, and rules; no reference bands (D-01) | Show trends without implying astronaut ranges | Less at-a-glance context |
| 11-14 midday | Rule audit (OD-14–OD-16): oral-only temperature rules, forehead readings unclassified, single PHQ-2 cutoff, RULE-17 split | Don't classify readings the sources don't cover | More readings end up "Not evaluated" |
| 11-14 afternoon | Home from three areas to six separate cards, body-figure area, avatar card (Section 16) | Each indicator visible at once; profile out of the way | Less room for the figure on mid widths |
| 11-14 afternoon | Body figure replaced by the owner's 3D/2D body map and pain log; reports saved and exported as JSON | A clickable figure that records what the astronaut feels, for the flight surgeon | Pain logs are not linked to statuses |
| 11-14 evening | Settings in cards with units and date formats; fixed-width pages with an outline Back button | Consistency; units for different users | Home is the only full-width page |
| 11-14 evening | Cards say "Measured … ago"; badges only say the tier, other wording goes next to them | One badge vocabulary | Longer card text |
| 11-15 morning | Usability review: demo relative to today with two Attention readings, multi-indicator Log reading dialog, "Due" chip, Check-ins graph, demo controls moved to Settings | The demo showed stale data; logging six readings took six dialogs; Clear data was one click from Reports | Due and status are separate, so a card can say "Due" and "Normal" together |
| 11-15 morning | Consistency review: monospaced numbers with units in the normal font; "Demo data" chip opens the notice | Readable values; one place for the demo notice | — |
| 11-15 morning | Crew Average Comparison: summary, dash-dot crew line, table columns; own lines told apart by markers | Mission context without changing status; not colour alone | A small simulated cohort; more chart elements |
| 11-15 morning | Shared `PageLayout`, 1 : 2 : 1 Home grid, paginated history with delete confirmation, Log reading in the header, confirmation dialogs for Clear data and Load demo data | Consistency and safety for destructive actions | Extra step before deleting |
| 11-15 morning | UX copy review: action first with a "Why?" layer, no internal codes, one wording for contacting the flight surgeon | Easier to act under time pressure | Evidence is one click away |
| 11-15 afternoon | Optional sex attribute for evidence notes; spaceflight hazards on indicator pages and About; three simulated pain logs in the demo | Context from the evidence; a non-empty body map in the demo | Background only, no rule changed |

## Open questions

Untested assumptions and usability questions. None has been tested with users.

- Do astronauts read the action and act on it without opening "Why?"? Is "Attention" clear enough without a stronger word?
- Is a "Due" chip next to a "Normal" badge understood, or read as a conflict?
- Does the crew average reassure falsely or worry needlessly, even with the "not a reference range" text?
- Is the 3D body map usable with gloves, on a touch screen, or on small screens? Do keyboard users find the 2D path?
- Is a manual daily check-in of six indicators realistic within the mission schedule?
- Are the 36 px targets and the shadcn default sizes large enough for touch use in flight?
- Is the app usable with a screen reader and with keyboard only in a real browser? Not tested.
- Do the zone themes (Earth, Space, Moon, Mars) help, or are they decoration? How should "Auto" mode and suggested settings learn the astronaut's condition? (Owner decision open, `design.md` → "Display settings".)
- Are the region-to-indicator links on the body map right? (Owner confirmation open, `progress.md`.)
