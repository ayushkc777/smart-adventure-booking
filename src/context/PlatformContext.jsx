import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createActivity,
  deleteActivityRecord,
  getActivities,
  updateActivityOperatorPrices,
  updateActivityRecord,
} from '../api/activityApi'
import { getApiError } from '../api/axios'
import { mapOperatorPricePayload } from '../api/mappers'
import {
  createOperator,
  deleteOperatorRecord,
  getOperators,
  updateOperatorRecord,
} from '../api/operatorApi'
import { createReview, deleteReviewRecord, getReviews } from '../api/reviewApi'
import { activities as seedActivities } from '../data/activities'
import { defaultPlatformSettings } from '../data/settings'
import { useAuth } from './useAuth'
import { PlatformContext } from './platformContext'

const SETTINGS_KEY = 'smartAdventureAdminSettings'

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

function mergeById(items, updatedItem) {
  if (!updatedItem) return items
  const exists = items.some((item) => item.id === updatedItem.id)
  return exists
    ? items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    : [updatedItem, ...items]
}

function activeOperators(operators) {
  return operators.filter((operator) => (operator.status ?? 'active') === 'active')
}

function localizeActivity(activity, fallbackActivities = seedActivities) {
  const fallback =
    fallbackActivities.find((item) => item.type === activity.type) ??
    fallbackActivities.find((item) => item.id === activity.id)

  if (!fallback) return activity

  return {
    ...activity,
    coordinates: activity.coordinates ?? fallback.coordinates,
    durationDays: activity.durationDays ?? fallback.durationDays,
    highlights: activity.highlights ?? fallback.highlights,
    includedServices: activity.includedServices?.length
      ? activity.includedServices
      : fallback.includedServices,
    minAge: activity.minAge ?? fallback.minAge,
    safety: activity.safety ?? fallback.safety,
    seasonTags: activity.seasonTags?.length ? activity.seasonTags : fallback.seasonTags,
  }
}

