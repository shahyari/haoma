/**
 * Body map engine: dependency-free WebGL (3D) and SVG (2D) body model.
 *
 * Ported from the owner's prototype "body-map.html" (created with Claude, 2026-11-14;
 * AI-assisted code). Geometry, region names, organs, 2D regions, and the interaction
 * model follow the prototype. Integration changes: TypeScript, colours taken from the
 * app's theme tokens (light and dark), one instance per mount with cleanup, keyboard
 * activation reported to React, and reduced motion respected.
 *
 * Coordinates: metres, +Y up, +Z = front of body, +X = the person's LEFT
 * (so the front view shows their left on the viewer's right).
 */

type V3 = number[]

export interface PickInfo {
  region: string
  organ: string | null
  zone: string | null
  p: V3
  n: V3
  view: '3D' | '2D'
}

export interface Mark {
  id: string
  /** Number shown on the body and in the list. */
  num: number
  p: V3
  n: V3
  intensity: number
  organ: string | null
  zone: string | null
  region: string
  pending?: boolean
}

export type BodyMapMode = '3d' | '2d'
export type BodyFace = 'front' | 'back'
export type ViewName = 'front' | 'back' | 'left' | 'right'

export interface BodyMapElements {
  stage: HTMLElement
  canvas: HTMLCanvasElement
  overlay: SVGSVGElement
  svg2d: SVGSVGElement
  tip: HTMLElement
  readoutLeft: HTMLElement
  readoutRight: HTMLElement
}

export interface BodyMapController {
  readonly glAvailable: boolean
  setMode(mode: BodyMapMode): void
  setFace(face: BodyFace): void
  view(name: ViewName): void
  zoom(factor: number): void
  reset(): void
  setMarks(marks: Mark[], highlightId: string | null): void
  locate(mark: Mark): void
  refreshTheme(): void
  destroy(): void
}

const DEG = Math.PI / 180
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const V = {
  sub: (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  add: (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  mul: (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a: V3, b: V3): V3 => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ],
  len: (a: V3) => Math.hypot(a[0], a[1], a[2]),
  norm: (a: V3): V3 => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1
    return [a[0] / l, a[1] / l, a[2] / l]
  },
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const pad = (n: number) => String(n).padStart(2, '0')

/* ------------------------------ GEOMETRY ------------------------------ */

interface Rig {
  rx?: number
  ry?: number
  rz?: number
  t?: V3
}
function rig(v: V3, { rx = 0, ry = 0, rz = 0, t = [0, 0, 0] }: Rig): V3 {
  let [x, y, z] = v
  if (rx) {
    const c = Math.cos(rx),
      s = Math.sin(rx)
    ;[y, z] = [y * c - z * s, y * s + z * c]
  }
  if (ry) {
    const c = Math.cos(ry),
      s = Math.sin(ry)
    ;[x, z] = [x * c + z * s, -x * s + z * c]
  }
  if (rz) {
    const c = Math.cos(rz),
      s = Math.sin(rz)
    ;[x, y] = [x * c - y * s, x * s + y * c]
  }
  return [x + t[0], y + t[1], z + t[2]]
}

/* Loft: rows [y, halfWidth(x), halfDepth(z), zCentre], ascending y.
   Monotone-in-y Hermite interpolation + rounded end caps; superellipse sections. */
function smoothRows(ctrl: number[][], spacing: number, capB: number, capT: number) {
  const n = ctrl.length,
    out: number[][] = []
  const slope = (i: number, d: number) => {
    const a = ctrl[Math.max(0, i - 1)],
      b = ctrl[Math.min(n - 1, i + 1)]
    return (b[d] - a[d]) / (b[0] - a[0] || 1)
  }
  for (let i = 0; i < n - 1; i++) {
    const a = ctrl[i],
      b = ctrl[i + 1],
      h = b[0] - a[0],
      steps = Math.max(2, Math.ceil(h / spacing))
    for (let k = 0; k < steps; k++) {
      const t = k / steps,
        t2 = t * t,
        t3 = t2 * t,
        h00 = 2 * t3 - 3 * t2 + 1,
        h10 = t3 - 2 * t2 + t,
        h01 = -2 * t3 + 3 * t2,
        h11 = t3 - t2
      const r = [a[0] + h * t]
      for (let d = 1; d < 4; d++)
        r.push(h00 * a[d] + h10 * h * slope(i, d) + h01 * b[d] + h11 * h * slope(i + 1, d))
      r[1] = Math.max(0, r[1])
      r[2] = Math.max(0, r[2])
      out.push(r)
    }
  }
  out.push(ctrl[n - 1].slice())
  const K = 7
  if (capB) {
    const f = out[0],
      pre: number[][] = []
    for (let k = K; k >= 1; k--) {
      const th = ((k / K) * Math.PI) / 2
      pre.push([f[0] - capB * Math.sin(th), f[1] * Math.cos(th), f[2] * Math.cos(th), f[3]])
    }
    out.unshift(...pre)
  }
  if (capT) {
    const l = out[out.length - 1]
    for (let k = 1; k <= K; k++) {
      const th = ((k / K) * Math.PI) / 2
      out.push([l[0] + capT * Math.sin(th), l[1] * Math.cos(th), l[2] * Math.cos(th), l[3]])
    }
  }
  return out
}

interface Geo {
  pos: V3[]
  nrm: V3[]
  tri: number[][]
  lines: number[][]
  outline: V3[]
  rows?: number[][]
}

function loft(
  ctrl: number[][],
  { segs = 28, spacing = 0.018, n = 2.2, capB = 0, capT = 0 } = {},
): Geo {
  const rows = smoothRows(ctrl, spacing, capB, capT),
    np = rows.length,
    pos: V3[] = [],
    tri: number[][] = [],
    lines: number[][] = []
  const e = 2 / n,
    sp = (v: number) => Math.sign(v) * Math.pow(Math.abs(v), e)
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2,
      sx = sp(Math.sin(a)),
      cz = sp(Math.cos(a))
    for (let j = 0; j < np; j++) {
      const [y, w, d, z0] = rows[j]
      pos.push([w * sx, y, z0 + d * cz])
    }
  }
  const id = (i: number, j: number) => i * np + j
  for (let i = 0; i < segs; i++)
    for (let j = 0; j < np - 1; j++) {
      tri.push(
        [id(i, j), id(i + 1, j), id(i, j + 1)],
        [id(i + 1, j), id(i + 1, j + 1), id(i, j + 1)],
      )
    }
  for (let j = 0; j < np; j += 2) {
    if (rows[j][1] < 1e-4) continue
    for (let i = 0; i < segs; i++) lines.push([id(i, j), id(i + 1, j)])
  }
  for (let i = 0; i < segs; i += 2)
    for (let j = 0; j < np - 1; j++) lines.push([id(i, j), id(i, j + 1)])
  const nrm: V3[] = pos.map(() => [0, 0, 0])
  for (const [a, b, c] of tri) {
    const f = V.cross(V.sub(pos[b], pos[a]), V.sub(pos[c], pos[a]))
    for (const k of [a, b, c]) {
      nrm[k][0] += f[0]
      nrm[k][1] += f[1]
      nrm[k][2] += f[2]
    }
  }
  for (let j = 0; j < np; j++) {
    const s = V.add(nrm[id(0, j)], nrm[id(segs, j)])
    nrm[id(0, j)] = s
    nrm[id(segs, j)] = s.slice()
  }
  const fix = nrm.map((v, k) => {
    const r = rows[k % np]
    const out: V3 = [pos[k][0], 0, pos[k][2] - r[3]]
    return V.dot(v, out) < 0 ? V.mul(v, -1) : v
  })
  const outline: V3[] = [
    ...rows.map(([y, w, , z0]) => [w, y, z0]),
    ...rows
      .slice()
      .reverse()
      .map(([y, w, , z0]) => [-w, y, z0]),
  ]
  return { pos, nrm: fix.map(V.norm), tri, lines, outline, rows }
}

function ellipsoid(w: number, h: number): Geo {
  const pos: V3[] = [],
    nrm: V3[] = [],
    tri: number[][] = [],
    lines: number[][] = [],
    outline: V3[] = []
  for (let v = 0; v <= h; v++) {
    const ph = (v / h) * Math.PI,
      sp = Math.sin(ph),
      cp = Math.cos(ph)
    for (let u = 0; u <= w; u++) {
      const a = (u / w) * Math.PI * 2
      const p: V3 = [sp * Math.sin(a), cp, sp * Math.cos(a)]
      pos.push(p)
      nrm.push(p.slice())
    }
  }
  const id = (u: number, v: number) => v * (w + 1) + u
  for (let v = 0; v < h; v++)
    for (let u = 0; u < w; u++) {
      tri.push(
        [id(u, v), id(u, v + 1), id(u + 1, v)],
        [id(u + 1, v), id(u, v + 1), id(u + 1, v + 1)],
      )
    }
  for (let v = 1; v < h; v++) for (let u = 0; u < w; u++) lines.push([id(u, v), id(u + 1, v)])
  for (let u = 0; u < w; u++) for (let v = 0; v < h; v++) lines.push([id(u, v), id(u, v + 1)])
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2
    outline.push([Math.cos(a), Math.sin(a), 0])
  }
  return { pos, nrm, tri, lines, outline }
}

