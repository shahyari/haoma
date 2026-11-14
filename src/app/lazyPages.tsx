import { lazy } from 'react'

// Pages other than Home load on demand, to keep the main bundle small.
export const AboutPage = lazy(() =>
  import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })),
)
export const IndicatorPage = lazy(() =>
  import('@/pages/IndicatorPage').then((m) => ({ default: m.IndicatorPage })),
)
export const ReportPage = lazy(() =>
  import('@/pages/ReportPage').then((m) => ({ default: m.ReportPage })),
)
export const ReportsPage = lazy(() =>
  import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })),
)
export const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
