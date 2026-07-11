import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Info, X } from 'lucide-react'
import { ExperienceContext } from './experienceContext'
import { useAuth } from './useAuth'

const WISHLIST_KEY = 'smartAdventureWishlist'
const COMPARE_KEY = 'smartAdventureCompare'
const RECENT_KEY = 'smartAdventureRecentlyViewed'

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function scopedKey(key, ownerId) {
  return `${key}:${ownerId}`
}

function readScoped(key, ownerId) {
  const stored = readJson(scopedKey(key, ownerId), null)
  if (stored) return stored
  return ownerId === 'guest' ? readJson(key, []) : []
}

export function ExperienceProvider({ children }) {
  const { currentUser } = useAuth()
  const ownerId = currentUser?.id ?? 'guest'
  const [wishlistIds, setWishlistIds] = useState(() => readScoped(WISHLIST_KEY, ownerId))
  const [compareIds, setCompareIds] = useState(() => readJson(COMPARE_KEY, []))
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() =>
    readScoped(RECENT_KEY, ownerId),
  )
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    setWishlistIds(readScoped(WISHLIST_KEY, ownerId))
    setRecentlyViewedIds(readScoped(RECENT_KEY, ownerId))
  }, [ownerId])

  const showToast = useCallback((message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3200)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toggleWishlist = useCallback((activityId) => {
    const exists = wishlistIds.includes(activityId)
    const next = exists ? wishlistIds.filter((id) => id !== activityId) : [activityId, ...wishlistIds]
    setWishlistIds(next)
    saveJson(scopedKey(WISHLIST_KEY, ownerId), next)
    showToast(exists ? 'Removed from saved activities.' : 'Activity saved to your wishlist.')
  }, [ownerId, showToast, wishlistIds])

  const toggleCompare = useCallback((activityId) => {
    if (compareIds.includes(activityId)) {
      const next = compareIds.filter((id) => id !== activityId)
      setCompareIds(next)
      saveJson(COMPARE_KEY, next)
      showToast('Removed from comparison.')
      return
    }

    if (compareIds.length >= 3) {
      showToast('You can compare up to 3 activities.', 'info')
      return
    }

    const next = [...compareIds, activityId]
    setCompareIds(next)
    saveJson(COMPARE_KEY, next)
    showToast('Added to comparison.')
  }, [compareIds, showToast])

  const clearCompare = useCallback(() => {
    setCompareIds([])
    saveJson(COMPARE_KEY, [])
    showToast('Comparison cleared.')
  }, [showToast])

  const trackRecentlyViewed = useCallback((activityId) => {
    setRecentlyViewedIds((current) => {
      const next = [activityId, ...current.filter((id) => id !== activityId)].slice(0, 6)
      saveJson(scopedKey(RECENT_KEY, ownerId), next)
      return next
    })
  }, [ownerId])

  const value = useMemo(
    () => ({
      clearCompare,
      compareIds,
      dismissToast,
      recentlyViewedIds,
      showToast,
      toasts,
      toggleCompare,
      toggleWishlist,
      trackRecentlyViewed,
      wishlistIds,
    }),
    [
      clearCompare,
      compareIds,
      dismissToast,
      recentlyViewedIds,
      showToast,
      toasts,
      toggleCompare,
      toggleWishlist,
      trackRecentlyViewed,
      wishlistIds,
    ],
  )

  return (
    <ExperienceContext.Provider value={value}>
      {children}
      <ToastViewport dismissToast={dismissToast} toasts={toasts} />
    </ExperienceContext.Provider>
  )
}

function ToastViewport({ dismissToast, toasts }) {
  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[80] grid w-[min(24rem,calc(100vw-2rem))] gap-3"
    >
      {toasts.map((toast) => {
        const Icon = toast.tone === 'info' ? Info : CheckCircle2
        return (
          <div
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 shadow-[var(--shadow-premium-lg)]"
            key={toast.id}
            role="status"
          >
            <Icon
              aria-hidden="true"
              className={toast.tone === 'info' ? 'mt-0.5 text-himalaya-700' : 'mt-0.5 text-emerald-700'}
              size={18}
            />
            <span className="flex-1 leading-6">{toast.message}</span>
            <button
              aria-label="Dismiss notification"
              className="rounded-xl p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => dismissToast(toast.id)}
              type="button"
            >
              <X aria-hidden="true" size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
