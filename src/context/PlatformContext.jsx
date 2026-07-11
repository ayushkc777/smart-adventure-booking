import { useMemo, useState } from 'react'
import { PlatformContext } from './platformContext'
import { activities as seedActivities } from '../data/activities'
import { reviews as seedReviews } from '../data/reviews'
import { defaultPlatformSettings } from '../data/settings'

const ACTIVITIES_KEY = 'smartAdventureActivities'
const CATALOG_VERSION_KEY = 'smartAdventureCatalogVersion'
const CATALOG_VERSION = '2026-smart-v3'
const REVIEWS_KEY = 'smartAdventureReviews'
const DELETED_REVIEW_IDS_KEY = 'smartAdventureDeletedReviewIds'
const SETTINGS_KEY = 'smartAdventureAdminSettings'
const RETIRED_ACTIVITY_IDS = new Set(['seti-river-rafting'])

const locationMeta = new Map(
  seedActivities.map((activity) => [
    activity.id,
    {
      coordinates: activity.coordinates,
      durationDays: activity.durationDays,
      gallery: activity.gallery,
      popularityScore: activity.popularityScore,
      province: activity.province,
      safetyScore: activity.safetyScore,
      seasonTags: activity.seasonTags,
    },
  ]),
)

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

function activeOperators(operators) {
  return operators.filter((operator) => (operator.status ?? 'active') === 'active')
}

function withConsistentPrice(activity, operators = activity.operators) {
  const availableOperators = activeOperators(operators)
  const pricedOperators = availableOperators.length ? availableOperators : operators
  const priceFrom = pricedOperators.length
    ? Math.min(...pricedOperators.map((operator) => Number(operator.price)))
    : activity.priceFrom

  return { ...activity, operators, priceFrom }
}

function imageForActivity(type) {
  const imageMap = {
    'Bungee Jumping': '/images/bungee.jpeg',
    Canyoning: '/images/canyoning.jpeg',
    Paragliding: '/images/paragliding.jpg',
    Rafting: '/images/rafting.jpeg',
    Trekking: '/images/everest-base-camp.jpeg',
    Zipline: '/images/zipline.jpg',
    'Mountain Biking': '/images/biking.jpeg',
    'Helicopter Tour': '/images/heli.jpeg',
  }
  return imageMap[type] ?? '/images/paragliding.jpg'
}

