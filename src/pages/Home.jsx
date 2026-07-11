import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  HelpCircle,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react'
import { ActivityCard } from '../components/activity/ActivityCard'
import { SmartTripPlanner } from '../components/activity/SmartTripPlanner'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SafeImage } from '../components/ui/SafeImage'
import { SectionTitle } from '../components/ui/SectionTitle'
import { useExperience } from '../context/useExperience'
import { usePlatform } from '../context/usePlatform'
import { operatorProfiles, safetyScore } from '../utils/adventureLogic'
import { average, formatCurrency } from '../utils/formatters'
import { subscribeNewsletter } from '../utils/newsletter'

const testimonials = [
  {
    name: 'Anisha K.',
    route: 'Pokhara paragliding',
    text: 'The operator comparison made the decision easy. I could see the price, safety rating, and inclusions before sending my booking request.',
  },
  {
    name: 'Daniel R.',
    route: 'Everest Base Camp trek',
    text: 'The safety guidance helped our group prepare properly, especially the altitude notes and emergency contact reminders.',
  },
  {
    name: 'Maya S.',
    route: 'Short Pokhara escape',
    text: 'Saved activities, reviews, and transparent prices made planning a weekend adventure feel effortless.',
  },
]

const faqs = [
  ['Can I compare operators before booking?', 'Yes. Activity pages show operator prices, safety ratings, inclusions, license details, and cancellation notes side by side.'],
  ['Is safety advice guaranteed?', 'Safety guidance is advisory. Final activity decisions depend on licensed operators, weather, health, and local conditions.'],
  ['Do I need an account to browse?', 'No. You can browse, compare, and read safety information without signing in. Booking requests require an account.'],
  ['Can I save activities for later?', 'Yes. Use the heart button on activity cards or details pages to build your wishlist.'],
]

