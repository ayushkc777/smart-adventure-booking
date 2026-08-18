import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { bookings, user } from '../test/fixtures'
import { renderWithProviders } from '../test/test-utils'
import { Booking } from './Booking'

async function completeBookingForm(tester) {
  await tester.click(screen.getByRole('button', { name: /continue/i }))
  await tester.click(screen.getByRole('button', { name: /continue/i }))
  await tester.type(screen.getByLabelText(/emergency contact name/i), 'Backup Contact')
  await tester.type(screen.getByLabelText(/emergency phone/i), '9811111111')
  await tester.click(screen.getByRole('button', { name: /continue/i }))
  await tester.click(screen.getByRole('button', { name: /continue/i }))
  await tester.click(screen.getByLabelText(/safety advice is guidance only/i))
}

function renderBooking(addBooking, showToast = vi.fn()) {
  return renderWithProviders(null, {
    auth: { addBooking, currentUser: user },
    experience: { showToast },
    initialEntries: ['/booking/paragliding-pokhara'],
    routes: [
      { element: <Booking />, path: '/booking/:id' },
      { element: <h1>Receipt ready</h1>, path: '/booking-success' },
    ],
  })
}

describe('booking submission recovery', () => {
  it('retains booking data and supports retry after API rejection', async () => {
    const tester = userEvent.setup()
    const showToast = vi.fn()
    const addBooking = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, message: 'Operator availability check failed.' })
      .mockResolvedValueOnce(bookings[0])
    renderBooking(addBooking, showToast)
    await completeBookingForm(tester)

    await tester.click(screen.getByRole('button', { name: /confirm booking/i }))
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith('Operator availability check failed.', 'info'),
    )
    expect(screen.getByText(/backup contact \(9811111111\)/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirm booking/i })).toBeEnabled()

    await tester.click(screen.getByRole('button', { name: /confirm booking/i }))
    expect(await screen.findByRole('heading', { name: /receipt ready/i })).toBeInTheDocument()
    expect(addBooking).toHaveBeenCalledTimes(2)
  })

  it('prevents duplicate submissions while a request is pending', async () => {
    let finishRequest
    const addBooking = vi.fn(
      () => new Promise((resolve) => { finishRequest = resolve }),
    )
    const tester = userEvent.setup()
    renderBooking(addBooking)
    await completeBookingForm(tester)
    const submit = screen.getByRole('button', { name: /confirm booking/i })

    await tester.click(submit)
    expect(screen.getByRole('button', { name: /sending request/i })).toBeDisabled()
    await tester.click(screen.getByRole('button', { name: /sending request/i }))
    expect(addBooking).toHaveBeenCalledOnce()

    finishRequest(bookings[0])
    expect(await screen.findByRole('heading', { name: /receipt ready/i })).toBeInTheDocument()
  })
})
