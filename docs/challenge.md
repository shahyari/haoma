# Official challenge — source of truth

**Responsibility:** Verbatim official challenge text, official event and submission rules, and the official requirements matrix. Our own product features live in `product.md`, not here.

**Challenge:** Create Health Monitoring Software for Astronauts on Space Missions
**Official URL:** https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/
**Challenge video:** https://www.youtube.com/watch?v=RERG3gEmdC8
**Difficulty / skills (as listed):** Intermediate · Human Exploration, Software, Space Exploration
**Page first published / last updated (per site metadata):** 2026-09-17 / 2026-10-29
**Copied/verified on:** 2026-11-12 (statement); 2026-11-13 (Resources tab, submission guide, judging guide)
**Resources tab:** Published 2026-11-13. Captured under "Official resources" below.

## Verbatim challenge statement

> Text copied from the official page on 2026-11-12. Headings and list structure are preserved; formatting was converted from HTML to Markdown. Do not edit the wording.

### Summary

Long-duration missions expose astronauts to space radiation, isolation and confinement, altered gravity, and a hostile closed environment, which can bring immune changes, bone loss, cardiovascular events, and behavioral health problems. On long missions, astronauts carry much of the responsibility for spotting these changes in themselves. Your challenge is to build a health monitoring software that gathers health indicators and enables astronauts to evaluate and act on the status of their health.

### Background

With rising investment in spacecraft technology and research, space missions have become more ambitious. NASA's Artemis program recently accomplished a crewed lunar flyby, and NASA and others have plans to send humans to Mars in the future. With increasingly longer missions, astronauts will be more exposed to the hostile space environment, which brings both physical and mental health risks.

NASA's Human Research Program has mapped the five hazards of human spaceflight, which are space radiation, isolation and confinement, distance from Earth, gravity fields, and hostile closed environments. These hazards can contribute to health problems such as immune system changes, bone density loss, cardiovascular events, inadequate nutrition, behavioral health conditions, and others. Astronauts must be capable of making health assessments on themselves during a mission, to prevent and treat health problems that may arise. Some useful health indicators are blood pressure, heart rate, blood sugar, body temperature, daily sleep hours, and mood.

### Objectives

Your challenge is to create a visual tool that helps astronauts assess their own health during space missions and provides guidance on treatments and health improvements. You may consider gathering data from the user through any kind of input—keyboard text, mouse clicks, or camera images, for example. Any kind of data can be used, as long as it represents a health indicator, such as blood sugar levels in mg/dL or ultrasound images.

You can use NASA's Human Research Program resources, along with the publicly available resources from other space agencies, to understand how spaceflight hazards affect human health, and to decide which indicators are useful and how they can support a quick assessment. Which measurements can be performed in space? Why is an exam needed? How do spaceflight hazards affect these health indicators? When might a result warrant attention from the crew or from flight surgeons on the ground? What actions can be taken to prevent a critical health condition? These are questions worth considering as you develop your solution.

User interface design plays an important role in presenting metrics and diagnosis clearly. You may consider taking advantage of animations and interactivity to present the information. For example, the software could display a human figure where each part of the body is clickable and displays information about its function and health status.

### Potential Considerations

*You may (but are not required to) consider the following:*

- Your tool could provide health insights for astronauts in different environments, such as a spacecraft, a space station, a rover, or a base on another planet or moon.
- Your tool could prompt astronauts to take measurements or complete specific actions from time to time as a part of the mission routine.
- Your tool could include the following features:
  - A gamification system to help astronauts engage with tasks that support their health
  - Dynamic charts that show how astronaut's health indicators change over time
  - Color coding that helps the astronaut interpret the status of a health indicator at a glance
- Do not assume that astronauts know everything about how to assess their health. Your tool could provide simple instructions and explanations covering measurements, health indicators, and risks.

*For data and resources related to this challenge, refer to the Resources tab at the top of the page. More resources may be added before the hackathon begins.*

## Requirements matrix (official text only)

Classification is based on the statement's own wording:
- **Core:** the stated challenge or objective ("Your challenge is to…").
- **Constraint:** a stated condition.
- **Suggested:** "you may consider", "you can use", "questions worth considering".
- **Optional:** listed under "may (but are not required to)".
- **Example:** the statement gives it as an example only.

"Evidence" names the feature (`product.md`) and the screen, code, or document that addresses the item. Status values: **Implemented**, **Partially addressed**, **Not implemented**, **Not applicable**. Reviewed against the code and documents on 2026-11-15. Optional and example items are not treated as mandatory.

