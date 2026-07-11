import { AlertTriangle, CheckCircle2, HeartPulse, LifeBuoy, ShieldCheck } from 'lucide-react'
import { RiskBadge } from '../ui/Badge'
import { Card } from '../ui/Card'

export function SafetyPanel({ activity, compact = false }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Safety Recommendation</h2>
            <p className="mt-1 text-sm text-slate-600">
              Guidance based on risk level, activity type, and expected preparation.
            </p>
          </div>
          <RiskBadge risk={activity.riskLevel} />
        </div>
      </div>

      <div className="grid gap-5 p-6">
        <section>
          <h3 className="flex items-center gap-2 font-bold text-slate-950">
            <CheckCircle2 aria-hidden="true" className="text-emerald-700" size={19} />
            Preparation checklist
          </h3>
          <ul className="mt-3 grid gap-2">
            {activity.safety.checklist.map((item) => (
              <li className="flex gap-2 text-sm leading-6 text-slate-700" key={item}>
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-himalaya-700" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl bg-red-50 p-5">
          <h3 className="flex items-center gap-2 font-bold text-red-900">
            <HeartPulse aria-hidden="true" size={19} />
            Medical warning
          </h3>
          <p className="mt-2 text-sm leading-6 text-red-800">{activity.safety.medicalWarning}</p>
        </section>

        {!compact ? (
          <>
            <section className="rounded-xl bg-himalaya-50 p-5">
              <h3 className="flex items-center gap-2 font-bold text-himalaya-900">
                <ShieldCheck aria-hidden="true" size={19} />
                Equipment recommendation
              </h3>
              <p className="mt-2 text-sm leading-6 text-himalaya-900">{activity.safety.equipment}</p>
            </section>

            <section className="rounded-xl bg-amber-50 p-5">
              <h3 className="flex items-center gap-2 font-bold text-amber-900">
                <LifeBuoy aria-hidden="true" size={19} />
                Emergency guidance
              </h3>
              <p className="mt-2 text-sm leading-6 text-amber-900">{activity.safety.emergencyGuidance}</p>
            </section>
          </>
        ) : null}

        <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
          <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-rhododendron-700" size={19} />
          <p>
            Safety advice is guidance, not a guarantee. Final decisions must follow licensed
            operators, weather conditions, personal health status, and local emergency procedures.
          </p>
        </div>
      </div>
    </Card>
  )
}
