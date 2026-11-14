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
  MoodPhq2Entry,
  SleepEntry,
  TemperatureMethod,
} from '@/domain/indicators'
import { INDICATOR_IDS, PHQ2_CADENCE_DAYS } from '@/domain/indicators'
import { calendarDaysBetween } from '@/domain/dates'
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
  /** Reference time for time-limited results (PHQ-2 validity). Defaults to the current time. */
  now?: Date
}

const DAY_MS = 24 * 60 * 60 * 1000
const SEVERITY: Record<Status, number> = { normal: 0, attention: 1, escalate: 2 }

const time = (entry: HealthEntry) => Date.parse(entry.recordedAt)

function hasAny(entry: HealthEntry, symptoms: SymptomId[]): boolean {
  return (entry.symptoms ?? []).some((s) => (symptoms as string[]).includes(s))
}

function finding(
  rule: RuleDefinition,
  message: string | undefined = rule.action,
  reason?: string,
): Finding {
  return { rule, message, reason }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * P-1 / P-2: rolling median of the last N valid earlier readings; undefined
 * until the minimum is met. Callers pass only comparable readings (same
 * temperature method; resting heart rate). No time-of-day matching (AU-7).
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
  const label = sorted[0].rule.statusLabel
  return { indicator, status: worst, findings: shown, ...(label ? { label } : {}) }
}

