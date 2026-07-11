import { api } from './axios'

export async function getNotifications() {
  const { data } = await api.get('/notifications')
  return data.notifications
}
