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
    // Skip link, logo, avatar and Log reading come first; the first card follows.
    for (let i = 0; i < 6 && document.activeElement !== first; i++) await user.tab()
    expect(document.activeElement).toBe(first)
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { level: 1, name: 'Heart rate' })).toBeTruthy()
  })

  it('adds an entry using only the keyboard; Escape closes the dialog and returns focus', async () => {
    const user = userEvent.setup()
    const store = renderApp('/indicators/sleep')
    const add = screen.getByRole('button', { name: /^Log reading:/ })

    add.focus()
    await user.keyboard('{Enter}')
    const dialog = screen.getByRole('dialog')
    expect(dialog.contains(document.activeElement)).toBe(true)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(add))

    await user.keyboard('{Enter}')
    const form = within(screen.getByRole('dialog'))
    await user.type(form.getByLabelText('Sleep (hours)'), '7.5')
    // Tab into the "Source" radio group; Space selects the focused option; Enter submits.
    await user.tab()
    await user.keyboard(' ')
    form.getByLabelText('Sleep (hours)').focus()
    await user.keyboard('{Enter}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(store.load().data.entries).toMatchObject([{ indicator: 'sleep', hours: 7.5 }])
  })

  it('opens the avatar card with the keyboard and closes it with Escape', async () => {
    const user = userEvent.setup()
    renderApp()
    const avatar = screen.getByRole('button', { name: /^Profile: Alex Morgan/ })
    avatar.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('dialog')).toBeTruthy()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(avatar)
  })

  it('selects radio options and checkboxes with the keyboard', async () => {
    const user = userEvent.setup()
    const store = renderApp('/indicators/bodyTemperature')
    screen.getByRole('button', { name: /^Log reading:/ }).focus()
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
    await user.click(dialog.getByRole('button', { name: 'Save reading' }))
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
