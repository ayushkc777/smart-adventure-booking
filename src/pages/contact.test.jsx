import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../test/test-utils'
import { Contact } from './Contact'

const createSupportMessage = vi.hoisted(() => vi.fn())
vi.mock('../api/supportApi', () => ({ createSupportMessage }))

async function fillContactForm(user) {
  await user.type(screen.getByLabelText(/full name/i), '  Guest Traveler  ')
  await user.type(screen.getByLabelText(/^email$/i), '  Guest@Example.COM  ')
  await user.type(screen.getByLabelText(/^phone$/i), '  9800000000  ')
  await user.type(screen.getByLabelText(/^subject$/i), '  Booking help  ')
  await user.type(
    screen.getByLabelText(/^message$/i),
    '  Please help with my operator confirmation.  ',
  )
}

describe('Contact support form', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows validation boundaries before submission', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Contact />)

    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled()
    await user.type(screen.getByLabelText(/full name/i), 'G')
    await user.tab()
    await user.type(screen.getByLabelText(/^email$/i), 'invalid')
    await user.tab()
    await user.type(screen.getByLabelText(/^phone$/i), '123')
    await user.tab()

    expect(screen.getByText(/please enter your full name/i)).toBeInTheDocument()
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    expect(screen.getByText(/please enter a valid phone/i)).toBeInTheDocument()
    expect(createSupportMessage).not.toHaveBeenCalled()
  })

  it('normalizes the payload and clears a successful form', async () => {
    createSupportMessage.mockResolvedValue({ id: 'SUPPORT-100' })
    const user = userEvent.setup()
    const showToast = vi.fn()
    renderWithProviders(<Contact />, { experience: { showToast } })
    await fillContactForm(user)

    await user.click(screen.getByRole('button', { name: /send message/i }))

    expect(await screen.findByText(/reference: SUPPORT-100/i)).toBeInTheDocument()
    expect(createSupportMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'guest@example.com',
        fullName: 'Guest Traveler',
        message: 'Please help with my operator confirmation.',
        phone: '9800000000',
        subject: 'Booking help',
      }),
    )
    expect(screen.getByLabelText(/^email$/i)).toHaveValue('')
    expect(showToast).toHaveBeenCalledWith('Support message sent successfully.')
  })

  it('retains data after server failure and allows resubmission', async () => {
    createSupportMessage
      .mockRejectedValueOnce({ response: { data: { message: 'Support service unavailable.' } } })
      .mockResolvedValueOnce({ id: 'SUPPORT-RETRY' })
    const user = userEvent.setup()
    const showToast = vi.fn()
    renderWithProviders(<Contact />, { experience: { showToast } })
    await fillContactForm(user)

    await user.click(screen.getByRole('button', { name: /send message/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Support service unavailable.')
    expect(screen.getByLabelText(/^email$/i)).toHaveValue('Guest@Example.COM')

    await user.click(screen.getByRole('button', { name: /send message/i }))
    await waitFor(() => expect(screen.getByText(/SUPPORT-RETRY/i)).toBeInTheDocument())
    expect(createSupportMessage).toHaveBeenCalledTimes(2)
  })
})
