import type { IndicatorId } from '@/domain/indicators'

/** Status tiers of the approved rules (docs/scientific-foundations.md). */
export const STATUSES = ['normal', 'attention', 'escalate'] as const
export type Status = (typeof STATUSES)[number]

export const STATUS_LABELS: Record<Status, string> = {
  normal: 'Normal',
  attention: 'Attention',
  escalate: 'Escalate',
}

/** Evidence-type labels (docs/science.md -> "Guidance policy"). */
export const EVIDENCE_LABELS = {
  SE: 'Spaceflight evidence',
  GCR: 'General clinical reference',
  TDD: 'Team design decision',
  SDL: 'Simulated demo logic',
} as const
export type EvidenceLabel = keyof typeof EVIDENCE_LABELS

export interface RuleDefinition {
  id: string
  indicator: IndicatorId
  status: Status
  /** What the app tells the user. Wording from scientific-foundations.md. Absent for Normal rules. */
  action?: string
  /** Label(s) of the threshold basis. */
  thresholdLabels: EvidenceLabel[]
  /** Label(s) of the action wording. */
  actionLabels: EvidenceLabel[]
  /** REF IDs in docs/references.md. */
  refs: string[]
}

export interface Finding {
  rule: RuleDefinition
  /** Message for this reading; equals `rule.action` unless the rule has a template. */
  message?: string
}

export interface IndicatorAssessment {
  indicator: IndicatorId
  /**
   * `none`: readings exist but no approved rule assigns a status (shown as
   * neutral). `missing`: no reading yet.
   */
  status: Status | 'none' | 'missing'
  findings: Finding[]
  /** Neutral explanation when status is `none`. */
  note?: string
}
