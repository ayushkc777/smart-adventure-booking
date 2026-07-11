import { api } from './axios'

export async function getWishlist() {
  const { data } = await api.get('/wishlist')
  return data.wishlist.activities.map((activity) => activity._id ?? activity.id)
}

export async function addWishlistActivity(activityId) {
  const { data } = await api.post(`/wishlist/${activityId}`)
  return data.wishlist.activities.map((activity) => activity._id ?? activity.id)
}

export async function removeWishlistActivity(activityId) {
  const { data } = await api.delete(`/wishlist/${activityId}`)
  return data.wishlist.activities.map((activity) => activity._id ?? activity.id)
}
