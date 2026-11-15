import { Check, CircleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useHealthData } from '@/data/HealthDataProvider'
import { INDICATORS, type HealthEntry, type IndicatorId } from '@/domain/indicators'
import { phq2Schedule } from '@/features/checkin/checkin'

import { checkEntry, emptyValues, HINTS, IndicatorFields, isTouched, type Values } from './fields'

type PerIndicator<T> = Record<IndicatorId, T>

function perIndicator<T>(order: IndicatorId[], make: () => T): PerIndicator<T> {
  return Object.fromEntries(order.map((id) => [id, make()])) as PerIndicator<T>
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Tab order (the Home card order). */
  order: IndicatorId[]
  /** The tab shown first. */
  initialTab: IndicatorId
}

/**
 * Daily check-in from Home (owner usability review, 2026-11-15): one tab per indicator; the
 * person fills in one or more of them and saves them together, one entry per indicator.
 */
export function LogEntryDialog({ open, onOpenChange, order, initialTab }: Props) {
  const { addEntry, data } = useHealthData()
  const [now] = useState(() => new Date())
  const [opener] = useState(() =>
    typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null),
  )
  const phq2 = phq2Schedule(data.entries, now)
  const [tab, setTab] = useState<IndicatorId>(initialTab)
  const [values, setValues] = useState(() => perIndicator<Values>(order, emptyValues))
  const [symptoms, setSymptoms] = useState(() => perIndicator<string[]>(order, () => []))
  const [errors, setErrors] = useState(() =>
    perIndicator<Record<string, string>>(order, () => ({})),
  )
  const [formError, setFormError] = useState<string>()

  const touched = order.filter((id) => isTouched(values[id], symptoms[id]))
  const hasErrors = (id: IndicatorId) => Object.keys(errors[id]).length > 0

  function submit(event: FormEvent) {
    event.preventDefault()
    if (touched.length === 0) {
      setFormError('Enter at least one reading.')
      return
    }
    const nextErrors = perIndicator<Record<string, string>>(order, () => ({}))
    const ready: HealthEntry[] = []
    for (const id of touched) {
      const result = checkEntry(id, values[id], symptoms[id])
      if (result.ok) ready.push(result.value)
      else nextErrors[id] = result.errors
    }
    const failed = touched.filter((id) => Object.keys(nextErrors[id]).length > 0)
    setErrors(nextErrors)
    if (failed.length > 0) {
      setFormError(
        `Nothing saved. Fix the marked ${failed.length === 1 ? 'tab' : 'tabs'}: ${failed.map((id) => INDICATORS[id].label.toLowerCase()).join(', ')}.`,
      )
      setTab(failed.includes(tab) ? tab : failed[0])
      return
    }
    for (const entry of ready) addEntry(entry)
    onOpenChange(false)
  }

  const saveLabel =
    touched.length === 0
      ? 'Save readings'
      : `Save ${touched.length} ${touched.length === 1 ? 'reading' : 'readings'}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90svh] overflow-y-auto sm:max-w-xl"
        onCloseAutoFocus={(event) => {
          if (opener?.isConnected) {
            event.preventDefault()
            opener.focus()
          }
        }}
      >
        <form onSubmit={submit} noValidate className="space-y-4">
          <DialogHeader>
            <DialogTitle>Log reading</DialogTitle>
            <DialogDescription>
              Fill in one or more indicators and save them together. Each is saved as its own
              reading with the current time.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={tab} onValueChange={(value) => setTab(value as IndicatorId)}>
            <TabsList className="grid w-full grid-cols-2 group-data-horizontal/tabs:h-auto sm:grid-cols-3">
              {order.map((id) => (
                <TabsTrigger key={id} value={id} className="min-h-9">
                  {INDICATORS[id].label}
                  {hasErrors(id) ? (
                    <>
                      <CircleAlert aria-hidden="true" className="text-destructive" />
                      <span className="sr-only"> (check this tab)</span>
                    </>
                  ) : touched.includes(id) ? (
                    <>
                      <Check aria-hidden="true" />
                      <span className="sr-only"> (filled in)</span>
                    </>
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>
            {order.map((id) => (
              <TabsContent key={id} value={id} className="space-y-4 pt-2">
                {HINTS[id] ? <p className="text-sm text-muted-foreground">{HINTS[id]}</p> : null}
                <IndicatorFields
                  indicator={id}
                  values={values[id]}
                  set={(name, value) => {
                    setFormError(undefined)
                    setValues((v) => ({ ...v, [id]: { ...v[id], [name]: value } }))
                  }}
                  symptoms={symptoms[id]}
                  setSymptoms={(update) => {
                    setFormError(undefined)
                    setSymptoms((s) => ({ ...s, [id]: update(s[id]) }))
                  }}
                  errors={errors[id]}
                  phq2={phq2}
                />
              </TabsContent>
            ))}
          </Tabs>

          {formError ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {formError}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{saveLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
