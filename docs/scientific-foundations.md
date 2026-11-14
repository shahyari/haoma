# Scientific foundations and indicator knowledge table

**Responsibility:** The authoritative source for health indicators, the evidence behind them, interpretation rules, and preventive actions. The app may implement only what is recorded here with status **Approved**.
**Policy:** `science.md` defines the evidence statuses and labels. **Citations:** use only IDs from `references.md`.

> Not medical guidance. Do not invent spaceflight-specific thresholds. Do not describe general clinical ranges as NASA-approved astronaut thresholds.

**Source of this content:** the owner's research table "Astronaut Health Indicator Knowledge Table", imported 2026-11-13. Threshold and action wording is the owner's, preserved verbatim. Claude added the rule IDs, the labels (derived from the owner's own caveats), the REF mapping, and the open decisions. The owner's decisions OD-1 to OD-9 were applied on 2026-11-13 and 2026-11-14; the owner drafted them with Claude assistance. **All rules and answers were approved by the owner (Hossein Shahyari) on 2026-11-14.**

## Scope

- **Intended user:** the astronaut (owner decision 2026-11-13; see `product.md`).
- **Guidance boundaries:** per `science.md` → "Guidance policy". This covers educational and preventive guidance, measurement explanations, potential reasons for concern, and escalation to the crew medical officer or flight surgeons. It excludes unvalidated diagnostic conclusions.
- TODO: Describe the self-assessment purpose and mission context.

**Label codes** (`science.md` → Guidance policy):
- **SE** = Spaceflight evidence
- **GCR** = General clinical reference (general population, not astronaut-specific)
- **TDD** = Team design decision
- **SDL** = Simulated demo logic

"Threshold" = what triggers the rule; "Action" = what the app tells the user to do. A dash (—) means the rule has no action.

## Indicator summary

| Indicator | Unit / input | How it's measured in space | HRP risk (hazard) | Preventive actions | Evidence | Status |
|---|---|---|---|---|---|---|
| Blood pressure | mmHg (systolic / diastolic), cuff reading at rest | ISS Crew Health Care System includes blood pressure cuffs and an ECG/BP monitor (JAXA). CSA Bio-Monitor wearable also records BP. | Risk of Cardiovascular Adaptations (altered gravity) | Regular exercise and a healthy diet; before landing, extra fluids and lower-body compression garments (NASA CV risk page). | REF-17, 18, 19, 20, 21, 44, 45 | Approved |
| Heart rate | beats per minute, at rest (ideally first thing after waking) | ECG/BP monitor in the ISS Crew Health Care System; CSA Bio-Monitor records pulse and heart electrical activity; Polaris Dawn (2024) was planned to test a commercial device that collects blood pressure, heart rate, respiration rate and temperature in flight [REF-54]. | Risk of Cardiovascular Adaptations (altered gravity) | Same as blood pressure: exercise and diet; fluids and compression garments before gravity transitions. | REF-22, 18, 23, 21, 54 | Unverified (changed 2026-11-14, OD-13) |
| Blood glucose | mg/dL, tagged Fasting / Non-fasting / Unknown and Fingerstick / CGM | Ax-4 (2025) "Suite Ride" demo: crew wore continuous glucose monitors all mission, checked against fingersticks and lab analysis; Axiom reported it as the first CGM of ISS crew. Not yet routine NASA operations. | Risk of Inadequate Food and Nutrition (closed environment, distance from Earth) | Regular meals with consistent carbohydrate; NASA notes reduced food variety lowers how much crews eat (HERA data). | REF-24, 25, 26, 27, 28, 29, 46 | Approved |
| Body temperature | °C, with the method recorded (oral or forehead sensor) | Stahn et al. measured core temperature with forehead sensors on the ISS. CSA Bio-Monitor records skin temperature. | Risk of Altered Immune Response (radiation, closed environment): latent herpesviruses reactivate during 6-month ISS missions (HRP overview). | Fluids and rest for mild fever (Cleveland Clinic); cool down after exercise before measuring. | REF-30, 31, 32, 33, 21 | Approved |
| Sleep | hours per night (self-report or actigraphy) | Wrist actigraphy plus a sleep diary (Barger 2014). | Risk of Performance Decrements and Adverse Health Outcomes from Sleep Loss, Circadian Desynchronization and Work Overload | LED lighting that mimics Earth's light-dark cycle and designated relaxation/self-care time (NASA); avoiding blue-wavelength light before bed (Barger). | REF-35, 36, 37, 38, 39 | Approved |
| Mood | PHQ-2 score (0–6) every 14 days, plus an optional daily 1–5 mood rating (trend only) | Self-report questionnaires; NASA also uses a cognitive test battery (WinSCAT) in flight (BMed evidence report). | Risk of Adverse Cognitive or Behavioral Conditions and Psychiatric Disorders (isolation and confinement, distance from Earth) | Designated relaxation and self-care time (NASA); sleep protection; crew communication. | REF-40, 41, 42, 43 | Approved |

## Indicators and interpretation rules

A rule may run in the app only when its status is **Approved**. Until then the UI shows a neutral trend or a "consider professional review" message. The decisions OD-1 to OD-9 are applied below. All rules RULE-01–RULE-30 are `Approved` (owner, 2026-11-14).

### Team-set parameters (OD-5)

No published standard exists for these, so all are **TDD**. They must be configurable in code and shown in the UI as "team-set parameters".

| Parameter | Value | Used by |
|---|---|---|
| P-1 Baseline | Rolling median of the last 7 valid readings taken with the **same method** (temperature) or **at rest** (heart rate). No time-of-day matching: the "similar time of day" clause was removed until a supported comparison method exists (OD-14, AU-7) | RULE-07, RULE-14, RULE-16, RULE-29 |
| P-2 Baseline minimum | 5 valid readings before any baseline rule fires; until then, only the fixed ranges apply | All baseline rules |
| P-3 HR shift | Resting heart rate ±10 bpm from baseline | RULE-29 |
| P-4 Temperature shift | +0.5 °C above baseline ("close to baseline" = within 0.5 °C) | RULE-14, RULE-16 |
| P-5 Mood trend | 3-day average daily rating at least 1 point below the 14-day average | RULE-22 |
| P-6 Post-exercise window | Ignore temperature readings taken within 30 min after exercise | RULE-14–RULE-17 |
| P-7 Regular short sleep | ≤ 6 h on 3 or more of the last 7 nights | RULE-20 |
| P-8 Transition windows | **Approaching landing:** from 24 h before the planned landing until landing. **Post-landing:** from landing until 72 h after (day 3). Informed by REF-47 (recovery "profound within the first 24 h", but intolerance still seen on day 3) and REF-48 (fluid loading 1–3 h before re-entry); no source states these windows | RULE-26, RULE-30 |

### Mission phase (OD-3, OD-8)

A mission-phase setting: **In flight / Approaching landing / Post-landing**, with windows from P-8. In the demo the phase comes from the simulated mission timeline (**SDL**). It can also be set manually, for example when the flight surgeon ends the post-landing phase early.

- **Approaching landing:** **no lower bar**, because lightheadedness on standing cannot occur in microgravity. The app shows the pre-landing reminder instead (RULE-30).
- **Post-landing:** the lower low-BP bar is active (RULE-26).
- **Lunar or Mars surface:** no study gives a window for landing in partial gravity. The same setting is used, and this use is **unvalidated**.

### Blood pressure

**Space-specific notes:**
- On the ISS, 24-h average BP fell ~8–10 mmHg after 3–6 months while heart rate stayed the same and stroke volume/cardiac output rose 35–41% (Norsk 2015, n=8) [REF-18].
- NASA lists low BP and fainting at landing among the top cardiovascular risks, so watch gravity transitions (landing, lunar/Mars surface) [REF-19, REF-23].

**Caveats / team decisions:**
- Low BP: AHA defines hypotension as "less than 90/60 mm Hg", "usually not harmful unless there are other symptoms" [REF-44; Mayo Clinic gives the same figure, REF-45]. Wording confirmed against the owner's PDF exports 2026-11-14. Mayo also says "Most healthcare professionals consider blood pressure to be too low only if it causes symptoms", which supports the symptom split in RULE-05 and RULE-25.
- Escalation wording is a team proposal, not a NASA flight rule.

| Rule | Tier | Condition | Action | Threshold | Action label | Evidence | Status |
|---|---|---|---|---|---|---|---|
| RULE-01 | 🟢 Normal | Below 120 and below 80 (AHA "Normal"). | — | GCR | — | REF-17 | Approved |
| RULE-02 | 🟡 Attention | 120–139 systolic or 80–89 diastolic (AHA "Elevated" / "Stage 1"). | Re-measure after rest and watch the trend. | GCR | TDD | REF-17 | Approved |
| RULE-03 | 🔴 Escalate | 140+ or 90+ (AHA "Stage 2") | Report at next flight-surgeon contact. | GCR | TDD | REF-17 | Approved |
| RULE-04 | 🔴 Escalate | Above 180 and/or above 120 (AHA "Severe hypertension"; with symptoms, AHA "Hypertensive emergency") | "Your blood pressure is above 180/120. Sit quietly for 1 minute, then measure again. If it is still this high, or you have chest pain, shortness of breath, back pain, numbness, weakness, a change in vision or difficulty speaking, contact the crew medical officer or flight surgeon now." (OD-9: AHA's 1-minute re-check and symptom list; one urgency level, which is stricter than AHA's "call your healthcare professional" for the no-symptom case) | GCR | TDD | REF-17 | Approved |
| RULE-05 | 🟡 Attention (measurement review) | Below 90/60 = systolic < 90 **or** diastolic < 60 (OD-14, AU-4), with no symptoms | Re-measure and compare with the trend. | GCR | TDD | REF-44, REF-45 | Approved |
| RULE-25 | 🔴 Escalate | Below 90/60 (systolic < 90 or diastolic < 60) with dizziness, faintness, blurred vision or fainting | "Stop what you're doing and secure yourself. Re-measure in 5 minutes. If symptoms continue or you fainted, contact the crew medical officer or flight surgeon." | GCR | TDD | REF-44, REF-45 | Approved |
| RULE-26 | 🟡 Attention | Mission phase is **Post-landing** (P-8) and the astronaut reports lightheadedness, dizziness, blurred vision or faintness, **even when BP is 90/60 or higher**. Below 90/60 with these symptoms → RULE-25 🔴 instead | "You reported feeling lightheaded or dizzy after landing. Move slowly, and sit or hold on before standing up. Take a blood pressure reading now. If it is below 90/60, or your symptoms get worse, contact the crew medical officer or flight surgeon." | TDD | TDD | Informed by REF-47, REF-19, REF-23; explanation REF-45 | Approved |
| RULE-30 | Reminder (not a detection rule) | Mission phase is **Approaching landing** (P-8) | "Landing is within 24 hours. Follow your flight surgeon's pre-landing plan for fluids and compression garments." | TDD (window P-8) | TDD | Informed by REF-19, REF-48 | Approved |

- **RULE-26 evidence:** 60–80% of astronauts could not complete a 10-min 80° head-up tilt test 4–6 h after landing from long-duration flight. Recovery "is profound within the first 24 h of landing". In an earlier study, one ISS astronaut "was unable even to start the tilt test on R+1, and two astronauts failed to complete the entire 10 min of tilt on R+3" [REF-47]. Both of these findings are Lee 2020 reporting the authors' earlier work, not new data from that study. Checked by Claude 2026-11-14.
- **RULE-30 evidence:** "the optimal time for crew to begin fluid loading is within 1 to 3 h prior to re-entry" [REF-48]. This comes from a **ground study**: 16 people in 6-hour head-down tilt, which simulates microgravity. The same paper notes that "fluid loading alone may be an inadequate countermeasure for all crewmembers". The reminder defers to the flight surgeon's plan and does not prescribe a fluid amount or timing.
- **Not used as a trigger (OD-10):** systolic BP 20 mmHg or more below baseline. Mayo Clinic says "A sudden fall in blood pressure can be dangerous. A change of just 20 mm Hg can make you feel dizzy or faint" [REF-45], but this describes how a drop causes symptoms, not an alert level for readings without symptoms. An in-flight baseline also runs lower (REF-18), and the drop occurs on standing, not in resting readings.
- **Explanation text (OD-10):** the RULE-26 alert may explain: "A sudden drop in blood pressure of 20 mmHg can be enough to make you feel dizzy or faint (Mayo Clinic)." Label: GCR, REF-45.

### Heart rate

**Space-specific notes:**
- Long-duration ISS flight left resting heart rate unchanged on average (Norsk 2015), so a large shift from personal baseline is worth attention [REF-18].
- NASA lists heart arrhythmias among the top cardiovascular risks [REF-23].

**Caveats / team decisions:**
- The 60–100 range is AHA's; the symptom-based red criteria are a team proposal drawn from general clinical guidance, not a NASA rule.
- REF-22 wording confirmed (owner PDF, 2026-11-14): "For most adults, a resting heart rate between 60 and 100 beats per minute is normal." AHA adds that a good time to check is "in the morning after you've had a good night's sleep, before you get out of bed", which matches the input guidance.

| Rule | Tier | Condition | Action | Threshold | Action label | Evidence | Status |
|---|---|---|---|---|---|---|---|
| RULE-06 | 🟢 Normal | 60–100 bpm at rest (AHA). Lower rates can be normal in very fit people. Resting readings only (OD-14, OD-15). | — | GCR | — | REF-22 | Approved |
| RULE-07 | 🟡 Attention | Below 60 or above 100 at rest without symptoms. Resting readings only; a rate after activity is never interpreted against this range (OD-15) | Re-check at rest the next morning and compare with personal baseline. | GCR | TDD | REF-22; baseline P-1 | Approved |
| RULE-29 | 🟡 Attention | Resting HR differs from the personal baseline by P-3 (±10 bpm), with the baseline minimum P-2 met | "Your resting heart rate is [X] bpm, which is [N] bpm [above/below] your usual. Re-check at rest tomorrow morning. If it stays different, or you feel dizzy, short of breath or notice an irregular heartbeat, contact the flight surgeon." (Symptoms lead to the same contact as RULE-08, so the two rules don't conflict.) | TDD | TDD | Informed by REF-18 | Approved |
| RULE-08 | 🔴 Escalate | **Symptom-based, for any reading, resting or after activity (OD-15):** dizziness, fainting, breathlessness or chest pain with a rate outside 60–100, or a felt irregular rhythm. The clause "a rate regularly above 100 at rest" is not evaluated (OD-14) | Contact flight surgeon. | TDD | TDD | Informed by REF-22, REF-23 | Approved |

### Blood glucose

**Space-specific notes:**
- Insulin resistance has been reported in spaceflight, but published data conflict (Commun Biol 2023) [REF-26].
- On the ISS, fasting carbohydrate use rose, largely explained by diet changes (ENERGY study, 2024) [REF-27].
- In-flight precedent: CGM demonstration on Ax-4 (2025) [REF-28].
- Real pre/post-flight serum glucose exists for the 4 Inspiration4 crew (OSD-575): 7 timepoints from L-92 to R+194, no in-flight samples, fasting status not recorded. It does not support or contradict any threshold here, and the readings would be tagged context "Unknown" (OD-4). Three of the four crew read 36–44 mg/dL at R+45 while all their other readings were 56–103 mg/dL; the metadata gives no explanation, so these values must not be presented as a spaceflight effect. Do not use them as demo baselines unless the R+45 values are excluded or explained in the UI. Context only; status `Unverified` (OD-13) [REF-55].

**Input context (OD-4):**
- **Context tag:** Fasting / Non-fasting / Unknown. Fasting = "no caloric intake for at least 8 h" [REF-46].
- **Device tag:** Fingerstick / CGM. The demo uses manual fingerstick-style entry.
- ADA cutoffs refer to plasma glucose; one fingerstick or CGM reading is not a diagnosis.
- **The app never uses the word "diabetes".**
- Non-fasting readings without symptoms appear in the trend only.

| Rule | Tier | Applies to | Condition | Action | Threshold | Action label | Evidence | Status |
|---|---|---|---|---|---|---|---|---|
| RULE-09 | 🟢 Normal | Fasting | Fasting 70–99 mg/dL (ADA normal is below 100). 70 mg/dL "has been recognized as a threshold for neuroendocrine responses to falling glucose in people without diabetes" (REF-25). | — | GCR | — | REF-46 (Table 2.5), REF-24, REF-25 | Approved |
| RULE-10 | 🟡 Attention | Fasting | Fasting 100–125 (ADA impaired-fasting-glucose range) | Repeat a fasting test and review meals/activity. | GCR | TDD | REF-46 (Table 2.5: "FPG 100 mg/dL (5.6 mmol/L) to 125 mg/dL (6.9 mmol/L) (IFG)"), REF-24 | Approved |
| RULE-11 | 🟡 Attention | Any context | 54–69 mg/dL **with no hypoglycemia symptoms** (ADA Level 1, defined for people with diabetes) | "Re-test now. If you feel shaky, sweaty, confused or unwell, eat fast-acting carbohydrate." | GCR (54/70, people with diabetes) + TDD (symptom gate, informed by REF-53) | TDD | REF-25, REF-53 | Approved |
| RULE-12 | 🔴 Escalate | Any context | Below 54 (ADA Level 2, clinically significant), **or below 70 with hypoglycemia symptoms**. Confusion or needing help to treat = Level 3 (severe). | Treat now and notify crew medical officer / flight surgeon. | GCR (54/70, people with diabetes) + TDD (symptom gate, informed by REF-53) | TDD | REF-25, REF-53 | Approved |

- **Low-glucose symptom gate (OD-12):** for adults without diabetes, the Endocrine Society recommends evaluating hypoglycemia "only in patients in whom Whipple's triad … is documented": symptoms, a low reading, and symptoms resolving once glucose is raised [REF-53]. So a low number without symptoms gives 🟡 re-test (RULE-11), and a low number with symptoms gives 🔴 (RULE-12). The 54 and 70 levels come from ADA's classification for people with diabetes [REF-25] and are labeled that way in the UI.
- **Symptom checklist:** shakiness, irritability, confusion, fast heartbeat (tachycardia), sweating, hunger. ADA: "Symptoms of hypoglycemia include, but are not limited to, shakiness, irritability, confusion, tachycardia, sweating, and hunger" [REF-25]. Checked by Claude 2026-11-14.
| RULE-13 | 🔴 Escalate | Fasting | Fasting 126+ (ADA threshold; needs a repeat test to confirm) | Report to flight surgeon. | GCR | TDD | REF-46 (Table 2.2), REF-24 | Approved |
| RULE-27 | 🔴 Escalate | Non-fasting / Unknown | Random glucose ≥ 200 mg/dL **with classic symptoms of hyperglycemia** ("In a patient with classic symptoms of hyperglycemia or hyperglycemic crisis, a random plasma glucose ≥200 mg/dL") | "This glucose reading is high, and you reported symptoms. Re-test to confirm, then contact the crew medical officer or flight surgeon today. If you feel very unwell, contact them now." (Never says "diabetes".) Symptom checklist (OD-9): urinating much more than usual; very thirsty; losing weight without trying; much hungrier than usual; blurred vision. Source: ADA 2010, "Symptoms of marked hyperglycemia include polyuria, polydipsia, weight loss, sometimes with polyphagia, and blurred vision" [REF-49]. Caveat: weight loss and vision changes can have other causes in spaceflight, so they may cause false alarms (not sourced here). | GCR | TDD | REF-46 (Table 2.2, verified by Claude 2026-11-13), REF-49 (symptom list) | Approved |

### Body temperature

**Space-specific notes:**
- Resting core temperature rose ~1 °C over ~2.5 months on the ISS, reaching about 38 °C; during exercise it often exceeded 40 °C (Stahn et al. 2017) [REF-32].
- So a fixed Earth fever cutoff may false-alarm on long missions.

**Caveats / team decisions (OD-1):**
- The rules use both the personal baseline and the fixed cutoffs.
- Stahn et al. measured core temperature with a forehead sensor; the source doesn't show whether oral readings rise the same way in flight. Always record the measurement method, and compare a reading only against a baseline taken with the same method.
- Readings within 30 min after exercise are ignored (P-6).

| Rule | Tier | Condition | Action | Threshold | Action label | Evidence | Status |
|---|---|---|---|---|---|---|---|
| RULE-14 | 🟢 Normal | **Oral readings only (OD-15):** below 37.5 °C, and within 0.5 °C of the oral baseline (P-4) | — | GCR (37.5 °C) + TDD (baseline margin) | — | REF-50 (oral fever "above 99°F to 99.5°F (37.2°C to 37.5°C), depending on the time of day"), REF-31; P-1, P-4 | Approved |
| RULE-15 | 🟡 Attention | **Oral readings only (OD-15):** 37.5–37.9 °C (often called low-grade fever) | Rest, drink fluids, re-check in a few hours. Do not judge right after exercise. | GCR | GCR (fluids/rest: "Drink fluids and rest", REF-50); exercise note = TDD | REF-50, REF-31 (the term "low-grade"); REF-32 | Approved |
| RULE-16 | 🔴 Escalate | **Oral readings only (OD-15):** ≥ 38.0 °C **and** either reported symptoms or a reading more than 0.5 °C above the oral baseline. Until a baseline exists (P-2), ≥ 38.0 °C alone. "Symptoms" stays undefined: any reported symptom flag counts; no list is invented (OD-15) | Report, especially with other symptoms. | GCR (38.0 °C) + TDD (baseline/symptom condition) | TDD | REF-30, REF-32; P-4 | Approved |
| RULE-17 | 🔴 Escalate (urgent medical review) | **Oral readings only.** A single reading of **40.6 °C (105 °F) or higher** (OD-16; was 39.4 °C). Fixed ceiling; the baseline never overrides it. No persistence trigger | Contact flight surgeon promptly. | GCR (REF-50: "Have a fever of 105°F (40.6°C) or higher", under "Contact your provider right away") | TDD | REF-50 | Approved (OD-16) |
| RULE-31 | 🟡 Attention (measurement review) | **Oral readings only.** A single reading from **39.4 °C up to, but not including, 40.6 °C** (39.4 ≤ x < 40.6). One reading does not show a persistent fever; not an emergency classification. RULE-16 still applies to the same reading when its conditions are met | Re-measure and compare with the trend. (Wording reused from RULE-05; improved wording proposed under "OD-16 proposals") | GCR (REF-50 names 103 °F / 39.4 °C for a fever that "stays at or keeps rising above" it) + TDD (single-reading review band, OD-16) | TDD | REF-50 | Approved (OD-16, logic) |

### Sleep

**Space-specific notes:**
- NASA schedules 8.5 h of sleep, but crews averaged ~6.1 h on the ISS and ~6.0 h on the Shuttle; only 24% of ISS sleep episodes reached 7 h, and ~75% of ISS crew used sleep medication (Barger et al. 2014, Lancet Neurology) [REF-37].
- Noise, temperature, light and 16 sunrises a day disrupt sleep (NASA) [REF-38].

**Caveats / team decisions (OD-2):**
- The ≤ 6 h statement is confirmed by the owner from the AASM press release, quoting moderator Nathaniel Watson: "Our Consensus Panel found that sleeping six or fewer hours per night is inadequate to sustain health and safety in adults" [REF-36]. It comes from the press release, not the consensus paper; the paper supports only the under-7-hours threshold [REF-35].
- "On a regular basis" is undefined in both sources; the team uses P-7.
- Self-reported hours tend to differ from actigraphy; label the source.

| Rule | Tier | Condition | Action | Threshold | Action label | Evidence | Status |
|---|---|---|---|---|---|---|---|
| RULE-18 | 🟢 Normal | 7 hours or more (AASM/SRS consensus for adults 18–60). | — | GCR | — | REF-35 | Approved |
| RULE-19 | 🟡 Attention, labeled **"Below general sleep recommendation"** (general adult guidance, not validated for astronauts) | A single night under 7 hours, when RULE-20 does not apply (OD-14, AU-1; was "more than 6 but under 7 hours") | Adjust schedule and lighting; watch for a run of short nights. | GCR | TDD (informed by REF-38) | REF-35, REF-36 | Approved |
| RULE-20 | 🔴 Escalate | 6 hours or fewer on a regular basis (P-7: ≥ 3 of the last 7 nights) | Raise at next private medical conference, and before EVAs or critical operations. | GCR (≤ 6 h, press release) + TDD (P-7) | TDD | REF-36; P-7 | Approved |
| RULE-28 | 🟡 Attention (optional) | A single night of ≤ 6 h before an EVA or other critical operation | "You slept 6 hours or less, and an EVA or critical task is scheduled. Let your flight surgeon know before it starts, and protect your next sleep period." (The go/no-go decision stays with the flight surgeon.) | TDD | TDD | Informed by REF-36, REF-38 | Approved |

### Mood

**Space-specific notes:**
- NASA: adverse behavioral health events are relatively rare on current missions, but the likelihood rises greatly with mission length; isolation and confinement can degrade cognitive and behavioral functioning [REF-42, REF-43].

**Caveats / team decisions (OD-6):**
- PHQ-2 is administered **every 14 days**; it asks about the past 2 weeks (GCR, REF-51). It is a screener, not a diagnosis.
- The daily 1–5 rating is a team design, not a validated scale. It is used for the trend only and **never triggers 🔴 Escalate on its own** (TDD).
- **No self-harm question is asked** in this prototype: it would collect a high-risk answer with no clinician reviewing or responding.
- The app does **not** administer the PHQ-9.
- PHQ-2 reuse terms: REF-41.

| Rule | Tier | Condition | Action | Threshold | Action label | Evidence | Status |
|---|---|---|---|---|---|---|---|
| RULE-21 | 🟢 Normal, labeled **"Below screening cutoff"** | PHQ-2 score 0–2 within the last 14 days (OD-14, OD-15), and stable daily ratings. A score below the cutoff does not rule out depression | — | GCR (validated cutoff of 3, REF-51) | — | REF-51, REF-40 | Approved |
| RULE-22 | 🟡 Attention | A declining daily mood trend (P-5). The PHQ-2 score-2 trigger was removed (OD-15): the app uses one cutoff, 3 | Check in, use self-care time, talk to crewmates. | TDD (daily trend) | TDD (informed by REF-42) | REF-42; P-5 | Approved |
| RULE-23 | 🔴 Escalate, labeled **"Further assessment recommended"** | PHQ-2 score 3 or more within the last 14 days (validated cutpoint: "a PHQ-2 score > or =3 had a sensitivity of 83% and a specificity of 92% for major depression", primary care and obstetrics-gynecology patients) | "The flight surgeon or behavioral health team can do a fuller assessment." Arrange a private conference with the flight surgeon / behavioral health. | GCR | TDD | REF-51, REF-40 | Approved |
| RULE-24 | Safety message (not a detection rule) | Always shown on every mood screen | "If you're having thoughts of harming yourself, contact the flight surgeon now." | — | TDD | — | Approved |

## Owner decisions applied (2026-11-13)

| ID | Decision | Applied in |
|---|---|---|
| OD-1 | Temperature: use both the baseline and the fixed cutoffs; 39.4 °C stays fixed; 0.5 °C margin; 30-min post-exercise window; compare only with a same-method baseline | RULE-14–RULE-17, P-4, P-6 |
| OD-2 | Sleep: ≤ 6 h attribution confirmed (press release); "regular" = ≥ 3 of the last 7 nights; optional pre-EVA rule | RULE-19, RULE-20, RULE-28, P-7 |
| OD-3 | Low BP: < 90/60 split into 🟡 (no symptoms) and 🔴 (with symptoms); mission-phase setting with a lower bar during transitions | RULE-05, RULE-25, RULE-26 |
| OD-4 | Glucose: context and device tags; fasting-only vs. any-context rules; random ≥ 200 with symptoms; never say "diabetes" | RULE-09–RULE-13, RULE-27 |
| OD-5 | Baselines: median of 7, minimum 5, starting shift values, configurable and shown as team-set parameters | P-1–P-5, RULE-29 |
| OD-6 | Mood: PHQ-2 every 14 days; daily rating trend-only; self-harm as a fixed safety line; no PHQ-9 in the app | RULE-21–RULE-24 |
| OD-7 | Secondary sources replaced or superseded | `references.md` |
| OD-8 (2026-11-14) | Transition windows: Approaching landing = 24 h before landing, with a reminder and no lower bar; Post-landing = 72 h, with the lower bar (any reported lightheadedness → 🟡); no baseline-drop trigger; action wording for RULE-26–RULE-29; REF-47 and REF-48 added | P-8, RULE-26–RULE-30 |
| OD-9 (2026-11-14) | RULE-04 follows AHA's 1-minute re-check and full symptom list, with one urgency level ("now"); RULE-27 checklist = the full ADA 2010 list; REF-49 added | RULE-04, RULE-27 |
| OD-10 (2026-11-14) | The Mayo 20 mmHg statement is used only as RULE-26 explanation text, not as a trigger | RULE-26 |
| OD-11 (2026-11-14) | C-1: MedlinePlus (REF-50) approved as a 2b source and primary for temperature; C-3: REF-46 primary for fasting glucose; C-4: Kroenke 2003 (REF-51) for PHQ-2, with score 2 as a team decision | RULE-09, RULE-10, RULE-13–RULE-15, RULE-17, RULE-21–RULE-23 |
| OD-12 (2026-11-14) | C-2: low glucose is symptom-gated (Endocrine Society, REF-53); the ADA 54/70 levels are kept and labeled "defined for people with diabetes"; symptom checklist from REF-25 | RULE-09, RULE-11, RULE-12 |
| OD-14 (2026-11-14) | Owner decisions on the implementation audit: AU-1 conditionally approved (single nights < 7 h labeled "Below general sleep recommendation", 🟡 only; RULE-20 and its precedence kept); AU-2 to be revised (see audit); AU-3 frequency threshold rejected, rest state recorded, repeated readings > 100 described only; AU-4 approved (systolic < 90 OR diastolic < 60; review vs. escalation kept separate); AU-5 approved (PHQ-2 result current for 14 days, then "Screening due"); AU-6 no expiry threshold, timestamps shown; AU-7 "similar time of day" removed. PHQ-2 labels: 0–2 "Below screening cutoff", 3–6 "Further assessment recommended", overdue "Screening due", no data "Not assessed" | P-1, RULE-05, RULE-06–RULE-08, RULE-19, RULE-21–RULE-25, RULE-29 |
| OD-16 (2026-11-14) | RULE-17 limited to a single oral reading ≥ 40.6 °C; new RULE-31 = measurement review for 39.4 ≤ x < 40.6 °C (oral); no automated persistence trigger; forehead "Not evaluated" explained to the user; REF-56 approved; new symptom-based rules and wording changes to be proposed first (below) | RULE-17, RULE-31; REF-56 |
| OD-15 (2026-11-14) | Temperature: method required for new entries; RULE-14–RULE-17 apply to oral readings only; forehead and legacy (method not recorded) readings show trend and same-method baseline comparison, unclassified; baselines never mix methods; "keeps rising" trigger removed; no symptom list invented. PHQ-2: one cutoff (3); score 2 alone no longer gives 🟡; the daily trend part of RULE-22 is unchanged. Heart rate: rate-based rules use resting readings only; RULE-08 symptom-based escalation applies to every reading | RULE-08, RULE-14–RULE-17, RULE-21, RULE-22 |
| OD-13 (2026-11-14) | OSDR cross-check (owner's report, Claude Desktop): C-5 Inspiration4 smartwatch claim replaced by the NASA Polaris Dawn source; C-6 bare OSDR root URL updated; C-7 OSD-575 added as glucose context; C-8 no in-flight Inspiration4 blood claim found. No threshold or rule changed. Changed items are `Unverified` until the owner approves them | Heart rate row, Blood glucose notes |

**Still open (owner):** approve the OD-13 items (`references.md` → "Policy compliance review", C-5 to C-8):
- C-5: the Heart rate row (now `Unverified`) and REF-54.
- C-7: the OSD-575 glucose note and REF-55.
- Optional: also cite REF-54 ("planned" wording) in the Blood pressure, Body temperature and Sleep rows and the "Which measurements can be performed in space?" answer.
- Optional: whether the app shows OSD-575 as a "real crew reference" panel, labeled "pre/post-flight, ground samples, fasting unknown". Under the current rules, the R+45 values would trigger RULE-12 🔴 for three crew members.

## Implementation audit (Claude, 2026-11-14) and owner decisions (OD-14)

The app implements RULE-01–RULE-30 as written above (`src/rules/`). Thresholds are half-open intervals that follow the wording ("below 90" = < 90; "120–139" = 120 ≤ x < 140). When several rules apply, the most severe tier is shown and every non-Normal finding is listed. Readings no rule classifies are shown as **Not evaluated**, never as Normal. Tests: `src/rules/evaluate.test.ts` ("audit" and "AU-" blocks).

| ID | Gap found | Owner decision (OD-14) | Implemented |
|---|---|---|---|
| AU-1 | One or two nights of ≤ 6 h fell between RULE-19 and RULE-20 | Conditionally approved: a single night < 7 h is "Below general sleep recommendation" (general adult guidance, REF-35); RULE-20 and its precedence unchanged; never an emergency | Yes: RULE-19 widened; 🟡 only |
| AU-2 | Temperature: 38.0–39.3 °C near baseline without symptoms; sub-fever rise above baseline; RULE-16 symptoms undefined; oral threshold applied to forehead readings; "keeps rising" undefined | OD-15: method-specific rules (oral only); no invented symptom list or escalation; "keeps rising" trigger removed | Yes. AU-2a (38.0–39.3 °C near baseline) and AU-2b stay **Not evaluated** with the baseline difference shown as a fact |
| AU-3 | "a rate regularly above 100 at rest" (RULE-08) undefined | Proposed 3-of-7 threshold rejected. Record rest vs. after activity; describe repeated readings > 100, no frequency threshold | Yes: rest state required for new entries; RULE-06, RULE-07, RULE-29 and the baseline use resting readings only; history shows "resting readings above 100 bpm in the last 7 days: N of M" as a description |
| AU-4 | "below 90/60" did not say one or both numbers | Approved: systolic < 90 OR diastolic < 60 (REF-44 gives "less than 90/60"; the OR reading is the owner's decision). RULE-05 = measurement review (🟡, re-measure); RULE-25 = escalation (🔴, with symptoms) | Yes: condition wording and the low number shown in the finding |
| AU-5 | The latest PHQ-2 drove the status with no age limit | Approved: a result is current for 14 days, then history, and the next screening is due. The 2-week recall period is part of the questionnaire and stays distinct from the 14-day schedule | Yes, with the owner's four labels |
| AU-6 | No age limit for the latest reading | No expiry threshold. Keep history, show timestamps, separate check-in completeness from the latest reading's status | Yes: Home shows "Latest reading <date>" per indicator and counts today's check-ins separately |
| AU-7 | P-1 "a similar time of day" undefined | Removed until a supported comparison method exists; baseline calculations kept | Yes |
| AU-8 | RULE-28 needs an EVA / critical-task schedule | — | Not evaluated |

**Fixed without changing a rule:** RULE-20 counted entries, so two entries for the same night counted as two short nights. It now counts nights (latest entry per local calendar day), as P-7 states.

### AU-2 evidence (Claude, 2026-11-14)

Evidence checked against the approved sources (the basis of OD-15):

- **≥ 38.0 °C:** CDC defines fever as "a measured temperature of 100.4°F [38°C] or greater" (REF-30). This is a public-health screening definition for ill travelers on aircraft and ships, and it names no measurement site. MedlinePlus gives an adult **oral** level of 37.2–37.5 °C, depending on the time of day (REF-50). It gives no forehead level. In-flight core temperature can reach about 38 °C (REF-32, forehead core sensor). The 38.0 °C level is a general adult reference, not an astronaut-specific trigger.
- **Symptom lists:** CDC (REF-30) lists signs that, together with fever, make an ill traveler reportable (for example "skin rash", "difficulty breathing", "persistent cough"). It is a public-health reporting list, not a clinical triage list. Under OD-15 it is **not** used as the RULE-16 list.

### OD-16 implementation and verification (Claude, 2026-11-14)

- **Boundaries:** RULE-17 is `celsius >= 40.6`, matching REF-50's "105°F (40.6°C) or higher". RULE-31 is `39.4 <= celsius < 40.6`, the band the owner set. Exact conversions: 103 °F = 39.44 °C and 105 °F = 40.56 °C. REF-50 rounds both to one decimal, and the app uses its Celsius values. A two-decimal entry of 40.56 °C (exactly 105 °F) therefore falls in RULE-31, not RULE-17. REF-50's persistence item is "above 103°F" (> 39.44 °C). The RULE-31 band starts at 39.4 °C by owner decision, not because of that item.
- **Precedence:** RULE-16 (≥ 38.0 °C with symptoms, a baseline jump, or no baseline yet) has no upper bound in its approved wording. It still applies up to 40.6 °C, so a higher reading never gets a lower tier than a lower one (tested from 36.0 to 42.0 °C). As a result, a single 39.4–40.5 °C reading still escalates through RULE-16 when there is no baseline yet, when it is more than 0.5 °C above the baseline, or when symptoms are reported. RULE-31 alone (🟡) applies only near an already high baseline without symptoms. See "Open decisions".
- **Persistence:** not automated. REF-50's "stays at or keeps rising" has no time window or measurement conditions.
- **Forehead and method-unknown readings:** still Not evaluated. The history page explains that no approved forehead rule exists, that "Not evaluated" does not mean normal, that the method matters, and that an unexpectedly high reading should be verified with a repeat measurement and medically reviewed. No forehead threshold is used.
- **Symptoms:** every reported symptom is shown next to the latest reading. When the status is Normal or Not evaluated, the page says that no approved rule assesses these symptoms on their own. This is a display of the data, not a rule.
- **RULE-08 irregular rhythm:** REF-23 (NASA) names "heart arrythmias" as a spaceflight cardiovascular risk but gives no crew procedure. NHLBI (REF-57) lists irregular heartbeat and palpitations as arrhythmia signs. The action "Contact flight surgeon." is a **team design decision**, labeled TDD in the UI, not a NASA protocol.
- **General references:** RULE-14–RULE-17 and RULE-31 are general adult clinical references (REF-50, REF-30), not validated astronaut-specific escalation thresholds.

### OD-16 proposals (Claude, 2026-11-14) — not implemented; owner approval needed

| ID | Proposal | Evidence | Labels |
|---|---|---|---|
| P16-1 RULE-32 (new, heart rate) | 🔴 for **chest pain**, **fainting**, or **severe difficulty breathing** reported with any heart-rate reading, at any rate, resting or after activity. Wording: "You reported [symptom]. Seek medical review now: contact the crew medical officer or flight surgeon." Needs a new symptom option, "Severe difficulty breathing", separate from "Breathlessness" | NHLBI heart attack: "Call 9-1-1 for emergency medical care", "Never delay calling 9-1-1" (REF-58); NHLBI arrhythmia: for "very serious" symptoms "such as difficulty breathing or chest pain", seek emergency care (REF-57). AHA warning-signs page: automated access blocked (403); owner PDF export needed to add it | GCR (symptom urgency) + TDD (wording, recipient) |
| P16-2 RULE-08 split and wording | Split RULE-08 into (a) a rate outside 60–100 with dizziness or breathlessness, and (b) irregular-rhythm reporting. Reword the action to "Seek medical review: tell the crew medical officer or flight surgeon." (team design decision; not a NASA protocol). Chest pain and fainting move to P16-1 | REF-22, REF-23, REF-57 | TDD |
| P16-3 RULE-31 and RULE-17 wording | RULE-31: "Re-measure to confirm. If your temperature stays at or keeps rising above 39.4 °C, contact the flight surgeon." (advice text only, not an automated trigger). RULE-17: "Seek urgent medical review: contact the crew medical officer or flight surgeon now." | REF-50 | GCR + TDD |
| P16-4 Temperature symptoms | A symptom check that does not depend on the temperature value needs an approved list. Candidates: CDC REF-30 (public-health reporting list) or the REF-50 "contact right away" items. Neither is a clinical triage list | REF-30, REF-50 | Decision needed |

**Mood and PHQ-2 (2026-11-14):** the item wording, the stem ("Over the last 2 weeks, how often have you been bothered by the following problems?"), the answer scale (0–3 per item) and the total (0–6) match REF-40. The app uses **one cutoff, 3** (REF-51; OD-15). A meta-analysis also reports a cutoff of 2: sensitivity 0.91 and specificity 0.67 for ≥ 2, against 0.72 and 0.85 for ≥ 3 (semistructured-interview studies). It recommends ≥ 2 mainly as the first step before a PHQ-9 [REF-56, approved by the owner as a supporting reference, OD-16]. In short: ≥ 2 catches more cases (higher sensitivity) at the cost of more false positives (lower specificity). The cutoff of 3 is not clinically validated for astronauts. The prototype does not mix the two cutoffs. The app states that the PHQ-2 is a screener validated in primary care and obstetrics-gynecology patients, not in astronauts, that it is neither a diagnosis nor a daily mood rating, and that a score below the cutoff does not rule out depression.

## Challenge guiding questions → evidence

These map to `challenge.md` S-03a–e. All answers are drawn from the imported table; approved by the owner 2026-11-14.

| Question | Answer summary | Evidence | Status |
|---|---|---|---|
| Which measurements can be performed in space? | BP cuffs and an ECG/BP monitor (ISS Crew Health Care System), the CSA Bio-Monitor wearable, forehead core-temperature sensors, wrist actigraphy, CGM (Ax-4 demonstration only), and self-report questionnaires | REF-20, 21, 28, 32, 37, 43 | Approved |
| Why is an exam needed? | Spaceflight shifts BP, temperature, sleep, glucose metabolism, immune function, and behavioral health, while crews are far from Earth and must self-monitor | REF-01, 18, 26, 32, 33, 38, 42 | Approved |
| How do spaceflight hazards affect these indicators? | See the space-specific notes per indicator | Per indicator | Approved |
| When might a result warrant attention from crew or flight surgeons? | See the 🟡 and 🔴 rules (RULE-01–RULE-30) | Per rule | Approved |
| What actions can prevent a critical health condition? | See preventive actions in the summary table | REF-19, 29, 31, 38, 42 | Approved |

## Unresolved scientific questions

| ID | Question | Status after import |
|---|---|---|
| SQ-01 | Which indicators can be measured in-flight, and how? | Candidate answer in the summary table |
| SQ-02 | Which HRP risk or hazard links to each indicator? | Candidate answer in the summary table; cross-check with REF-05 and REF-12–REF-16 |
| SQ-03 | Any spaceflight-specific numeric thresholds, or only general clinical? | Candidate answer: only general clinical cutoffs found; spaceflight evidence informs context and baselines |
| SQ-04 | Personal baseline vs. fixed ranges? | Candidate answer: both; baseline parameters P-1–P-5 (TDD) |
| SQ-05 | Validated mood instrument? | Candidate answer: PHQ-2 (validated screener) plus an ad hoc daily 1–5 rating (TDD) |
| SQ-06 | Documented preventive actions? | Candidate answer in the summary table |
| SQ-07 | Glucose units and context? | Candidate answer: mg/dL with context and device tags (OD-4) |
| SQ-08 | How to represent radiation (REF-07)? | Open: not covered by the table |

## Safety boundaries

- Do not claim to diagnose, predict, or treat conditions.
- Do not infer astronaut-specific clinical thresholds from ordinary Earth guidance.
- Keep source-derived information, team design decisions, and simulated demonstration logic separate and labeled.
- Encourage qualified medical review where warranted. Do not imply autonomous medical authority.
