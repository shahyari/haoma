import type { ReactNode } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  GLUCOSE_CONTEXT_LABELS,
  GLUCOSE_DEVICE_LABELS,
  HEART_RATE_ACTIVITY_LABELS,
  SLEEP_SOURCE_LABELS,
  TEMPERATURE_METHOD_LABELS,
} from '@/domain/format'
import type { HealthEntry, IndicatorId } from '@/domain/indicators'
import { SYMPTOMS, SYMPTOMS_BY_INDICATOR } from '@/domain/symptoms'
import { formatDate } from '@/domain/dates'
import type { Phq2Schedule } from '@/features/checkin/checkin'
import { validateEntry, type ValidationIssue } from '@/domain/validation'
import {
  displayGlucose,
  displayTemperature,
  glucoseUnitLabel,
  temperatureUnitLabel,
  toStoredCelsius,
  toStoredMgDl,
} from '@/domain/units'
import { MOOD_SAFETY_MESSAGE } from '@/rules/rules'

export type Values = Record<string, string>

interface NumberFieldSpec {
  name: string
  label: string
}

/** Measurement notes from docs/scientific-foundations.md -> "Indicator summary". */
// oxlint-disable-next-line react/only-export-components
export const HINTS: Partial<Record<IndicatorId, string>> = {
  bloodPressure: 'Cuff reading at rest.',
  heartRate: 'Resting readings are best taken first thing after waking.',
  bloodGlucose: 'Fasting means no caloric intake for at least 8 hours.',
  sleep: 'Hours slept last night.',
}

const NUMBER_FIELDS: Record<IndicatorId, NumberFieldSpec[]> = {
  bloodPressure: [
    { name: 'systolicMmHg', label: 'Systolic (mmHg)' },
    { name: 'diastolicMmHg', label: 'Diastolic (mmHg)' },
  ],
  heartRate: [{ name: 'bpm', label: 'Heart rate (bpm)' }],
  bloodGlucose: [
    {
      name: 'mgDl',
      get label() {
        return `Glucose (${glucoseUnitLabel()})`
      },
    },
  ],
  bodyTemperature: [
    {
      name: 'celsius',
      get label() {
        return `Temperature (${temperatureUnitLabel()})`
      },
    },
  ],
  sleep: [{ name: 'hours', label: 'Sleep (hours)' }],
  mood: [],
}

/** PHQ-2 stem, items and answer scale, worded as in REF-40 (checked 2026-11-14); validation REF-51; reuse terms REF-41. */
const PHQ2_ITEMS = [
  { name: 'phq2a', label: 'Little interest or pleasure in doing things' },
  { name: 'phq2b', label: 'Feeling down, depressed or hopeless' },
]
const PHQ2_ANSWERS = {
  '0': 'Not at all',
  '1': 'Several days',
  '2': 'More than half the days',
  '3': 'Nearly every day',
}
const RATING_ANSWERS = { '1': '1', '2': '2', '3': '3', '4': '4', '5': '5' }

const ISSUE_MESSAGES: Partial<Record<ValidationIssue['code'], string>> = {
  required: 'This is required.',
  notANumber: 'Enter a number.',
  notFinite: 'Enter a number.',
  negative: 'Enter 0 or more.',
  notAnInteger: 'Choose an answer.',
  outOfScale: 'Choose an answer.',
}

function toNumber(text: string | undefined): number | undefined {
  if (text === undefined || text.trim() === '') return undefined
  const value = Number(text.trim().replace(',', '.'))
  return Number.isNaN(value) ? Number.NaN : value
}

/** Form values of an existing entry. PHQ-2 item answers are not stored, so they start empty. */
// oxlint-disable-next-line react/only-export-components
export function valuesOf(entry: HealthEntry): Values {
  const v: Values = {}
  const set = (name: string, value: unknown) => {
    if (value !== undefined) v[name] = String(value)
  }
  switch (entry.indicator) {
    case 'bloodPressure':
      set('systolicMmHg', entry.systolicMmHg)
      set('diastolicMmHg', entry.diastolicMmHg)
      break
    case 'heartRate':
      set('bpm', entry.bpm)
      set('activity', entry.activity)
      break
    case 'bloodGlucose':
      set('mgDl', displayGlucose(entry.mgDl))
      set('context', entry.context)
      set('device', entry.device)
      break
    case 'bodyTemperature':
      set('celsius', displayTemperature(entry.celsius))
      set('method', entry.method)
      set('exercisedLast30Min', entry.exercisedLast30Min)
      break
    case 'sleep':
      set('hours', entry.hours)
      set('source', entry.source)
      break
    case 'mood':
      set('kind', entry.kind)
      if (entry.kind === 'dailyRating') set('rating', entry.rating)
      break
  }
  return v
}

