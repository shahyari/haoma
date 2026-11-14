/**
 * Symptom flags that the approved rules ask about.
 * Wording follows docs/scientific-foundations.md (RULE-08, RULE-12, RULE-25,
 * RULE-26, RULE-27 and the ADA checklists quoted there).
 */
import type { IndicatorId } from './indicators'

export const SYMPTOMS = {
  dizziness: 'Dizziness',
  lightheadedness: 'Lightheadedness',
  faintness: 'Feeling faint',
  blurredVision: 'Blurred vision',
  fainting: 'Fainting',
  breathlessness: 'Breathlessness',
  chestPain: 'Chest pain',
  irregularRhythm: 'Irregular heartbeat',
  shakiness: 'Shakiness',
  irritability: 'Irritability',
  confusion: 'Confusion',
  fastHeartbeat: 'Fast heartbeat',
  sweating: 'Sweating',
  hunger: 'Hunger',
  frequentUrination: 'Urinating much more than usual',
  extremeThirst: 'Very thirsty',
  weightLoss: 'Losing weight without trying',
  increasedHunger: 'Much hungrier than usual',
  /** TODO: RULE-16 says "symptoms" without listing them; the owner to define the list. */
  otherSymptoms: 'Other symptoms',
} as const
export type SymptomId = keyof typeof SYMPTOMS

export const LOW_BP_SYMPTOMS: SymptomId[] = [
  'dizziness',
  'lightheadedness',
  'faintness',
  'blurredVision',
  'fainting',
]
/** RULE-26 names these four (fainting belongs to RULE-25 only). */
export const POST_LANDING_SYMPTOMS: SymptomId[] = [
  'lightheadedness',
  'dizziness',
  'blurredVision',
  'faintness',
]
export const HEART_RATE_SYMPTOMS: SymptomId[] = [
  'dizziness',
  'fainting',
  'breathlessness',
  'chestPain',
]
export const HYPOGLYCEMIA_SYMPTOMS: SymptomId[] = [
  'shakiness',
  'irritability',
  'confusion',
  'fastHeartbeat',
  'sweating',
  'hunger',
]
export const HYPERGLYCEMIA_SYMPTOMS: SymptomId[] = [
  'frequentUrination',
  'extremeThirst',
  'weightLoss',
  'increasedHunger',
  'blurredVision',
]

/** Symptom checklist offered when entering each indicator. */
export const SYMPTOMS_BY_INDICATOR: Partial<Record<IndicatorId, SymptomId[]>> = {
  bloodPressure: LOW_BP_SYMPTOMS,
  heartRate: [...HEART_RATE_SYMPTOMS, 'irregularRhythm'],
  bloodGlucose: [...HYPOGLYCEMIA_SYMPTOMS, ...HYPERGLYCEMIA_SYMPTOMS],
  bodyTemperature: ['otherSymptoms'],
}
