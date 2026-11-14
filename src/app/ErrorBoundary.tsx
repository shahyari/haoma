import { Component, type ErrorInfo, type ReactNode } from 'react'

import { ErrorState } from '@/components/states/StatePanel'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

/** App-level boundary: a rendering error shows a recoverable message instead of a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('haoma: unhandled rendering error', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="mx-auto max-w-xl p-4">
        <ErrorState
          title="Something went wrong"
          description="The app hit an unexpected error. Your saved entries are not affected."
          action={<Button onClick={() => window.location.reload()}>Reload</Button>}
        />
      </div>
    )
  }
}
