import { GitCompare, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'
import { SafeImage } from '../components/ui/SafeImage'
import { useExperience } from '../context/useExperience'
import { usePlatform } from '../context/usePlatform'
import { safetyScore } from '../utils/adventureLogic'
import { formatCurrency } from '../utils/formatters'

const comparisonRows = [
  ['Starting price', (activity) => formatCurrency(activity.priceFrom)],
  ['Risk level', (activity) => activity.riskLevel],
  ['Duration', (activity) => activity.duration],
  ['Difficulty', (activity) => activity.difficulty],
  ['Safety score', (activity) => `${safetyScore(activity)}/100`],
  ['Best season', (activity) => activity.bestSeason],
  ['Location', (activity) => activity.location],
  [
    'Operators',
    (activity) =>
      activity.operators.filter((operator) => (operator.status ?? 'active') === 'active').length,
  ],
  ['Rating', (activity) => `${activity.rating}/5`],
]

export function Compare() {
  const { activities } = usePlatform()
  const { clearCompare, compareIds, toggleCompare } = useExperience()
  const comparedActivities = compareIds
    .map((activityId) => activities.find((activity) => activity.id === activityId))
    .filter(Boolean)

  return (
    <>
      <section className="surface-grid border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle
            action={
              comparedActivities.length ? (
                <Button icon={Trash2} onClick={clearCompare} variant="secondary">
                  Clear comparison
                </Button>
              ) : null
            }
            description="Compare up to three activities side by side by price, risk, duration, safety, operators, and traveler rating."
            eyebrow="Compare"
            title="Activity comparison"
          />
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {comparedActivities.length ? (
            <Card className="overflow-hidden">
              <div
                aria-label="Mobile activity comparison"
                className="grid gap-4 p-4 sm:hidden"
                role="region"
              >
                {comparedActivities.map((activity) => (
                  <article className="rounded-xl border border-slate-200 bg-white p-4" key={activity.id}>
                    <div className="grid grid-cols-[5rem_1fr] gap-3">
                      <SafeImage
                        alt=""
                        className="aspect-square w-20 rounded-xl object-cover"
                        src={activity.image}
                      />
                      <div>
                        <h2 className="font-bold text-slate-950">{activity.name}</h2>
                        <p className="mt-1 text-sm text-slate-600">{activity.location}</p>
                      </div>
                    </div>
                    <dl className="mt-4 divide-y divide-slate-100">
                      {comparisonRows.map(([label, getValue]) => (
                        <div className="flex justify-between gap-4 py-2 text-sm" key={label}>
                          <dt className="font-semibold text-slate-600">{label}</dt>
                          <dd className="text-right font-bold text-slate-900">{getValue(activity)}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button size="sm" to={`/booking/${activity.id}`} variant="accent">
                        Book
                      </Button>
                      <Button
                        icon={Trash2}
                        onClick={() => toggleCompare(activity.id)}
                        size="sm"
                        variant="secondary"
                      >
                        Remove
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <caption className="sr-only">
                    Side-by-side activity comparison by price, risk, duration, safety, season, location, and rating
                  </caption>
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Criteria</th>
                      {comparedActivities.map((activity) => (
                        <th className="px-5 py-3" key={activity.id}>
                          <div className="grid gap-3">
                            <SafeImage
                              alt={activity.name}
                              className="aspect-[16/9] w-56 rounded-xl object-cover"
                              src={activity.image}
                            />
                            <span className="text-base normal-case text-slate-950">{activity.name}</span>
                            <Button size="sm" to={`/booking/${activity.id}`} variant="accent">
                              Book
                            </Button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comparisonRows.map(([label, getValue]) => (
                      <tr key={label}>
                        <td className="bg-slate-50 px-5 py-4 font-bold text-slate-950">{label}</td>
                        {comparedActivities.map((activity) => (
                          <td className="px-5 py-4 text-slate-700" key={activity.id}>
                            {getValue(activity)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="bg-slate-50 px-5 py-4 font-bold text-slate-950">Action</td>
                      {comparedActivities.map((activity) => (
                        <td className="px-5 py-4" key={activity.id}>
                          <Button
                            icon={Trash2}
                            onClick={() => toggleCompare(activity.id)}
                            size="sm"
                            variant="secondary"
                          >
                            Remove
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <GitCompare aria-hidden="true" className="mx-auto text-himalaya-800" size={42} />
              <h2 className="mt-4 text-2xl font-bold text-slate-950">No activities selected</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Add activities from cards or details pages to compare pricing, safety, difficulty,
                season, and operator coverage.
              </p>
              <Button className="mt-6" to="/activities" variant="accent">
                Browse activities
              </Button>
            </Card>
          )}
        </div>
      </section>
    </>
  )
}
