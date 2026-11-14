import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { applySettings, loadSettings, saveSettings, type DisplaySettings } from './settings'

interface SettingsContextValue {
  settings: DisplaySettings
  update: (patch: Partial<DisplaySettings>) => void
  /** True when the device asks for more contrast (`prefers-contrast: more`). */
  deviceWantsMoreContrast: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => globalThis.matchMedia?.(query).matches ?? false)
  useEffect(() => {
    const list = globalThis.matchMedia?.(query)
    if (!list) return
    const onChange = () => setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(loadSettings)
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const deviceWantsMoreContrast = useMediaQuery('(prefers-contrast: more)')

  useEffect(() => {
    applySettings(settings, prefersDark)
  }, [settings, prefersDark])

  const update = useCallback((patch: Partial<DisplaySettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ settings, update, deviceWantsMoreContrast }),
    [settings, update, deviceWantsMoreContrast],
  )
  return <SettingsContext value={value}>{children}</SettingsContext>
}

// oxlint-disable-next-line react/only-export-components
export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings must be used inside SettingsProvider')
  return value
}
