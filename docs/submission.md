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
| Project details | Project details (portal text). This is the one text to paste. The later sections (Problem and intended users through Limitations) support it with sources and repository links. They are not pasted. |
| NASA data and resources used (≥1 required for Global Awards) | NASA and partner-agency resources used |
| Space Agency Partner data and resources | NASA and partner-agency resources used |
| References (all code, text, images) | Originality and attribution (+ `references.md`) |
| AI-use question | Use of AI tools |

## Project title
HAOMA - Health Assessment, Observation & Mission Assistance (owner, 2026-11-15)

## Tagline / one-sentence summary
A mission-aware health companion for astronauts.

## Team and challenge
- Team: Haoma
- Challenge: Create Health Monitoring Software for Astronauts on Space Missions
- Event: Local Event, Berlin (the official local event name is still unconfirmed; it is tracked in `challenge.md` Q-03 and is not needed in the project text)
- Team members: Hossein Shahyari (solo team)

## Project summary
HAOMA is a web prototype that helps astronauts check the six health indicators named in the challenge: heart rate, blood pressure, blood glucose, body temperature, sleep, and mood. Each reading is checked against evidence-labeled rules and the astronaut's own baseline, then shown as Normal, Attention, or Escalate, with what to do first. In space, early signs are easy to miss and care is far away. HAOMA makes self-assessment quick, consistent, and honest about its limits.

(75 words, 475 characters; shortened on 2026-11-15, the details moved to "Project details". Drafted with AI assistance from the implemented features, to be disclosed in the AI-use field.)

## Project details (portal text)

Covers the portal's "Project details" field: what it does, benefits, impact, tools, creativity, and factors considered. Drafted with AI assistance from the implemented features.

What it does and how it works

Daily check-in. "Log reading" opens one dialog with a tab per indicator, so an astronaut can log one or more readings at once. The app records the context that changes what a number means: at rest or after activity, fasting or not, oral or forehead thermometer, and how sleep was measured.

Evaluation. Each reading is checked against evidence-labeled rules approved by the team. Every rule carries its sources and an evidence label: Spaceflight evidence, General clinical reference, Team design decision, or Simulated demo logic. After five readings, the app compares new readings with the astronaut's personal baseline (the median of the last seven). A reading that no rule covers is shown as "Not evaluated", never as Normal.

Guidance. Each result says what to do first, for example "Re-measure after rest and watch the trend" or "Tell the flight surgeon at your next contact". A "Why?" section shows the rule, its source, and the type of evidence. The mission phase (in flight, approaching landing, post-landing) adds landing-specific reminders.

History and context. Each indicator has a chart and a table that can be edited and paged. A 3D/2D body map records self-reported pain and saves it as a report for the flight surgeon; it is never interpreted. An optional crew comparison shows the average of the other crew members on the same mission day, comparing like with like, as context only. It never changes a status.

Benefits and intended impact

On long missions, care is far away and communication is delayed. HAOMA aims to make daily self-assessment take minutes, to apply the same rules every time, and to make it clear when to involve the flight surgeon. Every result can be traced to its source, so astronauts and medical teams can see why the app said what it said.

Tools

React and TypeScript with Vite, Tailwind CSS, shadcn/ui (Radix), Lucide icons, and Recharts. The body map uses a small WebGL and SVG engine without extra libraries. Tested with Vitest and Testing Library (340 automated tests), checked with oxlint and Prettier, hosted on Vercel, code on GitHub. Development was assisted by Claude Code (AI), as disclosed in the repository.

What makes it creative

Every rule shows its evidence, so the app is open about what is and isn't known for astronauts. The interface theme can follow the mission zone (Earth, Space, Moon, Mars). The body map lets astronauts point to where it hurts instead of describing it. The crew comparison gives mission context while protecting privacy.

Factors we considered

