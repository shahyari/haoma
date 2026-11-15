import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { createDemoEntries, refreshDemoEntries } from '@/demo/demo'
import type { HealthEntry } from '@/domain/indicators'
import type { MissionPhase } from '@/domain/mission'
import type { PainLog, PainReport } from '@/domain/pain'
import {
  createAppStore,
  createDefaultData,
  type AppData,
  type AppStore,
  type LoadResult,
  type LoadStatus,
} from '@/storage/storage'

interface HealthDataValue {
  data: AppData
  /** False when entries last only for this session. */
  persistent: boolean
  loadStatus: LoadStatus
  addEntry: (entry: HealthEntry) => void
  /** Replaces the stored entry with the same id. */
  updateEntry: (entry: HealthEntry) => void
  /** Removes the entry with this id. */
  deleteEntry: (id: string) => void
  /** Replaces all entries, e.g. when loading the simulated demo history. */
  replaceEntries: (entries: HealthEntry[]) => void
  setMissionPhase: (phase: MissionPhase) => void
  /** Adds the report, or replaces the stored one with the same id. */
  savePainLog: (report: PainLog) => void
  deletePainLog: (id: string) => void
  clearPainLogs: () => void
  /** Saves the report and removes its logs from the pain log (owner decision 2026-11-14). */
  savePainReport: (report: PainReport) => void
  /** Adds an imported report; the pain log is not changed. */
  importPainReport: (report: PainReport) => void
  deletePainReport: (id: string) => void
  clearAll: () => void
}

const HealthDataContext = createContext<HealthDataValue | null>(null)

/**
 * Loads the simulated demo history when nothing is stored yet (first visit), so first-time
 * visitors see a populated Home. Stored demo data that nobody has added to or edited is
 * regenerated when it is from an earlier day, so its latest readings are always from this
 * morning (owner usability review, 2026-11-15). Corrupt data is left untouched, and
 * "Clear data" stores an empty dataset, so clearing is not undone on the next visit.
 */
function firstVisitData(appStore: AppStore, loaded: LoadResult): AppData {
  const now = new Date()
  if (loaded.status === 'empty') {
    const seeded = { ...loaded.data, entries: createDemoEntries(now) }
    appStore.save(seeded)
    return seeded
  }
  if (loaded.status !== 'ok') return loaded.data
  const refreshed = refreshDemoEntries(loaded.data.entries, now)
  if (!refreshed) return loaded.data
  const next = { ...loaded.data, entries: refreshed }
  appStore.save(next)
  return next
}

export function HealthDataProvider({
  children,
  store,
  seedDemoOnFirstVisit = false,
}: {
  children: ReactNode
  store?: AppStore
  /** Load the simulated demo history when the store is empty (the app sets this). */
  seedDemoOnFirstVisit?: boolean
}) {
  const [appStore] = useState(() => store ?? createAppStore())
  const [loaded] = useState(() => appStore.load())
  const [data, setData] = useState(() =>
    seedDemoOnFirstVisit ? firstVisitData(appStore, loaded) : loaded.data,
  )

  const change = useCallback(
    (update: (current: AppData) => AppData) => {
      setData((current) => {
        const next = update(current)
        appStore.save(next)
        return next
      })
    },
    [appStore],
  )

  const value = useMemo<HealthDataValue>(
    () => ({
      data,
      persistent: appStore.persistent,
      loadStatus: loaded.status,
      addEntry: (entry) => change((d) => ({ ...d, entries: [...d.entries, entry] })),
      updateEntry: (entry) =>
        change((d) => ({
          ...d,
          entries: d.entries.map((x) => (x.id === entry.id ? entry : x)),
        })),
      deleteEntry: (id) => change((d) => ({ ...d, entries: d.entries.filter((x) => x.id !== id) })),
      replaceEntries: (entries) => change((d) => ({ ...d, entries })),
      setMissionPhase: (missionPhase) => change((d) => ({ ...d, missionPhase })),
      savePainLog: (report) =>
        change((d) => ({
          ...d,
          painLogs: d.painLogs.some((r) => r.id === report.id)
            ? d.painLogs.map((r) => (r.id === report.id ? report : r))
            : [...d.painLogs, report],
        })),
      deletePainLog: (id) =>
        change((d) => ({ ...d, painLogs: d.painLogs.filter((r) => r.id !== id) })),
      clearPainLogs: () => change((d) => ({ ...d, painLogs: [] })),
      savePainReport: (report) =>
        change((d) => {
          const saved = new Set(report.logs.map((l) => l.id))
          return {
            ...d,
            reports: [...d.reports, report],
            painLogs: d.painLogs.filter((l) => !saved.has(l.id)),
          }
        }),
      importPainReport: (report) => change((d) => ({ ...d, reports: [...d.reports, report] })),
      deletePainReport: (id) =>
        change((d) => ({ ...d, reports: d.reports.filter((r) => r.id !== id) })),
      clearAll: () => {
        appStore.clear()
        // Store the empty dataset so a cleared app is not re-seeded with demo data.
        const empty = createDefaultData()
        appStore.save(empty)
        setData(empty)
      },
    }),
    [data, appStore, loaded.status, change],
  )
  return <HealthDataContext value={value}>{children}</HealthDataContext>
}

// oxlint-disable-next-line react/only-export-components
export function useHealthData(): HealthDataValue {
  const value = useContext(HealthDataContext)
  if (!value) throw new Error('useHealthData must be used inside HealthDataProvider')
  return value
}
