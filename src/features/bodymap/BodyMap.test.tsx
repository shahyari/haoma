// @vitest-environment jsdom
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { renderApp } from '@/test/render'

import { regionNames } from './engine'

afterEach(cleanup)

async function openMap() {
  const store = renderApp('/')
  const map = await screen.findByRole('group', { name: /^2D body map/ })
  return { store, map }
}

describe('Body map (owner prototype, 2026-11-14)', () => {
  it('takes the place of the placeholder and falls back to the 2D map without WebGL', async () => {
    const { map } = await openMap()
    expect(screen.getByRole('heading', { name: 'Body map' })).toBeTruthy()
    expect(screen.queryByText(/Placeholder/)).toBeNull()
    expect(screen.getByText(/needs WebGL/)).toBeTruthy()
    expect(screen.getByRole('button', { name: '3D' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: '2D' }).getAttribute('aria-pressed')).toBe('true')
    // Every front region and organ is a keyboard-reachable button.
    const buttons = within(map).getAllByRole('button')
    expect(buttons.map((b) => b.getAttribute('aria-label')).sort()).toEqual(
      [...new Set(regionNames('front'))].sort(),
    )
    for (const b of buttons) expect(b.getAttribute('tabindex')).toBe('0')
    expect(within(map).getByRole('button', { name: 'Heart' })).toBeTruthy()
  })

  it('adds a pain point with the keyboard and stores it as self-reported data', async () => {
    const { store, map } = await openMap()
    fireEvent.keyDown(within(map).getByRole('button', { name: 'Left chest' }), { key: 'Enter' })
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByRole('heading', { name: 'Left chest' })).toBeTruthy()
    expect(dialog.getByText(/Add pain point · 01/)).toBeTruthy()
    fireEvent.keyDown(dialog.getByRole('button', { name: 'Intensity 5' }), { key: '7' })
    expect(dialog.getByRole('button', { name: 'Intensity 7' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    fireEvent.click(dialog.getByRole('button', { name: 'Sharp' }))
    fireEvent.change(dialog.getByLabelText('Note (optional)'), {
      target: { value: '  Since this morning  ' },
    })
    fireEvent.click(dialog.getByRole('button', { name: 'Save' }))

    expect(screen.queryByRole('dialog')).toBeNull()
    const log = within(screen.getByRole('complementary', { name: 'Pain log' }))
    expect(log.getByText('Left chest')).toBeTruthy()
    expect(log.getByText('7/10')).toBeTruthy()
    expect(log.getByText('Since this morning')).toBeTruthy()
    const [report] = store.load().data.painLogs
    expect(report).toMatchObject({
      region: 'Left chest',
      zone: 'left-chest',
      organ: null,
      view: '2D',
      intensity: 7,
      character: 'Sharp',
      note: 'Since this morning',
    })
    // A saved point marks its region on the map.
    expect(within(map).getByRole('button', { name: 'Left chest' }).classList).toContain('has')
  })

  it('records organs, the back of the body, and cancels without saving', async () => {
    const { store, map } = await openMap()
    fireEvent.keyDown(within(map).getByRole('button', { name: 'Stomach' }), { key: ' ' })
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }))
    expect(store.load().data.painLogs).toEqual([])

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(within(map).queryByRole('button', { name: 'Stomach' })).toBeNull()
    fireEvent.keyDown(within(map).getByRole('button', { name: 'Left lower back' }), {
      key: 'Enter',
    })
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Save' }))
    expect(store.load().data.painLogs[0]).toMatchObject({
      region: 'Left lower back',
      zone: 'b-left-lowerabd',
      intensity: 5,
    })
  })

  it('edits and deletes a pain point', async () => {
    const { store, map } = await openMap()
    fireEvent.keyDown(within(map).getByRole('button', { name: 'Heart' }), { key: 'Enter' })
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Save' }))

    fireEvent.click(screen.getByRole('button', { name: 'Edit point 1' }))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText(/Edit pain point · 01/)).toBeTruthy()
    fireEvent.click(dialog.getByRole('button', { name: 'Intensity 3' }))
    fireEvent.click(dialog.getByRole('button', { name: 'Save' }))
    const [edited] = store.load().data.painLogs
    expect(edited).toMatchObject({ organ: 'heart', intensity: 3 })
    expect(edited.editedAt).toBeTruthy()
    expect(screen.getByText(/· edited/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Delete point 1' }))
    expect(store.load().data.painLogs).toEqual([])
    expect(screen.getByText('No pain points logged.')).toBeTruthy()
  })

  it('asks for confirmation before clearing all points', async () => {
    const { store, map } = await openMap()
    fireEvent.keyDown(within(map).getByRole('button', { name: 'Neck' }), { key: 'Enter' })
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Save' }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(store.load().data.painLogs.length).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: 'Confirm clear' }))
    expect(store.load().data.painLogs).toEqual([])
  })
})

