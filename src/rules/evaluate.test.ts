import { describe, expect, it } from 'vitest'

import type { HealthEntry } from '@/domain/indicators'
import type { MissionPhase } from '@/domain/mission'
import type { SymptomId } from '@/domain/symptoms'

import { evaluateIndicator, personalBaseline, phq2Screening, restingAbove100 } from './evaluate'

let n = 0
/** Day `day` of a fictional timeline, at 07:00. */
function at(day: number) {
  return {
    id: `e${n++}`,
    recordedAt: new Date(Date.UTC(2026, 0, day, 7)).toISOString(),
    origin: 'simulated' as const,
  }
}
const bp = (sys: number, dia: number, symptoms?: SymptomId[], day = 1): HealthEntry => ({
  ...at(day),
  indicator: 'bloodPressure',
  systolicMmHg: sys,
  diastolicMmHg: dia,
  symptoms,
})
const hr = (
  bpm: number,
  symptoms?: SymptomId[],
  day = 1,
  activity: 'rest' | 'afterActivity' | null = 'rest',
): HealthEntry => ({
  ...at(day),
  indicator: 'heartRate',
  bpm,
  ...(activity ? { activity } : {}),
  symptoms,
})
const glucose = (
  mgDl: number,
  context: 'fasting' | 'nonFasting' | 'unknown',
  symptoms?: SymptomId[],
): HealthEntry => ({
  ...at(1),
  indicator: 'bloodGlucose',
  mgDl,
  context,
  device: 'fingerstick',
  symptoms,
})
const temp = (
  celsius: number,
  opts: {
    day?: number
    method?: 'oral' | 'forehead'
    exercised?: boolean
    symptoms?: SymptomId[]
  } = {},
): HealthEntry => ({
  ...at(opts.day ?? 1),
  indicator: 'bodyTemperature',
  celsius,
  method: opts.method ?? 'oral',
  exercisedLast30Min: opts.exercised ?? false,
  symptoms: opts.symptoms,
})
const sleep = (hours: number, day = 1): HealthEntry => ({
  ...at(day),
  indicator: 'sleep',
  hours,
  source: 'selfReport',
})
const phq2 = (score: number, day = 1): HealthEntry => ({
  ...at(day),
  indicator: 'mood',
  kind: 'phq2',
  score,
})
const rating = (value: number, day: number): HealthEntry => ({
  ...at(day),
  indicator: 'mood',
  kind: 'dailyRating',
  rating: value,
})

/** Reference time for the fictional timeline: day 14, noon. */
const NOW = new Date(Date.UTC(2026, 0, 14, 12))

function evaluate(entries: HealthEntry[], missionPhase: MissionPhase = 'inFlight', now = NOW) {
  return evaluateIndicator(entries[0].indicator, entries, { missionPhase, now })
}
function run(entries: HealthEntry[], missionPhase: MissionPhase = 'inFlight', now = NOW) {
  const result = evaluate(entries, missionPhase, now)
  return [result.status, ...result.findings.map((f) => f.rule.id)].join(' ')
}

