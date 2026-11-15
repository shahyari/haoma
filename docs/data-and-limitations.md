# Data provenance, simulation, and limitations

**Responsibility:** A submission-facing record of every data element's origin, how the demo profiles and simulated history were made, the public privacy statement, known limitations, and the **canonical disclaimer**. Engineering constraints (no secrets, storage design) are in `architecture.md`.

## Data inventory

| Data element | Origin | Real or simulated? | Collection / generation method | Source (REF ID or N/A) | Restrictions |
|---|---|---|---|---|---|
| Indicator entries typed by the user | The person using the app | User-entered (labeled "Manual entry") | Entry form; structural validation only | N/A | Stored only in this browser |
| Pain logs (body map) | The person using the app; three simulated demo logs on the first visit | Self-reported (the app adds no data beyond the labeled demo logs, see "Simulated history generation") | Body map: location on the model (region or organ name, position, surface normal, 3D or 2D view), date and time of the pain (default now, no future times), intensity 1–10, optional character, optional note (max 240 characters) | N/A | Stored only in this browser; never interpreted, classified, or used by any rule |
| Pain reports | The person using the app, or an imported report file | Self-reported | "Save report" moves the chosen pain logs into a report with the astronaut name (the fictional demo profile) and the save date; "Import JSON" adds a report file after validation | N/A | Stored only in this browser; opened or downloaded as a JSON file only when the person asks; an imported file is read locally and never uploaded |
| Demo history | `src/demo/demo.ts` | Simulated (labeled "Simulated") | Deterministic generator (see below) | N/A (Simulated demo logic) | Not real astronaut data |
| Simulated crew (crew comparison) | `src/crew/simulated.ts` | Simulated (labeled "Simulated crew data") | Deterministic generator (see "Simulated crew" below); generated in memory, never stored | N/A (Simulated demo logic) | Not real astronaut data; only aggregates are shown |
| Demo profile "Alex Morgan" | `src/demo/demo.ts` | Fictional (labeled "Fictional profile") | Provisional profile set by the owner 2026-11-14 | N/A | — |
| Rule thresholds and wording | `scientific-foundations.md` | Reference information | Copied from the approved rules | REF IDs per rule | General-population references, not astronaut-specific |

## Demo profiles

One provisional fictional profile (owner decision 2026-11-14): **Alex Morgan**, Flight Engineer, **Aster-1 Lunar Transit Mission**, Mission Day 42. The person and mission are invented. The avatar card shows "Alex Morgan" and "Fictional Flight Engineer", with the notice "Demo data and fictional person — All health measurements in the demo are simulated". The "Demo data" chip in the header opens the same notice. The mission name and Mission Day 42 are defined in `src/demo/demo.ts` but are no longer shown in the app (owner 2026-11-14). The five other crew members exist only as anonymous simulated readings for the crew comparison (below); they have no profiles. No real private health records.

**Edited entries:** an edited entry keeps its measurement time, gets `editedAt`, and is labeled "Manual entry (edited)", including a simulated entry that was edited, because the person set the new values.

## Simulated history generation

Generated in the browser by `createDemoEntries` (`src/demo/demo.ts`, written with AI assistance) on the first visit (nothing stored in this browser yet; owner request 2026-11-14), and again when the user chooses "Load demo data" in Settings → Demo controls. Stored demo data that nobody has added to or edited (every entry simulated, unedited, with a demo id) is regenerated on load when its newest reading is from an earlier day, so the latest readings are always from this morning (owner usability review, 2026-11-15). "Clear data" stores an empty dataset, so a cleared app is not refilled on the next visit:

