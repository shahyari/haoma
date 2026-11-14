import {
  CircleCheck,
  CircleDashed,
  Minus,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { DISPLAY_STATUS_LABELS, type DisplayStatus } from '@/rules/types'

// oxlint-disable-next-line react/only-export-components
export const STATUS_ICONS: Record<DisplayStatus, LucideIcon> = {
  normal: CircleCheck,
  attention: TriangleAlert,
  escalate: OctagonAlert,
  none: CircleDashed,
  missing: Minus,
}

/**
 * Status is always conveyed by icon shape and text, never by colour alone.
 * "Not evaluated" and "No measurement" are neutral: they get no status colour.
 */
export function StatusBadge({
  status,
  label,
  className,
}: {
  status: DisplayStatus
  /** Replaces the default status name (owner-set wording such as "Below screening cutoff"). */
  label?: string
  className?: string
}) {
  const Icon = STATUS_ICONS[status]
  const tiered = status === 'normal' || status === 'attention' || status === 'escalate'
  return (
    <span
      data-status={tiered ? status : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium whitespace-nowrap',
        tiered ? 'status-surface' : 'border-dashed text-muted-foreground',
        className,
      )}
    >
      <Icon aria-hidden="true" className={cn('size-4', tiered && 'text-(--status-color)')} />
      {label ?? DISPLAY_STATUS_LABELS[status]}
    </span>
  )
}
