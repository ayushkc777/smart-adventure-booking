import { useState } from 'react'
import { Ambulance, HelpCircle, Mail, MapPin, Phone, Send, ShieldAlert } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionTitle } from '../components/ui/SectionTitle'
import { getApiError } from '../api/axios'
import { createSupportMessage } from '../api/supportApi'
import { useExperience } from '../context/useExperience'
import { usePlatform } from '../context/usePlatform'
import { isValidEmail, isValidPhone } from '../utils/validation'

const categories = [
  'Booking support',
  'Safety guidance',
  'Operator question',
  'Payment question',
  'Account help',
  'General inquiry',
]

const faqs = [
  ['How quickly will I hear back?', 'Most booking and account questions are reviewed within one business day.'],
  ['Can support confirm weather safety?', 'Operators make final activity decisions using weather, route, water, and local condition checks.'],
  ['Can I change a booking request?', 'Send the booking reference and preferred change. The operator will confirm availability.'],
  ['Where do urgent safety concerns go?', 'Call the operator first, then contact local emergency services when immediate help is needed.'],
]

export function Contact() {
  const { showToast } = useExperience()
  const { settings } = usePlatform()
  const [form, setForm] = useState({
    category: categories[0],
    email: '',
    fullName: '',
    message: '',
    phone: '',
    subject: '',
  })
  const [touched, setTouched] = useState({})
  const [submittedReference, setSubmittedReference] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setSubmittedReference('')
    setSubmitError('')
  }

  function validate() {
    const nextErrors = {}

    if (form.fullName.trim().length < 2) nextErrors.fullName = 'Please enter your full name.'
    if (!isValidEmail(form.email)) nextErrors.email = 'Please enter a valid email address.'
    if (!isValidPhone(form.phone)) nextErrors.phone = 'Please enter a valid phone number.'
    if (!form.category) nextErrors.category = 'Please choose a category.'
    if (form.subject.trim().length < 4) nextErrors.subject = 'Please enter a clear subject.'
    if (form.message.trim().length < 12) nextErrors.message = 'Please add a little more detail.'

    return nextErrors
  }

  const errors = validate()
  const isFormValid = Object.keys(errors).length === 0

  async function handleSubmit(event) {
    event.preventDefault()
    setTouched({
      category: true,
      email: true,
      fullName: true,
      message: true,
      phone: true,
      subject: true,
    })

    if (!isFormValid || submitting) return

    setSubmitting(true)
    try {
      const message = await createSupportMessage({
        ...form,
        email: form.email.trim().toLowerCase(),
        fullName: form.fullName.trim(),
        message: form.message.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
      })
      setSubmittedReference(message.id)
    } catch (error) {
      const message = getApiError(error, 'Could not send support message.')
      setSubmitError(message)
      showToast(message, 'info')
      setSubmitting(false)
      return
    }
    setSubmitting(false)
    setForm({
      category: categories[0],
      email: '',
      fullName: '',
      message: '',
      phone: '',
      subject: '',
    })
    setTouched({})
    showToast('Support message sent successfully.')
  }

  return (
    <>
      <section className="surface-grid bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionTitle
            description="Need help choosing an activity, updating a booking request, or understanding safety guidance? Send a message and our support team will review it."
            eyebrow="Contact"
            title="Support for Nepal adventure travelers"
          />
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-slate-950">Send a message</h2>
            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <ContactInput
                  error={touched.fullName ? errors.fullName : ''}
                  label="Full name"
                  onBlur={() => setTouched((current) => ({ ...current, fullName: true }))}
                  onChange={(value) => updateField('fullName', value)}
                  value={form.fullName}
                />
                <ContactInput
                  error={touched.email ? errors.email : ''}
                  label="Email"
                  onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                  onChange={(value) => updateField('email', value)}
                  type="email"
                  value={form.email}
                />
                <ContactInput
                  error={touched.phone ? errors.phone : ''}
                  label="Phone"
                  onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
                  onChange={(value) => updateField('phone', value)}
                  type="tel"
                  value={form.phone}
                />
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Category
                  <select
                    aria-describedby={touched.category && errors.category ? 'contact-category-error' : undefined}
                    aria-invalid={Boolean(touched.category && errors.category)}
                    aria-label="Category"
                    className="premium-select w-full"
                    onBlur={() => setTouched((current) => ({ ...current, category: true }))}
                    onChange={(event) => updateField('category', event.target.value)}
                    value={form.category}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {touched.category && errors.category ? (
                    <span className="text-sm text-red-700" id="contact-category-error" role="alert">
                      {errors.category}
                    </span>
                  ) : null}
                </label>
              </div>

              <ContactInput
                error={touched.subject ? errors.subject : ''}
                label="Subject"
                onBlur={() => setTouched((current) => ({ ...current, subject: true }))}
                onChange={(value) => updateField('subject', value)}
                value={form.subject}
              />

              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Message
                <textarea
                  aria-describedby={touched.message && errors.message ? 'contact-message-error' : undefined}
                  aria-invalid={Boolean(touched.message && errors.message)}
                  aria-label="Message"
                  className="min-h-36 rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-950 outline-none focus:border-himalaya-700 focus:ring-4 focus:ring-himalaya-100"
                  onBlur={() => setTouched((current) => ({ ...current, message: true }))}
                  onChange={(event) => updateField('message', event.target.value)}
                  value={form.message}
                />
                {touched.message && errors.message ? (
                  <span className="text-sm text-red-700" id="contact-message-error" role="alert">
                    {errors.message}
                  </span>
                ) : null}
              </label>

              {submittedReference ? (
                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  Message received. Reference: {submittedReference}
                </p>
              ) : null}

              {submitError ? (
                <p
                  aria-live="polite"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
                  role="alert"
                >
                  {submitError}
                </p>
              ) : null}

              <Button disabled={!isFormValid || submitting} icon={Send} type="submit" variant="accent">
                {submitting ? 'Sending...' : 'Send message'}
              </Button>
            </form>
          </Card>

          <div className="grid gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-950">Support contacts</h2>
              <div className="mt-5 grid gap-4 text-sm text-slate-700">
                <ContactLine icon={Mail} label={settings.supportEmail} />
                <ContactLine icon={Phone} label={settings.operationsPhone} />
                <ContactLine icon={MapPin} label={settings.serviceRegion} />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <ShieldAlert aria-hidden="true" className="text-rhododendron-700" size={24} />
                <h2 className="text-xl font-bold text-slate-950">Emergency tourism contacts</h2>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-700">
                <ContactLine icon={Ambulance} label="Nepal emergency services: 100 / 102" />
                <ContactLine icon={Phone} label="Tourist Police Nepal: +977 1 4247041" />
                <ContactLine icon={Phone} label="Rescue coordination: contact your operator first" />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                For urgent danger, call local emergency services immediately and follow operator
                instructions.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <HelpCircle aria-hidden="true" className="text-himalaya-800" size={24} />
                <h2 className="text-xl font-bold text-slate-950">Common questions</h2>
              </div>
              <div className="mt-5 grid gap-4">
                {faqs.map(([question, answer]) => (
                  <div className="rounded-xl bg-slate-50 p-4" key={question}>
                    <p className="font-bold text-slate-950">{question}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}

function ContactInput({ error, label, onBlur, onChange, type = 'text', value }) {
  const fieldId = `contact-${label.toLowerCase().replaceAll(' ', '-')}`
  const errorId = `${fieldId}-error`
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        aria-label={label}
        className="premium-input w-full"
        id={fieldId}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
      {error ? (
        <span className="text-sm text-red-700" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}

function ContactLine({ icon: Icon, label }) {
  return (
    <span className="flex items-center gap-2">
      <Icon aria-hidden="true" className="text-himalaya-800" size={17} />
      {label}
    </span>
  )
}
