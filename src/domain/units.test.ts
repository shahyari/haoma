import { afterEach, describe, expect, it } from 'vitest'

import { formatDate, formatDateTime, formatShortDate } from './dates'
import { formatValue } from './format'
import {
  DEFAULT_FORMATS,
  displayGlucose,
  displayTemperature,
  displayTemperatureDelta,
  setFormats,
  toStoredCelsius,
  toStoredMgDl,
} from './units'

afterEach(() => setFormats(DEFAULT_FORMATS))

const base = { id: 'x', recordedAt: '2026-11-14T07:00:00.000Z', origin: 'simulated' as const }

describe('units (display only; storage and rules stay in °C and mg/dL)', () => {
  it('converts temperature both ways', () => {
    setFormats({ ...DEFAULT_FORMATS, temperatureUnit: 'fahrenheit' })
    expect(displayTemperature(37.5)).toBe(99.5)
    expect(displayTemperature(38.0)).toBe(100.4)
    expect(displayTemperature(39.4)).toBe(102.9)
    expect(displayTemperatureDelta(0.5)).toBe(0.9)
    expect(toStoredCelsius(99.5)).toBe(37.5)
    expect(toStoredCelsius(100.4)).toBe(38)
    expect(toStoredCelsius(105)).toBe(40.56)
    expect(
      formatValue({
        ...base,
        indicator: 'bodyTemperature',
        celsius: 38,
        method: 'oral',
        exercisedLast30Min: false,
      }),
    ).toBe('100.4 °F')
  })

  it('converts glucose between mg/dL and mmol/L (1 mmol/L = 18.016 mg/dL)', () => {
    setFormats({ ...DEFAULT_FORMATS, measurementSystem: 'si' })
    expect(displayGlucose(100)).toBe(5.6)
    expect(displayGlucose(126)).toBe(7)
    expect(toStoredMgDl(5.6)).toBe(100.9)
    expect(
      formatValue({
        ...base,
        indicator: 'bloodGlucose',
        mgDl: 90,
        context: 'fasting',
        device: 'cgm',
      }),
    ).toBe('5 mmol/L')
  })

  it('leaves values unchanged with the default units', () => {
    expect(displayTemperature(37.2)).toBe(37.2)
    expect(toStoredCelsius(37.2)).toBe(37.2)
    expect(displayGlucose(95)).toBe(95)
    expect(toStoredMgDl(95)).toBe(95)
  })
})

describe('date formats', () => {
  const d = new Date(2026, 10, 14, 7, 5)
  it.each([
    ['dayMonthYear', '14 Nov 2026, 07:05', '14 Nov 2026', '14 Nov'],
    ['monthDayYear', 'Nov 14, 2026, 7:05 AM', 'Nov 14, 2026', 'Nov 14'],
    ['iso', '2026-11-14 07:05', '2026-11-14', '11-14'],
  ] as const)('%s', (dateFormat, dateTime, date, short) => {
    setFormats({ ...DEFAULT_FORMATS, dateFormat })
    expect(formatDateTime(d).replace(/ /g, ' ')).toBe(dateTime)
    expect(formatDate(d)).toBe(date)
    expect(formatShortDate(d)).toBe(short)
  })
})
