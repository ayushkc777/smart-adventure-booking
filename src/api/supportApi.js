import { api } from './axios'
import { backendSupportCategory, backendSupportStatus, mapSupportMessage } from './mappers'

export async function createSupportMessage(payload) {
  const { data } = await api.post('/support', {
    category: backendSupportCategory(payload.category),
    email: payload.email,
    message: payload.message,
    name: payload.fullName,
    phone: payload.phone,
    subject: payload.subject,
  })
  return mapSupportMessage(data.supportMessage)
}

export async function getSupportMessages(params = {}) {
  const { data } = await api.get('/support', { params: { limit: 100, ...params } })
  return data.supportMessages.map(mapSupportMessage)
}

export async function updateSupportMessageStatus(id, status) {
  const { data } = await api.patch(`/support/${id}`, { status: backendSupportStatus(status) })
  return mapSupportMessage(data.supportMessage)
}
