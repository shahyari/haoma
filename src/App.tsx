import { BrowserRouter, Route, Routes } from 'react-router'

import { AppShell } from '@/app/AppShell'
import { ErrorBoundary } from '@/app/ErrorBoundary'
import { APP_ROUTES } from '@/app/routes'
import { HealthDataProvider } from '@/data/HealthDataProvider'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { SettingsProvider } from '@/settings/SettingsProvider'

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <HealthDataProvider seedDemoOnFirstVisit>
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                {APP_ROUTES.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </HealthDataProvider>
      </SettingsProvider>
    </ErrorBoundary>
  )
}
