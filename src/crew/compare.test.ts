import { describe, expect, it } from 'vitest'

import { createDemoEntries } from '@/demo/demo'
import type { HealthEntry } from '@/domain/indicators'
import { validateEntry } from '@/domain/validation'
import { evaluateAll } from '@/rules/evaluate'

import {
  comparability,
  crewAverageFor,
  crewRelation,
  mean,
  standardDeviation,
  type CrewDataSource,
  type CrewEntry,
} from './compare'
import { createCrewEntries, SELF_ID, simulatedCrewSource } from './simulated'

const now = new Date(2026, 10, 15, 12, 0)
const at = (dayOffset: number, hour = 7) =>
  new Date(2026, 10, 15 + dayOffset, hour, 0).toISOString()
let n = 0
const base = (dayOffset = 0, hour = 7) => ({
  id: `x${n++}`,
  recordedAt: at(dayOffset, hour),
  origin: 'simulated' as const,
})
const hr = (bpm: number, activity?: 'rest' | 'afterActivity', day = 0): HealthEntry => ({
  ...base(day),
  indicator: 'heartRate',
  bpm,
  ...(activity ? { activity } : {}),
})
const crew = (entries: [string, HealthEntry][]): CrewDataSource => ({
  kind: 'simulated',
  selfId: 'me',
  entries: entries.map(([memberId, entry]): CrewEntry => ({ memberId, entry })),
})

describe('crew average arithmetic', () => {
  it('is the arithmetic mean of the members, each member counted once', () => {
    const source = crew([
      ['a', hr(60, 'rest')],
      ['a', hr(64, 'rest')], // member a: mean 62
      ['b', hr(70, 'rest')],
      ['c', hr(66, 'rest')],
    ])
    const result = crewAverageFor(hr(70, 'rest'), source)
    expect(result.available).toBe(true)
    if (!result.available) return
    expect(result.members).toBe(3)
    expect(result.metrics.bpm!.mean).toBeCloseTo((62 + 70 + 66) / 3)
    expect(result.metrics.bpm!.sd).toBeCloseTo(standardDeviation([62, 70, 66]))
  })

  it('mean and sample standard deviation', () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5)
    expect(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3)
    expect(standardDeviation([5])).toBe(0)
  })

  it('excludes the selected astronaut, even when their readings are in the source', () => {
    const source = crew([
      ['me', hr(200, 'rest')],
      ['a', hr(60, 'rest')],
      ['b', hr(62, 'rest')],
      ['c', hr(64, 'rest')],
    ])
    const result = crewAverageFor(hr(70, 'rest'), source)
    expect(result.available && result.metrics.bpm!.mean).toBe(62)
    expect(result.available && result.members).toBe(3)
  })

  it('skips missing readings instead of counting them as zero', () => {
    const source = crew([
      ['a', hr(60, 'rest')],
      ['b', hr(62, 'rest')],
      ['c', hr(64, 'rest')],
      ['d', hr(66, 'rest', -1)], // another day: not a zero for today
    ])
    const result = crewAverageFor(hr(70, 'rest'), source)
    expect(result.available && result.metrics.bpm!.mean).toBe(62)
  })
})

