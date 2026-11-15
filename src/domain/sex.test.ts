import { describe, expect, it } from 'vitest'
import { createAppStore, createDefaultData, STORAGE_KEY } from '@/storage/storage'
import { SEX_NOTES, sexNotesFor, type SexNote } from './sex'

const approved: SexNote[] = SEX_NOTES.map((n) => ({ ...n, status: 'Approved' }))

function memoryStorage(): Storage {
  const map = new Map<string, string>()
  return {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => void map.delete(k),
    setItem: (k, v) => void map.set(k, v),
  }
}

describe('sex notes', () => {
  it('shows no note while the note is not Approved', () => {
    expect(SEX_NOTES.every((n) => n.status !== 'Approved')).toBe(true)
    expect(sexNotesFor('bloodPressure', 'female', 'postLanding')).toEqual([])
  })

  it('shows an approved note only for the matching sex, indicator and phase', () => {
    expect(sexNotesFor('bloodPressure', 'female', 'postLanding', approved)).toHaveLength(1)
    expect(sexNotesFor('bloodPressure', 'female', 'approachingLanding', approved)).toHaveLength(1)
    expect(sexNotesFor('bloodPressure', 'female', 'inFlight', approved)).toEqual([])
    expect(sexNotesFor('bloodPressure', 'male', 'postLanding', approved)).toEqual([])
    expect(sexNotesFor('bloodPressure', 'notSet', 'postLanding', approved)).toEqual([])
    expect(sexNotesFor('heartRate', 'female', 'postLanding', approved)).toEqual([])
  })
})

describe('sex in storage', () => {
  it('defaults to notSet and reads older data without the field', () => {
    expect(createDefaultData().sex).toBe('notSet')
    const storage = memoryStorage()
    const { sex: _omit, ...older } = createDefaultData()
    storage.setItem(STORAGE_KEY, JSON.stringify(older))
    const result = createAppStore(storage).load()
    expect(result.status).toBe('ok')
    expect(result.data.sex).toBe('notSet')
  })

  it('round-trips a set value and rejects an unknown one', () => {
    const storage = memoryStorage()
    const store = createAppStore(storage)
    store.save({ ...createDefaultData(), sex: 'female' })
    expect(store.load().data.sex).toBe('female')
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...createDefaultData(), sex: 'other' }))
    expect(store.load().status).toBe('corrupt')
  })
})
