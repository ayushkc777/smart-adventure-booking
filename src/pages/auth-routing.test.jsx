import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { admin, user } from '../test/fixtures'
import { renderWithProviders } from '../test/test-utils'
import { Login } from './Login'
import { Register } from './Register'

describe('authentication and protected routes', () => {
  it('validates login fields and rejects invalid credentials clearly', async () => {
    const tester = userEvent.setup()
    const login = vi.fn(async () => ({ message: 'Invalid email or password.', ok: false }))

    renderWithProviders(null, {
      auth: { login },
      initialEntries: ['/login'],
      routes: [{ element: <Login />, path: '/login' }],
    })

    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()

    await tester.type(screen.getByLabelText(/email address/i), 'wrong-email')
    await tester.tab()
    await tester.type(screen.getByLabelText(/^password$/i), 'short')
    await tester.tab()

    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument()
    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()

    await tester.clear(screen.getByLabelText(/email address/i))
    await tester.type(screen.getByLabelText(/email address/i), 'user@example.com')
    await tester.clear(screen.getByLabelText(/^password$/i))
    await tester.type(screen.getByLabelText(/^password$/i), 'WrongPass1')
    await tester.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument()
    expect(login).toHaveBeenCalledWith('user@example.com', 'WrongPass1')
  })

  it('redirects users by role after a successful login', async () => {
    const tester = userEvent.setup()
    const login = vi.fn(async () => ({ ok: true, user: admin }))

    renderWithProviders(null, {
      auth: { login },
      initialEntries: ['/login'],
      routes: [
        { element: <Login />, path: '/login' },
        { element: <h1>Admin area</h1>, path: '/admin' },
      ],
    })

    await tester.type(screen.getByLabelText(/email address/i), 'admin@example.com')
    await tester.type(screen.getByLabelText(/^password$/i), 'Admin123')
    await tester.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('heading', { name: /admin area/i })).toBeInTheDocument()
  })

  it('prevents visitors and normal users from accessing admin-only pages', () => {
    const routes = [
      {
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <h1>Admin only</h1>
          </ProtectedRoute>
        ),
        path: '/admin',
      },
      { element: <h1>Login page</h1>, path: '/login' },
      { element: <h1>User dashboard</h1>, path: '/user/dashboard' },
    ]

    renderWithProviders(null, { initialEntries: ['/admin'], routes })
    expect(screen.getByRole('heading', { name: /login page/i })).toBeInTheDocument()
  })

  it('shows access denied when a normal user opens an admin route', () => {
    renderWithProviders(null, {
      auth: { currentUser: user },
      initialEntries: ['/admin'],
      routes: [
        {
          element: (
            <ProtectedRoute allowedRoles={['admin']}>
              <h1>Admin only</h1>
            </ProtectedRoute>
          ),
          path: '/admin',
        },
      ],
    })

    expect(screen.getByRole('heading', { name: /access denied/i })).toBeInTheDocument()
  })

  it('validates registration and blocks duplicate email addresses', async () => {
    const tester = userEvent.setup()
    const register = vi.fn(async () => ({ ok: true, user }))

    renderWithProviders(null, {
      auth: { register, users: [user] },
      initialEntries: ['/register'],
      routes: [{ element: <Register />, path: '/register' }],
    })

    await tester.type(screen.getByLabelText(/full name/i), 'New Traveler')
    await tester.type(screen.getByLabelText(/^email$/i), user.email)
    await tester.type(screen.getByLabelText(/phone/i), '9800000000')
    await tester.type(screen.getByLabelText(/^password$/i), 'Password1')
    await tester.type(screen.getByLabelText(/confirm password/i), 'Password2')
    await tester.tab()

    expect(screen.getByText(/account with this email already exists/i)).toBeInTheDocument()
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled()
    expect(register).not.toHaveBeenCalled()
  })
})
