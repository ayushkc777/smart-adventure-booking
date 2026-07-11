import { Navigate, useParams } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'
import { usePlatform } from '../context/usePlatform'
import { operatorProfiles } from '../utils/adventureLogic'

export function OperatorProfile() {
  const { id } = useParams()
  const { activities, catalogError, catalogLoading, refreshCatalog, reviews } = usePlatform()
  const operator = operatorProfiles(activities).find((item) => item.id === id)

  if (catalogLoading) {
    return (
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="p-10 text-center">
            <h1 className="text-2xl font-bold text-slate-950">Loading operator profile</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Fetching current operator details from the booking API.
            </p>
          </Card>
        </div>
      </section>
    )
  }

  if (!operator && catalogError) {
    return (
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="p-10 text-center" role="alert">
            <AlertTriangle aria-hidden="true" className="mx-auto text-rhododendron-700" size={42} />
            <h1 className="mt-4 text-2xl font-bold text-slate-950">Operator profile unavailable</h1>
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

  if (!operator) {
    return <Navigate replace to="/activities" />
  }

  const operatorReviews = reviews.filter(
    (review) => review.operatorId === operator.id || (!review.operatorId && review.operator === operator.name),
  )

  return (
    <>
      <section className="surface-grid border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle
            description="Operator profile with certification, safety indicators, activity coverage, and traveler feedback."
            eyebrow="Operator profile"
            title={operator.name}
          />
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <Card className="p-6">
            <Badge variant="success">Certified operator</Badge>
            <h2 className="mt-5 text-2xl font-bold text-slate-950">{operator.name}</h2>
            <p className="mt-2 text-sm text-slate-600">License: {operator.license}</p>
            <div className="mt-6 grid gap-4">
              {[
                ['Safety score', `${operator.safetyRating}/5`],
                ['Years operating', operator.guideExperience],
                ['Response rate', `${operator.responseRate}%`],
                ['Languages', operator.languages.join(', ')],
                ['Insurance availability', operator.insurance ? 'Available' : 'Confirm with operator'],
              ].map(([label, value]) => (
                <div className="rounded-xl bg-slate-50 p-4" key={label}>
                  <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                  <p className="mt-1 font-bold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-950">Activities offered</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {operator.activities.map((activity) => (
                  <div className="rounded-xl border border-slate-200 bg-white p-5" key={activity.id}>
                    <p className="font-bold text-slate-950">{activity.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {activity.type} in {activity.location}
                    </p>
                    <Button className="mt-4" size="sm" to={`/activities/${activity.id}`} variant="secondary">
                      View activity
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-950">Reviews</h2>
              {operatorReviews.length ? (
                <div className="mt-5 grid gap-4">
                  {operatorReviews.map((review) => (
                    <div className="rounded-xl bg-slate-50 p-5" key={review.id}>
                      <p className="font-bold text-slate-950">{review.userName}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {review.rating}/5 overall - {review.safetyRating}/5 safety
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">
                  Traveler reviews for this operator will appear here after bookings are reviewed.
                </p>
              )}
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}