describe('blood pressure (RULE-01–05, 25, 26)', () => {
  it.each([
    [119, 79, 'normal RULE-01'],
    [120, 79, 'attention RULE-02'],
    [119, 80, 'attention RULE-02'],
    [139, 89, 'attention RULE-02'],
    [140, 70, 'escalate RULE-03'],
    [130, 90, 'escalate RULE-03'],
    [180, 120, 'escalate RULE-03'],
    [181, 80, 'escalate RULE-04'],
    [150, 121, 'escalate RULE-04'],
    [90, 60, 'normal RULE-01'],
    [89, 70, 'attention RULE-05'],
    [100, 59, 'attention RULE-05'],
  ])('%i/%i → %s', (sys, dia, expected) => {
    expect(run([bp(sys, dia)])).toBe(expected)
  })

  it('escalates a low reading with symptoms (RULE-25)', () => {
    expect(run([bp(85, 55, ['dizziness'])])).toBe('escalate RULE-25')
  })
  it('ignores symptoms that the rule does not list', () => {
    expect(run([bp(85, 55, ['hunger'])])).toBe('attention RULE-05')
  })
  it('flags post-landing lightheadedness even at 90/60 or higher (RULE-26)', () => {
    expect(run([bp(110, 70, ['lightheadedness'])], 'postLanding')).toBe('attention RULE-26')
    expect(run([bp(110, 70, ['lightheadedness'])], 'inFlight')).toBe('normal RULE-01')
    expect(run([bp(110, 70, ['lightheadedness'])], 'approachingLanding')).toBe('normal RULE-01')
    expect(run([bp(85, 55, ['lightheadedness'])], 'postLanding')).toBe('escalate RULE-25')
  })
  it('uses the latest reading', () => {
    expect(run([bp(150, 95, undefined, 1), bp(115, 75, undefined, 2)])).toBe('normal RULE-01')
  })
})

describe('heart rate (RULE-06–08, 29)', () => {
  it.each([
    [60, 'normal RULE-06'],
    [100, 'normal RULE-06'],
    [59, 'attention RULE-07'],
    [101, 'attention RULE-07'],
  ])('%i bpm → %s', (bpm, expected) => {
    expect(run([hr(bpm)])).toBe(expected)
  })
  it('escalates out-of-range with symptoms, or an irregular rhythm at any rate (RULE-08)', () => {
    expect(run([hr(110, ['chestPain'])])).toBe('escalate RULE-08')
    expect(run([hr(70, ['irregularRhythm'])])).toBe('escalate RULE-08')
    expect(run([hr(70, ['dizziness'])])).toBe('normal RULE-06')
  })
  it('flags a shift of 10 bpm from the baseline once 5 readings exist (RULE-29, P-2, P-3)', () => {
    const four = [62, 64, 63, 65].map((v, i) => hr(v, undefined, i + 1))
    expect(run([...four, hr(80, undefined, 5)])).toBe('normal RULE-06')
    const five = [...four, hr(64, undefined, 5)]
    expect(run([...five, hr(73, undefined, 6)])).toBe('normal RULE-06')
    const result = evaluateIndicator('heartRate', [...five, hr(74, undefined, 6)], {
      missionPhase: 'inFlight',
    })
    expect(result.status).toBe('attention')
    expect(result.findings[0].message).toContain('74 bpm, which is 10 bpm above your usual')
  })
})

describe('blood glucose (RULE-09–13, 27)', () => {
  it.each([
    [70, 'fasting', 'normal RULE-09'],
    [99, 'fasting', 'normal RULE-09'],
    [100, 'fasting', 'attention RULE-10'],
    [125, 'fasting', 'attention RULE-10'],
    [126, 'fasting', 'escalate RULE-13'],
    [69, 'fasting', 'attention RULE-11'],
    [54, 'unknown', 'attention RULE-11'],
    [53, 'nonFasting', 'escalate RULE-12'],
    [150, 'nonFasting', 'none'],
    [250, 'unknown', 'none'],
  ] as const)('%i mg/dL %s → %s', (mgDl, context, expected) => {
    expect(run([glucose(mgDl, context)])).toBe(expected)
  })
  it('escalates below 70 with hypoglycemia symptoms (RULE-12)', () => {
    expect(run([glucose(65, 'nonFasting', ['sweating'])])).toBe('escalate RULE-12')
  })
  it('escalates a random reading of 200 or more only with hyperglycemia symptoms (RULE-27)', () => {
    expect(run([glucose(200, 'nonFasting', ['extremeThirst'])])).toBe('escalate RULE-27')
    expect(run([glucose(199, 'nonFasting', ['extremeThirst'])])).toBe('none')
    expect(run([glucose(200, 'unknown', ['sweating'])])).toBe('none')
  })
})

