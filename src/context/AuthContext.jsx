import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  changeCurrentPassword,
  deleteCurrentUserAvatar,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateCurrentUser,
  uploadCurrentUserAvatar,
} from '../api/authApi'
import {
  createBooking,
  getBookings,
  updateBookingStatusRecord,
} from '../api/bookingApi'
import {
  deleteUserRecord,
  getUsers,
  updateUserRecord,
} from '../api/adminApi'
import { getApiError, SESSION_KEY, TOKEN_KEY, setAuthToken } from '../api/axios'
import { AuthContext } from './authContext'

function readSession() {
  try {
    const value = localStorage.getItem(SESSION_KEY)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

function saveSession(user) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

function mergeById(items, updatedItem) {
  if (!updatedItem) return items
  const exists = items.some((item) => item.id === updatedItem.id)
  return exists
    ? items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    : [updatedItem, ...items]
}

export function AuthProvider({ children }) {
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))
  const [currentUser, setCurrentUser] = useState(readSession)
  const [bookingRecords, setBookingRecords] = useState([])
  const [bookingStatusUpdates, setBookingStatusUpdates] = useState({})
  const [users, setUsers] = useState([])

  const loadBookings = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return []
    try {
      const bookings = await getBookings()
      setBookingRecords(bookings)
      return bookings
    } catch {
      setBookingRecords([])
      return []
    }
  }, [])

  const loadUsers = useCallback(async (user = readSession()) => {
    if (user?.role !== 'admin') {
      setUsers([])
      return []
    }
    try {
      const apiUsers = await getUsers()
      setUsers(apiUsers)
      return apiUsers
    } catch {
      setUsers([])
      return []
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function restoreSession() {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setCurrentUser(null)
        setBookingRecords([])
        setUsers([])
        saveSession(null)
        setAuthLoading(false)
        return
      }

      try {
        const user = await getCurrentUser()
        if (ignore) return
        setCurrentUser(user)
        saveSession(user)
        await loadBookings()
        await loadUsers(user)
      } catch {
        if (!ignore) {
          setCurrentUser(null)
          setBookingRecords([])
          setUsers([])
          saveSession(null)
          setAuthToken('')
        }
      } finally {
        if (!ignore) setAuthLoading(false)
      }
    }

    restoreSession()
    return () => {
      ignore = true
    }
  }, [loadBookings, loadUsers])

  async function login(email, password) {
    try {
      const { user } = await loginUser(email, password)
      setCurrentUser(user)
      saveSession(user)
      await loadBookings()
      await loadUsers(user)
      return { ok: true, user }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Invalid email or password. Please try again.') }
    }
  }

  async function register({ fullName, email, phone, password }) {
    try {
      const { user } = await registerUser({ fullName, email, password, phone })
      setCurrentUser(user)
      saveSession(user)
      await loadBookings()
      return { ok: true, user }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not create account.') }
    }
  }

  async function logout() {
    try {
      if (localStorage.getItem(TOKEN_KEY)) {
        await logoutUser()
      }
    } catch {
      setAuthToken('')
    }
    setCurrentUser(null)
    setBookingRecords([])
    setUsers([])
    saveSession(null)
  }

  async function updateProfile(updates) {
    if (!currentUser) return { ok: false, message: 'Please log in again.' }

    try {
      const user = await updateCurrentUser(updates)
      let nextUser = {
        ...user,
        profilePhoto:
          updates.profilePhoto === ''
            ? ''
            : updates.profilePhoto?.startsWith('data:')
              ? updates.profilePhoto
              : user.profilePhoto,
      }

      if (updates.profilePhoto === '') {
        nextUser = await deleteCurrentUserAvatar()
      }

      setCurrentUser(nextUser)
      saveSession(nextUser)
      return { ok: true, user: nextUser }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not update profile.') }
    }
  }

  async function uploadProfilePhoto(file) {
    if (!file) return { ok: false, message: 'Choose a profile photo first.' }

    try {
      const user = await uploadCurrentUserAvatar(file)
      setCurrentUser(user)
      saveSession(user)
      return { ok: true, user }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not upload profile photo.') }
    }
  }

  async function changePassword({ currentPassword, newPassword }) {
    if (!currentUser) return { ok: false, message: 'Please log in again.' }

    try {
      await changeCurrentPassword({ currentPassword, newPassword })
      return { ok: true }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not change password.') }
    }
  }

  async function addBooking(booking) {
    try {
      const savedBooking = await createBooking(booking)
      setBookingRecords((current) => [savedBooking, ...current])
      return savedBooking
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not submit booking request.') }
    }
  }

  async function updateBookingStatus(bookingId, status) {
    try {
      const booking = await updateBookingStatusRecord(bookingId, status)
      setBookingRecords((current) => mergeById(current, booking))
      setBookingStatusUpdates((current) => ({ ...current, [bookingId]: booking.status }))
      return { ok: true, booking }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not update booking status.') }
    }
  }

  async function updateUserByAdmin(userId, updates) {
    if (!currentUser || currentUser.role !== 'admin') {
      return { ok: false, message: 'Admin access is required.' }
    }

    try {
      const user = await updateUserRecord(userId, {
        fullName: updates.fullName?.trim(),
        phone: updates.phone?.trim(),
        role: updates.role,
        status: updates.status,
      })
      setUsers((current) => mergeById(current, user))
      if (user.id === currentUser.id) {
        setCurrentUser(user)
        saveSession(user)
      }
      return { ok: true, user }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not update user.') }
    }
  }

  async function updateUserStatus(userId, status) {
    return updateUserByAdmin(userId, {
      ...(users.find((user) => user.id === userId) ?? {}),
      status,
    })
  }

  async function deleteUser(userId) {
    if (!currentUser || currentUser.role !== 'admin') {
      return { ok: false, message: 'Admin access is required.' }
    }

    try {
      const user = await deleteUserRecord(userId)
      if (user) {
        setUsers((current) => mergeById(current, user))
      } else {
        setUsers((current) => current.filter((item) => item.id !== userId))
      }
      return { ok: true }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not delete user.') }
    }
  }

  const userBookings = useMemo(() => {
    if (!currentUser) return []
    return bookingRecords.filter((booking) => booking.userId === currentUser.id)
  }, [bookingRecords, currentUser])

  const value = {
    addBooking,
    authLoading,
    bookingRecords,
    bookingStatusUpdates,
    changePassword,
    currentUser,
    deleteUser,
    isAuthenticated: Boolean(currentUser),
    loadBookings,
    loadUsers,
    login,
    logout,
    register,
    updateBookingStatus,
    updateProfile,
    updateUserByAdmin,
    updateUserStatus,
    uploadProfilePhoto,
    userBookings,
    users,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
