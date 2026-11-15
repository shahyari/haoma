import { formatValueParts } from '@/domain/format'
import type { HealthEntry } from '@/domain/indicators'
import { cn } from '@/lib/utils'

/**
 * A reading's value: the number in the monospaced font, the unit (and any word such as
 * "Rating") in the normal font at a smaller size (owner consistency review, 2026-11-15).
 */
export function Measurement({ entry, className }: { entry: HealthEntry; className?: string }) {
  const { prefix, value, unit } = formatValueParts(entry)
  const word = 'font-sans font-normal text-[max(0.5em,0.875rem)]'
  return (
    <span className={className}>
      {prefix ? <span className={cn(word, 'mr-1')}>{prefix} </span> : null}
      <span className="num">{value}</span>
      {unit ? <span className={cn(word, 'ml-0.5')}> {unit}</span> : null}
    </span>
  )
}