describe('body temperature (RULE-14–17)', () => {
  const steady = (value: number, method: 'oral' | 'forehead' = 'oral') =>
    [1, 2, 3, 4, 5].map((day) => temp(value, { day, method }))

  it.each([
    [37.4, 'normal RULE-14'],
    [37.5, 'attention RULE-15'],
    [37.9, 'attention RULE-15'],
    [38.0, 'escalate RULE-16'],
    [39.4, 'escalate RULE-17'],
  ])('%f °C without a baseline → %s', (celsius, expected) => {
    expect(run([temp(celsius)])).toBe(expected)
  })
  it('does not evaluate a reading taken after exercise (P-6)', () => {
    expect(run([temp(40.1, { exercised: true })])).toBe('none')
  })
  it('with a baseline, 38.0 or more escalates only with symptoms or more than 0.5 above it', () => {
    expect(run([...steady(37.8), temp(38.2, { day: 6 })])).toBe('none')
    expect(run([...steady(37.8), temp(38.2, { day: 6, symptoms: ['otherSymptoms'] })])).toBe(
      'escalate RULE-16',
    )
    expect(run([...steady(37.0), temp(38.2, { day: 6 })])).toBe('escalate RULE-16')
  })
  it('keeps the 39.4 ceiling regardless of the baseline', () => {
    expect(run([...steady(39.2), temp(39.4, { day: 6 })])).toBe('escalate RULE-17')
  })
  it('is not Normal below 37.5 when more than 0.5 above the baseline', () => {
    expect(run([...steady(36.4), temp(37.0, { day: 6 })])).toBe('none')
    expect(run([...steady(36.4), temp(36.9, { day: 6 })])).toBe('normal RULE-14')
  })
  it('builds the baseline only from readings with the same method', () => {
    expect(run([...steady(37.0, 'forehead'), temp(38.2, { day: 6, method: 'oral' })])).toBe(
      'escalate RULE-16',
    )
    expect(run([...steady(36.4, 'forehead'), temp(37.0, { day: 6, method: 'oral' })])).toBe(
      'normal RULE-14',
    )
  })
})

describe('sleep (RULE-18–20)', () => {
  it.each([
    [7, 'normal RULE-18'],
    [6.9, 'attention RULE-19'],
    [6.1, 'attention RULE-19'],
    [6, 'attention RULE-19'],
    [3, 'attention RULE-19'],
  ])('%f h → %s', (hours, expected) => {
    expect(run([sleep(hours)])).toBe(expected)
  })
  it('escalates 6 h or less on 3 of the last 7 nights (RULE-20, P-7)', () => {
    expect(run([sleep(5, 1), sleep(8, 2), sleep(6, 3), sleep(8, 4)])).toBe('normal RULE-18')
    expect(run([sleep(5, 1), sleep(8, 2), sleep(6, 3), sleep(5.5, 4)])).toBe('escalate RULE-20')
    expect(run([sleep(5, 1), sleep(6, 2), sleep(8, 3), sleep(8, 9), sleep(5, 10)])).toBe(
      'attention RULE-19',
    )
  })
})

describe('mood (RULE-21–23)', () => {
  it.each([
    [0, 'normal RULE-21'],
    [1, 'normal RULE-21'],
    [2, 'normal RULE-21'],
    [3, 'escalate RULE-23'],
    [6, 'escalate RULE-23'],
  ])('PHQ-2 %i → %s', (score, expected) => {
    expect(run([phq2(score)])).toBe(expected)
  })
  it('flags a declining daily trend, and never escalates on ratings alone (P-5)', () => {
    const stable = Array.from({ length: 11 }, (_, i) => rating(4, i + 1))
    expect(run([...stable, rating(4, 12), rating(4, 13), rating(4, 14)])).toBe('none')
    expect(run([...stable, rating(2, 12), rating(2, 13), rating(2, 14)])).toBe('attention RULE-22')
    expect(run([...stable, rating(1, 12), rating(1, 13), rating(1, 14)])).toBe('attention RULE-22')
    expect(run([phq2(0, 1), ...stable, rating(2, 12), rating(2, 13), rating(2, 14)])).toBe(
      'attention RULE-22',
    )
  })
})