function hull2(pts: V3[]): V3[] {
  const p = pts.map((q) => [q[0], q[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cr = (o: V3, a: V3, b: V3) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lo: V3[] = [],
    up: V3[] = []
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop()
    lo.push(q)
  }
  for (const q of p.slice().reverse()) {
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop()
    up.push(q)
  }
  return lo.slice(0, -1).concat(up.slice(0, -1))
}

interface Part {
  id: number
  key: string
  side?: 'Left' | 'Right'
  joint?: V3
  axis?: V3
  hull?: boolean
  noOutline?: boolean
  P: (p: V3) => V3
  rows?: number[][]
  pos: V3[]
  nrm: V3[]
  tri: number[][]
  lines: number[][]
  outline: V3[]
  min: V3
  max: V3
  t0: number
  t1: number
}

type PartMeta = Pick<Part, 'side' | 'joint' | 'axis' | 'hull' | 'noOutline'>

/* ---- Body: anatomical position (standing, arms slightly abducted, palms forward) ----
   rows: [y, half-width, half-depth, z-centre]  */
const HEAD = [
  [1.545, 0.028, 0.026, 0.05],
  [1.565, 0.05, 0.06, 0.026],
  [1.6, 0.064, 0.085, 0.008],
  [1.65, 0.073, 0.097, 0],
  [1.7, 0.075, 0.099, -0.005],
  [1.735, 0.068, 0.09, -0.008],
]
const NECK = [
  [1.44, 0.064, 0.058, -0.012],
  [1.5, 0.056, 0.052, -0.008],
  [1.565, 0.05, 0.05, 0],
]
const TORSO = [
  [0.86, 0.13, 0.088, -0.005],
  [0.9, 0.165, 0.108, -0.015],
  [0.94, 0.166, 0.11, -0.016],
  [0.99, 0.153, 0.104, -0.006],
  [1.05, 0.138, 0.096, 0],
  [1.1, 0.134, 0.094, 0.002],
  [1.16, 0.148, 0.1, 0.006],
  [1.23, 0.168, 0.112, 0.012],
  [1.3, 0.183, 0.12, 0.016],
  [1.36, 0.19, 0.115, 0.01],
  [1.405, 0.186, 0.098, -0.004],
  [1.44, 0.152, 0.078, -0.01],
  [1.465, 0.1, 0.062, -0.01],
  [1.482, 0.066, 0.052, -0.01],
]
const UPPERARM = [
  [-0.3, 0.036, 0.036, 0],
  [-0.24, 0.042, 0.042, 0],
  [-0.15, 0.05, 0.05, 0],
  [-0.06, 0.054, 0.052, 0],
  [0, 0.052, 0.05, 0],
]
const FOREARM = [
  [-0.255, 0.027, 0.019, 0],
  [-0.21, 0.031, 0.022, 0],
  [-0.13, 0.04, 0.028, 0],
  [-0.06, 0.045, 0.033, 0],
  [-0.01, 0.04, 0.035, 0],
]
const HAND = [
  [-0.095, 0.039, 0.012, 0],
  [-0.06, 0.042, 0.015, 0],
  [-0.03, 0.039, 0.016, 0],
  [-0.005, 0.029, 0.016, 0],
]
const fingerRows = (L: number) => [
  [-L, 0.0072, 0.0058, 0],
  [-L * 0.5, 0.0082, 0.0068, 0],
  [0, 0.0088, 0.0074, 0],
]
const FINGERS = [
  [0.027, 0.074, 1.2],
  [0.009, 0.084, 0.3],
  [-0.009, 0.078, -0.6],
  [-0.026, 0.062, -1.8],
]
const THUMB = [
  [-0.06, 0.011, 0.01, 0],
  [-0.03, 0.013, 0.012, 0],
  [0, 0.014, 0.013, 0],
]
const THIGH = [
  [-0.4, 0.048, 0.05, 0],
  [-0.34, 0.055, 0.058, 0],
  [-0.26, 0.068, 0.07, -0.002],
  [-0.15, 0.08, 0.084, -0.005],
  [-0.05, 0.086, 0.09, -0.008],
  [0.02, 0.084, 0.088, -0.01],
]
const SHIN = [
  [-0.42, 0.025, 0.028, 0],
  [-0.36, 0.029, 0.033, -0.003],
  [-0.26, 0.042, 0.047, -0.01],
  [-0.14, 0.053, 0.058, -0.015],
  [-0.06, 0.049, 0.052, -0.006],
  [0, 0.046, 0.048, 0],
]
const FOOT = [
  [-0.215, 0.033, 0.011, 0.011],
  [-0.17, 0.045, 0.017, 0.017],
  [-0.1, 0.041, 0.026, 0.026],
  [-0.04, 0.034, 0.035, 0.035],
  [0, 0.03, 0.032, 0.032],
]

const limbRz = (a: V3, b: V3) => Math.atan2(b[0] - a[0], -(b[1] - a[1]))
const unit = (a: V3, b: V3) => V.norm(V.sub(b, a))

function buildParts(): Part[] {
  const parts: Part[] = []
  function addPart(key: string, geo: Geo, scale: V3, chain: Rig[], meta: PartMeta = {}) {
    const P = (p: V3) => {
      let v: V3 = [p[0] * scale[0], p[1] * scale[1], p[2] * scale[2]]
      for (const c of chain) v = rig(v, c)
      return v
    }
    const N = (n: V3) => {
      let v: V3 = [n[0] / scale[0], n[1] / scale[1], n[2] / scale[2]]
      for (const c of chain) v = rig(v, { rx: c.rx, ry: c.ry, rz: c.rz })
      return V.norm(v)
    }
    const pos = geo.pos.map(P)
    const min = [1e9, 1e9, 1e9],
      max = [-1e9, -1e9, -1e9]
    for (const p of pos)
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], p[k])
        max[k] = Math.max(max[k], p[k])
      }
    const outline = meta.hull ? hull2(pos) : geo.outline.map(P)
    parts.push({
      id: parts.length,
      key,
      ...meta,
      P,
      rows: geo.rows,
      pos,
      nrm: geo.nrm.map(N),
      tri: geo.tri,
      lines: geo.lines,
      outline,
      min,
      max,
      t0: 0,
      t1: 0,
    })
  }

  addPart(
    'head',
    loft(HEAD, { segs: 32, spacing: 0.014, n: 2.1, capB: 0.012, capT: 0.05 }),
    [1, 1, 1],
    [],
  )
  addPart('neck', loft(NECK, { segs: 24, n: 2.1 }), [1, 1, 1], [])
  addPart(
    'torso',
    loft(TORSO, { segs: 40, spacing: 0.016, n: 2.6, capB: 0.03, capT: 0.01 }),
    [1, 1, 1],
    [],
  )
  addPart('nose', ellipsoid(10, 8), [0.011, 0.022, 0.012], [{ t: [0, 1.632, 0.098] }], {
    noOutline: true,
  })
  for (const sx of [1, -1]) {
    const side = sx > 0 ? 'Left' : 'Right'
    const ARM_UP = 83 * DEG,
      FORE_UP = 85 * DEG
    const sh: V3 = [sx * 0.198, 1.41, -0.004]
    const eb: V3 = [sh[0] + sx * 0.3 * Math.sin(ARM_UP), sh[1] - 0.3 * Math.cos(ARM_UP), -0.006]
    const wr: V3 = [eb[0] + sx * 0.255 * Math.sin(FORE_UP), eb[1] - 0.255 * Math.cos(FORE_UP), 0.0]
    const rzU = limbRz(sh, eb),
      rzF = limbRz(eb, wr)
    addPart(
      'upperarm',
      loft(UPPERARM, { segs: 24, capB: 0.022, capT: 0.03 }),
      [1, 1, 1],
      [{ rz: rzU, t: sh }],
      { side, joint: sh, axis: unit(sh, eb) },
    )
    addPart(
      'forearm',
      loft(FOREARM, { segs: 24, capB: 0.012, capT: 0.025 }),
      [1, 1, 1],
      [{ rz: rzF, t: eb }],
      { side, joint: eb, axis: unit(eb, wr) },
    )
    addPart(
      'hand',
      loft(HAND, { segs: 20, spacing: 0.012, n: 2.4, capB: 0.01, capT: 0.006 }),
      [1, 1, 1],
      [{ rz: rzF, t: wr }],
      { side },
    )
    for (const [fx, fl, fa] of FINGERS)
      addPart(
        'finger',
        loft(fingerRows(fl), { segs: 10, spacing: 0.01, n: 2, capB: 0.007, capT: 0.006 }),
        [1, 1, 1],
        [
          { rz: sx * fa * DEG, t: [sx * fx, -0.096, 0.001] },
          { rz: rzF, t: wr },
        ],
        { side },
      )
    const tb: V3 = [sx * 0.03, -0.03, 0.008],
      tt: V3 = [sx * 0.05, -0.088, 0.012]
    addPart(
      'thumb',
      loft(THUMB, { segs: 14, spacing: 0.01, capB: 0.011, capT: 0.01 }),
      [1, 1, 1],
      [
        { rz: limbRz(tb, tt), t: tb },
        { rz: rzF, t: wr },
      ],
      { side },
    )
    addPart(
      'shoulder',
      ellipsoid(20, 12),
      [0.058, 0.06, 0.056],
      [{ t: [sx * 0.2, 1.405, -0.006] }],
      { side, noOutline: true },
    )
    const hp: V3 = [sx * 0.082, 0.905, -0.004],
      kn: V3 = [sx * 0.118, 0.49, 0.0],
      an: V3 = [sx * 0.152, 0.075, -0.012]
    addPart(
      'thigh',
      loft(THIGH, { segs: 28, capB: 0.025, capT: 0.03 }),
      [1, 1, 1],
      [{ rz: limbRz(hp, kn), t: hp }],
      { side, joint: hp, axis: unit(hp, kn) },
    )
    addPart(
      'shin',
      loft(SHIN, { segs: 26, capB: 0.022, capT: 0.02 }),
      [1, 1, 1],
      [{ rz: limbRz(kn, an), t: kn }],
      { side, joint: kn, axis: unit(kn, an) },
    )
    addPart(
      'foot',
      loft(FOOT, { segs: 22, spacing: 0.014, n: 2.4, capB: 0.03, capT: 0.022 }),
      [1, 1, 1],
      [{ rx: -90 * DEG, ry: sx * 0.12, t: [an[0], 0, -0.03] }],
      { side, hull: true },
    )
    addPart('ear', ellipsoid(12, 8), [0.011, 0.03, 0.018], [{ t: [sx * 0.074, 1.648, -0.008] }], {
      side,
    })
    addPart(
      'eye',
      ellipsoid(12, 8),
      [0.016, 0.0085, 0.006],
      [{ ry: sx * 0.35, t: [sx * 0.032, 1.66, 0.088] }],
      { side, noOutline: true },
    )
  }
  return parts
}

