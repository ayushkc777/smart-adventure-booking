import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Bell,
  CalendarCheck,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Mountain,
  UserRound,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useExperience } from '../../context/useExperience'
import { cn } from '../../utils/cn'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'

const visitorNavItems = [
  { to: '/', label: 'Home' },
  { to: '/activities', label: 'Activities' },
  { to: '/compare', label: 'Compare' },
  { to: '/travel-guide', label: 'Guide' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const userNavItems = [
  { to: '/', label: 'Home' },
  { to: '/activities', label: 'Activities' },
  { to: '/compare', label: 'Compare' },
  { to: '/travel-guide', label: 'Guide' },
]

const dropdownItems = [
  { to: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/user/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/user/dashboard#saved-activities', label: 'Wishlist', icon: Heart },
  { to: '/user/profile', label: 'Profile', icon: UserRound },
]

function navClass({ isActive }) {
  return cn(
    'rounded-full px-4 py-2 text-sm font-semibold transition duration-200 hover:bg-himalaya-50 hover:text-himalaya-900',
    isActive ? 'bg-himalaya-50 text-himalaya-900' : 'text-slate-600',
  )
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileButtonRef = useRef(null)
  const profileMenuRef = useRef(null)
  const { currentUser, isAuthenticated, logout } = useAuth()
  const { showToast } = useExperience()
  const isAdmin = currentUser?.role === 'admin'
  const navItems = isAuthenticated && !isAdmin ? userNavItems : visitorNavItems

  useEffect(() => {
    if (!isProfileOpen) return undefined

    const previousFocus = document.activeElement
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsProfileOpen(false)
    }
    const handlePointerDown = (event) => {
      if (
        !profileMenuRef.current?.contains(event.target) &&
        !profileButtonRef.current?.contains(event.target)
      ) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)
    profileMenuRef.current?.querySelector('[role="menuitem"]')?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
      previousFocus?.focus()
    }
  }, [isProfileOpen])

  async function handleLogout() {
    setIsOpen(false)
    setIsProfileOpen(false)
    await logout()
    showToast('Logged out successfully.')
    window.location.replace('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link className="flex min-w-0 items-center gap-3" to="/" onClick={() => setIsOpen(false)}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-himalaya-800 text-white shadow-[0_16px_34px_-22px_rgb(15_118_110)]">
            <Mountain aria-hidden="true" size={23} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold leading-tight text-slate-950">
              Nepal Adventure
            </span>
            <span className="block truncate text-xs font-bold uppercase tracking-[0.16em] text-rhododendron-700">
              SmartBook
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink className={navClass} end={item.to === '/'} key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated && !isAdmin ? (
            <>
              <Link
                aria-label="Open notifications"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-himalaya-200 hover:bg-himalaya-50 hover:text-himalaya-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-himalaya-700"
                to="/user/dashboard#notifications"
              >
                <Bell aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={2.25} />
                <span className="sr-only">Notifications</span>
              </Link>
              <div className="relative">
                <button
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                  className="flex h-12 items-center gap-3 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-himalaya-200 hover:bg-himalaya-50"
                  onClick={() => setIsProfileOpen((value) => !value)}
                  ref={profileButtonRef}
                  type="button"
                >
                  <Avatar name={currentUser.fullName} photo={currentUser.profilePhoto} size="sm" />
                  <span className="max-w-32 truncate">{currentUser.fullName}</span>
                  <ChevronDown aria-hidden="true" size={16} />
                </button>
                {isProfileOpen ? (
                  <AccountDropdown
                    currentUser={currentUser}
                    handleLogout={handleLogout}
                    menuRef={profileMenuRef}
                    onClose={() => setIsProfileOpen(false)}
                  />
                ) : null}
              </div>
            </>
          ) : isAdmin ? (
            <Button to="/admin" variant="primary">
              Admin Console
            </Button>
          ) : (
            <>
              <Button to="/login" variant="secondary">
                Login
              </Button>
              <Button to="/register" variant="accent">
                Register
              </Button>
            </>
          )}
        </div>

        <button
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm lg:hidden"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          {isOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2 px-4 py-4" aria-label="Mobile">
            {navItems.map((item) => (
              <NavLink
                className={navClass}
                end={item.to === '/'}
                key={item.to}
                onClick={() => setIsOpen(false)}
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
            {isAuthenticated && !isAdmin ? (
              <>
                <div className="mt-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <Avatar name={currentUser.fullName} photo={currentUser.profilePhoto} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-950">
                      {currentUser.fullName}
                    </span>
                    <span className="block truncate text-xs font-semibold text-slate-500">
                      {currentUser.email}
                    </span>
                  </span>
                </div>
                {dropdownItems.map(({ icon: Icon, label, to }) => (
                  <NavLink
                    className={navClass}
                    key={label}
                    onClick={() => setIsOpen(false)}
                    to={to}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon aria-hidden="true" size={17} />
                      {label}
                    </span>
                  </NavLink>
                ))}
                <Button className="mt-2" icon={LogOut} onClick={handleLogout} variant="secondary">
                  Logout
                </Button>
              </>
            ) : isAdmin ? (
              <Button className="mt-2" to="/admin" variant="primary">
                Admin Console
              </Button>
            ) : (
              <div className="mt-2 grid gap-2">
                <Button onClick={() => setIsOpen(false)} to="/login" variant="secondary">
                  Login
                </Button>
                <Button onClick={() => setIsOpen(false)} to="/register" variant="accent">
                  Register
                </Button>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  )
}

function AccountDropdown({ currentUser, handleLogout, menuRef, onClose }) {
  function handleKeyDown(event) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const items = [...event.currentTarget.querySelectorAll('[role="menuitem"]')]
    const currentIndex = items.indexOf(document.activeElement)
    let nextIndex = currentIndex
    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length
    if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = items.length - 1
    items[nextIndex]?.focus()
  }

  return (
    <div
      className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-premium-lg)]"
      onKeyDown={handleKeyDown}
      ref={menuRef}
      role="menu"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 p-4">
        <Avatar name={currentUser.fullName} photo={currentUser.profilePhoto} size="md" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-slate-950">
            {currentUser.fullName}
          </span>
          <span className="block truncate text-xs font-semibold text-slate-500">
            {currentUser.email}
          </span>
        </span>
      </div>
      <div className="grid p-2">
        {dropdownItems.map(({ icon: Icon, label, to }) => (
          <Link
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-himalaya-50 hover:text-himalaya-900"
            key={label}
            onClick={onClose}
            role="menuitem"
            to={to}
          >
            <Icon aria-hidden="true" size={17} />
            {label}
          </Link>
        ))}
        <button
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-rhododendron-50 hover:text-rhododendron-700"
          onClick={handleLogout}
          role="menuitem"
          type="button"
        >
          <LogOut aria-hidden="true" size={17} />
          Logout
        </button>
      </div>
    </div>
  )
}
