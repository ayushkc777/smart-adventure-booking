import { useMemo, useState } from 'react'
import { GitCompare, SlidersHorizontal } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { ActivityCard } from '../components/activity/ActivityCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'
import { useExperience } from '../context/useExperience'
import { usePlatform } from '../context/usePlatform'
import {
  budgetRanges,
  durationRanges,
  matchesActivityFilters,
  ratingRanges,
  sortActivities,
} from '../utils/adventureLogic'
import { riskLevels } from '../data/activities'

const difficultyOptions = ['Beginner', 'Moderate', 'Challenging', 'Advanced']
const seasonOptions = ['March', 'April', 'May', 'September', 'October', 'November', 'December']
const sortOptions = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: low to high', value: 'price-low' },
  { label: 'Price: high to low', value: 'price-high' },
  { label: 'Rating', value: 'rating' },
  { label: 'Popularity', value: 'popularity' },
  { label: 'Safety score', value: 'safety' },
]

export function Activities() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const {
    activities,
    activityTypes,
    catalogError,
    catalogLoading,
    locations,
    provinces,
    refreshCatalog,
  } = usePlatform()
  const { compareIds } = useExperience()
  const destinationOptions = [...new Set([...locations, ...provinces])]
  const filters = useMemo(
    () => ({
      difficulty: searchParams.get('difficulty') ?? '',
      duration: searchParams.get('duration') ?? 'all',
      location: searchParams.get('location') ?? '',
      price: searchParams.get('price') ?? 'all',
      q: searchParams.get('q') ?? '',
      rating: searchParams.get('rating') ?? 'all',
      risk: searchParams.get('risk') ?? '',
      season: searchParams.get('season') ?? '',
      sort: searchParams.get('sort') ?? 'recommended',
      type: searchParams.get('type') ?? '',
    }),
    [searchParams],
  )

  function updateFilter(name, value) {
    const next = new URLSearchParams(searchParams)
    if (value && value !== 'all') {
      next.set(name, value)
    } else {
      next.delete(name)
    }
    setSearchParams(next, { replace: true })
  }

  const filteredActivities = useMemo(() => {
    const filtered = activities.filter((activity) => matchesActivityFilters(activity, filters))
    return sortActivities(filtered, filters.sort)
  }, [activities, filters])

  return (
    <>
      <section className="surface-grid border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle
            action={
              compareIds.length ? (
                <Button icon={GitCompare} to="/compare" variant="accent">
                  Compare {compareIds.length}
                </Button>
              ) : null
            }
            description="Search by destination, activity type, budget, duration, difficulty, risk, season, rating, and safety score."
            eyebrow="Activities"
            title="Find and compare Nepal adventures"
          />

          <div className="mb-4 md:hidden">
            <Button
              aria-expanded={filtersOpen}
              className="w-full"
              icon={SlidersHorizontal}
              onClick={() => setFiltersOpen((current) => !current)}
              variant="secondary"
            >
              {filtersOpen ? 'Hide filters' : 'Show filters'}
            </Button>
          </div>

          <Card className={`${filtersOpen ? 'block' : 'hidden'} p-5 md:block md:p-6`}>
            <div className="mb-5 flex items-center gap-3 text-slate-950">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-himalaya-50 text-himalaya-800">
                <SlidersHorizontal aria-hidden="true" size={20} />
              </span>
              <div>
                <h2 className="text-lg font-bold">Search and filters</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Narrow options by budget, safety comfort, season, and activity style.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <FilterInput
                label="Keyword"
                onChange={(value) => updateFilter('q', value)}
                placeholder="Search activity or destination"
                value={filters.q}
              />
              <FilterSelect
                label="Province or location"
                onChange={(value) => updateFilter('location', value)}
                options={[{ label: 'All destinations', value: '' }, ...destinationOptions.map((item) => ({ label: item, value: item }))]}
                value={filters.location}
              />
              <FilterSelect
                label="Activity type"
                onChange={(value) => updateFilter('type', value)}
                options={[{ label: 'All types', value: '' }, ...activityTypes.map((type) => ({ label: type, value: type }))]}
                value={filters.type}
              />
              <FilterSelect
                label="Price range"
                onChange={(value) => updateFilter('price', value)}
                options={budgetRanges.map((range) => ({ label: range.label, value: range.value }))}
                value={filters.price}
              />
              <FilterSelect
                label="Duration"
                onChange={(value) => updateFilter('duration', value)}
                options={durationRanges.map((range) => ({ label: range.label, value: range.value }))}
                value={filters.duration}
              />
              <FilterSelect
                label="Difficulty"
                onChange={(value) => updateFilter('difficulty', value)}
                options={[{ label: 'Any difficulty', value: '' }, ...difficultyOptions.map((item) => ({ label: item, value: item }))]}
                value={filters.difficulty}
              />
              <FilterSelect
                label="Risk level"
                onChange={(value) => updateFilter('risk', value)}
                options={[{ label: 'All risks', value: '' }, ...riskLevels.map((risk) => ({ label: risk, value: risk }))]}
                value={filters.risk}
              />
              <FilterSelect
                label="Best season"
                onChange={(value) => updateFilter('season', value)}
                options={[{ label: 'Any season', value: '' }, ...seasonOptions.map((season) => ({ label: season, value: season }))]}
                value={filters.season}
              />
              <FilterSelect
                label="Rating"
                onChange={(value) => updateFilter('rating', value)}
                options={ratingRanges.map((range) => ({ label: range.label, value: range.value }))}
                value={filters.rating}
              />
              <FilterSelect
                label="Sort by"
                onChange={(value) => updateFilter('sort', value)}
                options={sortOptions}
                value={filters.sort}
              />
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={() => setSearchParams({}, { replace: true })} variant="outline">
                Reset filters
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {catalogLoading ? (
            <Card className="p-10 text-center">
              <h2 className="text-2xl font-bold text-slate-950">Loading activities</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Fetching the latest activity catalogue from the booking API.
              </p>
            </Card>
          ) : catalogError ? (
            <Card className="p-10 text-center" role="alert">
              <h2 className="text-2xl font-bold text-slate-950">Activity catalogue unavailable</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {catalogError}
              </p>
              <Button className="mt-6" onClick={refreshCatalog} variant="accent">
                Try again
              </Button>
            </Card>
          ) : (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-600">
                  Showing {filteredActivities.length} of {activities.length} activities
                </p>
                {compareIds.length ? (
                  <Link className="text-sm font-bold text-himalaya-800" to="/compare">
                    View comparison
                  </Link>
                ) : null}
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredActivities.map((activity) => (
                  <ActivityCard activity={activity} key={activity.id} />
                ))}
              </div>
            </>
          )}
          {!catalogLoading && !catalogError && filteredActivities.length === 0 ? (
            <Card className="mt-8 p-10 text-center">
              <h2 className="text-2xl font-bold text-slate-950">
                {activities.length ? 'No activities found' : 'No activities available'}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                {activities.length
                  ? 'Try widening your budget, changing the season, or removing one of the risk or difficulty filters.'
                  : 'The booking API returned an empty catalogue. Please check the backend seed data or add activities in the admin dashboard.'}
              </p>
              {activities.length ? (
                <Button className="mt-6" onClick={() => setSearchParams({}, { replace: true })} variant="accent">
                  Clear filters
                </Button>
              ) : null}
            </Card>
          ) : null}
        </div>
      </section>
    </>
  )
}

function FilterInput({ label, onChange, placeholder, value }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        className="premium-input w-full"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  )
}

function FilterSelect({ label, onChange, options, value }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <select
        className="premium-select w-full"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
