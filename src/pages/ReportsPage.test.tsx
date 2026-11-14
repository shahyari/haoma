// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { createDefaultData } from '@/storage/storage'
import { renderApp } from '@/test/render'

afterEach(cleanup)

const log = {
  id: 'l1',
  recordedAt: '2026-11-14T08:00:00.000Z',
  region: 'Left chest',
  organ: null,
  zone: 'left-chest',
  position: [0.09, 1.3, 0.12],
  normal: [0, 0, 1],
  view: '2D',
  intensity: 6,
}
const file = {
  schema: 'haoma.painReport.v1',
  id: 'r-imported',
  astronaut: 'Alex Morgan',
  savedAt: '2026-11-14T09:30:00.000Z',
  logs: [log],
}

function importFile(content: string, name = 'report.json') {
  const input = screen.getByLabelText('Report file to import') as HTMLInputElement
  fireEvent.change(input, {
    target: { files: [new File([content], name, { type: 'application/json' })] },
  })
}

describe('Reports page: import', () => {
  it('imports a report file and opens it', async () => {
    const store = renderApp('/reports')
    importFile(JSON.stringify(file))
    await screen.findByText('Imported a report of Alex Morgan with 1 pain log.')
    expect(store.load().data.reports).toMatchObject([
      { id: 'r-imported', astronaut: 'Alex Morgan', createdAt: file.savedAt, logs: [log] },
    ])
    // Importing does not touch the pain log.
    expect(store.load().data.painLogs).toEqual([])
    fireEvent.click(within(screen.getByRole('status')).getByRole('link', { name: 'View report' }))
    expect(screen.getByRole('heading', { level: 1, name: /^Pain report/ })).toBeTruthy()
  })

  it('gives a duplicate report a new id', async () => {
    const store = renderApp('/reports')
    importFile(JSON.stringify(file))
    await screen.findByText(/Imported a report/)
    importFile(JSON.stringify(file))
    await waitFor(() => expect(store.load().data.reports.length).toBe(2))
    const [a, b] = store.load().data.reports
    expect(a.id).toBe('r-imported')
    expect(b.id).not.toBe('r-imported')
  })

  it.each([
    ['not JSON', '{nope', 'The file is not valid JSON.'],
    ['another file type', JSON.stringify({ hello: 1 }), 'The file is not a haoma pain report.'],
    ['no logs', JSON.stringify({ ...file, logs: [] }), 'no pain logs'],
    ['an invalid log', JSON.stringify({ ...file, logs: [{ ...log, intensity: 12 }] }), 'not valid'],
    ['no save date', JSON.stringify({ ...file, savedAt: 'yesterday' }), 'no valid save date'],
  ])('rejects %s and imports nothing', async (_label, content, message) => {
    const store = renderApp('/reports')
    importFile(content)
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Nothing was imported.')
    expect(alert.textContent).toContain(message)
    expect(store.load().data.reports).toEqual([])
  })

  it('shows a not-found page for an unknown report', () => {
    renderApp('/reports/missing')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy()
  })

  it('lists the astronaut name and average intensity of each report', () => {
    renderApp('/reports')
    expect(createDefaultData().reports).toEqual([])
    importFile(JSON.stringify(file))
    return screen.findByRole('article').then((article) => {
      expect(article.textContent).toMatch(/Alex Morgan · 1 log · average intensity 6\.0\/10/)
    })
  })
})
