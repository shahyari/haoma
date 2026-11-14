/**
 * Evaluates the approved rules against stored entries.
 *
 * Every numeric comparison below implements a rule ID from
 * docs/scientific-foundations.md. Where the approved rules leave a reading
 * without a tier, the result is `none` (neutral) rather than an invented one;
 * those gaps are listed in docs/progress.md for the owner.
 */
import type {
  BloodGlucoseEntry,
  BloodPressureEntry,
  BodyTemperatureEntry,
  EntryOf,
  HealthEntry,
  HeartRateEntry,
  IndicatorId,
  MoodEntry,
  SleepEntry,
} from '@/domain/indicators'
import { INDICATOR_IDS } from '@/domain/indicators'
import type { MissionPhase } from '@/domain/mission'
import { TEAM_PARAMETERS, type TeamParameters } from '@/domain/parameters'
import {
  HEART_RATE_SYMPTOMS,
  HYPERGLYCEMIA_SYMPTOMS,
  HYPOGLYCEMIA_SYMPTOMS,
  LOW_BP_SYMPTOMS,
  POST_LANDING_SYMPTOMS,
  type SymptomId,
} from '@/domain/symptoms'

import { RULES } from './rules'
import type { Finding, IndicatorAssessment, RuleDefinition, Status } from './types'

export interface EvaluationContext {
  missionPhase: MissionPhase
  parameters?: TeamParameters
}

const DAY_MS = 24 * 60 * 60 * 1000
const SEVERITY: Record<Status, number> = { normal: 0, attention: 1, escalate: 2 }

const time = (entry: HealthEntry) => Date.parse(entry.recordedAt)

function hasAny(entry: HealthEntry, symptoms: SymptomId[]): boolean {
  return (entry.symptoms ?? []).some((s) => (symptoms as string[]).includes(s))
}

