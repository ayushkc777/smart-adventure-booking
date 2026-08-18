import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Mountain, Phone, Send, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useExperience } from '../../context/useExperience'
import { usePlatform } from '../../context/usePlatform'
import { subscribeNewsletter } from '../../utils/newsletter'
import { FormStatus } from '../ui/FormStatus'

export function Footer() {
  const { currentUser, isAuthenticated } = useAuth()
  const { showToast } = useExperience()
  const { settings } = usePlatform()
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false)
  const [newsletterStatus, setNewsletterStatus] = useState({ error: false, message: '' })

  async function handleNewsletter(event) {
    event.preventDefault()
    if (newsletterSubmitting) return
    const formElement = event.currentTarget
    const email = new FormData(formElement).get('email')
    setNewsletterStatus({ error: false, message: '' })
    setNewsletterSubmitting(true)
    const result = await subscribeNewsletter(email)
    setNewsletterSubmitting(false)
    if (!result.ok) {
      setNewsletterStatus({ error: true, message: result.message })
      showToast(result.message, 'info')
      return
    }
    formElement.reset()
    setNewsletterStatus({
      error: false,
      message: 'Thanks for joining the adventure travel newsletter.',
    })
    showToast('Thanks for joining the adventure travel newsletter.')
  }

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-himalaya-700 shadow-[0_16px_34px_-22px_rgb(15_118_110)]">
                <Mountain aria-hidden="true" size={24} />
              </span>
              <span>
                <span className="block text-lg font-bold">Nepal Adventure</span>
                <span className="block text-xs font-bold uppercase tracking-[0.18em] text-rhododendron-400">
                  SmartBook
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
              Compare operators, review safety guidance, and request adventure bookings across
              Nepal with clear information before you commit.
            </p>
            <p className="mt-5 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-himalaya-100">
              <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-himalaya-300" size={17} />
              Safety guidance is advisory and activity decisions must follow licensed operators.
            </p>
          </div>

          <FooterColumn
            links={[
              ['Activities', '/activities'],
              ['Compare', '/compare'],
              ['Guide', '/travel-guide'],
              ['Safety', '/safety'],
              ['About', '/about'],
              ['Contact', '/contact'],
            ]}
            title="Explore"
          />

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-himalaya-200">
              Contact
            </h2>
            <div className="mt-5 grid gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <Mail aria-hidden="true" size={16} /> {settings.supportEmail}
              </span>
              <span className="flex items-center gap-2">
                <Phone aria-hidden="true" size={16} /> {settings.operationsPhone}
              </span>
              <span className="flex items-center gap-2">
                <MapPin aria-hidden="true" size={16} /> {settings.serviceRegion}
              </span>
              {isAuthenticated && currentUser.role === 'admin' ? (
                <Link className="font-semibold text-white hover:text-himalaya-200" to="/admin">
                  Admin console
                </Link>
              ) : null}
              {isAuthenticated && currentUser.role === 'user' ? (
                <>
                  <Link className="font-semibold text-white hover:text-himalaya-200" to="/user/bookings">
                    My bookings
                  </Link>
                  <Link className="font-semibold text-white hover:text-himalaya-200" to="/user/profile">
                    Profile
                  </Link>
                </>
              ) : null}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-himalaya-200">
              Newsletter
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Get seasonal travel tips, safety reminders, and operator updates.
            </p>
            <form className="mt-5 grid gap-3" onSubmit={handleNewsletter}>
              <input
                aria-label="Newsletter email address"
                className="h-12 rounded-xl border border-white/10 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-himalaya-300 focus:ring-4 focus:ring-himalaya-300/10"
                placeholder="Email address"
                required
                name="email"
                type="email"
              />
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-rhododendron-700 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-rhododendron-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                disabled={newsletterSubmitting}
                type="submit"
              >
                <Send aria-hidden="true" size={16} />
                {newsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
              <FormStatus error={newsletterStatus.error}>{newsletterStatus.message}</FormStatus>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Nepal Adventure SmartBook. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link className="hover:text-white" to="/privacy-policy">
              Privacy policy
            </Link>
            <Link className="hover:text-white" to="/terms">
              Terms
            </Link>
            <Link className="hover:text-white" to="/cancellation-policy">
              Cancellation policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ links, title }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-himalaya-200">
        {title}
      </h2>
      <div className="mt-5 grid gap-3 text-sm text-slate-300">
        {links.map(([label, to]) => (
          <Link className="transition hover:text-white" key={to} to={to}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
