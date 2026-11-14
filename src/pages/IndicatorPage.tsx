import { ArrowLeft, Plus } from 'lucide-react'
import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'

import { EmptyState } from '@/components/states/StatePanel'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { useHealthData } from '@/data/HealthDataProvider'
import { formatDate, formatDateTime } from '@/domain/dates'
import { formatContext, formatValue } from '@/domain/format'
import { INDICATOR_IDS, INDICATORS, type HealthEntry, type IndicatorId } from '@/domain/indicators'
import { phq2Schedule } from '@/features/checkin/checkin'
import { EntryDialog } from '@/features/entry/EntryDialog'
import { HISTORY_VIEWS, ORIGIN_LABELS, type HistoryView } from '@/features/history/columns'
import type { ChartPoint } from '@/features/history/HistoryChart'
import { FindingList, REFERENCES_URL, RuleEvidence } from '@/features/home/StatusBanner'
import { NotFoundPage } from '@/pages/NotFoundPage'
import {
  ELEVATED_HR_WINDOW_DAYS,
  entriesOf,
  evaluateIndicator,
  personalBaseline,
  PHQ2_STATE_LABELS,
  phq2Screening,
  restingAbove100,
} from '@/rules/evaluate'
import { MOOD_SAFETY_MESSAGE, RULES } from '@/rules/rules'
import type { RuleDefinition } from '@/rules/types'

const sectionHeading = 'text-lg font-medium'

// The chart library is loaded only when a history chart is shown, to keep it out of the main bundle.
const HistoryChart = lazy(() =>
  import('@/features/history/HistoryChart').then((m) => ({ default: m.HistoryChart })),
)

