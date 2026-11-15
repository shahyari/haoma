import type { IndicatorId } from '@/domain/indicators'

/** Card order from the owner's layout (brainstorm Section 16); also the Log entry tab order. */
export const HOME_ORDER: IndicatorId[] = [
  'heartRate',
  'bloodPressure',
  'bloodGlucose',
  'bodyTemperature',
  'sleep',
  'mood',
]
