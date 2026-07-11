import { average } from './formatters'

export const budgetRanges = [
  { label: 'Any budget', value: 'all', min: 0, max: Infinity },
  { label: 'Under NPR 10,000', value: 'under-10000', min: 0, max: 10000 },
  { label: 'NPR 10,000 - 30,000', value: '10000-30000', min: 10000, max: 30000 },
  { label: 'NPR 30,000 - 80,000', value: '30000-80000', min: 30000, max: 80000 },
  { label: 'Above NPR 80,000', value: 'above-80000', min: 80000, max: Infinity },
]

export const durationRanges = [
  { label: 'Any duration', value: 'all', min: 0, max: Infinity },
  { label: 'Half day / one day', value: 'day', min: 0, max: 1 },
  { label: '2-5 days', value: '2-5', min: 2, max: 5 },
  { label: '6-10 days', value: '6-10', min: 6, max: 10 },
  { label: '10+ days', value: '10-plus', min: 11, max: Infinity },
]

export const ratingRanges = [
  { label: 'Any rating', value: 'all', min: 0 },
  { label: '4.5+', value: '4.5', min: 4.5 },
  { label: '4.7+', value: '4.7', min: 4.7 },
  { label: '4.9+', value: '4.9', min: 4.9 },
]

const riskRank = { Low: 1, Medium: 2, High: 3 }
const experienceRank = { Beginner: 1, Intermediate: 2, Expert: 3 }

export function priceRangeFor(value) {
  return budgetRanges.find((range) => range.value === value) ?? budgetRanges[0]
}

export function safetyScore(activity) {
  if (activity.safetyScore) return activity.safetyScore
  const availableOperators = activity.operators.filter(
    (operator) => (operator.status ?? 'active') === 'active',
  )
  const operatorSafety = average(availableOperators.map((operator) => operator.safetyRating))
  const riskAdjustment = activity.riskLevel === 'Low' ? 10 : activity.riskLevel === 'Medium' ? 3 : -5
  return Math.max(55, Math.min(98, Math.round(operatorSafety * 18 + riskAdjustment)))
}

export function matchesActivityFilters(activity, filters) {
  const query = filters.q.trim().toLowerCase()
  const searchable = [
    activity.name,
    activity.type,
    activity.location,
    activity.province,
    activity.area,
    activity.description,
    activity.riskLevel,
    activity.difficulty,
    activity.bestSeason,
  ]
    .join(' ')
    .toLowerCase()
  const priceRange = priceRangeFor(filters.price)
  const durationRange =
    durationRanges.find((range) => range.value === filters.duration) ?? durationRanges[0]
  const ratingRange = ratingRanges.find((range) => range.value === filters.rating) ?? ratingRanges[0]

  return (
    (!query || searchable.includes(query)) &&
    (!filters.location || activity.location === filters.location || activity.province === filters.location) &&
    (!filters.risk || activity.riskLevel === filters.risk) &&
    (!filters.type || activity.type === filters.type) &&
    (!filters.difficulty ||
      activity.difficulty.toLowerCase().includes(filters.difficulty.toLowerCase())) &&
    (!filters.season || activity.bestSeason.toLowerCase().includes(filters.season.toLowerCase())) &&
    activity.priceFrom >= priceRange.min &&
    activity.priceFrom <= priceRange.max &&
    activity.durationDays >= durationRange.min &&
    activity.durationDays <= durationRange.max &&
    activity.rating >= ratingRange.min
  )
}

export function sortActivities(activities, sort) {
  const sorted = [...activities]

  if (sort === 'price-low') return sorted.sort((a, b) => a.priceFrom - b.priceFrom)
  if (sort === 'price-high') return sorted.sort((a, b) => b.priceFrom - a.priceFrom)
  if (sort === 'rating') return sorted.sort((a, b) => b.rating - a.rating)
  if (sort === 'safety') return sorted.sort((a, b) => safetyScore(b) - safetyScore(a))
  if (sort === 'popularity') {
    return sorted.sort((a, b) => (b.popularityScore ?? b.reviewCount) - (a.popularityScore ?? a.reviewCount))
  }

  return sorted
}

export function recommendActivities(activities, preferences) {
  const budget = priceRangeFor(preferences.budget)
  const preferredRiskRank = riskRank[preferences.riskComfort] ?? 3
  const levelRank = experienceRank[preferences.experienceLevel] ?? 2

  return activities
    .map((activity) => {
      let score = 38
      const reasons = []

      if (activity.priceFrom >= budget.min && activity.priceFrom <= budget.max) {
        score += 14
        reasons.push('Fits your budget range')
      }

      if (!preferences.location || activity.location === preferences.location || activity.province === preferences.location) {
        score += 13
        reasons.push('Matches your preferred destination')
      }

      if (!preferences.activityType || activity.type === preferences.activityType) {
        score += preferences.activityType ? 36 : 12
        reasons.push('Matches your activity preference')
      } else if (preferences.activityType) {
        score -= 18
      }

      if (riskRank[activity.riskLevel] <= preferredRiskRank) {
        score += 12
        reasons.push('Fits your risk comfort')
      }

      if (activity.durationDays <= Number(preferences.duration || 14)) {
        score += 9
        reasons.push('Works with your trip duration')
      }

      if (
        (levelRank === 1 && activity.difficulty.toLowerCase().includes('beginner')) ||
        (levelRank === 2 && !activity.difficulty.toLowerCase().includes('advanced')) ||
        levelRank === 3
      ) {
        score += 8
        reasons.push('Suitable for your experience level')
      }

      if (Number(preferences.groupSize || 1) > 4 && activity.type !== 'Helicopter Tour') {
        score += 4
        reasons.push('Good fit for groups')
      }

      score += Math.round((safetyScore(activity) - 75) / 4)
      score += Math.round((activity.rating - 4.3) * 8)

      return {
        activity,
        match: Math.max(62, Math.min(98, score)),
        reason: reasons.slice(0, 3).join(', ') || 'Balanced match across price, safety, and reviews',
      }
    })
    .sort((a, b) => b.match - a.match)
    .slice(0, 3)
}

export function operatorProfiles(activities) {
  const operators = new Map()

  activities.forEach((activity) => {
    activity.operators
      .filter((operator) => (operator.status ?? 'active') === 'active')
      .forEach((operator) => {
        const current = operators.get(operator.id) ?? {
          ...operator,
          activities: [],
          insurance: operator.includes.some((item) => item.toLowerCase().includes('insurance')),
          languages: ['English', 'Nepali'],
          responseRate: operator.responseRate ?? 92 + (operator.name.length % 7),
          yearsOperating: 4 + (operator.name.length % 11),
        }
        current.activities.push({
          id: activity.id,
          name: activity.name,
          location: activity.location,
          type: activity.type,
        })
        operators.set(operator.id, current)
      })
  })

  return [...operators.values()].map((operator) => ({
    ...operator,
    guideExperience: `${operator.yearsOperating}+ years`,
  }))
}
