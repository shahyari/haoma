import type { LucideIcon } from 'lucide-react'
import { CircleAlert, Inbox, LoaderCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface StatePanelProps {
  title: string
  description?: ReactNode
  /** Optional action, e.g. a retry button. */
  action?: ReactNode
  className?: string
}

interface BaseProps extends StatePanelProps {
  icon: LucideIcon
  iconClassName?: string
  role?: 'status' | 'alert'
}

function StatePanel({
  icon: Icon,
  iconClassName,
  role,
  title,
  description,
  action,
  className,
}: BaseProps) {
  return (
    <div
      role={role}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center',
        className,
      )}
    >
      <Icon aria-hidden="true" className={cn('size-6 text-muted-foreground', iconClassName)} />
      <p className="font-medium">{title}</p>
      {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

/** Nothing to show yet. */
export function EmptyState(props: StatePanelProps) {
  return <StatePanel icon={Inbox} {...props} />
}

/** Work in progress; announced politely to assistive technology. */
export function LoadingState({ title = 'Loading…', ...props }: Partial<StatePanelProps>) {
  return (
    <StatePanel
      icon={LoaderCircle}
      iconClassName="motion-safe:animate-spin"
      role="status"
      title={title}
      {...props}
    />
  )
}

/** Something failed; announced immediately to assistive technology. */
export function ErrorState(props: StatePanelProps) {
  return <StatePanel icon={CircleAlert} iconClassName="text-destructive" role="alert" {...props} />
}
