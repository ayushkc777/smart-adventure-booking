import { describe, expect, it } from 'vitest'
import {
  backendBookingStatus,
  backendDifficulty,
  backendSupportCategory,
  backendSupportStatus,
  mapActivity,
  mapBooking,
  mapOperatorPrice,
  mapProfilePayload,
  mapReview,
  mapSupportMessage,
  mapUser,
} from './mappers'

describe('api mapper contracts', () => {
  it('maps user and profile fields without exposing backend shapes', () => {
    expect(
      mapUser({
        _id: 'user-1',
        avatar: '/uploads/avatar.png',
        emergencyContact: { phone: '9800000000' },
        email: 'guest@example.com',
        fullName: 'Guest User',
        role: 'user',
      }),
    ).toMatchObject({
      id: 'user-1',
      emergencyContact: '9800000000',
      preferredLanguage: 'English',
      profilePhoto: 'http://127.0.0.1:5050/uploads/avatar.png',
      status: 'active',
    })
    expect(mapProfilePayload({ emergencyContact: '100', fullName: 'Guest User' })).toMatchObject({
      emergencyContact: { phone: '100' },
      fullName: 'Guest User',
    })
  })

  it('normalizes nested activity and operator pricing data', () => {
    const activity = mapActivity({
      _id: 'activity-1',
      description: 'A mapped rafting activity',
      difficulty: 'Easy',
      district: 'Sindhupalchok',
      operatorPrices: [
        {
          operator: { _id: 'operator-1', companyName: 'River Guides', safetyScore: 96 },
          price: '12500',
        },
      ],
      province: 'Bagmati',
      ratingAverage: '4.8',
      title: 'Bhote Koshi Rafting',
    })

    expect(activity).toMatchObject({
      id: 'activity-1',
      name: 'Bhote Koshi Rafting',
      type: 'Rafting',
      difficulty: 'Beginner friendly',
      priceFrom: 12500,
      rating: 4.8,
    })
    expect(mapOperatorPrice({ operator: { companyName: 'Guide' }, price: '9000' })).toMatchObject({
      name: 'Guide',
      price: 9000,
      status: 'active',
    })
  })

  it('maps booking, review, and support response fallbacks', () => {
    expect(
      mapBooking({
        bookingReference: 'SAB-100',
        bookingStatus: 'awaiting_payment',
        date: '2026-09-10T00:00:00.000Z',
        extras: ['Lunch'],
        totalPrice: '14500',
        travellers: { count: '2', leadName: 'Guest User' },
      }),
    ).toMatchObject({
      id: 'SAB-100',
      date: '2026-09-10',
      people: 2,
      status: 'Awaiting payment',
      total: 14500,
      extras: [{ id: 'Lunch', label: 'Lunch', price: 500 }],
    })
    expect(mapReview({ rating: '5', comment: 'Excellent' })).toMatchObject({
      operator: 'Verified operator',
      rating: 5,
      userName: 'Traveler',
      valueRating: 5,
    })
    expect(mapSupportMessage({ name: 'Guest', status: 'in_progress' })).toMatchObject({
      fullName: 'Guest',
      status: 'In review',
    })
  })

  it('keeps status and category translations stable', () => {
    expect(backendBookingStatus('Pending confirmation')).toBe('pending')
    expect(backendBookingStatus('custom')).toBe('custom')
    expect(backendDifficulty('Advanced expedition')).toBe('Extreme')
    expect(backendSupportCategory('Booking assistance')).toBe('booking')
    expect(backendSupportCategory('Something else')).toBe('general')
    expect(backendSupportStatus('Resolved')).toBe('resolved')
  })
})