- **Time range:** the 14 days before today, with one entry per indicator per day at 07:00 local time. Today has four readings at 07:00 (or just before the current time if it is earlier): blood pressure, heart rate, sleep and the mood rating. Glucose and temperature stay due, so the check-in is partly open.
- **Today's readings (fixed, Simulated demo logic):** 128/82 mmHg and 6.2 h of sleep, chosen so that approved rules put them at Attention (RULE-02, RULE-19) and Home shows banners on first load (owner usability review, 2026-11-15). Heart rate 66 bpm at rest, mood rating 4. No other demo night is 6 h or less, so RULE-20 does not apply and there is no Escalate.
- **Heart rate** entries are recorded "at rest".
- **Values:** drawn uniformly from fixed bands chosen by the team for a calm demo (blood pressure 108–118 / 68–76 mmHg, heart rate 62–70 bpm, fasting glucose 82–94 mg/dL by fingerstick, oral temperature 36.5–36.9 °C, self-reported sleep 6.5–7.9 h, daily mood rating 3–5) and one PHQ-2 of 0 ten days before today, so that it is still current (a PHQ-2 result counts for 14 days, OD-14). These bands are **Simulated demo logic**, not reference ranges.
- **Randomness:** a seeded generator (mulberry32, seed 2026), so the same day always produces the same history.
- **Reproduce:** call `createDemoEntries(date)`; a unit test checks that the output is deterministic, structurally valid, and labeled simulated.
- **Demo pain logs (owner request 2026-11-15):** on the first visit, `createDemoPainLogs` also adds three pain logs to the body map so it is not empty: Head (intensity 3, pressure, this morning), Left lower back (4, aching, yesterday evening) and Left knee (2, aching, two days ago). Each carries the note "Simulated demo entry." They are regenerated with the readings while untouched, are never interpreted or used by any rule, and "Load demo data" does not add them (it keeps existing pain logs). The values were chosen by the team for the demo (**Simulated demo logic**).

## Simulated crew

For the Crew Average Comparison (owner spec 2026-11-15), `createCrewEntries` (`src/crew/simulated.ts`, written with AI assistance) generates readings for five fictional crew members of the invented Aster-1 mission besides Alex Morgan. It does not use names, does not store anything, and runs again for each indicator page from the current date.

- **Time range:** the 14 days before today and today. Each member has one reading per indicator per day at about 07:00 (a few minutes apart), never after the current time.
- **Values:** each member has fixed centre values, with seeded variation (blood pressure ±5/±4 mmHg, heart rate ±3 bpm, glucose ±5 mg/dL, temperature ±0.2 °C, sleep ±0.5 h, mood ±1). These are **Simulated demo logic**, not reference ranges.
- **Shared trends:** over the last 5 days all members' resting heart rate rises by up to 4 bpm and sleep falls by up to 0.6 h, so a change in one person can be set against the crew.
- **Gaps and exclusions on purpose:** about one day in eight is skipped per member (never today). Some heart-rate readings are after activity or have no rest state, some glucose readings have an unknown fasting state, some temperatures are taken after exercise, one member uses the forehead sensor, and some members have a PHQ-2. These show how the comparison excludes readings and hides small cohorts.
- **Randomness:** mulberry32, seed 42; the same day always gives the same crew.

## Crew comparison limitations

- Crew averages are mission context, not reference ranges. Similar values across the crew do not mean they are safe, and a crew average never changes a status, a rule, or the personal baseline.
- With five other members, the average is statistically fragile: one person's reading moves it noticeably, and the spread (used for "close to", P-11) is uncertain.
- Matching is by local calendar day only (P-10), not by time of day. Blood pressure has no recorded measurement condition, so all cuff readings are compared with each other.
- The minimum cohort of 3 (P-9) limits, but does not prevent, inference about individuals in a crew this small; a real deployment needs a privacy review.
- The crew data are simulated. No crew data are synchronized, and no accounts or backend exist.

## Reference information versus thresholds

What the app shows falls into five kinds of information. None is a clinical threshold validated for astronauts.

| Kind | Example | What it is | What it is not |
|---|---|---|---|
| Spaceflight research and NASA risk context (label **Spaceflight evidence**) | NASA HRP risks and hazards (REF-19, REF-23, REF-38, REF-42), ISS studies (REF-18, REF-32, REF-37), OSDR datasets (REF-52, REF-55) | Why an indicator matters in space and how it is measured there | A source of numeric thresholds. Samples are small, and OSDR cross-checks changed no rule |
| General clinical references (label **General clinical reference**) | AHA blood pressure categories (REF-17), ADA fasting glucose (REF-46), MedlinePlus fever (REF-50), AASM sleep (REF-35), PHQ-2 cutoff (REF-51) | Adult reference values from Earth populations, used by the approved rules | Validated astronaut-specific or spaceflight thresholds; the app says so in each rule's label |
| Team design decisions (label **Team design decision**) | Baseline window and minimum (P-1, P-2), PHQ-2 cadence, action wording, crew-comparison parameters (P-9–P-11, still to be confirmed) | Choices by the team where no source sets a value | Evidence; they are labeled as decisions |
| Personal baseline | Median of the last 7 comparable readings once 5 exist | A comparison with the astronaut's own history, used only by approved baseline rules | A normal range; a stable baseline does not mean healthy |
| Simulated demo logic (label **Simulated demo logic**) | Demo value bands, today's two Attention readings, simulated crew centres | Values chosen to make the demo work | Reference ranges of any kind |

