import { Info, Settings } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useHealthData } from '@/data/HealthDataProvider'
import { createDemoEntries, DEMO_PROFILE } from '@/demo/demo'
import { evaluateAll } from '@/rules/evaluate'

const initials = DEMO_PROFILE.name
  .split(' ')
  .map((part) => part[0])
  .join('')

const linkClass =
  'flex min-h-10 items-center gap-2 rounded-md px-2 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring'

/**
 * Avatar card (owner brainstorm Section 16): the fictional profile, the demo-data
 * notice, and the links to Settings and About.
 */
export function ProfileMenu() {
  const { data, replaceEntries } = useHealthData()
  const [open, setOpen] = useState(false)
  const toReview = useMemo(
    () =>
      evaluateAll(data.entries, { missionPhase: data.missionPhase }).filter(
        (a) => a.status === 'attention' || a.status === 'escalate',
      ).length,
    [data.entries, data.missionPhase],
  )
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
            aria-label={`Profile: ${DEMO_PROFILE.name}. Settings and About`}
            className="inline-flex size-11 items-center justify-center rounded-full border bg-muted text-sm font-medium outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden="true">{initials}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 space-y-1 p-3" aria-label="Profile">
          <div className="space-y-3 px-2 pt-1">
            <p>
              <span className="font-medium">{DEMO_PROFILE.name}</span>{' '}
              <span className="rounded-md border border-dashed px-2 py-0.5 text-sm">
                {DEMO_PROFILE.label}
              </span>
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="text-right">{DEMO_PROFILE.role}</dd>
              <dt className="text-muted-foreground">Mission</dt>
              <dd className="text-right">{DEMO_PROFILE.mission}</dd>
              <dt className="text-muted-foreground">Mission day</dt>
              <dd className="num text-right">{DEMO_PROFILE.missionDay}</dd>
              <dt className="text-muted-foreground">Indicators to review</dt>
              <dd className="num text-right">{toReview}</dd>
            </dl>
            <p className="text-sm text-muted-foreground">
              Fictional person and mission. All health measurements in the demo are simulated.
            </p>
            {hasSimulated ? (
              <p className="rounded-md border border-dashed p-2 text-sm">
                <strong className="font-medium">Demo data.</strong> Entries marked “Simulated” are
                invented for this demonstration. They are not real astronaut data.
              </p>
            ) : null}
            {data.entries.length === 0 ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  replaceEntries(createDemoEntries(new Date()))
                  setOpen(false)
                }}
              >
                Load simulated demo history
              </Button>
            ) : null}
          </div>
          <nav aria-label="Profile menu" className="border-t pt-1">
            <Link to="/settings" className={linkClass} onClick={() => setOpen(false)}>
              <Settings aria-hidden="true" className="size-4" />
              Settings
            </Link>
            <Link to="/about" className={linkClass} onClick={() => setOpen(false)}>
              <Info aria-hidden="true" className="size-4" />
              About
            </Link>
          </nav>
        </PopoverContent>
      </Popover>
    </div>
  )
}
