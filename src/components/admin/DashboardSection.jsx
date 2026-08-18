import {
  AlertTriangle,
  CalendarCheck,
  ClipboardList,
  DollarSign,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Users,
} from 'lucide-react'
import { Badge, RiskBadge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { formatCurrency } from '../../utils/formatters'

function statusVariant(status) {
  if (status === 'Confirmed' || status === 'Completed') return 'success'
  if (status === 'Cancelled') return 'danger'
  return 'warning'
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

export function DashboardSection({
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
          <div className="border-b border-slate-200 px-5 py-4"><h3 className="text-lg font-bold text-slate-950">Recent booking requests</h3></div>
          <div className="divide-y divide-slate-100">
            {recentBookings.map((booking) => (
              <div className="grid gap-3 p-5 md:grid-cols-[1fr_auto]" key={booking.id}>
                <div><p className="font-bold text-slate-950">{booking.activityName}</p><p className="mt-1 text-sm text-slate-600">{booking.customerName} - {booking.date}</p></div>
                <div className="flex items-center gap-3 md:justify-end"><Badge variant={statusVariant(booking.status)}>{booking.status}</Badge><span className="font-bold text-slate-950">{formatCurrency(booking.total)}</span></div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2"><AlertTriangle aria-hidden="true" className="text-rhododendron-700" size={20} /><h3 className="text-lg font-bold text-slate-950">Safety attention</h3></div>
          <div className="mt-5 grid gap-3">
            {highRiskActivities.map((activity) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={activity.id}>
                <div className="flex items-center justify-between gap-3"><p className="font-bold text-slate-950">{activity.name}</p><RiskBadge risk={activity.riskLevel} /></div>
                <p className="mt-2 text-sm text-slate-600">{activity.safety.medicalWarning}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="p-5">
        <h3 className="text-lg font-bold text-slate-950">Trust indicators</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[[Star, 'Reviews', reviews.length], [SlidersHorizontal, 'Price points', operators.length], [Users, 'Service regions', new Set(activities.map((activity) => activity.location)).size]].map(([Icon, label, value]) => (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={label}><Icon aria-hidden="true" className="text-himalaya-800" size={20} /><p className="mt-3 text-2xl font-bold text-slate-950">{value}</p><p className="text-sm font-semibold text-slate-500">{label}</p></div>
          ))}
        </div>
      </Card>
    </div>
  )
}
