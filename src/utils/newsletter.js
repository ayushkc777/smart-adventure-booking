import { getApiError } from '../api/axios'
import { subscribeNewsletterEmail } from '../api/newsletterApi'

export async function subscribeNewsletter(email) {
  const normalizedEmail = String(email).trim().toLowerCase()

  try {
    await subscribeNewsletterEmail(normalizedEmail)
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      message: getApiError(error, 'Could not subscribe this email.'),
    }
  }
}