function finding(rule: RuleDefinition, message: string | undefined = rule.action): Finding {
  return { rule, message }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * P-1 / P-2: rolling median of the last N valid earlier readings; undefined
 * until the minimum is met. Callers pass only same-method readings.
 * TODO: P-1 also says "at a similar time of day", which is not defined yet and is not applied.
 */
export function baseline(earlier: number[], p: TeamParameters): number | undefined {
  if (earlier.length < p.baselineMinReadings) return undefined
  return median(earlier.slice(-p.baselineWindowReadings))
}

function assess(indicator: IndicatorId, findings: Finding[], note?: string): IndicatorAssessment {
  if (findings.length === 0) return { indicator, status: 'none', findings, note }
  const sorted = [...findings].sort((a, b) => SEVERITY[b.rule.status] - SEVERITY[a.rule.status])
  const worst = sorted[0].rule.status
  // A Normal finding is dropped when anything else applies.
  const shown = worst === 'normal' ? sorted : sorted.filter((f) => f.rule.status !== 'normal')
  return { indicator, status: worst, findings: shown }
}

function bloodPressure(entries: BloodPressureEntry[], ctx: EvaluationContext): IndicatorAssessment {
  const e = entries[entries.length - 1]
  const { systolicMmHg: sys, diastolicMmHg: dia } = e
  const findings: Finding[] = []
  const low = sys < 90 || dia < 60

  if (sys > 180 || dia > 120) findings.push(finding(RULES['RULE-04']))
  else if (sys >= 140 || dia >= 90) findings.push(finding(RULES['RULE-03']))
  else if (sys >= 120 || dia >= 80) findings.push(finding(RULES['RULE-02']))

  if (low) findings.push(finding(hasAny(e, LOW_BP_SYMPTOMS) ? RULES['RULE-25'] : RULES['RULE-05']))
  else if (ctx.missionPhase === 'postLanding' && hasAny(e, POST_LANDING_SYMPTOMS)) {
    findings.push(finding(RULES['RULE-26']))
  }

  if (findings.length === 0) findings.push(finding(RULES['RULE-01']))
  return assess('bloodPressure', findings)
}

function heartRate(entries: HeartRateEntry[], ctx: EvaluationContext): IndicatorAssessment {
  const p = ctx.parameters ?? TEAM_PARAMETERS
  const e = entries[entries.length - 1]
  const findings: Finding[] = []
  const outside = e.bpm < 60 || e.bpm > 100

  // RULE-08 also covers "a rate regularly above 100 at rest"; "regularly" has
  // no approved definition, so that clause is not evaluated.
  if ((outside && hasAny(e, HEART_RATE_SYMPTOMS)) || hasAny(e, ['irregularRhythm'])) {
    findings.push(finding(RULES['RULE-08']))
  } else if (outside) {
    findings.push(finding(RULES['RULE-07']))
  }

  const usual = baseline(
    entries.slice(0, -1).map((x) => x.bpm),
    p,
  )
  if (usual !== undefined && Math.abs(e.bpm - usual) >= p.heartRateShiftBpm) {
    const diff = Math.round(Math.abs(e.bpm - usual))
    const direction = e.bpm > usual ? 'above' : 'below'
    findings.push(
      finding(
        RULES['RULE-29'],
        `Your resting heart rate is ${e.bpm} bpm, which is ${diff} bpm ${direction} your usual. Re-check at rest tomorrow morning. If it stays different, or you feel dizzy, short of breath or notice an irregular heartbeat, contact the flight surgeon.`,
      ),
    )
  }

  if (findings.length === 0) findings.push(finding(RULES['RULE-06']))
  return assess('heartRate', findings)
}

function bloodGlucose(entries: BloodGlucoseEntry[]): IndicatorAssessment {
  const e = entries[entries.length - 1]
  const findings: Finding[] = []

  if (e.mgDl < 54 || (e.mgDl < 70 && hasAny(e, HYPOGLYCEMIA_SYMPTOMS))) {
    findings.push(finding(RULES['RULE-12']))
  } else if (e.mgDl < 70) {
    findings.push(finding(RULES['RULE-11']))
  } else if (e.context === 'fasting') {
    if (e.mgDl >= 126) findings.push(finding(RULES['RULE-13']))
    else if (e.mgDl >= 100) findings.push(finding(RULES['RULE-10']))
    else findings.push(finding(RULES['RULE-09']))
  } else if (e.mgDl >= 200 && hasAny(e, HYPERGLYCEMIA_SYMPTOMS)) {
    findings.push(finding(RULES['RULE-27']))
  }

  return assess(
    'bloodGlucose',
    findings,
    'Non-fasting readings without symptoms appear in the trend only.',
  )
}

function bodyTemperature(
  entries: BodyTemperatureEntry[],
  ctx: EvaluationContext,
): IndicatorAssessment {
  const p = ctx.parameters ?? TEAM_PARAMETERS
  const e = entries[entries.length - 1]
  // P-6: readings taken within 30 min after exercise are ignored.
  if (e.exercisedLast30Min) {
    return assess(
      'bodyTemperature',
      [],
      'Taken within 30 minutes after exercise, so it is not evaluated. Measure again later.',
    )
  }

  // Baseline: earlier readings with the same method, not taken after exercise.
  const usual = baseline(
    entries
      .slice(0, -1)
      .filter((x) => x.method === e.method && !x.exercisedLast30Min)
      .map((x) => x.celsius),
    p,
  )
  const aboveBaseline = usual !== undefined && e.celsius > usual + p.temperatureShiftCelsius
  const findings: Finding[] = []

  if (e.celsius >= 39.4) findings.push(finding(RULES['RULE-17']))
  else if (e.celsius >= 38.0) {
    if (usual === undefined || aboveBaseline || (e.symptoms?.length ?? 0) > 0) {
      findings.push(finding(RULES['RULE-16']))
    }
  } else if (e.celsius >= 37.5) findings.push(finding(RULES['RULE-15']))
  else if (!aboveBaseline) findings.push(finding(RULES['RULE-14']))

  return assess(
    'bodyTemperature',
    findings,
    'No approved rule assigns a status to this reading. Compare it with your trend.',
  )
}

function sleep(entries: SleepEntry[], ctx: EvaluationContext): IndicatorAssessment {
  const p = ctx.parameters ?? TEAM_PARAMETERS
  const e = entries[entries.length - 1]
  const { maxHours, minNights, windowNights } = p.regularShortSleep
  const findings: Finding[] = []

  const recent = entries.filter((x) => time(x) > time(e) - windowNights * DAY_MS)
  if (recent.filter((x) => x.hours <= maxHours).length >= minNights) {
    findings.push(finding(RULES['RULE-20']))
  } else if (e.hours >= 7) findings.push(finding(RULES['RULE-18']))
  else if (e.hours > 6) findings.push(finding(RULES['RULE-19']))
  // RULE-28 (short night before an EVA) needs the task schedule; not evaluated yet.

  return assess(
    'sleep',
    findings,
    'No approved rule assigns a status to a single night of 6 hours or less. Watch the next nights.',
  )
}

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function mood(entries: MoodEntry[], ctx: EvaluationContext): IndicatorAssessment {
  const p = ctx.parameters ?? TEAM_PARAMETERS
  const findings: Finding[] = []

  const phq2 = entries.filter((x) => x.kind === 'phq2').at(-1)
  if (phq2) {
    if (phq2.score >= 3) findings.push(finding(RULES['RULE-23']))
    else if (phq2.score === 2) findings.push(finding(RULES['RULE-22']))
    else findings.push(finding(RULES['RULE-21']))
  }

  // P-5: short-window average at least N points below the long-window average. Never escalates.
  const ratings = entries.filter((x) => x.kind === 'dailyRating')
  const last = ratings.at(-1)
  if (last && !findings.some((f) => f.rule.id === 'RULE-22')) {
    const { shortWindowDays, longWindowDays, minDropPoints } = p.moodTrend
    const within = (days: number) =>
      ratings.filter((x) => time(x) > time(last) - days * DAY_MS).map((x) => x.rating)
    const short = within(shortWindowDays)
    const long = within(longWindowDays)
    if (long.length > short.length && average(long) - average(short) >= minDropPoints) {
      findings.push(finding(RULES['RULE-22']))
    }
  }

  return assess('mood', findings, 'Daily ratings are used for the trend only.')
}

function byTime<T extends HealthEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => time(a) - time(b))
}

