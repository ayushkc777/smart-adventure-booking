import { Compass, Home, Search } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function NotFound() {
  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[62vh] max-w-5xl place-items-center">
        <Card className="w-full overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-slate-950 p-8 text-white md:p-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-himalaya-600">
                <Compass aria-hidden="true" size={28} />
              </span>
              <p className="mt-8 text-sm font-bold uppercase text-gold-400">404</p>
              <h1 className="mt-2 text-4xl font-bold">This route is off the map</h1>
              <p className="mt-4 text-sm leading-6 text-slate-200">
                The page may have moved, or the link may be outdated. You can continue planning
                from the activity catalog or contact support if you need help with a booking.
              </p>
            </div>

            <div className="p-8 md:p-10">
              <h2 className="text-2xl font-bold text-slate-950">Where would you like to go?</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button icon={Search} to="/activities" variant="accent">
                  Browse activities
                </Button>
                <Button icon={Home} to="/" variant="secondary">
                  Return home
                </Button>
                <Button className="sm:col-span-2" to="/contact" variant="secondary">
                  Contact support
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
