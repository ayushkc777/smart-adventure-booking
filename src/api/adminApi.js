import { api } from './axios'
import { mapUser } from './mappers'

export async function getDashboardStats() {
  const { data } = await api.get('/admin/dashboard')
  return data.stats
}

export async function getAnalytics() {
  const { data } = await api.get('/admin/analytics')
  return data.analytics
}

export async function getUsers(params = {}) {
  const { data } = await api.get('/users', { params: { limit: 100, ...params } })
  return data.users.map(mapUser)
}

export async function updateUserRecord(userId, updates) {
  const { data } = await api.patch(`/users/${userId}`, updates)
  return mapUser(data.user)
}

export async function deleteUserRecord(userId) {
  const { data } = await api.delete(`/users/${userId}`)
  return data.user ? mapUser(data.user) : null
}
