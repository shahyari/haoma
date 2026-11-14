import {
  Check,
  Circle,
  Droplet,
  HeartPulse,
  Info,
  Moon,
  Pipette,
  Smile,
  Thermometer,
  type LucideIcon,
} from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { Link } from 'react-router'

import { StatusBadge } from '@/components/StatusBadge'
import { useHealthData } from '@/data/HealthDataProvider'
import { formatDateTime } from '@/domain/dates'
import { formatContext, formatValue } from '@/domain/format'
import { INDICATORS, type IndicatorId } from '@/domain/indicators'
import { dailyCheckIn } from '@/features/checkin/checkin'
import { StatusBanner } from '@/features/home/StatusBanner'
import { entriesOf, evaluateAll, PHQ2_STATE_LABELS, phq2Screening } from '@/rules/evaluate'
import { cn } from '@/lib/utils'
import { PRE_LANDING_REMINDER } from '@/rules/rules'

/** Card order from the owner's layout (brainstorm Section 16). */
const HOME_ORDER: IndicatorId[] = [
  'heartRate',
  'bloodPressure',
  'bloodGlucose',
  'bodyTemperature',
  'sleep',
  'mood',
]

/** Lucide icons per indicator (Claude's choice; blood pressure follows the owner's example). */
const ICONS: Record<IndicatorId, LucideIcon> = {
  heartRate: HeartPulse,
  bloodPressure: Droplet,
  bloodGlucose: Pipette,
  bodyTemperature: Thermometer,
  sleep: Moon,
  mood: Smile,
}

// The body map (WebGL and SVG engine) loads on demand, like the history charts.
const BodyMap = lazy(() =>
  import('@/features/bodymap/BodyMap').then((m) => ({ default: m.BodyMap })),
)

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function HomePage() {
  const { data, persistent } = useHealthData()
  const [now] = useState(() => new Date())

  const assessments = useMemo(
    () => evaluateAll(data.entries, { missionPhase: data.missionPhase, now }),
    [data.entries, data.missionPhase, now],
  )
  const byIndicator = new Map(assessments.map((a) => [a.indicator, a]))
  const alerts = assessments
    .filter((a) => a.status === 'escalate' || a.status === 'attention')
    .sort((a, b) => Number(b.status === 'escalate') - Number(a.status === 'escalate'))
  // The daily check-in is shown on each card (Section 16).
  const doneToday = new Map(dailyCheckIn(data.entries, now).map((i) => [i.indicator, i.done]))
  const screening = phq2Screening(data.entries, now)
  const hasBanners = alerts.length > 0 || data.missionPhase === 'approachingLanding'

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Home</h1>
      {!persistent ? (
        <p role="status" className="rounded-md border p-3 text-sm">
          Storage is unavailable in this browser, so entries last only until you close this page.
        </p>
      ) : null}

      <div
        className={cn(
          'grid gap-4 lg:grid-cols-[minmax(15rem,20rem)_minmax(0,1fr)]',
          // Banners get a right column only when there are any; otherwise the body map fills it.
          hasBanners && 'xl:grid-cols-[minmax(15rem,20rem)_minmax(0,1fr)_minmax(16rem,22rem)]',
        )}
      >
        <section aria-labelledby="indicators-heading">
          <h2 id="indicators-heading" className="sr-only">
            Indicators
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {HOME_ORDER.map((indicator) => {
              const assessment = byIndicator.get(indicator)!
              const latest = entriesOf(data.entries, indicator).at(-1)
              const context = latest ? formatContext(latest) : undefined
              const Icon = ICONS[indicator]
              const done = doneToday.get(indicator)
              return (
                <li key={indicator}>
                  <Link
                    to={`/indicators/${indicator}`}
                    className={`flex h-full flex-col gap-2 rounded-lg border bg-card p-4 text-card-foreground hover:bg-muted ${focusRing}`}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Icon aria-hidden="true" className="size-5 shrink-0" />
                      {INDICATORS[indicator].label}
                    </span>
                    {latest ? (
                      <>
                        <span className="num block text-3xl font-semibold">
                          {formatValue(latest)}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          <span className="sr-only">Latest reading </span>
                          <span className="num">{formatDateTime(latest.recordedAt)}</span>
                          {context ? ` · ${context}` : ''}
                          {latest.origin === 'simulated' ? ' · Simulated' : ''}
                        </span>
                      </>
                    ) : null}
                    <span className="flex items-center gap-1.5 text-sm">
                      {done ? (
                        <Check aria-hidden="true" className="size-4 shrink-0" />
                      ) : (
                        <Circle
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground"
                        />
                      )}
                      {done
                        ? 'Checked in today'
                        : indicator === 'mood'
                          ? 'Daily rating not yet today'
                          : 'Not yet measured today'}
                    </span>
                    {indicator === 'mood' ? (
                      <span className="block text-sm text-muted-foreground">
                        PHQ-2 screening: {PHQ2_STATE_LABELS[screening.state]}
                      </span>
                    ) : null}
                    {assessment.status === 'none' ? (
                      <span className="block text-sm text-muted-foreground">{assessment.note}</span>
                    ) : null}
                    <StatusBadge
                      status={assessment.status}
                      label={assessment.label}
                      className="self-start"
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section
          aria-labelledby="bodymap-heading"
          // Fills the viewport height below the header (header, page padding) on wide screens.
          className="flex min-w-0 flex-col lg:sticky lg:top-4 lg:h-[calc(100svh-7rem)] lg:min-h-[560px] lg:self-start"
        >
          <Suspense
            fallback={
              <div
                className="min-h-[540px] flex-1 animate-pulse rounded-lg border bg-muted lg:min-h-0"
                aria-hidden="true"
              />
            }
          >
            <BodyMap />
          </Suspense>
        </section>

        {hasBanners ? (
          <section
            aria-labelledby="status-heading"
            className="space-y-3 lg:col-span-2 xl:col-span-1"
          >
            <h2 id="status-heading" className="sr-only">
              Health status
            </h2>
            {data.missionPhase === 'approachingLanding' ? (
              <p role="status" className="flex gap-2 rounded-lg border bg-card p-3 text-sm">
                <Info aria-hidden="true" className="size-5 shrink-0" />
                <span>
                  {PRE_LANDING_REMINDER}{' '}
                  <span className="text-muted-foreground">Team design decision · RULE-30</span>
                </span>
              </p>
            ) : null}
            {alerts.map((assessment) => {
              const latest = entriesOf(data.entries, assessment.indicator).at(-1)
              return latest ? (
                <StatusBanner key={assessment.indicator} assessment={assessment} latest={latest} />
              ) : null
            })}
          </section>
        ) : null}
      </div>
    </div>
  )
}
