export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const minimumPasswordLength = 8

export function isValidEmail(email) {
  return emailPattern.test(email.trim())
}

export function isValidPhone(phone) {
  return phone.trim().length >= 7
}

export function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export function isFutureOrToday(date) {
  return Boolean(date) && date >= todayDateString()
}
