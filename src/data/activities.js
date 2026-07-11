export const activityTypes = [
  'Paragliding',
  'Bungee Jumping',
  'Trekking',
  'Rafting',
  'Zipline',
  'Canyoning',
  'Mountain Biking',
  'Helicopter Tour',
]

export const riskLevels = ['Low', 'Medium', 'High']

export const locations = [
  'Pokhara',
  'Kushma',
  'Everest Region',
  'Trishuli River',
  'Jalbire',
  'Annapurna Region',
  'Nagarkot',
]

export const priceRanges = [
  { label: 'Any price', value: 'all', min: 0, max: Infinity },
  { label: 'Under NPR 10,000', value: 'under-10000', min: 0, max: 10000 },
  { label: 'NPR 10,000 - 25,000', value: '10000-25000', min: 10000, max: 25000 },
  { label: 'NPR 25,000 - 75,000', value: '25000-75000', min: 25000, max: 75000 },
  { label: 'Above NPR 75,000', value: 'above-75000', min: 75000, max: Infinity },
]

const baseActivities = [
  {
    id: 'paragliding-pokhara',
    name: 'Paragliding over Phewa Lake',
    type: 'Paragliding',
    location: 'Pokhara',
    area: 'Sarangkot, Gandaki Province',
    image: '/images/paragliding.jpg',
    description:
      'A tandem paragliding experience from Sarangkot with panoramic views of Phewa Lake, Pokhara Valley, and the Annapurna range. Suitable for first-time flyers when weather conditions are approved by the operator.',
    shortDescription:
      'Tandem flight above Pokhara Valley with lake and Annapurna views.',
    riskLevel: 'Medium',
    duration: '25-35 minutes flight time',
    difficulty: 'Beginner friendly',
    minAge: 12,
    bestSeason: 'September to May',
    priceFrom: 8500,
    rating: 4.8,
    reviewCount: 142,
    includedServices: [
      'Licensed tandem pilot',
      'Harness, helmet, and flight equipment',
      'Hotel pickup inside Lakeside area',
      'Pre-flight safety briefing',
      'Basic insurance from operator',
    ],
    highlights: [
      'View Phewa Lake and the Annapurna skyline',
      'Compare certified tandem operators in one place',
      'Weather-based go or no-go safety decision',
    ],
    operators: [
      {
        id: 'pokhara-sky-adventures',
        name: 'Pokhara Sky Adventures',
        license: 'NAA-PLG-114',
        price: 8500,
        safetyRating: 4.7,
        valueRating: 4.6,
        cancellation: 'Free reschedule for unsafe weather',
        includes: ['Pickup', 'Insurance', 'GoPro add-on'],
      },
      {
        id: 'sarangkot-air-club',
        name: 'Sarangkot Air Club',
        license: 'NAA-PLG-092',
        price: 9200,
        safetyRating: 4.9,
        valueRating: 4.7,
        cancellation: 'Full refund before pilot dispatch',
        includes: ['Pickup', 'Certified pilot', 'Photo package'],
      },
      {
        id: 'himalayan-glide-nepal',
        name: 'Himalayan Glide Nepal',
        license: 'NAA-PLG-136',
        price: 9800,
        safetyRating: 4.8,
        valueRating: 4.5,
        cancellation: 'Weather credit valid for 30 days',
        includes: ['Pickup', 'Insurance', 'Landing transfer'],
      },
    ],
    safety: {
      checklist: [
        'Confirm wind speed and visibility before takeoff',
        'Wear closed shoes and layered clothing',
        'Follow pilot instructions during launch and landing',
        'Avoid alcohol before the flight',
      ],
      medicalWarning:
        'Not recommended for travelers with serious heart conditions, recent surgery, uncontrolled vertigo, or late-stage pregnancy.',
      equipment:
        'Certified harness, reserve parachute, helmet, radio communication, and pilot-controlled wing inspection are required.',
      emergencyGuidance:
        'Operators should maintain radio contact with landing crew and provide immediate transport to nearby medical facilities in Pokhara if needed.',
    },
  },
  {
    id: 'bungee-kushma',
    name: 'Kushma Cliff Bungee Jump',
    type: 'Bungee Jumping',
    location: 'Kushma',
    area: 'Kushma Bridge, Parbat District',
    image: '/images/bungee.jpeg',
    description:
      'A high-adrenaline bridge bungee experience in Kushma, designed for thrill seekers who want a controlled jump with strict equipment checks, weight verification, and jump-master supervision.',
    shortDescription:
      'Bridge bungee jump with professional jump-master supervision.',
    riskLevel: 'High',
    duration: '2-3 hours including briefing',
    difficulty: 'Advanced thrill activity',
    minAge: 16,
    bestSeason: 'October to May',
    priceFrom: 7200,
    rating: 4.7,
    reviewCount: 96,
    includedServices: [
      'Jump-master safety briefing',
      'Full-body harness and ankle connection system',
      'Weight verification',
      'Certificate of completion',
      'On-site first aid support',
    ],
    highlights: [
      "One of Nepal's most intense bridge adventure experiences",
      'Transparent operator price comparison',
      'Mandatory medical and weight screening',
    ],
    operators: [
      {
        id: 'kushma-adrenaline',
        name: 'Kushma Adrenaline Pvt. Ltd.',
        license: 'NTA-ADV-221',
        price: 7200,
        safetyRating: 4.8,
        valueRating: 4.5,
        cancellation: '50% refund up to 24 hours before',
        includes: ['Certificate', 'First aid', 'Equipment check'],
      },
      {
        id: 'cliff-nepal',
        name: 'Cliff Nepal Adventures',
        license: 'NTA-ADV-204',
        price: 7800,
        safetyRating: 4.9,
        valueRating: 4.6,
        cancellation: 'Reschedule available for medical restriction',
        includes: ['Certificate', 'Video add-on', 'Jump crew'],
      },
      {
        id: 'parbat-jump-house',
        name: 'Parbat Jump House',
        license: 'NTA-ADV-237',
        price: 8400,
        safetyRating: 4.6,
        valueRating: 4.4,
        cancellation: 'Weather credit valid for 15 days',
        includes: ['First aid', 'Transport add-on', 'Equipment check'],
      },
    ],
    safety: {
      checklist: [
        'Complete medical declaration before arrival',
        'Verify weight range with operator',
        'Remove loose jewelry and pocket items',
        'Listen carefully to jump posture instructions',
      ],
      medicalWarning:
        'Not suitable for travelers with heart disease, epilepsy, high blood pressure, severe back or neck injury, or pregnancy.',
      equipment:
        'Operator must use inspected bungee cord systems, full-body harness, ankle harness, backup attachment, and supervised platform access.',
      emergencyGuidance:
        'Jump site must keep trained rescue staff, first aid kit, emergency vehicle access, and nearest hospital contact ready before jump operations.',
    },
  },
  {
    id: 'everest-base-camp-trek',
    name: 'Everest Base Camp Guided Trek',
    type: 'Trekking',
    location: 'Everest Region',
    area: 'Sagarmatha National Park',
    image: '/images/everest-base-camp.jpeg',
    description:
      'A guided lodge trek through the Khumbu region with acclimatization days, porter support, route planning, and altitude-awareness recommendations for international and domestic travelers.',
    shortDescription:
      'Guided Khumbu lodge trek with acclimatization and porter support.',
    riskLevel: 'High',
    duration: '12-14 days',
    difficulty: 'Challenging',
    minAge: 15,
    bestSeason: 'March to May and September to November',
    priceFrom: 98000,
    rating: 4.9,
    reviewCount: 211,
    includedServices: [
      'Licensed trekking guide',
      'Porter support',
      'National park and local permits',
      'Lodge accommodation',
      'Airport transfers in Kathmandu',
    ],
    highlights: [
      'Altitude-aware itinerary with acclimatization days',
      'Compare guide companies and included services',
      'Clear medical warnings for high-altitude travel',
    ],
    operators: [
      {
        id: 'khumbu-trail-guides',
        name: 'Khumbu Trail Guides',
        license: 'TAAN-TREK-403',
        price: 98000,
        safetyRating: 4.8,
        valueRating: 4.7,
        cancellation: 'Flexible date shift up to 21 days before',
        includes: ['Guide', 'Porter', 'Permits', 'Lodges'],
      },
      {
        id: 'sagarmatha-expeditions',
        name: 'Sagarmatha Expeditions',
        license: 'TAAN-TREK-376',
        price: 112000,
        safetyRating: 4.9,
        valueRating: 4.6,
        cancellation: 'Partial refund based on permit issue date',
        includes: ['Guide', 'Porter', 'Permits', 'Duffel kit'],
      },
      {
        id: 'nepal-alpine-walks',
        name: 'Nepal Alpine Walks',
        license: 'TAAN-TREK-448',
        price: 121000,
        safetyRating: 5,
        valueRating: 4.8,
        cancellation: 'Custom cancellation for private groups',
        includes: ['Senior guide', 'Porter', 'Permits', 'Oxygen check'],
      },
    ],
    safety: {
      checklist: [
        'Plan gradual ascent and acclimatization days',
        'Carry layered clothing and broken-in trekking boots',
        'Drink water regularly and avoid rapid altitude gain',
        'Report headache, nausea, dizziness, or breathlessness early',
      ],
      medicalWarning:
        'High-altitude trekking can cause acute mountain sickness. Travelers with respiratory, heart, or blood pressure conditions should consult a doctor before booking.',
      equipment:
        'Trekking boots, down jacket, sleeping bag, poles, headlamp, first aid kit, water purification, and altitude monitoring support are recommended.',
      emergencyGuidance:
        'Guides should monitor altitude symptoms daily, know evacuation routes, and coordinate helicopter rescue or descent when serious symptoms appear.',
    },
  },
  {
    id: 'trishuli-river-rafting',
    name: 'Trishuli River Rafting',
    type: 'Rafting',
    location: 'Trishuli River',
    area: 'Charaudi to Fishling corridor',
    image: '/images/rafting.jpeg',
    description:
      'A white-water rafting trip on the Trishuli River with trained river guides, safety kayak support, and options for day trips or overnight riverside stays.',
    shortDescription:
      'White-water rafting with trained river guides and safety support.',
    riskLevel: 'Medium',
    duration: '1 day or 2 days',
    difficulty: 'Moderate',
    minAge: 12,
    bestSeason: 'September to June',
    priceFrom: 5200,
    rating: 4.6,
    reviewCount: 118,
    includedServices: [
      'Rafting guide',
      'Helmet, paddle, and personal flotation device',
      'Riverside lunch',
      'Safety briefing',
      'Dry bag for essentials',
    ],
    highlights: [
      'Popular rafting route between Kathmandu and Pokhara',
      'Operator comparison by safety kayak and meal inclusion',
      'Good choice for first-time white-water travelers',
    ],
    operators: [
      {
        id: 'trishuli-river-runners',
        name: 'Trishuli River Runners',
        license: 'NARA-RAFT-081',
        price: 5200,
        safetyRating: 4.5,
        valueRating: 4.8,
        cancellation: 'Full refund up to 48 hours before',
        includes: ['Lunch', 'Safety kayak', 'Dry bag'],
      },
      {
        id: 'nepal-whitewater',
        name: 'Nepal Whitewater Collective',
        license: 'NARA-RAFT-099',
        price: 6800,
        safetyRating: 4.8,
        valueRating: 4.7,
        cancellation: 'Weather and river-level reschedule',
        includes: ['Lunch', 'Safety kayak', 'Transport add-on'],
      },
      {
        id: 'himalayan-river-base',
        name: 'Himalayan River Base',
        license: 'NARA-RAFT-074',
        price: 9200,
        safetyRating: 4.7,
        valueRating: 4.5,
        cancellation: 'Overnight package policy applies',
        includes: ['Lunch', 'Camp stay', 'Safety kayak'],
      },
    ],
    safety: {
      checklist: [
        'Wear personal flotation device and helmet at all times',
        'Practice paddle commands before entering rapids',
        'Secure glasses, phones, and loose items',
        'Inform guide if you are not a confident swimmer',
      ],
      medicalWarning:
        'Not recommended for travelers with uncontrolled asthma, serious shoulder injury, severe fear of water, or recent surgery.',
      equipment:
        'Helmet, personal flotation device, paddle, rescue throw bag, first aid kit, and safety kayak support are recommended for commercial operations.',
      emergencyGuidance:
        'River guides should brief swim positions, rescue commands, and emergency pull-out points before departure.',
    },
  },
  {
    id: 'pokhara-zipline',
    name: 'Pokhara HighGround Zipline',
    type: 'Zipline',
    location: 'Pokhara',
    area: 'Sarangkot to Hemja',
    image: '/images/zipline.jpg',
    description:
      'A scenic high-speed zipline experience near Pokhara with mountain views, professional launch control, and controlled landing procedures.',
    shortDescription:
      'High-speed zipline descent with mountain and valley views.',
    riskLevel: 'Medium',
    duration: '1.5-2 hours',
    difficulty: 'Beginner friendly',
    minAge: 10,
    bestSeason: 'September to June',
    priceFrom: 6500,
    rating: 4.7,
    reviewCount: 87,
    includedServices: [
      'Safety harness and helmet',
      'Launch briefing',
      'Landing crew support',
      'Two-way transfer from Lakeside',
      'Basic operator insurance',
    ],
    highlights: [
      'Fast descent with Annapurna and valley scenery',
      'Short duration adventure for limited itineraries',
      'Operator comparison by transfer and media package',
    ],
    operators: [
      {
        id: 'highground-nepal',
        name: 'HighGround Nepal',
        license: 'NTA-ZIP-051',
        price: 6500,
        safetyRating: 4.8,
        valueRating: 4.6,
        cancellation: 'Weather reschedule available',
        includes: ['Transfer', 'Insurance', 'Helmet cam add-on'],
      },
      {
        id: 'sarangkot-zip-express',
        name: 'Sarangkot Zip Express',
        license: 'NTA-ZIP-066',
        price: 7100,
        safetyRating: 4.6,
        valueRating: 4.7,
        cancellation: 'Refund before safety briefing',
        includes: ['Transfer', 'Landing crew', 'Certificate'],
      },
      {
        id: 'annapurna-zip-adventures',
        name: 'Annapurna Zip Adventures',
        license: 'NTA-ZIP-073',
        price: 7900,
        safetyRating: 4.7,
        valueRating: 4.4,
        cancellation: 'Date credit valid for 20 days',
        includes: ['Transfer', 'Photo package', 'Insurance'],
      },
    ],
    safety: {
      checklist: [
        'Confirm harness fit with launch staff',
        'Tie long hair and remove loose accessories',
        'Keep hands in instructed position during descent',
        'Wait for landing crew signal before standing',
      ],
      medicalWarning:
        'Travelers with severe back or neck injury, uncontrolled blood pressure, or pregnancy should avoid zipline activity.',
      equipment:
        'Full-body harness, helmet, pulley system, braking line, backup tether, and launch gate inspection are required.',
      emergencyGuidance:
        'Operators should maintain communication between launch and landing stations and keep rescue access ready along the line.',
    },
  },
  {
    id: 'jalbire-canyoning',
    name: 'Jalbire Waterfall Canyoning',
    type: 'Canyoning',
    location: 'Jalbire',
    area: 'Chitwan District',
    image: '/images/canyoning.jpeg',
    description:
      'A guided canyoning route with waterfall rappels, natural slides, and rope-based descents. The activity requires careful guide supervision and weather-aware canyon entry decisions.',
    shortDescription:
      'Waterfall rappels, slides, and guided canyon descents.',
    riskLevel: 'High',
    duration: '5-6 hours',
    difficulty: 'Moderate to challenging',
    minAge: 14,
    bestSeason: 'October to May',
    priceFrom: 6800,
    rating: 4.7,
    reviewCount: 74,
    includedServices: [
      'Certified canyoning guide',
      'Wetsuit, helmet, harness, and rope equipment',
      'Lunch',
      'First aid kit',
      'Approach walk briefing',
    ],
    highlights: [
      'Hands-on technical adventure in a waterfall canyon',
      'Safety checklist highlights rope and flash-flood risks',
      'Compare operators by guide ratio and rescue equipment',
    ],
    operators: [
      {
        id: 'jalbire-canyon-team',
        name: 'Jalbire Canyon Team',
        license: 'NTA-CAN-118',
        price: 6800,
        safetyRating: 4.7,
        valueRating: 4.6,
        cancellation: 'No-entry refund for unsafe water level',
        includes: ['Lunch', 'Wetsuit', 'Rope guide'],
      },
      {
        id: 'himalayan-canyon-guides',
        name: 'Himalayan Canyon Guides',
        license: 'NTA-CAN-104',
        price: 7600,
        safetyRating: 4.9,
        valueRating: 4.7,
        cancellation: 'Weather reschedule available',
        includes: ['Lunch', 'Senior guide', 'Rescue kit'],
      },
      {
        id: 'chitwan-adventure-canyon',
        name: 'Chitwan Adventure Canyon',
        license: 'NTA-CAN-123',
        price: 8300,
        safetyRating: 4.6,
        valueRating: 4.4,
        cancellation: '50% refund up to 48 hours before',
        includes: ['Lunch', 'Transport add-on', 'Wetsuit'],
      },
    ],
    safety: {
      checklist: [
        'Check weather forecast and water level before entry',
        'Wear helmet and harness throughout technical sections',
        'Follow rope commands from the guide',
        'Do not enter canyon during heavy rain or flood warning',
      ],
      medicalWarning:
        'Not recommended for travelers with severe fear of heights, shoulder injury, uncontrolled asthma, or poor swimming confidence.',
      equipment:
        'Helmet, wetsuit, canyoning harness, locking carabiners, ropes, descender, throw bag, and first aid kit are recommended.',
      emergencyGuidance:
        'Guides should define escape points, maintain group spacing, and stop canyon entry immediately during rising water levels.',
    },
  },
  {
    id: 'annapurna-base-camp-trek',
    name: 'Annapurna Base Camp Trek',
    type: 'Trekking',
    location: 'Annapurna Region',
    area: 'Kaski and Annapurna Conservation Area',
    image: '/images/everest-base-camp.jpeg',
    description:
      'A guided Himalayan lodge trek through rhododendron forests, Gurung villages, and high alpine scenery with acclimatization-aware pacing and local guide support.',
    shortDescription: 'Guided trek to Annapurna Sanctuary with village stays and mountain views.',
    riskLevel: 'High',
    duration: '7-10 days',
    difficulty: 'Challenging',
    minAge: 14,
    bestSeason: 'March to May and September to November',
    priceFrom: 72000,
    rating: 4.8,
    reviewCount: 138,
    includedServices: [
      'Licensed trekking guide',
      'Porter support',
      'Conservation permits',
      'Lodge accommodation',
      'Trail safety briefing',
    ],
    highlights: [
      'Classic Annapurna route with strong lodge infrastructure',
      'Clear altitude and weather preparation guidance',
      'Compare trekking companies by inclusions and safety rating',
    ],
    operators: [
      {
        id: 'annapurna-sanctuary-guides',
        name: 'Annapurna Sanctuary Guides',
        license: 'TAAN-TREK-502',
        price: 72000,
        safetyRating: 4.8,
        valueRating: 4.7,
        cancellation: 'Flexible date change up to 14 days before',
        includes: ['Guide', 'Porter', 'Permits', 'Lodges'],
      },
      {
        id: 'pokhara-trek-collective',
        name: 'Pokhara Trek Collective',
        license: 'TAAN-TREK-519',
        price: 79500,
        safetyRating: 4.7,
        valueRating: 4.8,
        cancellation: 'Partial refund before permit issue',
        includes: ['Guide', 'Permits', 'Lodges', 'Airport transfer'],
      },
      {
        id: 'machhapuchhre-trail-team',
        name: 'Machhapuchhre Trail Team',
        license: 'TAAN-TREK-544',
        price: 86000,
        safetyRating: 4.9,
        valueRating: 4.6,
        cancellation: 'Custom policy for private groups',
        includes: ['Senior guide', 'Porter', 'Permits', 'First aid kit'],
      },
    ],
    safety: {
      checklist: [
        'Carry warm layers and rain protection',
        'Keep a steady pace and hydrate regularly',
        'Report altitude symptoms to your guide early',
        'Check trail and weather conditions before ascent days',
      ],
      medicalWarning:
        'High-altitude trekking may trigger altitude illness. Travelers with heart, lung, or blood pressure conditions should seek medical advice before booking.',
      equipment:
        'Trekking boots, layered clothing, poles, headlamp, sleeping bag, personal first aid kit, and water purification support are recommended.',
      emergencyGuidance:
        'Guides should monitor altitude symptoms, identify descent points, and coordinate evacuation support if serious symptoms appear.',
    },
  },
  {
    id: 'nagarkot-mountain-biking',
    name: 'Nagarkot Mountain Biking',
    type: 'Mountain Biking',
    location: 'Nagarkot',
    area: 'Nagarkot to Bhaktapur trail',
    image: '/images/biking.jpeg',
    description:
      'A guided mountain biking route from Nagarkot through forest roads, terraced villages, and historic Bhaktapur edges with bike checks and route support.',
    shortDescription: 'Guided ridge-to-valley bike ride with village trails and valley views.',
    riskLevel: 'Medium',
    duration: '5-6 hours',
    difficulty: 'Moderate',
    minAge: 13,
    bestSeason: 'October to May',
    priceFrom: 5900,
    rating: 4.6,
    reviewCount: 58,
    includedServices: [
      'Mountain bike and helmet',
      'Cycling guide',
      'Route briefing',
      'Basic repair kit',
      'Support contact',
    ],
    highlights: [
      'Active day trip near Kathmandu Valley',
      'Operator comparison by bike quality and support',
      'Clear preparation checklist for road and trail conditions',
    ],
    operators: [
      {
        id: 'valley-bike-guides',
        name: 'Valley Bike Guides',
        license: 'NTA-BIKE-031',
        price: 5900,
        safetyRating: 4.6,
        valueRating: 4.7,
        cancellation: 'Full refund up to 24 hours before',
        includes: ['Bike', 'Helmet', 'Repair kit'],
      },
      {
        id: 'nagarkot-cycling-club',
        name: 'Nagarkot Cycling Club',
        license: 'NTA-BIKE-046',
        price: 6700,
        safetyRating: 4.8,
        valueRating: 4.6,
        cancellation: 'Weather reschedule available',
        includes: ['Bike', 'Guide', 'Pickup add-on'],
      },
      {
        id: 'himalayan-bike-days',
        name: 'Himalayan Bike Days',
        license: 'NTA-BIKE-059',
        price: 7500,
        safetyRating: 4.7,
        valueRating: 4.5,
        cancellation: 'Date credit valid for 20 days',
        includes: ['Premium bike', 'Helmet', 'Support contact'],
      },
    ],
    safety: {
      checklist: [
        'Confirm brake and tire condition before departure',
        'Wear helmet and gloves throughout the ride',
        'Keep distance on descents and blind corners',
        'Carry water and follow guide pace',
      ],
      medicalWarning:
        'Not recommended for travelers with severe knee injury, recent fractures, uncontrolled blood pressure, or low cycling confidence.',
      equipment:
        'Mountain bike, helmet, gloves, repair kit, water bottle, and high-visibility layer are recommended.',
      emergencyGuidance:
        'Guides should carry repair tools, first aid supplies, and a support contact for vehicle pickup if required.',
    },
  },
  {
    id: 'mardi-himal-heli-tour',
    name: 'Mardi Himal Helicopter Tour',
    type: 'Helicopter Tour',
    location: 'Pokhara',
    area: 'Pokhara to Mardi Himal viewpoint',
    image: '/images/heli.jpeg',
    description:
      'A premium helicopter sightseeing experience from Pokhara toward Mardi Himal viewpoints with weather-dependent departure and strict operator safety checks.',
    shortDescription: 'Scenic helicopter flight toward Mardi Himal with mountain landing views.',
    riskLevel: 'Medium',
    duration: '1.5-2 hours',
    difficulty: 'Easy',
    minAge: 6,
    bestSeason: 'October to April',
    priceFrom: 42000,
    rating: 4.9,
    reviewCount: 42,
    includedServices: [
      'Licensed aviation operator',
      'Pilot safety briefing',
      'Airport transfer in Pokhara',
      'Weather-based departure decision',
      'Landing time where permitted',
    ],
    highlights: [
      'Premium short-duration mountain experience',
      'Weather visibility and aviation safety checks',
      'Compare aviation operators by inclusions and ratings',
    ],
    operators: [
      {
        id: 'pokhara-heli-services',
        name: 'Pokhara Heli Services',
        license: 'CAAN-HEL-214',
        price: 42000,
        safetyRating: 4.9,
        valueRating: 4.5,
        cancellation: 'Full weather refund before takeoff',
        includes: ['Transfer', 'Pilot briefing', 'Window seat rotation'],
      },
      {
        id: 'annapurna-air-adventures',
        name: 'Annapurna Air Adventures',
        license: 'CAAN-HEL-228',
        price: 46500,
        safetyRating: 5,
        valueRating: 4.6,
        cancellation: 'Weather reschedule or refund',
        includes: ['Transfer', 'Landing stop', 'Flight certificate'],
      },
      {
        id: 'mardi-sky-flights',
        name: 'Mardi Sky Flights',
        license: 'CAAN-HEL-236',
        price: 51000,
        safetyRating: 4.8,
        valueRating: 4.4,
        cancellation: 'Date credit valid for 30 days',
        includes: ['Pilot briefing', 'Landing stop', 'Photo support'],
      },
    ],
    safety: {
      checklist: [
        'Confirm weather visibility before departure',
        'Carry valid identification for airport entry',
        'Follow pilot and ground crew instructions',
        'Avoid loose scarves or items near the aircraft',
      ],
      medicalWarning:
        'Travelers with serious heart or respiratory conditions should consult a medical professional before high-altitude sightseeing flights.',
      equipment:
        'Warm layers, sunglasses, identification, and operator-approved boarding procedures are recommended.',
      emergencyGuidance:
        'Operators must follow aviation authority procedures, maintain ground contact, and cancel flights when weather or visibility is unsafe.',
    },
  },
]

