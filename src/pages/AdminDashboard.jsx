import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Eye,
  Mail,
  MessageSquareText,
  Pencil,
  Phone,
  Plus,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, RiskBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { getAnalytics, getDashboardStats } from '../api/adminApi'
import { useAuth } from '../context/useAuth'
import { useExperience } from '../context/useExperience'
import { usePlatform } from '../context/usePlatform'
import { getSupportMessages, updateSupportMessageStatus } from '../api/supportApi'
import { activityTypes as defaultActivityTypes, riskLevels } from '../data/activities'
import { average, formatCurrency } from '../utils/formatters'

const bookingStatuses = [
  'Pending confirmation',
  'Pending safety review',
  'Awaiting payment',
  'Confirmed',
  'Completed',
  'Cancelled',
  'Account removed',
]
const supportStatuses = ['New', 'In review', 'Resolved']

const pageCopy = {
  dashboard: {
    eyebrow: 'Operations',
    title: 'Dashboard',
    description: 'Monitor bookings, activities, reviews, pricing, and platform health at a glance.',
  },
  activities: {
    eyebrow: 'Catalog',
    title: 'Activities',
    description: 'Add, update, or remove adventure experiences shown on the public website.',
  },
  operators: {
    eyebrow: 'Partners',
    title: 'Operators',
    description: 'Review listed operators, licenses, activity coverage, and service quality indicators.',
  },
  prices: {
    eyebrow: 'Pricing',
    title: 'Price Comparison',
    description: 'Maintain operator prices so travelers can compare options clearly before booking.',
  },
  bookings: {
    eyebrow: 'Requests',
    title: 'Bookings',
    description: 'Review booking requests and update their confirmation status.',
  },
  reviews: {
    eyebrow: 'Trust',
    title: 'Reviews',
    description: 'Manage traveler feedback, safety ratings, and value ratings.',
  },
  users: {
    eyebrow: 'Accounts',
    title: 'Users',
    description: 'View registered traveler and administrator accounts.',
  },
  support: {
    eyebrow: 'Support',
    title: 'Support Messages',
    description: 'Review traveler inquiries submitted through the public contact form.',
  },
  analytics: {
    eyebrow: 'Insights',
    title: 'Analytics',
    description: 'Track booking performance, activity coverage, and review quality.',
  },
  settings: {
    eyebrow: 'Configuration',
    title: 'Settings',
    description: 'Manage administration preferences and operational contact information.',
  },
}

const emptyActivityForm = {
  name: '',
  type: 'Paragliding',
  location: '',
  area: '',
  priceFrom: 8500,
  riskLevel: 'Medium',
  duration: '',
  difficulty: '',
  minAge: 12,
  bestSeason: '',
  rating: 4.5,
  shortDescription: '',
  description: '',
  operatorName: '',
  license: '',
}

const emptyReviewForm = {
  activityId: '',
  userName: '',
  operatorId: '',
  rating: 5,
  safetyRating: 5,
  valueRating: 5,
  comment: '',
}

const emptyOperatorForm = {
  activityId: '',
  cancellation: '',
  license: '',
  name: '',
  price: 5000,
  responseRate: 95,
  safetyRating: 4.5,
  valueRating: 4.5,
}

function asActivityForm(activity) {
  return {
    name: activity.name,
    type: activity.type,
    location: activity.location,
    area: activity.area,
    priceFrom: activity.priceFrom,
    riskLevel: activity.riskLevel,
    duration: activity.duration,
    difficulty: activity.difficulty,
    minAge: activity.minAge,
    bestSeason: activity.bestSeason,
    rating: activity.rating,
    shortDescription: activity.shortDescription,
    description: activity.description,
    operatorName: activity.operators[0]?.name ?? '',
    license: activity.operators[0]?.license ?? '',
  }
}

function statusVariant(status) {
  if (status === 'Confirmed' || status === 'Completed') return 'success'
  if (status === 'Cancelled') return 'danger'
  return 'warning'
}

function roleVariant(role) {
  return role === 'admin' ? 'info' : 'success'
}

