import { useState } from 'react'

import { Button } from '@/components/ui/button'
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
import { useSettings } from '@/settings/SettingsProvider'
import { ZONE_LABELS, ZONES, type Zone } from '@/settings/settings'

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
 * Demo controls (owner usability review, 2026-11-15): mission zone, mission phase, loading
 * the demo data, and clearing data, grouped in Settings and away from the avatar card.
 */
export function DemoControls() {
  const { data, replaceEntries, clearAll, setMissionPhase } = useHealthData()
  const { settings, update } = useSettings()
  const hasData = data.entries.length + data.painLogs.length + data.reports.length > 0

  return (
    <>
      <div className="grid gap-1.5">
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
        <p id="phase-hint" className="text-sm text-muted-foreground">
          Team-set parameter: “Approaching landing” is the 24 hours before landing, “Post-landing”
          the 72 hours after.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
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
        </div>
        <p className="text-sm text-muted-foreground">
          Data is stored only in this browser. Clearing deletes entries, pain logs, and reports.
        </p>
      </div>
    </>
  )
}
