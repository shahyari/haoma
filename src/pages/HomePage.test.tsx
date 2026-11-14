// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { HealthDataProvider } from '@/data/HealthDataProvider'
import { createAppStore } from '@/storage/storage'

import { HomePage } from './HomePage'

afterEach(cleanup)

function renderHome() {
  const store = createAppStore(null)
  render(
    <HealthDataProvider store={store}>
      <HomePage />
    </HealthDataProvider>,
  )
  return store
}

function enter(indicator: string, fields: Record<string, string>, options: string[] = []) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${indicator}`) }))
  const dialog = within(screen.getByRole('dialog'))
  for (const [label, value] of Object.entries(fields)) {
    fireEvent.change(dialog.getByLabelText(label), { target: { value } })
  }
  for (const option of options) fireEvent.click(dialog.getByLabelText(option))
  fireEvent.click(dialog.getByRole('button', { name: 'Save entry' }))
}

describe('HomePage', () => {
  it('stores a reading as user-entered and shows its status and the approved action', () => {
    const store = renderHome()
    enter('Blood pressure', { 'Systolic (mmHg)': '150', 'Diastolic (mmHg)': '95' })

    expect(screen.queryByRole('dialog')).toBeNull()
    const row = screen.getByRole('button', { name: /^Blood pressure/ })
    expect(row.textContent).toContain('150/95 mmHg')
    expect(row.textContent).toContain('Escalate')
    expect(screen.getByText('Report at next flight-surgeon contact.')).toBeTruthy()
    expect(
      screen.getByText(/Threshold: General clinical reference\. Action: Team design decision\./),
    ).toBeTruthy()
    expect(screen.getByText(/RULE-03 · REF-17/)).toBeTruthy()
    expect(store.load().data.entries).toMatchObject([
      { indicator: 'bloodPressure', origin: 'userEntered' },
    ])
  })

  it('shows field errors and stores nothing when the input is invalid', () => {
    const store = renderHome()
    enter('Heart rate', { 'Heart rate (bpm)': 'abc' })
    expect(within(screen.getByRole('dialog')).getByText('Enter a number.')).toBeTruthy()
    expect(store.load().data.entries).toEqual([])
  })

  it('uses reported symptoms in the rules', () => {
    renderHome()
    enter('Blood glucose', { 'Glucose (mg/dL)': '65' }, ['Non-fasting', 'Fingerstick', 'Sweating'])
    expect(screen.getByRole('button', { name: /^Blood glucose/ }).textContent).toContain('Escalate')
    expect(
      screen.getByText('Treat now and notify crew medical officer / flight surgeon.'),
    ).toBeTruthy()
  })

  it('shows no status badge when no approved rule applies', () => {
    renderHome()
    enter('Blood glucose', { 'Glucose (mg/dL)': '140' }, ['Non-fasting', 'CGM'])
    const row = screen.getByRole('button', { name: /^Blood glucose/ }).textContent
    expect(row).toContain('trend only')
    expect(row).not.toMatch(/Normal|Attention|Escalate/)
  })

  it('scores the PHQ-2 from its two answers and always shows the safety message', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: /^Mood/ }))
    const dialog = within(screen.getByRole('dialog'))
    expect(
      dialog.getByText(/thoughts of harming yourself, contact the flight surgeon now/),
    ).toBeTruthy()
    fireEvent.click(dialog.getByLabelText('PHQ-2 (every 14 days)'))
    fireEvent.click(dialog.getAllByLabelText('Several days')[0])
    fireEvent.click(dialog.getAllByLabelText('More than half the days')[1])
    fireEvent.click(dialog.getByRole('button', { name: 'Save entry' }))
    const row = screen.getByRole('button', { name: /^Mood/ }).textContent
    expect(row).toContain('PHQ-2 3/6')
    expect(row).toContain('Escalate')
  })
})
