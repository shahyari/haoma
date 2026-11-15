import type { ReactNode } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PageLayout } from '@/components/PageLayout'
import { StatusBadge } from '@/components/StatusBadge'
import { DemoControls } from '@/features/demo/DemoControls'
import { DATE_FORMATS, MEASUREMENT_SYSTEMS, TEMPERATURE_UNITS } from '@/domain/units'
import { STATUSES } from '@/rules/types'
import { useSettings } from '@/settings/SettingsProvider'
import {
  CONTRASTS,
  FONT_SIZES,
  MODES,
  THEME_CHOICES,
  ZONE_LABELS,
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

/**
 * Settings row spacing (owner, 2026-11-15): every row is title, optional hint, then the
 * control, 8 px apart, with 16 px padding — the same in every card, Demo controls included.
 */
const settingsRow = 'grid gap-2'
// Same type as the shadcn Label used for the Demo controls titles.
const rowTitle = 'text-sm leading-none font-medium'
const rowHint = 'text-sm text-muted-foreground'

function Choice<K extends keyof DisplaySettings>({
  name,
  legend,
  hint,
  options,
  labels,
}: ChoiceProps<K>) {
  const { settings, update } = useSettings()
  return (
    <div className={settingsRow}>
      <p id={`${name}-title`} className={rowTitle}>
        {legend}
      </p>
      {hint ? (
        <p id={`${name}-hint`} className={rowHint}>
          {hint}
        </p>
      ) : null}
      <RadioGroup
        aria-labelledby={`${name}-title`}
        aria-describedby={hint ? `${name}-hint` : undefined}
        value={settings[name] as string}
        onValueChange={(value) => update({ [name]: value } as Partial<DisplaySettings>)}
        // -my-2 offsets the 36 px touch rows, so the visible gaps stay 8 px.
        className="-my-2 flex flex-wrap gap-x-5 gap-y-1"
      >
        {options.map((option) => (
          <div key={option} className="flex min-h-9 items-center gap-2">
            <RadioGroupItem id={`${name}-${option}`} value={option} />
            <Label htmlFor={`${name}-${option}`}>{labels[option]}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

/** A titled card whose rows are separated by dividers (owner wireframe, Section 17). */
function SettingsCard({ title, id, children }: { title: string; id: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-lg font-medium">
        {title}
      </h2>
      <div className="divide-y rounded-lg border bg-card [&>*]:p-4">{children}</div>
    </section>
  )
}

export function SettingsPage() {
  const { settings, update, deviceWantsMoreContrast } = useSettings()

  return (
    <PageLayout title="Settings">
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

      <SettingsCard title="Appearances" id="appearances-heading">
        <Choice
          name="theme"
          legend="Theme"
          hint={`Auto follows the mission zone (now: ${ZONE_LABELS[resolveTheme(settings)]}), set under Demo controls.`}
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
        <div className={settingsRow}>
          <div className="-my-2 flex min-h-9 items-center gap-2">
            <Checkbox
              id="colorBlind"
              checked={settings.colorBlind}
              onCheckedChange={(checked) => update({ colorBlind: checked === true })}
            />
            <Label htmlFor="colorBlind">Assistive patterns</Label>
          </div>
          <p className={rowHint}>
            Adds patterns to the status colours, so a status never depends on colour alone.
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Status preview">
            {STATUSES.map((status) => (
              <li key={status}>
                <StatusBadge status={status} />
              </li>
            ))}
          </ul>
        </div>
      </SettingsCard>

      <SettingsCard title="Units and Formats" id="units-heading">
        <Choice
          name="temperatureUnit"
          legend="Temperature"
          options={TEMPERATURE_UNITS}
          labels={{ celsius: 'Celsius (°C)', fahrenheit: 'Fahrenheit (°F)' }}
        />
        <Choice
          name="measurementSystem"
          legend="Measurement system"
          hint="Used for blood glucose. Rules always evaluate the stored mg/dL value."
          options={MEASUREMENT_SYSTEMS}
          labels={{ conventional: 'US conventional (mg/dL)', si: 'SI (mmol/L)' }}
        />
        <Choice
          name="dateFormat"
          legend="Date format"
          options={DATE_FORMATS}
          labels={{
            dayMonthYear: '14 Nov 2026, 07:00',
            monthDayYear: 'Nov 14, 2026, 7:00 AM',
            iso: '2026-11-14 07:00',
          }}
        />
      </SettingsCard>

      <SettingsCard title="Demo controls" id="demo-heading">
        <DemoControls />
      </SettingsCard>

      <p className="text-sm text-muted-foreground">
        Numbers always use a monospaced font, for example <span className="num">118/76</span>.
      </p>
    </PageLayout>
  )
}
