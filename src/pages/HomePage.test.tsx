// @vitest-environment jsdom
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

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

  it('keeps the body-figure placeholder, with the banners in their own column on the right', () => {
    renderApp('/', [
      { ...daysAgo(0), indicator: 'bloodPressure', systolicMmHg: 150, diastolicMmHg: 95 },
    ])
    const figure = screen.getByRole('region', { name: 'Body figure' })
    const status = screen.getByRole('region', { name: 'Health status' })
    expect(within(figure).getByText(/Placeholder/)).toBeTruthy()
    expect(within(status).getByText('Report at next flight-surgeon contact.')).toBeTruthy()
    // Document order: cards, figure, banners (left to right on wide screens).
    expect(figure.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('uses the standard status badge, left-aligned at its normal size', () => {
    renderApp('/', [{ ...daysAgo(0), indicator: 'heartRate', bpm: 70, activity: 'rest' }])
    const badge = within(card('Heart rate')).getByText('Normal')
    expect(badge.className).toContain('self-start')
    expect(badge.className).not.toMatch(/w-full|justify-center/)
  })

  it('replaces the demo disclaimer on the main screen with a "Demo data" chip', () => {
    const store = renderApp()
    fireEvent.click(openProfile().getByRole('button', { name: 'Load simulated demo history' }))
    expect(screen.queryByRole('dialog')).toBeNull()
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
  it('holds the fictional profile, the demo-data notice, and links to Settings and About', () => {
    renderApp('/', [
      { ...daysAgo(0), indicator: 'bloodPressure', systolicMmHg: 150, diastolicMmHg: 95 },
    ])
    const profile = openProfile()
    expect(profile.getByText('Alex Morgan')).toBeTruthy()
    expect(profile.getByText('Fictional profile')).toBeTruthy()
    expect(profile.getByText('Aster-1 Lunar Transit Mission')).toBeTruthy()
    expect(profile.getByText('Indicators to review').nextElementSibling?.textContent).toBe('1')
    expect(profile.getByText(/are invented for this demonstration/)).toBeTruthy()
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
