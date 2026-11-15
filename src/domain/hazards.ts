/**
 * NASA's five spaceflight hazards (RIDGE) and their link to each indicator (owner decision 2026-11-15).
 * Source: docs/scientific-foundations.md -> "Spaceflight hazards (RIDGE)".
 *
 * Explanatory only: hazards never change a rule, threshold, status, or baseline.
 */
import type { IndicatorId } from '@/domain/indicators'

export const HAZARD_IDS = ['radiation', 'isolation', 'distance', 'gravity', 'environment'] as const
export type HazardId = (typeof HAZARD_IDS)[number]

/** REF-63. */
export const HAZARDS_SOURCE_URL = 'https://www.nasa.gov/humans-in-space/the-human-body-in-space/'

export interface Hazard {
  id: HazardId
  label: string
  summary: string
  /** For the docs only; not shown in the app (design.md: no reference IDs on screen). */
  ref: string
}

/** Summaries paraphrase REF-63 and the hazard pages REF-12 to REF-16. */
export const HAZARDS: Record<HazardId, Hazard> = {
  radiation: {
    id: 'radiation',
    label: 'Space radiation',
    summary:
      'Particles trapped in Earth’s magnetic field, solar particles, and galactic cosmic rays; some are hard to shield against.',
    ref: 'REF-12',
  },
  isolation: {
    id: 'isolation',
    label: 'Isolation and confinement',
    summary:
      'Small, noisy quarters, shifting schedules, and long separation can disturb sleep, mood, and team dynamics.',
    ref: 'REF-13',
  },
  distance: {
    id: 'distance',
    label: 'Distance from Earth',
    summary:
      'Communication delays (up to 20 minutes one way from Mars) and limited supplies mean crews must solve problems themselves.',
    ref: 'REF-14',
  },
  gravity: {
    id: 'gravity',
    label: 'Gravity fields',
    summary:
      'Weightlessness, partial gravity, and the return to Earth shift body fluids and change the heart, bones, and muscles.',
    ref: 'REF-15',
  },
  environment: {
    id: 'environment',
    label: 'Hostile/closed environments',
    summary:
      'Microbes pass more easily between people in a closed habitat, and stress and immune changes can raise susceptibility to illness.',
    ref: 'REF-16',
  },
}

export interface IndicatorHazards {
  hazards: readonly HazardId[]
  /** The linked NASA HRP risk, from the approved indicator summary table. */
  risk: string
  /** A hazard linked only indirectly; shown with that qualifier. */
  indirect?: readonly HazardId[]
}

export const INDICATOR_HAZARDS: Record<IndicatorId, IndicatorHazards> = {
  bloodPressure: { hazards: ['gravity'], risk: 'Cardiovascular adaptations' },
  heartRate: { hazards: ['gravity'], risk: 'Cardiovascular adaptations' },
  bloodGlucose: { hazards: ['distance', 'environment'], risk: 'Inadequate food and nutrition' },
  bodyTemperature: {
    hazards: ['environment', 'radiation'],
    indirect: ['radiation'],
    risk: 'Altered immune response',
  },
  sleep: {
    hazards: ['isolation'],
    risk: 'Sleep loss, circadian desynchronization, and work overload',
  },
  mood: {
    hazards: ['isolation', 'distance'],
    risk: 'Adverse cognitive or behavioral conditions and psychiatric disorders',
  },
}

/** Indicators linked to a hazard, in the order given. */
export function indicatorsFor(hazard: HazardId, order: readonly IndicatorId[]): IndicatorId[] {
  return order.filter((id) => INDICATOR_HAZARDS[id].hazards.includes(hazard))
}
