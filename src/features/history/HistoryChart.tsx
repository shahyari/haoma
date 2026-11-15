import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatDateTime, formatShortDate } from '@/domain/dates'

import { crewCountKey } from './chartKeys'

export interface ChartSeries {
  key: string
  label: string
  /** A crew-average line: dash-dot, no markers, same colour as its own series. */
  crewOf?: string
}

export interface ChartPoint {
  /** Time of the reading in ms. */
  t: number
  [series: string]: number
}

interface Props {
  /** Describes the chart for assistive technology. */
  label: string
  series: ChartSeries[]
  points: ChartPoint[]
  unit: string
  /** Personal baseline, drawn as a dashed reference line. */
  baseline?: number
  /** Label of the baseline line; defaults to "Personal baseline". */
  baselineLabel?: string
  yDomain?: [number, number]
}

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)']
/** Later series are dashed or dotted with hollow markers, so series never differ by colour alone. */
const DASHES = [undefined, '6 4', '1 3']
const CREW_DASH = '10 4 2 4'

interface LineStyle {
  key: string
  label: string
  dash?: string
  marker: 'filled' | 'hollow' | 'none'
}

/** A short sample of a line (pattern and marker), used in the legend and the tooltip. */
function LineSample({ style }: { style: LineStyle }) {
  const color = `var(--color-${style.key})`
  return (
    <svg width="28" height="10" viewBox="0 0 28 10" aria-hidden="true" className="shrink-0">
      <line
        x1="1"
        y1="5"
        x2="27"
        y2="5"
        stroke={color}
        strokeWidth="2"
        strokeDasharray={style.dash}
      />
      {style.marker === 'none' ? null : (
        <circle
          cx="14"
          cy="5"
          r="3"
          stroke={color}
          strokeWidth="1.5"
          fill={style.marker === 'filled' ? color : 'var(--card)'}
        />
      )}
    </svg>
  )
}

/**
 * Legend with a sample of each line, so your readings and the crew average are told apart
 * by line style, not by colour alone.
 */
function LineLegend({ items }: { items: LineStyle[] }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-3 text-xs">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5">
          <LineSample style={item} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

/** Measured values over time. The data table next to it carries the same values. */
export function HistoryChart({
  label,
  series,
  points,
  unit,
  baseline,
  baselineLabel = 'Personal baseline',
  yDomain,
}: Props) {
  const own = series.filter((s) => !s.crewOf)
  const colorOf = (s: ChartSeries) => {
    const i = own.findIndex((o) => o.key === (s.crewOf ?? s.key))
    return COLORS[i % COLORS.length]
  }
  const styles: LineStyle[] = [
    ...own.map((s, i) => ({
      key: s.key,
      label: s.label,
      dash: DASHES[i % DASHES.length],
      marker: i === 0 ? ('filled' as const) : ('hollow' as const),
    })),
    ...series
      .filter((s) => s.crewOf)
      .map((s) => ({ key: s.key, label: s.label, dash: CREW_DASH, marker: 'none' as const })),
  ]
  const styleOf = (key: string) => styles.find((st) => st.key === key)
  const config: ChartConfig = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: colorOf(s) }]),
  )
  return (
    <ChartContainer
      config={config}
      className="aspect-auto h-64 w-full"
      role="group"
      aria-label={label}
    >
      <LineChart
        data={points}
        accessibilityLayer
        margin={{ top: 12, right: 16, bottom: 4, left: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(value: number) => formatShortDate(value)}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis
          width={48}
          domain={yDomain ?? ['auto', 'auto']}
          allowDecimals
          tickMargin={4}
          label={{ value: unit, angle: -90, position: 'insideLeft', offset: 12 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => {
                const key = String(item.dataKey)
                const count = item.payload?.[crewCountKey(key)] as number | undefined
                return (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {styleOf(key) ? <LineSample style={styleOf(key)!} /> : null}
                      {config[key]?.label}
                    </span>
                    <span className="num font-medium text-foreground">
                      {value}
                      {unit === 'rating' || unit === 'score' ? '' : ` ${unit}`}
                      {count !== undefined ? ` · n = ${count}` : ''}
                    </span>
                  </div>
                )
              }}
              labelFormatter={(_, payload) => {
                const t = payload?.[0]?.payload?.t as number | undefined
                return t === undefined ? '' : formatDateTime(t)
              }}
            />
          }
        />
        {baseline !== undefined ? (
          <ReferenceLine
            y={baseline}
            stroke="var(--foreground)"
            strokeDasharray="2 4"
            label={{
              value: baselineLabel,
              position: 'insideTopRight',
              fill: 'var(--foreground)',
            }}
          />
        ) : null}
        {own.map((s, i) => (
          <Line
            key={s.key}
            dataKey={s.key}
            name={s.label}
            type="linear"
            stroke={`var(--color-${s.key})`}
            strokeWidth={2}
            strokeDasharray={DASHES[i % DASHES.length]}
            dot={{ r: i === 0 ? 3 : 4, fill: i === 0 ? `var(--color-${s.key})` : 'var(--card)' }}
            activeDot={{ r: 5 }}
            connectNulls
            isAnimationActive={false}
          />
        ))}
        {/* Crew averages: dash-dot and no markers, so they never differ from your line by colour alone. */}
        {series
          .filter((s) => s.crewOf)
          .map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              name={s.label}
              type="linear"
              stroke={`var(--color-${s.key})`}
              strokeOpacity={0.8}
              strokeWidth={2}
              strokeDasharray={CREW_DASH}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--card)' }}
              // A gap where no crew average exists; missing days are never bridged.
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        {series.length > 1 ? <ChartLegend content={() => <LineLegend items={styles} />} /> : null}
      </LineChart>
    </ChartContainer>
  )
}