describe('matching like with like', () => {
  it('never mixes resting and after-activity heart rate; unrecorded rest state is excluded with a reason', () => {
    const source = crew([
      ['a', hr(60, 'rest')],
      ['b', hr(62, 'rest')],
      ['c', hr(64, 'rest')],
      ['d', hr(120, 'afterActivity')],
      ['e', hr(90)],
    ])
    const rest = crewAverageFor(hr(70, 'rest'), source)
    expect(rest.available && rest.metrics.bpm!.mean).toBe(62)
    expect(rest.excluded).toEqual([{ reason: 'Rest state not recorded', count: 1 }])
    const after = crewAverageFor(hr(110, 'afterActivity'), source)
    expect(after.available).toBe(false)
    const own = crewAverageFor(hr(70), source)
    expect(own.available).toBe(false)
    expect(!own.available && own.reason).toMatch(/Rest state not recorded/)
  })

  it('compares temperature methods separately and leaves out post-exercise readings', () => {
    const temp = (
      celsius: number,
      method?: 'oral' | 'forehead',
      exercised = false,
    ): HealthEntry => ({
      ...base(),
      indicator: 'bodyTemperature',
      celsius,
      ...(method ? { method } : {}),
      exercisedLast30Min: exercised,
    })
    const source = crew([
      ['a', temp(36.5, 'oral')],
      ['b', temp(36.7, 'oral')],
      ['c', temp(36.6, 'oral')],
      ['d', temp(35.9, 'forehead')],
      ['e', temp(37.4, 'oral', true)],
    ])
    const oral = crewAverageFor(temp(36.8, 'oral'), source)
    expect(oral.available && oral.metrics.celsius!.mean).toBeCloseTo(36.6)
    expect(oral.available && oral.members).toBe(3)
    expect(crewAverageFor(temp(36.0, 'forehead'), source).available).toBe(false)
    expect(comparability(temp(36.6))).toEqual({ excluded: 'Measurement method not recorded' })
  })

  it('matches glucose by fasting state and device, and excludes an unknown fasting state', () => {
    const glucose = (
      mgDl: number,
      context: 'fasting' | 'nonFasting' | 'unknown',
      device: 'fingerstick' | 'cgm' = 'fingerstick',
    ): HealthEntry => ({ ...base(), indicator: 'bloodGlucose', mgDl, context, device })
    const source = crew([
      ['a', glucose(85, 'fasting')],
      ['b', glucose(90, 'fasting')],
      ['c', glucose(95, 'fasting')],
      ['d', glucose(140, 'nonFasting')],
      ['e', glucose(88, 'fasting', 'cgm')],
      ['f', glucose(100, 'unknown')],
    ])
    const result = crewAverageFor(glucose(92, 'fasting'), source)
    expect(result.available && result.metrics.mgDl!.mean).toBe(90)
    expect(result.excluded).toEqual([{ reason: 'Fasting state not recorded', count: 1 }])
    expect(crewAverageFor(glucose(140, 'nonFasting'), source).available).toBe(false)
  })

  it('averages systolic and diastolic independently', () => {
    const bp = (s: number, d: number): HealthEntry => ({
      ...base(),
      indicator: 'bloodPressure',
      systolicMmHg: s,
      diastolicMmHg: d,
    })
    const source = crew([
      ['a', bp(110, 70)],
      ['b', bp(120, 76)],
      ['c', bp(115, 82)],
    ])
    const result = crewAverageFor(bp(128, 82), source)
    expect(result.available && result.metrics.systolic!.mean).toBe(115)
    expect(result.available && result.metrics.diastolic!.mean).toBe(76)
  })

  it('compares daily mood ratings only and never aggregates PHQ-2 scores', () => {
    const rating = (r: number): HealthEntry => ({
      ...base(),
      indicator: 'mood',
      kind: 'dailyRating',
      rating: r,
    })
    const phq2 = (score: number): HealthEntry => ({
      ...base(),
      indicator: 'mood',
      kind: 'phq2',
      score,
    })
    const source = crew([
      ['a', rating(3)],
      ['b', rating(4)],
      ['c', rating(5)],
      ['a', phq2(6)],
      ['b', phq2(5)],
      ['c', phq2(4)],
    ])
    const result = crewAverageFor(rating(4), source)
    expect(result.available && result.metrics.rating!.mean).toBe(4)
    expect(result.excluded).toEqual([{ reason: 'PHQ-2 scores are never compared', count: 3 }])
    const own = crewAverageFor(phq2(2), source)
    expect(own.available).toBe(false)
  })

  it('matches the same mission day (local calendar day) only', () => {
    const source = crew([
      ['a', hr(60, 'rest', -1)],
      ['b', hr(62, 'rest', -1)],
      ['c', hr(64, 'rest', -1)],
      ['a', { ...hr(80, 'rest'), recordedAt: at(0, 23) }],
    ])
    expect(crewAverageFor({ ...hr(70, 'rest', -1) }, source).available).toBe(true)
    // Today only one member has a reading.
    const today = crewAverageFor(hr(70, 'rest'), source)
    expect(today.available).toBe(false)
  })
})

describe('privacy', () => {
  it('hides the average below the minimum cohort of 3 other members (P-9)', () => {
    const source = crew([
      ['a', hr(60, 'rest')],
      ['b', hr(62, 'rest')],
    ])
    const result = crewAverageFor(hr(70, 'rest'), source)
    expect(result.available).toBe(false)
    expect(!result.available && result.members).toBe(2)
    expect(!result.available && result.reason).toMatch(/shown from 3 members/)
    expect(JSON.stringify(result)).not.toMatch(/"a"|"b"/)
  })
})

describe('neutral relation (P-11)', () => {
  it('is "close" within half a standard deviation, otherwise above or below', () => {
    expect(crewRelation(64, { mean: 62, sd: 4 })).toBe('close')
    expect(crewRelation(65, { mean: 62, sd: 4 })).toBe('above')
    expect(crewRelation(59, { mean: 62, sd: 4 })).toBe('below')
    expect(crewRelation(62, { mean: 62, sd: 0 })).toBe('close')
  })
})

describe('simulated crew', () => {
  const entries = createCrewEntries(now)
  it('is deterministic, valid, simulated, and never includes the selected astronaut', () => {
    expect(createCrewEntries(now)).toEqual(entries)
    for (const { entry, memberId } of entries) {
      expect(validateEntry(entry).ok).toBe(true)
      expect(entry.origin).toBe('simulated')
      expect(memberId).not.toBe(SELF_ID)
      expect(Date.parse(entry.recordedAt)).toBeLessThan(now.getTime())
    }
    expect(new Set(entries.map((e) => e.memberId)).size).toBe(5)
  })

  it('gives today’s demo readings a crew average, but none for the lone forehead sensor', () => {
    const source = simulatedCrewSource(now)
    const demoToday = createDemoEntries(now).filter((e) => e.id.endsWith('-0'))
    for (const entry of demoToday) expect(crewAverageFor(entry, source).available).toBe(true)
    const forehead: HealthEntry = {
      ...base(),
      indicator: 'bodyTemperature',
      celsius: 36.4,
      method: 'forehead',
      exercisedLast30Min: false,
    }
    expect(crewAverageFor(forehead, source).available).toBe(false)
  })

  it('does not change any status: rules never see crew data', () => {
    const own = createDemoEntries(now)
    const before = evaluateAll(own, { missionPhase: 'inFlight', now })
    crewAverageFor(own.at(-1)!, simulatedCrewSource(now))
    expect(evaluateAll(own, { missionPhase: 'inFlight', now })).toEqual(before)
    // Even if crew readings were mixed in by mistake, they would be other people's — so they never are.
    expect(own.some((e) => e.id.startsWith('crew-'))).toBe(false)
  })
})
