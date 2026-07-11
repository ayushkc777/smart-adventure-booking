import { api } from './axios'
import { mapOperator } from './mappers'

export async function getOperators(params = {}) {
  const { data } = await api.get('/operators', { params: { limit: 100, ...params } })
  return data.operators.map(mapOperator)
}

export async function createOperator(payload) {
  const { data } = await api.post('/operators', {
    companyName: payload.name ?? payload.operatorName,
    insuranceAvailable: true,
    languages: ['English', 'Nepali'],
    licenseNumber: payload.license || `NTA-${Date.now()}`,
    location: payload.location || 'Nepal',
    responseRate: Number(payload.responseRate ?? 95),
    safetyScore: Math.round(Number(payload.safetyRating ?? 4.5) * 20),
    status: payload.status ?? 'active',
    yearsExperience: 3,
  })
  return mapOperator(data.operator)
}

export async function updateOperatorRecord(operatorId, updates) {
  const payload = {}
  if (updates.name !== undefined) payload.companyName = updates.name
  if (updates.license !== undefined) payload.licenseNumber = updates.license
  if (updates.location !== undefined) payload.location = updates.location
  if (updates.responseRate !== undefined) payload.responseRate = Number(updates.responseRate)
  if (updates.safetyRating !== undefined) payload.safetyScore = Math.round(Number(updates.safetyRating) * 20)
  if (updates.status !== undefined) payload.status = updates.status
  const { data } = await api.patch(`/operators/${operatorId}`, payload)
  return mapOperator(data.operator)
}

export async function deleteOperatorRecord(operatorId) {
  const { data } = await api.delete(`/operators/${operatorId}`)
  return data.operator ? mapOperator(data.operator) : null
}
