import { api, setAuthToken } from './axios'
import { mapProfilePayload, mapUser } from './mappers'

export async function loginUser(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  setAuthToken(data.token)
  return { token: data.token, user: mapUser(data.user) }
}

export async function registerUser(payload) {
  const { data } = await api.post('/auth/register', payload)
  setAuthToken(data.token)
  return { token: data.token, user: mapUser(data.user) }
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me')
  return mapUser(data.user)
}

export async function logoutUser() {
  await api.post('/auth/logout')
  setAuthToken('')
}

export async function updateCurrentUser(updates) {
  const { data } = await api.patch('/users/me', mapProfilePayload(updates))
  return mapUser(data.user)
}

export async function changeCurrentPassword(payload) {
  await api.patch('/users/me/password', {
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
  })
}

export async function uploadCurrentUserAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  const { data } = await api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return mapUser(data.user)
}

export async function deleteCurrentUserAvatar() {
  const { data } = await api.delete('/users/me/avatar')
  return mapUser(data.user)
}