Safety: the app never diagnoses, and urgent results name who to contact and when. Evidence: general-population ranges are labeled as not validated for astronauts. Measurement context: readings taken in different ways are kept apart, for example oral and forehead temperatures, or resting and after-activity heart rates. Privacy: data stays in the browser, and the crew comparison shows only averages from at least three people. Accessibility: high contrast, text size, assistive patterns so status never depends on colour, keyboard use, and screen-reader labels. Honesty: the astronaut, crew, and demo data are fictional and labeled as simulated.

Live app: https://haomaho.vercel.app
Source code: https://github.com/shahyari/haoma

## Problem and intended users

Supporting section, not pasted in the portal. The user definition lives in `product.md`.

- **Why astronauts need to assess themselves.** Long missions expose crews to the five hazards of human spaceflight: radiation, isolation and confinement, distance from Earth, gravity fields, and hostile closed environments (REF-01, REF-12–REF-16). The challenge says that "on long missions, astronauts carry much of the responsibility for spotting these changes in themselves" (REF-02, `challenge.md`).
- **Why these indicators.** NASA lists cardiovascular adaptations (REF-19, REF-23), inadequate sleep and irregular schedules (REF-38, REF-39), adverse behavioral conditions (REF-42, REF-43), and inadequate nutrition (REF-29) among the risks of spaceflight. The six indicators the challenge names (blood pressure, heart rate, blood glucose, body temperature, sleep, mood) give a quick view of these physical and behavioral areas. Measurement in space is covered in `scientific-foundations.md` → "Indicator summary" (REF-20, REF-21, REF-32, REF-37).
- **Why remote care makes this hard.** Medical help is a crew medical officer on board and flight surgeons on the ground. The farther a mission goes, the less often it can reach them (REF-14). A reading is only useful if the astronaut knows what it means, how it was taken, and when to tell someone.
- **Primary user:** the astronaut, alone, during the daily routine (owner decision 2026-11-13, `product.md`). The crew medical officer and the flight surgeon receive escalations and saved pain reports but do not use the app.
- **Decisions the prototype supports:** whether a reading is in line with general references and the astronaut's own baseline, whether to re-measure, and whether to tell the flight surgeon now or at the next contact.

## How the solution works

Supporting section, not pasted in the portal. It describes implemented behavior only, with the code that implements it.

1. **Daily check-in, six indicators.** "Log reading" in the header opens one dialog with a tab per indicator. One save stores one or more readings. Home cards show a "Due" chip for indicators with no reading today, and a Check-ins graph shows 24 weeks of logging (`src/features/entry/`, `src/features/home/`).
2. **Context and validation.** Each entry records what changes its meaning: rest or after activity (heart rate), fasting state and device (glucose), oral or forehead method and recent exercise (temperature), sleep source, and optional reported symptoms. Validation is structural only: required fields, numbers, non-negative values, and the PHQ-2 and mood-rating scales. It sets no health or plausibility ranges, so health limits live only in the approved rules. If any filled tab is invalid, nothing is saved, and the error says which tab to fix (`src/domain/`).
3. **Evidence-labeled rule evaluation.** The approved rules are stored as data and evaluated in `src/rules/`. Of the 31 approved rules (RULE-01–RULE-31), 30 are implemented. RULE-28 (short sleep before an EVA) needs a task schedule the prototype does not have, so it is not evaluated (AU-8). Each rule carries its REF IDs and an evidence label for its threshold and its action. A reading that no rule covers is "Not evaluated", a missing reading is "No measurement", and neither is ever shown as Normal.
4. **Status, explanation, and follow-up.** Badges say Normal, Attention, or Escalate, always with an icon and text. Home banners show the action first ("Re-measure after rest and watch the trend"). "Why?" shows the condition, the rule, its source, and the evidence type. Escalations name the flight surgeon and say when to contact them. The mission phase (in flight, approaching landing, post-landing) adds landing-specific rules (RULE-26, RULE-30).
5. **History and personal baseline.** Each indicator page has the latest value with provenance, a chart, and an accessible paged table where readings can be edited and deleted. It also shows the personal baseline (median of the last seven comparable readings, once there are five) and the approved rules with their references. No reference bands are drawn on charts (D-01).
6. **Simulated crew-average comparison.** Each indicator page compares the latest reading with the average of five simulated crew members on the same mission day. Only like-for-like readings count, the PHQ-2 is never compared, and at least three members must contribute. Only aggregates are shown. The comparison never changes a status, rule, or baseline (`src/crew/`).
7. **Body-map pain log and reports.** A 3D (WebGL) and 2D (SVG, keyboard-accessible) body model records self-reported pain: region, intensity, character, time, and note, with links to related indicators. "Save report" moves chosen logs into a report that can be viewed read-only, downloaded or opened as JSON, and imported again. Pain logs are never interpreted (`src/features/bodymap/`, `src/features/reports/`).

