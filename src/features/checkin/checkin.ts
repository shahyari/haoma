/**
 * Daily check-in (owner decision 2026-11-14): one entry per indicator per
 * local calendar day. The PHQ-2 follows its approved 14-day cadence
 * (docs/scientific-foundations.md, OD-6) and is not part of the daily count.
 */
import { addDays, calendarDaysBetween } from '@/domain/dates'
import {
  INDICATOR_IDS,
  INDICATORS,
  PHQ2_CADENCE_DAYS,
  type HealthEntry,
  type IndicatorId,
} from '@/domain/indicators'

export interface CheckInItem {
  indicator: IndicatorId
  label: string
  done: boolean
}

function isToday(entry: HealthEntry, now: Date): boolean {
  return calendarDaysBetween(new Date(entry.recordedAt), now) === 0
}

export function dailyCheckIn(entries: HealthEntry[], now: Date): CheckInItem[] {
  return INDICATOR_IDS.map((indicator) => ({
    indicator,
    label: indicator === 'mood' ? 'Mood (daily rating)' : INDICATORS[indicator].label,
    done: entries.some(
      (e) =>
        e.indicator === indicator &&
        isToday(e, now) &&
        // The PHQ-2 is a separate screening and does not count as the daily mood rating.
        (e.indicator !== 'mood' || e.kind === 'dailyRating'),
    ),
  }))
}

export interface Phq2Schedule {
  /** Date of the last screening, if any. */
  last?: Date
  /** First day on which the next screening may be taken. */
  nextDue?: Date
  due: boolean
}

export function phq2Schedule(entries: HealthEntry[], now: Date): Phq2Schedule {
  const times = entries
    .filter((e) => e.indicator === 'mood' && e.kind === 'phq2')
    .map((e) => Date.parse(e.recordedAt))
  if (times.length === 0) return { due: true }
  const last = new Date(Math.max(...times))
  return {
    last,
    nextDue: addDays(last, PHQ2_CADENCE_DAYS),
    due: calendarDaysBetween(last, now) >= PHQ2_CADENCE_DAYS,
  }
}