const coordinatesByLocation = {
  'Annapurna Region': { lat: 28.5304, lng: 83.878 },
  'Everest Region': { lat: 27.9881, lng: 86.925 },
  Jalbire: { lat: 27.7256, lng: 84.6313 },
  Kushma: { lat: 28.2221, lng: 83.6816 },
  Nagarkot: { lat: 27.7172, lng: 85.5215 },
  Pokhara: { lat: 28.2096, lng: 83.9856 },
  'Trishuli River': { lat: 27.8268, lng: 84.882 },
}

const provinceByLocation = {
  'Annapurna Region': 'Gandaki Province',
  'Everest Region': 'Koshi Province',
  Jalbire: 'Bagmati Province',
  Kushma: 'Gandaki Province',
  Nagarkot: 'Bagmati Province',
  Pokhara: 'Gandaki Province',
  'Trishuli River': 'Bagmati Province',
}

const riskSafetyScore = {
  Low: 92,
  Medium: 84,
  High: 76,
}

function parseDurationDays(duration) {
  const numbers = duration.match(/\d+/g)?.map(Number) ?? []
  if (!numbers.length) return duration.includes('hour') ? 1 : 2
  return duration.includes('day') ? Math.max(...numbers) : 1
}

function seasonTags(bestSeason) {
  return ['Spring', 'Summer', 'Autumn', 'Winter'].filter((season) => {
    const value = bestSeason.toLowerCase()
    if (season === 'Spring') return value.includes('march') || value.includes('april') || value.includes('may')
    if (season === 'Summer') return value.includes('june')
    if (season === 'Autumn') return value.includes('september') || value.includes('october') || value.includes('november')
    return value.includes('december') || value.includes('january') || value.includes('february')
  })
}

