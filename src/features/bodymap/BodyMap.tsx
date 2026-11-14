import { Crosshair, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useHealthData } from '@/data/HealthDataProvider'
import { formatDateTime } from '@/domain/dates'
import {
  PAIN_CHARACTERS,
  PAIN_NOTE_MAX_LENGTH,
  validatePainReport,
  type PainCharacter,
  type PainReport,
  type Vec3,
} from '@/domain/pain'
import { cn } from '@/lib/utils'

import {
  createBodyMap,
  type BodyFace,
  type BodyMapController,
  type BodyMapMode,
  type Mark,
  type PickInfo,
  type ViewName,
} from './engine'

interface Draft {
  /** Set when adding: where on the body the point was picked. */
  pick?: PickInfo
  /** Set when editing an existing report. */
  editingId?: string
  intensity: number
  character?: PainCharacter
  note: string
}

const pad = (n: number) => String(n).padStart(2, '0')
const surfaceOf = (r: PainReport) => (r.organ ? 'Organ' : r.position[2] >= 0 ? 'Front' : 'Back')

/**
 * Body map and pain log (owner prototype "body-map.html", 2026-11-14).
 * Self-reported data only: nothing here is interpreted or classified.
 */
export function BodyMap() {
  const { data, savePainReport, deletePainReport, clearPainReports } = useHealthData()
  const reports = data.painReports

  const stageRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<SVGSVGElement>(null)
  const svg2dRef = useRef<SVGSVGElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const roLeftRef = useRef<HTMLDivElement>(null)
  const roRightRef = useRef<HTMLDivElement>(null)
  const controller = useRef<BodyMapController | null>(null)

  const [glAvailable, setGlAvailable] = useState(true)
  const [mode, setMode] = useState<BodyMapMode>('3d')
  const [face, setFace] = useState<BodyFace>('front')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [copyLabel, setCopyLabel] = useState('Copy JSON')

  useEffect(() => {
    const c = createBodyMap(
      {
        stage: stageRef.current!,
        canvas: canvasRef.current!,
        overlay: overlayRef.current!,
        svg2d: svg2dRef.current!,
        tip: tipRef.current!,
        readoutLeft: roLeftRef.current!,
        readoutRight: roRightRef.current!,
      },
      (pick) => setDraft((current) => current ?? { pick, intensity: 5, note: '' }),
    )
    controller.current = c
    // oxlint-disable-next-line react-hooks-js/set-state-in-effect -- WebGL support is known only after mounting.
    setGlAvailable(c.glAvailable)
    setMode(c.glAvailable ? '3d' : '2d')
    // Follow theme, mode, and contrast changes from Settings.
    const observer = new MutationObserver(() => c.refreshTheme())
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-contrast', 'data-colorblind'],
    })
    return () => {
      observer.disconnect()
      c.destroy()
      controller.current = null
    }
  }, [])

  useEffect(() => {
    const marks: Mark[] = reports.map((r, i) => ({
      id: r.id,
      num: i + 1,
      p: r.position,
      n: r.normal,
      intensity: draft?.editingId === r.id ? draft.intensity : r.intensity,
      organ: r.organ,
      zone: r.zone,
      region: r.region,
    }))
    if (draft?.pick) {
      marks.push({
        id: 'pending',
        num: reports.length + 1,
        p: draft.pick.p,
        n: draft.pick.n,
        intensity: draft.intensity,
        organ: draft.pick.organ,
        zone: draft.pick.zone,
        region: draft.pick.region,
        pending: true,
      })
    }
    controller.current?.setMarks(marks, highlight)
  }, [reports, draft, highlight])

  const changeMode = (m: BodyMapMode) => {
    setMode(m)
    controller.current?.setMode(m)
  }
  const changeView = (name: ViewName) => {
    if (mode === '2d' && (name === 'front' || name === 'back')) setFace(name)
    controller.current?.view(name)
  }
  const locate = (r: PainReport, i: number) => {
    controller.current?.locate({
      id: r.id,
      num: i + 1,
      p: r.position,
      n: r.normal,
      intensity: r.intensity,
      organ: r.organ,
      zone: r.zone,
      region: r.region,
    })
    setHighlight(r.id)
    window.setTimeout(() => setHighlight((h) => (h === r.id ? null : h)), 1600)
  }

  const editing = draft?.editingId ? reports.find((r) => r.id === draft.editingId) : undefined
  const dialogRegion = editing?.region ?? draft?.pick?.region ?? ''
  const dialogNumber = editing ? reports.indexOf(editing) + 1 : reports.length + 1

  function save() {
    if (!draft) return
    const now = new Date().toISOString()
    const base = editing
      ? { ...editing, editedAt: now }
      : {
          id: crypto.randomUUID(),
          recordedAt: now,
          region: draft.pick!.region,
          organ: draft.pick!.organ,
          zone: draft.pick!.zone,
          position: draft.pick!.p.map((v) => +v.toFixed(4)) as Vec3,
          normal: draft.pick!.n.map((v) => +v.toFixed(4)) as Vec3,
          view: draft.pick!.view,
        }
    const { character: _c, note: _n, ...rest } = base as PainReport
    const note = draft.note.trim()
    const report = validatePainReport({
      ...rest,
      intensity: draft.intensity,
      ...(draft.character ? { character: draft.character } : {}),
      ...(note ? { note } : {}),
    })
    if (report) savePainReport(report)
    setDraft(null)
  }

  function onDialogKey(e: KeyboardEvent) {
    if (!draft || e.target instanceof HTMLTextAreaElement) return
    if (/^[0-9]$/.test(e.key)) {
      setDraft({ ...draft, intensity: e.key === '0' ? 10 : Number(e.key) })
    }
  }

  async function copyJson() {
    const json = JSON.stringify(
      {
        schema: 'haoma.painReports.v1',
        exported: new Date().toISOString(),
        note: 'Self-reported pain points. Not a diagnosis.',
        points: reports,
      },
      null,
      2,
    )
    try {
      await navigator.clipboard.writeText(json)
      setCopyLabel('Copied')
    } catch {
      setCopyLabel('Copy failed')
    }
    window.setTimeout(() => setCopyLabel('Copy JSON'), 1400)
  }

  const max = reports.length ? Math.max(...reports.map((r) => r.intensity)) : undefined
  const avg = reports.length
    ? (reports.reduce((s, r) => s + r.intensity, 0) / reports.length).toFixed(1)
    : undefined

  return (
    <div className="bodymap @container flex flex-col rounded-lg border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <div>
          <h2 id="bodymap-heading" className="font-medium">
            Body map
          </h2>
          <p className="text-sm text-muted-foreground">
            Pain log · self-reported, not a diagnostic tool
          </p>
        </div>
        <div role="group" aria-label="View mode" className="seg ml-auto">
          <button
            type="button"
            aria-pressed={mode === '3d'}
            disabled={!glAvailable}
            onClick={() => changeMode('3d')}
          >
            3D
          </button>
          <button type="button" aria-pressed={mode === '2d'} onClick={() => changeMode('2d')}>
            2D
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 @3xl:grid-cols-[minmax(0,1fr)_19rem]">
        <section
          ref={stageRef}
          aria-label="Body model"
          className="stage relative h-[min(72vh,640px)] min-h-[440px] overflow-hidden select-none"
        >
          <canvas
            ref={canvasRef}
            className="gl"
            aria-label="3D body model. Drag to rotate, scroll to zoom, click to add a pain point. The 2D view can be used with the keyboard."
          />
          <svg ref={overlayRef} className="ov" aria-hidden="true" />
          <svg
            ref={svg2dRef}
            className="v2d"
            role="group"
            aria-label="2D body map. Choose a body region or organ to add a pain point."
          />
          <div className="corner a" aria-hidden="true" />
          <div className="corner b" aria-hidden="true" />
          <div className="corner c" aria-hidden="true" />
          <div className="corner d" aria-hidden="true" />
          <div ref={roLeftRef} className="readout tl" aria-hidden="true" />
          <div ref={roRightRef} className="readout tr" aria-hidden="true" />
          {!glAvailable ? (
            <p className="absolute top-3 right-3 left-3 text-center text-sm text-muted-foreground">
              The 3D view needs WebGL, which this browser does not provide. Showing the 2D map.
            </p>
          ) : null}
          <div className="tools">
            <div className="row">
              <button
                type="button"
                className="tool big"
                aria-label="Zoom in"
                onClick={() => controller.current?.zoom(0.75)}
              >
                +
              </button>
              <button
                type="button"
                className="tool big"
                aria-label="Zoom out"
                onClick={() => controller.current?.zoom(1 / 0.75)}
              >
                −
              </button>
              <button type="button" className="tool" onClick={() => controller.current?.reset()}>
                Reset
              </button>
            </div>
            <div className="row" role="group" aria-label="View">
              {(['front', 'back'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  className="tool"
                  aria-pressed={mode === '2d' ? face === v : undefined}
                  onClick={() => changeView(v)}
                >
                  {v === 'front' ? 'Front' : 'Back'}
                </button>
              ))}
              {mode === '3d' ? (
                <>
                  <button
                    type="button"
                    className="tool"
                    aria-label="Left side"
                    onClick={() => changeView('left')}
                  >
                    L
                  </button>
                  <button
                    type="button"
                    className="tool"
                    aria-label="Right side"
                    onClick={() => changeView('right')}
                  >
                    R
                  </button>
                </>
              ) : null}
            </div>
          </div>
          <div ref={tipRef} className="tip" aria-hidden="true" />
        </section>

        <aside
          aria-labelledby="painlog-heading"
          className="flex min-h-0 flex-col border-t @3xl:border-t-0 @3xl:border-l"
        >
          <div className="border-b px-4 py-3">
            <h3 id="painlog-heading" className="text-sm font-medium tracking-wide uppercase">
              Pain log
            </h3>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
              {[
                ['Points', String(reports.length)],
                ['Max /10', max !== undefined ? String(max) : '–'],
                ['Avg /10', avg ?? '–'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border px-2 py-1.5">
                  <dd className="num text-lg">{value}</dd>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
          </div>
          {reports.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              <strong className="font-medium text-foreground">No pain points logged.</strong> Click
              anywhere on the body, or in the 2D view choose a region or organ (also with Tab and
              Enter), to add one.
            </p>
          ) : (
            <ol className="min-h-0 flex-1 overflow-auto" onPointerLeave={() => setHighlight(null)}>
              {reports.map((r, i) => (
                <li
                  key={r.id}
                  className={cn(
                    'grid grid-cols-[2rem_1fr_auto] gap-3 border-b px-4 py-3 last:border-b-0',
                    highlight === r.id && 'bg-muted',
                  )}
                  onPointerEnter={() => setHighlight(r.id)}
                >
                  <span
                    className="num grid size-7 place-items-center rounded-full border text-xs"
                    aria-hidden="true"
                  >
                    {pad(i + 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">
                      <span className="sr-only">Point {i + 1}: </span>
                      {r.region}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[r.character, surfaceOf(r), formatDateTime(r.recordedAt)]
                        .filter(Boolean)
                        .join(' · ')}
                      {r.editedAt ? ' · edited' : ''}
                    </p>
                    <p className="mt-1.5 flex items-center gap-0.5">
                      {Array.from({ length: 10 }, (_, k) => (
                        <i
                          key={k}
                          aria-hidden="true"
                          className={cn(
                            'h-1.5 w-2.5 border',
                            k < r.intensity ? 'border-foreground bg-foreground' : 'border-border',
                          )}
                        />
                      ))}
                      <span className="num ml-2 text-xs">
                        <span className="sr-only">Intensity </span>
                        {r.intensity}/10
                      </span>
                    </p>
                    {r.note ? <p className="mt-1 text-sm break-words">{r.note}</p> : null}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Show point ${i + 1} on the body`}
                      onClick={() => locate(r, i)}
                    >
                      <Crosshair aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit point ${i + 1}`}
                      onClick={() =>
                        setDraft({
                          editingId: r.id,
                          intensity: r.intensity,
                          character: r.character,
                          note: r.note ?? '',
                        })
                      }
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete point ${i + 1}`}
                      onClick={() => deletePainReport(r.id)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-auto flex gap-2 border-t px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={!reports.length}
              onClick={copyJson}
            >
              {copyLabel}
            </Button>
            <Button
              variant={confirmClear ? 'destructive' : 'outline'}
              size="sm"
              className="flex-1"
              disabled={!reports.length}
              onClick={() => {
                if (!confirmClear) {
                  setConfirmClear(true)
                  window.setTimeout(() => setConfirmClear(false), 3000)
                  return
                }
                setConfirmClear(false)
                clearPainReports()
              }}
            >
              {confirmClear ? 'Confirm clear' : 'Clear all'}
            </Button>
          </div>
        </aside>
      </div>

      <p className="border-t px-4 py-2 text-xs text-muted-foreground">
        {mode === '3d'
          ? 'Drag to rotate · Shift- or right-drag to pan · Scroll to zoom · Click to add a pain point'
          : 'Click a region or organ, or move to it with Tab and press Enter · Drag to pan · Scroll to zoom'}
      </p>

      <Dialog open={draft !== null} onOpenChange={(open) => (open ? null : setDraft(null))}>
        <DialogContent onKeyDown={onDialogKey}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              save()
            }}
          >
            <DialogHeader>
              <DialogDescription className="text-xs tracking-wide uppercase">
                {editing ? 'Edit' : 'Add'} pain point · {pad(dialogNumber)}
              </DialogDescription>
              <DialogTitle>{dialogRegion}</DialogTitle>
            </DialogHeader>

            <fieldset className="space-y-2">
              <legend className="flex w-full justify-between text-sm font-medium">
                <span>Intensity</span>
                <span className="num">{draft?.intensity ?? 5} / 10</span>
              </legend>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 10 }, (_, k) => k + 1).map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-label={`Intensity ${v}`}
                    aria-pressed={draft?.intensity === v}
                    onClick={() => draft && setDraft({ ...draft, intensity: v })}
                    className={cn(
                      'num h-9 rounded-md border text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      draft?.intensity === v
                        ? 'border-foreground bg-foreground text-background'
                        : draft && v < draft.intensity
                          ? 'bg-muted'
                          : '',
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <p className="flex justify-between text-xs text-muted-foreground">
                <span>1 · Mild</span>
                <span>10 · Worst imaginable</span>
              </p>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Character (optional)</legend>
              <div className="flex flex-wrap gap-1.5">
                {PAIN_CHARACTERS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={draft?.character === c}
                    onClick={() =>
                      draft &&
                      setDraft({ ...draft, character: draft.character === c ? undefined : c })
                    }
                    className={cn(
                      'rounded-full border px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      draft?.character === c && 'border-foreground bg-foreground text-background',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-1.5">
              <Label htmlFor="pain-note">Note (optional)</Label>
              <textarea
                id="pain-note"
                maxLength={PAIN_NOTE_MAX_LENGTH}
                value={draft?.note ?? ''}
                onChange={(e) => draft && setDraft({ ...draft, note: e.target.value })}
                placeholder="When did it start? What makes it better or worse?"
                className="min-h-16 w-full resize-y rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <DialogFooter className="gap-2">
              {editing ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="sm:mr-auto"
                  onClick={() => {
                    deletePainReport(editing.id)
                    setDraft(null)
                  }}
                >
                  Delete
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