Everything runs in the browser. There is no backend, account, or sensor link (`architecture.md`).

## Demonstration scenario

All health records, crew measurements, and pain logs in the demo are **simulated**. Alex Morgan and the Aster-1 Lunar Transit Mission are **fictional** (`data-and-limitations.md`). The 7-slide deck follows the same two scenarios.

**Starting state (seeded on the first visit, relative to today):** 14 days of simulated readings for all six indicators, one PHQ-2 of 0 from ten days ago, and three simulated pain logs (head, left lower back, left knee). This morning at 07:00 Alex has logged blood pressure 128/82 mmHg, heart rate 66 bpm at rest, 6.2 h of sleep, and mood rating 4. Glucose and temperature are still due.

- **Scenario A, routine check-in.** Home shows "Due" on Blood glucose and Body temperature. Alex opens Log reading, enters 88 mg/dL, fasting, fingerstick, and saves. The reading is Normal (RULE-09, General clinical reference), the Due chip goes away, and the Check-ins graph fills in.
- **Scenario B, a change that needs attention.** Two banners show Attention: blood pressure 128/82 (RULE-02) and sleep 6.2 h, "Below general sleep recommendation" (RULE-19). The blood pressure banner says "Re-measure after rest and watch the trend". "Why?" shows the condition, RULE-02, REF-17, and the two evidence labels: "General clinical reference" for the level and "Team design decision" for the advice. The Blood pressure page shows the trend, the personal baseline, and the simulated crew average for the same day, which gives context but does not change the status.
- **Optional.** On the body map, open a demo pain log, then "Save report" and view or download it on the Reports page. Or enter a high oral temperature to see an Escalate result that names the flight surgeon and when to contact them.

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

1. **General clinical references are labeled separately from spaceflight evidence.** Every rule has an evidence label: Spaceflight evidence, General clinical reference, Team design decision, or Simulated demo logic. When the threshold and the action have different bases, each gets its own label (`science.md` → "Guidance policy"). Most thresholds are General clinical references for adults on Earth (for example AHA blood pressure categories, REF-17). The app says they are not validated for astronauts, and each source's population is recorded (`references.md` → "Population and limitations"). Only rules the owner set to `Approved` affect the app.
2. **Baselines and crew averages give context. They never override a rule.** The personal baseline only feeds the approved baseline rules (P-1, P-2). The crew average is mission context: it never changes a status, a rule, or the baseline, and the app states that "similar measurements across the crew do not necessarily indicate that they are safe" (`design.md` → "Crew comparison", `scientific-foundations.md` → "Crew comparison parameters"). History charts draw no reference bands, so general ranges are not mistaken for personal or astronaut targets (D-01).
3. **Status never relies on colour alone.** Each status has its own icon and text label. An optional "Assistive patterns" setting adds solid, striped, or cross-hatched strips. Chart series differ by marker shape and line style, not only colour. Every chart is followed by a data table. High contrast and text size are settings. Token contrast is measured automatically for all 16 theme combinations (`design.md` → "Health communication", `design-decisions.md` → "Accessibility").
4. **Missing or unclassified readings are never shown as Normal.** "No measurement" and "Not evaluated" are separate neutral states with dashed, colourless badges. A forehead or method-unknown temperature is shown with its trend but stays unclassified, because the rules are oral-only (OD-15). A "Due" chip marks a missing check-in without changing the latest status (AU-6). A test checks that no reading without an applicable rule is shown as Normal (`src/rules/`).
5. **The action comes first, the reason second.** Banners lead with what to do, and "Why?" opens the rule, source, and evidence type. Escalations always name the flight surgeon and when to contact them (`design.md` → "UX copy").

