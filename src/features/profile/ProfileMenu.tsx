import { FileText, Info, Settings } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useHealthData } from '@/data/HealthDataProvider'
import { createDemoEntries, DEMO_PROFILE } from '@/demo/demo'
import { MISSION_PHASE_LABELS, MISSION_PHASES, type MissionPhase } from '@/domain/mission'
import { useSettings } from '@/settings/SettingsProvider'
import { ZONE_LABELS, ZONES, type Zone } from '@/settings/settings'

const initials = DEMO_PROFILE.name
  .split(' ')
  .map((part) => part[0])
  .join('')

const linkClass =
  'flex min-h-10 items-center gap-2 rounded-md px-2 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring'

/** A button that asks for a second click before it acts. */
function ConfirmButton({
  label,
  confirmLabel,
  disabled,
  needsConfirm = true,
  onConfirm,
}: {
  label: string
  confirmLabel: string
  disabled?: boolean
  needsConfirm?: boolean
  onConfirm: () => void
}) {
  const [armed, setArmed] = useState(false)
  return (
    <Button
      variant={armed ? 'destructive' : 'outline'}
      className="w-full"
      disabled={disabled}
      onClick={() => {
        if (needsConfirm && !armed) {
          setArmed(true)
          window.setTimeout(() => setArmed(false), 3000)
          return
        }
        setArmed(false)
        onConfirm()
      }}
    >
      {armed ? confirmLabel : label}
    </Button>
  )
}

/**
 * Avatar card (owner brainstorm Sections 16 and 17): the fictional profile, links to
 * Reports, Settings and About, the demo notice, mission zone, demo data, and clearing data.
 */
export function ProfileMenu() {
  const { data, replaceEntries, clearAll, setMissionPhase } = useHealthData()
  const { settings, update } = useSettings()
  const [open, setOpen] = useState(false)
  const hasSimulated = data.entries.some((e) => e.origin === 'simulated')
  const hasData = data.entries.length + data.painLogs.length + data.reports.length > 0

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

          <div className="space-y-4 p-4">
            <div className="rounded-md border border-dashed p-3 text-sm">
              <p className="font-medium">Demo data and fictional person</p>
              <p className="mt-1 text-muted-foreground">
                All health measurements in the demo are simulated.
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label id="zone-label">Mission zone</Label>
              <Select
                value={settings.zone}
                onValueChange={(zone) => update({ zone: zone as Zone })}
              >
                <SelectTrigger aria-labelledby="zone-label" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZONES.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {ZONE_LABELS[zone]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Not in the wireframe: the mission phase drives approved rules (RULE-26, RULE-30). */}
            <div className="grid gap-1.5">
              <Label id="phase-label">Mission phase</Label>
              <Select
                value={data.missionPhase}
                onValueChange={(phase) => setMissionPhase(phase as MissionPhase)}
              >
                <SelectTrigger
                  aria-labelledby="phase-label"
                  aria-describedby="phase-hint"
                  className="w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MISSION_PHASES.map((phase) => (
                    <SelectItem key={phase} value={phase}>
                      {MISSION_PHASE_LABELS[phase]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p id="phase-hint" className="text-xs text-muted-foreground">
                Team-set parameter: “Approaching landing” is the 24 hours before landing,
                “Post-landing” the 72 hours after.
              </p>
            </div>

            <div className="space-y-2">
              <ConfirmButton
                label="Load demo data"
                confirmLabel="Replace entries with demo data"
                needsConfirm={data.entries.length > 0}
                onConfirm={() => replaceEntries(createDemoEntries(new Date()))}
              />
              <ConfirmButton
                label="Clear data"
                confirmLabel="Confirm: delete all data"
                disabled={!hasData}
                onConfirm={() => clearAll()}
              />
              <p className="text-xs text-muted-foreground">
                Data is stored only in this browser. Clearing deletes entries, pain logs, and
                reports.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
