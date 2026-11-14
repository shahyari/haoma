/**
 * Mission-phase setting.
 * Source: docs/scientific-foundations.md -> "Mission phase (OD-3, OD-8)".
 */
export const MISSION_PHASES = ['inFlight', 'approachingLanding', 'postLanding'] as const
export type MissionPhase = (typeof MISSION_PHASES)[number]

export const MISSION_PHASE_LABELS: Record<MissionPhase, string> = {
  inFlight: 'In flight',
  approachingLanding: 'Approaching landing',
  postLanding: 'Post-landing',
}

export const DEFAULT_MISSION_PHASE: MissionPhase = 'inFlight'
