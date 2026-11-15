import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import {
  CREW_RELATION_TEXT,
  crewAverageFor,
  crewRelation,
  metricValues,
  type CrewDataSource,
  type CrewMetric,
  type CrewResult,
} from '@/crew/compare'
import { formatDateTime } from '@/domain/dates'
import type { HealthEntry, IndicatorId } from '@/domain/indicators'
import { TEAM_PARAMETERS } from '@/domain/parameters'
import {
  displayGlucose,
  displayTemperature,
  displayTemperatureDelta,
  glucoseUnitLabel,
  temperatureUnitLabel,
} from '@/domain/units'

const round1 = (n: number) => Math.round(n * 10) / 10

/** A stored crew value in the units chosen in Settings, to one decimal. */
// oxlint-disable-next-line react/only-export-components
export function displayCrewValue(metric: CrewMetric, stored: number): number {
  if (metric === 'celsius') return round1(displayTemperature(stored))
  if (metric === 'mgDl') return round1(displayGlucose(stored))
  return round1(stored)
}

function displayDifference(metric: CrewMetric, stored: number): number {
  if (metric === 'celsius') return displayTemperatureDelta(stored)
  if (metric === 'mgDl') return round1(displayGlucose(stored))
  return round1(stored)
}

function unitOf(metric: CrewMetric): string {
  switch (metric) {
    case 'systolic':
    case 'diastolic':
      return 'mmHg'
    case 'bpm':
      return 'bpm'
    case 'mgDl':
      return glucoseUnitLabel()
    case 'celsius':
      return temperatureUnitLabel()
    case 'hours':
      return 'h'
    case 'rating':
      return 'points'
  }
}

const METRIC_NAMES: Partial<Record<CrewMetric, string>> = {
  systolic: 'systolic',
  diastolic: 'diastolic',
}

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0')

/** The reading compared: the latest one, and for mood the latest daily rating (never the PHQ-2). */
// oxlint-disable-next-line react/only-export-components
export function comparedReading(
  indicator: IndicatorId,
  entries: HealthEntry[],
): HealthEntry | undefined {
  return indicator === 'mood'
    ? entries.filter((e) => e.indicator === 'mood' && e.kind === 'dailyRating').at(-1)
    : entries.at(-1)
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,11rem)_1fr] gap-3 py-1.5">
      <dt className="text-muted-foreground">{term}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function Exclusions({ result }: { result: CrewResult }) {
  if (result.excluded.length === 0) return null
  return (
    <p className="text-muted-foreground">
      Left out on this mission day:{' '}
      {result.excluded
        .map(
          (x) =>
            `${x.count} crew ${x.count === 1 ? 'reading' : 'readings'} (${x.reason.toLowerCase()})`,
        )
        .join('; ')}
      .
    </p>
  )
}

/**
 * Crew comparison summary (owner spec 2026-11-15). Context only: neutral wording, no status
 * colour, and nothing here feeds the rules or the personal baseline.
 */
export function CrewComparison({
  indicator,
  entries,
  source,
}: {
  indicator: IndicatorId
  entries: HealthEntry[]
  source: CrewDataSource
}) {
  const reading = comparedReading(indicator, entries)
  const result = reading ? crewAverageFor(reading, source) : undefined
  const own = reading ? metricValues(reading) : {}
  const metrics = Object.keys(own) as CrewMetric[]
  const join = (values: string[]) => values.join(' / ')

  return (
    <section aria-labelledby="crew-heading" className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="crew-heading" className="text-lg font-medium">
          Crew comparison
        </h2>
        {source.kind === 'simulated' ? (
          <Badge variant="secondary">Simulated crew data</Badge>
        ) : null}
      </div>
      <div className="space-y-3 rounded-lg border bg-card p-4 text-sm">
        {!reading || !result ? (
          <p className="text-muted-foreground">
            {indicator === 'mood'
              ? 'No daily mood rating to compare yet. PHQ-2 scores are never compared.'
              : 'No reading to compare yet.'}
          </p>
        ) : result.available ? (
          <>
            <dl className="divide-y">
              <Row term="Your latest measurement">
                <span className="num">
                  {join(metrics.map((m) => String(displayCrewValue(m, own[m]!))))}
                </span>{' '}
                {unitOf(metrics[0]) === 'points' ? '' : unitOf(metrics[0])}
                <span className="text-muted-foreground">
                  {' '}
                  · {formatDateTime(reading.recordedAt)}
                </span>
              </Row>
              <Row term="Crew average">
                <span className="num">
                  {join(metrics.map((m) => String(displayCrewValue(m, result.metrics[m]!.mean))))}
                </span>{' '}
                {unitOf(metrics[0]) === 'points' ? '' : unitOf(metrics[0])}
              </Row>
              <Row term="Difference">
                <span className="num">
                  {join(
                    metrics.map((m) =>
                      signed(displayDifference(m, own[m]! - result.metrics[m]!.mean)),
                    ),
                  )}
                </span>{' '}
                {unitOf(metrics[0])}
              </Row>
              <Row term="Based on">
                <span className="num">{result.members}</span> other crew members
              </Row>
              <Row term="Period">{result.period}</Row>
              <Row term="Compared readings">{result.groupLabel}</Row>
            </dl>
            <p className="font-medium">
              {metrics
                .map((m) => {
                  const relation = crewRelation(own[m]!, result.metrics[m]!)
                  const name = METRIC_NAMES[m]
                  return `Your ${name ? `${name} ` : ''}reading is ${CREW_RELATION_TEXT[relation]}.`
                })
                .join(' ')}
            </p>
            <Exclusions result={result} />
          </>
        ) : (
          <>
            <p>
              <span className="font-medium">Crew average not available.</span> {result.reason}
            </p>
            <Exclusions result={result} />
          </>
        )}
        <p className="text-muted-foreground">
          Crew averages provide mission context, not medical reference ranges. Similar measurements
          across the crew do not necessarily indicate that they are safe.
        </p>
        <details className="group">
          <summary className="cursor-pointer rounded-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
            How the crew average is calculated
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>It uses the other crew members only; your own readings are never part of it.</li>
            <li>
              Only comparable readings from the same mission day are included: resting with resting
              heart rate, the same fasting state and device for glucose, the same temperature
              method, the same sleep source, and daily mood ratings only. PHQ-2 scores are never
              compared.
            </li>
            <li>
              Each crew member counts once (the mean of their readings that day); the crew average
              is the plain mean of those values. Missing readings are skipped, never counted as
              zero.
            </li>
            <li>
              Readings without the needed context (for example no rest state or method recorded, or
              a temperature taken right after exercise) are left out.
            </li>
            <li>
              An average is shown only when at least{' '}
              <span className="num">{TEAM_PARAMETERS.crewMinCohort}</span> other crew members
              contribute, so no one’s reading can be inferred. Only totals are shown, never
              individual crew members.
            </li>
            <li>
              “Close to” means within half the spread (standard deviation) of the crew’s values.
              These are team design decisions.
            </li>
            <li>
              A crew average does not replace your personal baseline, the approved rules, or a
              clinical assessment. It never changes a status.
            </li>
            {source.kind === 'simulated' ? (
              <li>
                The crew and their readings are simulated for this demo (a fictional Aster-1 crew).
                They are not real astronaut data.
              </li>
            ) : null}
          </ul>
        </details>
      </div>
    </section>
  )
}
