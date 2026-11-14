import { describe, expect, it } from 'vitest'

import { createDemoEntries, DEMO_DAYS } from '@/demo/demo'
import type { HealthEntry } from '@/domain/indicators'
import { validateEntry } from '@/domain/validation'
import { evaluateAll } from '@/rules/evaluate'

import { dailyCheckIn, phq2Schedule } from './checkin'

const now = new Date(2026, 10, 14, 15, 0)
const at = (y: number, m: number, d: number, h = 8) => new Date(y, m, d, h).toISOString()
const hr = (recordedAt: string): HealthEntry => ({
  id: recordedAt,
  recordedAt,
  origin: 'userEntered',
  indicator: 'heartRate',
  bpm: 64,
})
const mood = (recordedAt: string, kind: 'phq2' | 'dailyRating'): HealthEntry =>
  kind === 'phq2'
    ? {
        id: recordedAt + kind,
        recordedAt,
        origin: 'userEntered',
        indicator: 'mood',
        kind,
        score: 0,
      }
    : {
        id: recordedAt + kind,
        recordedAt,
        origin: 'userEntered',
        indicator: 'mood',
        kind,
        rating: 4,
      }

describe('dailyCheckIn', () => {
  it('lists the six indicators, all open when nothing is recorded', () => {
    const items = dailyCheckIn([], now)
    expect(items.length).toBe(6)
    expect(items.every((i) => !i.done)).toBe(true)
  })
  it('counts only entries from the current local calendar day', () => {
    const done = (entries: HealthEntry[]) =>
      dailyCheckIn(entries, now).find((i) => i.indicator === 'heartRate')!.done
    expect(done([hr(at(2026, 10, 14, 0))])).toBe(true)
    expect(done([hr(at(2026, 10, 13, 23))])).toBe(false)
  })
  it('does not count a PHQ-2 as the daily mood rating', () => {
    const done = (entries: HealthEntry[]) =>
      dailyCheckIn(entries, now).find((i) => i.indicator === 'mood')!.done
    expect(done([mood(at(2026, 10, 14), 'phq2')])).toBe(false)
    expect(done([mood(at(2026, 10, 14), 'dailyRating')])).toBe(true)
  })
})

describe('phq2Schedule', () => {
  it('is due when never taken, and again 14 calendar days after the last one', () => {
    expect(phq2Schedule([], now).due).toBe(true)
    expect(phq2Schedule([mood(at(2026, 10, 1, 23), 'phq2')], now).due).toBe(false)
    const due = phq2Schedule([mood(at(2026, 9, 31, 23), 'phq2')], now)
    expect(due.due).toBe(true)
    expect(due.nextDue?.getDate()).toBe(14)
  })
})

describe('demo history', () => {
  const entries = createDemoEntries(now)
  it('is deterministic, structurally valid, and entirely labeled simulated', () => {
    expect(createDemoEntries(now)).toEqual(entries)
    expect(entries.length).toBe(DEMO_DAYS * 6 + 1)
    for (const entry of entries) {
      expect(validateEntry(entry).ok).toBe(true)
      expect(entry.origin).toBe('simulated')
    }
  })
  it('ends yesterday, leaving today’s check-in open, with a PHQ-2 that is still current', () => {
    expect(dailyCheckIn(entries, now).every((i) => !i.done)).toBe(true)
    expect(phq2Schedule(entries, now).due).toBe(false)
  })
  it('contains no Escalate reading', () => {
    const statuses = evaluateAll(entries, { missionPhase: 'inFlight', now }).map((a) => a.status)
    expect(statuses).not.toContain('escalate')
    expect(statuses).not.toContain('missing')
  })
})
