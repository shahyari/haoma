import type { IndicatorId } from '@/domain/indicators'

/**
 * Body-map regions → related indicators (owner direction, 2026-11-14): cardiovascular
 * indicators with the chest, glucose with the abdominal region, sleep and mood with the
 * head, temperature with the whole body. A navigation aid only: a pain point in a region
 * says nothing about the linked indicator.
 */
export function relatedIndicators(log: { region: string; organ: string | null }): IndicatorId[] {
  const region = log.region.toLowerCase()
  const organ = log.organ
  const related: IndicatorId[] = []
  // Front of the chest (2D "upper chest" and "chest"; the same names in 3D) and the heart.
  if (organ === 'heart' || /(^|\s)(upper chest|chest)$/.test(region)) {
    related.push('heartRate', 'bloodPressure')
  }
  // Front of the abdomen and the abdominal organs of the 2D map.
  if (
    organ === 'liver' ||
    organ === 'stomach' ||
    organ === 'intestines' ||
    /(upper|lower) abdomen$/.test(region)
  ) {
    related.push('bloodGlucose')
  }
  // Head, face, back of head, and the brain.
  if (organ === 'brain' || ['head', 'face', 'back of head'].includes(region)) {
    related.push('sleep', 'mood')
  }
  // Temperature is whole-body context for every region.
  related.push('bodyTemperature')
  return related
}
