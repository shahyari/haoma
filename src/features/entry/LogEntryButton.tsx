import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useHealthData } from '@/data/HealthDataProvider'
import type { IndicatorId } from '@/domain/indicators'
import { dailyCheckIn } from '@/features/checkin/checkin'
import { HOME_ORDER } from '@/features/home/order'

import { LogEntryDialog } from './LogEntryDialog'

/**
 * "Log reading" in the header, next to the avatar (owner, 2026-11-15). Opens the six-tab dialog
 * on the first indicator not yet measured today.
 */
export function LogEntryButton() {
  const { data } = useHealthData()
  const [open, setOpen] = useState(false)
  const [initialTab, setInitialTab] = useState<IndicatorId>(HOME_ORDER[0])
  function openDialog() {
    // The first indicator not yet measured today, at the moment of clicking.
    const checkIn = dailyCheckIn(data.entries, new Date())
    setInitialTab(
      HOME_ORDER.find((id) => !checkIn.find((i) => i.indicator === id)?.done) ?? HOME_ORDER[0],
    )
    setOpen(true)
  }
  return (
    <>
      {/* Icon only below 640 px, so the header fits on a phone; the name stays for screen readers. */}
      <Button onClick={openDialog} className="max-sm:size-9 max-sm:px-0" title="Log reading">
        <Plus aria-hidden="true" />
        <span className="max-sm:sr-only">Log reading</span>
      </Button>
      {open ? (
        <LogEntryDialog open onOpenChange={setOpen} order={HOME_ORDER} initialTab={initialTab} />
      ) : null}
    </>
  )
}
