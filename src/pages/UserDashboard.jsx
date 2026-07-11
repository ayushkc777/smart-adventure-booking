import { useEffect, useState } from 'react'
import { Bell, CalendarCheck, Clock, Heart, ShieldCheck, Star, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getNotifications } from '../api/notificationApi'
import { ActivityCard } from '../components/activity/ActivityCard'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'
import { useAuth } from '../context/useAuth'
import { useExperience } from '../context/useExperience'
import { usePlatform } from '../context/usePlatform'
import { recommendActivities } from '../utils/adventureLogic'
import { formatCurrency } from '../utils/formatters'
import { todayDateString } from '../utils/validation'

export function UserDashboard() {
  const { currentUser, userBookings } = useAuth()
  const { activities } = usePlatform()
  const { recentlyViewedIds, wishlistIds } = useExperience()
  const [notifications, setNotifications] = useState([])
  const today = todayDateString()
  const upcomingBookings = userBookings.filter((booking) => booking.date >= today)
  const pastBookings = userBookings.filter((booking) => booking.date < today)
  const totalSpend = userBookings.reduce((total, booking) => total + booking.total, 0)
  const savedActivities = wishlistIds
    .map((activityId) => activities.find((activity) => activity.id === activityId))
    .filter(Boolean)
  const recentlyViewed = recentlyViewedIds
    .map((activityId) => activities.find((activity) => activity.id === activityId))
    .filter(Boolean)
  const recommendedActivities = recommendActivities(activities, {
    activityType: savedActivities[0]?.type ?? '',
    budget: 'all',
    duration: 5,
    experienceLevel: 'Intermediate',
    groupSize: 2,
    location: savedActivities[0]?.location ?? '',
    riskComfort: 'Medium',
  }).map((item) => item.activity)

  useEffect(() => {
    let ignore = false
    async function loadNotifications() {
      try {
        const items = await getNotifications()
        if (!ignore) setNotifications(items)
      } catch {
        if (!ignore) setNotifications([])
      }
    }

    loadNotifications()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <>
      <section className="surface-grid border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar name={currentUser.fullName} photo={currentUser.profilePhoto} size="lg" />
            <SectionTitle
              description="Track bookings, saved activities, safety reminders, and personalized adventure recommendations."
              eyebrow="Traveler dashboard"
              title={`Welcome, ${currentUser.fullName}`}
            />
          </div>
          <Button to="/user/profile" variant="outline">
            Manage profile
          </Button>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-4">
            <Metric icon={CalendarCheck} label="Upcoming bookings" value={upcomingBookings.length} />
            <Metric icon={Clock} label="Past bookings" value={pastBookings.length} />
            <Metric icon={WalletCards} label="Estimated total" value={formatCurrency(totalSpend)} />
            <Metric icon={Heart} label="Saved activities" value={savedActivities.length} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-950">Upcoming bookings</h2>
              {upcomingBookings.length ? (
                <div className="mt-5 grid gap-4">
                  {upcomingBookings.slice(0, 3).map((booking) => (
                    <BookingRow booking={booking} key={booking.id} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  action="Explore activities"
                  text="You do not have upcoming booking requests yet."
                  to="/activities"
                />
              )}
              {userBookings.length ? (
                <Link className="mt-5 inline-block text-sm font-bold text-himalaya-800" to="/user/bookings">
                  View all bookings
                </Link>
              ) : null}
            </Card>

            <div className="grid gap-6">
              <Card className="p-6" id="notifications">
                <Bell aria-hidden="true" className="text-rhododendron-700" size={28} />
                <h2 className="mt-4 text-xl font-bold text-slate-950">Notifications</h2>
                <div className="mt-4 grid gap-3 text-sm text-slate-700">
                  {notifications.length ? (
                    notifications.slice(0, 3).map((notification) => (
                      <p className="rounded-xl bg-slate-50 p-4" key={notification._id ?? notification.id}>
                        <strong className="block text-slate-950">{notification.title}</strong>
                        {notification.message}
                      </p>
                    ))
                  ) : (
                    <>
                      <p className="rounded-xl bg-slate-50 p-4">Review weather and operator messages before travel.</p>
                      <p className="rounded-xl bg-slate-50 p-4">Save emergency contacts offline before remote trips.</p>
                      <p className="rounded-xl bg-slate-50 p-4">Compare operator safety ratings before booking high-risk activities.</p>
                    </>
                  )}
                </div>
              </Card>
              <Card className="p-6">
                <ShieldCheck aria-hidden="true" className="text-emerald-700" size={30} />
                <h2 className="mt-4 text-xl font-bold text-slate-950">Safety reminder</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Check medical warnings, equipment requirements, and emergency guidance before
                  every activity.
                </p>
                <Button className="mt-5" to="/safety" variant="secondary">
                  Review safety guidance
                </Button>
              </Card>
            </div>
          </div>

          <DashboardActivitySection
            activities={savedActivities}
            emptyAction="Browse activities"
            emptyText="Saved activities will appear here."
            id="saved-activities"
            title="Saved activities"
          />
          <DashboardActivitySection
            activities={recentlyViewed}
            emptyAction="Explore activities"
            emptyText="Activities you open will appear here."
            id="recent-activity"
            title="Recently viewed"
          />
          <DashboardActivitySection
            activities={recommendedActivities}
            emptyAction="Open planner"
            emptyText="Recommendations appear after the catalog loads."
            title="Recommended adventures"
          />
        </div>
      </section>
    </>
  )
}

function Metric({ icon: Icon, label, value }) {
  return (
    <Card className="p-6 hover:-translate-y-1 hover:shadow-[var(--shadow-premium-lg)]">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-himalaya-50 text-himalaya-800">
        <Icon aria-hidden="true" size={24} />
      </span>
      <p className="mt-5 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
    </Card>
  )
}

function BookingRow({ booking }) {
  return (
    <div className="grid gap-4 rounded-xl bg-slate-50 p-5 md:grid-cols-4">
      <span>
        <strong className="block text-slate-950">Activity</strong>
        <span className="text-sm text-slate-600">{booking.activityName}</span>
      </span>
      <span>
        <strong className="block text-slate-950">Operator</strong>
        <span className="text-sm text-slate-600">{booking.operatorName}</span>
      </span>
      <span>
        <strong className="block text-slate-950">Date</strong>
        <span className="text-sm text-slate-600">{booking.date}</span>
      </span>
      <span>
        <strong className="block text-slate-950">Status</strong>
        <span className="text-sm text-slate-600">{booking.status}</span>
      </span>
    </div>
  )
}

function EmptyState({ action, text, to }) {
  return (
    <div className="mt-5 rounded-xl bg-slate-50 p-5">
      <p className="text-sm text-slate-600">{text}</p>
      <Button className="mt-4" to={to} variant="accent">
        {action}
      </Button>
    </div>
  )
}

function DashboardActivitySection({ activities, emptyAction, emptyText, id, title }) {
  return (
    <section id={id}>
      <div className="mb-5 flex items-center gap-2">
        <Star aria-hidden="true" className="text-gold-500" size={20} />
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      </div>
      {activities.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {activities.slice(0, 3).map((activity) => (
            <ActivityCard activity={activity} key={activity.id} />
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-sm text-slate-600">{emptyText}</p>
          <Button className="mt-4" to="/activities" variant="secondary">
            {emptyAction}
          </Button>
        </Card>
      )}
    </section>
  )
}
