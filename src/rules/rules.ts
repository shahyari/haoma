/**
 * Approved interpretation rules. Source of truth:
 * docs/scientific-foundations.md (RULE-01 to RULE-30, all `Approved` by the
 * owner on 2026-11-14). Wording, labels, and references are copied from there.
 * Do not change a value here without changing the document first.
 */
import type { IndicatorId } from '@/domain/indicators'

import type { EvidenceLabel, RuleDefinition, Status } from './types'

function rule(
  id: string,
  indicator: IndicatorId,
  status: Status,
  thresholdLabels: EvidenceLabel[],
  actionLabels: EvidenceLabel[],
  refs: string[],
  action?: string,
): RuleDefinition {
  return { id, indicator, status, thresholdLabels, actionLabels, refs, action }
}

export const RULES = {
  // Blood pressure
  'RULE-01': rule('RULE-01', 'bloodPressure', 'normal', ['GCR'], [], ['REF-17']),
  'RULE-02': rule(
    'RULE-02',
    'bloodPressure',
    'attention',
    ['GCR'],
    ['TDD'],
    ['REF-17'],
    'Re-measure after rest and watch the trend.',
  ),
  'RULE-03': rule(
    'RULE-03',
    'bloodPressure',
    'escalate',
    ['GCR'],
    ['TDD'],
    ['REF-17'],
    'Report at next flight-surgeon contact.',
  ),
  'RULE-04': rule(
    'RULE-04',
    'bloodPressure',
    'escalate',
    ['GCR'],
    ['TDD'],
    ['REF-17'],
    'Your blood pressure is above 180/120. Sit quietly for 1 minute, then measure again. If it is still this high, or you have chest pain, shortness of breath, back pain, numbness, weakness, a change in vision or difficulty speaking, contact the crew medical officer or flight surgeon now.',
  ),
  'RULE-05': rule(
    'RULE-05',
    'bloodPressure',
    'attention',
    ['GCR'],
    ['TDD'],
    ['REF-44', 'REF-45'],
    'Re-measure and compare with the trend.',
  ),
  'RULE-25': rule(
    'RULE-25',
    'bloodPressure',
    'escalate',
    ['GCR'],
    ['TDD'],
    ['REF-44', 'REF-45'],
    'Stop what you’re doing and secure yourself. Re-measure in 5 minutes. If symptoms continue or you fainted, contact the crew medical officer or flight surgeon.',
  ),
  'RULE-26': rule(
    'RULE-26',
    'bloodPressure',
    'attention',
    ['TDD'],
    ['TDD'],
    ['REF-47', 'REF-19', 'REF-23', 'REF-45'],
    'You reported feeling lightheaded or dizzy after landing. Move slowly, and sit or hold on before standing up. Take a blood pressure reading now. If it is below 90/60, or your symptoms get worse, contact the crew medical officer or flight surgeon.',
  ),
  // Heart rate
  'RULE-06': rule('RULE-06', 'heartRate', 'normal', ['GCR'], [], ['REF-22']),
  'RULE-07': rule(
    'RULE-07',
    'heartRate',
    'attention',
    ['GCR'],
    ['TDD'],
    ['REF-22'],
    'Re-check at rest the next morning and compare with personal baseline.',
  ),
  'RULE-08': rule(
    'RULE-08',
    'heartRate',
    'escalate',
    ['TDD'],
    ['TDD'],
    ['REF-22', 'REF-23'],
    'Contact flight surgeon.',
  ),
  'RULE-29': rule('RULE-29', 'heartRate', 'attention', ['TDD'], ['TDD'], ['REF-18']),
  // Blood glucose
  'RULE-09': rule('RULE-09', 'bloodGlucose', 'normal', ['GCR'], [], ['REF-46', 'REF-24', 'REF-25']),
  'RULE-10': rule(
    'RULE-10',
    'bloodGlucose',
    'attention',
    ['GCR'],
    ['TDD'],
    ['REF-46', 'REF-24'],
    'Repeat a fasting test and review meals/activity.',
  ),
  'RULE-11': rule(
    'RULE-11',
    'bloodGlucose',
    'attention',
    ['GCR', 'TDD'],
    ['TDD'],
    ['REF-25', 'REF-53'],
    'Re-test now. If you feel shaky, sweaty, confused or unwell, eat fast-acting carbohydrate.',
  ),
  'RULE-12': rule(
    'RULE-12',
    'bloodGlucose',
    'escalate',
    ['GCR', 'TDD'],
    ['TDD'],
    ['REF-25', 'REF-53'],
    'Treat now and notify crew medical officer / flight surgeon.',
  ),
  'RULE-13': rule(
    'RULE-13',
    'bloodGlucose',
    'escalate',
    ['GCR'],
    ['TDD'],
    ['REF-46', 'REF-24'],
    'Report to flight surgeon.',
  ),
  'RULE-27': rule(
    'RULE-27',
    'bloodGlucose',
    'escalate',
    ['GCR'],
    ['TDD'],
    ['REF-46', 'REF-49'],
    'This glucose reading is high, and you reported symptoms. Re-test to confirm, then contact the crew medical officer or flight surgeon today. If you feel very unwell, contact them now.',
  ),
  // Body temperature
  'RULE-14': rule('RULE-14', 'bodyTemperature', 'normal', ['GCR', 'TDD'], [], ['REF-50', 'REF-31']),
  'RULE-15': rule(
    'RULE-15',
    'bodyTemperature',
    'attention',
    ['GCR'],
    ['GCR', 'TDD'],
    ['REF-50', 'REF-31', 'REF-32'],
    'Rest, drink fluids, re-check in a few hours. Do not judge right after exercise.',
  ),
  'RULE-16': rule(
    'RULE-16',
    'bodyTemperature',
    'escalate',
    ['GCR', 'TDD'],
    ['TDD'],
    ['REF-30', 'REF-32'],
    'Report, especially with other symptoms.',
  ),
  'RULE-17': rule(
    'RULE-17',
    'bodyTemperature',
    'escalate',
    ['GCR'],
    ['TDD'],
    ['REF-50', 'REF-31'],
    'Contact flight surgeon promptly.',
  ),
  // Sleep
  'RULE-18': rule('RULE-18', 'sleep', 'normal', ['GCR'], [], ['REF-35']),
  'RULE-19': rule(
    'RULE-19',
    'sleep',
    'attention',
    ['GCR'],
    ['TDD'],
    ['REF-35', 'REF-36'],
    'Adjust schedule and lighting; watch for a run of short nights.',
  ),
  'RULE-20': rule(
    'RULE-20',
    'sleep',
    'escalate',
    ['GCR', 'TDD'],
    ['TDD'],
    ['REF-36'],
    'Raise at next private medical conference, and before EVAs or critical operations.',
  ),
  // Mood
  'RULE-21': rule('RULE-21', 'mood', 'normal', ['TDD'], [], ['REF-51', 'REF-40']),
  'RULE-22': rule(
    'RULE-22',
    'mood',
    'attention',
    ['TDD'],
    ['TDD'],
    ['REF-51', 'REF-40', 'REF-42'],
    'Check in, use self-care time, talk to crewmates.',
  ),
  'RULE-23': rule(
    'RULE-23',
    'mood',
    'escalate',
    ['GCR'],
    ['TDD'],
    ['REF-51', 'REF-40'],
    'The flight surgeon or behavioral health team can do a fuller assessment. Arrange a private conference with the flight surgeon / behavioral health.',
  ),
} as const satisfies Record<string, RuleDefinition>

/** RULE-24: safety message shown on every mood screen (not a detection rule). */
export const MOOD_SAFETY_MESSAGE =
  'If you’re having thoughts of harming yourself, contact the flight surgeon now.'

/** RULE-30: reminder while the mission phase is "Approaching landing" (not a detection rule). */
export const PRE_LANDING_REMINDER =
  'Landing is within 24 hours. Follow your flight surgeon’s pre-landing plan for fluids and compression garments.'
