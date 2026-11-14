/**
 * Contrast measurement for the theme tokens in src/index.css.
 * Resolves CSS custom properties the way the cascade does for
 * <html data-theme data-contrast class="dark">, converts OKLCH/OKLab to
 * sRGB (out-of-gamut channels are clipped), and computes WCAG 2 contrast ratios.
 */
type Vars = Record<string, string>

function blocks(css: string): { selector: string; body: string }[] {
  const out: { selector: string; body: string }[] = []
  const re = /([^{}]+)\{([^{}]*)\}/g
  for (let m = re.exec(css); m; m = re.exec(css)) {
    out.push({
      selector: m[1]
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim()
        .replace(/\s+/g, ' '),
      body: m[2],
    })
  }
  return out
}

function declarations(body: string): Vars {
  const vars: Vars = {}
  for (const m of body.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g))
    vars[m[1]] = m[2].trim()
  return vars
}

export interface Combination {
  theme: 'earth' | 'space' | 'moon' | 'mars'
  dark: boolean
  high: boolean
}

export function resolveTokens(
  indexCss: string,
  themeCss: string,
  c: Combination,
): (name: string) => string {
  const all = blocks(indexCss)
  const pick = (selector: string) =>
    all.filter((b) => b.selector === selector).map((b) => declarations(b.body))
  const layers: Vars[] = [
    ...pick(":root, [data-theme='space']"),
    ...(c.theme === 'space' ? [] : pick(`[data-theme='${c.theme}']`)),
    ...pick(':root'),
    ...(c.high ? pick("[data-contrast='high']") : []),
    ...(c.dark ? pick('.dark') : []),
    ...(c.dark && c.high ? pick(".dark[data-contrast='high']") : []),
  ]
  const vars: Vars = Object.assign({}, declarations(themeCss), ...layers)
  const resolve = (value: string, depth = 0): string => {
    if (depth > 20) throw new Error(`cycle in ${value}`)
    return value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
      if (!(name in vars)) throw new Error(`unknown ${name}`)
      return resolve(vars[name], depth + 1)
    })
  }
  return (name) => resolve(`var(${name})`)
}

type Lab = [number, number, number]

function parseOklch(value: string): Lab {
  if (value === 'white') return [1, 0, 0]
  if (value === 'black') return [0, 0, 0]
  const m = value.match(/oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+|none)\s*\)/)
  if (!m) throw new Error(`unsupported colour ${value}`)
  const L = Number(m[1]) / (m[2] ? 100 : 1)
  const C = Number(m[3])
  const h = m[4] === 'none' ? 0 : (Number(m[4]) * Math.PI) / 180
  return [L, C * Math.cos(h), C * Math.sin(h)]
}

function linearRgb([L, a, b]: Lab): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clip = (v: number) => Math.min(1, Math.max(0, v))
  return [
    clip(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clip(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clip(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

/** `color-mix(in oklab, x p%, y)` as used for the status surfaces. */
export function mixOklab(x: string, percent: number, y: string): Lab {
  const a = parseOklch(x)
  const b = parseOklch(y)
  const p = percent / 100
  return [a[0] * p + b[0] * (1 - p), a[1] * p + b[1] * (1 - p), a[2] * p + b[2] * (1 - p)]
}

function luminance(colour: string | Lab): number {
  const [r, g, b] = linearRgb(typeof colour === 'string' ? parseOklch(colour) : colour)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(fg: string | Lab, bg: string | Lab): number {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
