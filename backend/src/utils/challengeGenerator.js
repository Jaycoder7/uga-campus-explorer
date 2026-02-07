const { supabaseAdmin } = require('../config/supabase');
const { format } = require('date-fns');

const generateDailyChallenge = async (date) => {
  try {
    const dateString = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    
    // Check if challenge already exists for this date
    const { data: existingChallenge } = await supabaseAdmin
      .from('daily_challenges')
      .select('id')
      .eq('challenge_date', dateString)
      .single();

    if (existingChallenge) {
      console.log(`Challenge already exists for ${dateString}`);
      return existingChallenge;
    }

    // Get all locations
    const { data: locations, error: locationsError } = await supabaseAdmin
      .from('locations')
      .select('*');

    if (locationsError || !locations || locations.length === 0) {
      throw new Error('No locations available for challenge generation');
    }

    // Generate deterministic location selection based on date
    // This ensures all users get the same challenge for the same day
    const dateNumber = new Date(dateString).getTime() / (1000 * 60 * 60 * 24); // Days since epoch
    const locationIndex = Math.abs(Math.floor(Math.sin(dateNumber) * 10000)) % locations.length;
    const selectedLocation = locations[locationIndex];

    // Generate hint and directions based on location data
    const hint = generateHint(selectedLocation);
    const directions = generateDirections(selectedLocation);

    // Create the challenge
    const { data: challenge, error: challengeError } = await supabaseAdmin
      .from('daily_challenges')
      .insert({
        challenge_date: dateString,
        location_id: selectedLocation.id,
        hint,
        directions
      })
      .select()
      .single();

    if (challengeError) {
      throw new Error(`Failed to create challenge: ${challengeError.message}`);
    }

    console.log(`Generated challenge for ${dateString}: ${selectedLocation.name}`);
    return challenge;

  } catch (error) {
    console.error('Error generating daily challenge:', error);
    throw error;
  }
};

const generateHint = (location) => {
  const hints = [];

  // Category-based hints
  switch (location.category) {
    case 'academic':
      hints.push('This building is dedicated to learning and education');
      hints.push('Students and faculty frequent this academic facility');
      hints.push('Knowledge flows through the halls of this educational building');
      break;
    case 'historic':
      hints.push('This landmark holds significant historical importance to UGA');
      hints.push('Generations of Bulldogs have passed by this historic site');
      hints.push('This location represents an important piece of UGA heritage');
      break;
    case 'athletic':
      hints.push('The roar of the crowd can be heard at this sports venue');
      hints.push('Bulldogs compete and train at this athletic facility');
      hints.push('School spirit runs high at this sporting location');
      break;
    case 'residence':
      hints.push('Students call this place their home away from home');
      hints.push('Late-night study sessions happen in this residential building');
      hints.push('This building provides housing for UGA students');
      break;
    case 'dining':
      hints.push('Hungry Bulldogs gather here to satisfy their appetites');
      hints.push('The aroma of food fills this popular campus eatery');
      hints.push('Students fuel up for their day at this dining location');
      break;
  }

  // Year-based hints
  if (location.year_built) {
    if (location.year_built < 1900) {
      hints.push('This building has stood for over a century');
    } else if (location.year_built < 1950) {
      hints.push('This structure was built in the early-to-mid 20th century');
    } else if (location.year_built < 2000) {
      hints.push('This building was constructed in the latter half of the 20th century');
    } else {
      hints.push('This is one of the newer additions to campus');
    }
  }

  // Building code hints
  if (location.building_code) {
    hints.push(`Some know this place by its building code: ${location.building_code}`);
  }

  // Generic location hints
  hints.push('This is a significant landmark on the University of Georgia campus');
  hints.push('Many UGA students have memories associated with this location');

  // Return a random hint
  return hints[Math.floor(Math.random() * hints.length)];
};

const generateDirections = (location) => {
  const directions = [];

  // Generate general directions based on category and location
  switch (location.category) {
    case 'academic':
      directions.push('Start from the heart of campus near the library');
      directions.push('Look for a building that buzzes with academic activity');
      directions.push('Find where students attend classes and study');
      break;
    case 'historic':
      directions.push('Begin your journey at North Campus');
      directions.push('Look for architectural features that speak to UGA\'s long history');
      directions.push('Find a place where tradition and heritage are preserved');
      break;
    case 'athletic':
      directions.push('Head towards the athletic district of campus');
      directions.push('Look for facilities where Bulldogs train and compete');
      directions.push('Find where school spirit reaches its peak');
      break;
    case 'residence':
      directions.push('Navigate to the residential areas of campus');
      directions.push('Look for where students live and build community');
      directions.push('Find a building that serves as home for many Bulldogs');
      break;
    case 'dining':
      directions.push('Follow the scent of delicious food on campus');
      directions.push('Look for a place where students gather to eat and socialize');
      directions.push('Find where hungry Bulldogs satisfy their cravings');
      break;
  }

  // Add some generic navigation tips
  directions.push('Use campus landmarks and signage to guide your way');
  directions.push('Ask fellow students or staff if you need help finding the location');
  directions.push('Take your time to explore and enjoy the campus atmosphere');

  // Return the first 3-4 directions for the challenge
  return directions.slice(0, Math.min(4, directions.length));
};

const generateChallengesForDateRange = async (startDate, endDate) => {
  try {
    const challenges = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const challenge = await generateDailyChallenge(new Date(date));
      challenges.push(challenge);
    }

    return challenges;
  } catch (error) {
    console.error('Error generating challenges for date range:', error);
    throw error;
  }
};

module.exports = {
  generateDailyChallenge,
  generateChallengesForDateRange
};