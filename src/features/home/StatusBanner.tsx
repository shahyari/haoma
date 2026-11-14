import { ChevronDown } from 'lucide-react'

import { STATUS_ICONS } from '@/components/StatusBadge'
import { formatValue } from '@/domain/format'
import { INDICATORS, type HealthEntry } from '@/domain/indicators'
import {
  EVIDENCE_LABELS,
  STATUS_LABELS,
  type EvidenceLabel,
  type IndicatorAssessment,
  type Status,
} from '@/rules/types'

const labels = (codes: EvidenceLabel[]) => codes.map((c) => EVIDENCE_LABELS[c]).join(' + ')

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
          <span className="num">{formatValue(latest)}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="size-4 shrink-0 group-open:rotate-180 motion-safe:transition-transform"
        />
      </summary>
      <ul className="space-y-3 border-t border-(--status-color) bg-card px-3 py-3 text-sm">
        {assessment.findings.map(({ rule, message }) => (
          <li key={rule.id} className="space-y-1">
            <p>{message}</p>
            <p className="text-muted-foreground">
              Threshold: {labels(rule.thresholdLabels)}. Action: {labels(rule.actionLabels)}.{' '}
              <span className="num">
                {rule.id} · {rule.refs.join(', ')}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </details>
  )
}
