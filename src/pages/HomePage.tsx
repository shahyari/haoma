import { Check, ChevronRight, Circle, Info } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { EmptyState } from '@/components/states/StatePanel'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useHealthData } from '@/data/HealthDataProvider'
import { formatDate, formatDateTime } from '@/domain/dates'
import { formatContext, formatValue } from '@/domain/format'
import { INDICATORS } from '@/domain/indicators'
import { createDemoEntries, DEMO_PROFILE } from '@/demo/demo'
import { dailyCheckIn, phq2Schedule } from '@/features/checkin/checkin'
import { StatusBanner } from '@/features/home/StatusBanner'
import { entriesOf, evaluateAll, PHQ2_STATE_LABELS, phq2Screening } from '@/rules/evaluate'
import { PRE_LANDING_REMINDER } from '@/rules/rules'

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function HomePage() {
  const { data, persistent, replaceEntries } = useHealthData()
  const [now] = useState(() => new Date())

  const assessments = useMemo(
    () => evaluateAll(data.entries, { missionPhase: data.missionPhase, now }),
    [data.entries, data.missionPhase, now],
  )
  const rows = assessments.map((assessment) => ({
    assessment,
    latest: entriesOf(data.entries, assessment.indicator).at(-1),
  }))
  const alerts = rows
    .filter((r) => r.assessment.status === 'escalate' || r.assessment.status === 'attention')
    .sort(
      (a, b) =>
        Number(b.assessment.status === 'escalate') - Number(a.assessment.status === 'escalate'),
    )

  const checkIn = dailyCheckIn(data.entries, now)
  const done = checkIn.filter((item) => item.done).length
  const phq2 = phq2Schedule(data.entries, now)
  const screening = phq2Screening(data.entries, now)
  const hasSimulated = data.entries.some((e) => e.origin === 'simulated')

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Home</h1>
      {!persistent ? (
        <p role="status" className="rounded-md border p-3 text-sm">
          Storage is unavailable in this browser, so entries last only until you close this page.
        </p>
      ) : null}
      {hasSimulated ? (
        <p className="rounded-md border border-dashed p-3 text-sm">
          <strong className="font-medium">Demo data.</strong> The profile is fictional and entries
          marked “Simulated” are invented for this demonstration. They are not real astronaut data.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,1fr)]">
        <section aria-labelledby="indicators-heading">
          <Card>
            <CardHeader>
              <CardTitle id="indicators-heading">Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="-mx-2 divide-y">
                {rows.map(({ assessment, latest }) => {
                  const { indicator, status } = assessment
                  const context = latest ? formatContext(latest) : undefined
                  return (
                    <li key={indicator}>
                      <Link
                        to={`/indicators/${indicator}`}
                        className={`flex items-center gap-2 rounded-md px-2 py-3 hover:bg-muted ${focusRing}`}
                      >
                        <span className="min-w-0 flex-1 space-y-1">
                          <span className="block font-medium">{INDICATORS[indicator].label}</span>
                          {latest ? (
                            <>
                              <span className="num block text-lg">{formatValue(latest)}</span>
                              <span className="block text-sm text-muted-foreground">
                                {context ? `${context} · ` : ''}
                                Latest reading{' '}
                                <span className="num">{formatDateTime(latest.recordedAt)}</span>
                                {latest.origin === 'simulated' ? ' · Simulated' : ''}
                              </span>
                            </>
                          ) : null}
                          <StatusBadge status={status} label={assessment.label} />
                          {status === 'none' ? (
                            <span className="block text-sm text-muted-foreground">
                              {assessment.note}
                            </span>
                          ) : null}
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground"
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        </section>

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
          {alerts.map(({ assessment, latest }) =>
            latest ? (
              <StatusBanner key={assessment.indicator} assessment={assessment} latest={latest} />
            ) : null,
          )}
          <EmptyState
            title="Body figure"
            description="Placeholder. The interactive 2D figure is added once its specification is ready."
            className="min-h-64 justify-center"
          />
        </section>

        <div className="space-y-4">
          <section aria-labelledby="profile-heading">
            <Card>
              <CardHeader>
                <CardTitle id="profile-heading">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>
                  <span className="font-medium">{DEMO_PROFILE.name}</span>{' '}
                  <span className="rounded-md border border-dashed px-2 py-0.5 text-sm">
                    {DEMO_PROFILE.label}
                  </span>
                </p>
                <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
                  <dt>Role</dt>
                  <dd className="text-right">{DEMO_PROFILE.role}</dd>
                  <dt>Mission</dt>
                  <dd className="text-right">{DEMO_PROFILE.mission}</dd>
                  <dt>Mission day</dt>
                  <dd className="num text-right">{DEMO_PROFILE.missionDay}</dd>
                </dl>
                <p className="text-sm text-muted-foreground">
                  Fictional person and mission. All health measurements in the demo are simulated.
                </p>
                <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t pt-3 text-sm">
                  <dt>Check-ins completed today</dt>
                  <dd className="num text-right">
                    {done} of {checkIn.length}
                  </dd>
                  <dt>Indicators to review (Attention or Escalate)</dt>
                  <dd className="num text-right">{alerts.length}</dd>
                </dl>
                {data.entries.length === 0 ? (
                  <Button
                    variant="outline"
                    onClick={() => replaceEntries(createDemoEntries(new Date()))}
                  >
                    Load simulated demo history
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="tasks-heading">
            <Card>
              <CardHeader>
                <CardTitle id="tasks-heading">Today’s check-in</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="-mx-2 text-sm">
                  {checkIn.map((item) => (
                    <li key={item.indicator}>
                      <Link
                        to={`/indicators/${item.indicator}`}
                        className={`flex min-h-10 items-center gap-2 rounded-md px-2 hover:bg-muted ${focusRing}`}
                      >
                        {item.done ? (
                          <Check aria-hidden="true" className="size-4 shrink-0" />
                        ) : (
                          <Circle
                            aria-hidden="true"
                            className="size-4 shrink-0 text-muted-foreground"
                          />
                        )}
                        <span className="flex-1">{item.label}</span>
                        <span className="text-muted-foreground">
                          {item.done ? 'Done' : 'To do'}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">
                  PHQ-2 screening (scheduled every 14 days):{' '}
                  <span className="text-foreground">{PHQ2_STATE_LABELS[screening.state]}</span>
                  {phq2.due ? (
                    <>
                      {' · '}
                      <Link
                        to="/indicators/mood"
                        className={`rounded-sm text-foreground underline underline-offset-2 ${focusRing}`}
                      >
                        take it now
                      </Link>
                    </>
                  ) : (
                    <>
                      {' · '}next due <span className="num">{formatDate(phq2.nextDue!)}</span>
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
