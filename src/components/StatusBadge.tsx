import {
  CircleCheck,
  CircleDashed,
  Minus,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
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
 * The shadcn badge (default size and type), fully rounded. It only ever says "Normal",
 * "Attention", "Escalate", "Not evaluated", or "No measurement" (owner, 2026-11-14);
 * any other wording is shown next to it. Status is conveyed by icon and text, never by
 * colour alone; the two neutral states get no status colour.
 */
export function StatusBadge({ status, className }: { status: DisplayStatus; className?: string }) {
  const Icon = STATUS_ICONS[status]
  const tiered = status === 'normal' || status === 'attention' || status === 'escalate'
  return (
    <Badge
      variant="outline"
      data-status={tiered ? status : undefined}
      className={cn(
        'rounded-full',
        tiered ? 'status-surface text-foreground' : 'border-dashed text-muted-foreground',
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        data-icon="inline-start"
        className={cn(tiered && 'text-(--status-color)')}
      />
      {DISPLAY_STATUS_LABELS[status]}
    </Badge>
  )
}
