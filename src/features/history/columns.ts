import {
  GLUCOSE_CONTEXT_LABELS,
  GLUCOSE_DEVICE_LABELS,
  SLEEP_SOURCE_LABELS,
  TEMPERATURE_METHOD_LABELS,
} from '@/domain/format'
import type { EntryOrigin, HealthEntry, IndicatorId } from '@/domain/indicators'
import { SYMPTOMS, type SymptomId } from '@/domain/symptoms'

import type { ChartSeries } from './HistoryChart'

export const ORIGIN_LABELS: Record<EntryOrigin, string> = {
  userEntered: 'Manual entry',
  simulated: 'Simulated',
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
  series: (ChartSeries & { value: (entry: HealthEntry) => number | undefined })[]
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
const provenance: Column = { header: 'Provenance', cell: (e) => ORIGIN_LABELS[e.origin] }

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
        },
        {
          key: 'diastolic',
          label: 'Diastolic',
          value: pick((e: E<'bloodPressure'>) => e.diastolicMmHg),
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
        { key: 'bpm', label: 'Resting heart rate', value: pick((e: E<'heartRate'>) => e.bpm) },
      ],
      columns: [
        { header: 'Heart rate (bpm)', numeric: true, cell: pick((e: E<'heartRate'>) => e.bpm) },
        symptoms,
        provenance,
      ],
    },
  ],
  bloodGlucose: [
    {
      id: 'bloodGlucose',
      unit: 'mg/dL',
      series: [{ key: 'mgDl', label: 'Glucose', value: pick((e: E<'bloodGlucose'>) => e.mgDl) }],
      columns: [
        { header: 'Glucose (mg/dL)', numeric: true, cell: pick((e: E<'bloodGlucose'>) => e.mgDl) },
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
      unit: '°C',
      series: [
        {
          key: 'celsius',
          label: 'Temperature',
          value: pick((e: E<'bodyTemperature'>) => e.celsius),
        },
      ],
      columns: [
        {
          header: 'Temperature (°C)',
          numeric: true,
          cell: pick((e: E<'bodyTemperature'>) => e.celsius),
        },
        {
          header: 'Method',
          cell: pick((e: E<'bodyTemperature'>) => TEMPERATURE_METHOD_LABELS[e.method]),
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
      series: [{ key: 'hours', label: 'Sleep', value: pick((e: E<'sleep'>) => e.hours) }],
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
        'Two questions about the past 2 weeks, taken every 14 days. Total score 0–6. The PHQ-2 is a screener, not a diagnosis, and it is not a daily mood score.',
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
