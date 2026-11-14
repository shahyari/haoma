/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { contrast, mixOklab, resolveTokens, type Combination } from './contrast'

// Vitest replaces CSS imports with empty strings, so the files are read from disk.
const indexCss = readFileSync('src/index.css', 'utf8')
const themeCss = readFileSync('node_modules/tailwindcss/theme.css', 'utf8')

/**
 * WCAG 2 contrast of the colour tokens for all 16 combinations.
 * Text: 4.5:1 (AA, normal contrast) and 7:1 (AAA, high contrast).
 * Non-text (status icons, input borders, focus ring, chart lines): 3:1 (1.4.11).
 * This checks token pairs only; it is not a full WCAG audit of the pages.
 */
const combinations: Combination[] = (['earth', 'space', 'moon', 'mars'] as const).flatMap((theme) =>
  [false, true].flatMap((dark) => [false, true].map((high) => ({ theme, dark, high }))),
)

const TEXT_PAIRS: [string, string][] = [
  ['--foreground', '--background'],
  ['--foreground', '--card'],
  ['--foreground', '--muted'],
  ['--muted-foreground', '--background'],
  ['--muted-foreground', '--card'],
  ['--primary-foreground', '--primary'],
  ['--destructive', '--card'],
]
const NON_TEXT_PAIRS: [string, string][] = [
  ['--status-normal', '--card'],
  ['--status-attention', '--card'],
  ['--status-escalate', '--card'],
  ['--input', '--background'],
  ['--ring', '--background'],
  ['--chart-1', '--card'],
  ['--chart-2', '--card'],
]
const STATUSES = ['--status-normal', '--status-attention', '--status-escalate']

const name = (c: Combination) =>
  `${c.theme} ${c.dark ? 'dark' : 'light'} ${c.high ? 'high' : 'normal'}`

function measure(c: Combination) {
  const token = resolveTokens(indexCss, themeCss, c)
  const text = TEXT_PAIRS.map(([fg, bg]) => ({
    pair: `${fg} on ${bg}`,
    ratio: contrast(token(fg), token(bg)),
  }))
  // Badge and banner text sits on the status colour mixed 10% into the card.
  for (const status of STATUSES) {
    text.push({
      pair: `--foreground on ${status} surface`,
      ratio: contrast(token('--foreground'), mixOklab(token(status), 10, token('--card'))),
    })
  }
  const nonText = NON_TEXT_PAIRS.map(([fg, bg]) => ({
    pair: `${fg} on ${bg}`,
    ratio: contrast(token(fg), token(bg)),
  }))
  return { text, nonText }
}

describe('theme contrast', () => {
  it.each(combinations.map((c) => [name(c), c] as const))('%s', (_label, c) => {
    const { text, nonText } = measure(c)
    const textMin = c.high ? 7 : 4.5
    const failures = [
      ...text
        .filter((r) => r.ratio < textMin)
        .map((r) => `${r.pair}: ${r.ratio.toFixed(2)} < ${textMin}`),
      ...nonText.filter((r) => r.ratio < 3).map((r) => `${r.pair}: ${r.ratio.toFixed(2)} < 3`),
    ]
    expect(failures).toEqual([])
  })
})

describe('contrast helper', () => {
  it('matches known WCAG values', () => {
    expect(contrast('black', 'white')).toBeCloseTo(21, 1)
    expect(contrast('white', 'white')).toBeCloseTo(1, 5)
    // Tailwind slate-500 on white is about 4.76:1.
    expect(contrast('oklch(55.4% 0.046 257.417)', 'white')).toBeCloseTo(4.76, 1)
  })
})
