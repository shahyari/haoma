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
import { useHealthData } from '@/data/HealthDataProvider'
import { INDICATORS, type HealthEntry, type IndicatorId } from '@/domain/indicators'
import { formatDateTime } from '@/domain/dates'
import { phq2Schedule } from '@/features/checkin/checkin'

import { checkEntry, emptyValues, HINTS, IndicatorFields, valuesOf, type Values } from './fields'

interface Props {
  indicator: IndicatorId
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The entry to edit; omitted when adding a new one. */
  entry?: HealthEntry
}

export function EntryDialog({ indicator, open, onOpenChange, entry }: Props) {
  const { addEntry, updateEntry, data } = useHealthData()
  const [now] = useState(() => new Date())
  // The dialog has no Radix trigger, so remember what opened it and return focus there on close.
  const [opener] = useState(() =>
    typeof document === 'undefined' ? null : (document.activeElement as HTMLElement | null),
  )
  const phq2 = phq2Schedule(data.entries, now)
  const [values, setValues] = useState<Values>(() => (entry ? valuesOf(entry) : emptyValues()))
  const [symptoms, setSymptoms] = useState<string[]>(() => entry?.symptoms ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }))

  function submit(event: FormEvent) {
    event.preventDefault()
    const result = checkEntry(indicator, values, symptoms, entry)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    if (entry) updateEntry(result.value)
    else addEntry(result.value)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90svh] overflow-y-auto"
        onCloseAutoFocus={(event) => {
          if (opener?.isConnected) {
            event.preventDefault()
            opener.focus()
          }
        }}
      >
        <form onSubmit={submit} noValidate className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {entry
                ? `Edit ${INDICATORS[indicator].label.toLowerCase()} reading`
                : INDICATORS[indicator].label}
            </DialogTitle>
            <DialogDescription>
              {entry
                ? `Reading from ${formatDateTime(entry.recordedAt)}. The date and time stay the same; the reading will be marked as edited.`
                : (HINTS[indicator] ?? 'Add a new reading.')}
            </DialogDescription>
          </DialogHeader>

          <IndicatorFields
            indicator={indicator}
            values={values}
            set={set}
            symptoms={symptoms}
            setSymptoms={setSymptoms}
            errors={errors}
            entry={entry}
            phq2={phq2}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save reading</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
