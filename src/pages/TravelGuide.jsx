import { AlertTriangle, Backpack, Bus, HeartPulse, Leaf, PhoneCall, ShieldCheck, Sun } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'

const guideSections = [
  {
    icon: Sun,
    title: 'Best season for adventure tourism',
    items: [
      'March to May brings warmer weather, blooming hillsides, and strong trekking visibility.',
      'September to November is the most popular period for clear mountain views.',
      'River activities are commonly strongest after monsoon, while aviation activities depend heavily on visibility.',
    ],
  },
  {
    icon: Backpack,
    title: 'Packing checklist',
    items: [
      'Layered clothing, rain shell, sun protection, reusable water bottle, and personal medication.',
      'Activity-specific footwear such as trekking boots, closed shoes, or quick-dry river shoes.',
      'Digital and printed copies of booking details, identification, insurance, and emergency contact.',
    ],
  },
  {
    icon: PhoneCall,
    title: 'Emergency numbers in Nepal',
    items: [
      'Police: 100',
      'Ambulance: 102',
      'Tourist Police Kathmandu: +977 1 4247041',
      'Confirm the nearest health post or hospital with your operator before departure.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Insurance guidance',
    items: [
      'Choose travel insurance that covers your activity type and altitude range.',
      'For trekking, check emergency evacuation and helicopter rescue coverage.',
      'Keep policy number and assistance phone available offline.',
    ],
  },
  {
    icon: Bus,
    title: 'Transport tips',
    items: [
      'Allow buffer time for road travel, mountain weather, and domestic flight delays.',
      'Confirm pickup points, road conditions, and return transport before booking.',
      'For remote trips, share your itinerary with a trusted contact.',
    ],
  },
  {
    icon: Leaf,
    title: 'Responsible tourism tips',
    items: [
      'Respect local communities, trails, rivers, and sacred sites.',
      'Carry reusable bottles and avoid leaving waste on trails or riverbanks.',
      'Choose operators who prioritize trained guides and fair local employment.',
    ],
  },
  {
    icon: HeartPulse,
    title: 'Safety preparation',
    items: [
      'Disclose medical conditions to your operator before participation.',
      'Follow weather decisions and do not pressure operators to continue during unsafe conditions.',
      'Review activity-specific checklist, equipment, and emergency guidance before arrival.',
    ],
  },
]

export function TravelGuide() {
  return (
    <>
      <section className="surface-grid border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle
            description="Practical preparation guidance for safer, smoother adventure travel across Nepal."
            eyebrow="Travel guide"
            title="Plan your adventure with confidence"
          />
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {guideSections.map((section) => {
            const Icon = section.icon
            return (
              <Card className="p-6" key={section.title}>
                <Icon aria-hidden="true" className="text-himalaya-800" size={28} />
                <h2 className="mt-4 text-xl font-bold text-slate-950">{section.title}</h2>
                <ul className="mt-4 grid gap-3">
                  {section.items.map((item) => (
                    <li className="flex gap-3 text-sm leading-6 text-slate-700" key={item}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-himalaya-700" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
          <Card className="border-rhododendron-200 bg-rhododendron-50 p-6 lg:col-span-2">
            <AlertTriangle aria-hidden="true" className="text-rhododendron-700" size={28} />
            <h2 className="mt-4 text-xl font-bold text-rhododendron-950">Safety reminder</h2>
            <p className="mt-3 text-sm leading-6 text-rhododendron-900">
              This guide supports preparation only. Always follow licensed operators, local
              authorities, current weather, personal health advice, and on-site safety briefings.
            </p>
          </Card>
        </div>
      </section>
    </>
  )
}