function buildEntry(
  indicator: IndicatorId,
  v: Values,
  symptoms: string[],
  existing?: HealthEntry,
): Record<string, unknown> {
  const raw: Record<string, unknown> = {
    // An edit keeps the id and the time of the measurement; the person set the new values.
    id: existing?.id ?? crypto.randomUUID(),
    recordedAt: existing?.recordedAt ?? new Date().toISOString(),
    origin: 'userEntered',
    ...(existing ? { editedAt: new Date().toISOString() } : {}),
    indicator,
    ...(symptoms.length > 0 ? { symptoms } : {}),
  }
  for (const field of NUMBER_FIELDS[indicator]) raw[field.name] = toNumber(v[field.name])
  // Input in the units chosen in Settings; stored in °C and mg/dL.
  const convert = (name: string, fn: (n: number) => number) => {
    const n = raw[name]
    if (typeof n === 'number' && Number.isFinite(n)) raw[name] = fn(n)
  }
  if (indicator === 'bodyTemperature') convert('celsius', toStoredCelsius)
  if (indicator === 'bloodGlucose') convert('mgDl', toStoredMgDl)
  if (indicator === 'heartRate') raw.activity = v.activity
  if (indicator === 'bloodGlucose') Object.assign(raw, { context: v.context, device: v.device })
  if (indicator === 'bodyTemperature') {
    Object.assign(raw, { method: v.method, exercisedLast30Min: v.exercisedLast30Min === 'true' })
  }
  if (indicator === 'sleep') raw.source = v.source
  if (indicator === 'mood') {
    raw.kind = v.kind
    if (v.kind === 'phq2') {
      const a = toNumber(v.phq2a)
      const b = toNumber(v.phq2b)
      raw.score = a === undefined || b === undefined ? undefined : a + b
    } else raw.rating = toNumber(v.rating)
  }
  return raw
}

function Choice({
  name,
  legend,
  options,
  values,
  onChange,
  error,
}: {
  name: string
  legend: string
  options: Record<string, string>
  values: Values
  onChange: (name: string, value: string) => void
  error?: string
}) {
  return (
    <fieldset className="space-y-2" aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="text-sm font-medium">{legend}</legend>
      <RadioGroup
        value={values[name] ?? ''}
        onValueChange={(value) => onChange(name, value)}
        className="flex flex-wrap gap-x-4 gap-y-1"
      >
        {Object.entries(options).map(([value, label]) => (
          <div key={value} className="flex min-h-9 items-center gap-2">
            <RadioGroupItem id={`${name}-${value}`} value={value} />
            <Label htmlFor={`${name}-${value}`}>{label}</Label>
          </div>
        ))}
      </RadioGroup>
      <FieldError id={`${name}-error`} message={error} />
    </fieldset>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="text-sm font-medium text-destructive">
      {message}
    </p>
  ) : null
}

/** A clean form for a new entry. */
// oxlint-disable-next-line react/only-export-components
export const emptyValues = (): Values => ({ kind: 'dailyRating' })

/** True when the person has typed or chosen anything for this indicator. */
// oxlint-disable-next-line react/only-export-components
export function isTouched(values: Values, symptoms: string[]): boolean {
  return (
    symptoms.length > 0 ||
    Object.entries(values).some(([name, value]) => name !== 'kind' && value.trim() !== '') ||
    values.kind === 'phq2'
  )
}

export type CheckResult =
  { ok: true; value: HealthEntry } | { ok: false; errors: Record<string, string> }

/** Validates the form and builds the entry, or returns the messages per field. */
// oxlint-disable-next-line react/only-export-components
export function checkEntry(
  indicator: IndicatorId,
  values: Values,
  symptoms: string[],
  entry?: HealthEntry,
): CheckResult {
  const result = validateEntry(buildEntry(indicator, values, symptoms, entry))
  // The model accepts these fields missing on old stored entries; new entries must record them.
  const missingActivity = indicator === 'heartRate' && !values.activity
  const missingMethod = indicator === 'bodyTemperature' && !values.method
  if (result.ok && !missingActivity && !missingMethod) return { ok: true, value: result.value }
  const errors: Record<string, string> = {}
  if (missingActivity) errors.activity = 'Choose an option.'
  if (missingMethod) errors.method = 'Choose an option.'
  for (const issue of result.ok ? [] : result.issues) {
    // A missing PHQ-2 answer surfaces on the score.
    const field = issue.field === 'score' ? (values.phq2a ? 'phq2b' : 'phq2a') : issue.field
    errors[field] = ISSUE_MESSAGES[issue.code] ?? 'Choose an option.'
  }
  return { ok: false, errors }
}

