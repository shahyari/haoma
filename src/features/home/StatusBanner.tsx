import { ChevronDown } from 'lucide-react'

import { STATUS_ICONS } from '@/components/StatusBadge'
import { formatValue } from '@/domain/format'
import { INDICATORS, type HealthEntry } from '@/domain/indicators'
import {
  EVIDENCE_LABELS,
  STATUS_LABELS,
  type EvidenceLabel,
  type Finding,
  type IndicatorAssessment,
  type Status,
} from '@/rules/types'

// oxlint-disable-next-line react/only-export-components
export const REFERENCES_URL = 'https://github.com/shahyari/haoma/blob/main/docs/references.md'

const labels = (codes: EvidenceLabel[]) => codes.map((c) => EVIDENCE_LABELS[c]).join(' + ')

/** Evidence line for a rule: both labels, the rule ID, and its references. */
export function RuleEvidence({ rule }: { rule: Finding['rule'] }) {
  return (
    <p className="text-muted-foreground">
      Threshold: {labels(rule.thresholdLabels)}.
      {rule.actionLabels.length > 0 ? ` Action: ${labels(rule.actionLabels)}.` : ''}{' '}
      <span className="num">{rule.id}</span> ·{' '}
      <a
        href={REFERENCES_URL}
        target="_blank"
        rel="noreferrer"
        className="num underline underline-offset-2"
      >
        {rule.refs.join(', ')}
      </a>
    </p>
  )
}

/** The rules that apply to the latest reading, with their actions and evidence. */
export function FindingList({ findings, className }: { findings: Finding[]; className?: string }) {
  return (
    <ul className={className}>
      {findings.map(({ rule, message, reason }) => (
        <li key={rule.id + (reason ?? '')} className="space-y-1">
          {message ? <p>{message}</p> : null}
          <p className="text-muted-foreground">Applies because: {reason ?? rule.condition}</p>
          <RuleEvidence rule={rule} />
        </li>
      ))}
    </ul>
  )
}

/** Attention / Escalate banner: status by icon, text and colour; expands to the actions and their evidence. */
export function StatusBanner({
  assessment,
  latest,
}: {
  assessment: IndicatorAssessment
  latest: HealthEntry
}) {
  const status = assessment.status as Status
  const Icon = STATUS_ICONS[status]
  return (
    <details data-status={status} className="status-surface group rounded-lg border">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <Icon aria-hidden="true" className="size-5 shrink-0 text-(--status-color)" />
        <span className="flex-1">
          <span className="font-medium">
            {STATUS_LABELS[status]}: {INDICATORS[assessment.indicator].label}
          </span>{' '}
          {assessment.indicator === 'mood' ? null : (
            <span className="num">{formatValue(latest)}</span>
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 group-open:rotate-180 motion-safe:transition-transform"
        />
      </summary>
      <FindingList
        findings={assessment.findings}
        className="space-y-3 border-t border-(--status-color) bg-card px-3 py-3 text-sm"
      />
    </details>
  )
}
