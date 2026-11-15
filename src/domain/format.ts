import type { HealthEntry } from './indicators'
import { displayGlucose, displayTemperature, glucoseUnitLabel, temperatureUnitLabel } from './units'

export const GLUCOSE_CONTEXT_LABELS = {
  fasting: 'Fasting',
  nonFasting: 'Non-fasting',
  unknown: 'Unknown',
} as const
export const GLUCOSE_DEVICE_LABELS = { fingerstick: 'Fingerstick', cgm: 'CGM' } as const
export const TEMPERATURE_METHOD_LABELS = { oral: 'Oral', forehead: 'Forehead sensor' } as const
export const HEART_RATE_ACTIVITY_LABELS = {
  rest: 'At rest',
  afterActivity: 'After activity',
} as const
export const SLEEP_SOURCE_LABELS = { selfReport: 'Self-report', actigraphy: 'Actigraphy' } as const

export function temperatureMethodLabel(method: keyof typeof TEMPERATURE_METHOD_LABELS | undefined) {
  return method ? TEMPERATURE_METHOD_LABELS[method] : 'Method not recorded'
}

/** The reading with its unit, e.g. "118/76 mmHg". */
export interface ValueParts {
  /** Word before the number, e.g. "Rating". */
  prefix?: string
  /** The number itself, e.g. "128/82". */
  value: string
  unit?: string
}

/** The latest value split into number and unit, so they can be typeset differently. */
export function formatValueParts(entry: HealthEntry): ValueParts {
  switch (entry.indicator) {
    case 'bloodPressure':
      return { value: `${entry.systolicMmHg}/${entry.diastolicMmHg}`, unit: 'mmHg' }
    case 'heartRate':
      return { value: String(entry.bpm), unit: 'bpm' }
    case 'bloodGlucose':
      return { value: String(displayGlucose(entry.mgDl)), unit: glucoseUnitLabel() }
    case 'bodyTemperature':
      return { value: String(displayTemperature(entry.celsius)), unit: temperatureUnitLabel() }
    case 'sleep':
      return { value: String(entry.hours), unit: 'h' }
    case 'mood':
      return entry.kind === 'phq2'
        ? { prefix: 'PHQ-2', value: `${entry.score}/6` }
        : { prefix: 'Rating', value: `${entry.rating}/5` }
  }
}

export function formatValue(entry: HealthEntry): string {
  const { prefix, value, unit } = formatValueParts(entry)
  return [prefix, value, unit].filter(Boolean).join(' ')
}

/** Input context of the reading, e.g. "Fasting · Fingerstick". */
export function formatContext(entry: HealthEntry): string | undefined {
  switch (entry.indicator) {
    case 'bloodGlucose':
      return `${GLUCOSE_CONTEXT_LABELS[entry.context]} · ${GLUCOSE_DEVICE_LABELS[entry.device]}`
    case 'heartRate':
      return entry.activity ? HEART_RATE_ACTIVITY_LABELS[entry.activity] : 'Rest state not recorded'
    case 'bodyTemperature': {
      const method = temperatureMethodLabel(entry.method)
      return entry.exercisedLast30Min ? `${method} · after exercise` : method
    }
    case 'sleep':
      return SLEEP_SOURCE_LABELS[entry.source]
    default:
      return undefined
  }
}
