/**
 * Display units and date formats (owner brainstorm Section 17, 2026-11-14).
 *
 * Unit conversion only: values are always stored, and every rule always evaluates,
 * in °C and mg/dL. These helpers change what is shown and how input is read.
 */
export const TEMPERATURE_UNITS = ['celsius', 'fahrenheit'] as const
export type TemperatureUnit = (typeof TEMPERATURE_UNITS)[number]

/** Blood glucose: US conventional (mg/dL) or SI (mmol/L). */
export const MEASUREMENT_SYSTEMS = ['conventional', 'si'] as const
export type MeasurementSystem = (typeof MEASUREMENT_SYSTEMS)[number]

export const DATE_FORMATS = ['dayMonthYear', 'monthDayYear', 'iso'] as const
export type DateFormat = (typeof DATE_FORMATS)[number]

export interface Formats {
  temperatureUnit: TemperatureUnit
  measurementSystem: MeasurementSystem
  dateFormat: DateFormat
}

export const DEFAULT_FORMATS: Formats = {
  temperatureUnit: 'celsius',
  measurementSystem: 'conventional',
  dateFormat: 'dayMonthYear',
}

let current: Formats = DEFAULT_FORMATS

/** Set by the settings provider before rendering, so formatters need no React context. */
export function setFormats(formats: Formats): void {
  current = {
    temperatureUnit: formats.temperatureUnit,
    measurementSystem: formats.measurementSystem,
    dateFormat: formats.dateFormat,
  }
}
export const getFormats = (): Formats => current

/** Molar mass of glucose, 180.16 g/mol: 1 mmol/L = 18.016 mg/dL. */
export const GLUCOSE_MGDL_PER_MMOL = 18.016

const round = (value: number, decimals: number) => {
  const f = 10 ** decimals
  return Math.round(value * f) / f
}

export const temperatureUnitLabel = () => (current.temperatureUnit === 'fahrenheit' ? '°F' : '°C')
export const glucoseUnitLabel = () => (current.measurementSystem === 'si' ? 'mmol/L' : 'mg/dL')

/** A stored °C value in the chosen unit, one decimal. */
export function displayTemperature(celsius: number): number {
  return current.temperatureUnit === 'fahrenheit' ? round((celsius * 9) / 5 + 32, 1) : celsius
}
/** A temperature difference (not a reading) in the chosen unit. */
export function displayTemperatureDelta(celsius: number): number {
  return current.temperatureUnit === 'fahrenheit' ? round((celsius * 9) / 5, 1) : round(celsius, 1)
}
/** Input in the chosen unit → stored °C (two decimals). */
export function toStoredCelsius(input: number): number {
  return current.temperatureUnit === 'fahrenheit' ? round(((input - 32) * 5) / 9, 2) : input
}

/** A stored mg/dL value in the chosen system (mmol/L to one decimal). */
export function displayGlucose(mgDl: number): number {
  return current.measurementSystem === 'si' ? round(mgDl / GLUCOSE_MGDL_PER_MMOL, 1) : mgDl
}
/** Input in the chosen system → stored mg/dL (one decimal). */
export function toStoredMgDl(input: number): number {
  return current.measurementSystem === 'si' ? round(input * GLUCOSE_MGDL_PER_MMOL, 1) : input
}
