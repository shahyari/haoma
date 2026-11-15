import {
  GLUCOSE_CONTEXT_LABELS,
  GLUCOSE_DEVICE_LABELS,
  HEART_RATE_ACTIVITY_LABELS,
  SLEEP_SOURCE_LABELS,
  temperatureMethodLabel,
} from '@/domain/format'
import type { EntryOrigin, HealthEntry, IndicatorId } from '@/domain/indicators'
import { SYMPTOMS, type SymptomId } from '@/domain/symptoms'
import {
  displayGlucose,
  displayTemperature,
  glucoseUnitLabel,
  temperatureUnitLabel,
} from '@/domain/units'

import type { CrewMetric } from '@/crew/compare'

import type { ChartSeries } from './HistoryChart'

export const ORIGIN_LABELS: Record<EntryOrigin, string> = {
  userEntered: 'Manual entry',
  simulated: 'Simulated',
}

/** Provenance with the edit marker, e.g. "Manual entry (edited)". */
export function provenanceLabel(entry: HealthEntry): string {
  return entry.editedAt ? `${ORIGIN_LABELS[entry.origin]} (edited)` : ORIGIN_LABELS[entry.origin]
}

export interface Column {
  header: string
  numeric?: boolean
  cell: (entry: HealthEntry) => string | number
}

/** A group of readings that share one chart and one table. Mood has two. */
export interface HistoryView {
  id: string
  /** Heading; omitted when the indicator has a single view. */
  title?: string
  description?: string
  unit: string
  series: (ChartSeries & {
    value: (entry: HealthEntry) => number | undefined
    /** The crew metric compared with this series, in display units; omitted when never compared (PHQ-2). */
    crew?: { metric: CrewMetric; display?: (stored: number) => number }
  })[]
  columns: Column[]
  filter?: (entry: HealthEntry) => boolean
  yDomain?: [number, number]
}

function pick<T>(get: (entry: never) => T): (entry: HealthEntry) => T {
  return get as (entry: HealthEntry) => T
}

const symptoms: Column = {
  header: 'Symptoms reported',
  cell: (e) => (e.symptoms ?? []).map((id) => SYMPTOMS[id as SymptomId] ?? id).join(', ') || 'None',
}
const provenance: Column = { header: 'Provenance', cell: provenanceLabel }

type E<I extends IndicatorId> = Extract<HealthEntry, { indicator: I }>

