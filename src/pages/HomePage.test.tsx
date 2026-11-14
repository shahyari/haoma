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
    expect(indicators().getAllByRole('listitem').length).toBe(6)
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

  it('merges the daily check-in into the cards', () => {
    renderApp('/', [
      { ...daysAgo(0), indicator: 'heartRate', bpm: 70, activity: 'rest' },
      { ...daysAgo(1), indicator: 'sleep', hours: 7.5, source: 'selfReport' },
    ])
    expect(card('Heart rate').textContent).toContain('Checked in today')
    expect(card('Sleep').textContent).toContain('Not yet measured today')
    expect(card('Mood').textContent).toContain('Daily rating not yet today')
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

  it('uses the standard status badge, left-aligned at its normal size', () => {
    renderApp('/', [{ ...daysAgo(0), indicator: 'heartRate', bpm: 70, activity: 'rest' }])
    const badge = within(card('Heart rate')).getByText('Normal')
    expect(badge.className).toContain('self-start')
    expect(badge.className).not.toMatch(/w-full|justify-center/)
  })

  it('replaces the demo disclaimer on the main screen with a "Demo data" chip', () => {
    const store = renderApp()
    fireEvent.click(openProfile().getByRole('button', { name: 'Load demo data' }))
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.getByText('Demo data')).toBeTruthy()
    expect(screen.queryByText(/are invented for this demonstration/)).toBeNull()
    expect(card('Heart rate').textContent).toContain('Simulated')
    const { entries } = store.load().data
    expect(entries.length).toBe(14 * 6 + 1)
    expect(entries.every((e) => e.origin === 'simulated')).toBe(true)
    expect(document.body.textContent).not.toMatch(/health score/i)
  })
})

describe('Avatar card', () => {
  it('follows the Section 17 wireframe: profile, links, demo notice, zone, demo data, clear data', () => {
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
    expect(profile.getByRole('combobox', { name: 'Mission zone' })).toBeTruthy()
    expect(profile.getByRole('combobox', { name: 'Mission phase' })).toBeTruthy()
    expect(profile.getByRole('button', { name: 'Load demo data' })).toBeTruthy()
    expect(profile.getByRole('button', { name: 'Clear data' })).toBeTruthy()
    expect(profile.getByRole('link', { name: 'About' }).getAttribute('href')).toBe('/about')
    fireEvent.click(profile.getByRole('link', { name: 'Settings' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeTruthy()
  })

  it('the logo links back to Home', () => {
    renderApp('/about')
    fireEvent.click(screen.getByRole('link', { name: 'haoma, Home' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeTruthy()
  })
})

describe('Owner layout changes of 2026-11-14', () => {
  it('drops the banner column when there are no banners, so the body map fills the width', async () => {
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

describe('Avatar card controls (Section 17)', () => {
  it('sets the mission zone (which drives the automatic theme) and the mission phase', async () => {
    const user = userEvent.setup()
    const store = renderApp('/')
    const profile = openProfile()
    await user.click(profile.getByRole('combobox', { name: 'Mission zone' }))
    await user.click(screen.getByRole('option', { name: 'Mars' }))
    expect(document.documentElement.dataset.theme).toBe('mars')
    await user.click(profile.getByRole('combobox', { name: 'Mission phase' }))
    await user.click(screen.getByRole('option', { name: 'Post-landing' }))
    expect(store.load().data.missionPhase).toBe('postLanding')
  })

  it('asks before replacing existing entries with demo data', () => {
    const store = renderApp('/', [
      { ...daysAgo(0), indicator: 'heartRate', bpm: 70, activity: 'rest' },
    ])
    const profile = openProfile()
    fireEvent.click(profile.getByRole('button', { name: 'Load demo data' }))
    expect(store.load().data.entries.length).toBe(1)
    fireEvent.click(profile.getByRole('button', { name: 'Replace entries with demo data' }))
    expect(store.load().data.entries.length).toBe(14 * 6 + 1)
  })
})
