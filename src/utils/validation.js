export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const minimumPasswordLength = 8

export function isValidEmail(email) {
  return emailPattern.test(email.trim())
}

export function isValidPhone(phone) {
  const value = String(phone).trim()
  if (!/^\+?[\d\s().-]+$/.test(value)) return false
  const digitCount = value.replace(/\D/g, '').length
  return digitCount >= 7 && digitCount <= 15
}

export function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export function isFutureOrToday(date) {
  return Boolean(date) && date >= todayDateString()
}
