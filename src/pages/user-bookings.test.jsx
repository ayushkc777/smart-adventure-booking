import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { bookings } from '../test/fixtures'
import { renderWithProviders } from '../test/test-utils'
import { UserBookings } from './UserBookings'

function ReceiptStateProbe() {
  const location = useLocation()
  return <output>{location.state?.bookingReference ?? 'missing state'}</output>
}

describe('UserBookings', () => {
  it('shows a useful empty state for new travelers', () => {
    renderWithProviders(<UserBookings />, { auth: { userBookings: [] } })

    expect(screen.getByRole('heading', { name: /no bookings yet/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /find an adventure/i })).toHaveAttribute(
      'href',
      '/activities',
    )
  })

  it('renders booking status, traveler count, total, and activity link', () => {
    renderWithProviders(<UserBookings />, { auth: { userBookings: bookings } })

    expect(screen.getByRole('heading', { name: bookings[0].activityName })).toBeInTheDocument()
    expect(screen.getByText(bookings[0].status)).toBeInTheDocument()
    expect(screen.getByText('2 travelers')).toBeInTheDocument()
    expect(screen.getByText(/19,000/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view activity/i })).toHaveAttribute(
      'href',
      `/activities/${bookings[0].activityId}`,
    )
  })

  it('passes the selected booking to receipt navigation state', async () => {
    const user = userEvent.setup()
    renderWithProviders(null, {
      auth: { userBookings: bookings },
      initialEntries: ['/user/bookings'],
      routes: [
        { element: <UserBookings />, path: '/user/bookings' },
        { element: <ReceiptStateProbe />, path: '/booking-success' },
      ],
    })

    await user.click(screen.getByRole('link', { name: /view receipt/i }))
    expect(screen.getByText(bookings[0].bookingReference)).toBeInTheDocument()
  })
})
