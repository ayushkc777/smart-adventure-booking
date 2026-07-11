import { api } from './axios'
import { mapReview } from './mappers'

export async function getReviews(params = {}) {
  const { data } = await api.get('/reviews', { params: { limit: 100, ...params } })
  return data.reviews.map(mapReview)
}

export async function createReview(payload) {
  const { data } = await api.post('/reviews', {
    activity: payload.activityId,
    comment: payload.comment,
    operator: payload.operatorId,
    rating: Number(payload.rating),
    safetyRating: Number(payload.safetyRating),
  })
  return mapReview(data.review)
}

export async function deleteReviewRecord(reviewId) {
  await api.delete(`/reviews/${reviewId}`)
}
