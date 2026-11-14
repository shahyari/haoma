import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'

/** "Back" (outline button) to the previous page in this app, or Home when opened directly. */
export function BackLink() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => (location.key !== 'default' ? navigate(-1) : navigate('/'))}
    >
      <ArrowLeft aria-hidden="true" data-icon="inline-start" />
      Back
    </Button>
  )
}
