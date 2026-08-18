import { describe, expect, it } from 'vitest'
import { protectedReturnPath } from './navigation'

describe('protectedReturnPath', () => {
  it('preserves internal paths and query strings', () => {
    expect(
      protectedReturnPath(
        { pathname: '/booking/activity-1', search: '?operator=operator-2' },
        '/user/dashboard',
      ),
    ).toBe('/booking/activity-1?operator=operator-2')
    expect(protectedReturnPath('/user/bookings', '/user/dashboard')).toBe('/user/bookings')
  })

  it.each([
    'https://malicious.example/path',
    '//malicious.example/path',
    '\\malicious.example\\path',
    'javascript:alert(1)',
    '',
    null,
  ])('rejects unsafe return target %s', (target) => {
    expect(protectedReturnPath(target, '/user/dashboard')).toBe('/user/dashboard')
  })
})
