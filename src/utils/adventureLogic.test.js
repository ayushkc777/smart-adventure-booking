import { describe, expect, it } from 'vitest'
import { activities } from '../test/fixtures'
import {
  matchesActivityFilters,
  operatorProfiles,
  recommendActivities,
  safetyScore,
  sortActivities,
} from './adventureLogic'

const baseFilters = {
  difficulty: '',
  duration: 'all',
  location: '',
  price: 'all',
  q: '',
  rating: 'all',
  risk: '',
  season: '',
  sort: 'recommended',
  type: '',
}

describe('adventure catalogue logic', () => {
  it('matches activities by keyword, location, type, risk, and price range', () => {
    const bikingFilters = {
      ...baseFilters,
      location: 'Bagmati',
      price: 'under-10000',
      q: 'biking',
      risk: 'Medium',
      type: 'Mountain Biking',
    }

    expect(matchesActivityFilters(activities[1], bikingFilters)).toBe(true)
    expect(matchesActivityFilters(activities[0], bikingFilters)).toBe(false)
  })

  it('sorts by price, rating, and safety score', () => {
    expect(sortActivities(activities, 'price-low')[0].name).toBe('Nagarkot Mountain Biking')
    expect(sortActivities(activities, 'rating')[0].name).toBe('Mardi Himal Helicopter Tour')
    expect(sortActivities(activities, 'safety')[0].name).toBe('Mardi Himal Helicopter Tour')
  })

  it('prioritizes the selected activity type in smart planner recommendations', () => {
    const recommendations = recommendActivities(activities, {
      activityType: 'Mountain Biking',
      budget: 'under-10000',
      duration: 1,
      experienceLevel: 'Intermediate',
      groupSize: 2,
      location: 'Bagmati',
      riskComfort: 'Medium',
    })

    expect(recommendations[0].activity.name).toBe('Nagarkot Mountain Biking')
    expect(recommendations[0].reason).toContain('Matches your activity preference')
  })

  it('derives operator profiles and safety scores from active operators', () => {
    const profiles = operatorProfiles(activities)

    expect(profiles.map((operator) => operator.name)).toEqual(
      expect.arrayContaining(['Pokhara Sky Adventures', 'Valley Bike Guides']),
    )
    expect(safetyScore(activities[0])).toBeGreaterThanOrEqual(90)
  })

  it('treats catalogue filter boundaries as inclusive', () => {
    const boundaryActivity = {
      ...activities[0],
      bestSeason: 'Autumn and Spring',
      difficulty: 'Moderate to challenging',
      durationDays: 5,
      priceFrom: 30000,
      rating: 4.7,
    }

    expect(
      matchesActivityFilters(boundaryActivity, {
        ...baseFilters,
        difficulty: 'moderate',
        duration: '2-5',
        price: '10000-30000',
        rating: '4.7',
        season: 'spring',
      }),
    ).toBe(true)
  })

  it('falls back safely for unknown ranges and empty catalogues', () => {
    expect(
      matchesActivityFilters(activities[0], {
        ...baseFilters,
        duration: 'unknown-duration',
        price: 'unknown-price',
        rating: 'unknown-rating',
      }),
    ).toBe(true)
    expect(sortActivities([], 'rating')).toEqual([])
    expect(recommendActivities([], {})).toEqual([])
    expect(operatorProfiles([])).toEqual([])
  })

  it('does not mutate catalogue order while sorting', () => {
    const originalOrder = activities.map((activity) => activity.id)

    sortActivities(activities, 'price-high')

    expect(activities.map((activity) => activity.id)).toEqual(originalOrder)
  })
})
