const DAY_MS = 24 * 60 * 60 * 1000

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** Whole local calendar days from `from` to `to` (0 = same day). */
export function calendarDaysBetween(from: Date, to: Date): number {
  return Math.round((startOfLocalDay(to) - startOfLocalDay(from)) / DAY_MS)
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const dateTimeFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' })
const shortDateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

export const formatDateTime = (value: string | number | Date) =>
  dateTimeFormat.format(new Date(value))
export const formatDate = (value: string | number | Date) => dateFormat.format(new Date(value))
export const formatShortDate = (value: string | number | Date) =>
  shortDateFormat.format(new Date(value))
