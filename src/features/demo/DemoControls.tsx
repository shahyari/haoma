import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useHealthData } from '@/data/HealthDataProvider'
import { createDemoEntries } from '@/demo/demo'
import { MISSION_PHASE_LABELS, MISSION_PHASES, type MissionPhase } from '@/domain/mission'
import { SEX_LABELS, SEX_VALUES, type Sex } from '@/domain/sex'
import { useSettings } from '@/settings/SettingsProvider'
import { ZONE_LABELS, ZONES, type Zone } from '@/settings/settings'

/**
 * A button that asks for confirmation in a dialog before a destructive action (owner,
 * 2026-11-15), saying what is deleted and what is kept. Acts at once when `needsConfirm` is false.
 */
function ConfirmDialogButton({
  label,
  title,
  description,
  confirmLabel,
  disabled,
  needsConfirm = true,
  onConfirm,
}: {
  label: string
  title: string
  description: ReactNode
  confirmLabel: string
  disabled?: boolean
  needsConfirm?: boolean
  onConfirm: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => (needsConfirm ? setOpen(true) : onConfirm())}
      >
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">{description}</div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setOpen(false)
                onConfirm()
              }}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const count = (n: number, one: string, many: string) => (
  <>
    <span className="num">{n}</span> {n === 1 ? one : many}
  </>
)

/**
 * Demo controls (owner usability review, 2026-11-15): mission zone, mission phase, loading
 * the demo data, and clearing data, grouped in Settings and away from the avatar card.
 */
export function DemoControls() {
  const { data, replaceEntries, clearAll, setMissionPhase, setSex } = useHealthData()
  const { settings, update } = useSettings()
  const hasData = data.entries.length + data.painLogs.length + data.reports.length > 0

  return (
    <>
      <div className="grid gap-2">
        <Label id="zone-label">Mission zone</Label>
        <Select value={settings.zone} onValueChange={(zone) => update({ zone: zone as Zone })}>
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
      <div className="grid gap-2">
        <Label id="phase-label">Mission phase</Label>
        <p id="phase-hint" className="text-sm text-muted-foreground">
          Team-set parameter: “Approaching landing” is the 24 hours before landing, “Post-landing”
          the 72 hours after.
        </p>
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
      </div>

      {/* Owner decision 2026-11-15: optional; never changes a rule, threshold, or status. */}
      <div className="grid gap-2">
        <Label id="sex-label">Sex (optional)</Label>
        <p id="sex-hint" className="text-sm text-muted-foreground">
          Used only to show approved evidence notes. Rules and thresholds are the same for everyone.
        </p>
        <Select value={data.sex} onValueChange={(sex) => setSex(sex as Sex)}>
          <SelectTrigger aria-labelledby="sex-label" aria-describedby="sex-hint" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEX_VALUES.map((sex) => (
              <SelectItem key={sex} value={sex}>
                {SEX_LABELS[sex]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <p className="text-sm leading-none font-medium">Demo data</p>
        <p className="text-sm text-muted-foreground">
          Data is stored only in this browser. Clearing deletes entries, pain logs, and reports.
        </p>
        <div className="flex flex-wrap gap-2">
          <ConfirmDialogButton
            label="Load demo data"
            title="Replace your entries with demo data?"
            description={
              <>
                <p>
                  This deletes the {count(data.entries.length, 'entry', 'entries')} stored in this
                  browser and loads the simulated 14-day demo history of the fictional astronaut
                  Alex Morgan.
                </p>
                <p>
                  Pain logs, pain reports, and display settings are kept. This cannot be undone.
                </p>
              </>
            }
            confirmLabel="Replace with demo data"
            needsConfirm={data.entries.length > 0}
            onConfirm={() => replaceEntries(createDemoEntries(new Date()))}
          />
          <ConfirmDialogButton
            label="Clear data"
            title="Delete all data?"
            description={
              <>
                <p>
                  This permanently deletes everything stored in this browser:{' '}
                  {count(data.entries.length, 'entry', 'entries')},{' '}
                  {count(data.painLogs.length, 'pain log', 'pain logs')}, and{' '}
                  {count(data.reports.length, 'pain report', 'pain reports')}. The mission phase is
                  reset to In flight.
                </p>
                <p>
                  Display settings are kept, and the demo data is not loaded again until you choose
                  Load demo data. Download any reports you want to keep first. This cannot be
                  undone.
                </p>
              </>
            }
            confirmLabel="Delete all data"
            disabled={!hasData}
            onConfirm={() => clearAll()}
          />
        </div>
      </div>
    </>
  )
}
