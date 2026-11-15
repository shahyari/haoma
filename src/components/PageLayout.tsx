import type { ReactNode } from 'react'

import { BackLink } from '@/components/BackLink'

/**
 * Layout of every page except Home (owner, 2026-11-15): the fixed width of the indicator
 * page (max 1024 px), centred, with the Back button, the title row, and the same spacing:
 * 12 px inside the header, 32 px between sections.
 */
export function PageLayout({
  title,
  description,
  actions,
  back = true,
  children,
}: {
  title: ReactNode
  /** One line under the title. */
  description?: ReactNode
  /** Buttons at the right of the title. */
  actions?: ReactNode
  back?: boolean
  children: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="space-y-3">
        {back ? <BackLink /> : null}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-2xl font-semibold">{title}</h1>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </div>
      {children}
    </div>
  )
}
