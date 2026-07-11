import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import { Button } from '../ui/Button'

export function PriceComparisonTable({ activity, showOperatorLinks = false }) {
  const operators = activity.operators
    .filter((operator) => (operator.status ?? 'active') === 'active')
    .sort((a, b) => a.price - b.price)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-premium)]">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
        <h2 className="text-xl font-bold text-slate-950">Operator Price Comparison</h2>
        <p className="mt-1 text-sm text-slate-600">
          Compare local operators by price, safety rating, cancellation policy, and inclusions.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-white text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-5 py-3">Operator</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Safety</th>
              <th className="px-5 py-3">Value</th>
              <th className="px-5 py-3">Cancellation</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {operators.map((operator, index) => (
              <tr className="align-top transition hover:bg-himalaya-50/60" key={operator.id}>
                <td className="px-5 py-4">
                  <div className="font-bold text-slate-950">{operator.name}</div>
                  <div className="mt-1 text-xs text-slate-500">License: {operator.license}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {operator.includes.map((item) => (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-himalaya-50 px-2 py-1 text-xs font-semibold text-himalaya-800 ring-1 ring-himalaya-100"
                        key={item}
                      >
                        <CheckCircle2 aria-hidden="true" size={12} />
                        {item}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-bold text-slate-950">{formatCurrency(operator.price)}</div>
                  {index === 0 ? (
                    <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                      Lowest price
                    </span>
                  ) : null}
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                    <ShieldCheck aria-hidden="true" className="text-emerald-700" size={16} />
                    {operator.safetyRating}/5
                  </span>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-800">{operator.valueRating}/5</td>
                <td className="px-5 py-4 text-slate-600">{operator.cancellation}</td>
                <td className="px-5 py-4">
                  <Button
                    size="sm"
                    to={`/booking/${activity.id}?operator=${operator.id}`}
                    variant={index === 0 ? 'accent' : 'secondary'}
                  >
                    Select
                  </Button>
                  {showOperatorLinks ? (
                    <Button
                      className="mt-2"
                      size="sm"
                      to={`/operators/${operator.id}`}
                      variant="secondary"
                    >
                      Profile
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 bg-rhododendron-50 px-6 py-4 text-sm font-medium text-rhododendron-800">
        Price transparency note: listed rates help travelers compare operators before choosing
        the experience that best matches their budget, safety preferences, and schedule.
      </div>
    </div>
  )
}
