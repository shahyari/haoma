import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import type { HealthEntry } from '@/domain/indicators'
import type { MissionPhase } from '@/domain/mission'
import type { PainLog, PainReport } from '@/domain/pain'
import {
  createAppStore,
  createDefaultData,
  type AppData,
  type AppStore,
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
  /** Replaces all entries, e.g. when loading the simulated demo history. */
  replaceEntries: (entries: HealthEntry[]) => void
  setMissionPhase: (phase: MissionPhase) => void
  /** Adds the report, or replaces the stored one with the same id. */
  savePainLog: (report: PainLog) => void
  deletePainLog: (id: string) => void
  clearPainLogs: () => void
  savePainReport: (report: PainReport) => void
  deletePainReport: (id: string) => void
  clearAll: () => void
}

const HealthDataContext = createContext<HealthDataValue | null>(null)

export function HealthDataProvider({ children, store }: { children: ReactNode; store?: AppStore }) {
  const [appStore] = useState(() => store ?? createAppStore())
  const [loaded] = useState(() => appStore.load())
  const [data, setData] = useState(loaded.data)

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
      savePainReport: (report) => change((d) => ({ ...d, reports: [...d.reports, report] })),
      deletePainReport: (id) =>
        change((d) => ({ ...d, reports: d.reports.filter((r) => r.id !== id) })),
      clearAll: () => {
        appStore.clear()
        setData(createDefaultData())
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