function bloodPressure(entries: BloodPressureEntry[], ctx: EvaluationContext): IndicatorAssessment {
  const e = entries[entries.length - 1]
  const { systolicMmHg: sys, diastolicMmHg: dia } = e
  const findings: Finding[] = []
  const low = sys < 90 || dia < 60

  if (sys > 180 || dia > 120) findings.push(finding(RULES['RULE-04']))
  else if (sys >= 140 || dia >= 90) findings.push(finding(RULES['RULE-03']))
  else if (sys >= 120 || dia >= 80) findings.push(finding(RULES['RULE-02']))

  // AU-4 (owner, 2026-11-14): "below 90/60" = systolic below 90 OR diastolic below 60.
  if (low) {
    const which = [
      sys < 90 ? `systolic ${sys} is below 90` : '',
      dia < 60 ? `diastolic ${dia} is below 60` : '',
    ]
      .filter(Boolean)
      .join(' and ')
    const reason = `The ${which}.`
    if (hasAny(e, LOW_BP_SYMPTOMS)) findings.push(finding(RULES['RULE-25'], undefined, reason))
    else findings.push(finding(RULES['RULE-05'], undefined, `${reason} No symptoms reported.`))
  } else if (ctx.missionPhase === 'postLanding' && hasAny(e, POST_LANDING_SYMPTOMS)) {
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
  const atRest = e.activity === 'rest'

  // RULE-08 is symptom-based and applies to every reading, resting or not (OD-15).
  // Its clause "a rate regularly above 100 at rest" is not evaluated (OD-14, AU-3);
  // the history view describes repeated readings above 100 instead.
  const irregular = hasAny(e, ['irregularRhythm'])
  const symptomsWithRate = outside && hasAny(e, HEART_RATE_SYMPTOMS)
  if (irregular || symptomsWithRate) {
    findings.push(
      finding(
        RULES['RULE-08'],
        undefined,
        irregular
          ? 'Irregular heartbeat reported.'
          : 'Symptoms reported with a rate outside 60–100 bpm.',
      ),
    )
  } else if (outside && atRest) {
    findings.push(finding(RULES['RULE-07']))
  }

  // Rate-based interpretation (RULE-06, RULE-07, RULE-29) uses resting readings only.
  if (!atRest) {
    return assess(
      'heartRate',
      findings,
      e.activity === 'afterActivity'
        ? 'Taken after activity. The heart-rate rules apply to resting readings, so it is not evaluated.'
        : 'It was not recorded whether this reading was taken at rest, so it is not evaluated.',
    )
  }

  const usual = baseline(restingEarlier(entries), p)
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

function restingEarlier(entries: HeartRateEntry[]): number[] {
  return entries
    .slice(0, -1)
    .filter((x) => x.activity === 'rest')
    .map((x) => x.bpm)
}

/** Days covered by the descriptive count of resting readings above 100 bpm (display window, not a threshold). */
export const ELEVATED_HR_WINDOW_DAYS = 7

/**
 * AU-3 (owner, 2026-11-14): repeated resting readings above 100 bpm (the RULE-07
 * reference) are described, never classified. No frequency threshold applies.
 */
export function restingAbove100(
  allEntries: HealthEntry[],
  now: Date,
): { above: number; resting: number } {
  const resting = entriesOf(allEntries, 'heartRate').filter(
    (x) => x.activity === 'rest' && time(x) > now.getTime() - ELEVATED_HR_WINDOW_DAYS * DAY_MS,
  )
  return { above: resting.filter((x) => x.bpm > 100).length, resting: resting.length }
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

/** Earlier readings taken with the latest reading's method and not after exercise (P-1, P-6). Never mixes methods. */
function sameMethodEarlier(entries: BodyTemperatureEntry[]): number[] {
  const method = entries.at(-1)?.method
  if (!method) return []
  return entries
    .slice(0, -1)
    .filter((x) => x.method === method && !x.exercisedLast30Min)
    .map((x) => x.celsius)
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

  // OD-15: RULE-14–RULE-17 use oral levels, so they apply to oral readings only.
  // Forehead and legacy readings without a method are shown with their trend, never classified.
  if (e.method !== 'oral') {
    return assess(
      'bodyTemperature',
      [],
      e.method === 'forehead'
        ? 'No approved rule interprets forehead readings. Not evaluated does not mean normal.'
        : 'The measurement method was not recorded, so no rule applies. Not evaluated does not mean normal.',
    )
  }

  const usual = baseline(sameMethodEarlier(entries), p)
  const aboveBaseline = usual !== undefined && e.celsius > usual + p.temperatureShiftCelsius
  const findings: Finding[] = []

  // OD-16: RULE-17 = a single reading ≥ 40.6 °C (REF-50's single-reading level); RULE-31 =
  // measurement review for 39.4 ≤ x < 40.6. No persistence trigger (no approved time window).
  // RULE-16 (≥ 38.0 °C, no upper bound) keeps applying below 40.6, so a higher reading never
  // gets a lower tier than a lower one.
  if (e.celsius >= 40.6) findings.push(finding(RULES['RULE-17']))
  else if (e.celsius >= 38.0) {
    if (usual === undefined || aboveBaseline || (e.symptoms?.length ?? 0) > 0) {
      findings.push(finding(RULES['RULE-16']))
    }
    if (e.celsius >= 39.4) findings.push(finding(RULES['RULE-31']))
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

  // Count nights, not entries: the latest entry per local calendar day stands for that night.
  const nights = new Map<string, SleepEntry>()
  for (const x of entries) {
    if (time(x) <= time(e) - windowNights * DAY_MS) continue
    const d = new Date(x.recordedAt)
    nights.set(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, x)
  }
  const shortNights = [...nights.values()].filter((x) => x.hours <= maxHours).length
  if (shortNights >= minNights) {
    findings.push(finding(RULES['RULE-20']))
  } else if (e.hours >= 7) findings.push(finding(RULES['RULE-18']))
  // AU-1 (owner, 2026-11-14): any single night under 7 h, including 6 h or less, unless RULE-20 applies.
  else findings.push(finding(RULES['RULE-19']))
  // RULE-28 (short night before an EVA) needs the task schedule; not evaluated yet.

  return assess('sleep', findings)
}

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export type Phq2State = 'belowCutoff' | 'furtherAssessment' | 'due' | 'notAssessed'

/** Owner-set PHQ-2 wording (2026-11-14). */
export const PHQ2_STATE_LABELS: Record<Phq2State, string> = {
  belowCutoff: 'Below screening cutoff',
  furtherAssessment: 'Further assessment recommended',
  due: 'Screening due',
  notAssessed: 'Not assessed',
}

export interface Phq2Screening {
  state: Phq2State
  /** The latest screening, current or historical. */
  latest?: MoodPhq2Entry
  /** True while the latest screening is less than 14 days old (AU-5). */
  current: boolean
}

/**
 * AU-5 (owner, 2026-11-14): a PHQ-2 result is current for 14 days (the scheduling
 * cadence, OD-6), then historical, and the next screening is due. The 2-week recall
 * period is part of the questionnaire and is a separate thing.
 */
export function phq2Screening(allEntries: HealthEntry[], now: Date): Phq2Screening {
  const latest = entriesOf(allEntries, 'mood')
    .filter((x): x is MoodPhq2Entry => x.kind === 'phq2')
    .at(-1)
  if (!latest) return { state: 'notAssessed', current: false }
  if (calendarDaysBetween(new Date(latest.recordedAt), now) >= PHQ2_CADENCE_DAYS) {
    return { state: 'due', latest, current: false }
  }
  // RULE-23: the validated cutoff is 3.
  return { state: latest.score >= 3 ? 'furtherAssessment' : 'belowCutoff', latest, current: true }
}

function mood(entries: MoodEntry[], ctx: EvaluationContext): IndicatorAssessment {
  const p = ctx.parameters ?? TEAM_PARAMETERS
  const findings: Finding[] = []

  const screening = phq2Screening(entries, ctx.now ?? new Date())
  const phq2 = screening.current ? screening.latest : undefined
  if (phq2) {
    if (phq2.score >= 3) findings.push(finding(RULES['RULE-23']))
    // OD-15: one cutoff (3). A score of 2 alone is below the cutoff and no longer gives Attention.
    else findings.push(finding(RULES['RULE-21'], undefined, `PHQ-2 score ${phq2.score}.`))
  }

  // P-5: short-window average at least N points below the long-window average. Never escalates.
  const ratings = entries.filter((x) => x.kind === 'dailyRating')
  const last = ratings.at(-1)
  if (last) {
    const { shortWindowDays, longWindowDays, minDropPoints } = p.moodTrend
    const within = (days: number) =>
      ratings.filter((x) => time(x) > time(last) - days * DAY_MS).map((x) => x.rating)
    const short = within(shortWindowDays)
    const long = within(longWindowDays)
    if (long.length > short.length && average(long) - average(short) >= minDropPoints) {
      findings.push(
        finding(
          RULES['RULE-22'],
          undefined,
          `Daily ratings: the ${shortWindowDays}-day average is at least ${minDropPoints} point below the ${longWindowDays}-day average.`,
        ),
      )
    }
  }

  const result = assess(
    'mood',
    findings,
    screening.state === 'due'
      ? 'The last PHQ-2 is more than 14 days old, so it is history only. Daily mood ratings are used for the trend only.'
      : 'No PHQ-2 screening is recorded. Daily mood ratings are used for the trend only.',
  )
  return result.status === 'none'
    ? { ...result, label: PHQ2_STATE_LABELS[screening.state] }
    : result
}

export interface PersonalBaseline {
  /** Median of the last readings (P-1); undefined until the minimum (P-2) is met. */
  value: number | undefined
  /** Earlier valid readings available for the baseline. */
  readings: number
  required: number
  /** Temperature only: the method the baseline is built for (that of the latest reading). */
  method?: TemperatureMethod | 'unknown'
}

/**
 * The personal baseline that the rules compare the latest reading with.
 * Defined only for heart rate (RULE-29) and body temperature (RULE-14, RULE-16).
 */
export function personalBaseline(
  indicator: IndicatorId,
  allEntries: HealthEntry[],
  p: TeamParameters = TEAM_PARAMETERS,
): PersonalBaseline | undefined {
  let earlier: number[]
  if (indicator === 'heartRate') {
    earlier = restingEarlier(entriesOf(allEntries, 'heartRate'))
  } else if (indicator === 'bodyTemperature') {
    const entries = entriesOf(allEntries, 'bodyTemperature')
    earlier = sameMethodEarlier(entries)
    return {
      value: baseline(earlier, p),
      readings: earlier.length,
      required: p.baselineMinReadings,
      method: entries.at(-1)?.method ?? 'unknown',
    }
  } else return undefined
  return { value: baseline(earlier, p), readings: earlier.length, required: p.baselineMinReadings }
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
