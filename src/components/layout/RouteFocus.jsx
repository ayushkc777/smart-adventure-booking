import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

export function RouteFocus({ children }) {
  const { pathname } = useLocation()
  const mainRef = useRef(null)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const main = mainRef.current
    const heading = main?.querySelector('h1, h2')
    setAnnouncement(heading?.textContent?.trim() || 'Page loaded')
    main?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <p aria-live="polite" className="sr-only" role="status">
        {announcement}
      </p>
      <main className="flex-1 outline-none" ref={mainRef} tabIndex="-1">
        {children ?? <Outlet />}
      </main>
    </>
  )
}
