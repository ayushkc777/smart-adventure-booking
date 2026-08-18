import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { admin, bookings } from '../test/fixtures'
import { renderWithProviders } from '../test/test-utils'
import { AdminDashboard } from './AdminDashboard'

const adminApi = vi.hoisted(() => ({
  getAnalytics: vi.fn(),
  getDashboardStats: vi.fn(),
}))
const supportApi = vi.hoisted(() => ({
  getSupportMessages: vi.fn(),
  updateSupportMessageStatus: vi.fn(),
}))
vi.mock('../api/adminApi', () => adminApi)
vi.mock('../api/supportApi', () => supportApi)

describe('AdminDashboard workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adminApi.getAnalytics.mockResolvedValue({ bookingsByStatus: [] })
    adminApi.getDashboardStats.mockResolvedValue({
      activities: 7,
      bookings: 9,
      operators: 8,
      revenue: 26000,
    })
    supportApi.getSupportMessages.mockResolvedValue([])
  })

  it('loads API-backed dashboard metrics for administrators', async () => {
    renderWithProviders(<AdminDashboard />, { auth: { currentUser: admin } })

    expect(screen.getByRole('heading', { name: /^dashboard$/i })).toBeInTheDocument()
    await waitFor(() => expect(adminApi.getDashboardStats).toHaveBeenCalledOnce())
    expect(screen.getByText('Active public experiences').previousElementSibling).toHaveTextContent('7')
    expect(screen.getByText('Listed partner offers').previousElementSibling).toHaveTextContent('8')
    expect(screen.getByText('Across stored requests').previousElementSibling).toHaveTextContent('9')
  })

  it('updates a booking status and reports the successful workflow', async () => {
    const tester = userEvent.setup()
    const updateBookingStatus = vi.fn(async () => ({ ok: true, booking: bookings[0] }))
    const showToast = vi.fn()
    renderWithProviders(<AdminDashboard section="bookings" />, {
      auth: { bookingRecords: bookings, currentUser: admin, updateBookingStatus },
      experience: { showToast },
    })

    await tester.selectOptions(
      screen.getByLabelText(`Update status for booking ${bookings[0].id}`),
      'Completed',
    )

    await waitFor(() =>
      expect(updateBookingStatus).toHaveBeenCalledWith(bookings[0].id, 'Completed'),
    )
    expect(showToast).toHaveBeenCalledWith('Booking status updated successfully.')
  })

  it('saves edited operational settings', async () => {
    const tester = userEvent.setup()
    const saveSettings = vi.fn()
    const showToast = vi.fn()
    const settings = {
      bookingNote: 'Operator confirmation follows availability checks.',
      cancellationWindowHours: 24,
      featuredActivityLimit: 4,
      operationsPhone: '+977-9800000000',
      platformName: 'Nepal Adventure SmartBook',
      requireSafetyAcknowledgement: true,
      safetyAlert: 'Monitor weather and route notices.',
      serviceRegion: 'Kathmandu, Nepal',
      supportEmail: 'support@example.com',
    }
    renderWithProviders(<AdminDashboard section="settings" />, {
      auth: { currentUser: admin },
      experience: { showToast },
      platform: { saveSettings, settings },
    })

    const email = screen.getByLabelText(/support email/i)
    await tester.clear(email)
    await tester.type(email, 'operations@example.com')
    await tester.click(screen.getByRole('button', { name: /save settings/i }))

    expect(saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({ supportEmail: 'operations@example.com' }),
    )
    expect(showToast).toHaveBeenCalledWith('Settings saved successfully.')
  })
})
