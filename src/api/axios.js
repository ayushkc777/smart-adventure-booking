import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5050'
export const TOKEN_KEY = 'smartAdventureApiToken'
export const SESSION_KEY = 'smartAdventureSession'
export const AUTH_EXPIRED_EVENT = 'smart-adventure:auth-expired'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      setAuthToken('')
      localStorage.removeItem(SESSION_KEY)
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  },
)

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (data?.errors?.length) {
    return data.errors.map((item) => item.message).join(' ')
  }
  return data?.message || error?.message || fallback
}

export function assetUrl(value) {
  if (!value) return ''
  if (String(value).startsWith('http') || String(value).startsWith('data:')) return value
  if (String(value).startsWith('/images/') || String(value).startsWith('/vite.svg')) return value
  return `${API_BASE_URL}${value}`
}
