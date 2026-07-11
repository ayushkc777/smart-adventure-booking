import { Link, useLocation } from 'react-router-dom'
import { CheckCircle2, ClipboardList, Download, Printer } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/useAuth'
import { formatCurrency } from '../utils/formatters'

export function BookingSuccess() {
  const { state } = useLocation()
  const { userBookings } = useAuth()
  const bookingFromState = state?.booking ?? state
  const booking = bookingFromState?.id ? bookingFromState : userBookings[0]

  function handlePrint() {
    window.print()
  }

  function handleDownload() {
    if (!booking) return

    const receiptText = buildReceiptText(booking)
    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${booking.bookingReference ?? booking.id}-receipt.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!booking) {
    return (
      <section className="grid min-h-[70vh] place-items-center bg-slate-50 px-4 py-16">
        <Card className="max-w-xl p-8 text-center">
          <ClipboardList aria-hidden="true" className="mx-auto text-himalaya-800" size={52} />
          <h1 className="mt-5 text-3xl font-bold text-slate-950">Receipt unavailable</h1>
          <p className="mt-3 text-slate-600">
            We could not find a recent booking receipt in this browser session.
          </p>
          <Button className="mt-6" to="/user/bookings" variant="accent">
            View my bookings
          </Button>
        </Card>
      </section>
    )
  }

  const extras = booking.extras ?? []

  return (
    <section className="surface-grid bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl gap-6">
        <Card className="p-6 text-center print:hidden">
          <CheckCircle2 aria-hidden="true" className="mx-auto text-emerald-700" size={56} />
          <h1 className="mt-5 text-3xl font-bold text-slate-950">Booking request received</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Your receipt is ready. The operator will review availability and confirm the next
            steps before payment instructions are shared.
          </p>
        </Card>

        <Card className="overflow-hidden bg-white print:border-0 print:shadow-none">
          <div className="border-b border-slate-200 bg-slate-950 px-6 py-7 text-white">
            <p className="text-sm font-bold uppercase text-gold-400">Booking receipt</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-3xl font-bold">Nepal Adventure SmartBook</h2>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
                {booking.bookingReference ?? booking.id}
              </span>
            </div>
          </div>

          <div className="grid gap-6 p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <ReceiptBox label="Activity" value={booking.activityName} />
              <ReceiptBox label="Operator" value={booking.operatorName} />
              <ReceiptBox label="Status" value={booking.status} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <ReceiptSection
                rows={[
                  ['Booking reference', booking.bookingReference ?? booking.id],
                  ['Date', booking.date],
                  ['Travelers', booking.people],
                  ['Created', formatReceiptDate(booking.createdAt)],
                ]}
                title="Trip details"
              />
              <ReceiptSection
                rows={[
                  ['Traveler', booking.customerName],
                  ['Email', booking.customerEmail],
                  ['Phone', booking.customerPhone],
                  ['Emergency contact', `${booking.emergencyName} (${booking.emergencyPhone})`],
                ]}
                title="Traveler details"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <h3 className="font-bold text-slate-950">Extras and pricing</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {extras.length ? (
                  extras.map((extra) => (
                    <div className="flex justify-between gap-4 px-4 py-3 text-sm" key={extra.id}>
                      <span className="font-semibold text-slate-700">{extra.label}</span>
                      <strong className="text-slate-950">{formatCurrency(extra.price)}</strong>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-600">No optional extras selected.</div>
                )}
                <div className="flex justify-between gap-4 bg-slate-50 px-4 py-4">
                  <span className="font-bold text-slate-950">Total price</span>
                  <strong className="text-xl text-slate-950">{formatCurrency(booking.total)}</strong>
                </div>
              </div>
            </div>

            {booking.notes ? (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-500">Notes for operator</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{booking.notes}</p>
              </div>
            ) : null}

            <p className="rounded-xl bg-himalaya-50 p-4 text-sm leading-6 text-himalaya-900">
              Safety guidance is advisory. Final activity operation depends on licensed operator
              decisions, weather, health, and local conditions.
            </p>
          </div>
        </Card>

        <div className="flex flex-col justify-center gap-3 print:hidden sm:flex-row">
          <Button icon={Printer} onClick={handlePrint} variant="secondary">
            Print receipt
          </Button>
          <Button icon={Download} onClick={handleDownload} variant="secondary">
            Download receipt
          </Button>
          <Button icon={ClipboardList} to="/user/bookings" variant="accent">
            View my bookings
          </Button>
        </div>

        <Link className="text-center text-sm font-semibold text-himalaya-800 print:hidden" to="/activities">
          Browse more activities
        </Link>
      </div>
    </section>
  )
}

function ReceiptBox({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-950">{value}</p>
    </div>
  )
}

function ReceiptSection({ rows, title }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="font-bold text-slate-950">{title}</h3>
      </div>
      <div className="grid gap-3 p-4 text-sm">
        {rows.map(([label, value]) => (
          <div className="flex justify-between gap-4" key={label}>
            <span className="text-slate-600">{label}</span>
            <strong className="text-right text-slate-950">{value || 'Not provided'}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function buildReceiptText(booking) {
  const extras = booking.extras?.length
    ? booking.extras.map((extra) => `- ${extra.label}: ${formatCurrency(extra.price)}`).join('\n')
    : 'No optional extras selected.'

  return [
    'Nepal Adventure SmartBook - Booking Receipt',
    `Reference: ${booking.bookingReference ?? booking.id}`,
    `Status: ${booking.status}`,
    '',
    `Activity: ${booking.activityName}`,
    `Operator: ${booking.operatorName}`,
    `Date: ${booking.date}`,
    `Travelers: ${booking.people}`,
    '',
    `Traveler: ${booking.customerName}`,
    `Email: ${booking.customerEmail}`,
    `Phone: ${booking.customerPhone}`,
    `Emergency contact: ${booking.emergencyName} (${booking.emergencyPhone})`,
    '',
    'Extras:',
    extras,
    '',
    `Total: ${formatCurrency(booking.total)}`,
    `Created: ${formatReceiptDate(booking.createdAt)}`,
  ].join('\n')
}

function formatReceiptDate(value) {
  if (!value) return 'Not recorded'
  return new Intl.DateTimeFormat('en-NP', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
