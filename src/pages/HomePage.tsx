import {
  Droplet,
  HeartPulse,
  Info,
  Moon,
  Pipette,
  Plus,
  Smile,
  Thermometer,
  type LucideIcon,
} from 'lucide-react'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'

import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { useHealthData } from '@/data/HealthDataProvider'
import { calendarDaysBetween, formatDateTime, formatDaysAgo, formatTimeAgo } from '@/domain/dates'
import { Measurement } from '@/components/Measurement'
import { formatContext } from '@/domain/format'
import { INDICATORS, type IndicatorId } from '@/domain/indicators'
import { dailyCheckIn } from '@/features/checkin/checkin'
import { LogEntryDialog } from '@/features/entry/LogEntryDialog'
import { ActivityGraph } from '@/features/home/ActivityGraph'
import { StatusBanner } from '@/features/home/StatusBanner'
import { entriesOf, evaluateAll, PHQ2_STATE_LABELS, phq2Screening } from '@/rules/evaluate'
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
  const [now, setNow] = useState(() => new Date())
  // Keeps "Measured … ago" current.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const assessments = useMemo(
    () => evaluateAll(data.entries, { missionPhase: data.missionPhase, now }),
    [data.entries, data.missionPhase, now],
  )
  const byIndicator = new Map(assessments.map((a) => [a.indicator, a]))
  const alerts = assessments
    .filter((a) => a.status === 'escalate' || a.status === 'attention')
    .sort((a, b) => Number(b.status === 'escalate') - Number(a.status === 'escalate'))
  const screening = phq2Screening(data.entries, now)
  const hasBanners = alerts.length > 0 || data.missionPhase === 'approachingLanding'
  const checkIn = dailyCheckIn(data.entries, now)
  const due = HOME_ORDER.filter((id) => !checkIn.find((i) => i.indicator === id)?.done)
  const [logOpen, setLogOpen] = useState(false)

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Home</h1>
      {!persistent ? (
        <p role="status" className="rounded-md border p-3 text-sm">
          Storage is unavailable in this browser, so entries last only until you close this page.
        </p>
      ) : null}

      {/* Cards | body map | activity graph with the banners below it (owner, 2026-11-15).
          Column widths (owner, 2026-11-15): 1 : 2 : 1 from 1280 px, so the side columns are
          always equal and the body map is twice as wide; 1 : 2 from 1024 px, with the right
          column moving below; one column on smaller screens. */}
      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <section aria-labelledby="indicators-heading" className="min-w-0 space-y-3">
          <h2 id="indicators-heading" className="sr-only">
            Indicators
          </h2>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              <span className="num">{HOME_ORDER.length}</span> indicators ·{' '}
              <span className="num">{due.length}</span> due ·{' '}
              <span className="num">{alerts.length}</span> flagged
            </p>
            <Button onClick={() => setLogOpen(true)}>
              <Plus aria-hidden="true" />
              Log entry
            </Button>
          </div>
          {logOpen ? (
            <LogEntryDialog
              open
              onOpenChange={setLogOpen}
              order={HOME_ORDER}
              initialTab={due[0] ?? HOME_ORDER[0]}
            />
          ) : null}
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {HOME_ORDER.map((indicator) => {
              const assessment = byIndicator.get(indicator)!
              const latest = entriesOf(data.entries, indicator).at(-1)
              const context = latest ? formatContext(latest) : undefined
              const Icon = ICONS[indicator]
              // Today's entry (for mood, today's daily rating), for "Measured … ago".
              const today = entriesOf(data.entries, indicator)
                .filter(
                  (e) =>
                    calendarDaysBetween(new Date(e.recordedAt), now) === 0 &&
                    (e.indicator !== 'mood' || e.kind === 'dailyRating'),
                )
                .at(-1)
              return (
                <li key={indicator}>
                  <Link
                    to={`/indicators/${indicator}`}
                    className={`flex h-full flex-col gap-2 rounded-lg border bg-card p-4 text-card-foreground hover:bg-muted ${focusRing}`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon aria-hidden="true" className="size-5 shrink-0" />
                      <span className="flex-1 font-medium">{INDICATORS[indicator].label}</span>
                      {today ? null : (
                        // Check-in completeness is kept apart from the reading's status (AU-6).
                        <span className="rounded-full border border-dashed px-2 py-0.5 text-xs font-medium">
                          Due
                        </span>
                      )}
                      <StatusBadge status={assessment.status} />
                    </span>
                    {latest ? (
                      <Measurement entry={latest} className="block text-3xl font-semibold" />
                    ) : null}
                    {assessment.label && indicator !== 'mood' ? (
                      <span className="block text-sm font-medium">{assessment.label}</span>
                    ) : null}
                    <span className="block text-sm text-muted-foreground">
                      {today
                        ? `Measured ${formatTimeAgo(today.recordedAt, now)}`
                        : latest
                          ? `Not measured today · last ${formatDaysAgo(latest.recordedAt, now)}`
                          : 'Not measured today'}
                      {latest ? (
                        <span className="sr-only">
                          {' '}
                          (latest reading {formatDateTime(latest.recordedAt)})
                        </span>
                      ) : null}
                      {latest && context ? ` · ${context}` : ''}
                      {latest?.origin === 'simulated' ? ' · Simulated' : ''}
                    </span>
                    {indicator === 'mood' ? (
                      <span className="block text-sm text-muted-foreground">
                        PHQ-2 screening: {PHQ2_STATE_LABELS[screening.state]}
                      </span>
                    ) : null}
                    {assessment.status === 'none' ? (
                      <span className="block text-sm text-muted-foreground">{assessment.note}</span>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section
          aria-labelledby="bodymap-heading"
          // Fills the viewport height below the header (header, page padding) on wide screens.
          className="flex min-w-0 flex-col lg:col-span-2 lg:sticky lg:top-4 lg:h-[calc(100svh-7rem)] lg:min-h-[560px] lg:self-start"
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

        <div className="min-w-0 space-y-3 lg:col-span-3 xl:col-span-1">
          <ActivityGraph entries={data.entries} now={now} />
          {hasBanners ? (
            <section aria-labelledby="status-heading" className="space-y-3">
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
                  <StatusBanner
                    key={assessment.indicator}
                    assessment={assessment}
                    latest={latest}
                  />
                ) : null
              })}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