describe('evaluateIndicator', () => {
  it('reports "missing" when there are no readings', () => {
    expect(evaluateIndicator('sleep', [], { missionPhase: 'inFlight' }).status).toBe('missing')
  })
})

/**
 * Rule audit (2026-11-14): boundaries with decimal input, overlaps, and
 * precedence. Thresholds are half-open intervals matching the source wording
 * ("below N" = < N; "N–M" = N ≤ x < M+1 for integers). When several rules
 * apply, the most severe tier wins and every non-Normal finding is shown.
 */
describe('audit: decimal boundaries', () => {
  it.each([
    [119.9, 79.9, 'normal RULE-01'],
    [139.9, 89.9, 'attention RULE-02'],
    [180.1, 80, 'escalate RULE-04'],
    [89.9, 70, 'attention RULE-05'],
  ])('BP %f/%f → %s', (sys, dia, expected) => {
    expect(run([bp(sys, dia)])).toBe(expected)
  })
  it.each([
    [69.9, 'fasting', 'attention RULE-11'],
    [99.9, 'fasting', 'normal RULE-09'],
    [125.9, 'fasting', 'attention RULE-10'],
    [53.9, 'fasting', 'escalate RULE-12'],
  ] as const)('glucose %f %s → %s', (mgDl, context, expected) => {
    expect(run([glucose(mgDl, context)])).toBe(expected)
  })
  it.each([
    [37.49, 'normal RULE-14'],
    [37.99, 'attention RULE-15'],
    [39.39, 'escalate RULE-16'],
  ])('temperature %f °C → %s', (celsius, expected) => {
    expect(run([temp(celsius)])).toBe(expected)
  })
  it.each([
    [6.01, 'attention RULE-19'],
    [6.99, 'attention RULE-19'],
  ])('sleep %f h → %s', (hours, expected) => {
    expect(run([sleep(hours)])).toBe(expected)
  })
})

describe('audit: overlaps and precedence', () => {
  it('BP: high systolic with low diastolic shows both findings ("below 90/60" read as either number)', () => {
    expect(run([bp(125, 58)])).toBe('attention RULE-02 RULE-05')
    expect(run([bp(150, 55)])).toBe('escalate RULE-03 RULE-05')
    expect(run([bp(150, 55, ['dizziness'])])).toBe('escalate RULE-03 RULE-25')
  })
  it('BP: post-landing symptoms add RULE-26 to an elevated reading', () => {
    expect(run([bp(130, 85, ['dizziness'])], 'postLanding')).toBe('attention RULE-02 RULE-26')
  })
  it('HR: an out-of-range reading and a baseline shift both show', () => {
    const five = [62, 64, 63, 65, 64].map((v, i) => hr(v, undefined, i + 1))
    expect(run([...five, hr(105, undefined, 6)])).toBe('attention RULE-07 RULE-29')
    expect(run([...five, hr(105, ['chestPain'], 6)])).toBe('escalate RULE-08 RULE-29')
  })
  it('glucose: a low fasting reading uses the any-context low rules, not RULE-09', () => {
    expect(run([glucose(60, 'fasting')])).toBe('attention RULE-11')
  })
  it('temperature: the 39.4 ceiling wins over every other condition', () => {
    expect(run([temp(39.4, { symptoms: ['otherSymptoms'] })])).toBe('escalate RULE-17')
  })
  it('sleep: the 3-of-7 pattern wins over a single good night', () => {
    expect(run([sleep(5, 1), sleep(5, 2), sleep(5, 3), sleep(8, 4)])).toBe('escalate RULE-20')
  })
  it('sleep: two entries for the same night count as one night', () => {
    const night = (hours: number, hour: number): HealthEntry => ({
      id: `n${n++}`,
      recordedAt: new Date(2026, 0, 2, hour).toISOString(),
      origin: 'simulated',
      indicator: 'sleep',
      hours,
      source: 'selfReport',
    })
    expect(run([sleep(5, 1), night(5, 6), night(5, 7), sleep(8, 3)])).toBe('normal RULE-18')
  })
  it('mood: a declining daily trend overrides a PHQ-2 of 0–1, and Normal is then not shown', () => {
    const stable = Array.from({ length: 11 }, (_, i) => rating(4, i + 1))
    expect(run([phq2(1, 1), ...stable, rating(2, 12), rating(2, 13), rating(2, 14)])).toBe(
      'attention RULE-22',
    )
  })
})

