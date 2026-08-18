import { beforeEach, describe, expect, it } from 'vitest'
import { API_BASE_URL, SESSION_KEY, TOKEN_KEY, api, assetUrl, getApiError, setAuthToken } from './axios'

describe('api helpers', () => {
  beforeEach(() => localStorage.clear())

  it('prefers joined field validation messages', () => {
    const error = {
      message: 'request failed',
      response: {
        data: {
          errors: [{ message: 'Email is invalid.' }, { message: 'Phone is required.' }],
          message: 'Validation failed.',
        },
      },
    }

    expect(getApiError(error)).toBe('Email is invalid. Phone is required.')
    expect(getApiError({ response: { data: { message: 'Not found.' } } })).toBe('Not found.')
    expect(getApiError({ message: 'Network Error' })).toBe('Network Error')
    expect(getApiError({}, 'Try later.')).toBe('Try later.')
  })

  it('resolves relative uploads while preserving browser-safe assets', () => {
    expect(assetUrl('/uploads/avatar.png')).toBe(`${API_BASE_URL}/uploads/avatar.png`)
    expect(assetUrl('https://cdn.example.com/activity.webp')).toBe(
      'https://cdn.example.com/activity.webp',
    )
    expect(assetUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc')
    expect(assetUrl('/images/rafting.jpeg')).toBe('/images/rafting.jpeg')
    expect(assetUrl('')).toBe('')
  })

  it('stores and removes bearer tokens using the shared key', async () => {
    setAuthToken('token-123')
    expect(localStorage.getItem(TOKEN_KEY)).toBe('token-123')

    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled
    const config = await requestInterceptor({ headers: {} })
    expect(config.headers.Authorization).toBe('Bearer token-123')

    setAuthToken(null)
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(SESSION_KEY).toBe('smartAdventureSession')
  })
})
