import { AlertTriangle, HeartPulse, LifeBuoy, ShieldCheck } from 'lucide-react'
import { SafetyPanel } from '../components/activity/SafetyPanel'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'
import { usePlatform } from '../context/usePlatform'

export function Safety() {
  const { activities, settings } = usePlatform()
  return (
    <>
      <section className="surface-grid bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle
            description="Review practical safety guidance across Nepal adventure activities before choosing an operator or sending a booking request."
            eyebrow="Safety guidance"
            title="Risk guidance for informed booking"
          />
          <Card className="border-rhododendron-200 bg-rhododendron-50 p-5 shadow-none">
            <div className="flex gap-3">
              <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-rhododendron-700" size={22} />
              <p className="text-sm leading-6 text-rhododendron-900">
                <strong className="block">{settings.safetyAlert}</strong>
                <span className="mt-2 block">
                  Safety guidance helps you prepare and ask better questions before booking. It
                  does not guarantee safety, replace medical advice, or override licensed
                  operator, weather, legal, or emergency decisions.
                </span>
              </p>
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="grid gap-5 self-start lg:sticky lg:top-24">
            {[
              {
                icon: ShieldCheck,
                title: 'Risk level',
                text: 'Activities are classified as Low, Medium, or High based on physical exposure, environment, equipment dependency, and emergency complexity.',
              },
              {
                icon: HeartPulse,
                title: 'Medical warning',
                text: 'Each activity displays health conditions that should trigger caution or medical consultation.',
              },
              {
                icon: LifeBuoy,
                title: 'Emergency guidance',
                text: 'See operator-side readiness such as rescue access, radio communication, first aid, and evacuation planning.',
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
                      <h2 className="font-bold text-slate-950">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                    </div>
                  </div>
                </Card>
              )
            })}

            <Card className="p-5">
              <h2 className="font-bold text-slate-950">General Nepal adventure reminders</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Check weather', 'Use licensed operator', 'Carry ID', 'Share itinerary', 'Respect local rules'].map(
                  (item) => (
                    <Badge key={item} variant="info">
                      {item}
                    </Badge>
                  ),
                )}
              </div>
            </Card>
          </div>

          <div className="grid gap-6">
            {activities.map((activity) => (
              <SafetyPanel activity={activity} key={activity.id} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