function HistorySection({
  view,
  entries,
  baseline,
  label,
}: {
  view: HistoryView
  entries: HealthEntry[]
  baseline?: number
  label: string
}) {
  const rows = view.filter ? entries.filter(view.filter) : entries
  const points: ChartPoint[] = rows.map((entry) => {
    const point: ChartPoint = { t: Date.parse(entry.recordedAt) }
    for (const s of view.series) {
      const value = s.value(entry)
      if (value !== undefined) point[s.key] = value
    }
    return point
  })
  const name = view.title ?? label

  return (
    <div className="space-y-3">
      {view.title ? <h3 className="font-medium">{view.title}</h3> : null}
      {view.description ? (
        <p className="text-sm text-muted-foreground">{view.description}</p>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState title="No measurement" description="Nothing has been recorded here yet." />
      ) : (
        <>
          <figure className="rounded-lg border bg-card p-3">
            <Suspense
              fallback={
                <div className="h-56 animate-pulse rounded-md bg-muted" aria-hidden="true" />
              }
            >
              <HistoryChart
                label={`Line chart of ${name}, ${rows.length} readings. The same values are in the table that follows.`}
                series={view.series}
                points={points}
                unit={view.unit}
                baseline={baseline}
                yDomain={view.yDomain}
              />
            </Suspense>
            <figcaption className="mt-2 text-sm text-muted-foreground">
              Measured values only
              {baseline !== undefined ? ', with your personal baseline as a dotted line' : ''}. No
              reference ranges are drawn on the chart.
            </figcaption>
          </figure>
          <div
            className="overflow-x-auto rounded-lg border bg-card outline-none focus-visible:ring-2 focus-visible:ring-ring"
            tabIndex={0}
            role="region"
            aria-label={`${name}: table of readings`}
          >
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{name}: all readings, newest first</caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="px-3 py-2 font-medium whitespace-nowrap">
                    Date and time
                  </th>
                  {view.columns.map((column) => (
                    <th
                      key={column.header}
                      scope="col"
                      className="px-3 py-2 font-medium whitespace-nowrap"
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...rows].reverse().map((entry) => (
                  <tr key={entry.id} className="border-b last:border-b-0">
                    <th scope="row" className="num px-3 py-2 font-normal whitespace-nowrap">
                      {formatDateTime(entry.recordedAt)}
                    </th>
                    {view.columns.map((column) => (
                      <td
                        key={column.header}
                        className={column.numeric ? 'num px-3 py-2' : 'px-3 py-2'}
                      >
                        {column.cell(entry)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export function IndicatorPage() {
  const { indicatorId } = useParams()
  const { data } = useHealthData()
  const [adding, setAdding] = useState(false)
  // A new key per opening gives each entry a fresh form; the dialog stays mounted so it can close properly.
  const [opened, setOpened] = useState(0)
  const [now] = useState(() => new Date())
  const indicator = INDICATOR_IDS.find((id) => id === indicatorId) as IndicatorId | undefined

  const entries = useMemo(
    () => (indicator ? (entriesOf(data.entries, indicator) as HealthEntry[]) : []),
    [data.entries, indicator],
  )
  if (!indicator) return <NotFoundPage />

  const { label } = INDICATORS[indicator]
  const latest = entries.at(-1)
  const assessment = evaluateIndicator(indicator, data.entries, {
    missionPhase: data.missionPhase,
    now,
  })
  const baseline = personalBaseline(indicator, data.entries)
  const rules = (Object.values(RULES) as RuleDefinition[]).filter(
    (rule) => rule.indicator === indicator,
  )
  const context = latest ? formatContext(latest) : undefined
  const phq2 = indicator === 'mood' ? phq2Schedule(data.entries, now) : undefined
  const screening = indicator === 'mood' ? phq2Screening(data.entries, now) : undefined
  const elevated = indicator === 'heartRate' ? restingAbove100(data.entries, now) : undefined

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          to="/"
          className="inline-flex min-h-9 items-center gap-1 rounded-md text-sm underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Home
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">{label}</h1>
          <Button
            onClick={() => {
              setOpened((n) => n + 1)
              setAdding(true)
            }}
          >
            <Plus aria-hidden="true" />
            Add entry
          </Button>
        </div>
      </div>

      <section aria-labelledby="latest-heading" className="space-y-3">
        <h2 id="latest-heading" className={sectionHeading}>
          Latest measurement
        </h2>
        <div className="space-y-2 rounded-lg border bg-card p-4">
          {latest ? (
            <>
              <p className="num text-3xl">{formatValue(latest)}</p>
              <p className="text-sm text-muted-foreground">
                <span className="num">{formatDateTime(latest.recordedAt)}</span>
                {context ? ` · ${context}` : ''} · {ORIGIN_LABELS[latest.origin]}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Nothing has been recorded yet.</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={assessment.status} label={assessment.label} />
            {assessment.status === 'none' ? (
              <span className="text-sm">{assessment.note}</span>
            ) : null}
          </div>
          {assessment.findings.length > 0 ? (
            <FindingList
              findings={assessment.findings}
              className="space-y-3 border-t pt-3 text-sm"
            />
          ) : null}
          {assessment.status === 'normal' || assessment.status === 'none' ? (
            <p className="text-sm text-muted-foreground">
              This label describes the latest reading against the rules below. It is not a medical
              clearance.
            </p>
          ) : null}
        </div>
        {phq2 && screening ? (
          <div className="space-y-1 rounded-lg border bg-card p-4 text-sm">
            <p>
              <span className="font-medium">PHQ-2 screening:</span>{' '}
              {PHQ2_STATE_LABELS[screening.state]}
              {screening.latest ? (
                <>
                  {' '}
                  (score <span className="num">{screening.latest.score}</span>, taken{' '}
                  <span className="num">{formatDate(screening.latest.recordedAt)}</span>
                  {screening.current ? '' : ', now history only'})
                </>
              ) : null}
              .{' '}
              {phq2.due ? (
                'The next screening is due now.'
              ) : (
                <>
                  Next due <span className="num">{formatDate(phq2.nextDue!)}</span>.
                </>
              )}
            </p>
            <p className="text-muted-foreground">
              The questions cover the last 2 weeks; the screening is scheduled every 14 days (team
              decision), and a result counts for 14 days. The PHQ-2 is a screener validated in
              primary care and obstetrics-gynecology patients, not in astronauts. It is not a
              diagnosis and not a daily mood rating.
            </p>
          </div>
        ) : null}
        {elevated && elevated.resting > 0 ? (
          <p className="text-sm">
            Resting readings above 100 bpm in the last{' '}
            <span className="num">{ELEVATED_HR_WINDOW_DAYS}</span> days:{' '}
            <span className="num">
              {elevated.above} of {elevated.resting}
            </span>
            .{' '}
            <span className="text-muted-foreground">
              A description only: no approved rule sets how often is too often.
            </span>
          </p>
        ) : null}
        {indicator === 'mood' ? (
          <p className="rounded-md border p-3 text-sm font-medium">{MOOD_SAFETY_MESSAGE}</p>
        ) : null}
      </section>

      {baseline ? (
        <section aria-labelledby="baseline-heading" className="space-y-2">
          <h2 id="baseline-heading" className={sectionHeading}>
            Personal baseline
          </h2>
          <p className="text-sm">
            {baseline.value !== undefined && latest ? (
              <>
                Your usual value before the latest reading is{' '}
                <span className="num">
                  {baseline.value} {INDICATORS[indicator].unit}
                </span>{' '}
                (median of your last{' '}
                {indicator === 'heartRate' ? 'resting readings' : 'readings with the same method'}).
                It is not matched to the time of day.
              </>
            ) : (
              <>
                Not available yet: a baseline needs <span className="num">{baseline.required}</span>{' '}
                earlier readings
                {indicator === 'bodyTemperature'
                  ? ' taken with the same method and not after exercise'
                  : ' taken at rest'}
                , and <span className="num">{baseline.readings}</span> exist.
              </>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            Team-set parameters P-1 and P-2 (Team design decision): median of the last 7 valid
            readings, at least 5 required.
          </p>
        </section>
      ) : null}

      <section aria-labelledby="history-heading" className="space-y-4">
        <h2 id="history-heading" className={sectionHeading}>
          History
        </h2>
        {HISTORY_VIEWS[indicator].map((view) => (
          <HistorySection
            key={view.id}
            view={view}
            entries={entries}
            baseline={baseline?.value}
            label={label}
          />
        ))}
      </section>

      <section aria-labelledby="rules-heading" className="space-y-3">
        <h2 id="rules-heading" className={sectionHeading}>
          Reference information and approved rules
        </h2>
        <p className="text-sm text-muted-foreground">
          These are general references and team rules, not your measurements. General clinical
          references come from general-population guidance and are not validated for astronauts.
          Sources are listed in the{' '}
          <a
            href={REFERENCES_URL}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            project references
          </a>
          .
        </p>
        <ul className="divide-y rounded-lg border bg-card text-sm">
          {rules.map((rule) => (
            <li key={rule.id} className="space-y-1 p-3">
              <StatusBadge status={rule.status} label={rule.statusLabel} />
              <p>{rule.condition}</p>
              {rule.action ? <p>Action: {rule.action}</p> : null}
              <RuleEvidence rule={rule} />
            </li>
          ))}
        </ul>
      </section>

      {opened > 0 ? (
        <EntryDialog key={opened} indicator={indicator} open={adding} onOpenChange={setAdding} />
      ) : null}
    </div>
  )
}
