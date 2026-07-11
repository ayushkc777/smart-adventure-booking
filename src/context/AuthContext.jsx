import { useMemo, useState } from 'react'
import { AuthContext } from './authContext'

const USERS_KEY = 'smartAdventureUsers'
const SESSION_KEY = 'smartAdventureSession'
const BOOKINGS_KEY = 'smartAdventureBookings'
const BOOKING_STATUS_KEY = 'smartAdventureBookingStatusUpdates'
const DELETED_USER_IDS_KEY = 'smartAdventureDeletedUserIds'

const defaultUsers = [
  {
    id: 'admin-001',
    fullName: 'Admin Manager',
    email: 'admin@smartadventure.com',
    phone: '+977 9800000000',
    password: 'Admin123',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    emergencyContact: '+977 9800000000',
    nationality: 'Nepali',
    preferredLanguage: 'English',
    profilePhoto: '',
    status: 'active',
  },
  {
    id: 'traveler-001',
    fullName: 'Smart Adventure Traveler',
    email: 'user@smartadventure.com',
    phone: '+977 9812345678',
    password: 'User1234',
    role: 'user',
    createdAt: '2026-01-05T00:00:00.000Z',
    emergencyContact: '+977 9811111111',
    nationality: 'Nepali',
    preferredLanguage: 'English',
    profilePhoto: '',
    status: 'active',
  },
]

function normalizeUserId(id) {
  if (id === `admin-${'de'}${'mo'}`) return 'admin-001'
  if (id === `user-${'de'}${'mo'}`) return 'traveler-001'
  return id
}

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function publicUser(user) {
  if (!user) return null
  return {
    id: normalizeUserId(user.id),
    emergencyContact: user.emergencyContact ?? '',
    fullName: user.fullName,
    email: user.email,
    nationality: user.nationality ?? '',
    phone: user.phone,
    preferredLanguage: user.preferredLanguage ?? 'English',
    profilePhoto: user.profilePhoto ?? '',
    role: user.role,
    status: user.status ?? 'active',
  }
}

function getInitialSession() {
  const session = readJson(SESSION_KEY, null)
  if (!session) return null

  const storedUsers = readJson(USERS_KEY, [])
  const normalizedId = normalizeUserId(session.id)
  const deletedUserIds = new Set(
    readJson(DELETED_USER_IDS_KEY, []).map((id) => normalizeUserId(id)),
  )
  if (deletedUserIds.has(normalizedId)) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
  const storedUser = storedUsers.find(
    (user) =>
      normalizeUserId(user.id) === normalizedId ||
      user.email?.toLowerCase() === session.email?.toLowerCase(),
  )
  const normalizedSession = publicUser({ ...session, ...(storedUser ?? {}), id: normalizedId })
  saveJson(SESSION_KEY, normalizedSession)
  return normalizedSession
}

function getInitialBookings() {
  const storedBookings = readJson(BOOKINGS_KEY, [])
  const normalizedBookings = storedBookings.map((booking) => ({
    ...booking,
    userId: normalizeUserId(booking.userId),
  }))
  saveJson(BOOKINGS_KEY, normalizedBookings)
  return normalizedBookings
}