describe('audit: reported gaps stay "Not evaluated", never "Within reference"', () => {
  const steady = (value: number) => [1, 2, 3, 4, 5].map((day) => temp(value, { day }))
  it.each([
    [
      'temperature: 38.0–39.3 °C close to the baseline, no symptoms',
      () => [...steady(37.9), temp(38.3, { day: 6 })],
    ],
    [
      'temperature: below 37.5 °C but more than 0.5 °C above the baseline',
      () => [...steady(36.3), temp(36.9, { day: 6 })],
    ],
    ['glucose: non-fasting reading without symptoms', () => [glucose(180, 'nonFasting')]],
    ['glucose: non-fasting 200+ without symptoms', () => [glucose(240, 'unknown')]],
  ])('%s', (_label, make) => {
    expect(run(make())).toBe('none')
  })
  it('heart rate: repeated resting readings above 100 without symptoms stay Attention (AU-3: no frequency threshold)', () => {
    expect(run([101, 104, 108, 103].map((v, i) => hr(v, undefined, i + 1)))).toBe(
      'attention RULE-07',
    )
  })
})

/** Owner decisions of 2026-11-14 on the audit (AU-1, AU-3, AU-4, AU-5, AU-7). */
describe('AU-1 sleep: a single short night', () => {
  it('is "Below general sleep recommendation" (Attention), never Escalate', () => {
    for (const hours of [6.5, 6, 4, 0]) {
      const result = evaluate([sleep(hours)])
      expect(result.status).toBe('attention')
      expect(result.label).toBe('Below general sleep recommendation')
    }
  })
  it('keeps RULE-20 and its precedence for a run of short nights', () => {
    const result = evaluate([sleep(5, 1), sleep(6, 2), sleep(4, 3)])
    expect(result.status).toBe('escalate')
    expect(result.findings.map((f) => f.rule.id)).toEqual(['RULE-20'])
    expect(result.label).toBeUndefined()
  })
  it('7 h or more stays Within reference without the label', () => {
    expect(evaluate([sleep(7)]).label).toBeUndefined()
  })
})

describe('AU-3 heart rate: rest state', () => {
  it('does not evaluate a reading taken after activity or without a recorded rest state', () => {
    const after = evaluate([hr(130, undefined, 1, 'afterActivity')])
    expect(after.status).toBe('none')
    expect(after.note).toContain('after activity')
    const unknown = evaluate([hr(130, undefined, 1, null)])
    expect(unknown.status).toBe('none')
    expect(unknown.note).toContain('not recorded')
  })
  it('keeps the RULE-08 symptom and rhythm clauses for any reading', () => {
    expect(run([hr(130, ['chestPain'], 1, 'afterActivity')])).toBe('escalate RULE-08')
    expect(run([hr(80, ['irregularRhythm'], 1, null)])).toBe('escalate RULE-08')
  })
  it('builds the baseline from resting readings only', () => {
    const resting = [62, 64, 63, 65].map((v, i) => hr(v, undefined, i + 1))
    const active = hr(120, undefined, 5, 'afterActivity')
    // Only 4 resting readings: no baseline yet, so no RULE-29.
    expect(run([...resting, active, hr(80, undefined, 6)])).toBe('normal RULE-06')
    expect(run([...resting, hr(64, undefined, 5), hr(80, undefined, 6)])).toBe('attention RULE-29')
  })
  it('counts resting readings above 100 in the last 7 days as a description only', () => {
    const entries = [
      hr(104, undefined, 6),
      hr(108, undefined, 9),
      hr(99, undefined, 10),
      hr(120, undefined, 11, 'afterActivity'),
      hr(103, undefined, 13),
    ]
    expect(restingAbove100(entries, NOW)).toEqual({ above: 2, resting: 3 })
  })
})

