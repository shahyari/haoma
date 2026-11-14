// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import App from '@/App'
import { STORAGE_KEY } from '@/storage/storage'
import { SETTINGS_KEY } from '@/settings/settings'

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  window.history.pushState({}, '', '/')
})

/** Simulates a page reload: unmount, then mount a fresh app over the same localStorage. */
function reload(path = '/') {
  cleanup()
  window.history.pushState({}, '', path)
  render(<App />)
}

describe('browser persistence (localStorage)', () => {
  it('keeps entries across a reload', async () => {
    reload('/indicators/sleep')
    fireEvent.click(await screen.findByRole('button', { name: 'Add entry' }))
    const dialog = within(screen.getByRole('dialog'))
    fireEvent.change(dialog.getByLabelText('Sleep (hours)'), { target: { value: '7.5' } })
    fireEvent.click(dialog.getByLabelText('Self-report'))
    fireEvent.click(dialog.getByRole('button', { name: 'Save entry' }))
    const sleep = (
      JSON.parse(localStorage.getItem(STORAGE_KEY)!).entries as { origin: string }[]
    ).filter((e) => e.origin !== 'simulated')
    expect(sleep).toHaveLength(1)

    reload('/indicators/sleep')
    expect(
      within(await screen.findByRole('region', { name: 'Latest measurement' })).getByText('7.5 h'),
    ).toBeTruthy()
  })

  it('keeps display settings across a reload and applies them before rendering', async () => {
    reload('/settings')
    fireEvent.click(await screen.findByLabelText('High (WCAG AAA)'))
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY)!).contrast).toBe('high')
    reload('/settings')
    expect(
      ((await screen.findByLabelText('High (WCAG AAA)')) as HTMLButtonElement).getAttribute(
        'aria-checked',
      ),
    ).toBe('true')
    expect(document.documentElement.dataset.contrast).toBe('high')
  })

  it('starts empty, and leaves the stored value untouched, when stored data is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    reload()
    const indicators = within(screen.getByRole('region', { name: 'Indicators' }))
    expect(indicators.getAllByText('No measurement')).toHaveLength(6)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{not json')
  })

  it('clears all data from the avatar card after confirmation', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        missionPhase: 'inFlight',
        entries: [
          {
            id: 'a',
            recordedAt: new Date().toISOString(),
            origin: 'simulated',
            indicator: 'heartRate',
            bpm: 60,
          },
        ],
      }),
    )
    reload('/')
    fireEvent.click(screen.getByRole('button', { name: /^Profile: Alex Morgan/ }))
    const card = within(screen.getByRole('dialog'))
    fireEvent.click(card.getByRole('button', { name: 'Clear data' }))
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
    fireEvent.click(card.getByRole('button', { name: 'Confirm: delete all data' }))
    // An empty dataset is stored, so the demo history is not loaded again on the next visit.
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).entries).toEqual([])
    reload()
    expect(
      within(screen.getByRole('region', { name: 'Indicators' })).getAllByText('No measurement'),
    ).toHaveLength(6)
  })
})
