import type { ReactNode } from 'react'

import { AboutPage } from '@/pages/AboutPage'
import { FoundationPage } from '@/pages/FoundationPage'
import { HomePage } from '@/pages/HomePage'

export interface AppRoute {
  path: string
  /** Navigation label and document title. */
  label: string
  element: ReactNode
}

/**
 * TEMPORARY placeholder routes for the Phase A foundation. The real
 * navigation and information architecture are owner decisions (docs/design.md).
 */
export const APP_ROUTES: AppRoute[] = [
  { path: '/', label: 'Home', element: <HomePage /> },
  { path: '/foundation', label: 'Foundation preview', element: <FoundationPage /> },
  { path: '/about', label: 'About', element: <AboutPage /> },
]
