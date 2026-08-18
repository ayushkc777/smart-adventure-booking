import { Footer } from './Footer'
import { Header } from './Header'
import { RouteFocus } from './RouteFocus'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />
      <RouteFocus />
      <Footer />
    </div>
  )
}
