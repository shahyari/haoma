# Scientific integrity and evidence policy

**Responsibility:** The rules for handling evidence. Indicators, rules, and preventive actions live in `scientific-foundations.md`. Citations live in `references.md`.

## Evidence statuses

| Status | Meaning | Who may set it |
|---|---|---|
| `Unverified` | Candidate source or claim, not yet checked by a person. This is the default. | Claude or the owner |
| `Reviewed` | The owner opened the source and confirmed that it supports the exact claim and context. | Owner only |
| `Approved` | The owner explicitly approved the claim or rule for use in the app's UI or logic. | Owner only |

- Claude may research sources, add candidates, and recommend evidence. Claude records them as `Unverified` and never sets `Reviewed` or `Approved`.
- Only `Approved` interpretation rules may change app behavior or show attention/guidance messages.
- If a source changes or is found to be weaker than recorded, set the claim back to `Unverified` and disable the dependent rule.

## Evidence policy (owner, 2026-11-14)

1. **Astronaut-specific claims** come first from NASA, ESA, CSA (and other space agencies) and peer-reviewed spaceflight research (Tier 1).
2. **General clinical reference values** (thresholds, ranges, definitions used by a rule) come preferably from clinical guidelines and medical consensus statements (Tier 2a).
3. **Mayo Clinic** is approved as a credible, medically reviewed secondary source (Tier 2b) for general medical education, definitions, symptoms, reference ranges, and preventive advice. Use it for explanatory content and supporting general medical knowledge. Where a Tier 2a source covers the same value, the Tier 2a source is primary. MedlinePlus (U.S. National Library of Medicine) is approved on the same terms (OD-11, 2026-11-14). Any other Tier 2b source needs its own owner approval.
4. **Never assume** that Earth-based reference ranges or treatment recommendations are validated for astronauts in microgravity. Tier 2 values are always labeled "general population, not astronaut-specific".
5. **Keep the categories distinct** in the docs and the UI: spaceflight evidence, general clinical reference, team design decision, simulated prototype behavior (the four labels under "Guidance policy").
6. **Each scientific claim cites an exact source URL** (its `REF-NN` row in `references.md`) and documents the source's **applicable population and limitations** (`references.md` → "Population and limitations").
7. **No health alert, diagnostic logic, or treatment recommendation** is implemented without an approved evidence basis: an `Approved` rule whose sources satisfy points 1–6.

## Source tiers

Record the tier for every reference in `references.md`.

1. **Spaceflight-specific:** NASA Human Research Program, NASA technical reports, ESA, CSA and other space agencies' public resources, peer-reviewed spaceflight and spaceflight-analog studies (mark analogs, e.g., head-down tilt, as such).
2. **General clinical:** always labeled "general population, not astronaut-specific".
   - **2a: Clinical guidelines and consensus statements** from recognized bodies (e.g., AHA, ADA, AASM/SRS, CDC) and peer-reviewed clinical literature. Preferred for reference values.
   - **2b: Medically reviewed secondary sources.** Mayo Clinic and MedlinePlus are approved (point 3). Other 2b sources (patient-education pages, textbook summaries, university summary pages, a body's own press release) are listed with their status but need owner approval as 2b sources.
3. **Other:** challenge and event documents, license terms, commercial sources (company press releases, news summaries, manufacturer pages). Prefer replacing these with the primary source.

Rules that no source states are not references. They carry the label "Team design decision" or "Simulated demo logic" (see "Guidance policy").

## Rules

- Every threshold, health interpretation, and recommendation needs a specific citation (REF ID plus passage) in `scientific-foundations.md`.
- Do not infer astronaut-specific clinical thresholds from ordinary population guidelines.
- If evidence is insufficient, show a neutral trend or encourage professional review rather than a diagnostic status.
- Distinguish research evidence from personal measurements, and both from simulated data.
- Do not invent sources, URLs, quotes, or numbers. If a fact cannot be found, leave a `TODO:` and say so.
- Simulated or fictional data must be labeled everywhere it appears: UI, README, video, and slides. Provenance is recorded in `data-and-limitations.md`.

## Guidance policy (Q-01, approved by owner 2026-11-13)

The official challenge asks for "guidance on treatments and health improvements" and for presenting "diagnosis clearly" (`challenge.md` R-04, S-04). haoma meets this as follows:

**Allowed**

- Evidence-backed **educational guidance and preventive recommendations**, each linked to an `Approved` entry in `scientific-foundations.md`.
- **Explanations of health measurements**: what an indicator is, how to measure it correctly, and how spaceflight hazards may affect it.
- **Potential reasons for concern**, phrased as possibilities with their evidence and limitations.
- **Escalation support**: prompting the user to contact the crew medical officer or flight surgeons, with the reason and the relevant readings.

**Not allowed**

- Presenting unvalidated diagnostic conclusions as established medical fact.
- Diagnostic labels presented as conclusions.
- Treatment instructions that are not backed by `Approved` evidence.

**Evidence-type labels**

Every guidance item visibly carries its label. A rule has two parts, and each part carries exactly one label: the **threshold basis** (what triggers the rule) and the **action wording** (what the app tells the user to do). Both labels are shown when they differ.

| Label | Meaning | Basis |
|---|---|---|
| Spaceflight evidence | From NASA HRP, another space agency, or peer-reviewed spaceflight research | Tier 1 reference |
| General clinical reference | From general-population clinical guidance; not validated for astronauts | Tier 2 reference |
| Team design decision | A deliberate haoma team choice (e.g., escalation wording, symptom-based criteria, a personal-baseline approach, an ad hoc scale). It is informed by cited evidence but **not stated by any source**. Shown as the team's choice, never as evidence. Added by owner decision 2026-11-13. | Owner decision; cite the references that informed it |
| Simulated demo logic | Invented only for the demonstration; not evidence-based | None |

## Disclaimer

The canonical disclaimer text is in `data-and-limitations.md`. Reuse it word for word.
