import { Compass, Database, Layers, ShieldCheck } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'

export function About() {
  return (
    <>
      <section className="surface-grid bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle
            description="Our platform helps travelers compare adventure experiences across Nepal, evaluate safety information, and book with confidence."
            eyebrow="About us"
            title="Adventure booking made clearer for Nepal"
          />
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-950">What travelers can expect</h2>
            <div className="mt-5 grid gap-4">
              {[
                'Price transparency through side-by-side operator comparison',
                'Safety transparency through risk level, checklist, medical warning, and equipment guidance',
                'Traveler confidence through structured reviews and safety/value ratings',
                'Centralized booking experience with emergency contact collection',
                'Clear operator details, inclusions, and booking status information',
              ].map((item) => (
                <p className="rounded-xl bg-white p-4 text-sm font-semibold leading-6 text-slate-800" key={item}>
                  {item}
                </p>
              ))}
            </div>
          </Card>

          <div className="grid gap-5">
            {[
              {
                icon: Compass,
                title: 'Traveler-first planning',
                text: 'Designed to reduce uncertainty before booking high-adrenaline activities in Nepal.',
              },
              {
                icon: Database,
                title: 'Transparent trip information',
                text: 'Activity details, operator prices, reviews, and safety guidance are presented in one easy place.',
              },
              {
                icon: Layers,
                title: 'Smooth booking journey',
                text: 'Travelers can move from comparison to booking request without switching between multiple providers.',
              },
              {
                icon: ShieldCheck,
                title: 'Safety disclaimer',
                text: 'Advice is guidance only. Real operation must follow licensed providers, regulations, weather, and health conditions.',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Card className="p-5" key={item.title}>
                  <div className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-himalaya-100 text-himalaya-900">
                      <Icon aria-hidden="true" size={23} />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
