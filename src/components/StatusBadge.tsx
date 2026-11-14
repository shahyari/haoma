import { CircleCheck, OctagonAlert, TriangleAlert, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { STATUS_LABELS, type Status } from '@/rules/types'

// oxlint-disable-next-line react/only-export-components
export const STATUS_ICONS: Record<Status, LucideIcon> = {
  normal: CircleCheck,
  attention: TriangleAlert,
  escalate: OctagonAlert,
}

/** Status is always conveyed by icon shape and text, never by colour alone. */
export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const Icon = STATUS_ICONS[status]
  return (
    <span
      data-status={status}
      className={cn(
        'status-surface inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4 text-(--status-color)" />
      {STATUS_LABELS[status]}
    </span>
  )
}