function regionOf(part: Part, p: V3): string {
  const front = p[2] >= 0,
    side = part.side,
    S = (n: string) => (side ? `${side} ${n}` : cap(n))
  const along = () => V.dot(V.sub(p, part.joint!), part.axis!)
  switch (part.key) {
    case 'eye':
      return `${side} eye`
    case 'ear':
      return `${side} ear`
    case 'nose':
      return 'Face'
    case 'head':
      return p[1] > 1.72 ? 'Head' : front ? 'Face' : 'Back of head'
    case 'neck':
      return front ? 'Neck' : 'Back of neck'
    case 'shoulder':
      return S('shoulder')
    case 'torso': {
      const y = p[1],
        ax = Math.abs(p[0]),
        sd = p[0] >= 0 ? 'Left' : 'Right'
      let n: string
      if (y > 1.4) n = ax > 0.14 ? 'shoulder' : front ? 'upper chest' : 'upper back'
      else if (y > 1.2) n = front ? 'chest' : 'upper back'
      else if (y > 1.06) n = front ? 'upper abdomen' : 'mid back'
      else if (y > 0.94) n = front ? 'lower abdomen' : 'lower back'
      else n = front ? 'pelvis' : ax > 0.03 ? 'buttock' : 'tailbone'
      return n === 'tailbone' ? 'Tailbone' : `${sd} ${n}`
    }
    case 'upperarm': {
      const t = along()
      return S(t > 0.27 ? (front ? 'inner elbow' : 'elbow') : t < 0.07 ? 'shoulder' : 'upper arm')
    }
    case 'forearm':
      return S(along() > 0.215 ? 'wrist' : 'forearm')
    case 'hand':
    case 'thumb':
    case 'finger':
      return S(front ? 'palm' : 'back of hand')
    case 'thigh': {
      const t = along()
      return S(
        t > 0.33
          ? front
            ? 'knee'
            : 'back of knee'
          : front
            ? 'thigh'
            : t < 0.1
              ? 'buttock'
              : 'back of thigh',
      )
    }
    case 'shin': {
      const t = along()
      return S(t > 0.355 ? 'ankle' : front ? 'shin' : 'calf')
    }
    case 'foot':
      return S('foot')
  }
  return 'Body'
}

/* ------------------------------ 2D REGIONS ------------------------------ */

