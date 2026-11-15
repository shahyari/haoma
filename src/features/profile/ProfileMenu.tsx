import { FileText, Info, Settings } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useHealthData } from '@/data/HealthDataProvider'
import { DEMO_PROFILE } from '@/demo/demo'

const initials = DEMO_PROFILE.name
  .split(' ')
  .map((part) => part[0])
  .join('')

const linkClass =
  'flex min-h-10 items-center gap-2 rounded-md px-2 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring'

/**
 * Avatar card (owner brainstorm Sections 16 and 17): the fictional profile, links to
 * Reports, Settings and About, and the demo notice. The demo controls are in Settings
 * (owner usability review, 2026-11-15).
 */
export function ProfileMenu() {
  const { data } = useHealthData()
  const [open, setOpen] = useState(false)
  const hasSimulated = data.entries.some((e) => e.origin === 'simulated')

  return (
    <div className="flex items-center gap-2">
      {hasSimulated ? (
        <span className="rounded-md border border-dashed px-2 py-0.5 text-sm">Demo data</span>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Profile: ${DEMO_PROFILE.name}. Reports, Settings and About`}
            className="inline-flex size-11 items-center justify-center rounded-full border bg-muted text-sm font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden="true">{initials}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 gap-0 p-0" aria-label="Profile">
          <div className="flex flex-col items-center gap-1 px-4 pt-5 pb-4 text-center">
            <span
              aria-hidden="true"
              className="mb-2 inline-flex size-16 items-center justify-center rounded-full border bg-muted text-lg font-medium"
            >
              {initials}
            </span>
            <p className="font-medium">{DEMO_PROFILE.name}</p>
            <p className="text-sm text-muted-foreground">Fictional {DEMO_PROFILE.role}</p>
          </div>

          <nav aria-label="Profile menu" className="border-y p-2">
            <Link to="/reports" className={linkClass} onClick={() => setOpen(false)}>
              <FileText aria-hidden="true" className="size-4" />
              Reports
            </Link>
            <Link to="/settings" className={linkClass} onClick={() => setOpen(false)}>
              <Settings aria-hidden="true" className="size-4" />
              Settings
            </Link>
            <Link to="/about" className={linkClass} onClick={() => setOpen(false)}>
              <Info aria-hidden="true" className="size-4" />
              About
            </Link>
          </nav>

          <div className="p-4">
            <div className="rounded-md border border-dashed p-3 text-sm">
              <p className="font-medium">Demo data and fictional person</p>
              <p className="mt-1 text-muted-foreground">
                All health measurements in the demo are simulated.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