| ID | Requirement (quoted) | Section | Class | Evidence (feature, screen, file) | Status |
|---|---|---|---|---|---|
| R-01 | "build a health monitoring software that gathers health indicators" | Summary | Core | F-01: Log reading dialog (header, every page) and Log reading on indicator pages; `src/features/entry/`, `src/domain/` | Implemented |
| R-02 | "enables astronauts to evaluate and act on the status of their health" | Summary | Core | F-02, F-05: Home cards with status badges; Home banners with the action first and "Why?"; escalation names the flight surgeon and when; `src/rules/` | Implemented |
| R-03 | "create a visual tool that helps astronauts assess their own health during space missions" | Objectives | Core | F-02, F-03, F-04: Home, indicator pages (chart, table, baseline, crew comparison), body map | Implemented |
| R-04 | "provides guidance on treatments and health improvements" | Objectives | Core | F-05: rule actions (re-measure, rest and fluids, schedule and lighting, self-care time, pre-landing fluids and compression garments, contact the flight surgeon). By policy (Q-01, `science.md` → "Guidance policy") there are no treatment instructions without `Approved` evidence; treatment decisions are escalated to the flight surgeon | Partially addressed (preventive guidance and escalation; no treatment instructions, by design) |
| R-05 | "Any kind of data can be used, as long as it represents a health indicator" | Objectives | Constraint | F-01: six indicators with units and input context (`src/domain/indicators.ts`); pain logs are self-reported and not interpreted | Implemented (constraint met) |
| S-01 | Gather data "through any kind of input—keyboard text, mouse clicks, or camera images" | Objectives | Suggested | F-01, F-04: keyboard and pointer or touch input (forms, body map). Camera input excluded by owner decision 2026-11-13 (`product.md`) | Partially addressed |
| S-02 | Use "NASA's Human Research Program resources, along with the publicly available resources from other space agencies" | Objectives | Suggested | NASA HRP pages, NASA reports, OSDR (OSD-575, OSD-370), CSA, JAXA (`references.md`, `submission.md` → "NASA and partner-agency resources used"); hazards on indicator pages and About | Implemented |
| S-03a | "Which measurements can be performed in space?" | Objectives | Suggested | `scientific-foundations.md` → "Indicator summary", column "How it's measured in space" | Implemented (documented) |
| S-03b | "Why is an exam needed?" | Objectives | Suggested | `scientific-foundations.md` → "Indicator summary" (HRP risk column); "Spaceflight hazards" section on each indicator page; `submission.md` → "Problem and intended users" | Partially addressed (risk context per indicator; no separate in-app explanation of why each exam is needed) |
| S-03c | "How do spaceflight hazards affect these health indicators?" | Objectives | Suggested | `scientific-foundations.md` → "Spaceflight hazards (RIDGE)"; indicator pages and About | Implemented (2026-11-15) |
| S-03d | "When might a result warrant attention from the crew or from flight surgeons on the ground?" | Objectives | Suggested | F-05: Attention and Escalate rules RULE-01–RULE-31 (`scientific-foundations.md`); escalation wording names the flight surgeon and when (`design.md` → "UX copy") | Implemented |
| S-03e | "What actions can be taken to prevent a critical health condition?" | Objectives | Suggested | `scientific-foundations.md` → "Indicator summary" (Preventive actions); rule actions shown in the app (for example RULE-19 schedule and lighting, RULE-30 pre-landing fluids and compression garments) | Implemented |
| S-04 | "presenting metrics and diagnosis clearly"; consider "animations and interactivity" | Objectives | Suggested | F-02, F-03, F-04: badges with icon and text, banners with a "Why?" layer, interactive charts with tooltips and data tables, 3D/2D body map. The app gives no diagnosis, by policy (Q-01) | Implemented (metrics and status; no diagnosis, by design) |
| S-05 | "display a human figure where each part of the body is clickable" | Objectives | Example | F-04: body map, where every 3D surface point and every 2D region or organ is clickable and links to related indicators. It records self-reported pain and does not show function or health status per body part | Partially addressed |
| E-01 | Indicators: "blood pressure, heart rate, blood sugar, body temperature, daily sleep hours, and mood" | Background | Example (officially only examples; all six adopted as MVP scope by owner decision, `product.md`) | All six in F-01 to F-03; evidence in `scientific-foundations.md` | Implemented |
| O-01 | Insights for different environments (spacecraft, station, rover, planetary/lunar base) | Potential Considerations | Optional | Settings → Demo controls: mission zone (Earth, Space, Moon, Mars) sets the theme only; mission phase (in flight, approaching landing, post-landing) adds RULE-26 and RULE-30. No zone-specific reference values (no supported source, `product.md`) | Partially addressed |
| O-02 | Prompt measurements/actions "as a part of the mission routine" | Potential Considerations | Optional | "Due" chips for indicators not measured today; PHQ-2 due every 14 days; RULE-30 pre-landing reminder. No schedule or notifications (F-07 not implemented) | Partially addressed |
| O-03 | Gamification system | Potential Considerations | Optional | F-08 deferred by the owner (XP and levels, 2026-11-14) | Not implemented |
| O-04 | Dynamic charts of indicators over time | Potential Considerations | Optional | F-03: history chart per indicator with tooltips, legend, optional crew-average line, and data table | Implemented |
| O-05 | Color coding of indicator status | Potential Considerations | Optional | Status colours, always with an icon and text, plus optional assistive patterns (`design.md` → "Health communication") | Implemented |
| O-06 | Simple instructions and explanations covering measurements, indicators, and risks | Potential Considerations | Optional | Entry hints (blood pressure, heart rate, glucose, sleep), method and context choices, the "Why?" layer, rules list with sources, hazards per indicator, About page | Partially addressed (not every indicator has a measurement instruction) |