## Originality and attribution

- **Created during the hackathon (from Sat 2026-11-14, 09:00 CET):** all application code, tests, the deployed app, the simulated demo and crew data generators, the body-map integration, the demo deck, and this submission text. The repository was created and first pushed at the event start (first commit 2026-11-14 09:00 CET). The commit history records the work.
- **Prepared before the event (disclosed, `references.md` → "Originality and pre-existing work"):** preparation documentation (templates, rule capture, stack review) and the owner's indicator research table, compiled with Claude's help. No application code was written before the event (E-R2, Q-02).
- **Owner's own work:** the project concept, product scope and priorities, design direction and layout decisions, approval of every health rule and reference, the HAOMA name, and the logo (TP-16). The owner created the body-map prototype with the Claude app (AI-assisted, see "Use of AI tools").
- **AI-assisted work:** most code, tests, simulated data, documentation drafts, research checks, and the deck were produced with AI assistance under the owner's direction. They are acknowledged in the README, this file, `package.json` and `index.html` metadata, and `Co-Authored-By` commit trailers (E-R18). Not every line or visual was written by hand.
- **Open-source code and third-party assets:** React, React Router, Vite, TypeScript, Tailwind CSS, shadcn/ui and Radix UI, class-variance-authority, tw-animate-css, Lucide icons, Recharts, react-day-picker, date-fns, and dev tools (Vitest, Testing Library, jsdom, oxlint, Prettier). All are under MIT, ISC, or Apache-2.0. The deck uses the Inter and Space Grotesk typefaces (SIL OFL 1.1). Build-time-only transitive packages under MPL-2.0 (lightningcss) and CC-BY-4.0 (caniuse-lite data) are not shipped in the app. The full inventory is in `references.md` → "Third-party code, assets, and data".
- **Scientific sources:** NASA HRP, NASA technical reports, NASA OSDR, CSA, JAXA, and clinical and peer-reviewed sources, all listed with REF IDs in `references.md`. No NASA logos or branding are used.

## Use of AI tools

This section is required (`challenge.md` E-R6). Source: `references.md` → AI assistance.

AI tools were used throughout the development of HAOMA to accelerate implementation, support research, and improve the overall quality of the project.

Claude Code (Anthropic) served as the primary AI-assisted development tool. It was used to establish the application architecture; generate and refine code and the fictional demo history data; help prepare the presentation; implement UI components and features; integrate data visualization; develop automated tests; identify and resolve bugs; maintain technical documentation; and assist with GitHub and Vercel workflows.

The Claude app (Anthropic) was used to generate and refine the 3D and 2D models and to compile the indicator research table.

ChatGPT (OpenAI) was used as a research and planning assistant. It supported feature prioritization, scientific-source evaluation, and the preparation of structured implementation instructions for Claude Code.

Human oversight and responsibility: The project concept, product direction, feature requirements, design decisions, and final approvals were managed by the human team member. AI-generated implementations and recommendations were reviewed and iteratively refined. Scientific claims and health interpretation rules were evaluated against referenced sources, with explicit distinctions between established medical knowledge, prototype-defined logic, and simulated data.

## Limitations

The full list is in `data-and-limitations.md` → "Known limitations". The canonical disclaimer is there too.

