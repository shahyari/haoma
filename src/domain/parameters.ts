/**
 * Team-set parameters P-1 to P-8, and the crew-comparison parameters P-9 to P-11
 * (Crew Average Comparison, owner spec 2026-11-15; values proposed by Claude, owner to confirm).
 * Source: docs/scientific-foundations.md -> "Team-set parameters (OD-5)".
 *
 * All are team design decisions (TDD), not published standards. They must be
 * shown in the UI as "team-set parameters". This file only holds the values;
 * the rules that use them are implemented in Phase B from a feature spec.
 */
export interface TeamParameters {
  /** P-1: rolling median of the last N valid readings (same method; no time-of-day matching, AU-7). */
  baselineWindowReadings: number
  /** P-2: valid readings required before any baseline rule may fire. */
  baselineMinReadings: number
  /** P-3: resting heart-rate shift from baseline, in bpm (either direction). */
  heartRateShiftBpm: number
  /** P-4: temperature shift above baseline, in degrees Celsius. */
  temperatureShiftCelsius: number
  /** P-5: short-window average at least `minDropPoints` below the long-window average. */
  moodTrend: { shortWindowDays: number; longWindowDays: number; minDropPoints: number }
  /** P-6: ignore temperature readings taken within this many minutes after exercise. */
  postExerciseWindowMinutes: number
  /** P-7: at most `maxHours` of sleep on `minNights` or more of the last `windowNights` nights. */
  regularShortSleep: { maxHours: number; minNights: number; windowNights: number }
  /** P-8: hours before the planned landing, and hours after landing. */
  transitionWindows: { approachingLandingHoursBefore: number; postLandingHoursAfter: number }
  /** P-9: fewest other crew members with comparable readings before a crew average is shown. */
  crewMinCohort: number
  /** P-10: crew readings are matched to the same local calendar day (mission day) as the reading. */
  crewMatchWindow: 'sameDay'
  /** P-11: "close to the crew average" when the difference is at most this many crew standard deviations. */
  crewCloseWithinSd: number
}

export const TEAM_PARAMETERS: Readonly<TeamParameters> = {
  baselineWindowReadings: 7,
  baselineMinReadings: 5,
  heartRateShiftBpm: 10,
  temperatureShiftCelsius: 0.5,
  moodTrend: { shortWindowDays: 3, longWindowDays: 14, minDropPoints: 1 },
  postExerciseWindowMinutes: 30,
  regularShortSleep: { maxHours: 6, minNights: 3, windowNights: 7 },
  transitionWindows: { approachingLandingHoursBefore: 24, postLandingHoursAfter: 72 },
  crewMinCohort: 3,
  crewMatchWindow: 'sameDay',
  crewCloseWithinSd: 0.5,
}
