import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'

import { INDICATOR_IDS, INDICATORS } from '@/domain/indicators'
import { cn } from '@/lib/utils'

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

/** Neutral placeholder shell: header with navigation, main region, footer with the disclaimer. */
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
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <span className="text-lg font-semibold">{APP_NAME}</span>
          <nav aria-label="Main">
            <ul className="flex flex-wrap gap-1">
              {APP_ROUTES.filter((route) => !route.hidden).map((route) => (
                <li key={route.path}>
                  <NavLink
                    to={route.path}
                    end
                    className={({ isActive }) =>
                      cn(
                        'inline-flex min-h-11 items-center rounded-md px-3 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
                        isActive && 'bg-muted font-medium underline underline-offset-4',
                      )
                    }
                  >
                    {route.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 outline-none"
      >
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl space-y-1 px-4 py-4 text-sm text-muted-foreground">
          <p>{DISCLAIMER}</p>
          <p>This project is not endorsed by NASA.</p>
        </div>
      </footer>
    </div>
  )
}
