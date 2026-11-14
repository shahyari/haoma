import { EmptyState } from '@/components/states/StatePanel'

/** Placeholder. The real entry screen is defined by an owner feature spec (Phase B). */
export function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Astronaut health self-assessment</h1>
      <EmptyState
        title="Placeholder"
        description="The technical foundation is in place. Product screens are added once they are specified."
      />
    </div>
  )
}