/** The inputs for one indicator: values, context choices, and optional symptoms. */
export function IndicatorFields({
  indicator,
  values,
  set,
  symptoms,
  setSymptoms,
  errors,
  entry,
  phq2,
}: {
  indicator: IndicatorId
  values: Values
  set: (name: string, value: string) => void
  symptoms: string[]
  setSymptoms: (update: (s: string[]) => string[]) => void
  errors: Record<string, string>
  /** The entry being edited, if any. */
  entry?: HealthEntry
  phq2: Phq2Schedule
}) {
  const symptomOptions = SYMPTOMS_BY_INDICATOR[indicator] ?? []
  // When editing, the PHQ-2 is answered again (only the total is stored), whatever the schedule.
  const phq2Open = entry ? values.kind === 'phq2' : phq2.due

  let extra: ReactNode = null
  if (indicator === 'heartRate') {
    extra = (
      <Choice
        name="activity"
        legend="When was it taken?"
        options={HEART_RATE_ACTIVITY_LABELS}
        values={values}
        onChange={set}
        error={errors.activity}
      />
    )
  } else if (indicator === 'bloodGlucose') {
    extra = (
      <>
        <Choice
          name="context"
          legend="Context"
          options={GLUCOSE_CONTEXT_LABELS}
          values={values}
          onChange={set}
          error={errors.context}
        />
        <Choice
          name="device"
          legend="Device"
          options={GLUCOSE_DEVICE_LABELS}
          values={values}
          onChange={set}
          error={errors.device}
        />
      </>
    )
  } else if (indicator === 'bodyTemperature') {
    extra = (
      <>
        <Choice
          name="method"
          legend="Method"
          options={TEMPERATURE_METHOD_LABELS}
          values={values}
          onChange={set}
          error={errors.method}
        />
        <div className="flex min-h-9 items-center gap-2">
          <Checkbox
            id="exercisedLast30Min"
            checked={values.exercisedLast30Min === 'true'}
            onCheckedChange={(checked) => set('exercisedLast30Min', String(checked === true))}
          />
          <Label htmlFor="exercisedLast30Min">I exercised in the last 30 minutes</Label>
        </div>
      </>
    )
  } else if (indicator === 'sleep') {
    extra = (
      <Choice
        name="source"
        legend="Source"
        options={SLEEP_SOURCE_LABELS}
        values={values}
        onChange={set}
        error={errors.source}
      />
    )
  } else if (indicator === 'mood') {
    extra = (
      <>
        {entry ? null : phq2.due ? (
          <Choice
            name="kind"
            legend="Assessment"
            options={{
              dailyRating: 'Daily mood rating',
              phq2: 'PHQ-2 depression screening (every 14 days)',
            }}
            values={values}
            onChange={set}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            PHQ-2 screening is scheduled every 14 days (team decision). Next due{' '}
            <span className="num">{formatDate(phq2.nextDue!)}</span>.
          </p>
        )}
        {values.kind === 'phq2' && phq2Open ? (
          <>
            <p className="text-sm">
              Over the last 2 weeks, how often have you been bothered by the following problems?
            </p>
            {PHQ2_ITEMS.map((item) => (
              <Choice
                key={item.name}
                name={item.name}
                legend={item.label}
                options={PHQ2_ANSWERS}
                values={values}
                onChange={set}
                error={errors[item.name]}
              />
            ))}
            <p className="text-sm text-muted-foreground">
              The questions ask about the last 2 weeks. The PHQ-2 is a screener, not a diagnosis or
              a daily mood score, and it has not been validated for astronauts.
            </p>
          </>
        ) : (
          <Choice
            name="rating"
            legend="Mood today, your own rating (1 = lowest, 5 = highest)"
            options={RATING_ANSWERS}
            values={values}
            onChange={set}
            error={errors.rating}
          />
        )}
        <p className="rounded-md border p-3 text-sm font-medium">{MOOD_SAFETY_MESSAGE}</p>
      </>
    )
  }

  return (
    <>
      {NUMBER_FIELDS[indicator].map((field) => (
        <div key={field.name} className="grid gap-1.5">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            id={field.name}
            inputMode="decimal"
            autoComplete="off"
            value={values[field.name] ?? ''}
            onChange={(e) => set(field.name, e.target.value)}
            aria-invalid={errors[field.name] ? true : undefined}
            aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
          />
          <FieldError id={`${field.name}-error`} message={errors[field.name]} />
        </div>
      ))}

      {extra}

      {symptomOptions.length > 0 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Symptoms right now (optional)</legend>
          <div className="grid gap-x-4 sm:grid-cols-2">
            {symptomOptions.map((id) => (
              <div key={id} className="flex min-h-9 items-center gap-2">
                <Checkbox
                  id={`symptom-${id}`}
                  checked={symptoms.includes(id)}
                  onCheckedChange={(checked) =>
                    setSymptoms((s) => (checked === true ? [...s, id] : s.filter((x) => x !== id)))
                  }
                />
                <Label htmlFor={`symptom-${id}`}>{SYMPTOMS[id]}</Label>
              </div>
            ))}
          </div>
        </fieldset>
      ) : null}
    </>
  )
}