describe('Body map: owner changes of 2026-11-14', () => {
  const addAt = async (name: string) => {
    const { store, map } = await openMap()
    fireEvent.keyDown(within(map).getByRole('button', { name }), { key: 'Enter' })
    return { store, map, dialog: within(screen.getByRole('dialog')) }
  }

  it('links body regions to their related indicators, with temperature for the whole body', async () => {
    const { dialog } = await addAt('Left chest')
    const links = dialog.getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')])
    expect(links).toEqual([
      ['Heart rate', '/indicators/heartRate'],
      ['Blood pressure', '/indicators/bloodPressure'],
      ['Body temperature', '/indicators/bodyTemperature'],
    ])
  })

  it('shows the same links in the pain log', async () => {
    const { dialog } = await addAt('Stomach')
    fireEvent.click(dialog.getByRole('button', { name: 'Save' }))
    const log = within(screen.getByRole('complementary', { name: 'Pain log' }))
    expect(log.getByRole('link', { name: 'Blood glucose' }).getAttribute('href')).toBe(
      '/indicators/bloodGlucose',
    )
  })

  it('has Points and Avg cards, and no Max card', async () => {
    await openMap()
    const log = within(screen.getByRole('complementary', { name: 'Pain log' }))
    expect(log.getByText('Points')).toBeTruthy()
    expect(log.getByText('Avg /10')).toBeTruthy()
    expect(log.queryByText('Max /10')).toBeNull()
  })

  it('defaults the date and time to now, accepts an earlier time, and rejects a future one', async () => {
    const { store, dialog } = await addAt('Neck')
    const when = dialog.getByLabelText('Date and time of the pain') as HTMLInputElement
    expect(Math.abs(new Date(when.value).getTime() - Date.now())).toBeLessThan(2 * 60_000)

    fireEvent.change(when, { target: { value: '2099-01-01T10:00' } })
    fireEvent.click(dialog.getByRole('button', { name: 'Save' }))
    expect(dialog.getByText('The date and time cannot be in the future.')).toBeTruthy()
    expect(store.load().data.painLogs).toEqual([])

    fireEvent.change(when, { target: { value: '2026-11-10T08:30' } })
    fireEvent.click(dialog.getByRole('button', { name: 'Save' }))
    expect(store.load().data.painLogs[0].recordedAt).toBe(
      new Date('2026-11-10T08:30').toISOString(),
    )
  })

  it('saving a report moves the chosen logs into it, shows a banner, and opens the report', async () => {
    const { store, map, dialog } = await addAt('Neck')
    fireEvent.click(dialog.getByRole('button', { name: 'Save' }))
    fireEvent.keyDown(within(map).getByRole('button', { name: 'Heart' }), { key: 'Enter' })
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Save' }))

    fireEvent.click(screen.getByRole('button', { name: 'Save report' }))
    const save = within(screen.getByRole('dialog', { name: 'Save report' }))
    expect(
      save.getAllByRole('checkbox').every((c) => c.getAttribute('aria-checked') === 'true'),
    ).toBe(true)
    fireEvent.click(save.getByRole('checkbox', { name: /Neck/ }))
    fireEvent.click(save.getByRole('button', { name: 'Save report (1)' }))

    // The saved log leaves the pain log; the unticked one stays.
    const { reports, painLogs } = store.load().data
    expect(painLogs.map((l) => l.region)).toEqual(['Neck'])
    expect(reports.length).toBe(1)
    expect(reports[0]).toMatchObject({ astronaut: 'Alex Morgan', logs: [{ region: 'Heart' }] })
    expect(screen.getByText(/Report saved with/).textContent).toContain('1 pain log')

    fireEvent.click(screen.getByRole('link', { name: 'View report' }))
    expect(screen.getByRole('heading', { level: 1, name: /^Pain report/ })).toBeTruthy()
    expect(screen.getByRole('main').textContent).toMatch(/Alex Morgan · 1 log · average intensity/)
    // The report's logs on the body map, read-only.
    const reportMap = await screen.findByRole('group', { name: /pain logs of this report/ })
    expect(within(reportMap).queryAllByRole('button')).toEqual([])
    const log = within(screen.getByRole('complementary', { name: 'Pain log' }))
    expect(log.getByText('Heart')).toBeTruthy()
    expect(log.queryByRole('button', { name: /Edit point/ })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Save report' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Clear all' })).toBeNull()
  })

  it('downloads and opens the report JSON with the astronaut name and save date', async () => {
    const { dialog } = await addAt('Neck')
    fireEvent.click(dialog.getByRole('button', { name: 'Save' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save report' }))
    fireEvent.click(
      within(screen.getByRole('dialog', { name: 'Save report' })).getByRole('button', {
        name: 'Save report (1)',
      }),
    )
    const created: Blob[] = []
    URL.createObjectURL = (blob: Blob) => (created.push(blob), 'blob:test')
    URL.revokeObjectURL = () => {}
    const opened: string[] = []
    window.open = ((url: string) => (opened.push(url), null)) as typeof window.open

    fireEvent.click(screen.getByRole('link', { name: 'Reports' }))
    const report = within(screen.getByRole('article', { name: /^Pain report/ }))
    fireEvent.click(report.getByRole('button', { name: 'Download JSON' }))
    const json = JSON.parse(await created[0].text())
    expect(json).toMatchObject({
      schema: 'haoma.painReport.v1',
      astronaut: 'Alex Morgan',
      logs: [{ region: 'Neck' }],
    })
    expect(Number.isNaN(Date.parse(json.savedAt))).toBe(false)
    expect(json.note).toMatch(/Not a diagnosis/)
    fireEvent.click(report.getByRole('button', { name: 'Open JSON' }))
    expect(opened).toEqual(['blob:test'])

    fireEvent.click(report.getByRole('button', { name: 'Delete' }))
    fireEvent.click(report.getByRole('button', { name: 'Confirm delete' }))
    expect(screen.getByText('No saved reports')).toBeTruthy()
  })
})
