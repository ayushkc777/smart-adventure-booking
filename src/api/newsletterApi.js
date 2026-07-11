import { api } from './axios'

export async function subscribeNewsletterEmail(email) {
  const { data } = await api.post('/newsletter', { email })
  return data.subscription
}
