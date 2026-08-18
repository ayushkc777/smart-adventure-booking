import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthContext.jsx'
import { useAuth } from './useAuth'
import { SESSION_KEY, TOKEN_KEY } from '../api/axios'
import { admin, user } from '../test/fixtures'

const authApi = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  registerUser: vi.fn(),
  updateCurrentUser: vi.fn(),
  uploadCurrentUserAvatar: vi.fn(),
  deleteCurrentUserAvatar: vi.fn(),
  changeCurrentPassword: vi.fn(),
}))
const bookingApi = vi.hoisted(() => ({
  getBookings: vi.fn(),
  createBooking: vi.fn(),
  updateBookingStatusRecord: vi.fn(),
}))
const adminApi = vi.hoisted(() => ({
  getUsers: vi.fn(),
  deleteUserRecord: vi.fn(),
  updateUserRecord: vi.fn(),
}))

vi.mock('../api/authApi', () => authApi)
vi.mock('../api/bookingApi', () => bookingApi)
vi.mock('../api/adminApi', () => adminApi)

function AuthState() {
  const auth = useAuth()
  return (
    <div>
      <output data-testid="loading">{String(auth.authLoading)}</output>
      <output data-testid="user">{auth.currentUser?.email ?? 'signed-out'}</output>
      <output data-testid="bookings">{auth.bookingRecords.length}</output>
      <output data-testid="users">{auth.users.length}</output>
    </div>
  )
}

describe('AuthProvider session restoration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    bookingApi.getBookings.mockResolvedValue([])
    adminApi.getUsers.mockResolvedValue([])
  })

  it('discards malformed cached sessions when no token exists', async () => {
    localStorage.setItem(SESSION_KEY, '{bad json')

    render(<AuthProvider><AuthState /></AuthProvider>)

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent('signed-out')
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
    expect(authApi.getCurrentUser).not.toHaveBeenCalled()
  })

  it('clears cached authentication when current-user restoration fails', async () => {
    localStorage.setItem(TOKEN_KEY, 'expired-token')
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    authApi.getCurrentUser.mockRejectedValue(new Error('Unauthorized'))

    render(<AuthProvider><AuthState /></AuthProvider>)

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent('signed-out')
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('keeps a restored admin session when dependent data loads fail', async () => {
    localStorage.setItem(TOKEN_KEY, 'valid-token')
    authApi.getCurrentUser.mockResolvedValue(admin)
    bookingApi.getBookings.mockRejectedValue(new Error('Bookings unavailable'))
    adminApi.getUsers.mockRejectedValue(new Error('Users unavailable'))

    render(<AuthProvider><AuthState /></AuthProvider>)

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent(admin.email)
    expect(screen.getByTestId('bookings')).toHaveTextContent('0')
    expect(screen.getByTestId('users')).toHaveTextContent('0')
    expect(JSON.parse(localStorage.getItem(SESSION_KEY))).toMatchObject(admin)
  })
})
