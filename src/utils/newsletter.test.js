import { beforeEach, describe, expect, it, vi } from 'vitest'
import { subscribeNewsletterEmail } from '../api/newsletterApi'
import { subscribeNewsletter } from './newsletter'

vi.mock('../api/newsletterApi', () => ({ subscribeNewsletterEmail: vi.fn() }))

describe('newsletter workflow', () => {
  beforeEach(() => vi.clearAllMocks())

  it('normalizes email addresses before submission', async () => {
    subscribeNewsletterEmail.mockResolvedValue({ success: true })

    await expect(subscribeNewsletter('  Traveler@Example.COM  ')).resolves.toEqual({ ok: true })
    expect(subscribeNewsletterEmail).toHaveBeenCalledWith('traveler@example.com')
  })

  it('returns backend and network feedback without throwing', async () => {
    subscribeNewsletterEmail.mockRejectedValueOnce({
      response: { data: { message: 'This email is already subscribed.' } },
    })
    await expect(subscribeNewsletter('guest@example.com')).resolves.toEqual({
      ok: false,
      message: 'This email is already subscribed.',
    })

    subscribeNewsletterEmail.mockRejectedValueOnce({})
    await expect(subscribeNewsletter('guest@example.com')).resolves.toEqual({
      ok: false,
      message: 'Could not subscribe this email.',
    })
  })
})
