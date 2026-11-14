import { Link } from 'react-router'

import { EmptyState } from '@/components/states/StatePanel'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <EmptyState
        title="This page does not exist"
        action={
          <Button asChild>
            <Link to="/">Go to the home page</Link>
          </Button>
        }
      />
    </div>
  )
}
