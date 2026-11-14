import { getFormats } from './units'

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

// Date formats (Settings → Units and Formats). Day month year is the default.
const gb = {
  dateTime: new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
  date: new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }),
  short: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }),
}
const us = {
  dateTime: new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
  date: new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }),
  short: new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }),
}
const p2 = (n: number) => String(n).padStart(2, '0')
const isoDate = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`

export function formatDateTime(value: string | number | Date): string {
  const d = new Date(value)
  const f = getFormats().dateFormat
  if (f === 'iso') return `${isoDate(d)} ${p2(d.getHours())}:${p2(d.getMinutes())}`
  return (f === 'monthDayYear' ? us : gb).dateTime.format(d)
}
export function formatDate(value: string | number | Date): string {
  const d = new Date(value)
  const f = getFormats().dateFormat
  if (f === 'iso') return isoDate(d)
  return (f === 'monthDayYear' ? us : gb).date.format(d)
}
export function formatShortDate(value: string | number | Date): string {
  const d = new Date(value)
  const f = getFormats().dateFormat
  if (f === 'iso') return `${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
  return (f === 'monthDayYear' ? us : gb).short.format(d)
}
