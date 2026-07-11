import { useEffect } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  GitCompare,
  Heart,
  MapPin,
  Navigation,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { PriceComparisonTable } from '../components/activity/PriceComparisonTable'
import { ReviewCard } from '../components/activity/ReviewCard'
import { SafetyPanel } from '../components/activity/SafetyPanel'
import { ActivityCard } from '../components/activity/ActivityCard'
import { Badge, RiskBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'
import { SafeImage } from '../components/ui/SafeImage'
import { useExperience } from '../context/useExperience'
import { usePlatform } from '../context/usePlatform'
import { safetyScore } from '../utils/adventureLogic'
import { average, formatCurrency } from '../utils/formatters'

export function ActivityDetails() {
  const { id } = useParams()
  const {
    activities,
    catalogError,
    catalogLoading,
    getActivityById,
    getReviewsByActivityId,
    refreshCatalog,
  } = usePlatform()
  const { compareIds, toggleCompare, toggleWishlist, trackRecentlyViewed, wishlistIds } = useExperience()
  const activity = getActivityById(id)

  useEffect(() => {
    if (activity) trackRecentlyViewed(activity.id)
  }, [activity, trackRecentlyViewed])

  if (catalogLoading) {
    return (
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="p-10 text-center">
            <h1 className="text-2xl font-bold text-slate-950">Loading activity details</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Fetching the latest activity details from the booking API.
            </p>
          </Card>
        </div>
      </section>
    )
  }

  if (!activity && catalogError) {
    return (
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="p-10 text-center" role="alert">
            <AlertTriangle aria-hidden="true" className="mx-auto text-rhododendron-700" size={42} />
            <h1 className="mt-4 text-2xl font-bold text-slate-950">Activity details unavailable</h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              {catalogError}
            </p>
            <Button className="mt-6" onClick={refreshCatalog} variant="accent">
              Try again
            </Button>
          </Card>
        </div>
      </section>
    )
  }

  if (!activity) {
    return <Navigate replace to="/activities" />
  }

  const reviews = getReviewsByActivityId(activity.id)
  const avgSafety = reviews.length
    ? average(reviews.map((review) => review.safetyRating)).toFixed(1)
    : 'No ratings'
  const avgValue = reviews.length
    ? average(reviews.map((review) => review.valueRating)).toFixed(1)
    : 'No ratings'
  const relatedActivities = activities
    .filter((item) => item.id !== activity.id && (item.type === activity.type || item.location === activity.location))
    .slice(0, 3)
  const score = safetyScore(activity)
  const availableOperators = activity.operators.filter(
    (operator) => (operator.status ?? 'active') === 'active',
  )
  const saved = wishlistIds.includes(activity.id)
  const compared = compareIds.includes(activity.id)

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <SafeImage
          alt={activity.name}
          className="absolute inset-0 h-full w-full object-cover"
          src={activity.image}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/35" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <nav className="mb-5 text-sm font-semibold text-slate-200" aria-label="Breadcrumb">
              <Link className="hover:text-white" to="/">Home</Link>
              <span className="px-2">/</span>
              <Link className="hover:text-white" to="/activities">Activities</Link>
              <span className="px-2">/</span>
              <span>{activity.name}</span>
            </nav>
            <div className="flex flex-wrap gap-2">
              <RiskBadge risk={activity.riskLevel} />
              <Badge className="bg-white/15 text-white">{activity.type}</Badge>
              <Badge className="bg-emerald-100 text-emerald-900">{score} safety score</Badge>
            </div>
            <h1 className="mt-5 text-5xl font-bold leading-tight md:text-7xl">{activity.name}</h1>
            <p className="mt-5 text-lg leading-8 text-slate-100">{activity.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button icon={ArrowRight} iconPosition="right" to={`/booking/${activity.id}`} variant="accent">
                Book now
              </Button>
              <Button icon={GitCompare} onClick={() => toggleCompare(activity.id)} variant={compared ? 'gold' : 'secondary'}>
                Compare
              </Button>
              <Button icon={Heart} onClick={() => toggleWishlist(activity.id)} variant={saved ? 'gold' : 'secondary'}>
                {saved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-6">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
          {[
            [MapPin, activity.area],
            [Clock, activity.duration],
            [CalendarDays, activity.bestSeason],
            [Users, `Minimum age ${activity.minAge}`],
            [Star, `${activity.rating}/5 rating`],
          ].map(([Icon, value]) => (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4" key={value}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-himalaya-100 text-himalaya-900">
                <Icon aria-hidden="true" size={19} />
              </span>
              <span className="text-sm font-semibold text-slate-800">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-grid bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
          <div className="grid gap-8">
            <Card className="overflow-hidden p-2">
              <div className="grid gap-2 md:grid-cols-[1.4fr_0.8fr]">
                <SafeImage alt={activity.name} className="h-full min-h-80 rounded-xl object-cover" src={activity.gallery[0]} />
                <div className="grid gap-2">
                  {activity.gallery.slice(1, 3).map((image) => (
                    <SafeImage alt={activity.name} className="h-40 w-full rounded-xl object-cover md:h-full" key={image} src={image} />
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <SectionTitle
                description="Review the key details travelers need before comparing operators or booking."
                eyebrow="Activity overview"
                title="What travelers need to know"
              />
              <div className="grid gap-4 md:grid-cols-4">
                <InfoBox label="Starting price" value={formatCurrency(activity.priceFrom)} />
                <InfoBox label="Difficulty" value={activity.difficulty} />
                <InfoBox label="Operators" value={availableOperators.length} />
                <InfoBox label="Province" value={activity.province} />
              </div>
              <div className="mt-6 grid gap-3">
                {activity.highlights.map((highlight) => (
                  <p className="flex gap-3 text-sm leading-6 text-slate-700" key={highlight}>
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-700" size={18} />
                    {highlight}
                  </p>
                ))}
              </div>
            </Card>

            <PriceComparisonTable activity={activity} showOperatorLinks />

            <Card className="p-6">
              <SectionTitle
                description="Operator comparison beyond price helps travelers understand safety, inclusions, and cancellation terms."
                eyebrow="Operator comparison"
                title="Choose by value, not just price"
              />
              <div className="grid gap-4 md:grid-cols-3">
                {availableOperators.map((operator) => (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5" key={operator.id}>
                    <h3 className="font-bold text-slate-950">{operator.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">License {operator.license}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      {operator.safetyRating}/5 safety - {operator.valueRating}/5 value
                    </p>
                    <Button className="mt-4" size="sm" to={`/operators/${operator.id}`} variant="secondary">
                      Operator profile
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <SectionTitle
                description="Services shown here make package differences clearer before booking."
                eyebrow="Included services"
                title="What is included"
              />
              <div className="grid gap-3 md:grid-cols-2">
                {activity.includedServices.map((service) => (
                  <div className="flex gap-3 rounded-xl bg-slate-50 p-5" key={service}>
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-himalaya-800" size={19} />
                    <p className="text-sm font-semibold leading-6 text-slate-800">{service}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <SectionTitle
                description="Location metadata helps travelers plan arrival, transport, and regional safety preparation."
                eyebrow="Location"
                title="Map and meeting area"
              />
              <div className="relative min-h-72 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,#e2e8f0_1px,transparent_1px),linear-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:28px_28px]" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="rounded-xl bg-white p-6 text-center shadow-[var(--shadow-premium)]">
                    <Navigation aria-hidden="true" className="mx-auto text-himalaya-800" size={30} />
                    <p className="mt-3 font-bold text-slate-950">{activity.area}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {activity.coordinates.lat}, {activity.coordinates.lng}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <section>
              <SectionTitle
                description="Reviews separate overall satisfaction from safety and value so trust is easier to evaluate."
                eyebrow="Reviews"
                title="Ratings and traveler feedback"
              />
              <Card className="mb-5 grid gap-4 p-5 md:grid-cols-3">
                <InfoBox
                  label="Overall rating"
                  value={
                    activity.reviewCount
                      ? `${activity.rating}/5 (${activity.reviewCount})`
                      : 'No ratings'
                  }
                />
                <InfoBox
                  label="Safety rating"
                  value={reviews.length ? `${avgSafety}/5` : avgSafety}
                />
                <InfoBox
                  label="Value rating"
                  value={reviews.length ? `${avgValue}/5` : avgValue}
                />
              </Card>
              {reviews.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <h3 className="text-xl font-bold text-slate-950">No reviews yet</h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    Traveler feedback will appear here after completed experiences are reviewed.
                  </p>
                </Card>
              )}
            </section>

            {relatedActivities.length ? (
              <section>
                <SectionTitle
                  description="Similar experiences based on location or activity type."
                  eyebrow="Related activities"
                  title="You may also like"
                />
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {relatedActivities.map((item) => (
                    <ActivityCard activity={item} key={item.id} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="grid gap-5 self-start lg:sticky lg:top-28">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase text-slate-500">Safety score</p>
                  <p className="mt-1 text-3xl font-bold text-slate-950">{score}/100</p>
                </div>
                <ShieldCheck aria-hidden="true" className="text-emerald-700" size={34} />
              </div>
              <div className="mt-4 h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-emerald-600" style={{ width: `${score}%` }} />
              </div>
              <div className="mt-5">
                <p className="text-sm font-bold uppercase text-slate-500">Risk meter</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase">
                  {['Low', 'Medium', 'High'].map((risk) => (
                    <span
                      className={`rounded-full px-2 py-1 ${
                        activity.riskLevel === risk ? 'bg-rhododendron-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                      key={risk}
                    >
                      {risk}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
            <SafetyPanel activity={activity} compact={false} />
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-950">Ready to book?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Continue to a guided booking flow with date, operator, traveler details,
                optional extras, and final review.
              </p>
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">Starting from</p>
                <p className="text-3xl font-bold text-slate-950">{formatCurrency(activity.priceFrom)}</p>
              </div>
              <Button className="mt-5 w-full" to={`/booking/${activity.id}`} variant="accent">
                Start booking
              </Button>
            </Card>
          </aside>
        </div>
      </section>
    </>
  )
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
    </div>
  )
}
