import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { HealthDataProvider } from '@/data/HealthDataProvider'
import type { HealthEntry } from '@/domain/indicators'
import { HomePage } from '@/pages/HomePage'
import { IndicatorPage } from '@/pages/IndicatorPage'
import { createAppStore, createDefaultData } from '@/storage/storage'

/** Renders Home and the indicator pages over an in-memory store. */
export function renderApp(path = '/', entries: HealthEntry[] = []) {
  const store = createAppStore(null)
  if (entries.length > 0) store.save({ ...createDefaultData(), entries })
  render(
    <HealthDataProvider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/indicators/:indicatorId" element={<IndicatorPage />} />
        </Routes>
      </MemoryRouter>
    </HealthDataProvider>,
  )
  return store
}

let counter = 0
/** A simulated-entry base `daysAgo` days before now. */
export function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return { id: `t${counter++}`, recordedAt: date.toISOString(), origin: 'simulated' as const }
}
