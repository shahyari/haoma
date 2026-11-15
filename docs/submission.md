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
HAOMA - Health Assessment, Observation & Mission Assistance (owner, 2026-11-15)

## Tagline / one-sentence summary
A mission-aware health companion for astronauts.

## Team and challenge
- Team: haoma
- Challenge: Create Health Monitoring Software for Astronauts on Space Missions
- Event: Local Event, Berlin. TODO: official local event name
- Team members: Hossein Shahyari (solo team)

## Project summary
HAOMA is a web prototype that helps astronauts check the six health indicators named in the challenge: heart rate, blood pressure, blood glucose, body temperature, sleep, and mood. Each reading is checked against evidence-labeled rules and the astronaut's own baseline, then shown as Normal, Attention, or Escalate, with what to do first. In space, early signs are easy to miss and care is far away. HAOMA makes self-assessment quick, consistent, and honest about its limits.

(75 words, 475 characters; shortened on 2026-11-15, the details moved to "Project details". Drafted with AI assistance from the implemented features, to be disclosed in the AI-use field.)

## Project details (portal text)

Covers the portal's "Project details" field: what it does, benefits, impact, tools, creativity, and factors considered. Drafted with AI assistance from the implemented features.

What it does and how it works

Daily check-in. "Log reading" opens one dialog with a tab per indicator, so an astronaut can log one or more readings at once. The app records the context that changes what a number means: at rest or after activity, fasting or not, oral or forehead thermometer, and how sleep was measured.

Evaluation. Each reading is checked against 31 rules approved by the team. Every rule carries its sources and an evidence label: Spaceflight evidence, General clinical reference, Team design decision, or Simulated demo logic. After five readings, the app compares new readings with the astronaut's personal baseline (the median of the last seven). A reading that no rule covers is shown as "Not evaluated", never as Normal.

Guidance. Each result says what to do first, for example "Re-measure after rest and watch the trend" or "Tell the flight surgeon at your next contact". A "Why?" section shows the rule, its source, and the type of evidence. The mission phase (in flight, approaching landing, post-landing) adds landing-specific reminders.

History and context. Each indicator has a chart and a table that can be edited and paged. A 3D/2D body map records self-reported pain and saves it as a report for the flight surgeon; it is never interpreted. An optional crew comparison shows the average of the other crew members on the same mission day, comparing like with like, as context only. It never changes a status.

Benefits and intended impact

On long missions, care is far away and communication is delayed. HAOMA aims to make daily self-assessment take minutes, to apply the same rules every time, and to make it clear when to involve the flight surgeon. Every result can be traced to its source, so astronauts and medical teams can see why the app said what it said.

Tools

React and TypeScript with Vite, Tailwind CSS, shadcn/ui (Radix), Lucide icons, and Recharts. The body map uses a small WebGL and SVG engine without extra libraries. Tested with Vitest and Testing Library (330 automated tests), checked with oxlint and Prettier, hosted on Vercel, code on GitHub. Development was assisted by Claude Code (AI), as disclosed in the repository.

What makes it creative

Every rule shows its evidence, so the app is open about what is and isn't known for astronauts. The interface theme can follow the mission zone (Earth, Space, Moon, Mars). The body map lets astronauts point to where it hurts instead of describing it. The crew comparison gives mission context while protecting privacy.

Factors we considered

Safety: the app never diagnoses, and urgent results name who to contact and when. Evidence: general-population ranges are labeled as not validated for astronauts. Measurement context: readings taken in different ways are kept apart, for example oral and forehead temperatures, or resting and after-activity heart rates. Privacy: data stays in the browser, and the crew comparison shows only averages from at least three people. Accessibility: high contrast, text size, assistive patterns so status never depends on colour, keyboard use, and screen-reader labels. Honesty: the astronaut, crew, and demo data are fictional and labeled as simulated.

Live app: https://haomaho.vercel.app
Source code: https://github.com/shahyari/haoma

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
- Live demo: https://haomaho.vercel.app
- Source code: https://github.com/shahyari/haoma (checkpoint tag `spaceapps-checkpoint-1`)
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
