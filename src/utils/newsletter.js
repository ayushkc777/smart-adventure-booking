const NEWSLETTER_KEY = 'smartAdventureNewsletterSubscribers'

function readSubscribers() {
  try {
    return JSON.parse(localStorage.getItem(NEWSLETTER_KEY) || '[]')
  } catch {
    return []
  }
}

export function subscribeNewsletter(email) {
  const normalizedEmail = String(email).trim().toLowerCase()
  const subscribers = readSubscribers()

  if (subscribers.some((subscriber) => subscriber.email === normalizedEmail)) {
    return { ok: false, message: 'This email is already subscribed.' }
  }

  localStorage.setItem(
    NEWSLETTER_KEY,
    JSON.stringify([
      ...subscribers,
      { email: normalizedEmail, subscribedAt: new Date().toISOString() },
    ]),
  )
  return { ok: true }
}
