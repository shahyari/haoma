# Story-driven presentation outline — 7 slides maximum

> **This is the official demo** (owner decision 2026-11-13, `challenge.md` Q-04). **Official limit:** up to 7 slides **including the title and intro slides**, in English (E-R11, E-R12). Decks over the limit are not eligible for Global Judging. The deck must show the team name, team members' names, and the selected challenge (E-R13). Host it at a public link that needs no login.

**Finished deck:** [`docs/demo/haoma-space-apps-2026-demo.pdf`](demo/haoma-space-apps-2026-demo.pdf) (7 slides, 16:9, English, last changed 2026-11-15). Public link: https://haomaho.vercel.app/haoma-demo.pdf (served by Vercel from `public/haoma-demo.pdf`, opens in the browser; keep both copies identical). Typefaces Inter and Space Grotesk (TP-18, TP-19). The screenshots are of the real app with simulated demo data. There are no NASA logos. The outline below describes the deck as submitted. It was compared with the PDF's text and page renders on 2026-11-15.

**Correction 2026-11-15 (owner request):** two lines were reworded in place. Slide 3 "31 approved rules and a personal baseline" became "Approved rules and a personal baseline", because 30 of the 31 approved rules run. Slide 6 "keyboard, screen reader" became "keyboard, screen-reader labels", because no screen-reader test was done. The slide images were patched in Inter 15 pt and the invisible text layer updated to match. The other five slides are unchanged.

## 1. Title and intro

"NASA Space Apps Challenge 2026" · **HAOMA**, Health Assessment, Observation & Mission Assistance · "A mission-aware health companion for astronauts." Challenge: Create Health Monitoring Software for Astronauts on Space Missions. Team: Haoma: Hossein Shahyari. Event: Local Event, Berlin. Image: Home screenshot (indicator cards, body map, two Attention banners).

## 2. The mission and the problem

"Far from Earth, the astronaut is the first line of health monitoring." Fictional profile card: Alex Morgan, Flight Engineer on the invented Aster-1 Lunar Transit Mission; "All of Alex's readings in this demo are simulated." Points: the six indicators; care is far away and communication is delayed; spaceflight affects the heart and blood pressure, sleep, and behavioral health; most reference ranges come from people on Earth. Sources line: NASA HRP Distance From Earth; NASA cardiovascular, sleep, and behavioral health risks (REF-14, REF-19/REF-23, REF-38, REF-42).

## 3. The solution

"HAOMA: check in, understand, act." 1 Check in (one dialog, with context); 2 Understand ("Approved rules and a personal baseline show each reading as Normal, Attention, or Escalate."); 3 Act (what to do first, why, and when to involve the flight surgeon). Home screenshot. Footer: live app and code URLs.

## 4. Scenario A: routine check-in (simulated)

"07:00, before work: one dialog, six indicators." Due chips; Log reading with a tab per indicator; Alex enters fasting fingerstick glucose; one save; result 88 mg/dL fasting is Normal (RULE-09, General clinical reference); the Check-ins graph fills in. Screenshot of the Log reading dialog. Footer: "All readings in this scenario are simulated demo data."

## 5. Scenario B: change requiring attention (simulated)

"Same morning: short sleep and raised blood pressure." Expanded blood pressure banner (action "Re-measure after rest and watch the trend", "Why?" with RULE-02 and REF-17) and the sleep banner. The blood pressure history chart with the dash-dot simulated crew average and its tooltip (n = 5). "The crew average never changes a status." Footer: simulated readings and crew; Escalate results name the flight surgeon and when.

## 6. Scientific and UX foundations

"Built on evidence, honest about its limits." Four cards: evidence label on every rule; NASA and partner resources (HRP cardiovascular, sleep, and behavioral health risks; OSDR OSD-575 and OSD-370; CSA Bio-Monitor; JAXA ISS medical equipment); safety boundaries (never diagnoses; "Not evaluated", never Normal; urgent results say who to contact and when); privacy and access (browser only; crew averages need three or more people; "High contrast, text size, patterns, keyboard, screen-reader labels"). Footer: link to `references.md`.

## 7. Outcome and next steps

"A working prototype today, built to grow." Works today: live app, Apache-2.0; six indicators, 31 approved rules, history, body map, crew comparison; 330 automated tests (the count on 2026-11-15 before the last features; 340 at submission). Limits and next steps: not clinically validated; simulated data; deferred: wearable sensors, roles for the medical team, synced crew data. Footer: HAOMA · Team Haoma · Hossein Shahyari · NASA Space Apps Challenge 2026.

## Presenter notes

- Keep the story grounded in the real implementation. No impact metrics are claimed.
- Slide 7 says "31 approved rules", which is accurate: 31 are approved and 30 run. RULE-28 (pre-EVA sleep) needs a task schedule the prototype does not have. Say so if asked.
- Screen-reader labels exist, but no screen-reader test has been done (`design-decisions.md`).
