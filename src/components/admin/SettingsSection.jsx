import { Save } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export function SettingsSection({ handleSaveSettings, settings, updateSettings }) {
  return (
    <Card className="p-5">
      <form className="grid gap-5" onSubmit={handleSaveSettings}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Support email
            <input className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100" onChange={(event) => updateSettings('supportEmail', event.target.value)} required type="email" value={settings.supportEmail} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Operations phone
            <input className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100" onChange={(event) => updateSettings('operationsPhone', event.target.value)} required type="tel" value={settings.operationsPhone} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Service region
            <input className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100" onChange={(event) => updateSettings('serviceRegion', event.target.value)} required value={settings.serviceRegion} />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
            Require safety acknowledgement
            <input checked={settings.requireSafetyAcknowledgement} className="h-5 w-5 accent-himalaya-700" onChange={(event) => updateSettings('requireSafetyAcknowledgement', event.target.checked)} type="checkbox" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Booking operations note
          <textarea className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100" onChange={(event) => updateSettings('bookingNote', event.target.value)} required value={settings.bookingNote} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Safety alert management
          <textarea className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-2 focus:ring-himalaya-100" onChange={(event) => updateSettings('safetyAlert', event.target.value)} required value={settings.safetyAlert} />
        </label>
        <div className="flex justify-end"><Button icon={Save} type="submit" variant="accent">Save settings</Button></div>
      </form>
    </Card>
  )
}