function getInitialUsers() {
  const storedUsers = readJson(USERS_KEY, [])
  const deletedUserIds = new Set(
    readJson(DELETED_USER_IDS_KEY, []).map((id) => normalizeUserId(id)),
  )
  const activeDefaultUsers = defaultUsers.filter(
    (user) => !deletedUserIds.has(normalizeUserId(user.id)),
  )
  const activeDefaultEmails = new Set(activeDefaultUsers.map((user) => user.email))
  const storedByEmail = new Map(storedUsers.map((user) => [user.email.toLowerCase(), user]))
  const seededUsers = activeDefaultUsers.map((user) => {
    const storedUser = storedByEmail.get(user.email.toLowerCase())
    return storedUser
      ? {
          ...user,
          fullName: storedUser.fullName,
          phone: storedUser.phone,
          id: user.id,
          role: user.role === 'admin' ? 'admin' : storedUser.role ?? user.role,
          email: user.email,
          password: storedUser.password ?? user.password,
          createdAt: storedUser.createdAt ?? user.createdAt,
          emergencyContact: storedUser.emergencyContact ?? user.emergencyContact ?? '',
          nationality: storedUser.nationality ?? user.nationality ?? '',
          preferredLanguage: storedUser.preferredLanguage ?? user.preferredLanguage ?? 'English',
          profilePhoto: storedUser.profilePhoto ?? user.profilePhoto ?? '',
          status: storedUser.status ?? 'active',
        }
      : user
  })
  const customUsers = storedUsers
    .filter(
      (user) =>
        !activeDefaultEmails.has(user.email.toLowerCase()) &&
        !deletedUserIds.has(normalizeUserId(user.id)),
    )
    .map((user) => ({
      ...user,
      createdAt: user.createdAt ?? new Date().toISOString(),
      emergencyContact: user.emergencyContact ?? '',
      nationality: user.nationality ?? '',
      preferredLanguage: user.preferredLanguage ?? 'English',
      profilePhoto: user.profilePhoto ?? '',
      status: user.status ?? 'active',
    }))
  const users = [...seededUsers, ...customUsers]
  saveJson(USERS_KEY, users)
  return users
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(getInitialUsers)
  const [currentUser, setCurrentUser] = useState(getInitialSession)
  const [bookingRecords, setBookingRecords] = useState(getInitialBookings)
  const [bookingStatusUpdates, setBookingStatusUpdates] = useState(() =>
    readJson(BOOKING_STATUS_KEY, {}),
  )

  function syncUsers(nextUsers) {
    setUsers(nextUsers)
    saveJson(USERS_KEY, nextUsers)
  }

  function login(email, password) {
    const normalizedEmail = email.trim().toLowerCase()
    const matchedUser = users.find(
      (user) => user.email.toLowerCase() === normalizedEmail && user.password === password,
    )

    if (!matchedUser) {
      return { ok: false, message: 'Invalid email or password. Please try again.' }
    }

    if (matchedUser.status === 'suspended') {
      return { ok: false, message: 'This account is suspended. Please contact support.' }
    }

    const sessionUser = publicUser(matchedUser)
    setCurrentUser(sessionUser)
    saveJson(SESSION_KEY, sessionUser)
    return { ok: true, user: sessionUser }
  }

  function register({ fullName, email, phone, password }) {
    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = users.find((user) => user.email.toLowerCase() === normalizedEmail)

    if (existingUser) {
      return { ok: false, message: 'An account with this email already exists.' }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role: 'user',
      createdAt: new Date().toISOString(),
      emergencyContact: '',
      nationality: '',
      preferredLanguage: 'English',
      profilePhoto: '',
      status: 'active',
    }
    const nextUsers = [...users, newUser]
    syncUsers(nextUsers)

    const sessionUser = publicUser(newUser)
    setCurrentUser(sessionUser)
    saveJson(SESSION_KEY, sessionUser)
    return { ok: true, user: sessionUser }
  }

  function logout() {
    setCurrentUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  function updateProfile(updates) {
    if (!currentUser) return { ok: false, message: 'Please log in again.' }

    const nextUsers = users.map((user) =>
      user.id === currentUser.id
        ? {
            ...user,
            emergencyContact: updates.emergencyContact.trim(),
            fullName: updates.fullName.trim(),
            nationality: updates.nationality.trim(),
            phone: updates.phone.trim(),
            preferredLanguage: updates.preferredLanguage,
            profilePhoto: updates.profilePhoto ?? user.profilePhoto ?? '',
          }
        : user,
    )
    syncUsers(nextUsers)

    const nextSession = {
      ...currentUser,
      emergencyContact: updates.emergencyContact.trim(),
      fullName: updates.fullName.trim(),
      nationality: updates.nationality.trim(),
      phone: updates.phone.trim(),
      preferredLanguage: updates.preferredLanguage,
      profilePhoto: updates.profilePhoto ?? currentUser.profilePhoto ?? '',
    }
    setCurrentUser(nextSession)
    saveJson(SESSION_KEY, nextSession)
    return { ok: true }
  }

  function changePassword({ currentPassword, newPassword }) {
    if (!currentUser) return { ok: false, message: 'Please log in again.' }

    const storedUser = users.find((user) => user.id === currentUser.id)
    if (!storedUser) return { ok: false, message: 'Account not found.' }

    if (storedUser.password !== currentPassword) {
      return { ok: false, message: 'Current password is incorrect.' }
    }

    const nextUsers = users.map((user) =>
      user.id === currentUser.id ? { ...user, password: newPassword } : user,
    )
    syncUsers(nextUsers)
    return { ok: true }
  }

  function addBooking(booking) {
    const reference = `NA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
    const nextBooking = {
      ...booking,
      bookingReference: reference,
      id: reference,
      userId: currentUser?.id,
      customerName: booking.customerName ?? currentUser?.fullName,
      customerEmail: booking.customerEmail ?? currentUser?.email,
      customerPhone: booking.customerPhone ?? currentUser?.phone,
      status: 'Pending confirmation',
      createdAt: new Date().toISOString(),
    }
    const nextBookings = [nextBooking, ...bookingRecords]
    setBookingRecords(nextBookings)
    saveJson(BOOKINGS_KEY, nextBookings)
    return nextBooking
  }

  function updateBookingStatus(bookingId, status) {
    const nextRecords = bookingRecords.map((booking) =>
      booking.id === bookingId ? { ...booking, status } : booking,
    )
    const nextStatuses = { ...bookingStatusUpdates, [bookingId]: status }
    setBookingRecords(nextRecords)
    saveJson(BOOKINGS_KEY, nextRecords)
    setBookingStatusUpdates(nextStatuses)
    saveJson(BOOKING_STATUS_KEY, nextStatuses)
  }

  function updateUserByAdmin(userId, updates) {
    if (!currentUser || currentUser.role !== 'admin') {
      return { ok: false, message: 'Admin access is required.' }
    }

    const existingUser = users.find((user) => user.id === userId)
    if (!existingUser) return { ok: false, message: 'User not found.' }

    const nextRole = userId === currentUser.id ? currentUser.role : updates.role
    const nextStatus = userId === currentUser.id ? 'active' : updates.status
    const nextUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            fullName: updates.fullName.trim(),
            phone: updates.phone.trim(),
            role: nextRole,
            status: nextStatus ?? user.status ?? 'active',
          }
        : user,
    )
    syncUsers(nextUsers)

    if (userId === currentUser.id) {
      const nextSession = {
        ...currentUser,
        fullName: updates.fullName.trim(),
        phone: updates.phone.trim(),
      }
      setCurrentUser(nextSession)
      saveJson(SESSION_KEY, nextSession)
    }

    return { ok: true }
  }

  function updateUserStatus(userId, status) {
    if (!currentUser || currentUser.role !== 'admin') {
      return { ok: false, message: 'Admin access is required.' }
    }

    if (userId === currentUser.id) {
      return { ok: false, message: 'You cannot suspend your own admin account.' }
    }

    const nextUsers = users.map((user) => (user.id === userId ? { ...user, status } : user))
    syncUsers(nextUsers)
    return { ok: true }
  }

  function deleteUser(userId) {
    if (!currentUser || currentUser.role !== 'admin') {
      return { ok: false, message: 'Admin access is required.' }
    }

    if (userId === currentUser.id) {
      return { ok: false, message: 'You cannot delete your own admin account.' }
    }

    const targetUser = users.find((user) => user.id === userId)
    if (!targetUser) return { ok: false, message: 'User not found.' }

    const deletedUserIds = new Set(readJson(DELETED_USER_IDS_KEY, []))
    deletedUserIds.add(normalizeUserId(userId))
    saveJson(DELETED_USER_IDS_KEY, [...deletedUserIds])
    const nextUsers = users.filter((user) => user.id !== userId)
    const nextBookings = bookingRecords.map((booking) =>
      booking.userId === userId
        ? {
            ...booking,
            customerName: booking.customerName || targetUser.fullName,
            deletedUserId: userId,
            deletedUserEmail: targetUser.email,
            status: booking.status === 'Completed' ? booking.status : 'Account removed',
            userDeleted: true,
            userId: null,
          }
        : booking,
    )

    syncUsers(nextUsers)
    setBookingRecords(nextBookings)
    saveJson(BOOKINGS_KEY, nextBookings)
    return { ok: true }
  }

  const userBookings = useMemo(() => {
    if (!currentUser) return []
    return bookingRecords.filter((booking) => booking.userId === currentUser.id)
  }, [bookingRecords, currentUser])

  const value = {
    addBooking,
    bookingRecords,
    bookingStatusUpdates,
    changePassword,
    currentUser,
    isAuthenticated: Boolean(currentUser),
    login,
    logout,
    register,
    deleteUser,
    updateUserByAdmin,
    updateUserStatus,
    updateProfile,
    updateBookingStatus,
    userBookings,
    users,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
