import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatDateTime, formatShortDate } from '@/domain/dates'

export interface ChartSeries {
  key: string
  label: string
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
  const config: ChartConfig = Object.fromEntries(
    series.map((s, i) => [s.key, { label: s.label, color: COLORS[i % COLORS.length] }]),
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
        {series.map((s, i) => (
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
        {series.length > 1 ? <ChartLegend content={<ChartLegendContent />} /> : null}
      </LineChart>
    </ChartContainer>
  )
}