function galleryForActivity(type, existingGallery = []) {
  const primaryImage = imageForActivity(type)
  const fallbackImages = [
    primaryImage,
    ...existingGallery,
    '/images/paragliding.jpg',
    '/images/everest-base-camp.jpeg',
    '/images/rafting.jpeg',
    '/images/zipline.jpg',
  ]
  return [...new Set(fallbackImages)].slice(0, 3)
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeStoredActivities(storedActivities, includeMissingSeedActivities) {
  const activeStoredActivities = storedActivities.filter(
    (activity) => !RETIRED_ACTIVITY_IDS.has(activity.id),
  )
  const storedById = new Map(activeStoredActivities.map((activity) => [activity.id, activity]))
  const seedSource = includeMissingSeedActivities
    ? seedActivities
    : seedActivities.filter((seedActivity) => storedById.has(seedActivity.id))
  const mergedSeedActivities = seedSource.map((seedActivity) => ({
    ...seedActivity,
    ...(storedById.get(seedActivity.id) ?? {}),
    image: seedActivity.image,
    ...locationMeta.get(seedActivity.id),
  }))
  const customActivities = activeStoredActivities
    .filter((activity) => !seedActivities.some((seedActivity) => seedActivity.id === activity.id))
    .map((activity) => ({
      ...activity,
      coordinates: activity.coordinates ?? { lat: 27.7172, lng: 85.324 },
      durationDays: activity.durationDays ?? 1,
      gallery: galleryForActivity(activity.type, activity.gallery ?? [activity.image]),
      popularityScore: activity.popularityScore ?? Math.round((activity.rating ?? 4.5) * 15),
      province: activity.province ?? 'Nepal',
      safetyScore: activity.safetyScore ?? 82,
      seasonTags: activity.seasonTags ?? [],
    }))
  const nextActivities = [...mergedSeedActivities, ...customActivities]
  saveJson(ACTIVITIES_KEY, nextActivities)
  localStorage.setItem(CATALOG_VERSION_KEY, CATALOG_VERSION)
  return nextActivities
}

function getInitialActivities() {
  const storedActivities = readJson(ACTIVITIES_KEY, [])
  if (!storedActivities.length) {
    localStorage.setItem(CATALOG_VERSION_KEY, CATALOG_VERSION)
    return seedActivities
  }

  return normalizeStoredActivities(
    storedActivities,
    localStorage.getItem(CATALOG_VERSION_KEY) !== CATALOG_VERSION,
  )
}

function getInitialReviews() {
  const deletedReviewIds = new Set(readJson(DELETED_REVIEW_IDS_KEY, []))
  const normalizeOperatorReference = (review) => {
    if (review.operatorId) return review
    const activity = seedActivities.find((item) => item.id === review.activityId)
    const operator = activity?.operators.find((item) => item.name === review.operator)
    return operator ? { ...review, operatorId: operator.id } : review
  }
  const storedReviews = readJson(REVIEWS_KEY, [])
    .filter(
      (review) =>
        !RETIRED_ACTIVITY_IDS.has(review.activityId) && !deletedReviewIds.has(review.id),
    )
    .map(normalizeOperatorReference)

  const storedIds = new Set(storedReviews.map((review) => review.id))
  const mergedReviews = [
    ...storedReviews,
    ...seedReviews
      .filter((review) => !storedIds.has(review.id) && !deletedReviewIds.has(review.id))
      .map(normalizeOperatorReference),
  ]
  saveJson(REVIEWS_KEY, mergedReviews)
  return mergedReviews
}

function makeActivity(payload) {
  const operatorName = payload.operatorName?.trim() || `${payload.location} Adventure Operator`
  const operatorId = slugify(operatorName) || `operator-${Date.now()}`

  return {
    id: `${slugify(payload.name)}-${Date.now()}`,
    name: payload.name.trim(),
    type: payload.type,
    location: payload.location.trim(),
    area: payload.area.trim(),
    image: imageForActivity(payload.type),
    province: payload.province?.trim() || 'Nepal',
    coordinates: { lat: 27.7172, lng: 85.324 },
    description: payload.description.trim(),
    shortDescription: payload.shortDescription.trim() || payload.description.trim(),
    riskLevel: payload.riskLevel,
    duration: payload.duration.trim(),
    difficulty: payload.difficulty.trim(),
    minAge: Number(payload.minAge) || 12,
    bestSeason: payload.bestSeason.trim() || 'September to May',
    priceFrom: Number(payload.priceFrom),
    rating: Number(payload.rating) || 4.5,
    reviewCount: 0,
    safetyScore: 82,
    popularityScore: 60,
    durationDays: 1,
    seasonTags: [],
    gallery: galleryForActivity(payload.type),
    includedServices: [
      'Licensed local operator',
      'Pre-activity safety briefing',
      'Required safety equipment',
      'Booking support',
    ],
    highlights: [
      'Compare pricing before booking',
      'Review safety guidance before arrival',
      'Confirm availability with a trusted operator',
    ],
    operators: [
      {
        id: operatorId,
        name: operatorName,
        license: payload.license?.trim() || 'NTA-NEW',
        price: Number(payload.priceFrom),
        safetyRating: 4.5,
        valueRating: 4.5,
        cancellation: 'Availability and cancellation terms confirmed before payment',
        includes: ['Safety briefing', 'Equipment', 'Operator support'],
      },
    ],
    safety: {
      checklist: [
        'Check weather and operator instructions before arrival',
        'Wear activity-appropriate clothing and footwear',
        'Disclose relevant medical conditions before participation',
        'Follow the guide instructions at all times',
      ],
      medicalWarning:
        'Travelers with serious medical conditions should consult a qualified medical professional before booking.',
      equipment:
        'Use operator-approved safety equipment and confirm fit before the activity starts.',
      emergencyGuidance:
        'Confirm emergency contact, first aid availability, and nearest medical support with the operator.',
    },
  }
}

export function PlatformProvider({ children }) {
  const [activities, setActivities] = useState(getInitialActivities)
  const [reviews, setReviews] = useState(getInitialReviews)
  const [settings, setSettings] = useState(() => ({
    ...defaultPlatformSettings,
    ...readJson(SETTINGS_KEY, {}),
  }))

  function syncActivities(nextActivities) {
    setActivities(nextActivities)
    saveJson(ACTIVITIES_KEY, nextActivities)
    localStorage.setItem(CATALOG_VERSION_KEY, CATALOG_VERSION)
  }

  function syncReviews(nextReviews) {
    setReviews(nextReviews)
    saveJson(REVIEWS_KEY, nextReviews)
  }

  function saveSettings(nextSettings) {
    const normalizedSettings = { ...defaultPlatformSettings, ...nextSettings }
    setSettings(normalizedSettings)
    saveJson(SETTINGS_KEY, normalizedSettings)
  }

  function addActivity(payload) {
    const nextActivity = makeActivity(payload)
    syncActivities([nextActivity, ...activities])
    return nextActivity
  }

  function updateActivity(activityId, updates) {
    const { license, operatorName } = updates
    const activityUpdates = { ...updates }
    delete activityUpdates.license
    delete activityUpdates.operatorName
    delete activityUpdates.priceFrom
    const nextActivities = activities.map((activity) =>
      activity.id === activityId
        ? withConsistentPrice(
            {
              ...activity,
              ...activityUpdates,
              minAge: Number(updates.minAge),
              rating: Number(updates.rating),
            },
            activity.operators.map((operator, index) =>
              index === 0
                ? {
                    ...operator,
                    license: license.trim(),
                    name: operatorName.trim(),
                  }
                : operator,
            ),
          )
        : activity,
    )
    syncActivities(nextActivities)
    const previousActivity = activities.find((activity) => activity.id === activityId)
    const operatorId = previousActivity?.operators[0]?.id
    if (operatorId && operatorName.trim() !== previousActivity.operators[0].name) {
      syncReviews(
        reviews.map((review) =>
          review.operatorId === operatorId
            ? { ...review, operator: operatorName.trim() }
            : review,
        ),
      )
    }
  }

  function deleteActivity(activityId) {
    const deletedReviewIds = new Set(readJson(DELETED_REVIEW_IDS_KEY, []))
    reviews
      .filter((review) => review.activityId === activityId)
      .forEach((review) => deletedReviewIds.add(review.id))
    saveJson(DELETED_REVIEW_IDS_KEY, [...deletedReviewIds])
    syncActivities(activities.filter((activity) => activity.id !== activityId))
    syncReviews(reviews.filter((review) => review.activityId !== activityId))
  }

  function updateOperatorPrice(activityId, operatorId, price) {
    const numericPrice = Number(price)
    const nextActivities = activities.map((activity) => {
      if (activity.id !== activityId) return activity

      const operators = activity.operators.map((operator) =>
        operator.id === operatorId ? { ...operator, price: numericPrice } : operator,
      )
      return withConsistentPrice(activity, operators)
    })
    syncActivities(nextActivities)
  }

  function addOperator(activityId, payload) {
    const operator = {
      id: `${slugify(payload.name)}-${Date.now()}`,
      name: payload.name.trim(),
      license: payload.license.trim(),
      price: Number(payload.price),
      safetyRating: Number(payload.safetyRating),
      valueRating: Number(payload.valueRating),
      responseRate: Number(payload.responseRate),
      cancellation: payload.cancellation.trim(),
      includes: ['Safety briefing', 'Required equipment', 'Operator support'],
      status: 'active',
    }
    let added = false
    const nextActivities = activities.map((activity) => {
      if (activity.id !== activityId) return activity
      added = true
      return withConsistentPrice(activity, [...activity.operators, operator])
    })

    if (!added) return { ok: false, message: 'Activity not found.' }
    syncActivities(nextActivities)
    return { ok: true, operator }
  }

  function updateOperator(activityId, operatorId, updates) {
    const targetActivity = activities.find((activity) => activity.id === activityId)
    const targetOperator = targetActivity?.operators.find(
      (operator) => operator.id === operatorId,
    )
    if (!targetActivity || !targetOperator) {
      return { ok: false, message: 'Operator not found.' }
    }
    if (
      updates.status === 'suspended' &&
      (targetOperator.status ?? 'active') === 'active' &&
      activeOperators(targetActivity.operators).length <= 1
    ) {
      return {
        ok: false,
        message: 'Add or activate another operator before suspending the only active operator.',
      }
    }

    let updated = false
    const nextActivities = activities.map((activity) => {
      if (activity.id !== activityId) return activity
      const operators = activity.operators.map((operator) => {
        if (operator.id !== operatorId) return operator
        updated = true
        return {
          ...operator,
          ...updates,
          license: updates.license?.trim() ?? operator.license,
          name: updates.name?.trim() ?? operator.name,
          price: updates.price === undefined ? operator.price : Number(updates.price),
          responseRate:
            updates.responseRate === undefined
              ? operator.responseRate
              : Number(updates.responseRate),
          safetyRating:
            updates.safetyRating === undefined
              ? operator.safetyRating
              : Number(updates.safetyRating),
          valueRating:
            updates.valueRating === undefined
              ? operator.valueRating
              : Number(updates.valueRating),
        }
      })
      return withConsistentPrice(activity, operators)
    })

    if (!updated) return { ok: false, message: 'Operator not found.' }
    syncActivities(nextActivities)
    if (updates.name?.trim() && updates.name.trim() !== targetOperator.name) {
      syncReviews(
        reviews.map((review) =>
          review.operatorId === operatorId
            ? { ...review, operator: updates.name.trim() }
            : review,
        ),
      )
    }
    return { ok: true }
  }

  function deleteOperator(activityId, operatorId) {
    const activity = activities.find((item) => item.id === activityId)
    if (!activity) return { ok: false, message: 'Activity not found.' }
    if (activity.operators.length <= 1) {
      return {
        ok: false,
        message: 'Add another operator before deleting the only operator for this activity.',
      }
    }

    const nextActivities = activities.map((item) =>
      item.id === activityId
        ? withConsistentPrice(
            item,
            item.operators.filter((operator) => operator.id !== operatorId),
          )
        : item,
    )
    syncActivities(nextActivities)
    return { ok: true }
  }

  function addReview(payload) {
    const nextReview = {
      id: `rv-${Date.now()}`,
      activityId: payload.activityId,
      userName: payload.userName.trim(),
      operatorId: payload.operatorId,
      operator: payload.operator.trim(),
      rating: Number(payload.rating),
      safetyRating: Number(payload.safetyRating),
      valueRating: Number(payload.valueRating),
      date: new Date().toISOString().slice(0, 10),
      comment: payload.comment.trim(),
    }
    const nextReviews = [nextReview, ...reviews]
    const nextActivities = activities.map((activity) => {
      if (activity.id !== payload.activityId) return activity
      const previousCount = Number(activity.reviewCount) || 0
      const reviewCount = previousCount + 1
      const rating =
        Math.round(
          (((Number(activity.rating) || 0) * previousCount + nextReview.rating) /
            reviewCount) *
            10,
        ) / 10
      return { ...activity, rating, reviewCount }
    })
    syncReviews(nextReviews)
    syncActivities(nextActivities)
  }

  function deleteReview(reviewId) {
    const removedReview = reviews.find((review) => review.id === reviewId)
    const deletedReviewIds = new Set(readJson(DELETED_REVIEW_IDS_KEY, []))
    deletedReviewIds.add(reviewId)
    saveJson(DELETED_REVIEW_IDS_KEY, [...deletedReviewIds])
    syncReviews(reviews.filter((review) => review.id !== reviewId))
    if (removedReview) {
      syncActivities(
        activities.map((activity) => {
          if (activity.id !== removedReview.activityId) return activity
          const previousCount = Number(activity.reviewCount) || 0
          const reviewCount = Math.max(0, previousCount - 1)
          const rating =
            reviewCount > 0
              ? Math.round(
                  (((Number(activity.rating) || 0) * previousCount -
                    Number(removedReview.rating)) /
                    reviewCount) *
                    10,
                ) / 10
              : 0
          return { ...activity, rating: Math.max(0, rating), reviewCount }
        }),
      )
    }
  }

  function getActivityById(activityId) {
    return activities.find((activity) => activity.id === activityId)
  }

  function getReviewsByActivityId(activityId) {
    return reviews.filter((review) => review.activityId === activityId)
  }

  const activityTypes = useMemo(
    () => [...new Set(activities.map((activity) => activity.type))].sort(),
    [activities],
  )

  const locations = useMemo(
    () => [...new Set(activities.map((activity) => activity.location))].sort(),
    [activities],
  )

  const provinces = useMemo(
    () => [...new Set(activities.map((activity) => activity.province))].sort(),
    [activities],
  )

  const value = {
    activities,
    activityTypes,
    addActivity,
    addOperator,
    addReview,
    deleteActivity,
    deleteOperator,
    deleteReview,
    getActivityById,
    getReviewsByActivityId,
    locations,
    provinces,
    reviews,
    saveSettings,
    settings,
    updateActivity,
    updateOperator,
    updateOperatorPrice,
  }

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
}
