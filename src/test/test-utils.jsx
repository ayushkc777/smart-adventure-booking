import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthContext } from '../context/authContext'
import { ExperienceContext } from '../context/experienceContext'
import { PlatformContext } from '../context/platformContext'
import { activities, bookings, operators, reviews, user } from './fixtures'

export function createAuth(overrides = {}) {
  const currentUser = overrides.currentUser === undefined ? null : overrides.currentUser

  return {
    addBooking: vi.fn(async (booking) => ({ ...bookings[0], ...booking })),
    authLoading: false,
    bookingRecords: bookings,
    bookingStatusUpdates: {},
    changePassword: vi.fn(async () => ({ ok: true })),
    currentUser,
    deleteUserByAdmin: vi.fn(async () => ({ ok: true })),
    isAuthenticated: Boolean(currentUser),
    loadBookings: vi.fn(async () => bookings),
    login: vi.fn(async () => ({ ok: true, user })),
    logout: vi.fn(async () => {}),
    register: vi.fn(async () => ({ ok: true, user })),
    updateBookingStatus: vi.fn(async () => ({ ok: true, booking: bookings[0] })),
    updateProfile: vi.fn(async (updates) => ({ ok: true, user: { ...user, ...updates } })),
    updateUserByAdmin: vi.fn(async () => ({ ok: true, user })),
    updateUserStatus: vi.fn(async () => ({ ok: true, user })),
    uploadProfilePhoto: vi.fn(async () => ({ ok: true, user })),
    userBookings: bookings,
    users: [user],
    ...overrides,
  }
}

export function createExperience(overrides = {}) {
  return {
    clearCompare: vi.fn(),
    compareIds: [],
    dismissToast: vi.fn(),
    recentlyViewedIds: [],
    showToast: vi.fn(),
    toasts: [],
    toggleCompare: vi.fn(),
    toggleWishlist: vi.fn(),
    trackRecentlyViewed: vi.fn(),
    wishlistIds: [],
    ...overrides,
  }
}

export function createPlatform(overrides = {}) {
  return {
    activities,
    activityTypes: ['Helicopter Tour', 'Mountain Biking', 'Paragliding'],
    addActivity: vi.fn(async () => ({ ok: true, activity: activities[0] })),
    addOperator: vi.fn(async () => ({ ok: true, operator: operators[0] })),
    addReview: vi.fn(async () => ({ ok: true, review: reviews[0] })),
    catalogError: '',
    catalogLoading: false,
    deleteActivity: vi.fn(async () => ({ ok: true })),
    deleteOperator: vi.fn(async () => ({ ok: true })),
    deleteReview: vi.fn(async () => ({ ok: true })),
    getActivityById: vi.fn((id) => activities.find((activity) => activity.id === id)),
    getReviewsByActivityId: vi.fn((id) => reviews.filter((review) => review.activityId === id)),
    locations: ['Nagarkot', 'Pokhara'],
    operators,
    provinces: ['Bagmati', 'Gandaki'],
    refreshCatalog: vi.fn(async () => ({ ok: true })),
    refreshOperators: vi.fn(async () => operators),
    reviews,
    saveSettings: vi.fn(),
    settings: {
      bookingNote: 'Operator confirmation follows safety and availability checks.',
      cancellationWindowHours: 24,
      featuredActivityLimit: 4,
      operationsPhone: '+977-9800000000',
      platformName: 'Nepal Adventure SmartBook',
      requireSafetyAcknowledgement: true,
      serviceRegion: 'Kathmandu, Nepal',
      supportEmail: 'support@example.com',
    },
    updateActivity: vi.fn(async () => ({ ok: true, activity: activities[0] })),
    updateOperator: vi.fn(async () => ({ ok: true, operator: operators[0] })),
    updateOperatorPrice: vi.fn(async () => ({ ok: true, activity: activities[0] })),
    ...overrides,
  }
}

export function renderWithProviders(ui, options = {}) {
  const auth = createAuth(options.auth)
  const experience = createExperience(options.experience)
  const platform = createPlatform(options.platform)
  const initialEntries = options.initialEntries ?? ['/']

  const result = render(
    <AuthContext.Provider value={auth}>
      <ExperienceContext.Provider value={experience}>
        <PlatformContext.Provider value={platform}>
          <MemoryRouter initialEntries={initialEntries}>
            {options.routes ? (
              <Routes>
                {options.routes.map((route) => (
                  <Route element={route.element} key={route.path} path={route.path} />
                ))}
              </Routes>
            ) : (
              ui
            )}
          </MemoryRouter>
        </PlatformContext.Provider>
      </ExperienceContext.Provider>
    </AuthContext.Provider>,
  )

  return { ...result, auth, experience, platform }
}
