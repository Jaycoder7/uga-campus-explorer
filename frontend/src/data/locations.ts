import { Location, DailyChallenge, Achievement } from '@/types/game';

export const UGA_LOCATIONS: Location[] = [
  // Academic Buildings
  

  // Residence Halls
  
  // Dining
  
  {
    id: 'loc-021',
    name: 'Georgia Museum of Art',
    buildingCode: 'ART',
    category: 'cultural',
    coordinates: { lat: 33.94114018973817, lng: -83.36980687052316 },
    imageUrl: '/placeholder.svg',
    funFact: 'The Georgia Museum of Art is the official art museum of the state of Georgia and houses over 10,000 works.',
    yearBuilt: 1996,
    aliases: ['Art Museum', 'Museum of Art', 'GMOA'],
  },
  {
    id: 'loc-022',
    name: 'Turtle Pond',
    category: 'nature',
    coordinates: { lat: 33.94470036567655, lng: -83.37391505216773 },
    imageUrl: '/placeholder.svg',
    funFact: 'The Turtle Pond is a peaceful spot on campus where students often see turtles basking on logs.',
    yearBuilt: 1960,
    aliases: ['The Pond', 'Turtle Lake'],
  },
  {
    id: 'loc-023',
    name: 'Hardman Hall',
    category: 'academic',
    coordinates: { lat: 33.944849320655884, lng: -83.37389215911904 },
    imageUrl: '/placeholder.svg',
    funFact: 'Hardman Hall is a historic academic building known for its distinctive green lawn and classical architecture.',
    yearBuilt: 1920,
    aliases: ['Hardman'],
  },
];

// Mapping of location IDs to their 3D model files
export const LOCATION_MODELS: Record<string, string> = {
  'loc-021': '/models/ArtMusuem.glb',
  'loc-022': '/models/TurtlePond.glb',
  'loc-023': '/models/HardmanHallGreen.glb',
  // Add more mappings as you create models for other locations
};

export const MOCK_CHALLENGES: DailyChallenge[] = [
  {
    id: 'challenge-art-museum',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    location: 'loc-021',
    locationName: 'Georgia Museum of Art',
    buildingCode: 'ART',
    imageUrl: '/placeholder.svg',
    hint: 'This cultural landmark houses thousands of works and is the official art museum of Georgia.',
    funFact: 'The Georgia Museum of Art is the official art museum of the state of Georgia and houses over 10,000 works.',
    coordinates: { lat: 33.94121637848622, lng: -83.36971648623496 },
    directions: [
      'Start at Tate Student Center',
      'Head east towards East Campus Road',
      'Walk past the performing arts center',
      'Look for the modern building with large windows',
      'The museum entrance will be on your right',
    ],
    category: 'cultural',
  },
  {
    id: 'challenge-hardman-hall',
    date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    location: 'loc-023',
    locationName: 'Hardman Hall',
    imageUrl: '/placeholder.svg',
    hint: 'This historic academic building features a beautiful green lawn and classical architecture.',
    funFact: 'Hardman Hall is a historic academic building known for its distinctive green lawn and classical architecture.',
    coordinates: { lat: 33.9450380211186, lng: -83.37475295748452 },
    directions: [
      'Start at Tate Student Center main entrance',
      'Walk towards North Campus',
      'Look for the building with the iconic green lawn',
      'The classical columns mark the entrance',
      'You\'ll recognize it by its timeless architecture',
    ],
    category: 'academic',
  },
  {
    id: 'challenge-turtle-pond',
    date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    location: 'loc-022',
    locationName: 'Turtle Pond',
    imageUrl: '/placeholder.svg',
    hint: 'A peaceful spot on campus where nature lovers gather to watch the local wildlife.',
    funFact: 'The Turtle Pond is a peaceful spot on campus where students often see turtles basking on logs.',
    coordinates: { lat: 33.9450380211186, lng: -83.37475295748452 },
    directions: [
      'Start at Tate Student Center main entrance',
      'Walk towards the Science Learning Center',
      'Continue past the academic buildings',
      'Look for the peaceful pond surrounded by trees',
      'You\'ll see turtles if you\'re lucky!',
    ],
    category: 'nature',
  },
  
];

export const ALL_LOCATION_NAMES = UGA_LOCATIONS.flatMap(loc => [
  loc.name,
  ...loc.aliases,
]).sort();