describe('AU-4 blood pressure: below 90/60 = systolic < 90 or diastolic < 60', () => {
  it('names the low number, and separates measurement review from escalation', () => {
    const review = evaluate([bp(85, 70)])
    expect(review.findings[0].rule.id).toBe('RULE-05')
    expect(review.findings[0].reason).toBe('The systolic 85 is below 90. No symptoms reported.')
    const escalation = evaluate([bp(85, 55, ['fainting'])])
    expect(escalation.findings[0].rule.id).toBe('RULE-25')
    expect(escalation.findings[0].reason).toBe(
      'The systolic 85 is below 90 and diastolic 55 is below 60.',
    )
  })
})

describe('AU-5 PHQ-2: a result counts for 14 days', () => {
  const day = (d: number) => new Date(Date.UTC(2026, 0, d, 12))
  it('uses the labels set by the owner', () => {
    expect(evaluate([phq2(0)]).label).toBe('Below screening cutoff')
    expect(evaluate([phq2(3)]).label).toBe('Further assessment recommended')
    expect(phq2Screening([phq2(2)], NOW).state).toBe('belowCutoff')
    expect(phq2Screening([], NOW).state).toBe('notAssessed')
  })
  it('score 2 alone is "Below screening cutoff", with no Attention (OD-15)', () => {
    const result = evaluate([phq2(2)])
    expect(result.status).toBe('normal')
    expect(result.label).toBe('Below screening cutoff')
    expect(result.findings[0].reason).toBe('PHQ-2 score 2.')
  })
  it('the daily trend still gives Attention on its own, alongside a below-cutoff PHQ-2', () => {
    const stable = Array.from({ length: 10 }, (_, i) => rating(4, i + 1))
    expect(run([phq2(2, 1), ...stable, rating(2, 11), rating(2, 12), rating(2, 13)])).toBe(
      'attention RULE-22',
    )
  })
  it('becomes history after 14 days, and the mood status shows "Screening due"', () => {
    expect(run([phq2(5, 1)], 'inFlight', day(14))).toBe('escalate RULE-23')
    expect(phq2Screening([phq2(5, 1)], day(15))).toMatchObject({ state: 'due', current: false })
    const stale = evaluate([phq2(5, 1)], 'inFlight', day(15))
    expect(stale.status).toBe('none')
    expect(stale.label).toBe('Screening due')
  })
  it('shows "Not assessed" when only daily ratings exist and no trend applies', () => {
    const result = evaluate([rating(4, 1), rating(4, 2)])
    expect(result.status).toBe('none')
    expect(result.label).toBe('Not assessed')
  })
})

