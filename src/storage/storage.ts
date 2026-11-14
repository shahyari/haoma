/**
 * Versioned browser-local persistence (Phase A step A7).
 *
 * All data stays in this browser: nothing is transmitted. When localStorage
 * is unavailable (some private-browsing modes, blocked site data) the store
 * falls back to memory, so the app keeps working for the current session.
 */
import type { HealthEntry } from '@/domain/indicators'
import { DEFAULT_MISSION_PHASE, MISSION_PHASES, type MissionPhase } from '@/domain/mission'
import { validatePainLog, validatePainReport, type PainLog, type PainReport } from '@/domain/pain'
import { isRecord, validateEntry } from '@/domain/validation'

export const SCHEMA_VERSION = 1
export const STORAGE_KEY = `haoma:v${SCHEMA_VERSION}`

export interface AppData {
  schemaVersion: typeof SCHEMA_VERSION
  missionPhase: MissionPhase
  entries: HealthEntry[]
  /** Self-reported pain points from the body map. Absent in data saved before 2026-11-14 (read as empty). */
  painLogs: PainLog[]
  /** Saved pain reports (snapshots of pain logs). Absent in older data (read as empty). */
  reports: PainReport[]
}

export type LoadStatus =
  /** Stored data was read and is valid. */
  | 'ok'
  /** Nothing stored yet. */
  | 'empty'
  /** Stored data was unreadable or invalid; defaults are returned and the stored value is left untouched. */
  | 'corrupt'

export interface LoadResult {
  data: AppData
  status: LoadStatus
}

export interface AppStore {
  /** False when the store is memory-only and data ends with the session. */
  readonly persistent: boolean
  load(): LoadResult
  /** Returns false when the write failed (e.g., quota exceeded). */
  save(data: AppData): boolean
  clear(): void
}

export function createDefaultData(): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    missionPhase: DEFAULT_MISSION_PHASE,
    entries: [],
    painLogs: [],
    reports: [],
  }
}

function parseAppData(raw: string): AppData | undefined {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return undefined
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== SCHEMA_VERSION) return undefined
  const phase = parsed.missionPhase
  if (typeof phase !== 'string' || !(MISSION_PHASES as readonly string[]).includes(phase)) {
    return undefined
  }
  if (!Array.isArray(parsed.entries)) return undefined
  const entries: HealthEntry[] = []
  for (const item of parsed.entries) {
    const result = validateEntry(item)
    if (!result.ok) return undefined
    entries.push(result.value)
  }
  // Optional lists, absent in older data. Pain logs were stored as `painReports` before
  // saved reports existed (2026-11-14); that field is still read.
  const list = <T>(raw: unknown, validate: (item: unknown) => T | undefined): T[] | undefined => {
    if (raw === undefined) return []
    if (!Array.isArray(raw)) return undefined
    const out: T[] = []
    for (const item of raw) {
      const value = validate(item)
      if (!value) return undefined
      out.push(value)
    }
    return out
  }
  const painLogs = list(parsed.painLogs ?? parsed.painReports, validatePainLog)
  const reports = list(parsed.reports, validatePainReport)
  if (!painLogs || !reports) return undefined
  return {
    schemaVersion: SCHEMA_VERSION,
    missionPhase: phase as MissionPhase,
    entries,
    painLogs,
    reports,
  }
}

function createMemoryStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  }
}

function isUsable(storage: Storage | null | undefined): storage is Storage {
  if (!storage) return false
  const probe = `${STORAGE_KEY}:probe`
  try {
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

function getLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    // Accessing localStorage can itself throw when site data is blocked.
    return undefined
  }
}

/** Pass `null` to force the in-memory fallback. */
export function createAppStore(storage: Storage | null | undefined = getLocalStorage()): AppStore {
  const persistent = isUsable(storage)
  const backend = persistent ? storage : createMemoryStorage()

  return {
    persistent,
    load() {
      let raw: string | null
      try {
        raw = backend.getItem(STORAGE_KEY)
      } catch {
        return { data: createDefaultData(), status: 'corrupt' }
      }
      if (raw === null) return { data: createDefaultData(), status: 'empty' }
      const data = parseAppData(raw)
      return data ? { data, status: 'ok' } : { data: createDefaultData(), status: 'corrupt' }
    },
    save(data) {
      try {
        backend.setItem(STORAGE_KEY, JSON.stringify(data))
        return true
      } catch {
        return false
      }
    },
    clear() {
      try {
        backend.removeItem(STORAGE_KEY)
      } catch {
        // Nothing to clear if the backend is unreachable.
      }
    },
  }
}
