# haoma — Astronaut Health Self-Assessment

> **Status: in development** during the NASA Space Apps Challenge 2026 hackathon (November 14–15, 2026). The technical foundation is in place; product screens are not built yet. Development started at the event start, in line with the rule that teams may not begin working on challenges before the hackathon.

**Challenge:** [Create Health Monitoring Software for Astronauts on Space Missions](https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/)
**Team:** haoma
**Participants:** Hossein Shahyari
**Event:** Local Event, Berlin

## About

The official challenge asks teams to build health monitoring software that gathers health indicators and enables astronauts to evaluate and act on the status of their health during long-duration space missions. haoma will be a web-based self-assessment prototype for that challenge.

haoma is TODO: one-sentence description of what the built product actually does (fill after implementation).

**Safety statement:** haoma is a hackathon prototype for education and demonstration. It is not a medical device, is not clinically validated, and does not replace a flight surgeon or other medical professional. Demonstration data are fictional unless specifically identified otherwise.

This project is not endorsed by NASA.

## Documentation

Each document has one responsibility. `CLAUDE.md` routes development tasks to them.

| Document | Purpose |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Claude Code instructions: phase gate, routing, non-negotiables |
| [`docs/challenge.md`](docs/challenge.md) | Official challenge text, event rules, requirements matrix |
| [`docs/product.md`](docs/product.md) | Users, journey, MVP features, definition of done |
| [`docs/science.md`](docs/science.md) | Scientific integrity and evidence policy |
| [`docs/scientific-foundations.md`](docs/scientific-foundations.md) | Indicators, evidence, interpretation rules (authoritative) |
| [`docs/references.md`](docs/references.md) | Bibliography (`REF-NN`), third-party licenses, AI disclosure |
| [`docs/design.md`](docs/design.md) | UX specification and design tokens |
| [`docs/design-decisions.md`](docs/design-decisions.md) | Design rationale and accessibility results |
| [`docs/architecture.md`](docs/architecture.md) | Stack decisions, data model, commands, deployment |
| [`docs/implementation.md`](docs/implementation.md) | Roles, phases, checkpoints, Phase A steps, priorities |
| [`docs/specs/`](docs/specs/README.md) | Owner-provided feature specifications (Phase B) |
| [`docs/progress.md`](docs/progress.md) | Current status and handoff log |
| [`docs/data-and-limitations.md`](docs/data-and-limitations.md) | Data provenance, privacy, limitations, canonical disclaimer |
| [`docs/submission.md`](docs/submission.md) | Canonical NASA submission draft |
| [`docs/presentation-outline.md`](docs/presentation-outline.md) | Demo slide deck outline (official demo format, ≤7 slides) |
| [`docs/demo-script.md`](docs/demo-script.md) | Inactive: 30-second video script, kept as a fallback |
| [`.claude/skills/verify/`](.claude/skills/verify/SKILL.md) | Claude Code verification skill |

Unfinished items are marked `TODO:`.

---

The sections below are completed during the hackathon.

## Explore

- **Live app:** https://haoma-mu.vercel.app (foundation build with placeholder pages)
- **Presentation (official demo):** TODO: slides URL
- **NASA project page:** TODO: project page URL

## Problem

TODO: 2–4 sentences describing the astronaut self-assessment problem and why it matters. Cite sources from `docs/references.md`.

## Solution

TODO: Describe implemented functionality, not planned features.

## Demo scenario

TODO: Describe the fictional astronaut, mission context, input, app response, and outcome. State that scenario data are simulated.

## Features actually implemented

- TODO: feature 1
- TODO: feature 2
- TODO: feature 3

## Scientific grounding

TODO: Summarize the NASA Human Research Program and other authoritative sources actually used. See [`docs/scientific-foundations.md`](docs/scientific-foundations.md).

## Data and limitations

TODO: Describe user-entered inputs, simulated historical records, thresholds, and known limitations. See [`docs/data-and-limitations.md`](docs/data-and-limitations.md).

## Run locally

Requires Node.js 26.

```sh
npm install
npm run dev
```

Other commands (tests, lint, build) are listed in [`docs/architecture.md`](docs/architecture.md) → Commands.

## Technology

TODO: actual stack and dependencies.

## Credits, sources, and licenses

TODO: Link to [`docs/references.md`](docs/references.md). List third-party code, assets, and data, and their licenses.

## License

Original project code is licensed under the [Apache License 2.0](LICENSE). Third-party components keep their own licenses (see [`docs/references.md`](docs/references.md)).
