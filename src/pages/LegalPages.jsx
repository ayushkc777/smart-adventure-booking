import { FileCheck2, RotateCcw, ShieldCheck } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'

const pages = {
  cancellation: {
    description:
      'Clear cancellation guidance helps travelers understand timing, operator review, weather decisions, and refund expectations before booking.',
    eyebrow: 'Cancellation policy',
    icon: RotateCcw,
    sections: [
      {
        title: 'Operator availability',
        text: 'Booking requests are reviewed by the selected operator before payment instructions are shared. If the operator cannot confirm availability, travelers can choose another date, another operator, or cancel the request.',
      },
      {
        title: 'Traveler cancellation',
        text: 'Cancellation windows can vary by activity, operator, season, and required permits. Review operator notes on the activity page and keep your booking reference when contacting support.',
      },
      {
        title: 'Weather and safety changes',
        text: 'Adventure activities may be rescheduled or cancelled because of weather, water levels, visibility, trail conditions, medical concerns, or local authority guidance.',
      },
      {
        title: 'Refund coordination',
        text: 'When payment has been arranged directly with an operator, refund handling follows the confirmed operator terms. Nepal Adventure SmartBook helps travelers keep request records organized for support review.',
      },
    ],
    title: 'Fair cancellation guidance for adventure bookings',
  },
  privacy: {
    description:
      'We collect only the account, booking, and support details needed to help travelers manage adventure requests and contact operators confidently.',
    eyebrow: 'Privacy policy',
    icon: ShieldCheck,
    sections: [
      {
        title: 'Information we use',
        text: 'Account details, contact information, emergency contact, booking requests, saved preferences, and support messages are used to personalize the booking experience and organize traveler communication.',
      },
      {
        title: 'Profile photos',
        text: 'Profile photos are stored in the traveler browser for personalization. Travelers can change or remove the photo from their profile page at any time.',
      },
      {
        title: 'Booking and support records',
        text: 'Booking references and support messages are stored to help travelers and administrators review requests, status, contact details, and activity history.',
      },
      {
        title: 'Traveler control',
        text: 'Travelers can update profile details, change passwords, remove profile photos, and contact support for account-related questions.',
      },
    ],
    title: 'Privacy for traveler confidence',
  },
  terms: {
    description:
      'These terms explain how travelers use the platform to compare activities, review safety guidance, contact support, and send booking requests.',
    eyebrow: 'Terms of service',
    icon: FileCheck2,
    sections: [
      {
        title: 'Platform role',
        text: 'Nepal Adventure SmartBook helps travelers compare activities, operator pricing, safety guidance, reviews, and booking request information in one place.',
      },
      {
        title: 'Operator responsibility',
        text: 'Adventure operators remain responsible for confirming availability, licensing, equipment, activity operation, safety briefings, and local condition decisions.',
      },
      {
        title: 'Traveler responsibility',
        text: 'Travelers must provide accurate contact and emergency details, review medical warnings, follow operator instructions, and avoid activities that do not match their health or comfort level.',
      },
      {
        title: 'Safety guidance',
        text: 'Safety information is advisory and does not guarantee outcomes. Weather, health, equipment, local regulations, and operator decisions must always be followed.',
      },
    ],
    title: 'Terms for transparent adventure planning',
  },
}

export function PrivacyPolicy() {
  return <LegalPage page={pages.privacy} />
}

export function Terms() {
  return <LegalPage page={pages.terms} />
}

export function CancellationPolicy() {
  return <LegalPage page={pages.cancellation} />
}

function LegalPage({ page }) {
  const Icon = page.icon

  return (
    <>
      <section className="surface-grid bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle description={page.description} eyebrow={page.eyebrow} title={page.title} />
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-5xl gap-5 px-4 sm:px-6 lg:px-8">
          <Card className="p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-himalaya-100 text-himalaya-900">
              <Icon aria-hidden="true" size={24} />
            </span>
            <div className="mt-6 grid gap-5">
              {page.sections.map((section) => (
                <div className="rounded-xl bg-slate-50 p-5" key={section.title}>
                  <h2 className="text-lg font-bold text-slate-950">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{section.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </>
  )
}
