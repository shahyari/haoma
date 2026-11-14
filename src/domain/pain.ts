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

/** A saved report: a snapshot of one or more pain logs (owner decision 2026-11-14). */
export interface PainReport {
  id: string
  /** ISO 8601 date-time when the report was saved. */
  createdAt: string
  logs: PainLog[]
}

export function validatePainReport(input: unknown): PainReport | undefined {
  if (!isRecord(input)) return undefined
  if (typeof input.id !== 'string' || input.id === '' || !isDateTime(input.createdAt))
    return undefined
  if (!Array.isArray(input.logs) || input.logs.length === 0) return undefined
  const logs: PainLog[] = []
  for (const item of input.logs) {
    const log = validatePainLog(item)
    if (!log) return undefined
    logs.push(log)
  }
  return { id: input.id, createdAt: input.createdAt as string, logs }
}

/** The downloadable JSON of a report. Self-reported data with its disclaimer. */
export function painReportJson(report: PainReport): string {
  return JSON.stringify(
    {
      schema: 'haoma.painReport.v1',
      id: report.id,
      createdAt: report.createdAt,
      note: 'Self-reported pain logs from the haoma body map. Not a diagnosis. Hackathon prototype; not a medical device.',
      logs: report.logs,
    },
    null,
    2,
  )
}
