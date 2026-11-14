import type { ReactNode } from 'react'

import { AboutPage } from '@/pages/AboutPage'
import { HomePage } from '@/pages/HomePage'
import { IndicatorPage } from '@/pages/IndicatorPage'
import { ReportPage } from '@/pages/ReportPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { SettingsPage } from '@/pages/SettingsPage'

export interface AppRoute {
  path: string
  /** Navigation label and document title. */
  label: string
  element: ReactNode
  /** Reachable by link only; not listed in the navigation. */
  hidden?: boolean
}

/** Home is owner-specified (brainstorm Section 13). Settings and About are provisional locations. */
export const APP_ROUTES: AppRoute[] = [
  { path: '/', label: 'Home', element: <HomePage /> },
  {
    path: '/indicators/:indicatorId',
    label: 'Indicator',
    element: <IndicatorPage />,
    hidden: true,
  },
  { path: '/reports', label: 'Reports', element: <ReportsPage /> },
  { path: '/reports/:reportId', label: 'Report', element: <ReportPage />, hidden: true },
  { path: '/settings', label: 'Settings', element: <SettingsPage /> },
  { path: '/about', label: 'About', element: <AboutPage /> },
]
