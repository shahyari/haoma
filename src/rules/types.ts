import type { IndicatorId } from '@/domain/indicators'

/** Status tiers of the approved rules (docs/scientific-foundations.md). */
export const STATUSES = ['normal', 'attention', 'escalate'] as const
export type Status = (typeof STATUSES)[number]

export const STATUS_LABELS: Record<Status, string> = {
  normal: 'Within reference',
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

/** What Home and the history view show for an indicator. The two states without a tier are never styled as a status. */
export type DisplayStatus = Status | 'none' | 'missing'
export const DISPLAY_STATUS_LABELS: Record<DisplayStatus, string> = {
  ...STATUS_LABELS,
  none: 'Not evaluated',
  missing: 'No measurement',
}

export interface RuleDefinition {
  id: string
  indicator: IndicatorId
  status: Status
  /** When the rule applies. Wording from scientific-foundations.md. */
  condition: string
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
  /** Which part of the rule applied, when the rule has alternatives. */
  reason?: string
}

export interface IndicatorAssessment {
  indicator: IndicatorId
  /**
   * `none`: readings exist but no approved rule assigns a status (shown as
   * neutral). `missing`: no reading yet.
   */
  status: DisplayStatus
  findings: Finding[]
  /** Neutral explanation when status is `none`. */
  note?: string
}
