import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/useAuth'
import { useExperience } from '../context/useExperience'
import { isValidEmail, minimumPasswordLength } from '../utils/validation'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, login } = useAuth()
  const { showToast } = useExperience()
  const [form, setForm] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (currentUser) {
    const fallbackPath = currentUser.role === 'admin' ? '/admin' : '/user/dashboard'
    const from = location.state?.from
    const targetPath =
      currentUser.role === 'admin'
        ? '/admin'
        : from
          ? `${from.pathname}${from.search ?? ''}`
          : fallbackPath
    return <Navigate replace to={targetPath} />
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  function fieldErrors() {
    return {
      email: isValidEmail(form.email) ? '' : 'Enter a valid email address.',
      password:
        form.password.length >= minimumPasswordLength
          ? ''
          : `Password must be at least ${minimumPasswordLength} characters.`,
    }
  }

  const validationErrors = fieldErrors()
  const isFormValid = !validationErrors.email && !validationErrors.password

  async function handleSubmit(event) {
    event.preventDefault()
    setTouched({ email: true, password: true })

    if (!isFormValid || submitting) return

    setSubmitting(true)
    const result = await login(form.email, form.password)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.message)
      return
    }

    const from = location.state?.from
    const fallbackPath = result.user.role === 'admin' ? '/admin' : '/user/dashboard'
    const targetPath =
      result.user.role === 'admin'
        ? '/admin'
        : from
          ? `${from.pathname}${from.search ?? ''}`
          : fallbackPath
    showToast('Signed in successfully.')
    navigate(targetPath, { replace: true })
  }

  return (
    <section className="surface-grid bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-himalaya-100 text-himalaya-900">
            <ShieldCheck aria-hidden="true" size={24} />
          </span>
          <h1 className="mt-5 text-5xl font-bold leading-tight text-slate-950 md:text-6xl">
            Sign in to continue your adventure booking
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Access your bookings, manage traveler details, and continue checkout securely
            from your account.
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-950">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter your account details to continue.
          </p>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Email address
              <input
                className="premium-input w-full"
                onChange={(event) => updateField('email', event.target.value)}
                onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                required
                type="email"
                value={form.email}
              />
              {touched.email && validationErrors.email ? (
                <span className="text-sm text-red-700" role="alert">
                  {validationErrors.email}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Password
              <span className="relative">
                <input
                  aria-label="Password"
                  className="premium-input w-full pr-11"
                  onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                  onChange={(event) => updateField('password', event.target.value)}
                  required
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
              {touched.password && validationErrors.password ? (
                <span className="text-sm text-red-700" role="alert">
                  {validationErrors.password}
                </span>
              ) : null}
            </label>

            {error ? (
              <p
                aria-live="polite"
                className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <Button disabled={!isFormValid || submitting} icon={LogIn} size="lg" type="submit" variant="accent">
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            New to Nepal Adventure SmartBook?{' '}
            <Link className="font-bold text-himalaya-800" to="/register">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </section>
  )
}
