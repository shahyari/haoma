import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'

import { Logo } from '@/components/Logo'
import { ProfileMenu } from '@/features/profile/ProfileMenu'
import { INDICATOR_IDS, INDICATORS } from '@/domain/indicators'

import { DISCLAIMER } from './disclaimer'
import { APP_ROUTES } from './routes'

const APP_NAME = 'haoma'

function useDocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const route = APP_ROUTES.find((r) => r.path === pathname)
    const indicator = INDICATOR_IDS.find((id) => pathname === `/indicators/${id}`)
    const title = indicator
      ? INDICATORS[indicator].label
      : route && route.path !== '/'
        ? route.label
        : undefined
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [pathname])
}

/** Shell (owner brainstorm Section 16): logo linking Home, avatar card, full-width main region, footer with the disclaimer. */
export function AppShell() {
  useDocumentTitle()

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <header className="border-b">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-2 lg:px-6">
          <nav aria-label="Main">
            <NavLink
              to="/"
              end
              aria-label={`${APP_NAME}, Home`}
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Logo className="size-7 shrink-0" />
              <span aria-hidden="true">{APP_NAME}</span>
            </NavLink>
          </nav>
          <ProfileMenu />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="w-full flex-1 px-4 py-6 outline-none lg:px-6">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="w-full space-y-1 px-4 py-4 text-sm text-muted-foreground lg:px-6">
          <p>{DISCLAIMER}</p>
          <p>This project is not endorsed by NASA.</p>
        </div>
      </footer>
    </div>
  )
}
