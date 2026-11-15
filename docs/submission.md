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
| Risk of Cardiovascular Adaptations (NASA) | https://www.nasa.gov/reference/risk-of-cardiovascular-adaptations/ | Arrhythmia, landing hypotension (cited by the heart-rate and post-landing rules); REF-23 | Reference |
| Cardiovascular Risk Overview (NASA HHP) | https://www.nasa.gov/directorates/esdmd/hhp/cv-risk/ | CV risk; preventive actions; REF-19 | Reference |
| Risk from Inadequate Sleep and Irregular Schedules (NASA) | https://www.nasa.gov/reference/risk-from-inadequate-sleep-and-irregular-schedules/ | Sleep risk; lighting; self-care time; REF-38 | Reference |
| Sleep and Circadian Evidence Report (NASA NTRS) | https://ntrs.nasa.gov/citations/20160003864 | Sleep evidence; REF-39 | Reference |
| Behavioral Health Risk (NASA HHP) | https://www.nasa.gov/directorates/esdmd/hhp/behavioral-health-risk/ | Behavioral health risk; REF-42 | Reference |
| Behavioral Medicine Evidence Report (NASA NTRS) | https://ntrs.nasa.gov/citations/20160004365 | Behavioral medicine; WinSCAT; REF-43 | Reference |
| Food and Nutrition Risk Record (NASA) | https://www.nasa.gov/wp-content/uploads/2025/08/food-risk-record-rev-d-web-final.pdf | Nutrition risk; food variety; REF-29 | Reference |
| HRP Overview: Immune (NASA NTRS) | https://ntrs.nasa.gov/api/citations/20230017691/downloads/HRP_OverviewPlattS2.pdf | Latent virus reactivation; REF-33 | Reference |
| OSDR OSD-575: Inspiration4 Blood Serum Metabolic Panel | https://osdr.nasa.gov/bio/repo/data/studies/OSD-575 | Spaceflight cross-check (OD-13); no rule changed; REF-55 | Data (reviewed) |
| OSDR OSD-370: Insulin Resistance from Physical Inactivity | https://osdr.nasa.gov/bio/repo/data/studies/OSD-370 | Context for glucose monitoring (bed-rest analog); REF-52 | Data (reviewed) |
| NASA to Test Telemedicine with Polaris Dawn Crew | https://www.nasa.gov/humans-in-space/nasa-to-test-telemedicine-gather-essential-health-data-with-polaris-dawn-crew/ | Spaceflight health-data context (OD-13); REF-54 | Reference |
| 5 Hazards of Human Spaceflight (NASA HRP) | https://www.nasa.gov/hrp/hazards/ | Problem framing; official challenge resource; REF-01 | Reference |
| Risks of Human Spaceflight (NASA HRP) | https://www.nasa.gov/hrp/risks/ | Indicator relevance; official challenge resource; REF-05 | Reference |
| Ongoing HRP Research in Space (NASA HRP) | https://www.nasa.gov/hrp/ongoing-hrp-research/ | Research context; official challenge resource; REF-06 | Reference |
| Hazard: Space Radiation (NASA HRP) | https://www.nasa.gov/hrp/hazard-space-radiation/ | Hazard detail; REF-12 | Reference |
| Hazard: Isolation and Confinement (NASA HRP) | https://www.nasa.gov/hrp/hazard-isolation-and-confinement/ | Hazard detail; REF-13 | Reference |
| Hazard: Distance From Earth (NASA HRP) | https://www.nasa.gov/hrp/hazard-distance-from-earth/ | Hazard detail; REF-14 | Reference |
| Hazard: Gravity Fields (NASA HRP) | https://www.nasa.gov/hrp/hazard-gravity-fields/ | Hazard detail; REF-15 | Reference |
| Hazard: Hostile/Closed Environments (NASA HRP) | https://www.nasa.gov/hrp/hazard-hostile-closed-environments/ | Hazard detail; REF-16 | Reference |

All 19 URLs returned 200 on 2026-11-15. Partner agencies (for the separate partner field): JAXA ISS medical equipment (REF-20) and CSA Bio-Monitor (REF-21), see `references.md`. Space Apps event pages (challenge statement, terms, guides) are not listed as resources used.

## Space Agency Partner and other data (portal text)

Portal field "Space Agency Partner & Other Data": partner-agency sources, the other references the rules use, and all code and tools. Sources from `references.md` (REF-34, superseded, is left out); code from `references.md` → "Third-party code, assets, and data". The logo and the body map are the team's own work (TP-16; body map prototype by the owner with the Claude app). Links checked 2026-11-15: all public; heart.org, cdc.gov, aasm.org, mayoclinic.org, jamanetwork.com, and one DOI block automated checks (403) but open in a browser.

**Portal limit (2026-11-15):** the field accepts 25 links. Entered: the 4 partner sources and the first 21 references (through Stahn et al.). The 25th slot is replaced by one link to the full list: "Full list of references, code, and tools (HAOMA repository)" → https://github.com/shahyari/haoma/blob/main/docs/references.md.

### Space agency partners

| Link Text | Link Url |
|---|---|
| CSA: Bio-Monitor, astronaut vital signs | https://www.asc-csa.gc.ca/eng/sciences/bio-monitor.asp |
| CSA: Monitoring Radiation for Astronaut Health | https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp |
| CSA: Why Do We Conduct Science Experiments in Space? | https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp |
| JAXA: ISS medical equipment | https://humans-in-space.jaxa.jp/en/biz-lab/med-in-space/healthcare/medops/system/ |

### Clinical and scientific references

