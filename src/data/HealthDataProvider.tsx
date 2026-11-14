import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import type { HealthEntry } from '@/domain/indicators'
import type { MissionPhase } from '@/domain/mission'
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
  setMissionPhase: (phase: MissionPhase) => void
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
      setMissionPhase: (missionPhase) => change((d) => ({ ...d, missionPhase })),
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
