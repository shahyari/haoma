/**
 * Health-indicator data models (Phase A step A6).
 *
 * Source of truth: docs/scientific-foundations.md -> "Indicator summary".
 * Models only. No interpretation rules, ranges, or thresholds live here.
 */

export const INDICATOR_IDS = [
  'bloodPressure',
  'heartRate',
  'bloodGlucose',
  'bodyTemperature',
  'sleep',
  'mood',
] as const
export type IndicatorId = (typeof INDICATOR_IDS)[number]

export interface IndicatorDefinition {
  id: IndicatorId
  label: string
  /** Display unit of the recorded value. */
  unit: string
}

export const INDICATORS: Record<IndicatorId, IndicatorDefinition> = {
  bloodPressure: { id: 'bloodPressure', label: 'Blood pressure', unit: 'mmHg' },
  heartRate: { id: 'heartRate', label: 'Heart rate', unit: 'bpm' },
  bloodGlucose: { id: 'bloodGlucose', label: 'Blood glucose', unit: 'mg/dL' },
  bodyTemperature: { id: 'bodyTemperature', label: 'Body temperature', unit: '°C' },
  sleep: { id: 'sleep', label: 'Sleep', unit: 'h' },
  mood: { id: 'mood', label: 'Mood', unit: 'score' },
}

export const GLUCOSE_CONTEXTS = ['fasting', 'nonFasting', 'unknown'] as const
export type GlucoseContext = (typeof GLUCOSE_CONTEXTS)[number]

export const GLUCOSE_DEVICES = ['fingerstick', 'cgm'] as const
export type GlucoseDevice = (typeof GLUCOSE_DEVICES)[number]

export const TEMPERATURE_METHODS = ['oral', 'forehead'] as const
export type TemperatureMethod = (typeof TEMPERATURE_METHODS)[number]

export const SLEEP_SOURCES = ['selfReport', 'actigraphy'] as const
export type SleepSource = (typeof SLEEP_SOURCES)[number]

export const MOOD_KINDS = ['phq2', 'dailyRating'] as const
export type MoodKind = (typeof MOOD_KINDS)[number]

/** Scale definitions of the mood instruments (not health thresholds). */
export const PHQ2_SCORE_RANGE = { min: 0, max: 6 } as const
export const PHQ2_CADENCE_DAYS = 14
export const DAILY_MOOD_RATING_RANGE = { min: 1, max: 5 } as const

/** Where a record came from. Simulated data must always be labeled in the UI. */
export const ENTRY_ORIGINS = ['userEntered', 'simulated'] as const
export type EntryOrigin = (typeof ENTRY_ORIGINS)[number]

interface EntryBase {
  id: string
  /** ISO 8601 date-time of the measurement. */
  recordedAt: string
  origin: EntryOrigin
  /**
   * Optional symptom flags reported with this entry.
   * TODO: the symptom catalog (IDs and wording) comes from the F-01/F-05 specs.
   */
  symptoms?: string[]
}

/** Cuff reading at rest. */
export interface BloodPressureEntry extends EntryBase {
  indicator: 'bloodPressure'
  systolicMmHg: number
  diastolicMmHg: number
}

/** Resting heart rate. */
export interface HeartRateEntry extends EntryBase {
  indicator: 'heartRate'
  bpm: number
}

export interface BloodGlucoseEntry extends EntryBase {
  indicator: 'bloodGlucose'
  mgDl: number
  context: GlucoseContext
  device: GlucoseDevice
}

export interface BodyTemperatureEntry extends EntryBase {
  indicator: 'bodyTemperature'
  celsius: number
  method: TemperatureMethod
  exercisedLast30Min: boolean
}

/** Sleep duration for one night. */
export interface SleepEntry extends EntryBase {
  indicator: 'sleep'
  hours: number
  source: SleepSource
}

/** PHQ-2 total score (0-6), taken every 14 days. */
export interface MoodPhq2Entry extends EntryBase {
  indicator: 'mood'
  kind: 'phq2'
  score: number
}

/** Optional daily mood rating (1-5), trend only. */
export interface MoodDailyRatingEntry extends EntryBase {
  indicator: 'mood'
  kind: 'dailyRating'
  rating: number
}

export type MoodEntry = MoodPhq2Entry | MoodDailyRatingEntry

export type HealthEntry =
  | BloodPressureEntry
  | HeartRateEntry
  | BloodGlucoseEntry
  | BodyTemperatureEntry
  | SleepEntry
  | MoodEntry

export type EntryOf<I extends IndicatorId> = Extract<HealthEntry, { indicator: I }>
