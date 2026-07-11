import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  CalendarCheck,
  ChartNoAxesCombined,
  ClipboardList,
  ExternalLink,
  LogOut,
  Menu,
  MessageSquareText,
  Mountain,
  Settings,
  ShieldCheck,
  Star,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useExperience } from '../../context/useExperience'
import { cn } from '../../utils/cn'
import { Avatar } from '../ui/Avatar'

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/activities', label: 'Activities', icon: ClipboardList },
  { to: '/admin/operators', label: 'Operators', icon: ShieldCheck },
  { to: '/admin/prices', label: 'Price Comparison', icon: ChartNoAxesCombined },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/support', label: 'Support Messages', icon: MessageSquareText },
  { to: '/admin/analytics', label: 'Analytics', icon: Activity },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

const titles = {
  '/admin': 'Dashboard',
  '/admin/activities': 'Activities',
  '/admin/operators': 'Operators',
  '/admin/prices': 'Price Comparison',
  '/admin/bookings': 'Bookings',
  '/admin/reviews': 'Reviews',
  '/admin/users': 'Users',
  '/admin/support': 'Support Messages',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
}

function sidebarLinkClass({ isActive }) {
  return cn(
    'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition duration-200',
    isActive
      ? 'bg-white text-himalaya-900 shadow-sm'
      : 'text-slate-300 hover:bg-white/10 hover:text-white',
  )
}

export function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const { showToast } = useExperience()
  const location = useLocation()
  const title = titles[location.pathname] ?? 'Administration'

  async function handleLogout() {
    setIsOpen(false)
    await logout()
    showToast('Logged out successfully.')
    window.location.replace('/')
  }

  const sidebar = (
    <aside className="flex h-full flex-col bg-slate-950 text-white">
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        <Link className="flex items-center gap-3" onClick={() => setIsOpen(false)} to="/admin">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-himalaya-700 text-white">
            <Mountain aria-hidden="true" size={22} />
          </span>
          <span>
            <span className="block text-sm font-bold">SmartBook</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Admin Console
            </span>
          </span>
        </Link>
        <button
          aria-label="Close admin menu"
          className="rounded-md p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
          onClick={() => setIsOpen(false)}
          type="button"
        >
          <X aria-hidden="true" size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Admin">
        {adminNavItems.map(({ end, icon: Icon, label, to }) => (
          <NavLink
            className={sidebarLinkClass}
            end={end}
            key={to}
            onClick={() => setIsOpen(false)}
            to={to}
          >
            <Icon aria-hidden="true" size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          onClick={() => setIsOpen(false)}
          to="/"
        >
          <ExternalLink aria-hidden="true" size={18} />
          View Public Website
        </Link>
        <button
          className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          onClick={handleLogout}
          type="button"
        >
          <LogOut aria-hidden="true" size={18} />
          Logout
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72">{sidebar}</div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close admin menu overlay"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setIsOpen(false)}
            type="button"
          />
          <div className="relative h-full w-72 shadow-2xl">{sidebar}</div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                aria-label="Open admin menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 lg:hidden"
                onClick={() => setIsOpen(true)}
                type="button"
              >
                <Menu aria-hidden="true" size={20} />
              </button>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-himalaya-700">Admin</p>
                <h1 className="text-xl font-bold text-slate-950">{title}</h1>
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={currentUser?.fullName} photo={currentUser?.profilePhoto} size="sm" />
              <span className="hidden max-w-48 truncate text-sm font-semibold text-slate-600 sm:block">
                {currentUser?.fullName}
              </span>
              <button
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-50"
                onClick={handleLogout}
                type="button"
              >
                <LogOut aria-hidden="true" size={17} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
