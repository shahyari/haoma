/**
 * Crew Average Comparison (owner spec 2026-11-15): pure calculations, independent of where
 * the crew data comes from. A crew average is mission context only. It never changes a
 * status, a rule, or a personal baseline (docs/scientific-foundations.md → "Crew comparison").
 */
import { formatDate } from '@/domain/dates'
import {
  GLUCOSE_CONTEXT_LABELS,
  GLUCOSE_DEVICE_LABELS,
  HEART_RATE_ACTIVITY_LABELS,
  SLEEP_SOURCE_LABELS,
  TEMPERATURE_METHOD_LABELS,
} from '@/domain/format'
import type { HealthEntry } from '@/domain/indicators'
import { TEAM_PARAMETERS } from '@/domain/parameters'

/** One crew member's reading. The member id is used for counting only and is never shown. */
export interface CrewEntry {
  memberId: string
  entry: HealthEntry
}

/**
 * Where crew readings come from. The prototype uses simulated readings; a future synced
 * source can implement the same shape without changes to the UI.
 */
export interface CrewDataSource {
  kind: 'simulated' | 'synced'
  /** The astronaut viewing the app; always excluded from the averages. */
  selfId: string
  entries: CrewEntry[]
}

export type CrewMetric = 'systolic' | 'diastolic' | 'bpm' | 'mgDl' | 'celsius' | 'hours' | 'rating'

/** The comparison group of a reading, or why it cannot be compared. */
export type Comparability = { group: string; label: string } | { excluded: string }

/**
 * Like is compared only with like (owner spec, section 4). Readings without the information
 * needed for a valid match are excluded, with the reason.
 */
export function comparability(entry: HealthEntry): Comparability {
  switch (entry.indicator) {
    case 'heartRate':
      // Resting with resting, after activity with after activity; never mixed.
      return entry.activity
        ? {
            group: `hr:${entry.activity}`,
            label: `${HEART_RATE_ACTIVITY_LABELS[entry.activity]} readings`,
          }
        : { excluded: 'Rest state not recorded' }
    case 'bloodPressure':
      // No measurement-condition field is recorded, so all cuff readings form one group.
      return { group: 'bp', label: 'Blood pressure readings' }
    case 'bloodGlucose':
      if (entry.context === 'unknown') return { excluded: 'Fasting state not recorded' }
      return {
        group: `glucose:${entry.context}:${entry.device}`,
        label: `${GLUCOSE_CONTEXT_LABELS[entry.context]} ${GLUCOSE_DEVICE_LABELS[entry.device].toLowerCase()} readings`,
      }
    case 'bodyTemperature':
      if (!entry.method) return { excluded: 'Measurement method not recorded' }
      if (entry.exercisedLast30Min) return { excluded: 'Taken within 30 minutes after exercise' }
      return {
        group: `temp:${entry.method}`,
        label: `${TEMPERATURE_METHOD_LABELS[entry.method]} readings`,
      }
    case 'sleep':
      return {
        group: `sleep:${entry.source}`,
        label: `Sleep, ${SLEEP_SOURCE_LABELS[entry.source].toLowerCase()}`,
      }
    case 'mood':
      // PHQ-2 scores are never aggregated or compared.
      return entry.kind === 'dailyRating'
        ? { group: 'mood:dailyRating', label: 'Daily mood ratings (1–5)' }
        : { excluded: 'PHQ-2 scores are never compared' }
  }
}

/** The numbers compared for a reading; blood pressure has two, compared separately. */
export function metricValues(entry: HealthEntry): Partial<Record<CrewMetric, number>> {
  switch (entry.indicator) {
    case 'bloodPressure':
      return { systolic: entry.systolicMmHg, diastolic: entry.diastolicMmHg }
    case 'heartRate':
      return { bpm: entry.bpm }
    case 'bloodGlucose':
      return { mgDl: entry.mgDl }
    case 'bodyTemperature':
      return { celsius: entry.celsius }
    case 'sleep':
      return { hours: entry.hours }
    case 'mood':
      return entry.kind === 'dailyRating' ? { rating: entry.rating } : {}
  }
}

