import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  isFutureOrToday,
  isValidEmail,
  isValidPhone,
  minimumPasswordLength,
  todayDateString,
} from './validation'

describe('validation utilities', () => {
  afterEach(() => vi.useRealTimers())

  it('accepts trimmed emails and rejects incomplete addresses', () => {
    expect(isValidEmail('  traveller@example.com  ')).toBe(true)
    expect(isValidEmail('traveller@example')).toBe(false)
    expect(isValidEmail('traveller @example.com')).toBe(false)
  })

  it('enforces the documented phone and password boundaries', () => {
    expect(isValidPhone('  1234567  ')).toBe(true)
    expect(isValidPhone('123456')).toBe(false)
    expect(minimumPasswordLength).toBe(8)
  })

  it('compares booking dates against the current local contract date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-18T06:00:00.000Z'))

    expect(todayDateString()).toBe('2026-08-18')
    expect(isFutureOrToday('2026-08-18')).toBe(true)
    expect(isFutureOrToday('2026-08-19')).toBe(true)
    expect(isFutureOrToday('2026-08-17')).toBe(false)
    expect(isFutureOrToday('')).toBe(false)
  })
})