export function entriesOf<I extends IndicatorId>(
  entries: HealthEntry[],
  indicator: I,
): EntryOf<I>[] {
  return byTime(entries.filter((e): e is EntryOf<I> => e.indicator === indicator))
}

export function evaluateIndicator(
  indicator: IndicatorId,
  allEntries: HealthEntry[],
  ctx: EvaluationContext,
): IndicatorAssessment {
  const entries = entriesOf(allEntries, indicator)
  if (entries.length === 0) return { indicator, status: 'missing', findings: [] }
  switch (indicator) {
    case 'bloodPressure':
      return bloodPressure(entries as BloodPressureEntry[], ctx)
    case 'heartRate':
      return heartRate(entries as HeartRateEntry[], ctx)
    case 'bloodGlucose':
      return bloodGlucose(entries as BloodGlucoseEntry[])
    case 'bodyTemperature':
      return bodyTemperature(entries as BodyTemperatureEntry[], ctx)
    case 'sleep':
      return sleep(entries as SleepEntry[], ctx)
    case 'mood':
      return mood(entries as MoodEntry[], ctx)
  }
}

export function evaluateAll(entries: HealthEntry[], ctx: EvaluationContext): IndicatorAssessment[] {
  return INDICATOR_IDS.map((indicator) => evaluateIndicator(indicator, entries, ctx))
}
