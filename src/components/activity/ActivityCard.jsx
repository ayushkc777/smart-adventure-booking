import { CalendarDays, GitCompare, Heart, MapPin, ShieldCheck, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useExperience } from '../../context/useExperience'
import { safetyScore } from '../../utils/adventureLogic'
import { formatCurrency } from '../../utils/formatters'
import { Badge, RiskBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { SafeImage } from '../ui/SafeImage'

export function ActivityCard({ activity }) {
  const { compareIds, toggleCompare, toggleWishlist, wishlistIds } = useExperience()
  const isSaved = wishlistIds.includes(activity.id)
  const isCompared = compareIds.includes(activity.id)

  return (
    <Card
      as="article"
      className="group overflow-hidden hover:-translate-y-1 hover:shadow-[var(--shadow-premium-lg)]"
    >
      <div className="relative">
        <Link className="block aspect-[4/3] overflow-hidden" to={`/activities/${activity.id}`}>
          <SafeImage
            alt={activity.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
            src={activity.image}
          />
        </Link>
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <div className="flex flex-wrap gap-2">
            <RiskBadge risk={activity.riskLevel} />
            <Badge className="bg-white/90 text-himalaya-900 ring-white/80" variant="default">
              {activity.type}
            </Badge>
          </div>
          <button
            aria-label={isSaved ? 'Remove from wishlist' : 'Save activity'}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/95 shadow-sm transition hover:scale-105 ${
              isSaved ? 'text-rhododendron-600' : 'text-slate-700'
            }`}
            onClick={() => toggleWishlist(activity.id)}
            type="button"
          >
            <Heart aria-hidden="true" className={isSaved ? 'fill-rhododendron-600' : ''} size={19} />
          </button>
        </div>
      </div>

      <div className="grid gap-5 p-5">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <MapPin aria-hidden="true" size={16} />
            {activity.area}
          </p>
          <Link to={`/activities/${activity.id}`}>
            <h3 className="mt-2 line-clamp-2 text-xl font-bold leading-snug text-slate-950 transition group-hover:text-himalaya-800">
              {activity.name}
            </h3>
          </Link>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
            {activity.shortDescription}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
          <Card className="rounded-xl bg-slate-50 p-3 shadow-none">
            <span className="flex items-center gap-2 font-semibold">
              <CalendarDays aria-hidden="true" size={16} />
              {activity.duration}
            </span>
          </Card>
          <Card className="rounded-xl bg-slate-50 p-3 shadow-none">
            <span className="flex items-center gap-2 font-semibold">
              <ShieldCheck aria-hidden="true" className="text-emerald-700" size={16} />
              {safetyScore(activity)} safety
            </span>
          </Card>
          <Card className="rounded-xl bg-slate-50 p-3 shadow-none">
            <span className="font-semibold">{activity.difficulty}</span>
          </Card>
          <Card className="rounded-xl bg-slate-50 p-3 shadow-none">
            <span className="flex items-center gap-1 font-semibold">
              <Star aria-hidden="true" className="fill-gold-500 text-gold-500" size={16} />
              {activity.rating} ({activity.reviewCount})
            </span>
          </Card>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              From
            </p>
            <p className="text-2xl font-bold text-slate-950">{formatCurrency(activity.priceFrom)}</p>
          </div>
          <button
            aria-label={isCompared ? 'Remove from comparison' : 'Add to comparison'}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold transition hover:-translate-y-0.5 ${
              isCompared
                ? 'border-rhododendron-200 bg-rhododendron-50 text-rhododendron-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-himalaya-50 hover:text-himalaya-900'
            }`}
            onClick={() => toggleCompare(activity.id)}
            type="button"
          >
            <GitCompare aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="grid grid-cols-[0.85fr_1fr] gap-3">
          <Button to={`/activities/${activity.id}`} variant="secondary">
            Details
          </Button>
          <Button to={`/booking/${activity.id}`} variant="accent">
            Book now
          </Button>
        </div>
      </div>
    </Card>
  )
}
