// UGA Campus Locations Data
const UGA_LOCATIONS = [
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
    coordinates: { lat: 33.94121637848622, lng: -83.36971648623496 },
    imageUrl: '/placeholder.svg',
    funFact: 'Hardman Hall is a historic academic building known for its distinctive green lawn and classical architecture.',
    yearBuilt: 1920,
    aliases: ['Hardman'],
  },
];

// Mapping of location IDs to their 3D model files
const LOCATION_MODELS = {
  'loc-021': '/models/ArtMusuem.glb',
  'loc-022': '/models/TurtlePond.glb',
  'loc-023': '/models/HardmanHallGreen.glb',
};

function getLocationHint(location) {
  switch (location.id) {
    case 'loc-021': // Georgia Museum of Art
      return 'This cultural landmark houses thousands of works and is the official art museum of Georgia.';
    case 'loc-022': // Turtle Pond
      return 'A peaceful spot on campus where nature lovers gather to watch the local wildlife basking on logs.';
    case 'loc-023': // Hardman Hall
      return 'This historic academic building features a beautiful green lawn and classical architecture.';
    default:
      return `This ${location.category} location is a popular campus spot.`;
  }
}

function getChallengeForDate(date) {
  const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  // Filter locations that have 3D models
  const locationsWithModels = UGA_LOCATIONS.filter(loc => 
    loc.id && LOCATION_MODELS[loc.id]
  );
  
  if (locationsWithModels.length === 0) {
    throw new Error('No locations with 3D models available');
  }
  
  // Use date only for consistent daily challenge (same challenge all day)
  c// For testing, use current time in milliseconds to get different locations more often
  const now = new Date();
  // TEST MODE: Change location every 30 seconds for rapid testing
  const seed = parseInt(dateStr.replace(/-/g, '')) + Math.floor(now.getTime() / (1000 * 300)); // Change every 30 seconds
  const locationIndex = Math.abs(seed) % locationsWithModels.length;
  const location = locationsWithModels[locationIndex];
  
  return {
    id: `generated-${dateStr}`,
    date: dateStr,
    location: location.id,
    locationName: location.name,
    buildingCode: location.buildingCode || '',
    imageUrl: location.imageUrl || '/placeholder.svg',
    hint: getLocationHint(location),
    funFact: location.funFact || '',
    coordinates: location.coordinates,
    directions: [
      'Start at Tate Student Center',
      `Head towards ${location.category === 'athletic' ? 'South Campus' : 'North Campus'}`,
      `Look for the ${location.name} building`,
      'You\'ll recognize it by its distinctive architecture',
    ],
    category: location.category,
  };
}

module.exports = {
  UGA_LOCATIONS,
  LOCATION_MODELS,
  getLocationHint,
  getChallengeForDate
};