# Official NASA Space Apps submission draft

> Transfer the relevant sections to the official Project tab. Verify exact required fields, formats, length limits, and deadlines in the live 2026 submission form. This file is not an official form.
>
> **Responsibility:** This is the canonical submission text. Other documents provide the sources: requirements (`challenge.md`), evidence (`scientific-foundations.md`), citations (`references.md`), data and disclaimer (`data-and-limitations.md`), and design rationale (`design-decisions.md`).

## Official form field → section map (2026 guide, `challenge.md` "Form fields")

| Official field | Draft section(s) below |
|---|---|
| Project name | Project title |
| High-level summary | Project summary (+ tagline) |
| Project demo link (format chosen: slides, ≤7 including title/intro) | Project links → Presentation |
| Final project link | Project links → Live demo / Source code |
| Project details | Problem and intended users; How the solution works; Demonstration scenario; Scientific and UX decisions; Limitations |
| NASA data and resources used (≥1 required for Global Awards) | NASA and partner-agency resources used |
| Space Agency Partner data and resources | NASA and partner-agency resources used |
| References (all code, text, images) | Originality and attribution (+ `references.md`) |
| AI-use question | Use of AI tools |

## Project title
TODO: final title

## Tagline / one-sentence summary
TODO: one sentence

## Team and challenge
- Team: haoma
- Challenge: Create Health Monitoring Software for Astronauts on Space Missions
- Event: Local Event, Berlin. TODO: official local event name
- Team members: Hossein Shahyari (solo team)

## Project summary
TODO: 100–200 words: problem, user, solution, implemented capabilities, and demonstrated benefit. Do not overclaim.

## Problem and intended users
TODO: What astronauts need to assess; what decisions the prototype supports; mission constraints.

## How the solution works
TODO: User inputs → interpretation/context → visualization → guidance/escalation. Only describe implemented behavior.

## Demonstration scenario
TODO: Brief fictional mission story and actual workflow. Explicitly label simulated readings.

## NASA and partner-agency resources used
| Resource | URL | How it informed the product | Used as data or reference? |
|---|---|---|---|
| TODO: source | TODO: url | TODO: use | TODO: data / reference |

## Scientific and UX decisions
TODO: Explain two or three major decisions, with links to evidence.

## Originality and attribution
TODO: State what was created during the event; identify pre-existing/open-source materials, AI-assisted development, and third-party assets according to official rules.

## Use of AI tools

This section is required (`challenge.md` E-R6). Source: `references.md` → AI assistance.

TODO: Describe how Claude Code and any other AI tools were used during development.

## Limitations
TODO: Medical validity, simulated data, non-diagnostic status, unimplemented capabilities, testing limitations.

## Project links
- Live demo: TODO: url
- Source code: TODO: url
- Video: TODO: url
- Presentation: TODO: url
- Documentation: TODO: url

## Final submission checks
- [ ] Project title and summary are final
- [ ] Correct challenge and team selected
- [ ] Live demo works in private/incognito browser
- [ ] No credentials required to explore demo
- [ ] Repository and video links are public
- [ ] NASA/partner sources cited accurately
- [ ] Simulated data clearly disclosed
- [ ] Third-party licenses and attribution included
- [ ] Apache-2.0 LICENSE file present (`challenge.md` E-R7)
- [ ] AI tool usage described; AI-generated code/data acknowledged in text and metadata; AI visuals watermarked (E-R6, E-R18)
- [ ] Demo deck has ≤7 slides including title/intro (E-R11), in English, showing team name, members, and challenge (E-R13); public link works without login
- [ ] All content in English; video has English subtitles if needed (E-R12)
- [ ] At least one NASA data source or resource used and listed (E-R14)
- [ ] References field lists all external code, text, and images (E-R15)
- [ ] No NASA logos/branding; no likeness of anyone under 18 (E-R9, E-R18)
- [ ] Both checkboxes ticked: Terms/Privacy and "original work" (E-R16)
- [ ] No `TODO:` left in submission-facing files (`grep -rn "TODO:" README.md docs/submission.md`)
- [ ] Official form requirements and limits checked
- [ ] Submission completed and confirmed before the deadline: Sunday 2026-11-15, 23:59 CET (Berlin Local Event, T-1)
