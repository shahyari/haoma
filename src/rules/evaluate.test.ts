import { describe, expect, it } from 'vitest'

import type { HealthEntry } from '@/domain/indicators'
import type { MissionPhase } from '@/domain/mission'
import type { SymptomId } from '@/domain/symptoms'

import { evaluateIndicator } from './evaluate'

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
const hr = (bpm: number, symptoms?: SymptomId[], day = 1): HealthEntry => ({
  ...at(day),
  indicator: 'heartRate',
  bpm,
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

function run(entries: HealthEntry[], missionPhase: MissionPhase = 'inFlight') {
  const result = evaluateIndicator(entries[0].indicator, entries, { missionPhase })
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
    [6, 'none'],
  ])('%f h → %s', (hours, expected) => {
    expect(run([sleep(hours)])).toBe(expected)
  })
  it('escalates 6 h or less on 3 of the last 7 nights (RULE-20, P-7)', () => {
    expect(run([sleep(5, 1), sleep(8, 2), sleep(6, 3), sleep(8, 4)])).toBe('normal RULE-18')
    expect(run([sleep(5, 1), sleep(8, 2), sleep(6, 3), sleep(5.5, 4)])).toBe('escalate RULE-20')
    expect(run([sleep(5, 1), sleep(6, 2), sleep(8, 3), sleep(8, 9), sleep(5, 10)])).toBe('none')
  })
})

describe('mood (RULE-21–23)', () => {
  it.each([
    [0, 'normal RULE-21'],
    [1, 'normal RULE-21'],
    [2, 'attention RULE-22'],
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
