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

const data: AppData = { schemaVersion: 1, missionPhase: 'postLanding', entries: [entry] }

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
