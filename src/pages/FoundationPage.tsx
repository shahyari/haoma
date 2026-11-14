import { useMemo } from 'react'

import { EmptyState, ErrorState, LoadingState } from '@/components/states/StatePanel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { INDICATOR_IDS, INDICATORS } from '@/domain/indicators'
import { createAppStore } from '@/storage/storage'

/**
 * TEMPORARY engineering preview of the Phase A foundation (tokens, base
 * components, states, models, storage). Not a product screen; remove or
 * replace it when real screens exist.
 */
export function FoundationPage() {
  const store = useMemo(() => createAppStore(), [])
  const { status, data } = useMemo(() => store.load(), [store])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Foundation preview</h1>
        <p className="text-sm text-muted-foreground">
          Temporary engineering page. Neutral placeholder styling, not the final design.
        </p>
      </div>

      <section aria-labelledby="indicators-heading" className="space-y-3">
        <h2 id="indicators-heading" className="text-lg font-medium">
          Indicator models
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INDICATOR_IDS.map((id) => (
            <li key={id}>
              <Card>
                <CardHeader>
                  <CardTitle>{INDICATORS[id].label}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Unit: {INDICATORS[id].unit}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="storage-heading" className="space-y-3">
        <h2 id="storage-heading" className="text-lg font-medium">
          Local storage
        </h2>
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="outline">
            {store.persistent ? 'Available' : 'Unavailable (memory only)'}
          </Badge>
          <span>
            Status: {status}. Stored entries: {data.entries.length}.
          </span>
        </p>
      </section>

      <section aria-labelledby="components-heading" className="space-y-3">
        <h2 id="components-heading" className="text-lg font-medium">
          Base components
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="grid max-w-xs gap-2">
          <Label htmlFor="preview-input">Example input</Label>
          <Input id="preview-input" inputMode="decimal" placeholder="Value" />
        </div>
      </section>

      <section aria-labelledby="states-heading" className="space-y-3">
        <h2 id="states-heading" className="text-lg font-medium">
          States
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <EmptyState title="Empty state" description="Nothing recorded yet." />
          <LoadingState />
          <ErrorState title="Error state" description="Example only." />
        </div>
      </section>
    </div>
  )
}