const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`

interface Organ {
  id: string
  name: string
  d: string
  a: V3
}
const ORGANS: Organ[] = [
  { id: 'brain', name: 'Brain', d: ell(0, 1.72, 0.068, 0.044), a: [0, 1.72] },
  { id: 'eyeR', name: 'Right eye', d: ell(-0.032, 1.66, 0.0165, 0.0085), a: [-0.032, 1.66] },
  { id: 'eyeL', name: 'Left eye', d: ell(0.032, 1.66, 0.0165, 0.0085), a: [0.032, 1.66] },
  {
    id: 'lungR',
    name: 'Right lung',
    d: 'M-0.022 1.385C-0.06 1.405-0.118 1.37-0.135 1.29C-0.146 1.23-0.142 1.185-0.125 1.172C-0.095 1.172-0.055 1.18-0.028 1.195C-0.02 1.25-0.018 1.32-0.022 1.385Z',
    a: [-0.09, 1.28],
  },
  {
    id: 'lungL',
    name: 'Left lung',
    d: 'M0.022 1.385C0.06 1.405 0.118 1.37 0.135 1.29C0.146 1.23 0.142 1.185 0.125 1.172C0.105 1.172 0.09 1.175 0.08 1.185C0.07 1.215 0.05 1.25 0.032 1.262C0.024 1.3 0.02 1.34 0.022 1.385Z',
    a: [0.1, 1.3],
  },
  {
    id: 'heart',
    name: 'Heart',
    d: 'M0.005 1.29C0.03 1.305 0.075 1.285 0.074 1.24C0.073 1.205 0.045 1.185 0.02 1.175C0 1.19-0.026 1.21-0.024 1.242C-0.022 1.272-0.01 1.287 0.005 1.29Z',
    a: [0.035, 1.235],
  },
  {
    id: 'liver',
    name: 'Liver',
    d: 'M-0.142 1.16C-0.1 1.168-0.03 1.166 0.03 1.152C0.015 1.125-0.04 1.095-0.115 1.08C-0.138 1.092-0.148 1.13-0.142 1.16Z',
    a: [-0.08, 1.13],
  },
  {
    id: 'stomach',
    name: 'Stomach',
    d: 'M0.045 1.15C0.075 1.17 0.12 1.16 0.128 1.125C0.134 1.09 0.105 1.075 0.07 1.08C0.048 1.084 0.042 1.098 0.056 1.106C0.074 1.112 0.08 1.128 0.045 1.15Z',
    a: [0.1, 1.125],
  },
  {
    id: 'kidneyR',
    name: 'Right kidney',
    d: 'M-0.09 1.06C-0.115 1.07-0.128 1.04-0.124 1.02C-0.12 1.0-0.1 0.998-0.09 1.012C-0.096 1.025-0.096 1.045-0.09 1.06Z',
    a: [-0.11, 1.035],
  },
  {
    id: 'kidneyL',
    name: 'Left kidney',
    d: 'M0.09 1.06C0.115 1.07 0.128 1.04 0.124 1.02C0.12 1.0 0.1 0.998 0.09 1.012C0.096 1.025 0.096 1.045 0.09 1.06Z',
    a: [0.11, 1.035],
  },
  {
    id: 'intestines',
    name: 'Intestines',
    d: 'M-0.078 0.95Q-0.078 0.935-0.063 0.935L0.063 0.935Q0.078 0.935 0.078 0.95L0.078 1.047Q0.078 1.062 0.063 1.062L-0.063 1.062Q-0.078 1.062-0.078 1.047Z',
    a: [0, 1.0],
  },
  { id: 'bladder', name: 'Bladder', d: ell(0, 0.905, 0.03, 0.02), a: [0, 0.905] },
]

function rowAt(rows: number[][], y: number) {
  if (y <= rows[0][0]) return rows[0]
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i],
      b = rows[i + 1]
    if (y <= b[0]) {
      const f = (y - a[0]) / (b[0] - a[0] || 1)
      return a.map((v, k) => v + (b[k] - v) * f)
    }
  }
  return rows[rows.length - 1]
}
function slicePoly(pt: Part, ya: number, yb: number, half?: 'L' | 'R'): V3[] {
  const rows = pt.rows!
  ya = Math.max(ya, rows[0][0])
  yb = Math.min(yb, rows[rows.length - 1][0])
  const ys = [ya, ...rows.map((r) => r[0]).filter((y) => y > ya && y < yb), yb]
  const E = ys.map((y) => {
    const r = rowAt(rows, y)
    return [r[1], y, r[3]]
  })
  let loc: V3[]
  if (half === 'L') loc = [...E, [0, yb, 0], [0, ya, 0]]
  else if (half === 'R') loc = [...E.map((p) => [-p[0], p[1], p[2]]), [0, yb, 0], [0, ya, 0]]
  else
    loc = [
      ...E,
      ...E.slice()
        .reverse()
        .map((p) => [-p[0], p[1], p[2]]),
    ]
  return loc.map((p) => {
    const w = pt.P(p)
    return [w[0], w[1]]
  })
}
const SLICES: Record<string, [string, string, number, number][]> = {
  torso: [
    ['upperchest', 'upper chest', 1.4, 9],
    ['chest', 'chest', 1.2, 1.4],
    ['upperabd', 'upper abdomen', 1.06, 1.2],
    ['lowerabd', 'lower abdomen', 0.94, 1.06],
    ['pelvis', 'pelvis', -9, 0.94],
  ],
  neck: [['neck', 'neck', 1.462, 9]],
  head: [
    ['face', 'face', -9, 1.72],
    ['head', 'head', 1.72, 9],
  ],
  upperarm: [
    ['elbow', 'elbow', -9, -0.27],
    ['upperarm', 'upper arm', -0.27, -0.07],
    ['shoulder', 'shoulder', -0.07, 9],
  ],
  forearm: [
    ['wrist', 'wrist', -9, -0.215],
    ['forearm', 'forearm', -0.215, 9],
  ],
  thigh: [
    ['knee', 'knee', -9, -0.33],
    ['thigh', 'thigh', -0.33, 9],
  ],
  shin: [
    ['ankle', 'ankle', -9, -0.355],
    ['shin', 'shin', -0.355, 9],
  ],
}
const WHOLE: Record<string, [string, string]> = {
  hand: ['palm', 'palm'],
  thumb: ['palm', 'palm'],
  finger: ['palm', 'palm'],
  foot: ['foot', 'foot'],
  ear: ['ear', 'ear'],
}
const DRAW_ORDER = [
  'foot',
  'shin',
  'thigh',
  'torso',
  'neck',
  'ear',
  'head',
  'finger',
  'thumb',
  'hand',
  'forearm',
  'upperarm',
]
const BACKNAME: Record<string, string> = {
  'upper chest': 'upper back',
  chest: 'shoulder blade',
  'upper abdomen': 'mid back',
  'lower abdomen': 'lower back',
  pelvis: 'buttock',
  neck: 'back of neck',
  face: 'back of head',
  knee: 'back of knee',
  thigh: 'back of thigh',
  shin: 'calf',
  palm: 'back of hand',
  foot: 'heel',
}

interface Zone {
  id: string
  name: string
  face: BodyFace
  polys: V3[][]
  a: V3
}

/* ------------------------------ MODEL (built once) ------------------------------ */

interface Hit {
  t: number
  p: V3
  n: V3
  part: Part
  region: string
}
interface Model {
  parts: Part[]
  zones: Zone[]
  raycast: (o: V3, d: V3) => Hit | null
}

let model: Model | undefined

function getModel(): Model {
  if (model) return model
  const parts = buildParts()

  const RT: number[] = [],
    RP: number[] = []
  for (const pt of parts) {
    pt.t0 = RP.length
    for (const [a, b, c] of pt.tri) {
      RT.push(...pt.pos[a], ...pt.pos[b], ...pt.pos[c])
      RP.push(pt.id)
    }
    pt.t1 = RP.length
  }
  const RTA = new Float32Array(RT)
  const rayBox = (o: V3, d: V3, mn: V3, mx: V3) => {
    let t0 = 0,
      t1 = 1e9
    for (let k = 0; k < 3; k++) {
      const inv = 1 / (d[k] || 1e-12)
      let a = (mn[k] - o[k]) * inv,
        b = (mx[k] - o[k]) * inv
      if (a > b) [a, b] = [b, a]
      t0 = Math.max(t0, a)
      t1 = Math.min(t1, b)
      if (t1 < t0) return false
    }
    return true
  }
  const raycast = (o: V3, d: V3): Hit | null => {
    let best = Infinity,
      bi = -1
    const [ox, oy, oz] = o,
      [dx, dy, dz] = d
    for (const pt of parts) {
      if (!rayBox(o, d, pt.min, pt.max)) continue
      for (let k = pt.t0; k < pt.t1; k++) {
        const b = k * 9
        const ax = RTA[b],
          ay = RTA[b + 1],
          az = RTA[b + 2]
        const e1x = RTA[b + 3] - ax,
          e1y = RTA[b + 4] - ay,
          e1z = RTA[b + 5] - az
        const e2x = RTA[b + 6] - ax,
          e2y = RTA[b + 7] - ay,
          e2z = RTA[b + 8] - az
        const px = dy * e2z - dz * e2y,
          py = dz * e2x - dx * e2z,
          pz = dx * e2y - dy * e2x
        const det = e1x * px + e1y * py + e1z * pz
        if (det > -1e-12 && det < 1e-12) continue
        const inv = 1 / det,
          tx = ox - ax,
          ty = oy - ay,
          tz = oz - az
        const u = (tx * px + ty * py + tz * pz) * inv
        if (u < 0 || u > 1) continue
        const qx = ty * e1z - tz * e1y,
          qy = tz * e1x - tx * e1z,
          qz = tx * e1y - ty * e1x
        const v = (dx * qx + dy * qy + dz * qz) * inv
        if (v < 0 || u + v > 1) continue
        const t = (e2x * qx + e2y * qy + e2z * qz) * inv
        if (t > 1e-5 && t < best) {
          best = t
          bi = k
        }
      }
    }
    if (bi < 0) return null
    const b = bi * 9
    const e1: V3 = [RTA[b + 3] - RTA[b], RTA[b + 4] - RTA[b + 1], RTA[b + 5] - RTA[b + 2]],
      e2: V3 = [RTA[b + 6] - RTA[b], RTA[b + 7] - RTA[b + 1], RTA[b + 8] - RTA[b + 2]]
    let n = V.norm(V.cross(e1, e2))
    if (V.dot(n, d) > 0) n = V.mul(n, -1)
    const p = V.add(o, V.mul(d, best)),
      part = parts[RP[bi]]
    return { t: best, p, n, part, region: regionOf(part, p) }
  }

  const zones: Zone[] = []
  const zoneById = new Map<string, Zone>()
  const addZone = (id: string, name: string, poly: V3[], face: BodyFace) => {
    let z = zoneById.get(id)
    if (!z) {
      let sx = 0,
        sy = 0
      poly.forEach((p) => {
        sx += p[0]
        sy += p[1]
      })
      z = { id, name, face, polys: [], a: [sx / poly.length, sy / poly.length] }
      zoneById.set(id, z)
      zones.push(z)
    }
    z.polys.push(poly)
  }
  for (const face of ['front', 'back'] as const)
    for (const key of DRAW_ORDER)
      for (const pt of parts.filter((p) => p.key === key)) {
        const fp = face === 'back' ? 'b-' : ''
        const sd = fp + (pt.side ? pt.side.toLowerCase() + '-' : '')
        const fn = (n: string) => (face === 'back' && BACKNAME[n] ? BACKNAME[n] : n)
        const nm = (n: string) => (pt.side ? `${pt.side} ${fn(n)}` : cap(fn(n)))
        if (SLICES[key]) {
          for (const [id, n, ya, yb] of SLICES[key]) {
            if (key === 'torso') {
              addZone(fp + 'left-' + id, 'Left ' + fn(n), slicePoly(pt, ya, yb, 'L'), face)
              addZone(fp + 'right-' + id, 'Right ' + fn(n), slicePoly(pt, ya, yb, 'R'), face)
            } else addZone(sd + id, nm(n), slicePoly(pt, ya, yb), face)
          }
        } else if (WHOLE[key]) {
          const [id, n] = WHOLE[key]
          addZone(
            sd + id,
            nm(n),
            pt.outline.map((p) => [p[0], p[1]]),
            face,
          )
        }
      }

  model = { parts, zones, raycast }
  return model
}

/** Names of every 2D region and organ (for tests and text alternatives). */
export function regionNames(face: BodyFace): string[] {
  const m = getModel()
  return [
    ...m.zones.filter((z) => z.face === face).map((z) => z.name),
    ...(face === 'front' ? ORGANS.map((o) => o.name) : []),
  ]
}

/* ------------------------------ THEME ------------------------------ */

/** Resolves a CSS colour (including oklch) to linear-ish sRGB 0–1 via a 1×1 canvas. */
function cssColorToRgb(css: string, fallback: V3): V3 {
  try {
    const c = document.createElement('canvas')
    c.width = c.height = 1
    const ctx = c.getContext('2d')
    if (!ctx) return fallback
    ctx.fillStyle = '#000'
    ctx.fillStyle = css
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return [r / 255, g / 255, b / 255]
  } catch {
    return fallback
  }
}

/* ------------------------------ CONTROLLER ------------------------------ */

const NS = 'http://www.w3.org/2000/svg'
let instances = 0

export function createBodyMap(
  els: BodyMapElements,
  onPick: (info: PickInfo) => void,
): BodyMapController {
  const { stage, canvas, overlay: ov, svg2d: svg2, tip, readoutLeft: roL, readoutRight: roR } = els
  const { parts, zones, raycast } = getModel()
  const clipId = `bodymap-clip-${++instances}`
  const reduceMotion =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const raf: (cb: FrameRequestCallback) => number =
    typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (cb) => window.setTimeout(() => cb(performance.now()), 16)
  const caf: (id: number) => void =
    typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : (id) => clearTimeout(id)

  const el = (tag: string, attrs: Record<string, string | number> = {}, parent?: Element) => {
    const e = document.createElementNS(NS, tag)
    for (const k in attrs) e.setAttribute(k, String(attrs[k]))
    if (parent) parent.appendChild(e)
    return e
  }

  let mode: BodyMapMode = '3d'
  let marks: Mark[] = []
  let hlId: string | null = null
  let destroyed = false
  const cleanups: (() => void)[] = []
  const on = <K extends keyof HTMLElementEventMap>(
    target: EventTarget,
    type: K | string,
    fn: (e: never) => void,
    opts?: AddEventListenerOptions,
  ) => {
    target.addEventListener(type, fn as EventListener, opts)
    cleanups.push(() => target.removeEventListener(type, fn as EventListener, opts))
  }

  /* ---------- 3D renderer ---------- */
  const gl = (() => {
    try {
      return canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true })
    } catch {
      return null
    }
  })()
  const cam = { theta: 0.35, phi: 86 * DEG, r: 3.6, target: [0, 0.9, 0] as V3, fov: 30 * DEG }
  let W = 1,
    H = 1,
    dirty = true,
    ovDirty = true,
    hoverPart = -1
  let anim: {
    from: { theta: number; phi: number; r: number; target: V3 }
    to: { theta: number; phi: number; r: number; target: V3 }
    t0: number
    dur: number
  } | null = null
  let vel = { t: 0, p: 0 }
  let eye: V3 = [0, 0, 0],
    fwd: V3 = [0, 0, -1],
    rgt: V3 = [1, 0, 0],
    up: V3 = [0, 1, 0]
  let fg: V3 = [1, 1, 1],
    bg: V3 = [0, 0, 0]

  function computeCam() {
    const sp = Math.sin(cam.phi)
    const off: V3 = [
      cam.r * sp * Math.sin(cam.theta),
      cam.r * Math.cos(cam.phi),
      cam.r * sp * Math.cos(cam.theta),
    ]
    eye = V.add(cam.target, off)
    fwd = V.norm(V.mul(off, -1))
    rgt = V.norm(V.cross(fwd, [0, 1, 0]))
    up = V.cross(rgt, fwd)
  }
  function project(p: V3): V3 {
    const d = V.sub(p, eye),
      z = V.dot(d, fwd),
      th = Math.tan(cam.fov / 2),
      asp = W / H
    return [
      ((V.dot(d, rgt) / (z * th * asp) + 1) / 2) * W,
      ((1 - V.dot(d, up) / (z * th)) / 2) * H,
      z,
    ]
  }
  function rayFromScreen(x: number, y: number): V3 {
    const th = Math.tan(cam.fov / 2),
      nx = (x / W) * 2 - 1,
      ny = 1 - (y / H) * 2
    return V.norm(V.add(fwd, V.add(V.mul(rgt, (nx * th * W) / H), V.mul(up, ny * th))))
  }
  function fitR() {
    const th = Math.tan(cam.fov / 2)
    return Math.max(0.98 / th, 1.08 / (th * (W / H))) * 1.06
  }

  let prog: WebGLProgram, lprog: WebGLProgram
  let bufs: Record<string, WebGLBuffer> = {}
  let triCount = 0,
    lineCount = 0
  function initGL(): boolean {
    if (!gl) return false
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(s) ?? '')
      return s
    }
    const mk = (vs: string, fs: string) => {
      const p = gl.createProgram()!
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs))
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs))
      gl.linkProgram(p)
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? '')
      return p
    }
    // Surface: a dark-to-light rim (fresnel) mixed between the theme's background and foreground.
    prog = mk(
      `attribute vec3 aP;attribute vec3 aN;attribute float aId;uniform mat4 uVP;uniform vec3 uEye;uniform float uHover;
    varying vec3 vN;varying vec3 vV;varying float vH;
    void main(){vN=aN;vV=uEye-aP;vH=abs(aId-uHover)<0.5?1.0:0.0;gl_Position=uVP*vec4(aP,1.0);}`,
      `precision mediump float;varying vec3 vN;varying vec3 vV;varying float vH;uniform vec3 uFg;uniform vec3 uBg;
    void main(){vec3 n=normalize(vN),v=normalize(vV);float f=1.0-abs(dot(n,v));
      float c=0.025+pow(f,2.3)*(0.5+0.35*vH)+0.06*vH;gl_FragColor=vec4(mix(uBg,uFg,c),1.0);}`,
    )
    lprog = mk(
      `attribute vec3 aP;attribute float aId;uniform mat4 uVP;uniform float uHover;varying float vA;
    void main(){vA=aId<-0.5?0.22:(abs(aId-uHover)<0.5?0.85:0.3);gl_Position=uVP*vec4(aP,1.0);}`,
      `precision mediump float;varying float vA;uniform vec3 uFg;void main(){gl_FragColor=vec4(uFg*vA,vA);}`,
    )
    const tp: number[] = [],
      tn: number[] = [],
      ti: number[] = [],
      lp: number[] = [],
      li: number[] = []
    for (const pt of parts) {
      for (const tr of pt.tri)
        for (const k of tr) {
          tp.push(...pt.pos[k])
          tn.push(...pt.nrm[k])
          ti.push(pt.id)
        }
      for (const [a, b] of pt.lines) {
        lp.push(...pt.pos[a], ...pt.pos[b])
        li.push(pt.id, pt.id)
      }
    }
    const ring = (r: number, n: number, dash?: boolean) => {
      for (let i = 0; i < n; i++) {
        if (dash && i % 2) continue
        const a = (i / n) * Math.PI * 2,
          b = ((i + 1) / n) * Math.PI * 2
        lp.push(r * Math.sin(a), 0.001, r * Math.cos(a), r * Math.sin(b), 0.001, r * Math.cos(b))
        li.push(-1, -1)
      }
    }
    ring(0.3, 96)
    ring(0.34, 96)
    ring(0.42, 120, true)
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2,
        r2 = i % 6 ? 0.365 : 0.385
      lp.push(
        0.34 * Math.sin(a),
        0.001,
        0.34 * Math.cos(a),
        r2 * Math.sin(a),
        0.001,
        r2 * Math.cos(a),
      )
      li.push(-1, -1)
    }
    const buf = (d: number[]) => {
      const b = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, b)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(d), gl.STATIC_DRAW)
      return b
    }
    bufs = { tp: buf(tp), tn: buf(tn), ti: buf(ti), lp: buf(lp), li: buf(li) }
    triCount = tp.length / 3
    lineCount = lp.length / 3
    return true
  }
  function bindAttr(p: WebGLProgram, name: string, b: WebGLBuffer, size: number) {
    if (!gl) return
    const loc = gl.getAttribLocation(p, name)
    if (loc < 0) return
    gl.bindBuffer(gl.ARRAY_BUFFER, b)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
  }
  function mat4VP() {
    const f = 1 / Math.tan(cam.fov / 2),
      asp = W / H,
      n = 0.02,
      fa = 30
    const P = [
      f / asp,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (fa + n) / (n - fa),
      -1,
      0,
      0,
      (2 * fa * n) / (n - fa),
      0,
    ]
    const z = V.mul(fwd, -1),
      x = rgt,
      y = up
    const Vw = [
      x[0],
      y[0],
      z[0],
      0,
      x[1],
      y[1],
      z[1],
      0,
      x[2],
      y[2],
      z[2],
      0,
      -V.dot(x, eye),
      -V.dot(y, eye),
      -V.dot(z, eye),
      1,
    ]
    const o = new Float32Array(16)
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 4; r++) {
        let s = 0
        for (let k = 0; k < 4; k++) s += P[k * 4 + r] * Vw[c * 4 + k]
        o[c * 4 + r] = s
      }
    return o
  }
  function render() {
    if (!gl) return
    const vp = mat4VP()
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.depthMask(true)
    gl.disable(gl.BLEND)
    gl.enable(gl.POLYGON_OFFSET_FILL)
    gl.polygonOffset(1.5, 1.5)
    gl.useProgram(prog)
    bindAttr(prog, 'aP', bufs.tp, 3)
    bindAttr(prog, 'aN', bufs.tn, 3)
    bindAttr(prog, 'aId', bufs.ti, 1)
    gl.uniformMatrix4fv(gl.getUniformLocation(prog, 'uVP'), false, vp)
    gl.uniform3fv(gl.getUniformLocation(prog, 'uEye'), eye)
    gl.uniform3fv(gl.getUniformLocation(prog, 'uFg'), fg)
    gl.uniform3fv(gl.getUniformLocation(prog, 'uBg'), bg)
    gl.uniform1f(gl.getUniformLocation(prog, 'uHover'), hoverPart)
    gl.drawArrays(gl.TRIANGLES, 0, triCount)
    gl.disable(gl.POLYGON_OFFSET_FILL)
    for (let i = 0; i < 8; i++) gl.disableVertexAttribArray(i)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.depthMask(false)
    gl.useProgram(lprog)
    bindAttr(lprog, 'aP', bufs.lp, 3)
    bindAttr(lprog, 'aId', bufs.li, 1)
    gl.uniformMatrix4fv(gl.getUniformLocation(lprog, 'uVP'), false, vp)
    gl.uniform3fv(gl.getUniformLocation(lprog, 'uFg'), fg)
    gl.uniform1f(gl.getUniformLocation(lprog, 'uHover'), hoverPart)
    gl.drawArrays(gl.LINES, 0, lineCount)
    gl.depthMask(true)
    for (let i = 0; i < 8; i++) gl.disableVertexAttribArray(i)
  }

  function pulse(circle: Element, from: number, to: number) {
    if (reduceMotion) return
    el(
      'animate',
      { attributeName: 'r', values: `${from};${to}`, dur: '1.8s', repeatCount: 'indefinite' },
      circle,
    )
    el(
      'animate',
      { attributeName: 'opacity', values: '.8;0', dur: '1.8s', repeatCount: 'indefinite' },
      circle,
    )
  }

  /* 3D markers (SVG overlay, oriented to the surface) */
  function drawOverlay() {
    ov.setAttribute('viewBox', `0 0 ${W} ${H}`)
    ov.textContent = ''
    for (const e of marks) {
      const p = e.p,
        n = e.n,
        s0 = project(p)
      if (s0[2] <= 0.05) continue
      const t1 = V.norm(V.cross(n, Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])),
        t2 = V.cross(n, t1)
      const r = 0.012 + e.intensity * 0.0022
      const s1 = project(V.add(p, V.mul(t1, r))),
        s2 = project(V.add(p, V.mul(t2, r)))
      const toEye = V.norm(V.sub(eye, p))
      let occ = V.dot(n, toEye) < 0.02
      if (!occ) {
        const dist = V.len(V.sub(p, eye))
        const h = raycast(eye, V.norm(V.sub(p, eye)))
        if (h && h.t < dist - 0.01) occ = true
      }
      const g = el(
        'g',
        {
          class:
            'm3' +
            (occ ? ' occ' : '') +
            (e.pending ? ' pending' : '') +
            (e.id === hlId ? ' hl' : ''),
        },
        ov,
      )
      const m = `matrix(${s1[0] - s0[0]} ${s1[1] - s0[1]} ${s2[0] - s0[0]} ${s2[1] - s0[1]} ${s0[0]} ${s0[1]})`
      const gg = el('g', { transform: m }, g)
      el('circle', { r: 1, class: 'ring' }, gg)
      const pc = el('circle', { r: 1, class: 'pulse' }, gg)
      if (!occ) pulse(pc, 1, 2.1)
      else pc.setAttribute('opacity', '0')
      el('circle', { cx: s0[0], cy: s0[1], r: 2.4, class: 'dot' }, g)
      const lb = el('g', { class: 'lbl', transform: `translate(${s0[0] + 16} ${s0[1] - 18})` }, g)
      el('line', { x1: -16, y1: 18, x2: -1, y2: 4 }, lb)
      el('rect', { x: -1, y: -8, width: 22, height: 14 }, lb)
      const tx = el('text', { x: 10, y: 2.6, 'text-anchor': 'middle' }, lb)
      tx.textContent = pad(e.num)
    }
  }

  /* ---------- 3D interaction ---------- */
  const ptrs = new Map<number, { x: number; y: number }>()
  let down: { x: number; y: number; t: number; btn: number; shift: boolean; moved: number } | null =
    null
  let hoverAt: V3 | null = null,
    needHover = false,
    roHover = '—'
  const stagePt = (e: { clientX: number; clientY: number }): V3 => {
    const r = stage.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }
  function clampTarget() {
    cam.target = [
      clamp(cam.target[0], -1, 1),
      clamp(cam.target[1], 0, 1.85),
      clamp(cam.target[2], -0.6, 0.6),
    ]
  }
  function zoomBy(f: number, sx?: number, sy?: number) {
    const nr = clamp(cam.r * f, 0.45, 8)
    if (sx != null && sy != null) {
      const d = rayFromScreen(sx, sy),
        den = V.dot(d, fwd)
      if (den > 1e-4) {
        const t = V.dot(V.sub(cam.target, eye), fwd) / den
        const pt = V.add(eye, V.mul(d, t))
        cam.target = V.add(cam.target, V.mul(V.sub(pt, cam.target), 1 - nr / cam.r))
      }
    }
    cam.r = nr
    clampTarget()
    dirty = true
  }
  function panBy(dx: number, dy: number) {
    const k = (2 * cam.r * Math.tan(cam.fov / 2)) / H
    cam.target = V.add(cam.target, V.add(V.mul(rgt, -dx * k), V.mul(up, dy * k)))
    clampTarget()
    dirty = true
  }
  function setTip(text: string | null, at?: V3 | null) {
    if (!text || !at) {
      tip.classList.remove('on')
      return
    }
    tip.textContent = text.toUpperCase()
    tip.style.left = at[0] + 'px'
    tip.style.top = at[1] + 'px'
    tip.classList.add('on')
  }

  on(canvas, 'contextmenu', (e: MouseEvent) => e.preventDefault())
  on(canvas, 'pointerdown', (e: PointerEvent) => {
    canvas.setPointerCapture?.(e.pointerId)
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (ptrs.size === 1)
      down = {
        x: e.clientX,
        y: e.clientY,
        t: performance.now(),
        btn: e.button,
        shift: e.shiftKey,
        moved: 0,
      }
    else if (down) down.moved = 99
    anim = null
    vel = { t: 0, p: 0 }
  })
  on(canvas, 'pointermove', (e: PointerEvent) => {
    hoverAt = stagePt(e)
    const prev = ptrs.get(e.pointerId)
    if (!prev) {
      needHover = true
      return
    }
    const dx = e.clientX - prev.x,
      dy = e.clientY - prev.y
    if (ptrs.size === 1 && down) {
      down.moved += Math.abs(dx) + Math.abs(dy)
      if (down.moved > 4) {
        canvas.classList.add('grab')
        setTip(null)
      }
      if (down.btn === 2 || down.btn === 1 || down.shift) panBy(dx, dy)
      else {
        const vt = -dx * 0.008,
          vp = -dy * 0.008
        cam.theta += vt
        cam.phi = clamp(cam.phi + vp, 0.12, Math.PI - 0.12)
        vel = { t: vt, p: vp }
        dirty = true
      }
    } else if (ptrs.size === 2) {
      const o = [...ptrs.entries()].find(([id]) => id !== e.pointerId)![1]
      const d0 = Math.hypot(prev.x - o.x, prev.y - o.y),
        d1 = Math.hypot(e.clientX - o.x, e.clientY - o.y)
      if (d0 > 0 && d1 > 0) zoomBy(d0 / d1)
      panBy(dx / 2, dy / 2)
    }
    prev.x = e.clientX
    prev.y = e.clientY
  })
  const endPtr = (e: PointerEvent) => {
    ptrs.delete(e.pointerId)
    canvas.classList.remove('grab')
    if (ptrs.size === 0 && down) {
      if (down.moved < 6 && performance.now() - down.t < 700 && down.btn === 0 && !down.shift) {
        vel = { t: 0, p: 0 }
        const sp = stagePt(e)
        const h = raycast(eye, rayFromScreen(sp[0], sp[1]))
        if (h) onPick({ region: h.region, organ: null, zone: null, p: h.p, n: h.n, view: '3D' })
      }
      down = null
    }
  }
  on(canvas, 'pointerup', endPtr)
  on(canvas, 'pointercancel', endPtr)
  on(canvas, 'pointerleave', () => {
    if (!ptrs.size) {
      hoverAt = null
      needHover = true
    }
  })
  on(
    canvas,
    'wheel',
    (e: WheelEvent) => {
      e.preventDefault()
      const sp = stagePt(e)
      zoomBy(Math.exp(e.deltaY * 0.0012), sp[0], sp[1])
    },
    { passive: false },
  )

  function updateHover3D() {
    needHover = false
    const h = hoverAt && !ptrs.size ? raycast(eye, rayFromScreen(hoverAt[0], hoverAt[1])) : null
    const id = h ? h.part.id : -1
    if (id !== hoverPart) {
      hoverPart = id
      dirty = true
    }
    setTip(h ? h.region : null, hoverAt)
    roHover = h ? h.region : '—'
  }

  function animateTo(to: { theta: number; phi: number; r: number; target: V3 }, dur = 750) {
    const from = { theta: cam.theta, phi: cam.phi, r: cam.r, target: cam.target.slice() }
    const dt = ((((to.theta - from.theta) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI
    anim = {
      from,
      to: { theta: from.theta + dt, phi: to.phi, r: to.r, target: to.target },
      t0: performance.now(),
      dur: reduceMotion ? 1 : dur,
    }
    vel = { t: 0, p: 0 }
  }
  function stepAnim(now: number) {
    if (!anim) return
    const k = clamp((now - anim.t0) / anim.dur, 0, 1)
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
    const { from: a, to: b } = anim
    cam.theta = a.theta + (b.theta - a.theta) * e
    cam.phi = a.phi + (b.phi - a.phi) * e
    cam.r = a.r + (b.r - a.r) * e
    cam.target = a.target.map((v, i) => v + (b.target[i] - v) * e)
    dirty = true
    if (k >= 1) anim = null
  }
  const views: Record<ViewName, number> = {
    front: 0,
    back: Math.PI,
    left: Math.PI / 2,
    right: -Math.PI / 2,
  }

  /* ---------- 2D view ---------- */
  const VB0 = { x: -1.1, y: -1.9, w: 2.2, h: 2.0 }
  let vb = { ...VB0 }
  const setVB = () => svg2.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`)
  setVB()
  svg2.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  const pathOf = (pts: V3[]) =>
    'M' + pts.map((p) => p[0].toFixed(4) + ' ' + p[1].toFixed(4)).join('L') + 'Z'

  interface Item {
    k: string
    name: string
    zone: string | null
    organ: string | null
    a: V3
    els: Element[]
  }
  const ITEMS = new Map<string, Item>()
  zones.forEach((z) =>
    ITEMS.set('z:' + z.id, {
      k: 'z:' + z.id,
      name: z.name,
      zone: z.id,
      organ: null,
      a: z.a,
      els: [],
    }),
  )
  ORGANS.forEach((o) =>
    ITEMS.set('o:' + o.id, {
      k: 'o:' + o.id,
      name: o.name,
      zone: null,
      organ: o.id,
      a: o.a,
      els: [],
    }),
  )

  let face2: BodyFace = 'front'
  let g2flip: SVGGElement | null = null,
    g2marks: Element | null = null,
    g2nums: Element | null = null
  function build2D() {
    svg2.textContent = ''
    ITEMS.forEach((it) => (it.els = []))
    const defs = el('defs', {}, svg2)
    const sil = parts.filter((p) => !p.noOutline).map((p) => pathOf(p.outline))
    const cp = el('clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' }, defs)
    sil.forEach((d) => el('path', { d }, cp))
    g2flip = el(
      'g',
      { transform: face2 === 'back' ? 'scale(-1,-1)' : 'scale(1,-1)' },
      svg2,
    ) as SVGGElement
    el('ellipse', { cx: 0, cy: 0, rx: 0.34, ry: 0.035, class: 'floor' }, g2flip)
    el('ellipse', { cx: 0, cy: 0, rx: 0.42, ry: 0.045, class: 'floor dashed' }, g2flip)
    const gs = el('g', {}, g2flip),
      gf = el('g', {}, g2flip)
    sil.forEach((d) => {
      el('path', { d, class: 'sil-stroke' }, gs)
      el('path', { d, class: 'sil-fill' }, gf)
    })
    const gz = el('g', {}, g2flip)
    for (const z of zones) {
      if (z.face !== face2) continue
      const it = ITEMS.get('z:' + z.id)!
      z.polys.forEach((poly, i) => {
        const attrs: Record<string, string | number> = {
          d: pathOf(poly),
          class: 'zone',
          'data-k': it.k,
        }
        if (i === 0) Object.assign(attrs, { tabindex: 0, role: 'button', 'aria-label': z.name })
        it.els.push(el('path', attrs, gz))
      })
    }
    const gl2 = el('g', { 'clip-path': `url(#${clipId})`, class: 'scan2' }, g2flip)
    for (let y = 0.01; y < 1.8; y += 0.018)
      el('line', { x1: -1, x2: 1, y1: y, y2: y, class: 'scanline' }, gl2)
    if (face2 === 'front') {
      const go = el('g', {}, g2flip)
      for (const o of ORGANS) {
        const it = ITEMS.get('o:' + o.id)!
        it.els.push(
          el(
            'path',
            {
              d: o.d,
              class: 'organ',
              'data-k': it.k,
              tabindex: 0,
              role: 'button',
              'aria-label': o.name,
            },
            go,
          ),
        )
      }
      const gd = el('g', {}, g2flip)
      ;[-0.032, 0.032].forEach((cx) =>
        el('circle', { cx, cy: 1.66, r: 0.0045, class: 'pupil' }, gd),
      )
    }
    g2marks = el('g', {}, g2flip)
    g2nums = el('g', {}, svg2)
  }
  function draw2DMarks() {
    if (!g2marks || !g2nums) return
    g2marks.textContent = ''
    g2nums.textContent = ''
    for (const e of marks) {
      const [x, y] = e.p
      const surf = e.organ
        ? 'front'
        : e.zone
          ? e.zone.startsWith('b-')
            ? 'back'
            : 'front'
          : e.p[2] >= 0
            ? 'front'
            : 'back'
      const back = surf !== face2,
        r = 0.011 + e.intensity * 0.0019
      const g = el(
        'g',
        {
          class:
            'm2' +
            (back ? ' back' : '') +
            (e.pending ? ' pending' : '') +
            (e.id === hlId ? ' hl' : ''),
          transform: `translate(${x} ${y})`,
        },
        g2marks,
      )
      el('circle', { r, class: 'ring' }, g)
      const pc = el('circle', { r, class: 'pulse' }, g)
      pulse(pc, r, r * 2.1)
      el('circle', { r: 0.0045, class: 'dot' }, g)
      const lx = (face2 === 'back' ? -x : x) + r * 0.75 + 0.006,
        ly = -y - r * 0.75 - 0.022
      el('rect', { x: lx, y: ly, width: 0.036, height: 0.022, class: 'mnum-bg' }, g2nums)
      const t = el(
        'text',
        {
          x: lx + 0.018,
          y: ly + 0.0158,
          'font-size': 0.0155,
          'text-anchor': 'middle',
          class: 'mnum',
        },
        g2nums,
      )
      t.textContent = pad(e.num)
    }
    for (const it of ITEMS.values()) {
      const c = marks.filter(
        (e) =>
          !e.pending &&
          (it.organ
            ? e.organ === it.organ
            : e.zone === it.zone || (!e.organ && !e.zone && e.region === it.name)),
      ).length
      it.els.forEach((x) => x.classList.toggle('has', c > 0))
    }
  }
  function svgPt(e: { clientX: number; clientY: number }): V3 {
    const pt = svg2.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(g2flip!.getScreenCTM()!.inverse())
    return [p.x, p.y]
  }
  const hitFront = (x: number, y: number) =>
    face2 === 'back' ? raycast([x, y, -3], [0, 0, 1]) : raycast([x, y, 3], [0, 0, -1])
  const itemFromTarget = (t: EventTarget | null) => {
    const n = t instanceof Element ? t.closest('[data-k]') : null
    return n ? ITEMS.get(n.getAttribute('data-k')!) : undefined
  }
  function add2D(x: number, y: number, item?: Item) {
    const h = hitFront(x, y)
    if (!h && !item) return
    const p = h ? h.p : [x, y, 0.1],
      n = h ? h.n : [0, 0, 1]
    onPick({
      region: item ? item.name : h!.region,
      organ: item ? item.organ : null,
      zone: item ? item.zone : null,
      p,
      n,
      view: '2D',
    })
  }
  function setHot(item?: Item) {
    for (const it of ITEMS.values()) {
      const onIt = it === item
      it.els.forEach((x) => x.classList.toggle('hot', onIt))
    }
  }
  function zoom2D(f: number, cx: number, cy: number) {
    const pt = svg2.createSVGPoint()
    pt.x = cx
    pt.y = cy
    const p = pt.matrixTransform(svg2.getScreenCTM()!.inverse())
    const nw = clamp(vb.w * f, 0.35, 3.2),
      s = nw / vb.w
    vb = { x: p.x - (p.x - vb.x) * s, y: p.y - (p.y - vb.y) * s, w: nw, h: vb.h * s }
    setVB()
  }
  let d2: { t: number; moved: number; target: EventTarget | null; btn: number } | null = null
  const p2 = new Map<number, { x: number; y: number }>()
  let h2raf = 0
  on(svg2, 'pointerdown', (e: PointerEvent) => {
    svg2.setPointerCapture?.(e.pointerId)
    p2.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (p2.size === 1) d2 = { t: performance.now(), moved: 0, target: e.target, btn: e.button }
    else if (d2) d2.moved = 99
  })
  on(svg2, 'pointermove', (e: PointerEvent) => {
    const prev = p2.get(e.pointerId)
    if (!prev) {
      if (h2raf) return
      h2raf = raf(() => {
        h2raf = 0
        const it = itemFromTarget(e.target)
        setHot(it)
        const sp = stagePt(e)
        if (it) {
          setTip(it.name, sp)
          roHover = it.name
        } else {
          const [x, y] = svgPt(e)
          const h = hitFront(x, y)
          setTip(h ? h.region : null, sp)
          roHover = h ? h.region : '—'
        }
      })
      return
    }
    const dx = e.clientX - prev.x,
      dy = e.clientY - prev.y
    const k =
      (vb.w / svg2.getBoundingClientRect().width) *
      Math.max(1, vb.h / vb.w / (svg2.clientHeight / svg2.clientWidth))
    if (p2.size === 1 && d2) {
      d2.moved += Math.abs(dx) + Math.abs(dy)
      if (d2.moved > 4) {
        vb.x -= dx * k
        vb.y -= dy * k
        setVB()
        setTip(null)
      }
    } else if (p2.size === 2) {
      const o = [...p2.entries()].find(([id]) => id !== e.pointerId)![1]
      const d0 = Math.hypot(prev.x - o.x, prev.y - o.y),
        d1 = Math.hypot(e.clientX - o.x, e.clientY - o.y)
      if (d0 && d1) zoom2D(d0 / d1, (e.clientX + o.x) / 2, (e.clientY + o.y) / 2)
    }
    prev.x = e.clientX
    prev.y = e.clientY
  })
  const end2 = (e: PointerEvent) => {
    p2.delete(e.pointerId)
    if (!p2.size && d2) {
      if (d2.moved < 6 && performance.now() - d2.t < 700 && d2.btn === 0) {
        const [x, y] = svgPt(e)
        add2D(x, y, itemFromTarget(d2.target))
      }
      d2 = null
    }
  }
  on(svg2, 'pointerup', end2)
  on(svg2, 'pointercancel', end2)
  on(svg2, 'pointerleave', () => {
    if (!p2.size) {
      setTip(null)
      setHot()
    }
  })
  on(svg2, 'contextmenu', (e: MouseEvent) => e.preventDefault())
  on(svg2, 'keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const it = itemFromTarget(e.target)
      if (it) {
        e.preventDefault()
        add2D(it.a[0], it.a[1], it)
      }
    }
  })
  on(svg2, 'focusin', (e: FocusEvent) => {
    const it = itemFromTarget(e.target)
    if (it) setHot(it)
  })
  on(svg2, 'focusout', () => setHot())
  on(
    svg2,
    'wheel',
    (e: WheelEvent) => {
      e.preventDefault()
      zoom2D(Math.exp(e.deltaY * 0.0012), e.clientX, e.clientY)
    },
    { passive: false },
  )

  /* ---------- readouts and loop ---------- */
  let lastRO = 0
  function readouts() {
    const az = (((cam.theta / DEG) % 360) + 360) % 360,
      elv = 90 - cam.phi / DEG
    roL.textContent =
      mode === '3d'
        ? `VIEW  3D · ORBIT\nAZ    ${az.toFixed(0).padStart(3, '0')}°\nEL    ${elv >= 0 ? '+' : ''}${elv.toFixed(0)}°\nZOOM  ${(fitR() / cam.r).toFixed(2)}×`
        : `VIEW  2D · ${face2 === 'back' ? 'POSTERIOR' : 'ANTERIOR'}\nZOOM  ${(VB0.w / vb.w).toFixed(2)}×\nREGIONS ${zones.filter((z) => z.face === face2).length}${face2 === 'front' ? ` · ORGANS ${ORGANS.length}` : ''}`
    const saved = marks.filter((m) => !m.pending)
    const mx = saved.length ? Math.max(...saved.map((e) => e.intensity)) : 0
    roR.textContent = `TARGET  ${roHover.toUpperCase()}\nPOINTS  ${pad(saved.length)}\nPEAK    ${mx ? mx + '/10' : '—'}`
  }
  function resize() {
    const r = stage.getBoundingClientRect(),
      dpr = Math.min(window.devicePixelRatio || 1, 2)
    const firstFit = W === 1
    W = Math.max(1, r.width)
    H = Math.max(1, r.height)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    if (firstFit) cam.r = fitR()
    dirty = ovDirty = true
  }
  let frameId = 0
  function frame(now: number) {
    if (destroyed) return
    stepAnim(now)
    if (!ptrs.size && (Math.abs(vel.t) > 1e-4 || Math.abs(vel.p) > 1e-4)) {
      cam.theta += vel.t
      cam.phi = clamp(cam.phi + vel.p, 0.12, Math.PI - 0.12)
      vel.t *= 0.92
      vel.p *= 0.92
      dirty = true
    }
    if (mode === '3d' && glOK) {
      if (dirty) computeCam()
      if (needHover) updateHover3D()
      if (dirty) {
        render()
        ovDirty = true
        dirty = false
      }
      if (ovDirty) {
        drawOverlay()
        ovDirty = false
      }
    }
    if (now - lastRO > 120) {
      readouts()
      lastRO = now
    }
    frameId = raf(frame)
  }

  function refreshTheme() {
    const style = getComputedStyle(stage)
    fg = cssColorToRgb(style.getPropertyValue('--foreground').trim() || style.color, [1, 1, 1])
    bg = cssColorToRgb(style.getPropertyValue('--background').trim() || 'black', [0, 0, 0])
    dirty = true
  }

  let glOK = false
  try {
    glOK = initGL()
  } catch (err) {
    console.error(err)
    glOK = false
  }
  refreshTheme()
  build2D()
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null
  ro?.observe(stage)
  resize()
  computeCam()
  frameId = raf(frame)

  function applyMode(m: BodyMapMode) {
    mode = m
    canvas.toggleAttribute('hidden', m !== '3d')
    ov.toggleAttribute('hidden', m !== '3d')
    svg2.toggleAttribute('hidden', m !== '2d')
    setTip(null)
    dirty = ovDirty = true
  }
  applyMode(glOK ? '3d' : '2d')

  return {
    glAvailable: glOK,
    setMode(m) {
      applyMode(m === '3d' && !glOK ? '2d' : m)
    },
    setFace(f) {
      if (f === face2) return
      face2 = f
      setTip(null)
      roHover = '—'
      build2D()
      draw2DMarks()
    },
    view(name) {
      if (mode === '2d') {
        if (name === 'front' || name === 'back') this.setFace(name)
        return
      }
      animateTo({ theta: views[name], phi: 88 * DEG, r: fitR(), target: [0, 0.9, 0] })
    },
    zoom(f) {
      if (mode === '3d')
        animateTo(
          { theta: cam.theta, phi: cam.phi, r: clamp(cam.r * f, 0.45, 8), target: cam.target },
          300,
        )
      else {
        const r = svg2.getBoundingClientRect()
        zoom2D(f, r.left + r.width / 2, r.top + r.height / 2)
      }
    },
    reset() {
      if (mode === '3d') animateTo({ theta: 0.35, phi: 86 * DEG, r: fitR(), target: [0, 0.9, 0] })
      else {
        vb = { ...VB0 }
        setVB()
      }
    },
    setMarks(next, highlightId) {
      marks = next
      hlId = highlightId
      ovDirty = true
      draw2DMarks()
    },
    locate(mark) {
      if (mode === '3d') {
        const n = mark.n
        animateTo({
          theta: Math.atan2(n[0], n[2]),
          phi: clamp(Math.acos(clamp(n[1], -1, 1)), 0.35, Math.PI - 0.35),
          r: 1.25,
          target: mark.p.slice(),
        })
      } else {
        const w = 0.7,
          h = (w * VB0.h) / VB0.w
        vb = { x: mark.p[0] - w / 2, y: -mark.p[1] - h / 2, w, h }
        setVB()
      }
    },
    refreshTheme,
    destroy() {
      destroyed = true
      caf(frameId)
      if (h2raf) caf(h2raf)
      ro?.disconnect()
      cleanups.forEach((fn) => fn())
    },
  }
}