export function AdminDashboard({ section = 'dashboard' }) {
  const {
    bookingRecords,
    bookingStatusUpdates,
    currentUser,
    deleteUser,
    updateBookingStatus,
    updateUserByAdmin,
    updateUserStatus,
    users,
  } = useAuth()
  const { showToast } = useExperience()
  const {
    activities,
    activityTypes,
    addActivity,
    addOperator,
    addReview,
    deleteActivity,
    deleteOperator,
    deleteReview,
    reviews,
    operators: platformOperators,
    saveSettings,
    settings: platformSettings,
    updateActivity,
    updateOperator,
    updateOperatorPrice,
  } = usePlatform()
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [activityForm, setActivityForm] = useState(emptyActivityForm)
  const [editingActivityId, setEditingActivityId] = useState('')
  const [editForm, setEditForm] = useState(emptyActivityForm)
  const [reviewForm, setReviewForm] = useState(emptyReviewForm)
  const [operatorDrafts, setOperatorDrafts] = useState({})
  const [settings, setSettings] = useState(platformSettings)
  const [supportMessages, setSupportMessages] = useState([])
  const [adminStats, setAdminStats] = useState(null)
  const [adminAnalytics, setAdminAnalytics] = useState(null)
  const [notice, setNotice] = useState('')
  const [confirmation, setConfirmation] = useState(null)

  useEffect(() => {
    setSettings(platformSettings)
  }, [platformSettings])

  useEffect(() => {
    let ignore = false
    async function loadAdminData() {
      try {
        const [messages, stats, analytics] = await Promise.all([
          getSupportMessages(),
          getDashboardStats(),
          getAnalytics(),
        ])
        if (!ignore) {
          setSupportMessages(messages)
          setAdminStats(stats)
          setAdminAnalytics(analytics)
        }
      } catch {
        if (!ignore) {
          setSupportMessages([])
          setAdminStats(null)
          setAdminAnalytics(null)
        }
      }
    }

    if (currentUser?.role === 'admin') {
      loadAdminData()
    }

    return () => {
      ignore = true
    }
  }, [currentUser?.role])

  const allBookings = useMemo(
    () =>
      bookingRecords.map((booking) => ({
        ...booking,
        status: bookingStatusUpdates[booking.id] ?? booking.status,
      })),
    [bookingRecords, bookingStatusUpdates],
  )

  const operators = useMemo(() => {
    const directory = new Map(
      platformOperators.map((operator) => [
        operator.id,
        {
          ...operator,
          activityLinks: [],
          prices: [],
        },
      ]),
    )

    activities.forEach((activity) => {
      activity.operators.forEach((operator) => {
        const current = directory.get(operator.id) ?? {
          ...operator,
          activityLinks: [],
          prices: [],
        }

        current.activityLinks.push({
          id: activity.id,
          location: activity.location,
          name: activity.name,
          riskLevel: activity.riskLevel,
          type: activity.type,
        })
        if (operator.price) current.prices.push(Number(operator.price))
        directory.set(operator.id, { ...current, ...operator })
      })
    })

    return [...directory.values()].map((operator) => {
      const firstActivity = operator.activityLinks[0]
      return {
        ...operator,
        activityId: firstActivity?.id ?? '',
        activityName: operator.activityLinks.map((activity) => activity.name).join(', ') || 'Unassigned',
        activityType: firstActivity?.type ?? 'Not linked',
        location: operator.location || firstActivity?.location || 'Nepal',
        price: operator.prices.length ? Math.min(...operator.prices) : Number(operator.price ?? 0),
        responseRate: operator.responseRate ?? 92 + (operator.name.length % 7),
        riskLevel: firstActivity?.riskLevel ?? 'Not linked',
        status: operator.status ?? 'active',
      }
    })
  }, [activities, platformOperators])
  const totalRevenue = allBookings
    .filter((booking) => ['Confirmed', 'Completed'].includes(booking.status))
    .reduce((total, booking) => total + Number(booking.total || 0), 0)
  const dashboardRevenue = adminStats?.revenue ?? totalRevenue
  const averageRating = average(activities.map((activity) => activity.rating))
  const averageSafetyRating = average(operators.map((operator) => operator.safetyRating))
  const typeOptions = useMemo(
    () => [...new Set([...defaultActivityTypes, ...activityTypes])],
    [activityTypes],
  )
  const selectedReviewActivity =
    activities.find((activity) => activity.id === reviewForm.activityId) ?? activities[0]
  const copy = pageCopy[section] ?? pageCopy.dashboard

  function updateActivityForm(field, value) {
    setActivityForm((current) => ({ ...current, [field]: value }))
  }

  function updateEditForm(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }))
  }

  function resetActivityForm() {
    setActivityForm({ ...emptyActivityForm, type: typeOptions[0] ?? 'Paragliding' })
    setShowActivityForm(false)
  }

  async function handleAddActivity(event) {
    event.preventDefault()
    const result = await addActivity(activityForm)
    if (!result.ok) {
      setNotice(result.message)
      showToast(result.message, 'info')
      return
    }
    resetActivityForm()
    setNotice('Activity added successfully.')
    showToast('Activity added successfully.')
  }

  function startEditing(activity) {
    setEditingActivityId(activity.id)
    setEditForm(asActivityForm(activity))
  }

  async function handleSaveActivity(event) {
    event.preventDefault()
    const result = await updateActivity(editingActivityId, editForm)
    if (!result.ok) {
      setNotice(result.message)
      showToast(result.message, 'info')
      return
    }
    setEditingActivityId('')
    setNotice('Activity updated successfully.')
    showToast('Activity updated successfully.')
  }

  async function handleDeleteActivity(activityId) {
    const relatedBookings = allBookings.filter((booking) => booking.activityId === activityId)
    if (relatedBookings.length) {
      const message = `This activity has ${relatedBookings.length} booking record${relatedBookings.length > 1 ? 's' : ''} and cannot be deleted.`
      showToast(message, 'info')
      return
    }
    setConfirmation({
      confirmLabel: 'Delete activity',
      message: 'This permanently removes the activity from the public catalog.',
      onConfirm: async () => {
        const result = await deleteActivity(activityId)
        if (!result.ok) {
          setNotice(result.message)
          showToast(result.message, 'info')
          return
        }
        setNotice('Activity removed successfully.')
        showToast('Activity removed successfully.')
      },
      title: 'Delete this activity?',
    })
  }

  function handleDeleteReview(reviewId) {
    setConfirmation({
      confirmLabel: 'Delete review',
      message: 'This permanently removes the traveler review and its ratings.',
      onConfirm: async () => {
        const result = await deleteReview(reviewId)
        if (!result.ok) {
          setNotice(result.message)
          showToast(result.message, 'info')
          return
        }
        setNotice('Review removed successfully.')
        showToast('Review removed successfully.')
      },
      title: 'Delete this review?',
    })
  }

  async function confirmPendingAction() {
    const action = confirmation?.onConfirm
    setConfirmation(null)
    await action?.()
  }

  function updateReviewForm(field, value) {
    setReviewForm((current) => ({ ...current, [field]: value }))
  }

  async function handleAddReview(event) {
    event.preventDefault()

    if (!selectedReviewActivity) {
      setNotice('Add an activity before adding reviews.')
      return
    }

    const operator =
      selectedReviewActivity.operators.find(
        (item) => item.id === reviewForm.operatorId,
      ) ?? selectedReviewActivity.operators[0]
    const result = await addReview({
      ...reviewForm,
      activityId: reviewForm.activityId || selectedReviewActivity.id,
      operator: operator?.name || 'Verified operator',
      operatorId: operator?.id ?? '',
    })
    if (!result.ok) {
      setNotice(result.message)
      showToast(result.message, 'info')
      return
    }
    setReviewForm({ ...emptyReviewForm, activityId: activities[0]?.id ?? '' })
    setNotice('Review added successfully.')
    showToast('Review added successfully.')
  }

  function draftKey(activityId, operatorId) {
    return `${activityId}:${operatorId}`
  }

  function operatorDraftValue(activityId, operator) {
    return operatorDrafts[draftKey(activityId, operator.id)] ?? operator.price
  }

  async function handleSaveOperatorPrice(activityId, operatorId) {
    const activity = activities.find((item) => item.id === activityId)
    const operator = activity?.operators.find((item) => item.id === operatorId)
    const price = operatorDrafts[draftKey(activityId, operatorId)] ?? operator?.price

    if (!price || Number(price) < 1) {
      setNotice('Enter a valid operator price.')
      return
    }

    const result = await updateOperatorPrice(activityId, operatorId, price)
    if (!result.ok) {
      setNotice(result.message)
      showToast(result.message, 'info')
      return
    }
    setNotice('Operator price updated successfully.')
    showToast('Operator price updated successfully.')
  }

  async function handleStatusChange(bookingId, status) {
    const result = await updateBookingStatus(bookingId, status)
    if (!result.ok) {
      setNotice(result.message)
      showToast(result.message, 'info')
      return
    }
    setNotice('Booking status updated successfully.')
    showToast('Booking status updated successfully.')
  }

  function updateSettings(field, value) {
    setSettings((current) => ({ ...current, [field]: value }))
  }

  function handleSaveSettings(event) {
    event.preventDefault()
    saveSettings(settings)
    setNotice('Settings saved successfully.')
    showToast('Settings saved successfully.')
  }

  async function handleSupportStatus(messageId, status) {
    try {
      const updatedMessage = await updateSupportMessageStatus(messageId, status)
      setSupportMessages((current) =>
        current.map((message) => (message.id === messageId ? updatedMessage : message)),
      )
    } catch {
      const message = 'Could not update support message status.'
      setNotice(message)
      showToast(message, 'info')
      return
    }
    setNotice('Support message status updated.')
    showToast('Support message status updated.')
  }

  return (
    <div className="grid gap-6">
      <AdminPageHeader copy={copy} section={section} />
      {notice ? <Notice message={notice} onClose={() => setNotice('')} /> : null}

      {section === 'dashboard' ? (
        <DashboardSection
          activities={activities}
          allBookings={allBookings}
          averageRating={averageRating}
          adminStats={adminStats}
          operators={operators}
          reviews={reviews}
          totalRevenue={dashboardRevenue}
        />
      ) : null}
      {section === 'activities' ? (
        <ActivitiesSection
          activities={activities}
          activityForm={activityForm}
          editingActivityId={editingActivityId}
          editForm={editForm}
          handleAddActivity={handleAddActivity}
          handleDeleteActivity={handleDeleteActivity}
          handleSaveActivity={handleSaveActivity}
          resetActivityForm={resetActivityForm}
          setEditingActivityId={setEditingActivityId}
          setShowActivityForm={setShowActivityForm}
          showActivityForm={showActivityForm}
          startEditing={startEditing}
          typeOptions={typeOptions}
          updateActivityForm={updateActivityForm}
          updateEditForm={updateEditForm}
        />
      ) : null}
      {section === 'operators' ? (
        <OperatorsSection
          activities={activities}
          addOperator={addOperator}
          averageSafetyRating={averageSafetyRating}
          deleteOperator={deleteOperator}
          operators={operators}
          showToast={showToast}
          updateOperator={updateOperator}
        />
      ) : null}
      {section === 'prices' ? (
        <PricesSection
          activities={activities}
          handleSaveOperatorPrice={handleSaveOperatorPrice}
          operatorDraftValue={operatorDraftValue}
          setOperatorDrafts={setOperatorDrafts}
        />
      ) : null}
      {section === 'bookings' ? (
        <BookingsSection allBookings={allBookings} handleStatusChange={handleStatusChange} />
      ) : null}
      {section === 'reviews' ? (
        <ReviewsSection
          activities={activities}
          handleDeleteReview={handleDeleteReview}
          handleAddReview={handleAddReview}
          reviewForm={reviewForm}
          reviews={reviews}
          selectedReviewActivity={selectedReviewActivity}
          updateReviewForm={updateReviewForm}
        />
      ) : null}
      {section === 'users' ? (
        <UsersSection
          allBookings={allBookings}
          currentUser={currentUser}
          deleteUser={deleteUser}
          showToast={showToast}
          updateUserByAdmin={updateUserByAdmin}
          updateUserStatus={updateUserStatus}
          users={users}
        />
      ) : null}
      {section === 'support' ? (
        <SupportSection
          handleSupportStatus={handleSupportStatus}
          supportMessages={supportMessages}
        />
      ) : null}
      {section === 'analytics' ? (
        <AnalyticsSection
          activities={activities}
          adminAnalytics={adminAnalytics}
          allBookings={allBookings}
          averageRating={averageRating}
          averageSafetyRating={averageSafetyRating}
          reviews={reviews}
          totalRevenue={dashboardRevenue}
        />
      ) : null}
      {section === 'settings' ? (
        <SettingsSection
          handleSaveSettings={handleSaveSettings}
          settings={settings}
          updateSettings={updateSettings}
        />
      ) : null}
      {confirmation ? (
        <ConfirmationDialog
          confirmLabel={confirmation.confirmLabel}
          message={confirmation.message}
          onCancel={() => setConfirmation(null)}
          onConfirm={confirmPendingAction}
          title={confirmation.title}
        />
      ) : null}
    </div>
  )
}

