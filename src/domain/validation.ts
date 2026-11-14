/**
 * Structural validation of health entries (Phase A step A7).
 *
 * Checks types, required fields, finite numbers, allowed enum values, the
 * defined scale of the mood instruments, and non-negative values where a
 * negative one is physically impossible. It encodes NO health ranges or
 * plausibility bounds (docs/implementation.md -> "Phase A boundaries").
 */
import {
  DAILY_MOOD_RATING_RANGE,
  ENTRY_ORIGINS,
  GLUCOSE_CONTEXTS,
  GLUCOSE_DEVICES,
  HEART_RATE_ACTIVITIES,
  INDICATOR_IDS,
  MOOD_KINDS,
  PHQ2_SCORE_RANGE,
  SLEEP_SOURCES,
  TEMPERATURE_METHODS,
  type HealthEntry,
} from './indicators'

export type ValidationCode =
  | 'required'
  | 'notAnObject'
  | 'notAString'
  | 'notANumber'
  | 'notFinite'
  | 'notAnInteger'
  | 'notABoolean'
  | 'negative'
  | 'outOfScale'
  | 'notAllowed'
  | 'invalidDate'
  | 'invalidList'

export interface ValidationIssue {
  field: string
  code: ValidationCode
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; issues: ValidationIssue[] }

type Raw = Record<string, unknown>

export function isRecord(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

class Checker {
  readonly issues: ValidationIssue[] = []
  private readonly raw: Raw
  constructor(raw: Raw) {
    this.raw = raw
  }

  private fail(field: string, code: ValidationCode): undefined {
    this.issues.push({ field, code })
    return undefined
  }

  string(field: string): string | undefined {
    const v = this.raw[field]
    if (v === undefined || v === null || v === '') return this.fail(field, 'required')
    if (typeof v !== 'string') return this.fail(field, 'notAString')
    return v
  }

  dateTime(field: string): string | undefined {
    const v = this.string(field)
    if (v === undefined) return undefined
    return Number.isNaN(Date.parse(v)) ? this.fail(field, 'invalidDate') : v
  }

  oneOf<T extends string>(field: string, allowed: readonly T[]): T | undefined {
    const v = this.string(field)
    if (v === undefined) return undefined
    return (allowed as readonly string[]).includes(v) ? (v as T) : this.fail(field, 'notAllowed')
  }

  boolean(field: string): boolean | undefined {
    const v = this.raw[field]
    if (v === undefined || v === null) return this.fail(field, 'required')
    return typeof v === 'boolean' ? v : this.fail(field, 'notABoolean')
  }

  number(field: string): number | undefined {
    const v = this.raw[field]
    if (v === undefined || v === null) return this.fail(field, 'required')
    if (typeof v !== 'number') return this.fail(field, 'notANumber')
    return Number.isFinite(v) ? v : this.fail(field, 'notFinite')
  }

  nonNegative(field: string): number | undefined {
    const v = this.number(field)
    if (v === undefined) return undefined
    return v < 0 ? this.fail(field, 'negative') : v
  }

  /** Integer on an instrument's defined scale (e.g., PHQ-2 total 0-6). */
  scale(field: string, range: { min: number; max: number }): number | undefined {
    const v = this.number(field)
    if (v === undefined) return undefined
    if (!Number.isInteger(v)) return this.fail(field, 'notAnInteger')
    return v < range.min || v > range.max ? this.fail(field, 'outOfScale') : v
  }

  optionalStringList(field: string): string[] | undefined {
    const v = this.raw[field]
    if (v === undefined) return undefined
    if (!Array.isArray(v) || v.some((item) => typeof item !== 'string' || item === '')) {
      return this.fail(field, 'invalidList')
    }
    return v as string[]
  }
}

/** Validates unknown input (form values or stored JSON) as a `HealthEntry`. */
export function validateEntry(input: unknown): ValidationResult<HealthEntry> {
  if (!isRecord(input)) return { ok: false, issues: [{ field: '', code: 'notAnObject' }] }
  const c = new Checker(input)

  const id = c.string('id')
  const recordedAt = c.dateTime('recordedAt')
  const origin = c.oneOf('origin', ENTRY_ORIGINS)
  const symptoms = c.optionalStringList('symptoms')
  const indicator = c.oneOf('indicator', INDICATOR_IDS)

  let fields: Record<string, unknown> | undefined
  switch (indicator) {
    case 'bloodPressure':
      fields = {
        systolicMmHg: c.nonNegative('systolicMmHg'),
        diastolicMmHg: c.nonNegative('diastolicMmHg'),
      }
      break
    case 'heartRate':
      fields = {
        bpm: c.nonNegative('bpm'),
        // Optional so that entries stored before the field existed still load.
        ...(input.activity !== undefined
          ? { activity: c.oneOf('activity', HEART_RATE_ACTIVITIES) }
          : {}),
      }
      break
    case 'bloodGlucose':
      fields = {
        mgDl: c.nonNegative('mgDl'),
        context: c.oneOf('context', GLUCOSE_CONTEXTS),
        device: c.oneOf('device', GLUCOSE_DEVICES),
      }
      break
    case 'bodyTemperature':
      fields = {
        celsius: c.number('celsius'),
        // Optional so that legacy entries without a method still load; the form requires it.
        ...(input.method !== undefined ? { method: c.oneOf('method', TEMPERATURE_METHODS) } : {}),
        exercisedLast30Min: c.boolean('exercisedLast30Min'),
      }
      break
    case 'sleep':
      fields = { hours: c.nonNegative('hours'), source: c.oneOf('source', SLEEP_SOURCES) }
      break
    case 'mood': {
      const kind = c.oneOf('kind', MOOD_KINDS)
      if (kind === 'phq2') fields = { kind, score: c.scale('score', PHQ2_SCORE_RANGE) }
      if (kind === 'dailyRating') {
        fields = { kind, rating: c.scale('rating', DAILY_MOOD_RATING_RANGE) }
      }
      break
    }
  }

  if (c.issues.length > 0) return { ok: false, issues: c.issues }
  const entry = {
    id,
    recordedAt,
    origin,
    ...(symptoms ? { symptoms } : {}),
    indicator,
    ...fields,
  }
  return { ok: true, value: entry as HealthEntry }
}
