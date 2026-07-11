import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/useAuth'
import { useExperience } from '../context/useExperience'
import { isValidEmail, isValidPhone, minimumPasswordLength } from '../utils/validation'

export function Register() {
  const navigate = useNavigate()
  const { currentUser, register, users } = useAuth()
  const { showToast } = useExperience()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (currentUser) {
    return <Navigate replace to={currentUser.role === 'admin' ? '/admin' : '/user/dashboard'} />
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '', form: '' }))
  }

  function validate() {
    const nextErrors = {}
    const normalizedEmail = form.email.trim().toLowerCase()

    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = 'Please enter your full name.'
    }

    if (!isValidEmail(form.email)) {
      nextErrors.email = 'Please enter a valid email address.'
    } else if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      nextErrors.email = 'An account with this email already exists.'
    }

    if (!isValidPhone(form.phone)) {
      nextErrors.phone = 'Please enter a valid phone number.'
    }

    if (form.password.length < minimumPasswordLength) {
      nextErrors.password = `Password must be at least ${minimumPasswordLength} characters.`
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    return nextErrors
  }

  const validationErrors = validate()
  const isFormValid = Object.keys(validationErrors).length === 0

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validate()
    setTouched({
      confirmPassword: true,
      email: true,
      fullName: true,
      password: true,
      phone: true,
    })

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    if (submitting) return

    setSubmitting(true)
    const result = await register(form)
    setSubmitting(false)

    if (!result.ok) {
      setErrors({ form: result.message })
      return
    }

    showToast('Account created successfully.')
    navigate('/user/dashboard', { replace: true })
  }

  return (
    <section className="surface-grid bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-himalaya-100 text-himalaya-900">
            <UserPlus aria-hidden="true" size={24} />
          </span>
          <h1 className="mt-5 text-5xl font-bold leading-tight text-slate-950 md:text-6xl">
            Create your traveler account
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Save contact details, track booking requests, and manage your Nepal adventure
            plans from one account.
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-950">Register</h2>
          <p className="mt-2 text-sm text-slate-600">
            Use your real contact details so operators can confirm availability quickly.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Full name
              <input
                className="premium-input w-full"
                onBlur={() => setTouched((current) => ({ ...current, fullName: true }))}
                onChange={(event) => updateField('fullName', event.target.value)}
                value={form.fullName}
              />
              {(touched.fullName || errors.fullName) && validationErrors.fullName ? (
                <span className="text-sm text-red-700" role="alert">
                  {validationErrors.fullName}
                </span>
              ) : null}
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Email
                <input
                  className="premium-input w-full"
                  onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                  onChange={(event) => updateField('email', event.target.value)}
                  type="email"
                  value={form.email}
                />
                {(touched.email || errors.email) && validationErrors.email ? (
                  <span className="text-sm text-red-700" role="alert">
                    {validationErrors.email}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Phone
                <input
                  className="premium-input w-full"
                  onBlur={() => setTouched((current) => ({ ...current, phone: true }))}
                  onChange={(event) => updateField('phone', event.target.value)}
                  type="tel"
                  value={form.phone}
                />
                {(touched.phone || errors.phone) && validationErrors.phone ? (
                  <span className="text-sm text-red-700" role="alert">
                    {validationErrors.phone}
                  </span>
                ) : null}
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Password
                <span className="relative">
                  <input
                    aria-label="Password"
                    className="premium-input w-full pr-11"
                    onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                    onChange={(event) => updateField('password', event.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                  />
                  <button
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                  >
                    {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                  </button>
                </span>
                {(touched.password || errors.password) && validationErrors.password ? (
                  <span className="text-sm text-red-700" role="alert">
                    {validationErrors.password}
                  </span>
                ) : null}
              </label>

              <label className="grid gap-2 text-sm font-bold text-slate-700">
                Confirm password
                <span className="relative">
                  <input
                    aria-label="Confirm password"
                    className="premium-input w-full pr-11"
                    onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                    onChange={(event) => updateField('confirmPassword', event.target.value)}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                  />
                  <button
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    type="button"
                  >
                    {showConfirmPassword ? (
                      <EyeOff aria-hidden="true" size={18} />
                    ) : (
                      <Eye aria-hidden="true" size={18} />
                    )}
                  </button>
                </span>
                {(touched.confirmPassword || errors.confirmPassword) && validationErrors.confirmPassword ? (
                  <span className="text-sm text-red-700" role="alert">
                    {validationErrors.confirmPassword}
                  </span>
                ) : null}
              </label>
            </div>

            {errors.form ? (
              <p
                aria-live="polite"
                className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
                role="alert"
              >
                {errors.form}
              </p>
            ) : null}

            <Button disabled={!isFormValid || submitting} size="lg" type="submit" variant="accent">
              {submitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link className="font-bold text-himalaya-800" to="/login">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </section>
  )
}
