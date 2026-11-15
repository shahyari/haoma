import { describe, expect, it } from 'vitest'
import { HAZARD_IDS, HAZARDS, INDICATOR_HAZARDS, indicatorsFor } from './hazards'
import { INDICATOR_IDS } from './indicators'

describe('RIDGE hazards', () => {
  it('links every indicator to at least one hazard', () => {
    for (const id of INDICATOR_IDS) expect(INDICATOR_HAZARDS[id].hazards.length).toBeGreaterThan(0)
  })

  it('cites a hazard page for each hazard', () => {
    expect(HAZARD_IDS.map((id) => HAZARDS[id].ref)).toEqual([
      'REF-12',
      'REF-13',
      'REF-14',
      'REF-15',
      'REF-16',
    ])
  })

  it('follows the owner mapping of 2026-11-15', () => {
    expect(indicatorsFor('gravity', INDICATOR_IDS).sort()).toEqual(['bloodPressure', 'heartRate'])
    expect(indicatorsFor('isolation', INDICATOR_IDS).sort()).toEqual(['mood', 'sleep'])
    expect(indicatorsFor('radiation', INDICATOR_IDS)).toEqual(['bodyTemperature'])
    expect(INDICATOR_HAZARDS.bodyTemperature.indirect).toEqual(['radiation'])
  })
})