## Official event and submission rules (verified excerpts)

| ID | Rule (quoted or closely paraphrased) | Source |
|---|---|---|
| E-R1 | The event starts "on November 14, 2026" at each location. You must be registered before the start time. | [Participant Terms & Conditions](https://www.spaceappschallenge.org/legal/) |
| E-R2 | "Teams are not allowed to begin working on the challenges prior to the hackathon." | [Participant FAQs](https://www.spaceappschallenge.org/resources/participant-faqs/) |
| E-R3 | Registration stays open "through the end of the hackathon on November 15." | Participant FAQs |
| E-R4 | Solutions "shall directly address one or more of the NASA Space Apps Challenge statements". | Participant Terms & Conditions |
| E-R5 | Submit through the team's project page on spaceappschallenge.org to be eligible for Global Judging. The Project Submission Guide becomes available on November 13. | Participant FAQs |
| E-R6 | "Each team's project submission must include a description of how SI tools were used during the development of their project." The FAQ defines "SI" (its term for AI) to include large language models and code generation tools. | Participant FAQs |
| E-R7 | Original content must be "freely available without restriction or is licensed as open source as defined by the Open Source Initiative". If no OSI license is specified, NASA distributes it under Apache 2.0. | Participant Terms & Conditions |
| E-R8 | Non-NASA third-party materials must be freely available or OSI-licensed. The team is responsible for verifying this. | Participant Terms & Conditions |
| E-R9 | No personally identifiable information. No recognizable names, voices, or likenesses of persons under 18. Videos must be original work and must not infringe third-party rights. | Participant Terms & Conditions |
| E-R10 | No export-controlled information (ITAR/EAR). | Participant Terms & Conditions |

## Official judging and submission requirements

Sources: the [Project Submission Guide](https://www.spaceappschallenge.org/resources/project-submission-guide/) (REF-10) and the [Judging & Awards Guide](https://www.spaceappschallenge.org/resources/judging-awards-guide/) (REF-11), both retrieved 2026-11-13.

### Timing

| ID | Rule |
|---|---|
| T-1 | Project submission opens **Saturday, November 14 at 9:00 a.m.** and closes **Sunday, November 15 at 11:59 p.m.**, in the time zone of the team's **Local Event**. For a **Universal Event** team, both times follow the local time of the Team Owner's area of residence. |
| T-2 | You must click "Submit for Judging" before the deadline. Projects saved or submitted after it are not eligible. You can resubmit until the deadline; only the last saved submission is judged. |
| T-3 | The team's "Project" tab appears only when the hackathon begins (November 14, 9:00 a.m. local time). Local judging times may differ; check with the Local Lead. |

### Eligibility and form

| ID | Rule |
|---|---|
| E-R11 | Demo is mandatory: a **video of 30 seconds or less** *or* a **slide deck of up to 7 slides including the title and intro slides**. "Projects that exceed these limits will not be eligible for Global Judging." It must be hosted externally at a public link with no login. |
| E-R12 | Everything must be in English. A video may be spoken in another language but must have English subtitles. Slide decks must be in English. |
| E-R13 | Slides must include the team name, the team members' names, and the selected challenge. |
| E-R14 | "To be eligible for a Global Award, you must use at least one NASA data or resource." |
| E-R15 | All required form fields must be completed. The form also has a References field that must list "all external resources including code, text and images (even if they are open source or freely available)". |
| E-R16 | Two checkboxes: agreement to the Terms and Conditions and Privacy Policy, and "I confirm that the submitted project represents my team's original work…". |
| E-R17 | AI ("SI") tools are permitted, but "SI should not be used to (come up with your idea of how to solve the challenge)." |
| E-R18 | AI-generated content may not use, contain, or modify NASA branding or design elements (logos, flags, mission identifiers). AI use must be acknowledged: images and videos need a visible watermark; audio, code, and data need acknowledgement "in descriptive text and metadata". |
| E-R19 | Team size is 1–6 for a Local Event and 2–6 for a Universal Event. All members must be registered for the same event and must not be waitlisted. |
| E-R20 | Optional: request a FortiGuard Web Filter Classification for a new website so judges can reach it. |

### Form fields (from the guide)

1. Project name.
2. High-level summary: what you developed, how it addresses the challenge, why it is important.
3. Demo link (E-R11).
4. Final project link (public, no login).
5. Project details: what it does, how it works, benefits, goals, tools/languages/software used.
6. NASA data and resources used (E-R14).
7. Space Agency Partner data and resources (encouraged).
8. References: all data, resources, and tools (E-R15).
9. AI-use question. It is for data collection only and judges don't see the answer, but they do see AI indicators within the project.

### Judging criteria

Projects are judged on five criteria: **Impact, Creativity, Validity, Relevance, Presentation**. Global Finalists are announced 2026-12-17 and Global Winners on 2027-01-26. Summaries of the official definitions:

- **Impact:** how significant the problem is, and the reach and benefit of the solution.
- **Creativity:** originality, or a meaningful improvement on existing ideas.
- **Validity:** "grounded in scientific principles", technically or logically feasible, usable.
- **Relevance:** directly addresses the challenge and "meaningfully integrates NASA data … as a core component … rather than a superficial addition".
- **Presentation:** clear, engaging storytelling. Judges score both the demo and the full project.

## Official resources

Retrieved 2026-11-13 from the challenge Resources tab. The tab notes: "NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on non-U.S. Government websites."

| Ref | Resource | Provider |
|---|---|---|
| REF-01 | [5 Hazards of Human Spaceflight](https://www.nasa.gov/hrp/hazards/) | NASA HRP |
| REF-05 | [Risks of Human Spaceflight](https://www.nasa.gov/hrp/risks/) | NASA HRP |
| REF-06 | [Ongoing HRP Research in Space](https://www.nasa.gov/hrp/ongoing-hrp-research/) | NASA HRP |
| REF-07 | [Monitoring Radiation for Astronaut Health](https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp) | CSA |
| REF-08 | [Why Do We Conduct Science Experiments in Space?](https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp) | CSA |

**Additional NASA HRP hazard pages.** These were added by the owner on 2026-11-13. They are not listed on the Resources tab; they are the individual hazard pages for REF-01.

| Ref | Resource | Provider |
|---|---|---|
| REF-12 | [Hazard: Space Radiation](https://www.nasa.gov/hrp/hazard-space-radiation/) | NASA HRP |
| REF-13 | [Hazard: Isolation and Confinement](https://www.nasa.gov/hrp/hazard-isolation-and-confinement/) | NASA HRP |
| REF-14 | [Hazard: Distance From Earth](https://www.nasa.gov/hrp/hazard-distance-from-earth/) | NASA HRP |
| REF-15 | [Hazard: Gravity Fields](https://www.nasa.gov/hrp/hazard-gravity-fields/) | NASA HRP |
| REF-16 | [Hazard: Hostile/Closed Environments](https://www.nasa.gov/hrp/hazard-hostile-closed-environments/) | NASA HRP |

## Open questions

- **Q-01 — RESOLVED 2026-11-13 (owner):** Guidance vs. diagnosis. The approved policy is in `science.md` → "Guidance policy".
- **Q-02 — RESOLVED 2026-11-13 (owner):** There was no time left to confirm the rule. The GitHub repository will be created and pushed at the event start: **Saturday 2026-11-14, 09:00 CET (Berlin)**. Pre-event documentation is disclosed in `references.md`.
- **Q-03 — RESOLVED 2026-11-13:** **Local Event in Berlin.** Time zone Europe/Berlin (CET, UTC+1). Submission opens Sat 2026-11-14 09:00 CET and closes **Sun 2026-11-15 23:59 CET**. Solo team (Hossein Shahyari), which is allowed: Local Event teams need at least 1 member (E-R19). TODO: confirm the Berlin Local Event name and any local judging times with the Local Lead.
- **Q-04 — RESOLVED 2026-11-13:** Demo format is **slides** (at most 7, including title and intro). Outline: `presentation-outline.md`.

> Do not treat AI-generated ideas or summaries as official requirements without checking them against the official page.
