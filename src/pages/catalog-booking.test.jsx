import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { activities, user } from '../test/fixtures'
import { renderWithProviders } from '../test/test-utils'
import { Activities } from './Activities'
import { ActivityDetails } from './ActivityDetails'
import { Booking } from './Booking'
import { Compare } from './Compare'

describe('catalogue, comparison, and booking pages', () => {
  it('renders activities from platform data and filters by activity type', async () => {
    const tester = userEvent.setup()

    renderWithProviders(<Activities />)

    expect(screen.getByText(/showing 3 of 3 activities/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /paragliding over fewa lake/i })).toBeInTheDocument()

    await tester.selectOptions(screen.getByLabelText(/activity type/i), 'Mountain Biking')

    expect(screen.getByRole('heading', { name: /nagarkot mountain biking/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /mardi himal helicopter tour/i })).not.toBeInTheDocument()
  })

  it('applies combined URL filters and sorting on first render', () => {
    renderWithProviders(<Activities />, {
      initialEntries: [
        '/activities?location=Pokhara&type=Paragliding&price=under-10000&rating=4.7&sort=rating',
      ],
    })

    expect(screen.getByText(/showing 1 of 3 activities/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /paragliding over fewa lake/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/province or location/i)).toHaveValue('Pokhara')
    expect(screen.getByLabelText(/sort by/i)).toHaveValue('rating')
  })

  it('expands mobile filters and resets query-backed controls', async () => {
    const tester = userEvent.setup()
    renderWithProviders(<Activities />, {
      initialEntries: ['/activities?type=Mountain%20Biking&difficulty=Moderate'],
    })

    const toggle = screen.getByRole('button', { name: /show filters/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await tester.click(toggle)
    expect(screen.getByRole('button', { name: /hide filters/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText(/showing 1 of 3 activities/i)).toBeInTheDocument()

    await tester.click(screen.getByRole('button', { name: /reset filters/i }))
    expect(screen.getByText(/showing 3 of 3 activities/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/activity type/i)).toHaveValue('')
    expect(screen.getByLabelText(/difficulty/i)).toHaveValue('')
  })

  it('clears filters from the no-results recovery action', async () => {
    const tester = userEvent.setup()
    renderWithProviders(<Activities />, {
      initialEntries: ['/activities?q=not-a-real-adventure'],
    })

    expect(screen.getByRole('heading', { name: /no activities found/i })).toBeInTheDocument()
    await tester.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(screen.getByText(/showing 3 of 3 activities/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/keyword/i)).toHaveValue('')
  })

  it('shows a clear API error instead of silently falling back to local data', () => {
    const refreshCatalog = vi.fn()

    renderWithProviders(<Activities />, {
      platform: {
        activities: [],
        catalogError: 'Could not reach the booking API.',
        refreshCatalog,
      },
    })

    expect(screen.getByRole('alert')).toHaveTextContent(/could not reach the booking api/i)
    expect(screen.queryByText(/paragliding over fewa lake/i)).not.toBeInTheDocument()
  })

  it('renders activity details, comparison data, and an empty review state', () => {
    renderWithProviders(null, {
      initialEntries: ['/activities/nagarkot-mountain-biking'],
      platform: {
        getReviewsByActivityId: vi.fn(() => []),
        reviews: [],
      },
      routes: [{ element: <ActivityDetails />, path: '/activities/:id' }],
    })

    expect(screen.getByRole('heading', { name: /nagarkot mountain biking/i })).toBeInTheDocument()
    expect(screen.getByText(/choose by value, not just price/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /no reviews yet/i })).toBeInTheDocument()
  })

  it('compares selected activities side by side and clears comparison', async () => {
    const tester = userEvent.setup()
    const clearCompare = vi.fn()

    renderWithProviders(<Compare />, {
      experience: {
        clearCompare,
        compareIds: ['paragliding-pokhara', 'nagarkot-mountain-biking'],
      },
    })

    expect(screen.getByRole('table')).toHaveTextContent(/starting price/i)
    expect(screen.getByRole('table')).toHaveTextContent(/paragliding over fewa lake/i)
    expect(screen.getByRole('region', { name: /mobile activity comparison/i })).toHaveTextContent(
      /nagarkot mountain biking/i,
    )
    expect(screen.getAllByRole('article')).toHaveLength(2)

    await tester.click(screen.getByRole('button', { name: /clear comparison/i }))
    expect(clearCompare).toHaveBeenCalled()
  })

  it('requires login before entering the booking route', () => {
    renderWithProviders(null, {
      initialEntries: ['/booking/paragliding-pokhara'],
      routes: [
        {
          element: (
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Booking />
            </ProtectedRoute>
          ),
          path: '/booking/:id',
        },
        { element: <h1>Login page</h1>, path: '/login' },
      ],
    })

    expect(screen.getByRole('heading', { name: /login page/i })).toBeInTheDocument()
  })

  it('validates booking steps and saves a completed booking', async () => {
    const tester = userEvent.setup()
    const addBooking = vi.fn(async (booking) => ({
      ...booking,
      bookingReference: 'SAB-TEST-999',
      id: 'booking-new',
      status: 'Awaiting payment',
    }))

    renderWithProviders(null, {
      auth: { addBooking, currentUser: user, userBookings: [] },
      initialEntries: ['/booking/paragliding-pokhara'],
      routes: [
        { element: <Booking />, path: '/booking/:id' },
        { element: <h1>Receipt ready</h1>, path: '/booking-success' },
      ],
    })

    await tester.click(screen.getByRole('button', { name: /continue/i }))
    await tester.click(screen.getByRole('button', { name: /continue/i }))
    await tester.type(screen.getByLabelText(/emergency contact name/i), 'Backup Contact')
    await tester.type(screen.getByLabelText(/emergency phone/i), '9811111111')
    await tester.click(screen.getByRole('button', { name: /continue/i }))
    await tester.click(screen.getByRole('button', { name: /continue/i }))
    await tester.click(screen.getByRole('button', { name: /confirm booking/i }))

    expect(addBooking).not.toHaveBeenCalled()

    await tester.click(screen.getByLabelText(/safety advice is guidance only/i))
    await tester.click(screen.getByRole('button', { name: /confirm booking/i }))

    await waitFor(() => expect(addBooking).toHaveBeenCalled())
    expect(await screen.findByRole('heading', { name: /receipt ready/i })).toBeInTheDocument()
    expect(addBooking.mock.calls[0][0]).toMatchObject({
      activityId: activities[0].id,
      emergencyName: 'Backup Contact',
      emergencyPhone: '9811111111',
      people: 2,
    })
  })

  it('updates booking totals for operator, traveler, and extra selections', async () => {
    const tester = userEvent.setup()
    const activity = {
      ...activities[0],
      operators: [
        activities[0].operators[0],
        {
          ...activities[0].operators[0],
          id: 'operator-premium',
          name: 'Premium Sky Guides',
          price: 12000,
        },
      ],
    }

    renderWithProviders(null, {
      auth: { currentUser: user },
      initialEntries: ['/booking/paragliding-pokhara?operator=operator-premium'],
      platform: { getActivityById: vi.fn(() => activity) },
      routes: [{ element: <Booking />, path: '/booking/:id' }],
    })

    expect(screen.getAllByText(/24,000/).length).toBeGreaterThan(0)
    await tester.clear(screen.getByLabelText(/number of people/i))
    await tester.type(screen.getByLabelText(/number of people/i), '1')
    expect(screen.getAllByText(/12,000/).length).toBeGreaterThan(0)

    await tester.click(screen.getByRole('button', { name: /continue/i }))
    await tester.click(screen.getByRole('radio', { name: /pokhara sky adventures/i }))
    expect(screen.getAllByText(/9,500/).length).toBeGreaterThan(0)

    await tester.click(screen.getByRole('button', { name: /continue/i }))
    await tester.type(screen.getByLabelText(/emergency contact name/i), 'Backup Contact')
    await tester.type(screen.getByLabelText(/emergency phone/i), '9811111111')
    await tester.click(screen.getByRole('button', { name: /continue/i }))
    await tester.click(screen.getByRole('checkbox', { name: /photo and video package/i }))
    await tester.click(screen.getByRole('checkbox', { name: /private hotel transfer/i }))

    expect(screen.getAllByText(/10,500/).length).toBeGreaterThan(0)
  })
})