describe('OD-15 temperature: method-specific rules', () => {
  const series = (value: number, method: 'oral' | 'forehead') =>
    [1, 2, 3, 4, 5].map((day) => temp(value, { day, method }))
  const legacy = (celsius: number, day = 6): HealthEntry => ({
    ...at(day),
    indicator: 'bodyTemperature',
    celsius,
    exercisedLast30Min: false,
  })

  it.each([37.4, 37.5, 38.0, 39.4, 40.6])(
    'a forehead reading of %f °C is never classified, not even by the 39.4 °C rule',
    (celsius) => {
      const result = evaluate([temp(celsius, { method: 'forehead', symptoms: ['otherSymptoms'] })])
      expect(result.status).toBe('none')
      expect(result.note).toContain('forehead')
    },
  )
  it('oral boundaries are unchanged', () => {
    expect(run([temp(37.49)])).toBe('normal RULE-14')
    expect(run([temp(37.5)])).toBe('attention RULE-15')
    expect(run([temp(38.0)])).toBe('escalate RULE-16')
    expect(run([temp(39.39)])).toBe('escalate RULE-16')
    expect(run([temp(39.4)])).toBe('escalate RULE-17')
  })
  it('a legacy reading without a method is "not recorded", never assumed oral', () => {
    const result = evaluate([legacy(39.5, 1)])
    expect(result.status).toBe('none')
    expect(result.note).toContain('method was not recorded')
  })
  it('baselines never combine methods', () => {
    // Five forehead readings do not form a baseline for an oral reading.
    expect(
      personalBaseline('bodyTemperature', [...series(36.5, 'forehead'), temp(37.0, { day: 6 })]),
    ).toMatchObject({ value: undefined, readings: 0, method: 'oral' })
    expect(
      personalBaseline('bodyTemperature', [
        ...series(36.5, 'forehead'),
        temp(36.9, { day: 6, method: 'forehead' }),
      ]),
    ).toMatchObject({ value: 36.5, readings: 5, method: 'forehead' })
    // Legacy readings are left out of every baseline.
    const withLegacy = [...[1, 2, 3, 4].map((d) => temp(36.6, { day: d })), legacy(36.6, 5)]
    expect(
      personalBaseline('bodyTemperature', [...withLegacy, temp(36.7, { day: 6 })]),
    ).toMatchObject({ value: undefined, readings: 4 })
    expect(personalBaseline('bodyTemperature', [legacy(36.6, 1)])).toMatchObject({
      method: 'unknown',
      readings: 0,
    })
  })
  it('the post-exercise window (P-6) still comes first', () => {
    expect(evaluate([temp(39.6, { exercised: true })]).note).toContain('after exercise')
  })
})

describe('OD-15 heart rate: rate-based vs symptom-based', () => {
  it('never interprets an after-activity rate against the resting range', () => {
    for (const bpm of [45, 120, 170])
      expect(run([hr(bpm, undefined, 1, 'afterActivity')])).toBe('none')
  })
  it('symptom-based escalation applies to resting and after-activity readings alike', () => {
    expect(run([hr(130, ['chestPain'])])).toBe('escalate RULE-08')
    expect(run([hr(130, ['chestPain'], 1, 'afterActivity')])).toBe('escalate RULE-08')
    expect(run([hr(70, ['irregularRhythm'], 1, 'afterActivity')])).toBe('escalate RULE-08')
    expect(evaluate([hr(70, ['irregularRhythm'], 1, 'afterActivity')]).findings[0].reason).toBe(
      'Irregular heartbeat reported.',
    )
  })
  it('symptoms with a rate inside 60–100 do not escalate (only the approved conditions apply)', () => {
    expect(run([hr(90, ['breathlessness'], 1, 'afterActivity')])).toBe('none')
    expect(run([hr(90, ['breathlessness'])])).toBe('normal RULE-06')
  })
})

describe('no reading without an applicable rule is classified as Within reference', () => {
  const cases: [string, HealthEntry[]][] = [
    ['forehead temperature', [temp(36.8, { method: 'forehead' })]],
    [
      'temperature without method',
      [{ ...at(1), indicator: 'bodyTemperature', celsius: 36.8, exercisedLast30Min: false }],
    ],
    ['temperature after exercise', [temp(36.8, { exercised: true })]],
    ['heart rate after activity', [hr(75, undefined, 1, 'afterActivity')]],
    ['heart rate without rest state', [hr(75, undefined, 1, null)]],
    ['non-fasting glucose', [glucose(110, 'nonFasting')]],
    ['daily mood ratings only', [rating(4, 1)]],
    ['PHQ-2 older than 14 days', [phq2(0, 1)]],
  ]
  it.each(cases)('%s', (_label, entries) => {
    const now = _label.startsWith('PHQ-2') ? new Date(Date.UTC(2026, 0, 20)) : NOW
    expect(evaluate(entries, 'inFlight', now).status).toBe('none')
  })
})
