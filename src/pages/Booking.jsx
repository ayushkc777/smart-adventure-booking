import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Phone } from 'lucide-react'
import { SafetyPanel } from '../components/activity/SafetyPanel'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'
import { SafeImage } from '../components/ui/SafeImage'
import { useAuth } from '../context/useAuth'
import { useExperience } from '../context/useExperience'
import { usePlatform } from '../context/usePlatform'
import { formatCurrency } from '../utils/formatters'
import { isFutureOrToday, isValidEmail, isValidPhone, todayDateString } from '../utils/validation'

const steps = ['Trip', 'Operator', 'Travelers', 'Extras', 'Review', 'Confirmation']
const extras = [
  { id: 'photo-video', label: 'Photo and video package', price: 500 },
  { id: 'private-transfer', label: 'Private hotel transfer', price: 500 },
  { id: 'priority-support', label: 'Priority operator confirmation', price: 500 },
]

export function Booking() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addBooking, currentUser } = useAuth()
  const { showToast } = useExperience()
  const { catalogError, catalogLoading, getActivityById, refreshCatalog, settings } = usePlatform()
  const activity = getActivityById(id)
  const initialOperatorId = searchParams.get('operator')
  const availableOperators =
    activity?.operators.filter((operator) => (operator.status ?? 'active') === 'active') ?? []
  const defaultOperator = availableOperators[0]
  const [step, setStep] = useState(1)
  const [selectedOperatorId, setSelectedOperatorId] = useState(initialOperatorId ?? defaultOperator?.id ?? '')
  const [selectedExtras, setSelectedExtras] = useState([])
  const [booking, setBooking] = useState({
    acceptSafety: false,
    date: todayDateString(),
    email: currentUser?.email ?? '',
    emergencyName: '',
    emergencyPhone: '',
    fullName: currentUser?.fullName ?? '',
    notes: '',
    people: 2,
    phone: currentUser?.phone ?? '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const selectedOperator = useMemo(
    () => activity?.operators.find((operator) => operator.id === selectedOperatorId) ?? defaultOperator,
    [activity, defaultOperator, selectedOperatorId],
  )

  if (catalogLoading) {
    return (
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="p-10 text-center">
            <h1 className="text-2xl font-bold text-slate-950">Loading booking options</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Fetching current operators and prices from the booking API.
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
            <h1 className="mt-4 text-2xl font-bold text-slate-950">Booking options unavailable</h1>
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

  const extrasTotal = selectedExtras.reduce((total, extraId) => {
    const extra = extras.find((item) => item.id === extraId)
    return total + (extra?.price ?? 0)
  }, 0)
  const total = selectedOperator.price * booking.people + extrasTotal

  function validateBooking(nextBooking = booking) {
    const nextErrors = {}

    if (!isFutureOrToday(nextBooking.date)) nextErrors.date = 'Choose today or a future date.'
    if (Number(nextBooking.people) < 1) nextErrors.people = 'Add at least one traveler.'
    if (nextBooking.fullName.trim().length < 2) nextErrors.fullName = 'Enter the lead traveler name.'
    if (!isValidEmail(nextBooking.email)) nextErrors.email = 'Enter a valid email address.'
    if (!isValidPhone(nextBooking.phone)) nextErrors.phone = 'Enter a valid phone number.'
    if (nextBooking.emergencyName.trim().length < 2) nextErrors.emergencyName = 'Enter an emergency contact name.'
    if (!isValidPhone(nextBooking.emergencyPhone)) nextErrors.emergencyPhone = 'Enter an emergency contact phone.'
    if (settings.requireSafetyAcknowledgement && !nextBooking.acceptSafety) {
      nextErrors.acceptSafety = 'Please confirm the safety guidance acknowledgement.'
    }

    return nextErrors
  }

  function stepErrors(targetStep = step) {
    const validationErrors = validateBooking()
    if (targetStep === 1) return pick(validationErrors, ['date', 'people'])
    if (targetStep === 3) {
      return pick(validationErrors, ['fullName', 'email', 'phone', 'emergencyName', 'emergencyPhone'])
    }
    if (targetStep === 5) return pick(validationErrors, ['acceptSafety'])
    return {}
  }

  function updateField(field, value) {
    setBooking((current) => {
      const nextBooking = { ...current, [field]: value }
      setErrors((currentErrors) => ({ ...currentErrors, [field]: validateBooking(nextBooking)[field] }))
      return nextBooking
    })
  }

  function goNext() {
    const validationErrors = stepErrors()
    if (Object.keys(validationErrors).length) {
      setErrors((current) => ({ ...current, ...validationErrors }))
      return
    }
    setStep((current) => Math.min(5, current + 1))
  }

  function goBack() {
    setStep((current) => Math.max(1, current - 1))
  }

  function toggleExtra(extraId) {
    setSelectedExtras((current) =>
      current.includes(extraId) ? current.filter((id) => id !== extraId) : [...current, extraId],
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateBooking()

    if (Object.keys(validationErrors).length || submitting) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    const savedBooking = await addBooking({
      activityId: activity.id,
      activityName: activity.name,
      customerEmail: booking.email,
      customerName: booking.fullName,
      customerPhone: booking.phone,
      date: booking.date,
      emergencyName: booking.emergencyName,
      emergencyPhone: booking.emergencyPhone,
      extras: selectedExtras.map((extraId) => extras.find((item) => item.id === extraId)).filter(Boolean),
      notes: booking.notes,
      operatorId: selectedOperator.id,
      operatorName: selectedOperator.name,
      people: booking.people,
      total,
    })
    setSubmitting(false)

    if (savedBooking?.ok === false) {
      showToast(savedBooking.message, 'info')
      return
    }

    showToast('Booking request submitted successfully.')
    navigate('/booking-success', { state: savedBooking })
  }

  return (
    <>
      <section className="surface-grid border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle
            description="Complete each step to send a clear booking request to the selected operator."
            eyebrow="Booking"
            title={`Book ${activity.name}`}
          />
          <div className="mt-8 grid gap-2 md:grid-cols-6">
            {steps.map((label, index) => (
              <div
                className={`rounded-xl px-3 py-3 text-sm font-bold ${
                  step >= index + 1 ? 'bg-himalaya-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
                key={label}
              >
                {index + 1}. {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
          <form className="grid gap-6" onSubmit={handleSubmit}>
            {step === 1 ? (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-950">Step 1: Select date and group size</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    Date
                    <input
                      className="premium-input w-full"
                      min={todayDateString()}
                      onChange={(event) => updateField('date', event.target.value)}
                      required
                      type="date"
                      value={booking.date}
                    />
                    {errors.date ? (
                      <span className="text-sm text-red-700" role="alert">
                        {errors.date}
                      </span>
                    ) : null}
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    Number of people
                    <input
                      className="premium-input w-full"
                      min="1"
                      onChange={(event) => updateField('people', Number(event.target.value))}
                      required
                      type="number"
                      value={booking.people}
                    />
                    {errors.people ? (
                      <span className="text-sm text-red-700" role="alert">
                        {errors.people}
                      </span>
                    ) : null}
                  </label>
                </div>
              </Card>
            ) : null}

            {step === 2 ? (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-950">Step 2: Choose operator</h2>
                <div className="mt-5 grid gap-4">
                  {availableOperators.map((operator) => (
                    <label
                      className={`grid cursor-pointer gap-3 rounded-xl border p-5 transition md:grid-cols-[auto_1fr_auto] md:items-center ${
                        selectedOperatorId === operator.id ? 'border-himalaya-700 bg-himalaya-50' : 'border-slate-200 bg-white'
                      }`}
                      key={operator.id}
                    >
                      <input
                        checked={selectedOperatorId === operator.id}
                        className="h-5 w-5 accent-himalaya-700"
                        onChange={() => setSelectedOperatorId(operator.id)}
                        type="radio"
                      />
                      <span>
                        <strong className="block text-slate-950">{operator.name}</strong>
                        <span className="text-sm text-slate-600">
                          Safety {operator.safetyRating}/5 - Value {operator.valueRating}/5 - {operator.license}
                        </span>
                      </span>
                      <strong className="text-slate-950">{formatCurrency(operator.price)}</strong>
                    </label>
                  ))}
                </div>
              </Card>
            ) : null}

            {step === 3 ? (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-950">Step 3: Traveler and emergency details</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <BookingInput error={errors.fullName} label="Full name" onChange={(value) => updateField('fullName', value)} value={booking.fullName} />
                  <BookingInput error={errors.email} label="Email" onChange={(value) => updateField('email', value)} type="email" value={booking.email} />
                  <BookingInput error={errors.phone} label="Phone" onChange={(value) => updateField('phone', value)} type="tel" value={booking.phone} />
                  <BookingInput error={errors.emergencyName} label="Emergency contact name" onChange={(value) => updateField('emergencyName', value)} value={booking.emergencyName} />
                  <BookingInput error={errors.emergencyPhone} label="Emergency phone" onChange={(value) => updateField('emergencyPhone', value)} type="tel" value={booking.emergencyPhone} />
                  <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">
                    Notes for operator
                    <textarea
                      className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-4 focus:ring-himalaya-100"
                      onChange={(event) => updateField('notes', event.target.value)}
                      value={booking.notes}
                    />
                  </label>
                </div>
              </Card>
            ) : null}

            {step === 4 ? (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-950">Step 4: Optional extras</h2>
                <div className="mt-5 grid gap-4">
                  {extras.map((extra) => (
                    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-himalaya-200 hover:bg-himalaya-50" key={extra.id}>
                      <span className="flex items-center gap-3">
                        <input
                          checked={selectedExtras.includes(extra.id)}
                          className="h-5 w-5 accent-himalaya-700"
                          onChange={() => toggleExtra(extra.id)}
                          type="checkbox"
                        />
                        <span className="font-bold text-slate-950">{extra.label}</span>
                      </span>
                      <strong className="text-slate-950">{formatCurrency(extra.price)}</strong>
                    </label>
                  ))}
                </div>
              </Card>
            ) : null}

            {step === 5 ? (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-950">Step 5: Review booking summary</h2>
                <div className="mt-5 grid gap-3 text-sm">
                  {[
                    ['Activity', activity.name],
                    ['Operator', selectedOperator.name],
                    ['Date', booking.date],
                    ['Travelers', booking.people],
                    ['Lead traveler', booking.fullName],
                    ['Emergency contact', `${booking.emergencyName} (${booking.emergencyPhone})`],
                    ['Extras', selectedExtras.length ? selectedExtras.map((extraId) => extras.find((item) => item.id === extraId)?.label).join(', ') : 'No extras selected'],
                    ['Total', formatCurrency(total)],
                  ].map(([label, value]) => (
                    <div className="flex justify-between gap-4 border-b border-slate-100 py-3" key={label}>
                      <span className="text-slate-600">{label}</span>
                      <strong className="text-right text-slate-950">{value}</strong>
                    </div>
                  ))}
                </div>
                {settings.requireSafetyAcknowledgement ? (
                  <>
                    <label className="mt-5 flex gap-3 text-sm leading-6 text-slate-700">
                      <input
                        checked={booking.acceptSafety}
                        className="mt-1 h-5 w-5 accent-himalaya-700"
                        onChange={(event) => updateField('acceptSafety', event.target.checked)}
                        required
                        type="checkbox"
                      />
                      I understand that safety advice is guidance only, not a guarantee, and the
                      operator may cancel or reschedule based on weather, health, or local conditions.
                    </label>
                    {errors.acceptSafety ? (
                      <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
                        {errors.acceptSafety}
                      </p>
                    ) : null}
                  </>
                ) : null}
              </Card>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <AlertTriangle aria-hidden="true" size={16} />
                {settings.bookingNote}
              </p>
              <div className="flex gap-3">
                {step > 1 ? (
                  <Button icon={ArrowLeft} onClick={goBack} variant="secondary">
                    Back
                  </Button>
                ) : null}
                {step < 5 ? (
                  <Button icon={ArrowRight} iconPosition="right" onClick={goNext} variant="accent">
                    Continue
                  </Button>
                ) : (
                  <Button disabled={submitting} icon={CheckCircle2} type="submit" variant="accent">
                    {submitting ? 'Sending request...' : 'Confirm booking'}
                  </Button>
                )}
              </div>
            </div>
          </form>

          <aside className="grid gap-5 self-start lg:sticky lg:top-24">
            <Card className="overflow-hidden">
              <SafeImage alt={activity.name} className="aspect-[16/10] w-full object-cover" src={activity.image} />
              <div className="p-5">
                <h2 className="text-xl font-bold text-slate-950">Booking summary</h2>
                <div className="mt-4 grid gap-3 text-sm">
                  <SummaryRow label="Operator" value={selectedOperator.name} />
                  <SummaryRow label="Date" value={booking.date} />
                  <SummaryRow label="People" value={booking.people} />
                  <SummaryRow label="Extras" value={formatCurrency(extrasTotal)} />
                  <SummaryRow large label="Total" value={formatCurrency(total)} />
                </div>
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-himalaya-50 p-4 text-sm text-himalaya-900">
                  <Phone aria-hidden="true" size={16} />
                  Operator contact is shared after confirmation.
                </p>
              </div>
            </Card>
            <SafetyPanel activity={activity} compact />
          </aside>
        </div>
      </section>
    </>
  )
}

function BookingInput({ error, label, onChange, type = 'text', value }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        className="premium-input w-full"
        onChange={(event) => onChange(event.target.value)}
        required
        type={type}
        value={value}
      />
      {error ? (
        <span className="text-sm text-red-700" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}

function SummaryRow({ label, large = false, value }) {
  return (
    <span className={`flex justify-between gap-3 ${large ? 'border-t border-slate-100 pt-3 text-lg' : ''}`}>
      <span className={large ? 'font-bold text-slate-950' : 'text-slate-600'}>{label}</span>
      <strong className="text-right text-slate-950">{value}</strong>
    </span>
  )
}

function pick(source, keys) {
  return keys.reduce((result, key) => {
    if (source[key]) result[key] = source[key]
    return result
  }, {})
}
