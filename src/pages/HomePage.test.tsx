// @vitest-environment jsdom
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { daysAgo, renderApp } from '@/test/render'

afterEach(cleanup)

const row = (label: string) =>
  within(screen.getByRole('region', { name: 'Indicators' })).getByRole('link', {
    name: new RegExp(`^${label}`),
  })

describe('HomePage', () => {
  it('shows "No measurement" for every indicator at first, never a status tier', () => {
    renderApp()
    for (const label of [
      'Blood pressure',
      'Heart rate',
      'Blood glucose',
      'Body temperature',
      'Sleep',
      'Mood',
    ]) {
      expect(row(label).textContent).toContain('No measurement')
      expect(row(label).textContent).not.toMatch(
        /Within reference|Attention|Escalate|Not evaluated/,
      )
    }
    expect(screen.getByText('0 of 6')).toBeTruthy()
  })

  it('keeps "Within reference", "Not evaluated" and "No measurement" distinct', () => {
    renderApp('/', [
      { ...daysAgo(0), indicator: 'heartRate', bpm: 70, activity: 'rest' },
      { ...daysAgo(0), indicator: 'bloodGlucose', mgDl: 140, context: 'nonFasting', device: 'cgm' },
      { ...daysAgo(0), indicator: 'sleep', hours: 5, source: 'selfReport' },
    ])
    expect(row('Heart rate').textContent).toContain('Within reference')
    expect(row('Blood glucose').textContent).toContain('Not evaluated')
    expect(row('Blood glucose').textContent).toContain('trend only')
    expect(row('Sleep').textContent).toContain('Below general sleep recommendation')
    expect(row('Sleep').textContent).not.toContain('Escalate')
    expect(row('Blood pressure').textContent).toContain('No measurement')
  })

  it('shows an expandable banner with the approved action and evidence for Attention and Escalate', () => {
    renderApp('/', [
      { ...daysAgo(0), indicator: 'bloodPressure', systolicMmHg: 150, diastolicMmHg: 95 },
    ])
    expect(row('Blood pressure').textContent).toContain('Escalate')
    expect(screen.getByText('Report at next flight-surgeon contact.')).toBeTruthy()
    expect(
      screen.getByText(/Threshold: General clinical reference\. Action: Team design decision\./),
    ).toBeTruthy()
    expect(screen.getByText('REF-17').closest('a')?.getAttribute('href')).toContain(
      'docs/references.md',
    )
  })

  it('counts completed check-ins and indicators to review separately, with no overall score', () => {
    renderApp('/', [
      { ...daysAgo(0), indicator: 'heartRate', bpm: 70, activity: 'rest' },
      { ...daysAgo(0), indicator: 'bloodPressure', systolicMmHg: 150, diastolicMmHg: 95 },
      { ...daysAgo(1), indicator: 'sleep', hours: 6.5, source: 'selfReport' },
    ])
    const profile = within(screen.getByRole('region', { name: 'Profile' }))
    expect(profile.getByText('2 of 6')).toBeTruthy()
    expect(
      profile.getByText('Indicators to review (Attention or Escalate)').nextElementSibling
        ?.textContent,
    ).toBe('2')
    expect(profile.getByText('Fictional profile')).toBeTruthy()
    expect(document.body.textContent).not.toMatch(/health score/i)
  })

  it('loads the simulated demo history and labels it', () => {
    const store = renderApp()
    fireEvent.click(screen.getByRole('button', { name: 'Load simulated demo history' }))
    expect(screen.getByText(/entries marked “Simulated”\s+are invented/)).toBeTruthy()
    expect(row('Heart rate').textContent).toContain('Simulated')
    const profile = within(screen.getByRole('region', { name: 'Profile' }))
    expect(profile.getByText('Alex Morgan')).toBeTruthy()
    expect(profile.getByText('Fictional profile')).toBeTruthy()
    expect(profile.getByText('Aster-1 Lunar Transit Mission')).toBeTruthy()
    expect(profile.getByText(/All health measurements in the demo are simulated/)).toBeTruthy()
    expect(screen.getByText(/PHQ-2 screening/).textContent).toContain('Below screening cutoff')
    const { entries } = store.load().data
    expect(entries.length).toBe(14 * 6 + 1)
    expect(entries.every((e) => e.origin === 'simulated')).toBe(true)
  })

  it('reaches every indicator and check-in item with native links', () => {
    renderApp()
    const links = screen.getAllByRole('link')
    expect(links.filter((a) => a.getAttribute('href')?.startsWith('/indicators/')).length).toBe(13)
    for (const link of links) expect(link.tabIndex).toBe(0)
  })
})
