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
      <div>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Operator prices, safety and value ratings, cancellation terms, and booking actions for {activity.name}
          </caption>
          <thead className="hidden bg-white text-xs uppercase tracking-[0.14em] text-slate-500 sm:table-header-group">
            <tr>
              <th className="px-5 py-3">Operator</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Safety</th>
              <th className="px-5 py-3">Value</th>
              <th className="px-5 py-3">Cancellation</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="block divide-y divide-slate-100 sm:table-row-group">
            {operators.map((operator, index) => (
              <tr className="block p-5 align-top transition hover:bg-himalaya-50/60 sm:table-row sm:p-0" key={operator.id}>
                <td className="grid grid-cols-[6.5rem_1fr] gap-3 py-2 sm:table-cell sm:px-5 sm:py-4">
                  <MobileLabel>Operator</MobileLabel>
                  <div>
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
                  </div>
                </td>
                <td className="grid grid-cols-[6.5rem_1fr] gap-3 py-2 sm:table-cell sm:px-5 sm:py-4">
                  <MobileLabel>Price</MobileLabel>
                  <div>
                    <div className="font-bold text-slate-950">{formatCurrency(operator.price)}</div>
                    {index === 0 ? (
                      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                        Lowest price
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="grid grid-cols-[6.5rem_1fr] gap-3 py-2 sm:table-cell sm:px-5 sm:py-4">
                  <MobileLabel>Safety</MobileLabel>
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                    <ShieldCheck aria-hidden="true" className="text-emerald-700" size={16} />
                    {operator.safetyRating}/5
                  </span>
                </td>
                <td className="grid grid-cols-[6.5rem_1fr] gap-3 py-2 font-semibold text-slate-800 sm:table-cell sm:px-5 sm:py-4">
                  <MobileLabel>Value</MobileLabel>
                  <span>{operator.valueRating}/5</span>
                </td>
                <td className="grid grid-cols-[6.5rem_1fr] gap-3 py-2 text-slate-600 sm:table-cell sm:px-5 sm:py-4">
                  <MobileLabel>Cancellation</MobileLabel>
                  <span>{operator.cancellation}</span>
                </td>
                <td className="grid grid-cols-[6.5rem_1fr] gap-3 py-2 sm:table-cell sm:px-5 sm:py-4">
                  <MobileLabel>Action</MobileLabel>
                  <div>
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
                  </div>
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

function MobileLabel({ children }) {
  return (
    <span aria-hidden="true" className="text-xs font-bold uppercase tracking-wide text-slate-500 sm:hidden">
      {children}
    </span>
  )
}
