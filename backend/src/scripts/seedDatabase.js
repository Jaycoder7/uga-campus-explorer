require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');
const { generateChallengesForDateRange } = require('../utils/challengeGenerator');
const { format, subDays } = require('date-fns');

const UGA_LOCATIONS = [
  // Academic Buildings
  {
    name: 'Main Library',
    building_code: 'LIB',
    category: 'academic',
    latitude: 33.9480,
    longitude: -83.3773,
    image_url: '/placeholder.svg',
    fun_fact: 'The Main Library houses over 5 million volumes and is the largest library in Georgia.',
    year_built: 1953,
    aliases: ['Ilah Dunlap Little Memorial Library', 'UGA Library'],
  },
  {
    name: 'Zell B. Miller Learning Center',
    building_code: 'MLC',
    category: 'academic',
    latitude: 33.9456,
    longitude: -83.3770,
    image_url: '/placeholder.svg',
    fun_fact: 'The MLC is open 24/7 during the semester and features a 24-hour Jittery Joe\'s coffee shop.',
    year_built: 2012,
    aliases: ['MLC', 'Miller Learning Center'],
  },
  {
    name: 'Memorial Hall',
    building_code: 'MEM',
    category: 'academic',
    latitude: 33.9510,
    longitude: -83.3735,
    image_url: '/placeholder.svg',
    fun_fact: 'Built as a memorial to Georgians who died in WWI, it now houses the Psychology department.',
    year_built: 1925,
    aliases: ['Memorial', 'Psych Building'],
  },
  {
    name: 'Science Learning Center',
    building_code: 'SLC',
    category: 'academic',
    latitude: 33.9445,
    longitude: -83.3750,
    image_url: '/placeholder.svg',
    fun_fact: 'The SLC features state-of-the-art labs and a living wall of plants in the atrium.',
    year_built: 2020,
    aliases: ['SLC', 'Science Center'],
  },
  // Historic Buildings
  {
    name: 'The Arch',
    building_code: null,
    category: 'historic',
    latitude: 33.9570,
    longitude: -83.3734,
    image_url: '/placeholder.svg',
    fun_fact: 'Legend says if you walk under the Arch before graduation, you\'ll never graduate!',
    year_built: 1858,
    aliases: ['UGA Arch', 'Georgia Arch'],
  },
  {
    name: 'Old College',
    building_code: null,
    category: 'historic',
    latitude: 33.9558,
    longitude: -83.3731,
    image_url: '/placeholder.svg',
    fun_fact: 'Old College is the oldest building on campus, completed in 1806.',
    year_built: 1806,
    aliases: ['First Building'],
  },
  {
    name: 'Chapel',
    building_code: null,
    category: 'historic',
    latitude: 33.9562,
    longitude: -83.3720,
    image_url: '/placeholder.svg',
    fun_fact: 'The Chapel was built in 1832 and is the oldest building in Athens still used for religious purposes.',
    year_built: 1832,
    aliases: ['UGA Chapel', 'Historic Chapel'],
  },
  {
    name: 'Demosthenian Hall',
    building_code: null,
    category: 'historic',
    latitude: 33.9555,
    longitude: -83.3725,
    image_url: '/placeholder.svg',
    fun_fact: 'Home to the Demosthenian Literary Society, one of the oldest student organizations in America.',
    year_built: 1824,
    aliases: ['Demo Hall'],
  },
  {
    name: 'Holmes-Hunter Academic Building',
    building_code: 'HH',
    category: 'historic',
    latitude: 33.9548,
    longitude: -83.3740,
    image_url: '/placeholder.svg',
    fun_fact: 'Named after Hamilton Holmes and Charlayne Hunter, the first African American students at UGA.',
    year_built: 1905,
    aliases: ['Holmes-Hunter', 'HH Building'],
  },
  // Athletic Facilities
  {
    name: 'Sanford Stadium',
    building_code: null,
    category: 'athletic',
    latitude: 33.9497,
    longitude: -83.3733,
    image_url: '/placeholder.svg',
    fun_fact: 'Sanford Stadium can hold over 92,000 fans, making it the 3rd largest on-campus stadium in the US.',
    year_built: 1929,
    aliases: ['Between the Hedges', 'The Hedges'],
  },
  {
    name: 'Stegeman Coliseum',
    building_code: null,
    category: 'athletic',
    latitude: 33.9490,
    longitude: -83.3690,
    image_url: '/placeholder.svg',
    fun_fact: 'Home to UGA basketball and gymnastics, named after former athletic director Herman J. Stegeman.',
    year_built: 1964,
    aliases: ['Stegeman', 'The Coliseum'],
  },
  {
    name: 'Foley Field',
    building_code: null,
    category: 'athletic',
    latitude: 33.9510,
    longitude: -83.3680,
    image_url: '/placeholder.svg',
    fun_fact: 'Foley Field has hosted 13 NCAA Regional tournaments and seats over 3,000 fans.',
    year_built: 1966,
    aliases: ['Baseball Stadium'],
  },
  {
    name: 'Ramsey Student Center',
    building_code: 'RAM',
    category: 'athletic',
    latitude: 33.9445,
    longitude: -83.3680,
    image_url: '/placeholder.svg',
    fun_fact: 'Ramsey covers over 440,000 square feet, making it one of the largest rec centers in the nation.',
    year_built: 1995,
    aliases: ['Ramsey', 'Rec Center', 'Recreation Center'],
  },
  // Residence Halls
  {
    name: 'Creswell Hall',
    building_code: null,
    category: 'residence',
    latitude: 33.9530,
    longitude: -83.3695,
    image_url: '/placeholder.svg',
    fun_fact: 'Creswell was the first women\'s dormitory at UGA, built in 1939.',
    year_built: 1939,
    aliases: ['Creswell'],
  },
  {
    name: 'Russell Hall',
    building_code: null,
    category: 'residence',
    latitude: 33.9505,
    longitude: -83.3650,
    image_url: '/placeholder.svg',
    fun_fact: 'Russell Hall is known for its prime location near South Campus dining options.',
    year_built: 1968,
    aliases: ['Russell'],
  },
  {
    name: 'Brumby Hall',
    building_code: null,
    category: 'residence',
    latitude: 33.9545,
    longitude: -83.3680,
    image_url: '/placeholder.svg',
    fun_fact: 'At 16 floors, Brumby is the tallest residence hall on campus.',
    year_built: 1966,
    aliases: ['Brumby Tower'],
  },
  {
    name: 'Myers Hall',
    building_code: null,
    category: 'residence',
    latitude: 33.9520,
    longitude: -83.3710,
    image_url: '/placeholder.svg',
    fun_fact: 'Myers Quad is a popular spot for outdoor studying and relaxation.',
    year_built: 1959,
    aliases: ['Myers'],
  },
  // Dining
  {
    name: 'Tate Student Center',
    building_code: 'TATE',
    category: 'dining',
    latitude: 33.9489,
    longitude: -83.3764,
    image_url: '/placeholder.svg',
    fun_fact: 'Named after former UGA President William Tate, it serves as the hub of student life.',
    year_built: 1983,
    aliases: ['Tate', 'Student Center'],
  },
  {
    name: 'Bolton Dining Commons',
    building_code: null,
    category: 'dining',
    latitude: 33.9540,
    longitude: -83.3760,
    image_url: '/placeholder.svg',
    fun_fact: 'Bolton serves over 6,000 meals daily and features multiple food stations.',
    year_built: 1960,
    aliases: ['Bolton', 'Bolton Dining Hall'],
  },
  {
    name: 'Snelling Dining Commons',
    building_code: null,
    category: 'dining',
    latitude: 33.9510,
    longitude: -83.3695,
    image_url: '/placeholder.svg',
    fun_fact: 'Snelling underwent a major renovation in 2018 with expanded options.',
    year_built: 1959,
    aliases: ['Snelling', 'Snelling Dining Hall'],
  },
];

