import { assetUrl } from './axios'
import { activities as localActivities } from '../data/activities'

const typeImages = {
  'Bungee Jumping': '/images/bungee.jpeg',
  Canyoning: '/images/canyoning.jpeg',
  'Helicopter Tour': '/images/heli.jpeg',
  'Mountain Biking': '/images/biking.jpeg',
  Paragliding: '/images/paragliding.jpg',
  Rafting: '/images/rafting.jpeg',
  Trekking: '/images/everest-base-camp.jpeg',
  Zipline: '/images/zipline.jpg',
}

function imageForType(type) {
  return typeImages[type] ?? '/images/paragliding.jpg'
}

const difficultyMap = {
  Challenging: 'Challenging',
  Easy: 'Beginner friendly',
  Extreme: 'Advanced',
  Moderate: 'Moderate',
}

function inferType(activity) {
  const value = `${activity.title ?? activity.name ?? ''}`.toLowerCase()
  if (value.includes('bungee')) return 'Bungee Jumping'
  if (value.includes('canyon')) return 'Canyoning'
  if (value.includes('heli')) return 'Helicopter Tour'
  if (value.includes('bike') || value.includes('biking') || value.includes('cycling')) return 'Mountain Biking'
  if (value.includes('paraglid')) return 'Paragliding'
  if (value.includes('raft')) return 'Rafting'
  if (value.includes('trek') || value.includes('everest')) return 'Trekking'
  if (value.includes('zip')) return 'Zipline'
  return 'Paragliding'
}

function localFallbackFor(type) {
  return localActivities.find((activity) => activity.type === type) ?? localActivities[0]
}

function mapEmergencyContact(contact) {
  if (!contact) return ''
  if (typeof contact === 'string') return contact
  return contact.phone ?? ''
}

function toEmergencyObject(value) {
  if (!value) return {}
  if (typeof value === 'object') return value
  return { phone: value }
}

export function mapUser(user) {
  if (!user) return null
  return {
    id: user._id ?? user.id,
    createdAt: user.createdAt,
    email: user.email,
    emergencyContact: mapEmergencyContact(user.emergencyContact),
    fullName: user.fullName,
    nationality: user.nationality ?? '',
    phone: user.phone ?? '',
    preferredLanguage: user.preferredLanguage ?? 'English',
    profilePhoto: assetUrl(user.avatar ?? user.profilePhoto ?? ''),
    role: user.role,
    status: user.status ?? 'active',
  }
}

export function mapProfilePayload(updates) {
  return {
    emergencyContact: toEmergencyObject(updates.emergencyContact),
    fullName: updates.fullName,
    nationality: updates.nationality,
    phone: updates.phone,
    preferredLanguage: updates.preferredLanguage,
  }
}

export function mapOperatorPrice(item) {
  const operator = item.operator ?? item
  const safetyRating = Number(operator.safetyScore ?? item.safetyRating ?? 90) / 20
  const valueRating = Number(operator.responseRate ?? item.valueRating ?? 90) / 20
  return {
    id: operator._id ?? operator.id,
    cancellation: item.cancellation ?? 'Availability and cancellation terms confirmed before payment',
    includes: item.includedServices?.length ? item.includedServices : ['Safety briefing', 'Equipment', 'Operator support'],
    license: operator.licenseNumber ?? item.license ?? 'NTA-LICENSED',
    name: operator.companyName ?? item.name,
    price: Number(item.price ?? operator.price ?? 0),
    responseRate: Number(operator.responseRate ?? item.responseRate ?? 90),
    safetyRating: Math.round(safetyRating * 10) / 10,
    status: operator.status ?? item.status ?? 'active',
    valueRating: Math.round(valueRating * 10) / 10,
  }
}

export function mapOperator(operator) {
  return {
    id: operator._id ?? operator.id,
    license: operator.licenseNumber,
    location: operator.location,
    name: operator.companyName,
    responseRate: operator.responseRate ?? 90,
    safetyRating: Math.round((Number(operator.safetyScore ?? 90) / 20) * 10) / 10,
    status: operator.status ?? 'active',
    valueRating: Math.round((Number(operator.responseRate ?? 90) / 20) * 10) / 10,
  }
}

