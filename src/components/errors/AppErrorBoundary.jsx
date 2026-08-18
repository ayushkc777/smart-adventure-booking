import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '../ui/Button'

export class AppErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application render failed', error, errorInfo)
  }

  handleRetry = () => {
    this.props.onRetry?.()
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="surface-grid grid min-h-screen place-items-center bg-slate-50 px-4 py-12">
        <section
          aria-labelledby="application-error-title"
          className="w-full max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-[var(--shadow-premium)]"
          role="alert"
        >
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700">
            <AlertTriangle aria-hidden="true" size={28} />
          </span>
          <h1 className="mt-5 text-3xl font-bold text-slate-950" id="application-error-title">
            We could not display this page
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            A temporary application error interrupted this view. Try rendering it again or return
            to the home page.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button icon={RefreshCw} onClick={this.handleRetry} variant="accent">
              Try again
            </Button>
            <Button href="/" variant="secondary">
              Return home
            </Button>
          </div>
        </section>
      </main>
    )
  }
}
