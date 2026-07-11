import { api } from './axios'
import { backendBookingStatus, mapBooking } from './mappers'

export async function getBookings(params = {}) {
  const { data } = await api.get('/bookings', { params: { limit: 100, ...params } })
  return data.bookings.map(mapBooking)
}

export async function createBooking(payload) {
  const { data } = await api.post('/bookings', {
    activity: payload.activityId,
    date: payload.date,
    emergencyContact: {
      name: payload.emergencyName,
      phone: payload.emergencyPhone,
      relationship: 'Emergency contact',
    },
    extras: (payload.extras ?? []).map((extra) => extra.label ?? extra.id ?? String(extra)),
    operator: payload.operatorId,
    travellers: {
      count: Number(payload.people),
      email: payload.customerEmail,
      leadName: payload.customerName,
      phone: payload.customerPhone,
    },
  })
  return mapBooking(data.booking)
}

export async function updateBookingStatusRecord(bookingId, status) {
  const { data } = await api.patch(`/bookings/${bookingId}/status`, {
    bookingStatus: backendBookingStatus(status),
  })
  return mapBooking(data.booking)
}
