# Feature specifications

**Responsibility:** Owner-provided feature specifications for Phase B. One file per feature: `F-NN-short-name.md`, with the ID from `product.md`. A spec with `Status: Approved` authorizes implementation of that feature only (`implementation.md` → Phase B).

Specs may be partial. Claude implements what is specified, asks only about ambiguities that materially affect the outcome, and does not invent missing product decisions; it uses neutral placeholders and lists them in the Checkpoint B report.

## Template

Copy this into a new file. All sections are optional except Objective, Acceptance criteria, and Status.

```markdown
# F-NN — <feature name>

**Status:** Draft | Approved  ·  **Priority:** P0 | P1 | P2  ·  **Addresses:** <challenge.md IDs>

## Objective
## User problem and expected outcome
## User flow
## Functional requirements
## UI layout / Figma references
## Interaction behavior
## Component states
(default / empty / loading / error / success / disabled …)
## Edge cases
## Accessibility requirements
## Health content
(Rule IDs from scientific-foundations.md; only `Approved` rules may drive behavior)
## Acceptance criteria
- [ ] …
## Out of scope for this feature
```
