import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'

/** "Back" to the previous page in this app, or Home when the page was opened directly. */
export function BackLink() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <button
      type="button"
      onClick={() => (location.key !== 'default' ? navigate(-1) : navigate('/'))}
      className="inline-flex min-h-9 items-center gap-1 rounded-md text-sm underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Back
    </button>
  )
}
