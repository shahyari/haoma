import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { AppShell } from '@/app/AppShell'
import { HealthDataProvider } from '@/data/HealthDataProvider'
import type { HealthEntry } from '@/domain/indicators'
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { IndicatorPage } from '@/pages/IndicatorPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SettingsProvider } from '@/settings/SettingsProvider'
import { createAppStore, createDefaultData } from '@/storage/storage'

/** Renders the app shell with Home, the indicator pages, Settings and About over an in-memory store. */
export function renderApp(path = '/', entries: HealthEntry[] = []) {
  const store = createAppStore(null)
  if (entries.length > 0) store.save({ ...createDefaultData(), entries })
  render(
    <SettingsProvider>
      <HealthDataProvider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/indicators/:indicatorId" element={<IndicatorPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </HealthDataProvider>
    </SettingsProvider>,
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