export function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

/** Sample standard deviation (n − 1); 0 for fewer than two values. */
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0
  const m = mean(values)
  return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1))
}

/** Local calendar day (mission day) of a time (P-10). */
export function dayKey(value: string | Date): string {
  const d = new Date(value)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export interface CrewExclusion {
  reason: string
  /** Crew readings left out for this reason (a count only; no member is identified). */
  count: number
}

export type CrewResult =
  | {
      available: true
      /** Mean and standard deviation of the member values, per metric. */
      metrics: Partial<Record<CrewMetric, { mean: number; sd: number }>>
      /** Other crew members contributing (each counted once). */
      members: number
      /** Comparison period, e.g. "15 Nov 2026 (same mission day)". */
      period: string
      groupLabel: string
      excluded: CrewExclusion[]
    }
  | { available: false; reason: string; members: number; excluded: CrewExclusion[] }

/**
 * The crew average for one of the astronaut's readings: other crew members' comparable
 * readings on the same mission day (P-10). Each member counts once (the mean of their
 * readings that day), then the arithmetic mean over members is taken. Hidden when fewer
 * than P-9 members contribute. Missing readings are skipped, never treated as zero.
 */
export function crewAverageFor(
  entry: HealthEntry,
  source: CrewDataSource,
  minCohort: number = TEAM_PARAMETERS.crewMinCohort,
): CrewResult {
  const own = comparability(entry)
  const day = dayKey(entry.recordedAt)
  const sameDay = source.entries.filter(
    (c) =>
      c.memberId !== source.selfId &&
      c.entry.indicator === entry.indicator &&
      dayKey(c.entry.recordedAt) === day,
  )
  const exclusions = new Map<string, number>()
  const perMember = new Map<string, HealthEntry[]>()
  for (const c of sameDay) {
    const theirs = comparability(c.entry)
    if ('excluded' in theirs) {
      exclusions.set(theirs.excluded, (exclusions.get(theirs.excluded) ?? 0) + 1)
      continue
    }
    if ('excluded' in own || theirs.group !== own.group) continue
    perMember.set(c.memberId, [...(perMember.get(c.memberId) ?? []), c.entry])
  }
  const excluded = [...exclusions].map(([reason, count]) => ({ reason, count }))
  if ('excluded' in own) {
    return {
      available: false,
      reason: `${own.excluded}, so this reading is not compared.`,
      members: 0,
      excluded,
    }
  }
  const members = perMember.size
  if (members < minCohort) {
    return {
      available: false,
      reason:
        members === 0
          ? 'No other crew member has a comparable reading on this mission day.'
          : `Only ${members} other crew ${members === 1 ? 'member has' : 'members have'} a comparable reading on this mission day. An average is shown from ${minCohort} members, so that no one’s reading can be inferred.`,
      members,
      excluded,
    }
  }
  const metrics: Partial<Record<CrewMetric, { mean: number; sd: number }>> = {}
  for (const metric of Object.keys(metricValues(entry)) as CrewMetric[]) {
    const memberValues = [...perMember.values()].map((readings) =>
      mean(readings.map((r) => metricValues(r)[metric]!)),
    )
    metrics[metric] = { mean: mean(memberValues), sd: standardDeviation(memberValues) }
  }
  return {
    available: true,
    metrics,
    members,
    period: `${formatDate(entry.recordedAt)} (same mission day)`,
    groupLabel: own.label,
    excluded,
  }
}

export type CrewRelation = 'above' | 'below' | 'close'

/** Neutral position of a value against the crew average (P-11); never a health status. */
export function crewRelation(value: number, average: { mean: number; sd: number }): CrewRelation {
  const difference = value - average.mean
  if (Math.abs(difference) <= TEAM_PARAMETERS.crewCloseWithinSd * average.sd) return 'close'
  return difference > 0 ? 'above' : 'below'
}

export const CREW_RELATION_TEXT: Record<CrewRelation, string> = {
  above: 'above the crew average',
  below: 'below the crew average',
  close: 'close to the crew average',
}
