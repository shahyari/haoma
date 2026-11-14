import { describe, expect, it } from 'vitest'

import doc from '../../docs/data-and-limitations.md?raw'
import { DISCLAIMER } from './disclaimer'

describe('DISCLAIMER', () => {
  it('matches the canonical text in docs/data-and-limitations.md word for word', () => {
    expect(doc).toContain(`> ${DISCLAIMER}`)
  })
})
