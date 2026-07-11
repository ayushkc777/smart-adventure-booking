import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { bookings, user } from '../test/fixtures'
import { renderWithProviders } from '../test/test-utils'
import { UserDashboard } from './UserDashboard'
import { UserProfile } from './UserProfile'

vi.mock('../api/notificationApi', () => ({
  getNotifications: vi.fn(async () => [
    {
      id: 'notification-1',
      message: 'Operator confirmed your booking request.',
      title: 'Booking update',
    },
  ]),
}))

describe('user dashboard and profile', () => {
  it('shows account metrics for the logged-in user', async () => {
    renderWithProviders(<UserDashboard />, {
      auth: { currentUser: user, userBookings: bookings },
      experience: { wishlistIds: ['paragliding-pokhara'], recentlyViewedIds: ['nagarkot-mountain-biking'] },
    })

    expect(screen.getByText(`Welcome, ${user.fullName}`)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /upcoming bookings/i })).toBeInTheDocument()
    expect(await screen.findByText(/booking update/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /saved activities/i })).toBeInTheDocument()
  })

  it('validates oversized profile photos before Base64 storage', async () => {
    const tester = userEvent.setup()
    const showToast = vi.fn()
    const file = new File(['tiny-content'], 'large-profile.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 1024 * 1024 + 1 })

    const { container } = renderWithProviders(<UserProfile />, {
      auth: {
        currentUser: {
          ...user,
          emergencyContact: '9811111111',
          nationality: 'Nepali',
          preferredLanguage: 'English',
        },
      },
      experience: { showToast },
    })
    const input = container.querySelector('input[type="file"]')

    await tester.upload(input, file)

    expect(screen.getByText(/profile photos must be 1 mb or smaller/i)).toBeInTheDocument()
    expect(showToast).toHaveBeenCalledWith('Profile photos must be 1 MB or smaller.', 'info')
  })

  it('updates profile details and password through the account form', async () => {
    const tester = userEvent.setup()
    const updateProfile = vi.fn(async (updates) => ({ ok: true, user: { ...user, ...updates } }))
    const changePassword = vi.fn(async () => ({ ok: true }))

    renderWithProviders(<UserProfile />, {
      auth: {
        changePassword,
        currentUser: {
          ...user,
          emergencyContact: '9811111111',
          nationality: 'Nepali',
          preferredLanguage: 'English',
        },
        updateProfile,
      },
    })

    await tester.clear(screen.getByLabelText(/^full name$/i))
    await tester.type(screen.getByLabelText(/^full name$/i), 'Updated Traveler')
    await tester.click(screen.getByRole('button', { name: /save profile/i }))

    expect(await screen.findByText(/profile updated successfully/i)).toBeInTheDocument()
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'Updated Traveler' }),
    )

    await tester.type(screen.getByLabelText(/current password/i), 'OldPass123')
    await tester.type(screen.getByLabelText(/^new password$/i), 'NewPass123')
    await tester.type(screen.getByLabelText(/confirm new password/i), 'NewPass123')
    await tester.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/password changed successfully/i)).toBeInTheDocument()
    expect(changePassword).toHaveBeenCalledWith(
      expect.objectContaining({ currentPassword: 'OldPass123', newPassword: 'NewPass123' }),
    )
  })
})
