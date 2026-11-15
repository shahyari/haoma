// @vitest-environment jsdom
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'

import { daysAgo, renderApp } from '@/test/render'

afterEach(cleanup)

const LABELS = [
  'Heart rate',
  'Blood pressure',
  'Blood glucose',
  'Body temperature',
  'Sleep',
  'Mood',
]

const indicators = () => within(screen.getByRole('region', { name: 'Indicators' }))
const card = (label: string) => indicators().getByRole('link', { name: new RegExp(`^${label}`) })
const DEMO_COUNT = 14 * 6 + 1 + 4
const openProfile = () => {
  fireEvent.click(screen.getByRole('button', { name: /^Profile: Alex Morgan/ }))
  return within(screen.getByRole('dialog'))
}

describe('HomePage (owner brainstorm Section 16)', () => {
  it('shows six separate indicator cards in the owner’s order, with no visible "Indicators" label', () => {
    renderApp()
    const cards = indicators().getAllByRole('link')
    expect(cards.map((c) => LABELS.find((label) => c.textContent?.startsWith(label)))).toEqual(
      LABELS,
    )
    const cardList = indicators()
      .getAllByRole('list')
      .find((l) => l.tagName === 'UL')!
    expect(within(cardList).getAllByRole('listitem').length).toBe(6)
    expect(screen.getByRole('heading', { name: 'Indicators' }).className).toContain('sr-only')
  })

  it('shows "No measurement" for every indicator at first, never a status tier', () => {
    renderApp()
    for (const label of LABELS) {
      expect(card(label).textContent).toContain('No measurement')
      expect(card(label).textContent).not.toMatch(/Normal|Attention|Escalate|Not evaluated/)
    }
  })

  it('keeps "Normal", "Not evaluated" and "No measurement" distinct', () => {
    renderApp('/', [
      { ...daysAgo(0), indicator: 'heartRate', bpm: 70, activity: 'rest' },
      { ...daysAgo(0), indicator: 'bloodGlucose', mgDl: 140, context: 'nonFasting', device: 'cgm' },
      { ...daysAgo(0), indicator: 'sleep', hours: 5, source: 'selfReport' },
    ])
    expect(card('Heart rate').textContent).toContain('Normal')
    expect(card('Heart rate').textContent).not.toContain('Within reference')
    expect(card('Blood glucose').textContent).toContain('Not evaluated')
    expect(card('Blood glucose').textContent).toContain('trend only')
    expect(card('Sleep').textContent).toContain('Below general sleep recommendation')
    expect(card('Blood pressure').textContent).toContain('No measurement')
  })

  it('shows "Measured … ago" for today’s readings and "Not measured today" otherwise', () => {
    const minutesAgo = (m: number) => ({
      id: `m${m}`,
      recordedAt: new Date(Date.now() - m * 60_000).toISOString(),
      origin: 'simulated' as const,
    })
    const now = new Date()
    renderApp('/', [
      { ...minutesAgo(5), indicator: 'heartRate', bpm: 70, activity: 'rest' },
      ...(now.getHours() >= 2
        ? [
            {
              ...minutesAgo(90),
              indicator: 'bloodPressure' as const,
              systolicMmHg: 115,
              diastolicMmHg: 75,
            },
          ]
        : []),
      { ...daysAgo(1), indicator: 'sleep', hours: 7.5, source: 'selfReport' },
    ])
    expect(card('Heart rate').textContent).toContain('Measured 5 mins ago')
    if (now.getHours() >= 2)
      expect(card('Blood pressure').textContent).toContain('Measured 1 hour ago')
    expect(card('Sleep').textContent).toContain('Not measured today · last yesterday')
    // The full timestamp is kept for screen readers only.
    const visible = card('Sleep').cloneNode(true) as HTMLElement
    visible.querySelectorAll('.sr-only').forEach((n) => n.remove())
    expect(visible.textContent).not.toMatch(/\d{1,2} \w{3} \d{4}/)
    expect(card('Mood').textContent).toContain('Not measured today')
    expect(card('Mood').textContent).toContain('PHQ-2 screening: Not assessed')
    expect(screen.queryByText('Today’s check-in')).toBeNull()
    // One link per indicator: the check-in no longer duplicates the destination.
    const sleepLinks = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/indicators/sleep')
    expect(sleepLinks.length).toBe(1)
  })

  it('shows an expandable banner with the approved action and evidence for Attention and Escalate', () => {
    renderApp('/', [
      { ...daysAgo(0), indicator: 'bloodPressure', systolicMmHg: 150, diastolicMmHg: 95 },
    ])
    expect(card('Blood pressure').textContent).toContain('Escalate')
    expect(screen.getByText('Report at next flight-surgeon contact.')).toBeTruthy()
    expect(
      screen.getByText(/Threshold: General clinical reference\. Action: Team design decision\./),
    ).toBeTruthy()
    expect(screen.getByText('REF-17').closest('a')?.getAttribute('href')).toContain(
      'docs/references.md',
    )
  })

  it('shows the body map, with the banners in their own column on the right', async () => {
    renderApp('/', [
      { ...daysAgo(0), indicator: 'bloodPressure', systolicMmHg: 150, diastolicMmHg: 95 },
    ])
    const map = await screen.findByRole('region', { name: 'Body map' })
    const status = screen.getByRole('region', { name: 'Health status' })
    expect(within(status).getByText('Report at next flight-surgeon contact.')).toBeTruthy()
    // Document order: cards, body map, banners (left to right on wide screens).
    expect(map.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('uses the shadcn badge (fully rounded) in the card header, with only the tier wording', () => {
    renderApp('/', [{ ...daysAgo(0), indicator: 'sleep', hours: 5, source: 'selfReport' }])
    const badge = within(card('Sleep')).getByText('Attention').closest('[data-slot="badge"]')!
    expect(badge.className).toContain('rounded-full')
    expect(badge.className).toContain('text-xs')
    // Same row as the icon and name.
    expect(badge.parentElement?.textContent).toMatch(/^Sleep/)
    // Other wording sits outside the badge.
    expect(badge.textContent).toBe('Attention')
    expect(card('Sleep').textContent).toContain('Below general sleep recommendation')
  })

  it('replaces the demo disclaimer on the main screen with a "Demo data" chip', () => {
    const store = renderApp('/settings')
    fireEvent.click(screen.getByRole('button', { name: 'Load demo data' }))
    fireEvent.click(screen.getByRole('link', { name: 'Haoma, Home' }))
    expect(screen.getByText('Demo data')).toBeTruthy()
    expect(screen.queryByText(/are invented for this demonstration/)).toBeNull()
    expect(card('Heart rate').textContent).toContain('Simulated')
    const { entries } = store.load().data
    expect(entries.length).toBe(DEMO_COUNT)
    expect(entries.every((e) => e.origin === 'simulated')).toBe(true)
    expect(document.body.textContent).not.toMatch(/health score/i)
  })
})

describe('Avatar card', () => {
  it('shows the profile, links and demo notice; the demo controls are in Settings', () => {
    renderApp('/', [
      { ...daysAgo(0), indicator: 'bloodPressure', systolicMmHg: 150, diastolicMmHg: 95 },
    ])
    const profile = openProfile()
    expect(profile.getByText('Alex Morgan')).toBeTruthy()
    expect(profile.getByText('Fictional Flight Engineer')).toBeTruthy()
    expect(
      within(profile.getByRole('navigation', { name: 'Profile menu' }))
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual(['Reports', 'Settings', 'About'])
    expect(profile.getByText('Demo data and fictional person')).toBeTruthy()
    expect(profile.getByText('All health measurements in the demo are simulated.')).toBeTruthy()
    expect(profile.queryByRole('combobox')).toBeNull()
    expect(profile.queryByRole('button', { name: 'Load demo data' })).toBeNull()
    expect(profile.queryByRole('button', { name: 'Clear data' })).toBeNull()
    expect(profile.getByRole('link', { name: 'About' }).getAttribute('href')).toBe('/about')
    fireEvent.click(profile.getByRole('link', { name: 'Settings' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeTruthy()
  })

  it('the logo links back to Home', () => {
    renderApp('/about')
    fireEvent.click(screen.getByRole('link', { name: 'Haoma, Home' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeTruthy()
  })
})

describe('Owner layout changes of 2026-11-14', () => {
  it('shows no Health status region when there are no banners', async () => {
    renderApp('/', [{ ...daysAgo(0), indicator: 'heartRate', bpm: 70, activity: 'rest' }])
    await screen.findByRole('region', { name: 'Body map' })
    expect(screen.queryByRole('region', { name: 'Health status' })).toBeNull()
  })

  it('opens Reports from the avatar menu; Settings, About and Reports have a Back button', () => {
    renderApp('/about')
    expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeTruthy()
    fireEvent.click(openProfile().getByRole('link', { name: 'Reports' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Reports' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeTruthy()
    // Opened directly, Back goes Home.
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeTruthy()
  })

  it('Settings has a Back button', () => {
    renderApp('/settings')
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeTruthy()
  })
})

describe('Demo controls in Settings (usability review 2026-11-15)', () => {
  it('groups zone, phase, demo data and clearing under a "Demo controls" heading', () => {
    renderApp('/settings')
    const demo = within(screen.getByRole('region', { name: 'Demo controls' }))
    expect(demo.getByRole('combobox', { name: 'Mission zone' })).toBeTruthy()
    expect(demo.getByRole('combobox', { name: 'Mission phase' })).toBeTruthy()
    expect(demo.getByRole('button', { name: 'Load demo data' })).toBeTruthy()
    expect(demo.getByRole('button', { name: 'Clear data' })).toBeTruthy()
  })

  it('sets the mission zone (which drives the automatic theme) and the mission phase', async () => {
    const user = userEvent.setup()
    const store = renderApp('/settings')
    const profile = within(screen.getByRole('region', { name: 'Demo controls' }))
    await user.click(profile.getByRole('combobox', { name: 'Mission zone' }))
    await user.click(screen.getByRole('option', { name: 'Mars' }))
    expect(document.documentElement.dataset.theme).toBe('mars')
    await user.click(profile.getByRole('combobox', { name: 'Mission phase' }))
    await user.click(screen.getByRole('option', { name: 'Post-landing' }))
    expect(store.load().data.missionPhase).toBe('postLanding')
  })

  it('asks before replacing existing entries with demo data', () => {
    const store = renderApp('/settings', [
      { ...daysAgo(0), indicator: 'heartRate', bpm: 70, activity: 'rest' },
    ])
    fireEvent.click(screen.getByRole('button', { name: 'Load demo data' }))
    expect(store.load().data.entries.length).toBe(1)
    expect(
      screen.getByRole('dialog', { name: 'Replace your entries with demo data?' }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Replace with demo data' }))
    expect(store.load().data.entries.length).toBe(DEMO_COUNT)
  })
})

describe('Usability review 2026-11-15', () => {
  it('marks a card "Due" when it has no reading today, outside the badge, keeping the status', () => {
    renderApp('/', [
      { ...daysAgo(1), indicator: 'sleep', hours: 7.5, source: 'selfReport' },
      { ...daysAgo(0), indicator: 'heartRate', bpm: 70, activity: 'rest' },
    ])
    expect(within(card('Sleep')).getByText('Due')).toBeTruthy()
    expect(within(card('Sleep')).getByText('Normal').closest('[data-slot="badge"]')).toBeTruthy()
    expect(within(card('Sleep')).getByText('Due').closest('[data-slot="badge"]')).toBeNull()
    expect(within(card('Heart rate')).queryByText('Due')).toBeNull()
  })

  it('shows the activity graph in the right column, with no summary strip', async () => {
    renderApp('/', [
      { ...daysAgo(0), indicator: 'heartRate', bpm: 70, activity: 'rest' },
      { ...daysAgo(0), indicator: 'sleep', hours: 5, source: 'selfReport' },
    ])
    expect(indicators().queryByText('Activity')).toBeNull()
    expect(screen.getByLabelText(/^Today: 2 of 6 indicators logged$/)).toBeTruthy()
    // Document order: cards, body map, activity graph, then the banners below it.
    const map = await screen.findByRole('region', { name: 'Body map' })
    const graph = screen.getByText('Activity')
    const status = screen.getByRole('region', { name: 'Health status' })
    expect(map.compareDocumentPosition(graph) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(graph.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.queryByText(/indicators ·/)).toBeNull()
  })

  it('logs several indicators at once from the Log entry dialog', async () => {
    const user = userEvent.setup()
    const store = renderApp('/')
    await user.click(screen.getByRole('button', { name: 'Log entry' }))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getAllByRole('tab').map((t) => t.textContent)).toEqual(LABELS)
    // Heart rate is first and selected.
    await user.type(dialog.getByLabelText('Heart rate (bpm)'), '64')
    await user.click(dialog.getByLabelText('At rest'))
    await user.click(dialog.getByRole('tab', { name: 'Sleep' }))
    await user.type(dialog.getByLabelText('Sleep (hours)'), '7.5')
    await user.click(dialog.getByRole('button', { name: 'Save 2 entries' }))
    // The sleep source is missing: nothing is saved, and the error is shown.
    expect(store.load().data.entries).toHaveLength(0)
    expect(dialog.getByRole('alert').textContent).toContain('sleep')
    await user.click(dialog.getByLabelText('Self-report'))
    await user.click(dialog.getByRole('button', { name: 'Save 2 entries' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(
      store
        .load()
        .data.entries.map((e) => e.indicator)
        .sort(),
    ).toEqual(['heartRate', 'sleep'])
  })

  it('asks for at least one reading before saving', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(screen.getByRole('button', { name: 'Log entry' }))
    await user.click(screen.getByRole('button', { name: 'Save entries' }))
    expect(screen.getByRole('alert').textContent).toBe('Enter at least one reading.')
  })
})

describe('Consistency review 2026-11-15', () => {
  it('sets the number in the monospaced font and the unit in the normal font', () => {
    renderApp('/', [{ ...daysAgo(0), indicator: 'heartRate', bpm: 66, activity: 'rest' }])
    const number = within(card('Heart rate')).getByText('66')
    const unit = within(card('Heart rate')).getByText('bpm')
    expect(unit.parentElement?.textContent).toBe('66 bpm')
    expect(number.className).toContain('num')
    expect(unit.className).not.toContain('num')
    expect(unit.className).toContain('font-sans')
  })

  it('makes the "Demo data" chip a secondary badge that opens the demo notice', async () => {
    const user = userEvent.setup()
    renderApp('/', [{ ...daysAgo(0), indicator: 'heartRate', bpm: 66, activity: 'rest' }])
    const chip = screen.getByRole('button', { name: 'Demo data: show notice' })
    expect(chip.dataset.variant).toBe('secondary')
    await user.click(chip)
    const notice = within(screen.getByRole('dialog', { name: 'Demo notice' }))
    expect(notice.getByText('All health measurements in the demo are simulated.')).toBeTruthy()
  })
})

describe('Layout review 2026-11-15', () => {
  it.each(['/settings', '/about', '/reports', '/indicators/sleep'])(
    '%s uses the shared centred page layout',
    (path) => {
      renderApp(path)
      const page = screen.getByRole('heading', { level: 1 }).closest('.max-w-5xl')
      expect(page?.className).toContain('mx-auto')
      expect(page?.className).toContain('space-y-8')
    },
  )

  it('shows the astronaut name larger than the role in the avatar card', () => {
    renderApp('/')
    const profile = openProfile()
    expect(profile.getByText('Alex Morgan').className).toContain('text-lg')
    expect(profile.getByText('Fictional Flight Engineer').className).toContain('text-sm')
  })

  it('labels each Settings radio group by its row title', () => {
    renderApp('/settings')
    for (const name of ['Theme', 'Mode', 'Contrast', 'Text size', 'Temperature', 'Date format'])
      expect(screen.getByRole('radiogroup', { name })).toBeTruthy()
  })
})

describe('Header (owner, 2026-11-15)', () => {
  it('shows "Haoma" with the Demo data chip on the left, and Log entry next to the avatar', () => {
    renderApp('/', [{ ...daysAgo(0), indicator: 'heartRate', bpm: 66, activity: 'rest' }])
    const header = screen.getByRole('banner')
    expect(within(header).getByText('Haoma')).toBeTruthy()
    const [left, right] = Array.from(header.firstElementChild!.children) as HTMLElement[]
    expect(within(left).getByRole('link', { name: 'Haoma, Home' })).toBeTruthy()
    expect(within(left).getByRole('button', { name: 'Demo data: show notice' })).toBeTruthy()
    expect(within(right).getByRole('button', { name: 'Log entry' })).toBeTruthy()
    expect(within(right).getByRole('button', { name: /^Profile: Alex Morgan/ })).toBeTruthy()
  })

  it('offers Log entry on other pages too', () => {
    renderApp('/settings')
    expect(screen.getByRole('button', { name: 'Log entry' })).toBeTruthy()
  })
})

describe('Monospaced numbers option (owner, 2026-11-15)', () => {
  it('sits between Text size and Assistive patterns, and replaces the footer note', async () => {
    const user = userEvent.setup()
    renderApp('/settings')
    const appearances = screen.getByRole('region', { name: 'Appearances' })
    const order = ['Text size', 'Monospaced numbers', 'Assistive patterns'].map((text) =>
      within(appearances).getByText(text),
    )
    expect(
      order[0].compareDocumentPosition(order[1]) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      order[1].compareDocumentPosition(order[2]) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.queryByText(/Numbers always use a monospaced font/)).toBeNull()
    const box = screen.getByRole('checkbox', { name: 'Monospaced numbers' })
    expect(box.getAttribute('aria-checked')).toBe('true')
    await user.click(box)
    expect(document.documentElement.dataset.monoNumbers).toBe('false')
  })
})