Evidence statuses follow `science.md`: only `Approved` rules run in the app. Every rule and approved reference is listed in `scientific-foundations.md` and `references.md`. REF-63 (background hazard text) is still `Unverified` (`progress.md`).

## Privacy statement

HAOMA has no backend, no analytics, and no third-party scripts, and it makes no network requests with health data. The host (Vercel) serves the static app files and, like any web host, may log those requests; no health data are part of them. The crew comparison uses simulated crew readings generated in the browser and shows only aggregates (mean, difference, number of contributing members) for cohorts of at least 3 other members, never an individual crew member's reading. Entries, pain logs, and saved pain reports (including their free-text notes) are stored only in this browser's localStorage (key `haoma:v1`) and display settings under `haoma:display:v1`. Nothing is saved remotely. "Clear data" in Settings → Demo controls deletes entries, pain logs, and reports after a confirmation dialog (display settings are kept); "Clear all" in the pain log deletes the pain logs, and Delete on the Reports page deletes a report. "Download JSON" saves a report as a file on the device, and "Open JSON" shows it in a new browser tab from a local blob URL, only when the person asks. Both include a "not a diagnosis" note, and nothing is uploaded. "Import JSON" reads a file locally. localStorage is not encrypted, so anyone with access to the browser profile can read the data, and in some private-browsing modes data last only for the session (in-memory fallback). Re-checked against the code on 2026-11-15: the only external URLs in the app are two links a person can click (the NASA page on About and the references list).

## Known limitations

**Scientific**

- Not clinically validated, not a medical device, and not endorsed by NASA. The app gives no diagnosis.
- Most thresholds are general adult references from Earth populations (AHA, ADA, MedlinePlus, AASM, PHQ-2 studies). Spaceflight changes fluid distribution, heart rate, sleep, and metabolism, so these values may not fit astronauts (`references.md` → "Population and limitations").
- Spaceflight sources used for context have small samples (for example 8 ISS astronauts in REF-18, 4 Inspiration4 crew in REF-55) or are ground analogs (REF-48, REF-52).
- Some parameters are team decisions without a source. Several owner decisions are open: crew-comparison parameters P-9–P-11, RULE-16 precedence, proposals P16-1–P16-4, evidence items C-5 and C-7 (`progress.md`).
- RULE-28 (short sleep before an EVA) is approved but not evaluated, because the app has no task schedule (AU-8).
- Sex is an optional attribute for evidence notes only. There are no sex-specific thresholds, and the evidence on sex differences in spaceflight is limited (REF-59–REF-62).
- Crew averages come from simulated readings and cannot show that any value is safe.

**Technical**

- No wearable or sensor integration; all readings are typed by hand or simulated.
- No backend, accounts, synchronization, or roles; the crew comparison has no real data source.
- Data live in one browser's localStorage. They are lost when site data are cleared, are not shared between devices, are not encrypted, and may last only for the session in private browsing.
- No secure medical-record infrastructure, audit trail, or access control.
- Mission phase and zone are set by hand. "Auto" mode follows the device light or dark preference, not habitat lighting.

**User testing**

- No usability testing with astronauts, flight surgeons, or other participants.
- Accessibility checks are automated only: token contrast for 16 theme combinations and keyboard flows in jsdom. There has been no manual keyboard pass in a real browser, no screen-reader test, and no true 320 px render of seeded pages. No WCAG conformance is claimed (`design-decisions.md`).

**Data quality**

- Manual entry depends on correct devices, technique, and context (rest, fasting, method). The app records context but cannot check it.
- Validation is structural only (required fields, numbers, non-negative values, scales). An implausible value such as a typo is accepted and evaluated as entered.
- The PHQ-2 stores only the total score; the daily mood rating is a trend measure only.
- Pain logs are self-reported and never interpreted.
- The simulated demo and crew data are deterministic and calmer than real data. The crew of five is too small for stable averages, and the matching is by calendar day, not time of day.

## Disclaimer (canonical)

Reuse this text word for word in the UI, README, video, and slides.

> haoma is a hackathon prototype for education and demonstration. It is not a medical device, is not clinically validated, and does not replace a flight surgeon or other medical professional. Demonstration data are fictional unless specifically identified otherwise.