| Link Text | Link Url |
|---|---|
| AHA: Understanding Blood Pressure Readings | https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings |
| AHA: Low Blood Pressure | https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/low-blood-pressure-when-blood-pressure-is-too-low |
| AHA: Target Heart Rates | https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/target-heart-rates |
| Mayo Clinic: Low blood pressure (hypotension) | https://www.mayoclinic.org/diseases-conditions/low-blood-pressure/symptoms-causes/syc-20355465 |
| NHLBI: Arrhythmia symptoms | https://www.nhlbi.nih.gov/health/arrhythmias/symptoms |
| NHLBI: Heart attack symptoms | https://www.nhlbi.nih.gov/health/heart-attack/symptoms |
| Norsk et al. 2015, J Physiol (ISS blood pressure) | https://pmc.ncbi.nlm.nih.gov/articles/PMC4324706/ |
| Lee et al. 2020, Front Physiol (compression garments after spaceflight) | https://doi.org/10.3389/fphys.2020.00784 |
| Cowings et al. 2015, Aerosp Med Hum Perform (fluid loading) | https://doi.org/10.3357/AMHP.4065.2015 |
| ADA Standards of Care 2023, Section 2 | https://pmc.ncbi.nlm.nih.gov/articles/PMC9810477 |
| ADA hypoglycemia levels, Table 6.4 | https://pmc.ncbi.nlm.nih.gov/articles/PMC10725808/table/T6.4 |
| ADA 2010, Diagnosis and classification of diabetes | https://pmc.ncbi.nlm.nih.gov/articles/PMC2797383/ |
| Endotext/NCBI: ADA diabetes criteria | https://www.ncbi.nlm.nih.gov/books/NBK538537 |
| Endocrine Society 2009: adult hypoglycemic disorders guideline | https://doi.org/10.1210/jc.2008-1410 |
| Commun Biol 2023: insulin signaling in spaceflight | https://link.springer.com/article/10.1038/s42003-023-05213-2 |
| npj Microgravity 2024: ENERGY study | https://pmc.ncbi.nlm.nih.gov/articles/PMC10973451/ |
| Axiom Space: Suite Ride results (diabetes) | https://axiomspace.com/release/suite-ride-research-unlocks-potential-for-first-astronaut-with-diabetes |
| MedlinePlus: Fever | https://medlineplus.gov/ency/article/003090.htm |
| CDC Port Health: signs and symptoms of ill travelers | https://www.cdc.gov/port-health/php/definitions-symptoms-reportable-illness/ |
| Cleveland Clinic: Fever | https://my.clevelandclinic.org/health/symptoms/10880-fever |
| Stahn et al. 2017, Sci Rep (core body temperature in space) | https://doi.org/10.1038/s41598-017-15560-w |
| AASM/SRS consensus 2015: recommended sleep for adults | https://pmc.ncbi.nlm.nih.gov/articles/PMC4434546/ |
| AASM: Seven or more hours of sleep per night | https://aasm.org/seven-or-more-hours-of-sleep-per-night-a-health-necessity-for-adults/ |
| Barger et al. 2014, Lancet Neurology (astronaut sleep) | https://doi.org/10.1016/S1474-4422(14)70122-X |
| Kroenke et al. 2003, Med Care (PHQ-2 validity) | https://doi.org/10.1097/01.MLR.0000093487.78664.3C |
| Levis et al. 2020, JAMA (PHQ-2 accuracy) | https://jamanetwork.com/journals/jama/fullarticle/2766865 |
| University of Washington: PHQ-2 | https://www.hiv.uw.edu/page/mental-health-screening/phq-2 |
| NIDA CTN: PHQ-2 reuse terms | https://ctnlibrary.org/instrument/nida-clinical-trials-network-patient-health-questionnaire-2-phq-2 |

### Code, tools, and license

| Link Text | Link Url |
|---|---|
| React (MIT) | https://react.dev |
| React Router (MIT) | https://reactrouter.com |
| TypeScript (Apache-2.0) | https://www.typescriptlang.org |
| Vite (MIT) | https://vite.dev |
| Tailwind CSS (MIT) | https://tailwindcss.com |
| shadcn/ui (MIT) | https://ui.shadcn.com |
| Radix UI (MIT) | https://www.radix-ui.com |
| class-variance-authority (Apache-2.0) | https://cva.style |
| tw-animate-css (MIT) | https://github.com/Wombosvideo/tw-animate-css |
| Lucide icons (ISC) | https://lucide.dev |
| Recharts (MIT) | https://recharts.org |
| React DayPicker (MIT) | https://daypicker.dev |
| date-fns (MIT) | https://date-fns.org |
| Vitest (MIT) | https://vitest.dev |
| Testing Library (MIT) | https://testing-library.com |
| jsdom (MIT) | https://github.com/jsdom/jsdom |
| oxlint (MIT) | https://oxc.rs |
| Prettier (MIT) | https://prettier.io |
| DefinitelyTyped type definitions (MIT) | https://github.com/DefinitelyTyped/DefinitelyTyped |
| Node.js and npm | https://nodejs.org |
| Vercel (hosting) | https://vercel.com |
| GitHub (code hosting) | https://github.com |
| Claude Code (AI coding assistant, disclosed) | https://claude.com/claude-code |
| Apache License 2.0 (project license) | https://www.apache.org/licenses/LICENSE-2.0 |

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
- Presentation: https://github.com/shahyari/haoma/blob/main/docs/demo/haoma-space-apps-2026-demo.pdf (7-slide demo deck, PDF, 2026-11-15; English; shows team, member, and challenge per E-R11–E-R13)
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
