# Data provenance, simulation, and limitations

**Responsibility:** A submission-facing record of every data element's origin, how the demo profiles and simulated history were made, the public privacy statement, known limitations, and the **canonical disclaimer**. Engineering constraints (no secrets, storage design) are in `architecture.md`.

## Data inventory

| Data element | Origin | Real or simulated? | Collection / generation method | Source (REF ID or N/A) | Restrictions |
|---|---|---|---|---|---|
| Indicator entries typed by the user | The person using the app | User-entered (labeled "Manual entry") | Entry form; structural validation only | N/A | Stored only in this browser |
| Pain logs (body map) | The person using the app | Self-reported (the app adds no data) | Body map: location on the model (region or organ name, position, surface normal, 3D or 2D view), date and time of the pain (default now, no future times), intensity 1–10, optional character, optional note (max 240 characters) | N/A | Stored only in this browser; never interpreted, classified, or used by any rule |
| Pain reports | The person using the app, or an imported report file | Self-reported | "Save report" moves the chosen pain logs into a report with the astronaut name (the fictional demo profile) and the save date; "Import JSON" adds a report file after validation | N/A | Stored only in this browser; opened or downloaded as a JSON file only when the person asks; an imported file is read locally and never uploaded |
| Demo history | `src/demo/demo.ts` | Simulated (labeled "Simulated") | Deterministic generator (see below) | N/A (Simulated demo logic) | Not real astronaut data |
| Demo profile "Alex Morgan" | `src/demo/demo.ts` | Fictional (labeled "Fictional profile") | Provisional profile set by the owner 2026-11-14 | N/A | — |
| Rule thresholds and wording | `scientific-foundations.md` | Reference information | Copied from the approved rules | REF IDs per rule | General-population references, not astronaut-specific |

## Demo profiles

One provisional fictional profile (owner decision 2026-11-14): **Alex Morgan**, Flight Engineer, **Aster-1 Lunar Transit Mission**, Mission Day 42. The person and mission are invented; Home labels the profile "Fictional profile" and states that all demo health measurements are simulated. The mission day is a fixed display value, not derived from the data. Additional crew members are deferred. No real private health records.

**Edited entries:** an edited entry keeps its measurement time, gets `editedAt`, and is labeled "Manual entry (edited)", including a simulated entry that was edited, because the person set the new values.

## Simulated history generation

Generated in the browser by `createDemoEntries` (`src/demo/demo.ts`, written with AI assistance) on the first visit (nothing stored in this browser yet; owner request 2026-11-14), and again when the user chooses "Load demo data" in Settings → Demo controls. Stored demo data that nobody has added to or edited (every entry simulated, unedited, with a demo id) is regenerated on load when its newest reading is from an earlier day, so the latest readings are always from this morning (owner usability review, 2026-11-15). "Clear data" stores an empty dataset, so a cleared app is not refilled on the next visit:

- **Time range:** the 14 days before today, with one entry per indicator per day at 07:00 local time. Today has four readings at 07:00 (or just before the current time if it is earlier): blood pressure, heart rate, sleep and the mood rating. Glucose and temperature stay due, so the check-in is partly open.
- **Today's readings (fixed, Simulated demo logic):** 128/82 mmHg and 6.2 h of sleep, chosen so that approved rules put them at Attention (RULE-02, RULE-19) and Home shows banners on first load (owner usability review, 2026-11-15). Heart rate 66 bpm at rest, mood rating 4. No other demo night is 6 h or less, so RULE-20 does not apply and there is no Escalate.
- **Heart rate** entries are recorded "at rest".
- **Values:** drawn uniformly from fixed bands chosen by the team for a calm demo (blood pressure 108–118 / 68–76 mmHg, heart rate 62–70 bpm, fasting glucose 82–94 mg/dL by fingerstick, oral temperature 36.5–36.9 °C, self-reported sleep 6.5–7.9 h, daily mood rating 3–5) and one PHQ-2 of 0 ten days before today, so that it is still current (a PHQ-2 result counts for 14 days, OD-14). These bands are **Simulated demo logic**, not reference ranges.
- **Randomness:** a seeded generator (mulberry32, seed 2026), so the same day always produces the same history.
- **Reproduce:** call `createDemoEntries(date)`; a unit test checks that the output is deterministic, structurally valid, and labeled simulated.

## Reference information versus thresholds

TODO: Distinguish research citations, general clinical guidance, personal baseline calculations, and unvalidated demo-only rules. Use the evidence statuses from `science.md`.

## Privacy statement

haoma has no backend and makes no network requests with health data. Entries, pain logs, and saved pain reports (including their free-text notes) are stored only in this browser's localStorage (key `haoma:v1`) and display settings under `haoma:display:v1`. Nothing is saved remotely. "Clear my data" in Settings deletes all of them; "Clear all" in the pain log deletes the pain logs, and Delete on the Reports page deletes a report. "Download JSON" saves a report as a file on the device only when the person asks; it includes a "not a diagnosis" note. Checked against the code on 2026-11-14; re-check before submission.

## Known limitations

- TODO: scientific limitation
- TODO: technical limitation
- TODO: user testing limitation
- TODO: data quality limitation

## Disclaimer (canonical)

Reuse this text word for word in the UI, README, video, and slides.

> haoma is a hackathon prototype for education and demonstration. It is not a medical device, is not clinically validated, and does not replace a flight surgeon or other medical professional. Demonstration data are fictional unless specifically identified otherwise.
