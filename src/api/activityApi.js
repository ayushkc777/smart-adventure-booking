import { api } from './axios'
import { mapActivity, mapActivityPayload, mapActivityUpdatePayload } from './mappers'

export async function getActivities(params = {}) {
  const { data } = await api.get('/activities', { params: { limit: 100, ...params } })
  return data.activities.map(mapActivity)
}

export async function getActivity(idOrSlug) {
  const { data } = await api.get(`/activities/${idOrSlug}`)
  return mapActivity(data.activity)
}

export async function createActivity(payload, operatorId) {
  const { data } = await api.post('/activities', mapActivityPayload(payload, operatorId))
  return mapActivity(data.activity)
}

export async function updateActivityRecord(activityId, payload) {
  const { data } = await api.patch(`/activities/${activityId}`, mapActivityUpdatePayload(payload))
  return mapActivity(data.activity)
}

export async function updateActivityOperatorPrices(activityId, operatorPrices) {
  const { data } = await api.patch(`/activities/${activityId}`, { operatorPrices })
  return mapActivity(data.activity)
}

export async function deleteActivityRecord(activityId) {
  const { data } = await api.delete(`/activities/${activityId}`)
  return data.activity ? mapActivity(data.activity) : null
}
