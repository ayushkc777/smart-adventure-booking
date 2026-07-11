export const reviews = [
  {
    id: 'rv-001',
    activityId: 'paragliding-pokhara',
    userName: 'Anisha K.',
    operator: 'Sarangkot Air Club',
    rating: 5,
    safetyRating: 5,
    valueRating: 4,
    date: '2026-04-12',
    comment:
      'The pilot explained wind conditions clearly and waited until the launch was calm. Price comparison helped me choose a safer operator, not just the cheapest one.',
  },
  {
    id: 'rv-002',
    activityId: 'paragliding-pokhara',
    userName: 'Mark T.',
    operator: 'Pokhara Sky Adventures',
    rating: 4,
    safetyRating: 4,
    valueRating: 5,
    date: '2026-03-28',
    comment:
      'Good value and smooth hotel pickup. The checklist made it easy to prepare for the flight.',
  },
  {
    id: 'rv-003',
    activityId: 'bungee-kushma',
    userName: 'Rohit S.',
    operator: 'Cliff Nepal Adventures',
    rating: 5,
    safetyRating: 5,
    valueRating: 4,
    date: '2026-02-18',
    comment:
      'Strict weight check and clear jump instructions. High risk, but the process felt controlled and professional.',
  },
  {
    id: 'rv-004',
    activityId: 'everest-base-camp-trek',
    userName: 'Priya M.',
    operator: 'Nepal Alpine Walks',
    rating: 5,
    safetyRating: 5,
    valueRating: 5,
    date: '2026-05-06',
    comment:
      'The altitude warnings were useful before booking. Our guide checked symptoms every day and adjusted the pace.',
  },
  {
    id: 'rv-005',
    activityId: 'everest-base-camp-trek',
    userName: 'Daniel R.',
    operator: 'Khumbu Trail Guides',
    rating: 5,
    safetyRating: 4,
    valueRating: 5,
    date: '2026-04-19',
    comment:
      'Transparent permit and porter inclusions. It was easier to compare trek companies than messaging each one separately.',
  },
  {
    id: 'rv-006',
    activityId: 'trishuli-river-rafting',
    userName: 'Sujan P.',
    operator: 'Nepal Whitewater Collective',
    rating: 4,
    safetyRating: 5,
    valueRating: 4,
    date: '2026-06-02',
    comment:
      'The river guide practiced rescue commands before launch. The safety kayak listing was the reason we chose this operator.',
  },
  {
    id: 'rv-007',
    activityId: 'pokhara-zipline',
    userName: 'Lina B.',
    operator: 'HighGround Nepal',
    rating: 5,
    safetyRating: 5,
    valueRating: 4,
    date: '2026-01-15',
    comment:
      'Quick activity but very organized. Harness check, launch signal, and landing crew were all clearly explained.',
  },
  {
    id: 'rv-008',
    activityId: 'jalbire-canyoning',
    userName: 'Nabin G.',
    operator: 'Himalayan Canyon Guides',
    rating: 4,
    safetyRating: 5,
    valueRating: 4,
    date: '2026-05-24',
    comment:
      'Guide ratio and rope safety details mattered a lot. The canyon was intense but professionally managed.',
  },
  {
    id: 'rv-009',
    activityId: 'jalbire-canyoning',
    userName: 'Sofia L.',
    operator: 'Jalbire Canyon Team',
    rating: 4,
    safetyRating: 4,
    valueRating: 5,
    date: '2026-04-07',
    comment:
      'Great value and all equipment was included. I liked seeing the medical warning before booking.',
  },
  {
    id: 'rv-010',
    activityId: 'annapurna-base-camp-trek',
    userName: 'Hannah W.',
    operator: 'Annapurna Sanctuary Guides',
    rating: 5,
    safetyRating: 5,
    valueRating: 4,
    date: '2026-03-14',
    comment:
      'The guide managed pace carefully and explained altitude symptoms every evening. Inclusions were clear before booking.',
  },
  {
    id: 'rv-012',
    activityId: 'nagarkot-mountain-biking',
    userName: 'Jason M.',
    operator: 'Valley Bike Guides',
    rating: 5,
    safetyRating: 4,
    valueRating: 5,
    date: '2026-04-02',
    comment:
      'Bike checks, route briefing, and guide pacing were solid. The trail was active but manageable.',
  },
  {
    id: 'rv-013',
    activityId: 'mardi-himal-heli-tour',
    userName: 'Saru T.',
    operator: 'Annapurna Air Adventures',
    rating: 5,
    safetyRating: 5,
    valueRating: 4,
    date: '2026-02-09',
    comment:
      'Weather decision was handled professionally. The operator explained visibility and boarding rules clearly.',
  },
]

export function getReviewsByActivityId(activityId) {
  return reviews.filter((review) => review.activityId === activityId)
}
