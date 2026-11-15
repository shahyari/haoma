/**
 * Display settings (docs/design.md -> "Display settings"). Stored separately
 * from health data, under its own versioned key.
 */
import {
  DATE_FORMATS,
  DEFAULT_FORMATS,
  MEASUREMENT_SYSTEMS,
  setFormats,
  TEMPERATURE_UNITS,
  type Formats,
} from '@/domain/units'

export const ZONES = ['earth', 'space', 'moon', 'mars'] as const
export type Zone = (typeof ZONES)[number]
export const ZONE_LABELS: Record<Zone, string> = {
  earth: 'Earth',
  space: 'Space',
  moon: 'Moon',
  mars: 'Mars',
}

export const THEME_CHOICES = ['auto', ...ZONES] as const
export type ThemeChoice = (typeof THEME_CHOICES)[number]

export const MODES = ['auto', 'light', 'dark'] as const
export type Mode = (typeof MODES)[number]

export const CONTRASTS = ['normal', 'high'] as const
export type Contrast = (typeof CONTRASTS)[number]

export const FONT_SIZES = ['small', 'medium', 'large'] as const
export type FontSize = (typeof FONT_SIZES)[number]

export interface DisplaySettings extends Formats {
  /** Where the astronaut is. Drives the automatic theme. */
  zone: Zone
  /** `auto` follows the zone. */
  theme: ThemeChoice
  mode: Mode
  contrast: Contrast
  fontSize: FontSize
  /** "Assistive patterns": adds patterns to the status colours. */
  colorBlind: boolean
  /** "Monospaced numbers" (owner, 2026-11-15): numbers in the monospaced font; on by default. */
  monoNumbers: boolean
}

export const DEFAULT_SETTINGS: DisplaySettings = {
  zone: 'space',
  theme: 'auto',
  mode: 'auto',
  contrast: 'normal',
  fontSize: 'medium',
  colorBlind: false,
  monoNumbers: true,
  ...DEFAULT_FORMATS,
}

export const SETTINGS_KEY = 'haoma:display:v1'

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly unknown[]).includes(value) ? (value as T) : fallback
}

/** Reads unknown stored JSON; every invalid or missing field falls back to its default. */
export function parseSettings(raw: string | null): DisplaySettings {
  let v: Record<string, unknown> = {}
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {}
    if (typeof parsed === 'object' && parsed !== null) v = parsed as Record<string, unknown>
  } catch {
    // keep defaults
  }
  const d = DEFAULT_SETTINGS
  return {
    zone: pick(v.zone, ZONES, d.zone),
    theme: pick(v.theme, THEME_CHOICES, d.theme),
    mode: pick(v.mode, MODES, d.mode),
    contrast: pick(v.contrast, CONTRASTS, d.contrast),
    fontSize: pick(v.fontSize, FONT_SIZES, d.fontSize),
    colorBlind: typeof v.colorBlind === 'boolean' ? v.colorBlind : d.colorBlind,
    monoNumbers: typeof v.monoNumbers === 'boolean' ? v.monoNumbers : d.monoNumbers,
    temperatureUnit: pick(v.temperatureUnit, TEMPERATURE_UNITS, d.temperatureUnit),
    measurementSystem: pick(v.measurementSystem, MEASUREMENT_SYSTEMS, d.measurementSystem),
    dateFormat: pick(v.dateFormat, DATE_FORMATS, d.dateFormat),
  }
}

export function loadSettings(): DisplaySettings {
  try {
    return parseSettings(globalThis.localStorage.getItem(SETTINGS_KEY))
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: DisplaySettings): void {
  try {
    globalThis.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Settings then last for this session only.
  }
}

export function resolveTheme(settings: DisplaySettings): Zone {
  return settings.theme === 'auto' ? settings.zone : settings.theme
}

/**
 * TODO: per the owner spec, `auto` should follow the habitat's LED lighting
 * system, not the clock (source to be defined). Until then it follows the
 * device's light/dark preference.
 */
export function resolveDark(settings: DisplaySettings, deviceprefersDark: boolean): boolean {
  return settings.mode === 'auto' ? deviceprefersDark : settings.mode === 'dark'
}

/** Writes the resolved settings onto the root element; CSS in index.css does the rest. */
export function applySettings(
  settings: DisplaySettings,
  deviceprefersDark: boolean,
  root: HTMLElement = document.documentElement,
): void {
  root.dataset.theme = resolveTheme(settings)
  root.classList.toggle('dark', resolveDark(settings, deviceprefersDark))
  root.dataset.contrast = settings.contrast
  root.dataset.fontSize = settings.fontSize
  root.dataset.colorblind = String(settings.colorBlind)
  root.dataset.monoNumbers = String(settings.monoNumbers)
  setFormats(settings)
}
