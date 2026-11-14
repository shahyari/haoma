import { describe, expect, it } from 'vitest'

import type { HealthEntry } from './indicators'
import { validateEntry } from './validation'

const base = { id: 'e1', recordedAt: '2026-11-14T09:00:00.000Z', origin: 'userEntered' } as const

const validEntries: HealthEntry[] = [
  { ...base, indicator: 'bloodPressure', systolicMmHg: 118, diastolicMmHg: 76 },
  { ...base, indicator: 'heartRate', bpm: 58 },
  { ...base, indicator: 'bloodGlucose', mgDl: 92, context: 'fasting', device: 'fingerstick' },
  {
    ...base,
    indicator: 'bodyTemperature',
    celsius: 36.8,
    method: 'forehead',
    exercisedLast30Min: false,
  },
  { ...base, indicator: 'sleep', hours: 6.5, source: 'actigraphy' },
  { ...base, indicator: 'mood', kind: 'phq2', score: 0 },
  { ...base, indicator: 'mood', kind: 'dailyRating', rating: 5, symptoms: ['example'] },
]

function issuesOf(input: unknown) {
  const result = validateEntry(input)
  return result.ok ? [] : result.issues
}

describe('validateEntry', () => {
  it.each(validEntries)('accepts a valid $indicator entry', (entry) => {
    expect(validateEntry(entry)).toEqual({ ok: true, value: entry })
  })

  it('accepts simulated entries and keeps the origin', () => {
    const result = validateEntry({ ...validEntries[1], origin: 'simulated' })
    expect(result.ok && result.value.origin).toBe('simulated')
  })

  it('drops unknown fields', () => {
    const result = validateEntry({ ...validEntries[1], extra: 'x' })
    expect(result.ok && 'extra' in result.value).toBe(false)
  })

  it.each([null, undefined, 'text', 42, []])('rejects non-object input %j', (input) => {
    expect(issuesOf(input)).toEqual([{ field: '', code: 'notAnObject' }])
  })

  it('reports missing common fields', () => {
    expect(issuesOf({ indicator: 'heartRate', bpm: 60 })).toEqual([
      { field: 'id', code: 'required' },
      { field: 'recordedAt', code: 'required' },
      { field: 'origin', code: 'required' },
    ])
  })

  it('rejects an unknown indicator, origin, or date', () => {
    expect(issuesOf({ ...base, indicator: 'weight' })).toContainEqual({
      field: 'indicator',
      code: 'notAllowed',
    })
    expect(issuesOf({ ...validEntries[1], origin: 'imported' })).toContainEqual({
      field: 'origin',
      code: 'notAllowed',
    })
    expect(issuesOf({ ...validEntries[1], recordedAt: 'yesterday' })).toContainEqual({
      field: 'recordedAt',
      code: 'invalidDate',
    })
  })

  it('rejects numbers that are missing, not numbers, not finite, or negative', () => {
    const hr = { ...base, indicator: 'heartRate' }
    expect(issuesOf(hr)).toEqual([{ field: 'bpm', code: 'required' }])
    expect(issuesOf({ ...hr, bpm: '60' })).toEqual([{ field: 'bpm', code: 'notANumber' }])
    expect(issuesOf({ ...hr, bpm: Number.NaN })).toEqual([{ field: 'bpm', code: 'notFinite' }])
    expect(issuesOf({ ...hr, bpm: Infinity })).toEqual([{ field: 'bpm', code: 'notFinite' }])
    expect(issuesOf({ ...hr, bpm: -1 })).toEqual([{ field: 'bpm', code: 'negative' }])
  })

  it('reports every invalid field of an entry', () => {
    expect(
      issuesOf({
        ...base,
        indicator: 'bloodGlucose',
        mgDl: -5,
        context: 'postMeal',
        device: 'cgm',
      }),
    ).toEqual([
      { field: 'mgDl', code: 'negative' },
      { field: 'context', code: 'notAllowed' },
    ])
  })

  it('accepts a legacy temperature without a method, but rejects an unknown method', () => {
    const temp = { ...base, indicator: 'bodyTemperature', celsius: 37, exercisedLast30Min: false }
    expect(issuesOf(temp)).toEqual([])
    expect(issuesOf({ ...temp, method: 'ear', exercisedLast30Min: 'no' })).toEqual([
      { field: 'method', code: 'notAllowed' },
      { field: 'exercisedLast30Min', code: 'notABoolean' },
    ])
  })

  it('enforces the defined scales of the mood instruments', () => {
    const mood = { ...base, indicator: 'mood' }
    expect(issuesOf({ ...mood, kind: 'phq2', score: 7 })).toEqual([
      { field: 'score', code: 'outOfScale' },
    ])
    expect(issuesOf({ ...mood, kind: 'phq2', score: 1.5 })).toEqual([
      { field: 'score', code: 'notAnInteger' },
    ])
    expect(issuesOf({ ...mood, kind: 'dailyRating', rating: 0 })).toEqual([
      { field: 'rating', code: 'outOfScale' },
    ])
    expect(issuesOf({ ...mood, kind: 'journal' })).toEqual([{ field: 'kind', code: 'notAllowed' }])
  })

  it('rejects a malformed symptom list', () => {
    expect(issuesOf({ ...validEntries[1], symptoms: 'dizzy' })).toEqual([
      { field: 'symptoms', code: 'invalidList' },
    ])
    expect(issuesOf({ ...validEntries[1], symptoms: ['ok', ''] })).toEqual([
      { field: 'symptoms', code: 'invalidList' },
    ])
  })

  it('applies no health ranges: any finite non-negative reading is structurally valid', () => {
    expect(validateEntry({ ...base, indicator: 'heartRate', bpm: 0 }).ok).toBe(true)
    expect(validateEntry({ ...base, indicator: 'heartRate', bpm: 999 }).ok).toBe(true)
  })
})