export function PlatformProvider({ children }) {
  const { currentUser } = useAuth()
  const [activities, setActivities] = useState([])
  const [operators, setOperators] = useState([])
  const [reviews, setReviews] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const catalogRequestIdRef = useRef(0)
  const [settings, setSettings] = useState(() => ({
    ...defaultPlatformSettings,
    ...readJson(SETTINGS_KEY, {}),
  }))

  const refreshActivities = useCallback(async () => {
    const apiActivities = await getActivities()
    const localizedActivities = apiActivities.map((activity) => localizeActivity(activity))
    setActivities(localizedActivities)
    return localizedActivities
  }, [])

  const refreshReviews = useCallback(async () => {
    const apiReviews = await getReviews()
    setReviews(apiReviews)
    return apiReviews
  }, [])

  const refreshOperators = useCallback(async () => {
    const apiOperators = await getOperators()
    setOperators(apiOperators)
    return apiOperators
  }, [])

  const refreshCatalog = useCallback(async () => {
    const requestId = catalogRequestIdRef.current + 1
    catalogRequestIdRef.current = requestId
    setCatalogLoading(true)
    try {
      const [apiActivities, apiReviews, apiOperators] = await Promise.all([
        getActivities(),
        getReviews(),
        getOperators(),
      ])
      if (requestId !== catalogRequestIdRef.current) return { ok: true, stale: true }

      setActivities(apiActivities.map((activity) => localizeActivity(activity)))
      setReviews(apiReviews)
      setOperators(apiOperators)
      setCatalogError('')
      return { ok: true }
    } catch (error) {
      const message = getApiError(error, 'Could not load live adventure catalogue.')
      if (requestId !== catalogRequestIdRef.current) {
        return { ok: false, message, stale: true }
      }
      setActivities([])
      setReviews([])
      setOperators([])
      setCatalogError(message)
      return { ok: false, message }
    } finally {
      if (requestId === catalogRequestIdRef.current) setCatalogLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCatalog()
  }, [currentUser?.id, currentUser?.role, refreshCatalog])

  function saveSettings(nextSettings) {
    const normalizedSettings = { ...defaultPlatformSettings, ...nextSettings }
    setSettings(normalizedSettings)
    saveJson(SETTINGS_KEY, normalizedSettings)
  }

  async function addActivity(payload) {
    try {
      const operator = await createOperator({
        license: payload.license,
        location: payload.location,
        name: payload.operatorName,
        price: payload.priceFrom,
        safetyRating: payload.rating,
      })
      const activity = await createActivity(payload, operator.id)
      const localizedActivity = localizeActivity(activity)
      setActivities((current) => [localizedActivity, ...current])
      await refreshOperators()
      return { ok: true, activity: localizedActivity }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not add activity.') }
    }
  }

  async function updateActivity(activityId, updates) {
    const activity = activities.find((item) => item.id === activityId)

    try {
      if (activity?.operators[0] && (updates.operatorName || updates.license)) {
        await updateOperatorRecord(activity.operators[0].id, {
          license: updates.license?.trim() || activity.operators[0].license,
          name: updates.operatorName?.trim() || activity.operators[0].name,
        })
      }

      const updatedActivity = await updateActivityRecord(activityId, updates)
      const localizedActivity = localizeActivity(updatedActivity)
      setActivities((current) => mergeById(current, localizedActivity))
      await refreshOperators()
      await refreshReviews()
      return { ok: true, activity: localizedActivity }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not update activity.') }
    }
  }

  async function deleteActivity(activityId) {
    try {
      const archivedActivity = await deleteActivityRecord(activityId)
      if (archivedActivity) {
        setActivities((current) => mergeById(current, localizeActivity(archivedActivity)))
      } else {
        setActivities((current) => current.filter((activity) => activity.id !== activityId))
      }
      await refreshOperators()
      await refreshReviews()
      return { ok: true }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not remove activity.') }
    }
  }

  async function updateOperatorPrice(activityId, operatorId, price) {
    const activity = activities.find((item) => item.id === activityId)
    if (!activity) return { ok: false, message: 'Activity not found.' }

    try {
      const operatorPrices = activity.operators.map((operator) =>
        mapOperatorPricePayload(operator, operator.id === operatorId ? price : operator.price),
      )
      const updatedActivity = await updateActivityOperatorPrices(activityId, operatorPrices)
      const localizedActivity = localizeActivity(updatedActivity)
      setActivities((current) => mergeById(current, localizedActivity))
      await refreshOperators()
      return { ok: true, activity: localizedActivity }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not update operator price.') }
    }
  }

  async function addOperator(activityId, payload) {
    const activity = activities.find((item) => item.id === activityId)
    if (!activity) return { ok: false, message: 'Activity not found.' }

    try {
      const operator = await createOperator(payload)
      const pricedOperator = {
        ...operator,
        cancellation: payload.cancellation,
        includes: ['Safety briefing', 'Required equipment', 'Operator support'],
        price: Number(payload.price),
        valueRating: Number(payload.valueRating),
      }
      const operatorPrices = [
        ...activity.operators.map((item) => mapOperatorPricePayload(item, item.price)),
        mapOperatorPricePayload(pricedOperator, pricedOperator.price),
      ]
      const updatedActivity = await updateActivityOperatorPrices(activityId, operatorPrices)
      const localizedActivity = localizeActivity(updatedActivity)
      setActivities((current) => mergeById(current, localizedActivity))
      await refreshOperators()
      return { ok: true, operator: pricedOperator }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not add operator.') }
    }
  }

  async function updateOperator(activityId, operatorId, updates) {
    const activity = activities.find((item) => item.id === activityId)
    const targetOperator = activity?.operators.find((operator) => operator.id === operatorId)
    const directoryOperator = operators.find((operator) => operator.id === operatorId)
    if (!targetOperator && !directoryOperator) {
      return { ok: false, message: 'Operator not found.' }
    }

    if (
      activity &&
      targetOperator &&
      updates.status === 'suspended' &&
      (targetOperator.status ?? 'active') === 'active' &&
      activeOperators(activity.operators).length <= 1
    ) {
      return {
        ok: false,
        message: 'Add or activate another operator before suspending the only active operator.',
      }
    }

    try {
      await updateOperatorRecord(operatorId, updates)

      if (activity && targetOperator && updates.price !== undefined) {
        const operatorPrices = activity.operators.map((operator) =>
          mapOperatorPricePayload(
            operator.id === operatorId ? { ...operator, ...updates } : operator,
            operator.id === operatorId ? updates.price : operator.price,
          ),
        )
        const updatedActivity = await updateActivityOperatorPrices(activityId, operatorPrices)
        setActivities((current) => mergeById(current, localizeActivity(updatedActivity)))
      } else {
        await refreshActivities()
      }

      await refreshOperators()
      await refreshReviews()
      return { ok: true }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not update operator.') }
    }
  }

  async function deleteOperator(activityId, operatorId) {
    const activity = activities.find((item) => item.id === activityId)
    if (activity && activity.operators.length <= 1) {
      return {
        ok: false,
        message: 'Add another operator before deleting the only operator for this activity.',
      }
    }

    try {
      await deleteOperatorRecord(operatorId)
      await refreshActivities()
      await refreshOperators()
      await refreshReviews()
      return { ok: true }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not delete operator.') }
    }
  }

  async function addReview(payload) {
    try {
      const review = await createReview(payload)
      setReviews((current) => [review, ...current])
      await refreshActivities()
      return { ok: true, review }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not add review.') }
    }
  }

  async function deleteReview(reviewId) {
    try {
      await deleteReviewRecord(reviewId)
      setReviews((current) => current.filter((review) => review.id !== reviewId))
      await refreshActivities()
      return { ok: true }
    } catch (error) {
      return { ok: false, message: getApiError(error, 'Could not delete review.') }
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
    catalogError,
    catalogLoading,
    deleteActivity,
    deleteOperator,
    deleteReview,
    getActivityById,
    getReviewsByActivityId,
    locations,
    operators,
    provinces,
    refreshCatalog,
    refreshOperators,
    reviews,
    saveSettings,
    settings,
    updateActivity,
    updateOperator,
    updateOperatorPrice,
  }

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
}