export function mapActivity(activity) {
  const type = activity.type ?? inferType(activity)
  const fallback = localFallbackFor(type)
  const gallery = activity.gallery?.map((item) => assetUrl(item.url ?? item)).filter(Boolean) ?? []
  const operators = (activity.operatorPrices ?? []).map(mapOperatorPrice)
  const priceFrom = Number(activity.priceFrom || Math.min(...operators.map((operator) => operator.price)) || fallback.priceFrom)

  return {
    ...fallback,
    id: activity._id ?? activity.id,
    area: `${activity.district ?? fallback.location}, ${activity.province ?? fallback.province}`,
    bestSeason: Array.isArray(activity.bestSeason) && activity.bestSeason.length
      ? activity.bestSeason.join(', ')
      : fallback.bestSeason,
    coordinates: fallback.coordinates ?? { lat: 27.7172, lng: 85.324 },
    description: activity.description ?? fallback.description,
    difficulty: difficultyMap[activity.difficulty] ?? activity.difficulty ?? fallback.difficulty,
    duration: activity.duration ?? fallback.duration,
    durationDays: fallback.durationDays ?? 1,
    gallery: gallery.length ? gallery : fallback.gallery,
    image: gallery[0] ?? imageForType(type) ?? fallback.image,
    includedServices: operators[0]?.includes ?? fallback.includedServices,
    location: activity.district ?? fallback.location,
    name: activity.title ?? fallback.name,
    operators,
    popularityScore: fallback.popularityScore ?? Math.round(Number(activity.ratingAverage ?? 4.5) * 15),
    priceFrom,
    province: activity.province ?? fallback.province,
    rating: Number(activity.ratingAverage || fallback.rating || 0),
    reviewCount: Number(activity.reviewCount || 0),
    riskLevel: activity.riskLevel ?? fallback.riskLevel,
    safetyScore: activity.safetyScore ?? fallback.safetyScore ?? 82,
    seasonTags: fallback.seasonTags ?? [],
    shortDescription: activity.description?.slice(0, 150) ?? fallback.shortDescription,
    status: activity.status ?? 'active',
    type,
  }
}

export function mapActivityPayload(payload, operatorId) {
  const activityType = payload.type ?? inferType({ title: payload.name })
  const fallbackImage = imageForType(activityType)

  return {
    bestSeason: payload.bestSeason ? [payload.bestSeason] : [],
    description: payload.description,
    difficulty: backendDifficulty(payload.difficulty),
    district: payload.location,
    duration: payload.duration,
    featured: false,
    gallery: [
      {
        alt: `${payload.name} in Nepal`,
        url: fallbackImage,
      },
    ],
    operatorPrices: operatorId
      ? [
          {
            includedServices: ['Safety briefing', 'Equipment', 'Operator support'],
            operator: operatorId,
            price: Number(payload.priceFrom),
          },
        ]
      : undefined,
    province: payload.area || payload.location || 'Nepal',
    riskLevel: payload.riskLevel,
    safetyScore: Math.round(Number(payload.rating ?? 4.5) * 18),
    title: payload.name,
  }
}

export function mapActivityUpdatePayload(updates) {
  const payload = {}
  if (updates.name !== undefined) payload.title = updates.name
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.area !== undefined) payload.province = updates.area
  if (updates.province !== undefined) payload.province = updates.province
  if (updates.location !== undefined) payload.district = updates.location
  if (updates.difficulty !== undefined) payload.difficulty = backendDifficulty(updates.difficulty)
  if (updates.duration !== undefined) payload.duration = updates.duration
  if (updates.riskLevel !== undefined) payload.riskLevel = updates.riskLevel
  if (updates.bestSeason !== undefined) payload.bestSeason = updates.bestSeason ? [updates.bestSeason] : []
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.rating !== undefined) payload.safetyScore = Math.round(Number(updates.rating || 4.5) * 18)
  return payload
}

export function mapOperatorPricePayload(operator, price) {
  return {
    includedServices: operator.includes?.length
      ? operator.includes
      : ['Safety briefing', 'Equipment', 'Operator support'],
    operator: operator.id,
    price: Number(price ?? operator.price ?? 0),
  }
}

