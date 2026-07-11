import { useMemo, useState } from 'react'
import { ArrowRight, GitCompare, ShieldCheck, Sparkles } from 'lucide-react'
import { useExperience } from '../../context/useExperience'
import { budgetRanges, recommendActivities, safetyScore } from '../../utils/adventureLogic'
import { formatCurrency } from '../../utils/formatters'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { SafeImage } from '../ui/SafeImage'
import { SectionTitle } from '../ui/SectionTitle'

export function SmartTripPlanner({ activities, activityTypes, locations }) {
  const { toggleCompare } = useExperience()
  const [preferences, setPreferences] = useState({
    activityType: '',
    budget: 'all',
    duration: 3,
    experienceLevel: 'Beginner',
    groupSize: 2,
    location: '',
    riskComfort: 'Medium',
  })

  const recommendations = useMemo(
    () => recommendActivities(activities, preferences),
    [activities, preferences],
  )

  function updatePreference(field, value) {
    setPreferences((current) => ({ ...current, [field]: value }))
  }

  return (
    <section className="surface-grid bg-slate-50 py-20" id="planner">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionTitle
            description="Answer a few travel preferences and get activity suggestions ranked by fit, safety, price, and season."
            eyebrow="Smart Trip Planner"
            title="Find the right Nepal adventure faster"
          />
          <Card className="grid gap-5 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <PlannerSelect
                label="Experience level"
                onChange={(value) => updatePreference('experienceLevel', value)}
                options={['Beginner', 'Intermediate', 'Expert']}
                value={preferences.experienceLevel}
              />
              <PlannerSelect
                label="Budget range"
                onChange={(value) => updatePreference('budget', value)}
                options={budgetRanges.map((range) => ({ label: range.label, value: range.value }))}
                value={preferences.budget}
              />
              <PlannerSelect
                label="Preferred location"
                onChange={(value) => updatePreference('location', value)}
                options={[{ label: 'Any destination', value: '' }, ...locations.map((location) => ({ label: location, value: location }))]}
                value={preferences.location}
              />
              <PlannerSelect
                label="Risk comfort"
                onChange={(value) => updatePreference('riskComfort', value)}
                options={['Low', 'Medium', 'High']}
                value={preferences.riskComfort}
              />
              <PlannerSelect
                label="Activity preference"
                onChange={(value) => updatePreference('activityType', value)}
                options={[{ label: 'Any activity', value: '' }, ...activityTypes.map((type) => ({ label: type, value: type }))]}
                value={preferences.activityType}
              />
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Travel duration
                <input
                  className="premium-input w-full"
                  min="1"
                  onChange={(event) => updatePreference('duration', Number(event.target.value))}
                  type="number"
                  value={preferences.duration}
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">
                Group size
                <input
                  className="premium-input w-full"
                  min="1"
                  onChange={(event) => updatePreference('groupSize', Number(event.target.value))}
                  type="number"
                  value={preferences.groupSize}
                />
              </label>
            </div>
          </Card>
        </div>

        <div className="grid gap-4">
          {recommendations.map(({ activity, match, reason }) => (
            <Card className="overflow-hidden hover:-translate-y-1 hover:shadow-[var(--shadow-premium-lg)]" key={activity.id}>
              <div className="grid gap-5 p-5 md:grid-cols-[10rem_1fr]">
                <SafeImage
                  alt={activity.name}
                  className="h-40 w-full rounded-xl object-cover md:h-full"
                  src={activity.image}
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-800">
                      <Sparkles aria-hidden="true" size={14} />
                      {match}% match
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-himalaya-100 px-3 py-1 text-xs font-bold uppercase text-himalaya-800">
                      <ShieldCheck aria-hidden="true" size={14} />
                      {safetyScore(activity)} safety
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold text-slate-950">{activity.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{reason}</p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    <span>{formatCurrency(activity.priceFrom)} estimated from price</span>
                    <span>{activity.difficulty}</span>
                    <span>{activity.bestSeason}</span>
                    <span>{activity.location}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button icon={ArrowRight} iconPosition="right" to={`/booking/${activity.id}`} variant="accent">
                      Book now
                    </Button>
                    <Button icon={GitCompare} onClick={() => toggleCompare(activity.id)} variant="secondary">
                      Compare
                    </Button>
                    <Button to={`/activities/${activity.id}`} variant="secondary">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlannerSelect({ label, onChange, options, value }) {
  const normalizedOptions = options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option,
  )

  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <select
        className="premium-select w-full"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {normalizedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
