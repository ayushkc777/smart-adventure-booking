import { CalendarDays, Users } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'
import { useAuth } from '../context/useAuth'
import { formatCurrency } from '../utils/formatters'

export function UserBookings() {
  const { userBookings } = useAuth()

  return (
    <>
      <section className="surface-grid border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle
            description="Review your submitted booking requests and operator details in one place."
            eyebrow="My bookings"
            title="Booking requests"
          />
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {userBookings.length ? (
            <div className="grid gap-4">
              {userBookings.map((booking) => (
                <Card className="grid gap-4 p-5 lg:grid-cols-[1fr_auto]" key={booking.id}>
                  <div>
                    <p className="text-sm font-bold uppercase text-rhododendron-700">{booking.id}</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-950">{booking.activityName}</h2>
                    <p className="mt-2 text-sm text-slate-600">{booking.operatorName}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                        <CalendarDays aria-hidden="true" size={15} />
                        {booking.date}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                        <Users aria-hidden="true" size={15} />
                        {booking.people} traveler{booking.people > 1 ? 's' : ''}
                      </span>
                      <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between gap-4 lg:items-end">
                    <div className="lg:text-right">
                      <p className="text-sm font-semibold text-slate-500">Total price</p>
                      <p className="text-2xl font-bold text-slate-950">{formatCurrency(booking.total)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Button to="/booking-success" state={booking} variant="secondary">
                        View receipt
                      </Button>
                      <Button to={`/activities/${booking.activityId}`} variant="secondary">
                        View activity
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-950">No bookings yet</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Your submitted booking requests will appear here with activity, operator,
                date, traveler count, status, and total price.
              </p>
              <Button className="mt-6" to="/activities" variant="accent">
                Find an adventure
              </Button>
            </Card>
          )}
        </div>
      </section>
    </>
  )
}
