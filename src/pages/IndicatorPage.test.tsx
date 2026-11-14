// @vitest-environment jsdom
import { cleanup, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import type { HealthEntry } from '@/domain/indicators'
import { daysAgo, renderApp } from '@/test/render'

afterEach(cleanup)

function enter(fields: Record<string, string>, options: string[] = []) {
  fireEvent.click(screen.getByRole('button', { name: 'Add entry' }))
  const dialog = within(screen.getByRole('dialog'))
  for (const [label, value] of Object.entries(fields)) {
    fireEvent.change(dialog.getByLabelText(label), { target: { value } })
  }
  for (const option of options) fireEvent.click(dialog.getByLabelText(option))
  fireEvent.click(dialog.getByRole('button', { name: 'Save entry' }))
}

const latest = () => within(screen.getByRole('region', { name: 'Latest measurement' }))
const table = (name: RegExp) => within(screen.getByRole('region', { name })).getByRole('table')

describe('IndicatorPage', () => {
  it('shows the empty states when nothing is recorded', () => {
    renderApp('/indicators/heartRate')
    expect(screen.getByRole('heading', { level: 1, name: 'Heart rate' })).toBeTruthy()
    expect(latest().getByText('No measurement')).toBeTruthy()
    expect(latest().queryByText('Within reference')).toBeNull()
    expect(screen.getByText(/a baseline needs/).textContent).toContain(
      '5 earlier readings taken at rest, and 0 exist',
    )
    expect(
      within(screen.getByRole('region', { name: 'History' })).getByText(
        'Nothing has been recorded here yet.',
      ),
    ).toBeTruthy()
  })

  it('stores a manual entry and shows it with unit, timestamp, provenance and status', () => {
    const store = renderApp('/indicators/bloodPressure')
    enter({ 'Systolic (mmHg)': '150', 'Diastolic (mmHg)': '95' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(latest().getByText('150/95 mmHg')).toBeTruthy()
    expect(latest().getByText(/Manual entry/)).toBeTruthy()
    expect(latest().getByText('Escalate')).toBeTruthy()
    expect(latest().getByText('Report at next flight-surgeon contact.')).toBeTruthy()
    expect(store.load().data.entries).toMatchObject([
      { indicator: 'bloodPressure', origin: 'userEntered' },
    ])
  })

  it('rejects invalid input with a field error and stores nothing', () => {
    const store = renderApp('/indicators/heartRate')
    enter({ 'Heart rate (bpm)': 'abc' })
    expect(within(screen.getByRole('dialog')).getByText('Enter a number.')).toBeTruthy()
    expect(store.load().data.entries).toEqual([])
  })

  it('uses reported symptoms in the rules', () => {
    renderApp('/indicators/bloodGlucose')
    enter({ 'Glucose (mg/dL)': '65' }, ['Non-fasting', 'Fingerstick', 'Sweating'])
    expect(latest().getByText('Escalate')).toBeTruthy()
    expect(
      latest().getByText('Treat now and notify crew medical officer / flight surgeon.'),
    ).toBeTruthy()
  })

  it('lists systolic and diastolic separately in an accessible table, newest first, with provenance', () => {
    renderApp('/indicators/bloodPressure', [
      { ...daysAgo(2), indicator: 'bloodPressure', systolicMmHg: 112, diastolicMmHg: 70 },
      {
        ...daysAgo(1),
        indicator: 'bloodPressure',
        systolicMmHg: 118,
        diastolicMmHg: 74,
        origin: 'userEntered',
      } as HealthEntry,
    ])
    const t = within(table(/table of readings/))
    expect(t.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Date and time',
      'Systolic (mmHg)',
      'Diastolic (mmHg)',
      'Symptoms reported',
      'Provenance',
      'Actions',
    ])
    const rows = t.getAllByRole('row').slice(1)
    expect(
      rows.map((r) =>
        within(r)
          .getAllByRole('cell')
          .map((c) => c.textContent),
      ),
    ).toEqual([
      ['118', '74', 'None', 'Manual entry', 'Edit'],
      ['112', '70', 'None', 'Simulated', 'Edit'],
    ])
    expect(t.getAllByRole('rowheader').length).toBe(2)
    expect(screen.getByRole('region', { name: /table of readings/ }).tabIndex).toBe(0)
  })

  it('shows the personal baseline once five earlier readings exist', () => {
    const readings = [62, 64, 63, 65, 64, 80].map((bpm, i): HealthEntry => ({
      ...daysAgo(6 - i),
      indicator: 'heartRate',
      bpm,
      activity: 'rest',
    }))
    renderApp('/indicators/heartRate', readings)
    expect(screen.getByRole('region', { name: 'Personal baseline' }).textContent).toContain(
      '64 bpm',
    )
    expect(latest().getByText(/80 bpm, which is 16 bpm above your usual/)).toBeTruthy()
    expect(latest().getByText('Attention')).toBeTruthy()
  })

  it('requires the rest state for a new heart-rate entry and does not evaluate after-activity readings', () => {
    const store = renderApp('/indicators/heartRate')
    enter({ 'Heart rate (bpm)': '120' })
    expect(within(screen.getByRole('dialog')).getByText('Choose an option.')).toBeTruthy()
    expect(store.load().data.entries).toEqual([])
    fireEvent.click(within(screen.getByRole('dialog')).getByLabelText('After activity'))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Save entry' }))
    expect(latest().getByText('Not evaluated')).toBeTruthy()
    expect(latest().getByText(/Taken after activity/)).toBeTruthy()
    expect(store.load().data.entries).toMatchObject([{ bpm: 120, activity: 'afterActivity' }])
  })

  it('describes resting readings above 100 bpm without classifying how often', () => {
    renderApp(
      '/indicators/heartRate',
      [104, 96, 108].map((bpm, i): HealthEntry => ({
        ...daysAgo(3 - i),
        indicator: 'heartRate',
        bpm,
        activity: 'rest',
      })),
    )
    expect(screen.getByText(/Resting readings above 100 bpm in the last/).textContent).toMatch(
      /7 days: 2 of 3\..*no approved rule sets how often is too often/,
    )
  })

  it('requires a temperature method and shows it in the details and history; legacy readings say "Method not recorded"', () => {
    const store = renderApp('/indicators/bodyTemperature', [
      { ...daysAgo(2), indicator: 'bodyTemperature', celsius: 36.6, exercisedLast30Min: false },
    ])
    enter({ 'Temperature (°C)': '37.1' })
    expect(within(screen.getByRole('dialog')).getByText('Choose an option.')).toBeTruthy()
    fireEvent.click(within(screen.getByRole('dialog')).getByLabelText('Forehead sensor'))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Save entry' }))
    expect(latest().getByText(/Forehead sensor/)).toBeTruthy()
    expect(latest().getByText('Not evaluated')).toBeTruthy()
    const cells = within(table(/table of readings/))
      .getAllByRole('row')
      .slice(1)
      .map((r) => within(r).getAllByRole('cell')[1].textContent)
    expect(cells).toEqual(['Forehead sensor', 'Method not recorded'])
    expect(store.load().data.entries.at(-1)).toMatchObject({ method: 'forehead' })
  })

  it('explains why a forehead reading is not evaluated, and shows reported symptoms', () => {
    renderApp('/indicators/bodyTemperature', [
      {
        ...daysAgo(0),
        indicator: 'bodyTemperature',
        celsius: 39.8,
        method: 'forehead',
        exercisedLast30Min: false,
        symptoms: ['otherSymptoms'],
      },
    ])
    expect(latest().getByText('Not evaluated')).toBeTruthy()
    expect(
      latest().getByText('No approved interpretation rule exists for forehead readings.'),
    ).toBeTruthy()
    expect(latest().getByText('“Not evaluated” does not mean normal.')).toBeTruthy()
    expect(
      latest().getByText(/unexpectedly high, verify it with a repeat measurement/),
    ).toBeTruthy()
    expect(latest().getByText(/Symptoms reported with this reading: Other symptoms\./)).toBeTruthy()
  })

  it('shows chest pain next to a heart rate inside 60–100 instead of hiding it', () => {
    renderApp('/indicators/heartRate', [
      { ...daysAgo(0), indicator: 'heartRate', bpm: 80, activity: 'rest', symptoms: ['chestPain'] },
    ])
    expect(
      latest().getByText(/Symptoms reported with this reading: Chest pain\./).textContent,
    ).toContain('no approved rule assesses these symptoms on their own')
  })

  it('edits a history entry: keeps its time, re-evaluates, and marks it as an edited manual entry', () => {
    const store = renderApp('/indicators/bloodPressure', [
      { ...daysAgo(1), indicator: 'bloodPressure', systolicMmHg: 150, diastolicMmHg: 95 },
    ])
    const before = store.load().data.entries[0]
    expect(latest().getByText('Escalate')).toBeTruthy()
    const edit = screen.getByRole('button', { name: /^Edit reading from/ })
    fireEvent.click(edit)
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByRole('heading', { name: 'Edit blood pressure reading' })).toBeTruthy()
    expect((dialog.getByLabelText('Systolic (mmHg)') as HTMLInputElement).value).toBe('150')
    fireEvent.change(dialog.getByLabelText('Systolic (mmHg)'), { target: { value: '115' } })
    fireEvent.change(dialog.getByLabelText('Diastolic (mmHg)'), { target: { value: '75' } })
    fireEvent.click(dialog.getByRole('button', { name: 'Save entry' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    const entries = store.load().data.entries
    expect(entries.length).toBe(1)
    expect(entries[0]).toMatchObject({
      id: before.id,
      recordedAt: before.recordedAt,
      systolicMmHg: 115,
      origin: 'userEntered',
    })
    expect(entries[0].editedAt).toBeTruthy()
    expect(latest().getByText('Normal')).toBeTruthy()
    expect(latest().getByText(/Manual entry \(edited\)/)).toBeTruthy()
  })

  it('validates an edit and keeps the stored entry when it is invalid', () => {
    const store = renderApp('/indicators/heartRate', [
      { ...daysAgo(1), indicator: 'heartRate', bpm: 64, activity: 'rest' },
    ])
    fireEvent.click(screen.getByRole('button', { name: /^Edit reading from/ }))
    const dialog = within(screen.getByRole('dialog'))
    fireEvent.change(dialog.getByLabelText('Heart rate (bpm)'), { target: { value: 'x' } })
    fireEvent.click(dialog.getByRole('button', { name: 'Save entry' }))
    expect(dialog.getByText('Enter a number.')).toBeTruthy()
    expect(store.load().data.entries[0]).toMatchObject({ bpm: 64 })
  })

  it('edits a PHQ-2 by answering both items again, whatever the schedule', () => {
    const store = renderApp('/indicators/mood', [
      { ...daysAgo(2), indicator: 'mood', kind: 'phq2', score: 1 },
    ])
    fireEvent.click(screen.getByRole('button', { name: /^Edit reading from/ }))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.queryByLabelText('Daily mood rating')).toBeNull()
    fireEvent.click(dialog.getAllByLabelText('Nearly every day')[0])
    fireEvent.click(dialog.getAllByLabelText('Not at all')[1])
    fireEvent.click(dialog.getByRole('button', { name: 'Save entry' }))
    expect(store.load().data.entries[0]).toMatchObject({ kind: 'phq2', score: 3 })
  })

  it('has no baseline section for indicators whose rules do not use one', () => {
    renderApp('/indicators/sleep')
    expect(screen.queryByRole('region', { name: 'Personal baseline' })).toBeNull()
  })

  it('marks a temperature taken after exercise as not evaluated', () => {
    renderApp('/indicators/bodyTemperature', [
      {
        ...daysAgo(0),
        indicator: 'bodyTemperature',
        celsius: 38.6,
        method: 'oral',
        exercisedLast30Min: true,
      },
    ])
    expect(latest().getByText('Not evaluated')).toBeTruthy()
    expect(latest().getByText(/after exercise, so it is not evaluated/)).toBeTruthy()
    expect(within(table(/table of readings/)).getByText('Yes (not evaluated)')).toBeTruthy()
  })

  it('separates the approved rules from the measurements and cites their references', () => {
    renderApp('/indicators/sleep')
    const rules = within(
      screen.getByRole('region', { name: 'Reference information and approved rules' }),
    )
    expect(rules.getByText(/not your measurements/)).toBeTruthy()
    expect(rules.getAllByRole('listitem').length).toBe(3)
    expect(rules.getByText('RULE-20')).toBeTruthy()
    expect(rules.getAllByRole('link', { name: /REF-/ }).length).toBe(3)
  })

  it('shows a not-found page for an unknown indicator', () => {
    renderApp('/indicators/weight')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy()
  })
})

describe('Mood: daily rating and PHQ-2 are separate', () => {
  it('keeps two histories, and a daily rating alone is never a status', () => {
    renderApp('/indicators/mood', [
      { ...daysAgo(0), indicator: 'mood', kind: 'dailyRating', rating: 2 },
    ])
    expect(screen.getByRole('heading', { name: 'Daily mood rating' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'PHQ-2 depression screening' })).toBeTruthy()
    expect(latest().getByText('Not assessed')).toBeTruthy()
    expect(latest().queryByText(/Within reference|Below screening cutoff/)).toBeNull()
    expect(screen.getByText(/It is not a diagnosis and not a daily mood rating/)).toBeTruthy()
    expect(
      screen.getAllByText(/thoughts of harming yourself, contact the flight surgeon now/).length,
    ).toBe(1)
  })

  it('scores the PHQ-2 from its two answers about the past 2 weeks', () => {
    renderApp('/indicators/mood')
    fireEvent.click(screen.getByRole('button', { name: 'Add entry' }))
    const dialog = within(screen.getByRole('dialog'))
    fireEvent.click(dialog.getByLabelText('PHQ-2 depression screening (every 14 days)'))
    expect(
      dialog.getByText(
        /Over the last 2 weeks, how often have you been bothered by the following problems\?/,
      ),
    ).toBeTruthy()
    fireEvent.click(dialog.getAllByLabelText('Several days')[0])
    fireEvent.click(dialog.getAllByLabelText('More than half the days')[1])
    fireEvent.click(dialog.getByRole('button', { name: 'Save entry' }))
    expect(within(table(/PHQ-2 depression screening: table/)).getByText('3')).toBeTruthy()
    expect(latest().getAllByText('Further assessment recommended').length).toBeGreaterThan(0)
    expect(latest().getByText(/can do a fuller assessment/)).toBeTruthy()
  })

  it('offers the PHQ-2 only every 14 days', () => {
    renderApp('/indicators/mood', [{ ...daysAgo(13), indicator: 'mood', kind: 'phq2', score: 1 }])
    fireEvent.click(screen.getByRole('button', { name: 'Add entry' }))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.queryByLabelText(/PHQ-2 depression screening/)).toBeNull()
    expect(dialog.getByText(/scheduled every 14 days \(team decision\)\. Next due/)).toBeTruthy()
    cleanup()
    renderApp('/indicators/mood', [{ ...daysAgo(14), indicator: 'mood', kind: 'phq2', score: 1 }])
    fireEvent.click(screen.getByRole('button', { name: 'Add entry' }))
    expect(
      within(screen.getByRole('dialog')).getByLabelText(/PHQ-2 depression screening/),
    ).toBeTruthy()
  })

  it('labels a current PHQ-2 below the cutoff, and a PHQ-2 older than 14 days as history', () => {
    renderApp('/indicators/mood', [{ ...daysAgo(3), indicator: 'mood', kind: 'phq2', score: 1 }])
    expect(latest().getAllByText('Below screening cutoff').length).toBeGreaterThan(0)
    cleanup()
    renderApp('/indicators/mood', [{ ...daysAgo(15), indicator: 'mood', kind: 'phq2', score: 4 }])
    expect(latest().getAllByText('Screening due').length).toBeGreaterThan(0)
    expect(latest().getByText(/now history only/)).toBeTruthy()
    expect(latest().queryByText('Further assessment recommended')).toBeNull()
  })
})
