/**
 * Optional sex attribute and sex-specific evidence notes (owner decision 2026-11-15).
 * Source: docs/scientific-foundations.md -> "Sex as an optional profile attribute".
 *
 * Sex never changes a threshold, rule, status, or baseline. It only selects which
 * evidence notes may be shown, and only notes with status 'Approved' are shown
 * (docs/science.md: only Approved items may affect app behavior).
 */
import type { IndicatorId } from '@/domain/indicators'
import type { MissionPhase } from '@/domain/mission'

export const SEX_VALUES = ['notSet', 'female', 'male'] as const
export type Sex = (typeof SEX_VALUES)[number]

export const SEX_LABELS: Record<Sex, string> = {
  notSet: 'Not set',
  female: 'Female',
  male: 'Male',
}

export const DEFAULT_SEX: Sex = 'notSet'

export type EvidenceStatus = 'Unverified' | 'Reviewed' | 'Approved'

export interface SexNote {
  id: string
  indicator: IndicatorId
  sex: Exclude<Sex, 'notSet'>
  /** Mission phases in which the note applies. */
  phases: readonly MissionPhase[]
  /** Wording as approved in scientific-foundations.md (copy for health guidance). */
  text: string
  refs: readonly string[]
  status: EvidenceStatus
}

export const SEX_NOTES: readonly SexNote[] = [
  {
    id: 'SN-01',
    indicator: 'bloodPressure',
    sex: 'female',
    phases: ['approachingLanding', 'postLanding'],
    text: 'After landing, lightheadedness or fainting on standing has been reported more often in female astronauts than in male astronauts. The rules and thresholds here are the same for everyone, and differences between individuals are often larger than differences between sexes.',
    refs: ['REF-59', 'REF-60', 'REF-61'],
    status: 'Approved', // owner 2026-11-15
  },
]

/** Notes to show for this indicator, sex and phase. Only Approved notes are returned. */
export function sexNotesFor(
  indicator: IndicatorId,
  sex: Sex,
  phase: MissionPhase,
  notes: readonly SexNote[] = SEX_NOTES,
): SexNote[] {
  if (sex === 'notSet') return []
  return notes.filter(
    (n) =>
      n.status === 'Approved' &&
      n.indicator === indicator &&
      n.sex === sex &&
      n.phases.includes(phase),
  )
}