const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing existing data...');

    // Delete in order to respect foreign key constraints
    await supabaseAdmin.from('user_achievements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('user_locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('challenge_attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('daily_challenges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('achievements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

const seedLocations = async () => {
  try {
    console.log('📍 Seeding locations...');

    // Check if locations already exist
    const { data: existingLocations } = await supabaseAdmin
      .from('locations')
      .select('name');

    if (existingLocations && existingLocations.length > 0) {
      console.log(`✅ Locations already exist (${existingLocations.length} found), skipping seeding`);
      return existingLocations;
    }

    const { data: locations, error } = await supabaseAdmin
      .from('locations')
      .insert(UGA_LOCATIONS)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Seeded ${locations.length} locations`);
    return locations;
  } catch (error) {
    console.error('❌ Error seeding locations:', error);
    throw error;
  }
};

const seedAchievements = async () => {
  try {
    console.log('🏆 Seeding achievements...');

    // Check if achievements already exist
    const { data: existingAchievements } = await supabaseAdmin
      .from('achievements')
      .select('achievement_code');

    if (existingAchievements && existingAchievements.length > 0) {
      console.log(`✅ Achievements already exist (${existingAchievements.length} found), skipping seeding`);
      return existingAchievements;
    }

    const achievements = [
      {
        achievement_code: 'ach-001',
        name: 'First Steps',
        description: 'Complete your first challenge',
        icon: '🎯',
        requirement: 1,
        achievement_type: 'first'
      },
      {
        achievement_code: 'ach-002',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        requirement: 7,
        achievement_type: 'streak'
      },
      {
        achievement_code: 'ach-003',
        name: 'Explorer',
        description: 'Discover 10 different locations',
        icon: '🗺️',
        requirement: 10,
        achievement_type: 'total_locations'
      },
      {
        achievement_code: 'ach-004',
        name: 'Scholar',
        description: 'Discover 5 academic buildings',
        icon: '📚',
        requirement: 5,
        achievement_type: 'category_specific',
        category: 'academic'
      },
      {
        achievement_code: 'ach-005',
        name: 'Historian',
        description: 'Discover 5 historic landmarks',
        icon: '🏛️',
        requirement: 5,
        achievement_type: 'category_specific',
        category: 'historic'
      },
      {
        achievement_code: 'ach-006',
        name: 'Dawg Fan',
        description: 'Discover 3 athletic facilities',
        icon: '🏈',
        requirement: 3,
        achievement_type: 'category_specific',
        category: 'athletic'
      },
      {
        achievement_code: 'ach-007',
        name: 'Home Away From Home',
        description: 'Discover 5 residence halls',
        icon: '🏠',
        requirement: 5,
        achievement_type: 'category_specific',
        category: 'residence'
      },
      {
        achievement_code: 'ach-008',
        name: 'Foodie',
        description: 'Discover 3 dining locations',
        icon: '🍕',
        requirement: 3,
        achievement_type: 'category_specific',
        category: 'dining'
      }
    ];

    const { data: insertedAchievements, error } = await supabaseAdmin
      .from('achievements')
      .insert(achievements)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Seeded ${insertedAchievements.length} achievements`);
    return insertedAchievements;
  } catch (error) {
    console.error('❌ Error seeding achievements:', error);
    throw error;
  }
};

const seedChallenges = async () => {
  try {
    console.log('🎯 Seeding daily challenges...');

    // Check if challenges already exist
    const { data: existingChallenges } = await supabaseAdmin
      .from('daily_challenges')
      .select('challenge_date');

    if (existingChallenges && existingChallenges.length > 0) {
      console.log(`✅ Daily challenges already exist (${existingChallenges.length} found), skipping seeding`);
      return existingChallenges;
    }

    // Generate challenges for the last 7 days for testing
    const endDate = new Date();
    const startDate = subDays(endDate, 6); // Last 7 days

    await generateChallengesForDateRange(startDate, endDate);

    const { data: challenges, error } = await supabaseAdmin
      .from('daily_challenges')
      .select('*');

    if (error) {
      throw error;
    }

    console.log(`✅ Seeded ${challenges.length} daily challenges`);
    return challenges;
  } catch (error) {
    console.error('❌ Error seeding challenges:', error);
    throw error;
  }
};

const seedDatabase = async (clearFirst = false) => {
  try {
    console.log('🌱 Starting database seeding...');

    if (clearFirst) {
      await clearDatabase();
    }

    // Seed locations first (required for challenges)
    const locations = await seedLocations();

    // Seed achievements
    const achievements = await seedAchievements();

    // Seed daily challenges
    const challenges = await seedChallenges();

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   • ${locations.length} locations`);
    console.log(`   • ${achievements.length} achievements`);
    console.log(`   • ${challenges.length} daily challenges`);
    console.log('\n🚀 Your UGA Campus Explorer backend is ready to go!');

    return {
      locations,
      achievements,
      challenges
    };

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Run seeding if this script is executed directly
if (require.main === module) {
  const shouldClear = process.argv.includes('--clear');
  
  seedDatabase(shouldClear)
    .then(() => {
      console.log('\n✨ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  clearDatabase,
  seedLocations,
  seedAchievements,
  seedChallenges
};