import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bookings } from '../test/fixtures'
import { renderWithProviders } from '../test/test-utils'
import { BookingSuccess } from './BookingSuccess'

function renderReceipt({ state, userBookings = [] } = {}) {
  return renderWithProviders(null, {
    auth: { userBookings },
    initialEntries: [{ pathname: '/booking-success', state }],
    routes: [{ element: <BookingSuccess />, path: '/booking-success' }],
  })
}

describe('BookingSuccess receipt', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'print', { configurable: true, value: vi.fn() })
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:receipt'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
  })

  it('shows a recoverable state when no receipt is available', () => {
    renderReceipt()

    expect(screen.getByRole('heading', { name: /receipt unavailable/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view my bookings/i })).toHaveAttribute(
      'href',
      '/user/bookings',
    )
  })

  it('falls back to the latest authenticated booking', () => {
    renderReceipt({ userBookings: bookings })

    expect(screen.getAllByText(bookings[0].bookingReference)).toHaveLength(2)
    expect(screen.getByText(bookings[0].activityName)).toBeInTheDocument()
    expect(screen.getByText(/no optional extras selected/i)).toBeInTheDocument()
  })

  it('uses readable fallbacks for missing optional receipt fields', () => {
    renderReceipt({ state: { id: 'booking-minimal', total: 0 } })

    expect(screen.getAllByText('booking-minimal')).toHaveLength(2)
    expect(screen.getAllByText('Not provided').length).toBeGreaterThan(3)
    expect(screen.getByText('Not recorded')).toBeInTheDocument()
  })

  it('prints and downloads a receipt while releasing the object URL', async () => {
    const tester = userEvent.setup()
    let downloadedFilename = ''
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      downloadedFilename = this.download
    })
    renderReceipt({ state: bookings[0] })

    await tester.click(screen.getByRole('button', { name: /print receipt/i }))
    expect(window.print).toHaveBeenCalledOnce()

    await tester.click(screen.getByRole('button', { name: /download receipt/i }))
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(click).toHaveBeenCalledOnce()
    expect(downloadedFilename).toBe(`${bookings[0].bookingReference}-receipt.txt`)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:receipt')
  })
})
