// @vitest-environment jsdom
import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { daysAgo, renderApp } from './render'

afterEach(cleanup)

describe('keyboard', () => {
  it('opens an indicator from Home with Tab and Enter', async () => {
    const user = userEvent.setup()
    renderApp()
    const indicators = within(screen.getByRole('region', { name: 'Indicators' }))
    const first = indicators.getAllByRole('link')[0]
    await user.tab()
    expect(document.activeElement).toBe(first)
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { level: 1, name: 'Blood pressure' })).toBeTruthy()
  })

  it('adds an entry using only the keyboard; Escape closes the dialog and returns focus', async () => {
    const user = userEvent.setup()
    const store = renderApp('/indicators/heartRate')
    const add = screen.getByRole('button', { name: 'Add entry' })

    add.focus()
    await user.keyboard('{Enter}')
    const dialog = screen.getByRole('dialog')
    expect(dialog.contains(document.activeElement)).toBe(true)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(add))

    await user.keyboard('{Enter}')
    await user.type(
      within(screen.getByRole('dialog')).getByLabelText('Heart rate (bpm)'),
      '66{Enter}',
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(store.load().data.entries).toMatchObject([{ indicator: 'heartRate', bpm: 66 }])
  })

  it('selects radio options and checkboxes with the keyboard', async () => {
    const user = userEvent.setup()
    const store = renderApp('/indicators/bodyTemperature')
    screen.getByRole('button', { name: 'Add entry' }).focus()
    await user.keyboard('{Enter}')
    const dialog = within(screen.getByRole('dialog'))
    await user.type(dialog.getByLabelText('Temperature (°C)'), '36.8')
    await user.tab()
    // Radix radio group: focus enters on the first option; Space selects it.
    expect(document.activeElement).toBe(dialog.getByLabelText('Oral'))
    await user.keyboard(' ')
    await user.tab()
    expect(document.activeElement).toBe(dialog.getByLabelText('I exercised in the last 30 minutes'))
    await user.keyboard(' ')
    await user.click(dialog.getByRole('button', { name: 'Save entry' }))
    expect(store.load().data.entries).toMatchObject([
      { indicator: 'bodyTemperature', celsius: 36.8, method: 'oral', exercisedLast30Min: true },
    ])
  })

  it('makes the scrollable data table focusable', async () => {
    renderApp('/indicators/sleep', [
      { ...daysAgo(0), indicator: 'sleep', hours: 7, source: 'selfReport' },
    ])
    const region = screen.getByRole('region', { name: /table of readings/ })
    expect(region.tabIndex).toBe(0)
  })
})
