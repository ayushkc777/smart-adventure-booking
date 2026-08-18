import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { activities } from '../test/fixtures'
import { renderWithProviders } from '../test/test-utils'
import { ActivityDetails } from './ActivityDetails'

const detailRoutes = [
  { element: <ActivityDetails />, path: '/activities/:id' },
  { element: <h1>Activity catalogue</h1>, path: '/activities' },
]

describe('activity detail availability states', () => {
  it('shows a loading state before resolving activity details', () => {
    renderWithProviders(null, {
      initialEntries: ['/activities/paragliding-pokhara'],
      platform: { catalogLoading: true },
      routes: detailRoutes,
    })

    expect(screen.getByRole('heading', { name: /loading activity details/i })).toBeInTheDocument()
  })

  it('shows catalogue errors and retries the request', async () => {
    const user = userEvent.setup()
    const refreshCatalog = vi.fn(async () => ({ ok: true }))
    renderWithProviders(null, {
      initialEntries: ['/activities/missing'],
      platform: {
        activities: [],
        catalogError: 'Activity API is unavailable.',
        getActivityById: vi.fn(() => undefined),
        refreshCatalog,
      },
      routes: detailRoutes,
    })

    expect(screen.getByRole('alert')).toHaveTextContent('Activity API is unavailable.')
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refreshCatalog).toHaveBeenCalledOnce()
  })

  it('redirects missing activity identifiers to the catalogue', () => {
    renderWithProviders(null, {
      initialEntries: ['/activities/missing'],
      platform: { getActivityById: vi.fn(() => undefined) },
      routes: detailRoutes,
    })

    expect(screen.getByRole('heading', { name: /activity catalogue/i })).toBeInTheDocument()
  })

  it('tracks views and delegates wishlist and comparison actions', async () => {
    const user = userEvent.setup()
    const toggleCompare = vi.fn()
    const toggleWishlist = vi.fn()
    const trackRecentlyViewed = vi.fn()
    renderWithProviders(null, {
      experience: { toggleCompare, toggleWishlist, trackRecentlyViewed },
      initialEntries: ['/activities/paragliding-pokhara'],
      routes: detailRoutes,
    })

    await waitFor(() => expect(trackRecentlyViewed).toHaveBeenCalledWith(activities[0].id))
    await user.click(screen.getByRole('button', { name: /^compare$/i }))
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    expect(toggleCompare).toHaveBeenCalledWith(activities[0].id)
    expect(toggleWishlist).toHaveBeenCalledWith(activities[0].id)
  })
})