- **Not a medical device.** HAOMA is not clinically validated, has no NASA endorsement, makes no diagnosis, and does not replace the crew medical officer or flight surgeons.
- **Thresholds are not astronaut protocols.** Most rules use general adult clinical references from Earth populations. Spaceflight sources give context, not thresholds (`references.md` → "Population and limitations"). Some parameters are team decisions, and a few owner decisions are still open (`progress.md`).
- **Simulated data.** The astronaut, mission, crew, demo readings, and demo pain logs are fictional or simulated. Nothing comes from real people.
- **No real integrations.** There are no wearables or sensors, no backend, no accounts, no crew synchronization, and no secure medical-record storage. Data live only in one browser's localStorage, can be lost when site data is cleared, and are not encrypted at rest.
- **Small simulated crew.** The comparison averages five simulated members by calendar day. One reading moves the average a lot, and a cohort of 3 still limits privacy only partly.
- **Not tested with people.** No usability study with astronauts or other users, and no manual screen-reader or real-browser keyboard audit. No WCAG conformance is claimed. Automated keyboard (jsdom) and token-contrast tests pass.
- **Partial scope.** The pre-EVA sleep rule (RULE-28), mission-routine reminders, gamification, roles for the medical team, zone-specific reference values, and camera input are not implemented.
- **Future work, not part of this submission.** Open scientific proposals (P16-1–P16-4, RULE-16 precedence), confirmation of the crew-comparison parameters (P-9–P-11), and the usability questions in `design-decisions.md` → "Open questions". None of them changes the current rules.

## Project links
- Live demo: https://haomaho.vercel.app
- Source code: https://github.com/shahyari/haoma (checkpoint tag `spaceapps-checkpoint-1`)
- Presentation: https://github.com/shahyari/haoma/blob/main/docs/demo/haoma-space-apps-2026-demo.pdf (7-slide demo deck, PDF, 2026-11-15; English; shows team, member, and challenge per E-R11–E-R13)
- Documentation: https://github.com/shahyari/haoma/tree/main/docs (index in the README → Documentation)
- Scientific foundations: https://github.com/shahyari/haoma/blob/main/docs/scientific-foundations.md; references: https://github.com/shahyari/haoma/blob/main/docs/references.md

All links above returned HTTP 200 without login on 2026-11-15. The PDF on GitHub matches the local file byte for byte.

## Final submission checks

Ticked items were verified by Claude on 2026-11-15. Unticked items need the owner in the portal.

- [ ] Project title and summary are final
- [ ] Correct challenge and team selected
- [ ] Live demo works in private/incognito browser (anonymous HTTP checks pass; a manual private-window check is still open)
- [x] No credentials required to explore demo (anonymous HTTP 200 for the app and repository)
- [x] Repository and deck links are public (no video is submitted; the deck is the demo)
- [ ] NASA/partner sources cited accurately (links checked 2026-11-15; owner confirms the portal entries)
- [x] Simulated data clearly disclosed (app, README, deck, this file)
- [x] Third-party licenses and attribution included (`references.md`, inventory re-checked 2026-11-15)
- [x] Apache-2.0 LICENSE file present (`challenge.md` E-R7)
- [x] AI tool usage described; AI-generated code and data acknowledged in text and metadata (E-R6, E-R18). No AI-generated images or videos are submitted, so no watermark is needed (the body-map 3D/2D models are code, disclosed in the AI section)
- [x] Demo deck has 7 slides including title/intro (E-R11), in English, showing team name, member, and challenge (E-R13); public link works without login
- [x] All content in English (E-R12)
- [x] At least one NASA data source or resource used and listed (E-R14)
- [ ] References field lists all external code, text, and images (E-R15) (portal holds 25 links; the 25th points to the full list)
- [x] No NASA logos or branding; no likeness of anyone under 18 (E-R9, E-R18)
- [ ] Both checkboxes ticked: Terms/Privacy and "original work" (E-R16)
- [x] No `TODO:` left in submission-facing files (`grep -rn "TODO:" README.md docs/submission.md`)
- [ ] Official form requirements and limits checked
- [ ] Submission completed and confirmed before the deadline: Sunday 2026-11-15, 23:59 CET (Berlin Local Event, T-1)
