/**
 * Self-reported pain logs (points on the body map) and saved pain reports (owner prototype "body-map.html", 2026-11-14).
 *
 * Self-reported data only: the app stores and shows these reports and never
 * interprets them. No rule, threshold, or status uses them.
 */
import { isRecord } from './validation'

/** Character options from the owner's prototype. */
export const PAIN_CHARACTERS = [
  'Aching',
  'Sharp',
  'Throbbing',
  'Burning',
  'Cramping',
  'Tingling',
  'Pressure',
] as const
export type PainCharacter = (typeof PAIN_CHARACTERS)[number]

/** Intensity scale of the prototype: 1 = mild, 10 = worst imaginable. */
export const PAIN_INTENSITY_RANGE = { min: 1, max: 10 } as const
export const PAIN_NOTE_MAX_LENGTH = 240

export type Vec3 = [number, number, number]

export interface PainLog {
  id: string
  /** ISO 8601 date-time when the point was logged. */
  recordedAt: string
  /** ISO 8601 date-time of the last edit. */
  editedAt?: string
  /** Body region or organ name shown to the person, e.g. "Left chest". */
  region: string
  /** Organ id when an organ was chosen in the 2D view. */
  organ: string | null
  /** 2D region id when a region was chosen in the 2D view. */
  zone: string | null
  /** Point on the body model, in metres (x = the person's left, y = up, z = front). */
  position: Vec3
  /** Surface normal at the point. */
  normal: Vec3
  view: '3D' | '2D'
  intensity: number
  character?: PainCharacter
  note?: string
}

const isVec3 = (v: unknown): v is Vec3 =>
  Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === 'number' && Number.isFinite(n))
const isNullableString = (v: unknown) => v === null || typeof v === 'string'
const isDateTime = (v: unknown) => typeof v === 'string' && !Number.isNaN(Date.parse(v))

/** Structural validation of a stored pain report; returns undefined when invalid. */
export function validatePainLog(input: unknown): PainLog | undefined {
  if (!isRecord(input)) return undefined
  const r = input
  const ok =
    typeof r.id === 'string' &&
    r.id !== '' &&
    isDateTime(r.recordedAt) &&
    (r.editedAt === undefined || isDateTime(r.editedAt)) &&
    typeof r.region === 'string' &&
    r.region !== '' &&
    isNullableString(r.organ) &&
    isNullableString(r.zone) &&
    isVec3(r.position) &&
    isVec3(r.normal) &&
    (r.view === '3D' || r.view === '2D') &&
    typeof r.intensity === 'number' &&
    Number.isInteger(r.intensity) &&
    r.intensity >= PAIN_INTENSITY_RANGE.min &&
    r.intensity <= PAIN_INTENSITY_RANGE.max &&
    (r.character === undefined || (PAIN_CHARACTERS as readonly unknown[]).includes(r.character)) &&
    (r.note === undefined || (typeof r.note === 'string' && r.note.length <= PAIN_NOTE_MAX_LENGTH))
  if (!ok) return undefined
  return {
    id: r.id as string,
    recordedAt: r.recordedAt as string,
    ...(r.editedAt ? { editedAt: r.editedAt as string } : {}),
    region: r.region as string,
    organ: r.organ as string | null,
    zone: r.zone as string | null,
    position: r.position as Vec3,
    normal: r.normal as Vec3,
    view: r.view as '3D' | '2D',
    intensity: r.intensity as number,
    ...(r.character ? { character: r.character as PainCharacter } : {}),
    ...(r.note ? { note: r.note as string } : {}),
  }
}

/** A saved report: one or more pain logs, removed from the pain log when saved (owner decisions 2026-11-14). */
export interface PainReport {
  id: string
  /** ISO 8601 date-time when the report was saved. */
  createdAt: string
  /** Name of the (fictional) astronaut at the time of saving. */
  astronaut?: string
  logs: PainLog[]
}

export const PAIN_REPORT_SCHEMA = 'haoma.painReport.v1'
/** Largest JSON file accepted for import (1 MB). */
export const PAIN_REPORT_MAX_BYTES = 1_000_000

function validateLogs(raw: unknown): PainLog[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined
  const logs: PainLog[] = []
  for (const item of raw) {
    const log = validatePainLog(item)
    if (!log) return undefined
    logs.push(log)
  }
  return logs
}

export function validatePainReport(input: unknown): PainReport | undefined {
  if (!isRecord(input)) return undefined
  if (typeof input.id !== 'string' || input.id === '' || !isDateTime(input.createdAt)) {
    return undefined
  }
  if (input.astronaut !== undefined && typeof input.astronaut !== 'string') return undefined
  const logs = validateLogs(input.logs)
  if (!logs) return undefined
  return {
    id: input.id,
    createdAt: input.createdAt as string,
    ...(input.astronaut ? { astronaut: input.astronaut as string } : {}),
    logs,
  }
}

/** The JSON file of a report: astronaut name, save date, and the logs, with a disclaimer. */
export function painReportJson(report: PainReport): string {
  return JSON.stringify(
    {
      schema: PAIN_REPORT_SCHEMA,
      id: report.id,
      astronaut: report.astronaut ?? null,
      savedAt: report.createdAt,
      note: 'Self-reported pain logs from the haoma body map. Not a diagnosis. Hackathon prototype; not a medical device.',
      logs: report.logs,
    },
    null,
    2,
  )
}

export type ImportResult = { ok: true; report: PainReport } | { ok: false; error: string }

/**
 * Reads a report file written by `painReportJson`. Every log is validated; nothing is
 * imported when anything is invalid. A report id that already exists gets a new id.
 */
export function parsePainReportJson(
  text: string,
  existingIds: ReadonlySet<string>,
  newId: () => string,
): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'The file is not valid JSON.' }
  }
  if (!isRecord(parsed) || parsed.schema !== PAIN_REPORT_SCHEMA) {
    return { ok: false, error: 'The file is not a haoma pain report.' }
  }
  const savedAt = parsed.savedAt ?? parsed.createdAt
  if (!isDateTime(savedAt)) return { ok: false, error: 'The report has no valid save date.' }
  if (parsed.astronaut != null && typeof parsed.astronaut !== 'string') {
    return { ok: false, error: 'The astronaut name in the report is not valid.' }
  }
  const logs = validateLogs(parsed.logs)
  if (!logs) return { ok: false, error: 'The report has no pain logs, or a pain log is not valid.' }
  const id =
    typeof parsed.id === 'string' && parsed.id !== '' && !existingIds.has(parsed.id)
      ? parsed.id
      : newId()
  return {
    ok: true,
    report: {
      id,
      createdAt: new Date(savedAt as string).toISOString(),
      ...(parsed.astronaut ? { astronaut: parsed.astronaut as string } : {}),
      logs,
    },
  }
}

/** Mean intensity of a report's logs, one decimal (shown as "average intensity", owner decision). */
export const averageIntensity = (report: PainReport) =>
  (report.logs.reduce((s, l) => s + l.intensity, 0) / report.logs.length).toFixed(1)
