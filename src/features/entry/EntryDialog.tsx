import { useState, type FormEvent, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useHealthData } from '@/data/HealthDataProvider'
import {
  GLUCOSE_CONTEXT_LABELS,
  GLUCOSE_DEVICE_LABELS,
  HEART_RATE_ACTIVITY_LABELS,
  SLEEP_SOURCE_LABELS,
  TEMPERATURE_METHOD_LABELS,
} from '@/domain/format'
import { INDICATORS, type IndicatorId } from '@/domain/indicators'
import { SYMPTOMS, SYMPTOMS_BY_INDICATOR } from '@/domain/symptoms'
import { formatDate } from '@/domain/dates'
import { phq2Schedule } from '@/features/checkin/checkin'
import { validateEntry, type ValidationIssue } from '@/domain/validation'
import { MOOD_SAFETY_MESSAGE } from '@/rules/rules'

type Values = Record<string, string>

interface NumberFieldSpec {
  name: string
  label: string
}

/** Measurement notes from docs/scientific-foundations.md -> "Indicator summary". */
const HINTS: Partial<Record<IndicatorId, string>> = {
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
  bloodGlucose: [{ name: 'mgDl', label: 'Glucose (mg/dL)' }],
  bodyTemperature: [{ name: 'celsius', label: 'Temperature (°C)' }],
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
  negative: 'Enter a number that is not negative.',
  notAnInteger: 'Choose an answer.',
  outOfScale: 'Choose an answer.',
}

function toNumber(text: string | undefined): number | undefined {
  if (text === undefined || text.trim() === '') return undefined
  const value = Number(text.trim().replace(',', '.'))
  return Number.isNaN(value) ? Number.NaN : value
}

function buildEntry(
  indicator: IndicatorId,
  v: Values,
  symptoms: string[],
): Record<string, unknown> {
  const raw: Record<string, unknown> = {
    id: crypto.randomUUID(),
    recordedAt: new Date().toISOString(),
    origin: 'userEntered',
    indicator,
    ...(symptoms.length > 0 ? { symptoms } : {}),
  }
  for (const field of NUMBER_FIELDS[indicator]) raw[field.name] = toNumber(v[field.name])
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

interface Props {
  indicator: IndicatorId
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EntryDialog({ indicator, open, onOpenChange }: Props) {
  const { addEntry, data } = useHealthData()
  const [now] = useState(() => new Date())
  // The dialog has no Radix trigger, so remember what opened it and return focus there on close.
  const [opener] = useState(() =>
    typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null),
  )
  const phq2 = phq2Schedule(data.entries, now)
  const [values, setValues] = useState<Values>({ kind: 'dailyRating' })
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }))
  const symptomOptions = SYMPTOMS_BY_INDICATOR[indicator] ?? []

  function submit(event: FormEvent) {
    event.preventDefault()
    const result = validateEntry(buildEntry(indicator, values, symptoms))
    // The model accepts a missing rest state on old stored entries; new entries must record it.
    const missingActivity = indicator === 'heartRate' && !values.activity
    if (!result.ok || missingActivity) {
      const next: Record<string, string> = {}
      if (missingActivity) next.activity = 'Choose an option.'
      for (const issue of result.ok ? [] : result.issues) {
        // A missing PHQ-2 answer surfaces on the score.
        const field = issue.field === 'score' ? (values.phq2a ? 'phq2b' : 'phq2a') : issue.field
        next[field] = ISSUE_MESSAGES[issue.code] ?? 'Choose an option.'
      }
      setErrors(next)
      return
    }
    addEntry(result.value)
    onOpenChange(false)
  }

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
        {phq2.due ? (
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
        {values.kind === 'phq2' && phq2.due ? (
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90svh] overflow-y-auto"
        onCloseAutoFocus={(event) => {
          if (opener?.isConnected) {
            event.preventDefault()
            opener.focus()
          }
        }}
      >
        <form onSubmit={submit} noValidate className="space-y-4">
          <DialogHeader>
            <DialogTitle>{INDICATORS[indicator].label}</DialogTitle>
            <DialogDescription>{HINTS[indicator] ?? 'Add a new entry.'}</DialogDescription>
          </DialogHeader>

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
                        setSymptoms((s) =>
                          checked === true ? [...s, id] : s.filter((x) => x !== id),
                        )
                      }
                    />
                    <Label htmlFor={`symptom-${id}`}>{SYMPTOMS[id]}</Label>
                  </div>
                ))}
              </div>
            </fieldset>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save entry</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
