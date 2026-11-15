import { describe, expect, it } from 'vitest'
import { validatePainLog } from '@/domain/pain'
import { createDemoPainLogs, DEMO_PAIN_NOTE, isUntouchedDemoPain } from './demo'

describe('demo pain logs', () => {
  it('creates three valid, labeled logs that are never in the future', () => {
    for (const now of [new Date(2026, 10, 15, 14, 0), new Date(2026, 10, 15, 5, 0)]) {
      const logs = createDemoPainLogs(now)
      expect(logs.map((l) => l.region)).toEqual(['Head', 'Left lower back', 'Left knee'])
      for (const log of logs) {
        expect(validatePainLog(log)).toEqual(log)
        expect(log.note).toBe(DEMO_PAIN_NOTE)
        expect(Date.parse(log.recordedAt)).toBeLessThanOrEqual(now.getTime())
      }
    }
  })

  it('recognizes untouched demo logs only', () => {
    const logs = createDemoPainLogs(new Date())
    expect(isUntouchedDemoPain(logs)).toBe(true)
    expect(isUntouchedDemoPain(logs.slice(1))).toBe(false)
    expect(
      isUntouchedDemoPain([{ ...logs[0], editedAt: logs[0].recordedAt }, ...logs.slice(1)]),
    ).toBe(false)
    expect(isUntouchedDemoPain([])).toBe(false)
  })
})