export function backendDifficulty(value = '') {
  if (value.includes('Advanced') || value.includes('Extreme')) return 'Extreme'
  if (value.includes('Challenging')) return 'Challenging'
  if (value.includes('Moderate')) return 'Moderate'
  return 'Easy'
}

export function mapReview(review) {
  return {
    id: review._id ?? review.id,
    activityId: review.activity?._id ?? review.activity ?? review.activityId,
    comment: review.comment,
    date: (review.createdAt ?? review.date ?? '').slice(0, 10),
    operator: review.operator?.companyName ?? review.operator ?? 'Verified operator',
    operatorId: review.operator?._id ?? review.operatorId ?? '',
    rating: Number(review.rating ?? 0),
    safetyRating: Number(review.safetyRating ?? 0),
    userName: review.user?.fullName ?? review.userName ?? 'Traveler',
    valueRating: Number(review.valueRating ?? review.rating ?? 0),
  }
}

export function mapBooking(booking) {
  return {
    id: booking._id ?? booking.id ?? booking.bookingReference,
    activityId: booking.activity?._id ?? booking.activity ?? booking.activityId,
    activityName: booking.activity?.title ?? booking.activityName,
    bookingReference: booking.bookingReference ?? booking.id,
    createdAt: booking.createdAt,
    customerEmail: booking.travellers?.email ?? booking.customerEmail,
    customerName: booking.travellers?.leadName ?? booking.customerName,
    customerPhone: booking.travellers?.phone ?? booking.customerPhone,
    date: String(booking.date ?? '').slice(0, 10),
    emergencyName: booking.emergencyContact?.name ?? booking.emergencyName,
    emergencyPhone: booking.emergencyContact?.phone ?? booking.emergencyPhone,
    extras: (booking.extras ?? []).map((extra) =>
      typeof extra === 'string' ? { id: extra, label: extra, price: 500 } : extra,
    ),
    operatorId: booking.operator?._id ?? booking.operator ?? booking.operatorId,
    operatorName: booking.operator?.companyName ?? booking.operatorName,
    people: Number(booking.travellers?.count ?? booking.people ?? 1),
    status: displayBookingStatus(booking.bookingStatus ?? booking.status),
    total: Number(booking.totalPrice ?? booking.total ?? 0),
    userId: booking.user?._id ?? booking.user ?? booking.userId,
  }
}

export function backendBookingStatus(status) {
  const map = {
    Cancelled: 'cancelled',
    Completed: 'completed',
    Confirmed: 'confirmed',
    'Awaiting payment': 'awaiting_payment',
    'Pending confirmation': 'pending',
    'Pending safety review': 'pending',
  }
  return map[status] ?? status
}

function displayBookingStatus(status = 'pending') {
  const map = {
    awaiting_payment: 'Awaiting payment',
    cancelled: 'Cancelled',
    completed: 'Completed',
    confirmed: 'Confirmed',
    pending: 'Pending confirmation',
  }
  return map[status] ?? status
}

export function mapSupportMessage(message) {
  return {
    id: message._id ?? message.id,
    category: message.category ?? 'general',
    createdAt: message.createdAt,
    email: message.email,
    fullName: message.name ?? message.fullName,
    message: message.message,
    phone: message.phone ?? '',
    status: displaySupportStatus(message.status),
    subject: message.subject,
  }
}

export function backendSupportCategory(value) {
  const normalized = String(value).toLowerCase()
  if (normalized.includes('booking')) return 'booking'
  if (normalized.includes('safety')) return 'safety'
  if (normalized.includes('operator')) return 'operator'
  if (normalized.includes('account')) return 'account'
  return 'general'
}

export function backendSupportStatus(value) {
  const map = {
    New: 'open',
    'In review': 'in_progress',
    Resolved: 'resolved',
  }
  return map[value] ?? value
}

function displaySupportStatus(value = 'open') {
  const map = {
    closed: 'Resolved',
    in_progress: 'In review',
    open: 'New',
    resolved: 'Resolved',
  }
  return map[value] ?? value
}