function AdminPageHeader({ copy, section }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-premium)] lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-himalaya-700">{copy.eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">{copy.title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{copy.description}</p>
      </div>
      {section !== 'dashboard' ? (
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-himalaya-50 hover:text-himalaya-900"
          to="/admin"
        >
          <BarChart3 aria-hidden="true" size={17} />
          Dashboard
        </Link>
      ) : null}
    </div>
  )
}

function Notice({ message, onClose }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
      <span className="flex items-center gap-2">
        <CheckCircle2 aria-hidden="true" size={17} />
        {message}
      </span>
      <button
        aria-label="Dismiss notice"
        className="rounded-md p-1 hover:bg-emerald-100"
        onClick={onClose}
        type="button"
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <Card className="p-6 hover:-translate-y-1 hover:shadow-[var(--shadow-premium-lg)]">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-himalaya-50 text-himalaya-900">
          <Icon aria-hidden="true" size={21} />
        </span>
        <span className="text-right">
          <span className="block text-2xl font-bold text-slate-950">{value}</span>
          <span className="text-sm font-semibold text-slate-500">{label}</span>
        </span>
      </div>
      {detail ? <p className="mt-4 text-sm text-slate-600">{detail}</p> : null}
    </Card>
  )
}

function DashboardSection({
  activities,
  adminStats,
  allBookings,
  averageRating,
  operators,
  reviews,
  totalRevenue,
}) {
  const recentBookings = allBookings.slice(0, 5)
  const highRiskActivities = activities.filter((activity) => activity.riskLevel === 'High')

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard detail="Active public experiences" icon={ClipboardList} label="Activities" value={adminStats?.activities ?? activities.length} />
        <MetricCard detail="Listed partner offers" icon={ShieldCheck} label="Operators" value={adminStats?.operators ?? operators.length} />
        <MetricCard detail="Across stored requests" icon={CalendarCheck} label="Bookings" value={adminStats?.bookings ?? allBookings.length} />
        <MetricCard detail={`${averageRating.toFixed(1)}/5 average rating`} icon={DollarSign} label="Revenue" value={formatCurrency(totalRevenue)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-bold text-slate-950">Recent booking requests</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {recentBookings.map((booking) => (
              <div className="grid gap-3 p-5 md:grid-cols-[1fr_auto]" key={booking.id}>
                <div>
                  <p className="font-bold text-slate-950">{booking.activityName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {booking.customerName} - {booking.date}
                  </p>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
                  <span className="font-bold text-slate-950">{formatCurrency(booking.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle aria-hidden="true" className="text-rhododendron-700" size={20} />
            <h3 className="text-lg font-bold text-slate-950">Safety attention</h3>
          </div>
          <div className="mt-5 grid gap-3">
            {highRiskActivities.map((activity) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={activity.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-950">{activity.name}</p>
                  <RiskBadge risk={activity.riskLevel} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{activity.safety.medicalWarning}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-lg font-bold text-slate-950">Trust indicators</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            [Star, 'Reviews', reviews.length],
            [SlidersHorizontal, 'Price points', operators.length],
            [Users, 'Service regions', new Set(activities.map((activity) => activity.location)).size],
          ].map(([Icon, label, value]) => (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={label}>
              <Icon aria-hidden="true" className="text-himalaya-800" size={20} />
              <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
              <p className="text-sm font-semibold text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ActivitiesSection({
  activities,
  activityForm,
  editingActivityId,
  editForm,
  handleAddActivity,
  handleDeleteActivity,
  handleSaveActivity,
  resetActivityForm,
  setEditingActivityId,
  setShowActivityForm,
  showActivityForm,
  startEditing,
  typeOptions,
  updateActivityForm,
  updateEditForm,
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Activity catalog</h3>
          <p className="mt-1 text-sm text-slate-600">Changes appear across listings, details, and bookings.</p>
        </div>
        <Button
          icon={showActivityForm ? X : Plus}
          onClick={() => setShowActivityForm((value) => !value)}
          variant="accent"
        >
          {showActivityForm ? 'Close form' : 'Add activity'}
        </Button>
      </div>

      {showActivityForm ? (
        <form className="grid gap-4 border-b border-slate-200 bg-slate-50 p-5" onSubmit={handleAddActivity}>
          <ActivityFields activityTypes={typeOptions} form={activityForm} onChange={updateActivityForm} />
          <div className="flex justify-end gap-3">
            <Button onClick={resetActivityForm} variant="secondary">
              Cancel
            </Button>
            <Button icon={Save} type="submit" variant="accent">
              Save activity
            </Button>
          </div>
        </form>
      ) : null}

      <div className="divide-y divide-slate-100">
        {activities.map((activity) =>
          editingActivityId === activity.id ? (
            <form className="grid gap-4 bg-slate-50 p-5" key={activity.id} onSubmit={handleSaveActivity}>
              <ActivityFields
                activityTypes={typeOptions}
                form={editForm}
                onChange={updateEditForm}
                priceReadOnly
              />
              <div className="flex justify-end gap-3">
                <Button onClick={() => setEditingActivityId('')} variant="secondary">
                  Cancel
                </Button>
                <Button icon={Save} type="submit" variant="accent">
                  Save changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4 p-5 xl:grid-cols-[1fr_auto]" key={activity.id}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-950">{activity.name}</h3>
                  <Badge variant="info">{activity.type}</Badge>
                  <RiskBadge risk={activity.riskLevel} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{activity.area}</p>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  {activity.shortDescription}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
                  <span>{formatCurrency(activity.priceFrom)} from</span>
                  <span>{activity.rating}/5 rating</span>
                  <span>{activity.duration}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 xl:justify-end">
                <Button icon={Pencil} onClick={() => startEditing(activity)} variant="secondary">
                  Edit
                </Button>
                <Button icon={Trash2} onClick={() => handleDeleteActivity(activity.id)} variant="secondary">
                  Delete
                </Button>
              </div>
            </div>
          ),
        )}
      </div>
    </Card>
  )
}

function OperatorsSection({
  activities,
  addOperator,
  averageSafetyRating,
  deleteOperator,
  operators,
  showToast,
  updateOperator,
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(() => ({
    ...emptyOperatorForm,
    activityId: activities[0]?.id ?? '',
  }))
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState(emptyOperatorForm)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const listedPrices = operators.map((operator) => operator.price).filter((price) => Number(price) > 0)
  const lowestPrice = listedPrices.length
    ? formatCurrency(Math.min(...listedPrices))
    : 'No prices yet'

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateEditForm(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }))
  }

  async function handleAdd(event) {
    event.preventDefault()
    const result = await addOperator(form.activityId, form)
    if (!result.ok) {
      showToast(result.message, 'info')
      return
    }
    setForm({ ...emptyOperatorForm, activityId: activities[0]?.id ?? '' })
    setShowAddForm(false)
    showToast('Operator added successfully.')
  }

  function startEdit(operator) {
    setEditTarget(operator)
    setEditForm({
      activityId: operator.activityId,
      cancellation: operator.cancellation,
      license: operator.license,
      name: operator.name,
      price: operator.price || 1,
      responseRate: operator.responseRate,
      safetyRating: operator.safetyRating,
      valueRating: operator.valueRating,
    })
  }

  async function handleEdit(event) {
    event.preventDefault()
    const result = await updateOperator(editTarget.activityId, editTarget.id, editForm)
    if (!result.ok) {
      showToast(result.message, 'info')
      return
    }
    setEditTarget(null)
    showToast('Operator updated successfully.')
  }

  async function handleStatus(operator, status) {
    const result = await updateOperator(operator.activityId, operator.id, { status })
    showToast(
      result.ok
        ? status === 'active'
          ? 'Operator activated successfully.'
          : 'Operator suspended successfully.'
        : result.message,
      result.ok ? 'success' : 'info',
    )
  }

  async function handleDelete() {
    const result = await deleteOperator(deleteTarget.activityId, deleteTarget.id)
    if (!result.ok) {
      showToast(result.message, 'info')
      return
    }
    setDeleteTarget(null)
    showToast('Operator deleted successfully.')
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={ShieldCheck} label="Operators" value={operators.length} />
        <MetricCard icon={Star} label="Average safety rating" value={`${averageSafetyRating.toFixed(1)}/5`} />
        <MetricCard icon={DollarSign} label="Lowest listed price" value={lowestPrice} />
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Operator directory</h3>
            <p className="mt-1 text-sm text-slate-600">
              Manage certification, pricing, service quality, and availability.
            </p>
          </div>
          <Button
            icon={showAddForm ? X : Plus}
            onClick={() => setShowAddForm((current) => !current)}
            variant="accent"
          >
            {showAddForm ? 'Close form' : 'Add operator'}
          </Button>
        </div>
        {showAddForm ? (
          <form className="grid gap-4 border-b border-slate-200 bg-slate-50 p-5" onSubmit={handleAdd}>
            <OperatorFields
              activities={activities}
              form={form}
              includeActivity
              onChange={updateForm}
            />
            <div className="flex justify-end gap-3">
              <Button onClick={() => setShowAddForm(false)} variant="secondary">
                Cancel
              </Button>
              <Button icon={Save} type="submit" variant="accent">
                Save operator
              </Button>
            </div>
          </form>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Operator</th>
                <th className="px-5 py-3">License</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Safety</th>
                <th className="px-5 py-3">Response</th>
                <th className="px-5 py-3">Activities</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {operators.map((operator) => (
                <tr className="hover:bg-slate-50" key={operator.id}>
                  <td className="px-5 py-4 font-bold text-slate-950">{operator.name}</td>
                  <td className="px-5 py-4 text-slate-600">{operator.license}</td>
                  <td className="px-5 py-4 text-slate-600">{operator.location}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {operator.price ? formatCurrency(operator.price) : 'Not linked'}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{operator.safetyRating}/5</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">{operator.responseRate}%</td>
                  <td className="px-5 py-4 text-slate-600">{operator.activityName}</td>
                  <td className="px-5 py-4">
                    <Badge variant={operator.status === 'active' ? 'success' : 'warning'}>
                      {operator.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button icon={Pencil} onClick={() => startEdit(operator)} size="sm" variant="secondary">
                        Edit
                      </Button>
                      <Button
                        icon={operator.status === 'active' ? UserX : UserCheck}
                        onClick={() =>
                          handleStatus(
                            operator,
                            operator.status === 'active' ? 'suspended' : 'active',
                          )
                        }
                        size="sm"
                        variant="secondary"
                      >
                        {operator.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                      <Button
                        icon={Trash2}
                        onClick={() => setDeleteTarget(operator)}
                        size="sm"
                        variant="secondary"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editTarget ? (
        <AdminModal onClose={() => setEditTarget(null)} title="Edit operator">
          <form className="grid gap-4" onSubmit={handleEdit}>
            <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              {editTarget.activityName} - {editTarget.location}
            </p>
            <OperatorFields
              activities={activities}
              form={editForm}
              onChange={updateEditForm}
            />
            <div className="flex justify-end gap-3">
              <Button onClick={() => setEditTarget(null)} variant="secondary">
                Cancel
              </Button>
              <Button icon={Save} type="submit" variant="accent">
                Save changes
              </Button>
            </div>
          </form>
        </AdminModal>
      ) : null}

      {deleteTarget ? (
        <AdminModal onClose={() => setDeleteTarget(null)} title="Delete operator">
          <p className="text-sm leading-6 text-slate-600">
            Delete <strong className="text-slate-950">{deleteTarget.name}</strong> from{' '}
            {deleteTarget.activityName}? This removes the operator from public comparison and
            booking choices.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button onClick={() => setDeleteTarget(null)} variant="secondary">
              Cancel
            </Button>
            <Button icon={Trash2} onClick={handleDelete} variant="accent">
              Delete operator
            </Button>
          </div>
        </AdminModal>
      ) : null}
    </div>
  )
}

function OperatorFields({ activities, form, includeActivity = false, onChange }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {includeActivity ? (
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Activity
          <select
            className="premium-select w-full"
            onChange={(event) => onChange('activityId', event.target.value)}
            required
            value={form.activityId}
          >
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name} - {activity.location}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <AdminInput
        label="Operator name"
        onChange={(value) => onChange('name', value)}
        required
        value={form.name}
      />
      <AdminInput
        label="License or certification"
        onChange={(value) => onChange('license', value)}
        required
        value={form.license}
      />
      <AdminInput
        label="Price"
        min="1"
        onChange={(value) => onChange('price', Number(value))}
        required
        type="number"
        value={form.price}
      />
      <AdminInput
        label="Safety score"
        max="5"
        min="1"
        onChange={(value) => onChange('safetyRating', Number(value))}
        required
        step="0.1"
        type="number"
        value={form.safetyRating}
      />
      <AdminInput
        label="Value score"
        max="5"
        min="1"
        onChange={(value) => onChange('valueRating', Number(value))}
        required
        step="0.1"
        type="number"
        value={form.valueRating}
      />
      <AdminInput
        label="Response rate"
        max="100"
        min="0"
        onChange={(value) => onChange('responseRate', Number(value))}
        required
        type="number"
        value={form.responseRate}
      />
      <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">
        Cancellation policy
        <textarea
          className="min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
          onChange={(event) => onChange('cancellation', event.target.value)}
          required
          value={form.cancellation}
        />
      </label>
    </div>
  )
}

function AdminInput({ label, onChange, ...props }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  )
}

function PricesSection({ activities, handleSaveOperatorPrice, operatorDraftValue, setOperatorDrafts }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid divide-y divide-slate-100">
        {activities.map((activity) => (
          <div className="grid gap-4 p-5 xl:grid-cols-[17rem_1fr]" key={activity.id}>
            <div>
              <h3 className="font-bold text-slate-950">{activity.name}</h3>
              <p className="text-sm text-slate-500">{activity.location}</p>
              <p className="mt-2 text-sm font-semibold text-himalaya-900">
                Current from price: {formatCurrency(activity.priceFrom)}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {activity.operators.map((operator) => (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={operator.id}>
                  <p className="font-bold text-slate-950">{operator.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{operator.license}</p>
                  <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
                    Price
                    <input
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
                      min="1"
                      onChange={(event) =>
                        setOperatorDrafts((current) => ({
                          ...current,
                          [`${activity.id}:${operator.id}`]: Number(event.target.value),
                        }))
                      }
                      type="number"
                      value={operatorDraftValue(activity.id, operator)}
                    />
                  </label>
                  <Button
                    className="mt-4 w-full"
                    icon={Save}
                    onClick={() => handleSaveOperatorPrice(activity.id, operator.id)}
                    variant="accent"
                  >
                    Save price
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function BookingsSection({ allBookings, handleStatusChange }) {
  const [filters, setFilters] = useState({ date: '', query: '', status: 'all' })
  const [viewBooking, setViewBooking] = useState(null)
  const availableStatuses = [
    ...new Set([...bookingStatuses, ...allBookings.map((booking) => booking.status)]),
  ]
  const filteredBookings = allBookings.filter((booking) => {
    const query = filters.query.trim().toLowerCase()
    const searchable = [
      booking.id,
      booking.bookingReference,
      booking.customerName,
      booking.customerEmail,
      booking.activityName,
      booking.operatorName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return (
      (!query || searchable.includes(query)) &&
      (filters.status === 'all' || booking.status === filters.status) &&
      (!filters.date || booking.date === filters.date)
    )
  })

  return (
    <div className="grid gap-6">
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Search bookings
            <span className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-slate-950 outline-none focus:border-himalaya-700 focus:bg-white focus:ring-2 focus:ring-himalaya-100"
                onChange={(event) =>
                  setFilters((current) => ({ ...current, query: event.target.value }))
                }
                placeholder="Reference, customer, activity"
                value={filters.query}
              />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Status
            <select
              className="premium-select w-full"
              onChange={(event) =>
                setFilters((current) => ({ ...current, status: event.target.value }))
              }
              value={filters.status}
            >
              <option value="all">All statuses</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Travel date
            <input
              className="premium-input w-full"
              onChange={(event) =>
                setFilters((current) => ({ ...current, date: event.target.value }))
              }
              type="date"
              value={filters.date}
            />
          </label>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {filteredBookings.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Booking</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Activity</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <tr className="hover:bg-slate-50" key={booking.id}>
                    <td className="px-5 py-4 font-bold text-slate-950">{booking.id}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {booking.customerName}
                      {booking.customerEmail ? (
                        <span className="block text-xs text-slate-500">
                          {booking.customerEmail}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{booking.activityName}</td>
                    <td className="px-5 py-4 text-slate-600">{booking.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
                        <select
                          aria-label={`Update status for booking ${booking.id}`}
                          className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
                          onChange={(event) =>
                            handleStatusChange(booking.id, event.target.value)
                          }
                          value={booking.status}
                        >
                          {availableStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {formatCurrency(booking.total)}
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        icon={Eye}
                        onClick={() => setViewBooking(booking)}
                        size="sm"
                        variant="secondary"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <ClipboardList aria-hidden="true" className="mx-auto text-himalaya-800" size={42} />
            <h3 className="mt-4 text-2xl font-bold text-slate-950">No bookings found</h3>
            <p className="mt-2 text-sm text-slate-600">
              Adjust the search, status, or travel date filter.
            </p>
          </div>
        )}
      </Card>

      {viewBooking ? (
        <AdminModal onClose={() => setViewBooking(null)} title="Booking details">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Reference', viewBooking.bookingReference ?? viewBooking.id],
              ['Customer', viewBooking.customerName],
              ['Email', viewBooking.customerEmail || 'Not recorded'],
              ['Phone', viewBooking.customerPhone || 'Not recorded'],
              ['Activity', viewBooking.activityName],
              ['Operator', viewBooking.operatorName || 'Not recorded'],
              ['Travel date', viewBooking.date],
              ['Travelers', viewBooking.people],
              ['Emergency contact', viewBooking.emergencyName || 'Not recorded'],
              ['Emergency phone', viewBooking.emergencyPhone || 'Not recorded'],
              ['Status', viewBooking.status],
              ['Total', formatCurrency(viewBooking.total)],
            ].map(([label, value]) => (
              <div className="min-w-0 rounded-xl bg-slate-50 p-4" key={label}>
                <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                <p className="mt-1 break-words font-bold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          {viewBooking.notes ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Notes</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{viewBooking.notes}</p>
            </div>
          ) : null}
        </AdminModal>
      ) : null}
    </div>
  )
}

function ReviewsSection({
  activities,
  handleDeleteReview,
  handleAddReview,
  reviewForm,
  reviews,
  selectedReviewActivity,
  updateReviewForm,
}) {
  return (
    <Card className="overflow-hidden">
      <form className="grid gap-4 border-b border-slate-200 bg-slate-50 p-5" onSubmit={handleAddReview}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Activity
            <select
              aria-label="Activity"
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
              onChange={(event) => updateReviewForm('activityId', event.target.value)}
              required
              value={reviewForm.activityId || activities[0]?.id || ''}
            >
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Reviewer
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
              onChange={(event) => updateReviewForm('userName', event.target.value)}
              required
              value={reviewForm.userName}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Operator
            <select
              aria-label="Operator"
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
              onChange={(event) => updateReviewForm('operatorId', event.target.value)}
              value={reviewForm.operatorId}
            >
              <option value="">Use activity operator</option>
              {(selectedReviewActivity?.operators ?? activities[0]?.operators ?? []).map((operator) => (
                <option key={operator.id} value={operator.id}>
                  {operator.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Rating
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
              max="5"
              min="1"
              onChange={(event) => updateReviewForm('rating', event.target.value)}
              required
              step="0.1"
              type="number"
              value={reviewForm.rating}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Safety rating
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
              max="5"
              min="1"
              onChange={(event) => updateReviewForm('safetyRating', event.target.value)}
              required
              step="0.1"
              type="number"
              value={reviewForm.safetyRating}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Value rating
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
              max="5"
              min="1"
              onChange={(event) => updateReviewForm('valueRating', event.target.value)}
              required
              step="0.1"
              type="number"
              value={reviewForm.valueRating}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">
            Comment
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
              onChange={(event) => updateReviewForm('comment', event.target.value)}
              required
              value={reviewForm.comment}
            />
          </label>
        </div>
        <div className="flex justify-end">
          <Button icon={Plus} type="submit" variant="accent">
            Add review
          </Button>
        </div>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Reviewer</th>
              <th className="px-5 py-3">Operator</th>
              <th className="px-5 py-3">Rating</th>
              <th className="px-5 py-3">Safety</th>
              <th className="px-5 py-3">Value</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <tr className="hover:bg-slate-50" key={review.id}>
                <td className="px-5 py-4 font-bold text-slate-950">{review.userName}</td>
                <td className="px-5 py-4 text-slate-600">{review.operator}</td>
                <td className="px-5 py-4 font-semibold text-slate-800">{review.rating}/5</td>
                <td className="px-5 py-4 font-semibold text-slate-800">{review.safetyRating}/5</td>
                <td className="px-5 py-4 font-semibold text-slate-800">{review.valueRating}/5</td>
                <td className="px-5 py-4">
                  <Button
                    icon={Trash2}
                    onClick={() => handleDeleteReview(review.id)}
                    variant="secondary"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function UsersSection({
  allBookings,
  currentUser,
  deleteUser,
  showToast,
  updateUserByAdmin,
  updateUserStatus,
  users,
}) {
  const [filters, setFilters] = useState({ query: '', role: 'all' })
  const [viewUser, setViewUser] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const adminCount = users.filter((user) => user.role === 'admin').length
  const travelerCount = users.filter((user) => user.role === 'user').length
  const activeCount = users.filter((user) => (user.status ?? 'active') === 'active').length
  const filteredUsers = users.filter((user) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery =
      !query ||
      [user.fullName, user.email, user.phone].join(' ').toLowerCase().includes(query)
    const matchesRole = filters.role === 'all' || user.role === filters.role
    return matchesQuery && matchesRole
  })

  function bookingCountFor(userId) {
    return allBookings.filter((booking) => booking.userId === userId).length
  }

  async function handleStatus(user, status) {
    const result = await updateUserStatus(user.id, status)
    if (!result.ok) {
      showToast(result.message, 'info')
      return
    }

    showToast(status === 'active' ? 'User account activated.' : 'User account suspended.')
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const result = await updateUserByAdmin(editUser.id, {
      fullName: formData.get('fullName'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      status: formData.get('status'),
    })

    if (!result.ok) {
      showToast(result.message, 'info')
      return
    }

    setEditUser(null)
    showToast('User account updated.')
  }

  async function handleDeleteConfirm() {
    const result = await deleteUser(deleteTarget.id)
    if (!result.ok) {
      showToast(result.message, 'info')
      return
    }

    setDeleteTarget(null)
    showToast('User deleted and related bookings were safely marked.')
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={Users} label="Total users" value={users.length} />
        <MetricCard icon={ShieldCheck} label="Administrators" value={adminCount} />
        <MetricCard icon={CalendarCheck} label="Travelers" value={travelerCount} />
        <MetricCard icon={UserCheck} label="Active accounts" value={activeCount} />
      </div>

      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Search by name or email
            <span className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-slate-950 outline-none focus:border-himalaya-700 focus:bg-white focus:ring-2 focus:ring-himalaya-100"
                onChange={(event) =>
                  setFilters((current) => ({ ...current, query: event.target.value }))
                }
                placeholder="Search users"
                value={filters.query}
              />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Role
            <select
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:bg-white focus:ring-2 focus:ring-himalaya-100"
              onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}
              value={filters.role}
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="user">Traveler</option>
            </select>
          </label>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {filteredUsers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Bookings</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const isCurrentAdmin = user.id === currentUser?.id
                  const status = user.status ?? 'active'
                  return (
                    <tr className="hover:bg-slate-50" key={user.id}>
                      <td className="px-5 py-4 font-bold text-slate-950">{user.fullName}</td>
                      <td className="px-5 py-4 text-slate-600">{user.email}</td>
                      <td className="px-5 py-4 text-slate-600">{user.phone}</td>
                      <td className="px-5 py-4">
                        <Badge variant={roleVariant(user.role)}>{user.role}</Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {bookingCountFor(user.id)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={status === 'active' ? 'success' : 'warning'}>{status}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button icon={Eye} onClick={() => setViewUser(user)} size="sm" variant="secondary">
                            View
                          </Button>
                          <Button icon={Pencil} onClick={() => setEditUser(user)} size="sm" variant="secondary">
                            Edit
                          </Button>
                          {status === 'active' ? (
                            <Button
                              disabled={isCurrentAdmin}
                              icon={UserX}
                              onClick={() => handleStatus(user, 'suspended')}
                              size="sm"
                              variant="secondary"
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              icon={UserCheck}
                              onClick={() => handleStatus(user, 'active')}
                              size="sm"
                              variant="secondary"
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            disabled={isCurrentAdmin}
                            icon={Trash2}
                            onClick={() => setDeleteTarget(user)}
                            size="sm"
                            variant="secondary"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Users aria-hidden="true" className="mx-auto text-himalaya-800" size={42} />
            <h3 className="mt-4 text-2xl font-bold text-slate-950">No users found</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Adjust the search or role filter to find registered accounts.
            </p>
          </div>
        )}
      </Card>

      {viewUser ? (
        <AdminModal title="User details" onClose={() => setViewUser(null)}>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Name', viewUser.fullName],
              ['Email', viewUser.email],
              ['Phone', viewUser.phone],
              ['Nationality', viewUser.nationality || 'Not provided'],
              ['Emergency contact', viewUser.emergencyContact || 'Not provided'],
              ['Preferred language', viewUser.preferredLanguage || 'Not provided'],
              ['Role', viewUser.role],
              ['Joined', formatDate(viewUser.createdAt)],
              ['Booking count', bookingCountFor(viewUser.id)],
              ['Status', viewUser.status ?? 'active'],
            ].map(([label, value]) => (
              <div className="rounded-xl bg-slate-50 p-4" key={label}>
                <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                <p className="mt-1 font-bold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </AdminModal>
      ) : null}

      {editUser ? (
        <AdminModal title="Edit user" onClose={() => setEditUser(null)}>
          <form className="grid gap-4" onSubmit={handleEditSubmit}>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Full name
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
                defaultValue={editUser.fullName}
                name="fullName"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Phone
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
                defaultValue={editUser.phone}
                name="phone"
                required
                type="tel"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Role
              <select
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100 disabled:bg-slate-100 disabled:text-slate-500"
                defaultValue={editUser.role}
                disabled={editUser.id === currentUser?.id}
                name="role"
              >
                <option value="user">Traveler</option>
                <option value="admin">Admin</option>
              </select>
              {editUser.id === currentUser?.id ? (
                <span className="text-xs font-semibold text-slate-500">
                  Your own admin role is protected.
                </span>
              ) : null}
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Status
              <select
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100 disabled:bg-slate-100 disabled:text-slate-500"
                defaultValue={editUser.status ?? 'active'}
                disabled={editUser.id === currentUser?.id}
                name="status"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              {editUser.id === currentUser?.id ? (
                <span className="text-xs font-semibold text-slate-500">
                  Your own admin account must remain active.
                </span>
              ) : null}
            </label>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setEditUser(null)} variant="secondary">
                Cancel
              </Button>
              <Button icon={Save} type="submit" variant="accent">
                Save changes
              </Button>
            </div>
          </form>
        </AdminModal>
      ) : null}

      {deleteTarget ? (
        <AdminModal title="Delete user" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm leading-6 text-slate-600">
            Delete <strong className="text-slate-950">{deleteTarget.fullName}</strong>? Their saved
            account will be removed and related booking records will be marked as linked to a
            removed account.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button onClick={() => setDeleteTarget(null)} variant="secondary">
              Cancel
            </Button>
            <Button icon={Trash2} onClick={handleDeleteConfirm} variant="accent">
              Delete user
            </Button>
          </div>
        </AdminModal>
      ) : null}
    </div>
  )
}

function SupportSection({ handleSupportStatus, supportMessages }) {
  const [filters, setFilters] = useState({ query: '', status: 'all' })
  const [viewMessage, setViewMessage] = useState(null)
  const filteredMessages = supportMessages.filter((message) => {
    const query = filters.query.trim().toLowerCase()
    const matchesQuery =
      !query ||
      [message.fullName, message.email, message.phone, message.subject, message.category]
        .join(' ')
        .toLowerCase()
        .includes(query)
    const matchesStatus = filters.status === 'all' || message.status === filters.status
    return matchesQuery && matchesStatus
  })
  const newCount = supportMessages.filter((message) => message.status === 'New').length
  const reviewCount = supportMessages.filter((message) => message.status === 'In review').length
  const resolvedCount = supportMessages.filter((message) => message.status === 'Resolved').length

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={MessageSquareText} label="Messages" value={supportMessages.length} />
        <MetricCard icon={Mail} label="New" value={newCount} />
        <MetricCard icon={Eye} label="In review" value={reviewCount} />
        <MetricCard icon={CheckCircle2} label="Resolved" value={resolvedCount} />
      </div>

      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Search support messages
            <span className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
              <input
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-slate-950 outline-none focus:border-himalaya-700 focus:bg-white focus:ring-2 focus:ring-himalaya-100"
                onChange={(event) =>
                  setFilters((current) => ({ ...current, query: event.target.value }))
                }
                placeholder="Name, email, category, subject"
                value={filters.query}
              />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Status
            <select
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:bg-white focus:ring-2 focus:ring-himalaya-100"
              onChange={(event) =>
                setFilters((current) => ({ ...current, status: event.target.value }))
              }
              value={filters.status}
            >
              <option value="all">All statuses</option>
              {supportStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {filteredMessages.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMessages.map((message) => (
                  <tr className="hover:bg-slate-50" key={message.id}>
                    <td className="px-5 py-4 font-bold text-slate-950">{message.id}</td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className="block font-bold text-slate-950">{message.fullName}</span>
                      <span className="block text-xs">{message.email}</span>
                      <span className="block text-xs">{message.phone}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{message.category}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{message.subject}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(message.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={supportStatusVariant(message.status)}>{message.status}</Badge>
                        <select
                          aria-label={`Update status for support message ${message.id}`}
                          className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
                          onChange={(event) => handleSupportStatus(message.id, event.target.value)}
                          value={message.status}
                        >
                          {supportStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button icon={Eye} onClick={() => setViewMessage(message)} size="sm" variant="secondary">
                          View
                        </Button>
                        <Button href={`mailto:${message.email}`} icon={Mail} size="sm" variant="secondary">
                          Email
                        </Button>
                        <Button href={`tel:${message.phone}`} icon={Phone} size="sm" variant="secondary">
                          Call
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageSquareText aria-hidden="true" className="mx-auto text-himalaya-800" size={42} />
            <h3 className="mt-4 text-2xl font-bold text-slate-950">No support messages found</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Traveler contact form submissions will appear here for review.
            </p>
          </div>
        )}
      </Card>

      {viewMessage ? (
        <AdminModal title="Support message" onClose={() => setViewMessage(null)}>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Reference', viewMessage.id],
                ['Name', viewMessage.fullName],
                ['Email', viewMessage.email],
                ['Phone', viewMessage.phone],
                ['Category', viewMessage.category],
                ['Status', viewMessage.status],
                ['Submitted', formatDate(viewMessage.createdAt)],
              ].map(([label, value]) => (
                <div className="rounded-xl bg-slate-50 p-4" key={label}>
                  <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                  <p className="mt-1 font-bold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Subject</p>
              <p className="mt-1 font-bold text-slate-950">{viewMessage.subject}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-500">Message</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{viewMessage.message}</p>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </div>
  )
}

function supportStatusVariant(status) {
  if (status === 'Resolved') return 'success'
  if (status === 'In review') return 'info'
  return 'warning'
}

function AdminModal({ children, onClose, title }) {
  const titleId = useId()
  const modalRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previousFocus = document.activeElement
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current()
    }

    modalRef.current?.focus()
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/60 px-4 py-8">
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl"
        ref={modalRef}
        role="dialog"
        tabIndex="-1"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-xl font-bold text-slate-950" id={titleId}>
            {title}
          </h3>
          <button
            aria-label="Close modal"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function formatDate(value) {
  if (!value) return 'Not recorded'
  return new Intl.DateTimeFormat('en-NP', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function AnalyticsSection({
  adminAnalytics,
  activities,
  allBookings,
  averageRating,
  averageSafetyRating,
  reviews,
  totalRevenue,
}) {
  const apiStatusCounts = adminAnalytics?.bookingsByStatus?.map((item) => ({
    count: item.count,
    status: displayBookingStatus(item._id),
  }))
  const statusCounts = apiStatusCounts?.length
    ? apiStatusCounts
    : bookingStatuses.map((status) => ({
        status,
        count: allBookings.filter((booking) => booking.status === status).length,
      }))
  const maxStatusCount = Math.max(1, ...statusCounts.map((item) => item.count))
  const typeCounts = [...new Set(activities.map((activity) => activity.type))].map((type) => ({
    type,
    count: activities.filter((activity) => activity.type === type).length,
  }))
  const maxTypeCount = Math.max(1, ...typeCounts.map((item) => item.count))

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={DollarSign} label="Total booking value" value={formatCurrency(totalRevenue)} />
        <MetricCard icon={Star} label="Average activity rating" value={`${averageRating.toFixed(1)}/5`} />
        <MetricCard icon={ShieldCheck} label="Average safety score" value={`${averageSafetyRating.toFixed(1)}/5`} />
        <MetricCard icon={Users} label="Review volume" value={reviews.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-lg font-bold text-slate-950">Booking status mix</h3>
          <div className="mt-5 grid gap-4">
            {statusCounts.map(({ status, count }) => (
              <ProgressRow key={status} label={status} max={maxStatusCount} value={count} />
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-lg font-bold text-slate-950">Activity coverage</h3>
          <div className="mt-5 grid gap-4">
            {typeCounts.map(({ type, count }) => (
              <ProgressRow key={type} label={type} max={maxTypeCount} value={count} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function displayBookingStatus(status = 'pending') {
  const map = {
    awaiting_payment: 'Awaiting payment',
    cancelled: 'Cancelled',
    completed: 'Completed',
    confirmed: 'Confirmed',
    pending: 'Pending confirmation',
  }
  return map[status] ?? status
}

function ProgressRow({ label, max, value }) {
  const width = `${Math.max(8, (value / max) * 100)}%`

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-bold text-slate-950">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-himalaya-700" style={{ width }} />
      </div>
    </div>
  )
}

function SettingsSection({ handleSaveSettings, settings, updateSettings }) {
  return (
    <Card className="p-5">
      <form className="grid gap-5" onSubmit={handleSaveSettings}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Support email
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
              onChange={(event) => updateSettings('supportEmail', event.target.value)}
              required
              type="email"
              value={settings.supportEmail}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Operations phone
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
              onChange={(event) => updateSettings('operationsPhone', event.target.value)}
              required
              type="tel"
              value={settings.operationsPhone}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Service region
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
              onChange={(event) => updateSettings('serviceRegion', event.target.value)}
              required
              value={settings.serviceRegion}
            />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
            Require safety acknowledgement
            <input
              checked={settings.requireSafetyAcknowledgement}
              className="h-5 w-5 accent-himalaya-700"
              onChange={(event) => updateSettings('requireSafetyAcknowledgement', event.target.checked)}
              type="checkbox"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Booking operations note
          <textarea
            className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => updateSettings('bookingNote', event.target.value)}
            required
            value={settings.bookingNote}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Safety alert management
          <textarea
            className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => updateSettings('safetyAlert', event.target.value)}
            required
            value={settings.safetyAlert}
          />
        </label>
        <div className="flex justify-end">
          <Button icon={Save} type="submit" variant="accent">
            Save settings
          </Button>
        </div>
      </form>
    </Card>
  )
}

function ActivityFields({ activityTypes, form, onChange, priceReadOnly = false }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Activity name
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => onChange('name', event.target.value)}
            required
            value={form.name}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Type
          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => onChange('type', event.target.value)}
            required
            value={form.type}
          >
            {activityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Location
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => onChange('location', event.target.value)}
            required
            value={form.location}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Area
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => onChange('area', event.target.value)}
            required
            value={form.area}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          {priceReadOnly ? 'Calculated price from' : 'Price from'}
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none read-only:cursor-not-allowed read-only:bg-slate-100 read-only:text-slate-600 focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            min="1"
            onChange={(event) => onChange('priceFrom', Number(event.target.value))}
            readOnly={priceReadOnly}
            required
            type="number"
            value={form.priceFrom}
          />
          {priceReadOnly ? (
            <span className="text-xs font-semibold text-slate-500">
              Calculated from the lowest active operator price.
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Risk level
          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => onChange('riskLevel', event.target.value)}
            value={form.riskLevel}
          >
            {riskLevels.map((risk) => (
              <option key={risk} value={risk}>
                {risk}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Duration
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => onChange('duration', event.target.value)}
            required
            value={form.duration}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Difficulty
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => onChange('difficulty', event.target.value)}
            required
            value={form.difficulty}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Minimum age
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            min="1"
            onChange={(event) => onChange('minAge', Number(event.target.value))}
            required
            type="number"
            value={form.minAge}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Best season
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => onChange('bestSeason', event.target.value)}
            required
            value={form.bestSeason}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Rating
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            max="5"
            min="1"
            onChange={(event) => onChange('rating', Number(event.target.value))}
            required
            step="0.1"
            type="number"
            value={form.rating}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Operator name
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => onChange('operatorName', event.target.value)}
            required
            value={form.operatorName}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          License
          <input
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => onChange('license', event.target.value)}
            required
            value={form.license}
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Short description
          <textarea
            className="min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => onChange('shortDescription', event.target.value)}
            required
            value={form.shortDescription}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Full description
          <textarea
            className="min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100"
            onChange={(event) => onChange('description', event.target.value)}
            required
            value={form.description}
          />
        </label>
      </div>
    </>
  )
}
