import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../test/test-utils'
import { Footer } from './Footer'

const subscribeNewsletter = vi.hoisted(() => vi.fn())
vi.mock('../../utils/newsletter', () => ({ subscribeNewsletter }))

describe('footer newsletter form', () => {
  beforeEach(() => vi.clearAllMocks())

  it('prevents duplicate submissions and clears successful input', async () => {
    let finishSubmission
    subscribeNewsletter.mockImplementation(
      () => new Promise((resolve) => { finishSubmission = resolve }),
    )
    const user = userEvent.setup()
    const showToast = vi.fn()
    renderWithProviders(<Footer />, { experience: { showToast } })
    const input = screen.getByLabelText(/newsletter email address/i)
    const submit = screen.getByRole('button', { name: /subscribe/i })

    await user.type(input, 'Traveler@Example.com')
    await user.click(submit)

    expect(subscribeNewsletter).toHaveBeenCalledOnce()
    expect(submit).toBeDisabled()
    await user.click(submit)
    expect(subscribeNewsletter).toHaveBeenCalledOnce()

    finishSubmission({ ok: true })
    await waitFor(() => expect(submit).toBeEnabled())
    expect(input).toHaveValue('')
    expect(screen.getByRole('status')).toHaveTextContent(/thanks for joining/i)
    expect(showToast).toHaveBeenCalledWith('Thanks for joining the adventure travel newsletter.')
  })

  it('retains the email and announces backend failures', async () => {
    subscribeNewsletter.mockResolvedValue({ ok: false, message: 'Already subscribed.' })
    const user = userEvent.setup()
    const showToast = vi.fn()
    renderWithProviders(<Footer />, { experience: { showToast } })
    const input = screen.getByLabelText(/newsletter email address/i)

    await user.type(input, 'guest@example.com')
    await user.click(screen.getByRole('button', { name: /subscribe/i }))

    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Already subscribed.', 'info'))
    expect(screen.getByRole('alert')).toHaveTextContent('Already subscribed.')
    expect(input).toHaveValue('guest@example.com')
  })
})
