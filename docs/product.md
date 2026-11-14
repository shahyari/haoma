# Product definition and MVP

**Responsibility:** Our proposed product: users, the primary journey, MVP features with acceptance criteria, screens, demo stories, and the definition of done. These are our choices, not official requirements. Each feature links to the official requirement IDs in `challenge.md` that it addresses.

## Product statement

haoma helps TODO: primary user to TODO: primary job during TODO: mission context by TODO: core approach.

## Users and operating context

This is the single home for the user definition and the journey. Other documents link here.

- Primary user: **the astronaut**, self-assessing during a mission (owner decision 2026-11-13).
- Secondary user: TODO: if any (e.g., crew medical officer or flight surgeon as the escalation recipient, not as a user of the app)
- Environment and constraints: TODO: offline? shared device? time pressure? stress? input device?
- Assumptions requiring validation: TODO: list

## Primary user journey

1. TODO: entry point
2. TODO: health self-assessment input
3. TODO: review of results
4. TODO: history / trends
5. TODO: appropriate follow-up or escalation

## Indicator scope

Owner decision 2026-11-13. Officially, the statement requires that the software "gathers health indicators" (R-01) but names these six only as examples (E-01). Our MVP adopts all six. Evidence for each is tracked in `scientific-foundations.md`.

| Indicator | Official status | haoma MVP |
|---|---|---|
| Blood pressure | Example (E-01) | In scope |
| Heart rate | Example (E-01) | In scope |
| Blood glucose ("blood sugar") | Example (E-01) | In scope |
| Body temperature | Example (E-01) | In scope |
| Sleep duration ("daily sleep hours") | Example (E-01) | In scope |
| Mood | Example (E-01) | In scope |

## Official requirements vs. optional enhancements

- **Officially required (Core, `challenge.md`):** gather health indicators (R-01); let astronauts evaluate and act on their health status (R-02); a visual tool for self-assessment (R-03); guidance on treatments and health improvements (R-04), delivered under the approved guidance policy in `science.md`.
- **Suggested by the statement:** varied input methods (S-01), use of NASA HRP and agency resources (S-02, which E-R14 makes mandatory for Global Awards), the guiding questions (S-03a–e), clear and interactive presentation (S-04), a clickable human figure (S-05).
- **Optional enhancements:** different environments (O-01), mission-routine prompts (O-02), gamification (O-03), dynamic charts (O-04), color coding (O-05), instructions and explanations (O-06). Owner priorities are below; the other O-items are undecided.

## MVP features and priorities

Priorities were set by the owner on 2026-11-13 and are subject to refinement. A priority is **not** authorization to implement: each feature needs an approved spec in `docs/specs/` or explicit owner authorization (`implementation.md` → Phase B). Details (user value, acceptance criteria) live in each spec.

| ID | Feature | Priority | Addresses (challenge.md, proposed) | Spec | Depends on |
|---|---|---|---|---|---|
| F-01 | Daily health self-assessment (six indicators) | P0 | R-01, R-05, E-01 | TODO | Phase A models and storage |
| F-02 | Health overview | P0 | R-02, R-03 | TODO | F-01 |
| F-03 | Historical trends | P0 | R-03, O-04 | TODO | F-01 |
| F-05 | Evidence-backed explanations and escalation guidance | P0 | R-02, R-04, S-03, O-06 | TODO | `Approved` entries in `scientific-foundations.md` |
| F-06 | Fictional astronaut demo scenarios | P0 | Demo and judging (E-R11) | TODO | F-01; `data-and-limitations.md` |
| F-04 | Interactive body map | P1 | S-05 | TODO | F-02 |
| F-07 | Mission routine reminders | P2 | O-02 | TODO | F-01 |
| F-08 | Gamification | P2 | O-03 | TODO | F-01 |

## Owner brainstorm, 2026-11-14 (Sections 13–15)

Source: the owner's brainstorm file. This table tracks what is built; details that are still undecided are listed in `progress.md`.

| Item | Feature | State |
|---|---|---|
| Home: three areas (indicators; body figure with status banners; profile card and tasks card) | F-02 | Built, with placeholders for the figure, profile, and tasks |
| Six indicators with latest value and status; open an indicator to enter a value | F-01, F-02 | Built |
| Yellow/red banner with icon and wording, expandable to instructions and actions | F-05 | Built (RULE-01–RULE-30, evidence labels, REF IDs). Pointing at a body part waits for the figure |
| Average status, trend, and charts per indicator (Earth values, mission average, crew average, standard range, zone-based values) | F-03 | Not built |
| Comparison with other crew members (same time window and total average) | F-03, F-06 | Not built; needs fictional crew data |
| Clickable human figure, colour-coded per body part | F-04 | Not built; needs artwork and a body-part mapping |
| Profile card (avatar, XP and level, name, role, mission, health score) | F-06, F-08 | Not built; needs definitions |
| Tasks card (assessments due from the schedule) | F-07 | Not built; needs the schedule |
| Reading external sensors and wearables | — | Not built; simulation only is possible in this prototype |
| Display settings (Section 14) | — | Built (`design.md` → "Display settings") |
| Roles: Director, Admin, User (Section 15) | — | Not built; conflicts with approved documents (`progress.md`) |

## Explicitly out of scope

- Unvalidated diagnostic conclusions and treatment instructions without `Approved` evidence (guidance policy in `science.md`)
- Camera-based physiological measurement (owner decision 2026-11-13). The statement suggests camera input (S-01) but does not require it.

## Screen inventory

| Screen | Main action | Required states | Accessibility considerations |
|---|---|---|---|
| TODO: screen | TODO: action | TODO: empty/loading/error/success | TODO: keyboard/labels |

## Demo stories

All demo profiles are fictional and all demo measurements are simulated. Record their provenance in `data-and-limitations.md`.

- Scenario A: TODO: fictional crew member, mission, measurement, interpretation, result
- Scenario B: TODO: secondary story

## Definition of done

- [ ] Every Core requirement in `challenge.md` has evidence in the app or the submission.
- [ ] The core journey works end to end without sign-in.
- [ ] Data source and simulation labels are visible.
- [ ] Critical interactions work by keyboard.
- [ ] No unsupported medical claims; only Approved rules are active.
- [ ] The app builds and the deployed demo is accessible.
