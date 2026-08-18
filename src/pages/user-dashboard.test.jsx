import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { activities, bookings, user } from '../test/fixtures'
import { renderWithProviders } from '../test/test-utils'
import { UserDashboard } from './UserDashboard'

const getNotifications = vi.hoisted(() => vi.fn())
vi.mock('../api/notificationApi', () => ({ getNotifications }))

describe('UserDashboard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('composes booking metrics, saved items, recent items, and notifications', async () => {
    getNotifications.mockResolvedValue([
      { id: 'notice-1', title: 'Operator confirmed', message: 'Your booking is confirmed.' },
    ])
    const pastBooking = {
      ...bookings[0],
      id: 'booking-past',
      bookingReference: 'SAB-PAST',
      date: '2020-01-01',
      total: 1000,
    }

    renderWithProviders(<UserDashboard />, {
      auth: { currentUser: user, userBookings: [bookings[0], pastBooking] },
      experience: {
        recentlyViewedIds: [activities[1].id],
        wishlistIds: [activities[0].id],
      },
    })

    expect(await screen.findByText('Operator confirmed')).toBeInTheDocument()
    expect(screen.getAllByText('Upcoming bookings')[0].previousElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Past bookings').previousElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Estimated total').previousElementSibling).toHaveTextContent(/20,000/)
    expect(screen.getAllByText('Saved activities')[0].previousElementSibling).toHaveTextContent('1')
    expect(screen.getAllByRole('heading', { name: activities[0].name }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('heading', { name: activities[1].name }).length).toBeGreaterThan(0)
  })

  it('uses safety reminders when notification loading fails', async () => {
    getNotifications.mockRejectedValue(new Error('Notification API unavailable'))
    renderWithProviders(<UserDashboard />, {
      auth: { currentUser: user, userBookings: [] },
      platform: { activities: [] },
    })

    await waitFor(() => expect(getNotifications).toHaveBeenCalledOnce())
    expect(screen.getByText(/review weather and operator messages/i)).toBeInTheDocument()
    expect(screen.getByText(/you do not have upcoming booking requests/i)).toBeInTheDocument()
    expect(screen.getByText(/recommendations appear after the catalog loads/i)).toBeInTheDocument()
  })
})
