import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ExperienceProvider } from './ExperienceContext.jsx'
import { useExperience } from './useExperience'

vi.mock('./useAuth', () => ({ useAuth: () => ({ currentUser: null }) }))

function ExperienceHarness() {
  const experience = useExperience()
  return (
    <div>
      <output data-testid="wishlist">{experience.wishlistIds.join(',')}</output>
      <output data-testid="compare">{experience.compareIds.join(',')}</output>
      <output data-testid="recent">{experience.recentlyViewedIds.join(',')}</output>
      <button onClick={() => experience.toggleWishlist('activity-1')} type="button">wishlist</button>
      <button onClick={() => experience.toggleCompare('activity-4')} type="button">compare fourth</button>
      <button onClick={() => experience.clearCompare()} type="button">clear compare</button>
      <button onClick={() => experience.trackRecentlyViewed('activity-7')} type="button">track recent</button>
    </div>
  )
}

describe('ExperienceProvider persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => vi.useRealTimers())

  it('recovers safely from malformed persisted state', () => {
    localStorage.setItem('smartAdventureWishlist:guest', '{bad json')
    localStorage.setItem('smartAdventureCompare', '{bad json')

    render(<ExperienceProvider><ExperienceHarness /></ExperienceProvider>)

    expect(screen.getByTestId('wishlist')).toHaveTextContent('')
    expect(screen.getByTestId('compare')).toHaveTextContent('')
  })

  it('persists guest wishlist changes under the scoped key', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<ExperienceProvider><ExperienceHarness /></ExperienceProvider>)

    await user.click(screen.getByRole('button', { name: 'wishlist' }))

    expect(screen.getByTestId('wishlist')).toHaveTextContent('activity-1')
    expect(JSON.parse(localStorage.getItem('smartAdventureWishlist:guest'))).toEqual(['activity-1'])
  })

  it('enforces the three-item comparison limit and can clear it', async () => {
    localStorage.setItem('smartAdventureCompare', JSON.stringify(['activity-1', 'activity-2', 'activity-3']))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<ExperienceProvider><ExperienceHarness /></ExperienceProvider>)

    await user.click(screen.getByRole('button', { name: 'compare fourth' }))
    expect(screen.getByTestId('compare')).toHaveTextContent('activity-1,activity-2,activity-3')
    expect(screen.getByText('You can compare up to 3 activities.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'clear compare' }))
    expect(screen.getByTestId('compare')).toHaveTextContent('')
    expect(JSON.parse(localStorage.getItem('smartAdventureCompare'))).toEqual([])
  })

  it('deduplicates and caps recently viewed activities at six', async () => {
    localStorage.setItem(
      'smartAdventureRecentlyViewed:guest',
      JSON.stringify(['activity-1', 'activity-2', 'activity-3', 'activity-4', 'activity-5', 'activity-6']),
    )
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<ExperienceProvider><ExperienceHarness /></ExperienceProvider>)

    await user.click(screen.getByRole('button', { name: 'track recent' }))

    expect(screen.getByTestId('recent')).toHaveTextContent(
      'activity-7,activity-1,activity-2,activity-3,activity-4,activity-5',
    )
    expect(JSON.parse(localStorage.getItem('smartAdventureRecentlyViewed:guest'))).toHaveLength(6)
  })
})
