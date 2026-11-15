import { useMemo } from 'react'

import { addDays, calendarDaysBetween, formatDate } from '@/domain/dates'
import { INDICATOR_IDS, type HealthEntry } from '@/domain/indicators'
import { cn } from '@/lib/utils'

/** Weeks shown (columns), most recent on the right. */
const ACTIVITY_WEEKS = 24

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

/**
 * Indicators logged per local day, counted like the daily check-in: one per indicator,
 * and for mood only the daily rating (the PHQ-2 has its own schedule).
 */
// oxlint-disable-next-line react/only-export-components
export function loggedPerDay(entries: HealthEntry[]): Map<string, number> {
  const sets = new Map<string, Set<string>>()
  for (const e of entries) {
    if (e.indicator === 'mood' && e.kind !== 'dailyRating') continue
    const key = dayKey(new Date(e.recordedAt))
    const set = sets.get(key) ?? new Set<string>()
    set.add(e.indicator)
    sets.set(key, set)
  }
  return new Map([...sets].map(([key, set]) => [key, set.size]))
}

/** 0 = nothing logged, 1–4 = darker steps of one hue (sequential, never a status colour). */
function level(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  if (count < INDICATOR_IDS.length) return 3
  return 4
}

const LEVEL_CLASSES = [
  'bg-muted',
  'bg-foreground/25',
  'bg-foreground/45',
  'bg-foreground/70',
  'bg-foreground',
] as const

const WEEKDAYS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun']

/**
 * Activity graph (owner usability review, 2026-11-15), in the style of a contribution
 * calendar: one cell per day, darker when more indicators were logged. It shows logging
 * activity only, never health status.
 */
export function ActivityGraph({ entries, now }: { entries: HealthEntry[]; now: Date }) {
  const counts = useMemo(() => loggedPerDay(entries), [entries])
  // Monday-start weeks; the last column is the current week, cut at today.
  const mondayOffset = (now.getDay() + 6) % 7
  const start = addDays(now, -(mondayOffset + (ACTIVITY_WEEKS - 1) * 7))
  const days = Array.from({ length: (ACTIVITY_WEEKS - 1) * 7 + mondayOffset + 1 }, (_, i) =>
    addDays(start, i),
  )
  const total = INDICATOR_IDS.length
  const activeDays = days.filter((d) => (counts.get(dayKey(d)) ?? 0) > 0).length
  const describe = (d: Date) => {
    const n = counts.get(dayKey(d)) ?? 0
    const when = calendarDaysBetween(d, now) === 0 ? 'Today' : formatDate(d)
    return `${when}: ${n} of ${total} indicators logged`
  }

  return (
    <figure className="space-y-2 rounded-lg border bg-card p-4 text-card-foreground">
      <figcaption className="flex items-baseline justify-between gap-2">
        <span className="font-medium">Activity</span>
        <span className="text-sm text-muted-foreground">
          <span className="num">{activeDays}</span> of <span className="num">{days.length}</span>{' '}
          days logged
        </span>
      </figcaption>
      <div className="flex max-w-80 gap-1.5 xl:max-w-none">
        <div
          aria-hidden="true"
          className="grid grid-rows-7 gap-[3px] text-[0.625rem] leading-none text-muted-foreground"
        >
          {WEEKDAYS.map((label, i) => (
            <span key={i} className="flex items-center">
              {label}
            </span>
          ))}
        </div>
        <ol
          aria-label={`Indicators logged per day, last ${ACTIVITY_WEEKS} weeks`}
          className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${ACTIVITY_WEEKS}, minmax(0, 1fr))` }}
        >
          {days.map((d) => {
            const n = counts.get(dayKey(d)) ?? 0
            const label = describe(d)
            return (
              <li
                key={dayKey(d)}
                title={label}
                aria-label={label}
                className={cn(
                  'aspect-square rounded-[2px]',
                  LEVEL_CLASSES[level(n)],
                  calendarDaysBetween(d, now) === 0 &&
                    'ring-1 ring-ring ring-offset-1 ring-offset-card',
                )}
              />
            )
          })}
        </ol>
      </div>
      <div
        aria-hidden="true"
        className="flex items-center justify-end gap-1 text-xs text-muted-foreground"
      >
        <span className="mr-1">Less</span>
        {LEVEL_CLASSES.map((c) => (
          <span key={c} className={cn('size-2.5 rounded-[2px]', c)} />
        ))}
        <span className="ml-1">More</span>
      </div>
    </figure>
  )
}
