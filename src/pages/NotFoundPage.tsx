import { Link } from 'react-router'

import { PageLayout } from '@/components/PageLayout'
import { EmptyState } from '@/components/states/StatePanel'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <PageLayout title="Page not found" back={false}>
      <EmptyState
        title="This page does not exist"
        action={
          <Button asChild>
            <Link to="/">Go to the home page</Link>
          </Button>
        }
      />
    </PageLayout>
  )
}
