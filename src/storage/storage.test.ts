import { beforeEach, describe, expect, it } from 'vitest'

import type { HealthEntry } from '@/domain/indicators'

import { createAppStore, createDefaultData, STORAGE_KEY, type AppData } from './storage'

const entry: HealthEntry = {
  id: 'e1',
  recordedAt: '2026-11-14T09:00:00.000Z',
  origin: 'simulated',
  indicator: 'sleep',
  hours: 7,
  source: 'selfReport',
}

const data: AppData = {
  schemaVersion: 1,
  missionPhase: 'postLanding',
  entries: [entry],
  painLogs: [],
  reports: [],
}

/** Minimal in-memory Storage, so tests don't depend on the environment's localStorage. */
function fakeStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => void map.delete(key),
    setItem: (key, value) => void map.set(key, value),
  }
}

function brokenStorage(): Storage {
  const fail = () => {
    throw new DOMException('denied', 'SecurityError')
  }
  return { ...fakeStorage(), getItem: fail, setItem: fail, removeItem: fail }
}

describe('createAppStore', () => {
  let storage: Storage
  beforeEach(() => {
    storage = fakeStorage()
  })

  it('uses a versioned key', () => {
    expect(STORAGE_KEY).toBe('haoma:v1')
  })

  it('returns defaults with status "empty" when nothing is stored', () => {
    const store = createAppStore(storage)
    expect(store.persistent).toBe(true)
    expect(store.load()).toEqual({ data: createDefaultData(), status: 'empty' })
    expect(storage.length).toBe(0)
  })

  it('round-trips saved data across store instances', () => {
    expect(createAppStore(storage).save(data)).toBe(true)
    expect(createAppStore(storage).load()).toEqual({ data, status: 'ok' })
  })

  it('clears stored data', () => {
    const store = createAppStore(storage)
    store.save(data)
    store.clear()
    expect(store.load().status).toBe('empty')
  })

  it.each([
    ['invalid JSON', '{nope'],
    ['a non-object', '[]'],
    ['another schema version', JSON.stringify({ ...data, schemaVersion: 2 })],
    ['an unknown mission phase', JSON.stringify({ ...data, missionPhase: 'docked' })],
    ['entries that are not a list', JSON.stringify({ ...data, entries: {} })],
    ['an invalid entry', JSON.stringify({ ...data, entries: [{ ...entry, hours: -1 }] })],
  ])('reports "corrupt" for %s and leaves the stored value untouched', (_label, raw) => {
    storage.setItem(STORAGE_KEY, raw)
    expect(createAppStore(storage).load()).toEqual({ data: createDefaultData(), status: 'corrupt' })
    expect(storage.getItem(STORAGE_KEY)).toBe(raw)
  })

  it.each([
    ['storage is missing', () => null],
    ['storage throws', brokenStorage],
  ])('falls back to memory for the session when %s', (_label, make) => {
    const store = createAppStore(make())
    expect(store.persistent).toBe(false)
    expect(store.load().status).toBe('empty')
    expect(store.save(data)).toBe(true)
    expect(store.load()).toEqual({ data, status: 'ok' })
    store.clear()
    expect(store.load().status).toBe('empty')
  })

  it('returns false when a write fails after the store was created', () => {
    const store = createAppStore(storage)
    storage.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError')
    }
    expect(store.save(data)).toBe(false)
  })
})

describe('pain reports', () => {
  const report = {
    id: 'p1',
    recordedAt: '2026-11-14T08:00:00.000Z',
    region: 'Left chest',
    organ: null,
    zone: 'left-chest',
    position: [0.08, 1.3, 0.11],
    normal: [0, 0, 1],
    view: '2D',
    intensity: 6,
    character: 'Sharp',
    note: 'Started this morning',
  }

  it('loads data saved before pain reports existed, with an empty list', () => {
    const storage = fakeStorage()
    const { painLogs: _omit, ...legacy } = data
    storage.setItem(STORAGE_KEY, JSON.stringify(legacy))
    const result = createAppStore(storage).load()
    expect(result.status).toBe('ok')
    expect(result.data.painLogs).toEqual([])
  })

  it('reads pain logs stored under the earlier field name "painReports"', () => {
    const storage = fakeStorage()
    const { painLogs: _l, reports: _r, ...legacy } = data
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...legacy, painReports: [report] }))
    const result = createAppStore(storage).load()
    expect(result.status).toBe('ok')
    expect(result.data.painLogs).toEqual([report])
    expect(result.data.reports).toEqual([])
  })

  it('round-trips a saved report and rejects an empty one', () => {
    const saved = { id: 'r1', createdAt: '2026-11-14T09:00:00.000Z', logs: [report] }
    const store = createAppStore(fakeStorage())
    store.save({ ...data, reports: [saved as AppData['reports'][number]] })
    expect(store.load().data.reports).toEqual([saved])
    const storage = fakeStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...data, reports: [{ ...saved, logs: [] }] }))
    expect(createAppStore(storage).load().status).toBe('corrupt')
  })

  it('round-trips a valid report', () => {
    const store = createAppStore(fakeStorage())
    store.save({ ...data, painLogs: [report as AppData['painLogs'][number]] })
    expect(store.load().data.painLogs).toEqual([report])
  })

  it.each([
    ['intensity 0', { intensity: 0 }],
    ['intensity 11', { intensity: 11 }],
    ['decimal intensity', { intensity: 5.5 }],
    ['unknown character', { character: 'Stabbing' }],
    ['note too long', { note: 'x'.repeat(241) }],
    ['bad position', { position: [0, 1] }],
  ])('treats a report with %s as corrupt', (_label, change) => {
    const storage = fakeStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...data, painLogs: [{ ...report, ...change }] }))
    expect(createAppStore(storage).load().status).toBe('corrupt')
  })
})
