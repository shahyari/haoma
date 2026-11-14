import type { HealthEntry } from './indicators'

export const GLUCOSE_CONTEXT_LABELS = {
  fasting: 'Fasting',
  nonFasting: 'Non-fasting',
  unknown: 'Unknown',
} as const
export const GLUCOSE_DEVICE_LABELS = { fingerstick: 'Fingerstick', cgm: 'CGM' } as const
export const TEMPERATURE_METHOD_LABELS = { oral: 'Oral', forehead: 'Forehead sensor' } as const
export const SLEEP_SOURCE_LABELS = { selfReport: 'Self-report', actigraphy: 'Actigraphy' } as const

/** The reading with its unit, e.g. "118/76 mmHg". */
export function formatValue(entry: HealthEntry): string {
  switch (entry.indicator) {
    case 'bloodPressure':
      return `${entry.systolicMmHg}/${entry.diastolicMmHg} mmHg`
    case 'heartRate':
      return `${entry.bpm} bpm`
    case 'bloodGlucose':
      return `${entry.mgDl} mg/dL`
    case 'bodyTemperature':
      return `${entry.celsius} °C`
    case 'sleep':
      return `${entry.hours} h`
    case 'mood':
      return entry.kind === 'phq2' ? `PHQ-2 ${entry.score}/6` : `Rating ${entry.rating}/5`
  }
}

/** Input context of the reading, e.g. "Fasting · Fingerstick". */
export function formatContext(entry: HealthEntry): string | undefined {
  switch (entry.indicator) {
    case 'bloodGlucose':
      return `${GLUCOSE_CONTEXT_LABELS[entry.context]} · ${GLUCOSE_DEVICE_LABELS[entry.device]}`
    case 'bodyTemperature':
      return entry.exercisedLast30Min
        ? `${TEMPERATURE_METHOD_LABELS[entry.method]} · after exercise`
        : TEMPERATURE_METHOD_LABELS[entry.method]
    case 'sleep':
      return SLEEP_SOURCE_LABELS[entry.source]
    default:
      return undefined
  }
}
