import type { ReactNode } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { StatusBadge } from '@/components/StatusBadge'
import { useHealthData } from '@/data/HealthDataProvider'
import { createDemoEntries } from '@/demo/demo'
import { MISSION_PHASE_LABELS, MISSION_PHASES, type MissionPhase } from '@/domain/mission'
import { STATUSES } from '@/rules/types'
import { useSettings } from '@/settings/SettingsProvider'
import {
  CONTRASTS,
  FONT_SIZES,
  MODES,
  THEME_CHOICES,
  ZONE_LABELS,
  ZONES,
  resolveTheme,
  type DisplaySettings,
} from '@/settings/settings'

interface ChoiceProps<K extends keyof DisplaySettings> {
  name: K
  legend: string
  hint?: ReactNode
  options: readonly (DisplaySettings[K] & string)[]
  labels: Record<DisplaySettings[K] & string, string>
}

function Choice<K extends keyof DisplaySettings>({
  name,
  legend,
  hint,
  options,
  labels,
}: ChoiceProps<K>) {
  const { settings, update } = useSettings()
  return (
    <fieldset className="space-y-2">
      <legend className="font-medium">{legend}</legend>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      <RadioGroup
        value={settings[name] as string}
        onValueChange={(value) => update({ [name]: value } as Partial<DisplaySettings>)}
        className="flex flex-wrap gap-x-5 gap-y-2"
      >
        {options.map((option) => (
          <div key={option} className="flex min-h-9 items-center gap-2">
            <RadioGroupItem id={`${name}-${option}`} value={option} />
            <Label htmlFor={`${name}-${option}`}>{labels[option]}</Label>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  )
}

export function SettingsPage() {
  const { settings, update, deviceWantsMoreContrast } = useSettings()
  const { data, setMissionPhase, clearAll, replaceEntries } = useHealthData()

  return (
    // The fixed width used before the full-width layout (owner, 2026-11-14).
    <div className="mx-auto w-full max-w-5xl">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <h2 className="text-lg font-medium">Display</h2>

        {deviceWantsMoreContrast && settings.contrast !== 'high' ? (
          <Alert>
            <AlertTitle>High contrast is suggested</AlertTitle>
            <AlertDescription>
              <p>This device asks for more contrast.</p>
              <Button size="sm" className="mt-2" onClick={() => update({ contrast: 'high' })}>
                Use high contrast
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        <Choice name="zone" legend="Current zone" options={ZONES} labels={ZONE_LABELS} />
        <Choice
          name="theme"
          legend="Theme"
          hint={`Auto follows the current zone (now: ${ZONE_LABELS[resolveTheme(settings)]}).`}
          options={THEME_CHOICES}
          labels={{ auto: 'Auto', ...ZONE_LABELS }}
        />
        <Choice
          name="mode"
          legend="Mode"
          hint="Auto currently follows this device’s light/dark setting."
          options={MODES}
          labels={{ auto: 'Auto', light: 'Light', dark: 'Dark' }}
        />
        <Choice
          name="contrast"
          legend="Contrast"
          options={CONTRASTS}
          labels={{ normal: 'Normal (WCAG AA)', high: 'High (WCAG AAA)' }}
        />
        <Choice
          name="fontSize"
          legend="Text size"
          options={FONT_SIZES}
          labels={{ small: 'Small', medium: 'Medium', large: 'Big' }}
        />

        <div className="space-y-2">
          <div className="flex min-h-9 items-center gap-2">
            <Checkbox
              id="colorBlind"
              checked={settings.colorBlind}
              onCheckedChange={(checked) => update({ colorBlind: checked === true })}
            />
            <Label htmlFor="colorBlind">
              Colour-blind mode (adds patterns to the status colours)
            </Label>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="Status preview">
            {STATUSES.map((status) => (
              <li key={status}>
                <StatusBadge status={status} />
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-muted-foreground">
          Numbers always use a monospaced font, for example <span className="num">118/76</span>.
        </p>

        <h2 className="text-lg font-medium">Mission</h2>
        <fieldset className="space-y-2">
          <legend className="font-medium">Mission phase</legend>
          <p className="text-sm text-muted-foreground">
            Team-set parameter: “Approaching landing” is the 24 hours before landing, “Post-landing”
            the 72 hours after.
          </p>
          <RadioGroup
            value={data.missionPhase}
            onValueChange={(value) => setMissionPhase(value as MissionPhase)}
            className="flex flex-wrap gap-x-5 gap-y-2"
          >
            {MISSION_PHASES.map((phase) => (
              <div key={phase} className="flex min-h-9 items-center gap-2">
                <RadioGroupItem id={`phase-${phase}`} value={phase} />
                <Label htmlFor={`phase-${phase}`}>{MISSION_PHASE_LABELS[phase]}</Label>
              </div>
            ))}
          </RadioGroup>
        </fieldset>

        <h2 className="text-lg font-medium">Data</h2>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="num">{data.entries.length}</span> entries stored in this browser only.
          </p>
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => {
              if (
                data.entries.length === 0 ||
                window.confirm('Replace all stored entries with the simulated demo history?')
              ) {
                replaceEntries(createDemoEntries(new Date()))
              }
            }}
          >
            Load simulated demo history
          </Button>
          <Button
            variant="outline"
            disabled={data.entries.length === 0}
            onClick={() => {
              if (
                window.confirm('Delete all entries stored in this browser? This cannot be undone.')
              )
                clearAll()
            }}
          >
            Clear my data
          </Button>
        </div>
      </div>
    </div>
  )
}
