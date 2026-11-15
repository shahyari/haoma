import { ChevronDown, CircleCheck, Crosshair, FileText, Pencil, Save, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useHealthData } from '@/data/HealthDataProvider'
import { formatDate, formatDateTime } from '@/domain/dates'
import {
  PAIN_CHARACTERS,
  PAIN_NOTE_MAX_LENGTH,
  validatePainLog,
  type PainCharacter,
  type PainLog,
  type PainReport,
  type Vec3,
} from '@/domain/pain'
import { INDICATORS } from '@/domain/indicators'
import { DEMO_PROFILE } from '@/demo/demo'
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
import { relatedIndicators } from './links'

interface Draft {
  /** Set when adding: where on the body the point was picked. */
  pick?: PickInfo
  /** Set when editing an existing report. */
  editingId?: string
  intensity: number
  character?: PainCharacter
  note: string
  /** Date and time of the pain, as a datetime-local value. */
  when: string
}

/** A "YYYY-MM-DDTHH:mm" local value as a Date. */
function fromLocalInput(value: string): Date {
  return new Date(value)
}

/** A Date as a "YYYY-MM-DDTHH:mm" value in local time. */
function toLocalInput(date: Date): string {
  const p2 = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())}T${p2(date.getHours())}:${p2(date.getMinutes())}`
}

const pad = (n: number) => String(n).padStart(2, '0')
/** Links from a body region to its related indicators (navigation aid only). */
function RelatedLinks({
  log,
  className,
}: {
  log: { region: string; organ: string | null }
  className?: string
}) {
  const related = relatedIndicators(log)
  return (
    <p className={cn('text-muted-foreground', className)}>
      Related indicators:{' '}
      {related.map((id, i) => (
        <span key={id}>
          {i > 0 ? ' · ' : ''}
          <Link
            to={`/indicators/${id}`}
            className="rounded-sm text-foreground underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {INDICATORS[id].label}
          </Link>
          {id === 'bodyTemperature' ? ' (whole body)' : ''}
        </span>
      ))}
    </p>
  )
}

const surfaceOf = (r: PainLog) => (r.organ ? 'Organ' : r.position[2] >= 0 ? 'Front' : 'Back')

/**
 * Body map and pain log (owner prototype "body-map.html", 2026-11-14).
 * Self-reported data only: nothing here is interpreted or classified.
 */
export function BodyMap({ report }: { report?: PainReport } = {}) {
  // With a report, the map shows its saved logs read-only (owner decision 2026-11-14).
  const readOnly = report !== undefined
  const { data, savePainLog, deletePainLog, clearPainLogs, savePainReport } = useHealthData()
  const logs = report?.logs ?? data.painLogs

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
  const [whenError, setWhenError] = useState<string | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  // Days after today cannot be chosen (the pain cannot be in the future).
  const [today] = useState(() => new Date())
  const [saving, setSaving] = useState<Set<string> | null>(null)
  const [saved, setSaved] = useState<{ id: string; count: number } | null>(null)

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
      // Picks only when editable; createBodyMap ignores them in read-only mode.
      (pick) =>
        setDraft(
          (current) => current ?? { pick, intensity: 5, note: '', when: toLocalInput(new Date()) },
        ),
      { readOnly },
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
  }, [readOnly])

  useEffect(() => {
    const marks: Mark[] = logs.map((r, i) => ({
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
        num: logs.length + 1,
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
  }, [logs, draft, highlight])

  const changeMode = (m: BodyMapMode) => {
    setMode(m)
    controller.current?.setMode(m)
  }
  const changeView = (name: ViewName) => {
    if (mode === '2d' && (name === 'front' || name === 'back')) setFace(name)
    controller.current?.view(name)
  }
  const locate = (r: PainLog, i: number) => {
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

  const editing = draft?.editingId ? logs.find((r) => r.id === draft.editingId) : undefined
  const dialogRegion = editing?.region ?? draft?.pick?.region ?? ''
  const dialogNumber = editing ? logs.indexOf(editing) + 1 : logs.length + 1

  function closeDraft() {
    setDraft(null)
    setWhenError(null)
  }

  function save() {
    if (!draft) return
    const now = new Date().toISOString()
    const when = new Date(draft.when)
    if (!draft.when || Number.isNaN(when.getTime())) {
      setWhenError('Enter a date and time.')
      return
    }
    // One minute of tolerance for the clock moving on while the dialog is open.
    if (when.getTime() > Date.now() + 60_000) {
      setWhenError('The date and time cannot be in the future.')
      return
    }
    const base = editing
      ? { ...editing, editedAt: now, recordedAt: when.toISOString() }
      : {
          id: crypto.randomUUID(),
          recordedAt: when.toISOString(),
          region: draft.pick!.region,
          organ: draft.pick!.organ,
          zone: draft.pick!.zone,
          position: draft.pick!.p.map((v) => +v.toFixed(4)) as Vec3,
          normal: draft.pick!.n.map((v) => +v.toFixed(4)) as Vec3,
          view: draft.pick!.view,
        }
    const { character: _c, note: _n, ...rest } = base as PainLog
    const note = draft.note.trim()
    const report = validatePainLog({
      ...rest,
      intensity: draft.intensity,
      ...(draft.character ? { character: draft.character } : {}),
      ...(note ? { note } : {}),
    })
    if (report) savePainLog(report)
    closeDraft()
  }

  function saveReport() {
    if (!saving || saving.size === 0) return
    const id = crypto.randomUUID()
    // Saving moves the chosen logs from the pain log into the report (owner decision 2026-11-14).
    savePainReport({
      id,
      createdAt: new Date().toISOString(),
      astronaut: DEMO_PROFILE.name,
      logs: logs.filter((l) => saving.has(l.id)),
    })
    setSaved({ id, count: saving.size })
    setSaving(null)
    window.setTimeout(() => setSaved((s) => (s?.id === id ? null : s)), 8000)
  }

  function onDialogKey(e: KeyboardEvent) {
    if (!draft || e.target instanceof HTMLTextAreaElement) return
    if (/^[0-9]$/.test(e.key)) {
      setDraft({ ...draft, intensity: e.key === '0' ? 10 : Number(e.key) })
    }
  }

  const avg = logs.length
    ? (logs.reduce((s, r) => s + r.intensity, 0) / logs.length).toFixed(1)
    : undefined

  return (
    <div className="bodymap @container flex h-full min-h-0 flex-col rounded-lg border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <div>
          <h2 id="bodymap-heading" className="font-medium">
            {readOnly ? 'Pain logs on the body map' : 'Body map'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {readOnly ? 'Saved report, read-only' : 'Pain log'} · self-reported, not a diagnostic
            tool
          </p>
        </div>
        {readOnly ? null : (
          <Button asChild variant="outline" size="sm" className="ml-auto">
            <Link to="/reports">
              <FileText aria-hidden="true" />
              Reports
            </Link>
          </Button>
        )}
      </div>

      {/* Stacked (narrow) layout: figure and pain log scroll inside the card, so they never run
          into the hint row when the card has a fixed height. Wide layout: side by side. */}
      <div className="grid min-h-0 flex-1 overflow-y-auto @3xl:grid-cols-[minmax(0,1fr)_19rem] @3xl:grid-rows-1 @3xl:overflow-hidden">
        <section
          ref={stageRef}
          aria-label="Body model"
          className="stage relative h-[min(72vh,640px)] min-h-[360px] overflow-hidden select-none @3xl:h-auto"
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
            aria-label={
              readOnly
                ? '2D body map with the pain logs of this report.'
                : '2D body map. Choose a body region or organ to add a pain point.'
            }
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
          <div className="tools right">
            <div className="row" role="group" aria-label="View mode">
              <button
                type="button"
                className="tool"
                aria-pressed={mode === '3d'}
                disabled={!glAvailable}
                onClick={() => changeMode('3d')}
              >
                3D
              </button>
              <button
                type="button"
                className="tool"
                aria-pressed={mode === '2d'}
                onClick={() => changeMode('2d')}
              >
                2D
              </button>
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
            <dl className="mt-2 grid grid-cols-2 gap-2 text-center">
              {[
                ['Points', String(logs.length)],
                ['Avg /10', avg ?? '–'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border px-2 py-1.5">
                  <dd className="num text-lg">{value}</dd>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
          </div>
          {logs.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              <strong className="block font-medium text-foreground">No pain points logged.</strong>
              Select anywhere on the body, or in the 2D view to choose a region or organ and add
              one.
            </p>
          ) : (
            <ol className="min-h-0 flex-1 overflow-auto" onPointerLeave={() => setHighlight(null)}>
              {logs.map((r, i) => (
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
                    <RelatedLinks log={r} className="mt-1 text-xs" />
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
                    {readOnly ? null : (
                      <>
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
                              when: toLocalInput(new Date(r.recordedAt)),
                            })
                          }
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete point ${i + 1}`}
                          onClick={() => deletePainLog(r.id)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {/* Only with at least one log, so the empty state stays clean (owner, 2026-11-15). */}
          {readOnly || logs.length === 0 ? null : (
            <div className="mt-auto flex gap-2 border-t px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setSaving(new Set(logs.map((l) => l.id)))}
              >
                <Save aria-hidden="true" />
                Save report
              </Button>
              <Button
                variant={confirmClear ? 'destructive' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (!confirmClear) {
                    setConfirmClear(true)
                    window.setTimeout(() => setConfirmClear(false), 3000)
                    return
                  }
                  setConfirmClear(false)
                  clearPainLogs()
                }}
              >
                {confirmClear ? 'Confirm clear' : 'Clear all'}
              </Button>
            </div>
          )}
          {saved ? (
            <div
              role="status"
              // Stays at the bottom of the panel when the buttons are hidden (no logs left).
              className={cn(
                'flex flex-wrap items-center gap-2 border-t px-4 py-3 text-sm',
                logs.length === 0 && 'mt-auto',
              )}
            >
              <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
              <span className="flex-1">
                Report saved with <span className="num">{saved.count}</span>{' '}
                {saved.count === 1 ? 'pain log' : 'pain logs'}.
              </span>
              <Button asChild size="sm">
                <Link to={`/reports/${saved.id}`}>View report</Link>
              </Button>
            </div>
          ) : null}
        </aside>
      </div>

      <p className="border-t px-4 py-2 text-xs text-muted-foreground">
        {readOnly
          ? mode === '3d'
            ? 'Drag to rotate · Shift- or right-drag to pan · Scroll to zoom'
            : 'Drag to pan · Scroll to zoom'
          : mode === '3d'
            ? 'Drag to rotate · Shift- or right-drag to pan · Scroll to zoom · Click to add a pain point'
            : 'Click a region or organ, or move to it with Tab and press Enter · Drag to pan · Scroll to zoom'}
      </p>

      <Dialog open={draft !== null} onOpenChange={(open) => (open ? null : closeDraft())}>
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
            {(editing ?? draft?.pick) ? (
              <RelatedLinks
                log={editing ?? { region: dialogRegion, organ: draft?.pick?.organ ?? null }}
                className="text-sm"
              />
            ) : null}

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

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Date and time of the pain</legend>
              <div className="flex flex-wrap gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="pain-date" className="text-xs text-muted-foreground">
                    Date
                  </Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="pain-date"
                        type="button"
                        variant="outline"
                        className="w-44 justify-between font-normal"
                      >
                        <span className="num">
                          {draft ? formatDate(fromLocalInput(draft.when)) : ''}
                        </span>
                        <ChevronDown aria-hidden="true" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        selected={draft ? fromLocalInput(draft.when) : undefined}
                        defaultMonth={draft ? fromLocalInput(draft.when) : undefined}
                        disabled={{ after: today }}
                        onSelect={(date) => {
                          if (!draft || !date) return
                          setWhenError(null)
                          setDraft({
                            ...draft,
                            when: `${toLocalInput(date).slice(0, 10)}T${draft.when.slice(11, 16)}`,
                          })
                          setDatePickerOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="pain-time" className="text-xs text-muted-foreground">
                    Time
                  </Label>
                  <Input
                    id="pain-time"
                    type="time"
                    value={draft?.when.slice(11, 16) ?? ''}
                    onChange={(e) => {
                      if (!draft || !e.target.value) return
                      setWhenError(null)
                      setDraft({ ...draft, when: `${draft.when.slice(0, 10)}T${e.target.value}` })
                    }}
                    aria-invalid={whenError ? true : undefined}
                    aria-describedby={whenError ? 'pain-when-error' : undefined}
                    className="num w-32 appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>
              </div>
              {whenError ? (
                <p id="pain-when-error" className="text-sm font-medium text-destructive">
                  {whenError}
                </p>
              ) : null}
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
                    deletePainLog(editing.id)
                    closeDraft()
                  }}
                >
                  Delete
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={closeDraft}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={saving !== null} onOpenChange={(open) => (open ? null : setSaving(null))}>
        <DialogContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              saveReport()
            }}
          >
            <DialogHeader>
              <DialogTitle>Save report</DialogTitle>
              <DialogDescription>
                Choose the pain logs to include. They move from the pain log into the report, which
                is kept on the Reports page and can be opened or downloaded as a JSON file.
              </DialogDescription>
            </DialogHeader>
            <fieldset className="max-h-72 space-y-1 overflow-auto">
              <legend className="sr-only">Pain logs to include</legend>
              {logs.map((l, i) => (
                <div key={l.id} className="flex min-h-9 items-center gap-2">
                  <Checkbox
                    id={`include-${l.id}`}
                    checked={saving?.has(l.id) ?? false}
                    onCheckedChange={(checked) =>
                      setSaving((current) => {
                        const next = new Set(current)
                        if (checked === true) next.add(l.id)
                        else next.delete(l.id)
                        return next
                      })
                    }
                  />
                  <Label htmlFor={`include-${l.id}`} className="font-normal">
                    <span className="num">{pad(i + 1)}</span> {l.region} ·{' '}
                    <span className="num">{l.intensity}/10</span> ·{' '}
                    <span className="num">{formatDateTime(l.recordedAt)}</span>
                  </Label>
                </div>
              ))}
            </fieldset>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setSaving(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!saving || saving.size === 0}>
                Save report ({saving?.size ?? 0})
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
