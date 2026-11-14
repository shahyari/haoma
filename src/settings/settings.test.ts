// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import {
  applySettings,
  DEFAULT_SETTINGS,
  parseSettings,
  resolveDark,
  resolveTheme,
} from './settings'

describe('display settings', () => {
  it('falls back to defaults for missing, malformed, or invalid stored values', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('{nope')).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('{"theme":"venus","fontSize":"large","colorBlind":"yes"}')).toEqual({
      ...DEFAULT_SETTINGS,
      fontSize: 'large',
    })
  })

  it('defaults to normal contrast, medium text, colour-blind mode off', () => {
    expect(DEFAULT_SETTINGS).toMatchObject({
      contrast: 'normal',
      fontSize: 'medium',
      colorBlind: false,
    })
  })

  it('selects the theme from the zone unless one is chosen manually', () => {
    expect(resolveTheme({ ...DEFAULT_SETTINGS, zone: 'mars', theme: 'auto' })).toBe('mars')
    expect(resolveTheme({ ...DEFAULT_SETTINGS, zone: 'mars', theme: 'moon' })).toBe('moon')
  })

  it('resolves the mode', () => {
    expect(resolveDark({ ...DEFAULT_SETTINGS, mode: 'dark' }, false)).toBe(true)
    expect(resolveDark({ ...DEFAULT_SETTINGS, mode: 'light' }, true)).toBe(false)
    expect(resolveDark({ ...DEFAULT_SETTINGS, mode: 'auto' }, true)).toBe(true)
  })

  it('writes the resolved settings onto the root element', () => {
    const root = document.createElement('html')
    applySettings(
      {
        zone: 'earth',
        theme: 'auto',
        mode: 'dark',
        contrast: 'high',
        fontSize: 'large',
        colorBlind: true,
      },
      false,
      root,
    )
    expect(root.dataset).toMatchObject({
      theme: 'earth',
      contrast: 'high',
      fontSize: 'large',
      colorblind: 'true',
    })
    expect(root.classList.contains('dark')).toBe(true)
  })
})
