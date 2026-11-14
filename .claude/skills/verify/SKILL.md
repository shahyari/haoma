---
name: verify
description: Verify haoma before claiming a Phase A step, a feature, a fix, or submission is complete. Runs the project's recorded checks (lint, typecheck, tests, build), then scientific-integrity, simulated-data, secrets, and placeholder checks, and reports exact commands and results. Use after a Phase A step or feature, before committing or deploying, at Checkpoints A/B/C, and before final submission.
argument-hint: "[A1–A11 | foundation | F-NN | submission]"
---

# Verify haoma

Target: `$ARGUMENTS` (default: the current step or feature in `docs/progress.md`). `foundation` = all of A1–A11 (Checkpoint A); `submission` = Checkpoint C.

Run every step below. Do not skip a step silently: mark it PASS, FAIL, or NOT APPLICABLE, with the reason. Never report PASS for something you did not run or inspect.

## 1. Project checks

1. Read only the "Commands" section of `docs/architecture.md`.
2. Run each recorded command that applies (lint/typecheck, tests, build) and capture the exit code and the key output lines.
3. If a command is still `TODO:`, report "not configured". Do not invent a command.

## 2. Acceptance criteria

Acceptance criteria come from the step's row in `docs/implementation.md` (Phase A) or from `docs/specs/F-NN-*.md` (Phase B); for `submission`, use the launch checklist. Check each criterion against the code or the running app, and cite the file:line or the observed behavior.

## 3. Scientific integrity

- Every health interpretation, threshold, or guidance message in the code has a Rule ID that exists in `docs/scientific-foundations.md` with status `Approved`. Search the code for numeric comparisons on indicator values and for message strings.
- Rules that are not Approved are inactive and fall back to a neutral message.
- No diagnostic labels, and no claims of clinical validation or NASA endorsement.
- Every REF ID used exists in `docs/references.md`.

## 4. Simulated data and disclaimer

- Every fictional profile and simulated value is visibly labeled in the UI.
- The disclaimer matches the canonical text in `docs/data-and-limitations.md`.

## 5. Secrets and private data

- `git status --porcelain` and `git ls-files` contain no `.env*` (other than `.env.example`), keys, or local settings.
- `git grep -nIiE '(api[_-]?key|secret|token|password|BEGIN [A-Z ]*PRIVATE KEY)'` has no real credentials. Review each hit.
- No real personal health information in the seed or demo data.

## 6. Placeholders (submission target only)

- `grep -rn "TODO:" README.md docs/submission.md docs/references.md docs/data-and-limitations.md docs/scientific-foundations.md` returns nothing. Otherwise, list each remaining item.
- Complete the "Final submission checks" in `docs/submission.md`.

## Report format

```
verify <target> — <PASS | FAIL>
1 Project checks: <cmd> → <exit code / result> (one line per command)
2 Acceptance: <criterion> → PASS/FAIL (evidence)
3 Science: PASS/FAIL (details)
4 Simulated data: PASS/FAIL
5 Secrets: PASS/FAIL
6 Placeholders: PASS/FAIL/N/A
Blockers: <list or none>
```

After a PASS, update `docs/progress.md` (status, files changed, verification, next action).