const localGalleryFallbacks = [
  '/images/paragliding.jpg',
  '/images/everest-base-camp.jpeg',
  '/images/rafting.jpeg',
  '/images/zipline.jpg',
  '/images/biking.jpeg',
  '/images/heli.jpeg',
]

function enrichActivities(items) {
  return items.map((activity, index) => {
    const operatorSafety = activity.operators.reduce((total, operator) => total + operator.safetyRating, 0) / activity.operators.length
    const safetyScore = Math.round(((operatorSafety / 5) * 70) + (riskSafetyScore[activity.riskLevel] * 0.3))
    const coordinates = coordinatesByLocation[activity.location] ?? { lat: 27.7172, lng: 85.324 }
    return {
      ...activity,
      province: provinceByLocation[activity.location] ?? 'Nepal',
      coordinates,
      safetyScore,
      popularityScore: Math.min(99, Math.round(activity.rating * 12 + activity.reviewCount / 4 + index)),
      durationDays: parseDurationDays(activity.duration),
      seasonTags: seasonTags(activity.bestSeason),
      gallery: [
        activity.image,
        ...localGalleryFallbacks.filter((image) => image !== activity.image),
      ].slice(0, 3),
    }
  })
}

export const activities = enrichActivities(baseActivities)

export function getActivityById(id) {
  return activities.find((activity) => activity.id === id)
}

export function getOperatorById(activity, operatorId) {
  if (!activity) return null
  return activity.operators.find((operator) => operator.id === operatorId)
}