export const HISTORY_VIEWS: Record<IndicatorId, HistoryView[]> = {
  bloodPressure: [
    {
      id: 'bloodPressure',
      unit: 'mmHg',
      series: [
        {
          key: 'systolic',
          label: 'Systolic',
          value: pick((e: E<'bloodPressure'>) => e.systolicMmHg),
          crew: { metric: 'systolic' },
        },
        {
          key: 'diastolic',
          label: 'Diastolic',
          value: pick((e: E<'bloodPressure'>) => e.diastolicMmHg),
          crew: { metric: 'diastolic' },
        },
      ],
      columns: [
        {
          header: 'Systolic (mmHg)',
          numeric: true,
          cell: pick((e: E<'bloodPressure'>) => e.systolicMmHg),
        },
        {
          header: 'Diastolic (mmHg)',
          numeric: true,
          cell: pick((e: E<'bloodPressure'>) => e.diastolicMmHg),
        },
        symptoms,
        provenance,
      ],
    },
  ],
  heartRate: [
    {
      id: 'heartRate',
      unit: 'bpm',
      series: [
        {
          key: 'bpm',
          label: 'Heart rate',
          value: pick((e: E<'heartRate'>) => e.bpm),
          crew: { metric: 'bpm' },
        },
      ],
      columns: [
        { header: 'Heart rate (bpm)', numeric: true, cell: pick((e: E<'heartRate'>) => e.bpm) },
        {
          header: 'Taken',
          cell: pick((e: E<'heartRate'>) =>
            e.activity ? HEART_RATE_ACTIVITY_LABELS[e.activity] : 'Not recorded',
          ),
        },
        symptoms,
        provenance,
      ],
    },
  ],
  bloodGlucose: [
    {
      id: 'bloodGlucose',
      get unit() {
        return glucoseUnitLabel()
      },
      series: [
        {
          key: 'mgDl',
          label: 'Glucose',
          value: pick((e: E<'bloodGlucose'>) => displayGlucose(e.mgDl)),
          crew: { metric: 'mgDl', display: displayGlucose },
        },
      ],
      columns: [
        {
          get header() {
            return `Glucose (${glucoseUnitLabel()})`
          },
          numeric: true,
          cell: pick((e: E<'bloodGlucose'>) => displayGlucose(e.mgDl)),
        },
        {
          header: 'Context',
          cell: pick((e: E<'bloodGlucose'>) => GLUCOSE_CONTEXT_LABELS[e.context]),
        },
        { header: 'Device', cell: pick((e: E<'bloodGlucose'>) => GLUCOSE_DEVICE_LABELS[e.device]) },
        symptoms,
        provenance,
      ],
    },
  ],
  bodyTemperature: [
    {
      id: 'bodyTemperature',
      get unit() {
        return temperatureUnitLabel()
      },
      // One line per method: readings from different methods are never joined (OD-15).
      series: [
        {
          key: 'oral',
          label: 'Oral',
          value: pick((e: E<'bodyTemperature'>) =>
            e.method === 'oral' ? displayTemperature(e.celsius) : undefined,
          ),
          crew: { metric: 'celsius', display: displayTemperature },
        },
        {
          key: 'forehead',
          label: 'Forehead sensor',
          value: pick((e: E<'bodyTemperature'>) =>
            e.method === 'forehead' ? displayTemperature(e.celsius) : undefined,
          ),
          crew: { metric: 'celsius', display: displayTemperature },
        },
        {
          key: 'unknownMethod',
          label: 'Method not recorded',
          value: pick((e: E<'bodyTemperature'>) =>
            e.method ? undefined : displayTemperature(e.celsius),
          ),
          crew: { metric: 'celsius', display: displayTemperature },
        },
      ],
      columns: [
        {
          get header() {
            return `Temperature (${temperatureUnitLabel()})`
          },
          numeric: true,
          cell: pick((e: E<'bodyTemperature'>) => displayTemperature(e.celsius)),
        },
        {
          header: 'Method',
          cell: pick((e: E<'bodyTemperature'>) => temperatureMethodLabel(e.method)),
        },
        {
          header: 'Within 30 min after exercise',
          cell: pick((e: E<'bodyTemperature'>) =>
            e.exercisedLast30Min ? 'Yes (not evaluated)' : 'No',
          ),
        },
        symptoms,
        provenance,
      ],
    },
  ],
  sleep: [
    {
      id: 'sleep',
      unit: 'h',
      series: [
        {
          key: 'hours',
          label: 'Sleep',
          value: pick((e: E<'sleep'>) => e.hours),
          crew: { metric: 'hours' },
        },
      ],
      columns: [
        { header: 'Sleep (hours)', numeric: true, cell: pick((e: E<'sleep'>) => e.hours) },
        { header: 'Measured by', cell: pick((e: E<'sleep'>) => SLEEP_SOURCE_LABELS[e.source]) },
        provenance,
      ],
    },
  ],
  mood: [
    {
      id: 'dailyRating',
      title: 'Daily mood rating',
      description:
        'Your own 1–5 rating (1 = lowest, 5 = highest). A team-designed scale, not a validated instrument. Used for the trend only.',
      unit: 'rating',
      yDomain: [1, 5],
      filter: (e) => e.indicator === 'mood' && e.kind === 'dailyRating',
      series: [
        {
          key: 'rating',
          label: 'Daily rating',
          value: (e) => (e.indicator === 'mood' && e.kind === 'dailyRating' ? e.rating : undefined),
          crew: { metric: 'rating' },
        },
      ],
      columns: [
        {
          header: 'Rating (1–5)',
          numeric: true,
          cell: (e) => (e.indicator === 'mood' && e.kind === 'dailyRating' ? e.rating : ''),
        },
        provenance,
      ],
    },
    {
      id: 'phq2',
      title: 'PHQ-2 depression screening',
      description:
        'Two questions about the last 2 weeks (the questionnaire’s recall period). Scheduled every 14 days (team decision). Total score 0–6. A screener validated in primary care and obstetrics-gynecology patients, not in astronauts; not a diagnosis and not a daily mood score.',
      unit: 'score',
      yDomain: [0, 6],
      filter: (e) => e.indicator === 'mood' && e.kind === 'phq2',
      series: [
        {
          key: 'score',
          label: 'PHQ-2 score',
          value: (e) => (e.indicator === 'mood' && e.kind === 'phq2' ? e.score : undefined),
        },
      ],
      columns: [
        {
          header: 'Score (0–6)',
          numeric: true,
          cell: (e) => (e.indicator === 'mood' && e.kind === 'phq2' ? e.score : ''),
        },
        provenance,
      ],
    },
  ],
}