export function Home() {
  const navigate = useNavigate()
  const { showToast } = useExperience()
  const {
    activities,
    activityTypes,
    catalogError,
    catalogLoading,
    locations,
    refreshCatalog,
  } = usePlatform()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false)
  const featuredActivities = useMemo(
    () => [...activities].sort((a, b) => b.popularityScore - a.popularityScore).slice(0, 6),
    [activities],
  )
  const destinations = useMemo(
    () =>
      [...new Map(activities.map((activity) => [activity.location, activity])).values()]
        .slice(0, 5)
        .map((activity) => ({
          count: activities.filter((item) => item.location === activity.location).length,
          image: activity.image,
          location: activity.location,
          province: activity.province,
        })),
    [activities],
  )
  const topOperators = useMemo(
    () => operatorProfiles(activities).sort((a, b) => b.safetyRating - a.safetyRating).slice(0, 5),
    [activities],
  )
  const bestPriceActivities = useMemo(
    () => [...activities].sort((a, b) => a.priceFrom - b.priceFrom).slice(0, 3),
    [activities],
  )
  const startingPrice = activities.length
    ? formatCurrency(Math.min(...activities.map((activity) => activity.priceFrom)))
    : 'Unavailable'

  function handleSearch(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (location) params.set('location', location)
    navigate(`/activities?${params.toString()}`)
  }

  async function handleNewsletter(event) {
    event.preventDefault()
    if (newsletterSubmitting) return
    const formElement = event.currentTarget
    const email = new FormData(formElement).get('email')
    setNewsletterSubmitting(true)
    const result = await subscribeNewsletter(email)
    setNewsletterSubmitting(false)
    if (!result.ok) {
      showToast(result.message, 'info')
      return
    }
    formElement.reset()
    showToast('Thanks for joining the adventure travel newsletter.')
  }

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <SafeImage
          alt="Himalayan adventure landscape in Nepal"
          className="absolute inset-0 h-full w-full object-cover"
          src="/images/paragliding.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/65 to-slate-950/35" />
        <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl content-center gap-10 px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <Badge className="bg-white/15 text-white ring-white/20" variant="default">
              Trusted Nepal adventure marketplace
            </Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-[1.05] md:text-7xl">
              Compare and book Nepal adventures with confidence
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100 md:text-lg">
              Explore curated activities, compare operator prices, review safety guidance, and
              choose the experience that matches your schedule, budget, and comfort level.
            </p>
          </div>

          <form
            className="grid gap-4 rounded-xl border border-white/20 bg-white p-4 text-slate-950 shadow-[var(--shadow-premium-lg)] md:grid-cols-[1.2fr_1fr_auto]"
            onSubmit={handleSearch}
          >
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Search activity
              <span className="relative">
                <Search
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  aria-label="Search activities"
                  className="premium-input w-full pl-11"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Paragliding, trekking, rafting..."
                  value={query}
                />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Destination
              <select
                className="premium-select"
                onChange={(event) => setLocation(event.target.value)}
                value={location}
              >
                <option value="">Any Nepal destination</option>
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <Button className="self-end" icon={ArrowRight} iconPosition="right" size="lg" type="submit" variant="accent">
              Search
            </Button>
          </form>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [activities.length, 'Curated adventures'],
              [
                activities.reduce(
                  (total, activity) =>
                    total +
                    activity.operators.filter(
                      (operator) => (operator.status ?? 'active') === 'active',
                    ).length,
                  0,
                ),
                'Operator prices',
              ],
              [`${average(activities.map((activity) => activity.rating)).toFixed(1)}/5`, 'Average rating'],
              [`${Math.round(average(activities.map(safetyScore)))}`, 'Average safety score'],
            ].map(([value, label]) => (
              <div
                className="rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur"
                key={label}
              >
                <p className="text-3xl font-bold">{value}</p>
                <p className="mt-1 text-sm font-medium text-slate-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!catalogLoading && catalogError ? (
        <section className="border-b border-slate-200 bg-white py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Card className="border-rhododendron-200 bg-rhododendron-50 p-5 shadow-none" role="alert">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-rhododendron-700" size={22} />
                  <div>
                    <h2 className="font-bold text-rhododendron-950">Live catalogue unavailable</h2>
                    <p className="mt-1 text-sm leading-6 text-rhododendron-900">{catalogError}</p>
                  </div>
                </div>
                <Button onClick={refreshCatalog} variant="accent">
                  Try again
                </Button>
              </div>
            </Card>
          </div>
        </section>
      ) : null}

      {!catalogLoading && !catalogError && activities.length === 0 ? (
        <section className="border-b border-slate-200 bg-white py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Card className="p-6 text-center">
              <h2 className="text-xl font-bold text-slate-950">No activities available</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                The booking API returned an empty catalogue. Add activities in the admin dashboard
                or reseed the backend database.
              </p>
            </Card>
          </div>
        </section>
      ) : null}

      <SmartTripPlanner activities={activities} activityTypes={activityTypes} locations={locations} />

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            action={<Button to="/activities" variant="secondary">Explore all</Button>}
            description="A destination-first view of Nepal’s most requested adventure regions."
            eyebrow="Popular destinations"
            title="Where travelers are booking"
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {destinations.map((destination) => (
              <Link
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-premium)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-premium-lg)]"
                key={destination.location}
                to={`/activities?location=${encodeURIComponent(destination.location)}`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <SafeImage
                    alt={destination.location}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    src={destination.image}
                  />
                </div>
                <span className="block p-5">
                  <span className="block text-lg font-bold text-slate-950">{destination.location}</span>
                  <span className="mt-1 block text-sm text-slate-600">{destination.province}</span>
                  <span className="mt-3 inline-flex rounded-full bg-himalaya-50 px-3 py-1 text-xs font-bold uppercase text-himalaya-800">
                    {destination.count} experience{destination.count > 1 ? 's' : ''}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-grid bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            action={<Button icon={ArrowRight} iconPosition="right" to="/activities" variant="secondary">View all activities</Button>}
            description="Popular activities selected by demand, reviews, safety clarity, and operator coverage."
            eyebrow="Trending adventures"
            title="Top adventure picks"
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredActivities.map((activity) => (
              <ActivityCard activity={activity} key={activity.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            description="Operator details help travelers understand licensing, safety performance, and activity coverage before booking."
            eyebrow="Top operators"
            title="Trusted local adventure partners"
          />
          <div className="grid gap-5 lg:grid-cols-5">
            {topOperators.map((operator) => (
              <Card className="p-6 hover:-translate-y-1 hover:shadow-[var(--shadow-premium-lg)]" key={operator.id}>
                <ShieldCheck aria-hidden="true" className="text-emerald-700" size={28} />
                <h3 className="mt-5 text-lg font-bold text-slate-950">{operator.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {operator.activities.length} listed experience{operator.activities.length > 1 ? 's' : ''}
                </p>
                <p className="mt-4 text-sm font-bold text-slate-950">{operator.safetyRating}/5 safety rating</p>
                <Button className="mt-5 w-full" to={`/operators/${operator.id}`} variant="secondary">
                  View profile
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="self-center">
            <SectionTitle
              description="Compare the lowest starting prices across activities and continue to full operator comparison on each activity page."
              eyebrow="Price comparison"
              title="Clear starting prices before checkout"
            />
            <Button icon={DollarSign} to="/compare" variant="primary">
              Open comparison tool
            </Button>
          </div>
          <div className="grid gap-4">
            {bestPriceActivities.map((activity, index) => (
              <Card className="grid gap-4 p-5 sm:grid-cols-[6rem_1fr_auto] sm:items-center" key={activity.id}>
                <SafeImage alt={activity.name} className="h-24 w-full rounded-xl object-cover sm:w-24" src={activity.image} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-rhododendron-700">
                    #{index + 1} value pick
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-950">{activity.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{activity.location} · {activity.operators.length} operators</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-sm font-semibold text-slate-500">From</p>
                  <p className="text-2xl font-bold text-slate-950">{formatCurrency(activity.priceFrom)}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <SectionTitle
              description="Every activity includes risk level, safety score, preparation checklist, medical warnings, equipment guidance, and emergency planning notes."
              eyebrow="Safety"
              tone="dark"
              title="Understand risk before the booking form"
            />
            <Button icon={ShieldCheck} to="/safety" variant="gold">
              Review safety guidance
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Risk level and safety score on every activity',
              'Medical warnings visible before checkout',
              'Emergency contact required during booking',
              'Operator safety ratings shown beside price',
            ].map((item) => (
              <div className="flex gap-3 rounded-xl border border-white/10 bg-white/10 p-5" key={item}>
                <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-gold-400" size={20} />
                <p className="text-sm font-semibold leading-6 text-slate-100">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div>
            <SectionTitle
              description="Feedback from travelers who used operator comparison, safety preparation, and centralized booking."
              eyebrow="Testimonials"
              title="What travelers say"
            />
            <div className="grid gap-5">
              {testimonials.map((testimonial) => (
                <Card className="p-6" key={testimonial.name}>
                  <div className="flex gap-1 text-gold-500">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <Star aria-hidden="true" className="fill-gold-500" key={item} size={16} />
                    ))}
                  </div>
                  <p className="mt-4 text-base leading-7 text-slate-700">{testimonial.text}</p>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="font-bold text-slate-950">{testimonial.name}</p>
                    <p className="text-sm font-semibold text-himalaya-800">{testimonial.route}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid content-start gap-5">
            <Card className="p-6">
              <TrendingUp aria-hidden="true" className="text-himalaya-800" size={30} />
              <h3 className="mt-4 text-2xl font-bold text-slate-950">Platform statistics</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Stat label="Starting from" value={startingPrice} />
                <Stat label="Destinations" value={locations.length} />
                <Stat label="Reviews tracked" value={activities.reduce((total, activity) => total + activity.reviewCount, 0)} />
                <Stat label="Operators" value={activities.reduce((total, activity) => total + activity.operators.length, 0)} />
              </div>
            </Card>

            <Card className="p-6">
              <HelpCircle aria-hidden="true" className="text-rhododendron-700" size={30} />
              <h3 className="mt-4 text-2xl font-bold text-slate-950">FAQ</h3>
              <div className="mt-5 grid gap-3">
                {faqs.map(([question, answer]) => (
                  <details className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={question}>
                    <summary className="cursor-pointer font-bold text-slate-950">{question}</summary>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
                  </details>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-himalaya-900 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div>
            <Sparkles aria-hidden="true" className="text-gold-400" size={32} />
            <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              Seasonal ideas and safety reminders, straight to your inbox.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-himalaya-100">
              Get trip planning notes, operator updates, and practical adventure travel guidance
              for Nepal.
            </p>
          </div>
          <Card className="p-4 md:p-5">
            <form className="grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={handleNewsletter}>
              <label className="relative">
                <Mail
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  aria-label="Newsletter email address"
                  className="premium-input w-full pl-11"
                  placeholder="Email address"
                  required
                  name="email"
                  type="email"
                />
              </label>
              <Button disabled={newsletterSubmitting} type="submit" variant="accent">
                {newsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <p className="text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  )
}
