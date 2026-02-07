const { supabaseAdmin } = require('../config/supabase');

const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');

    // Check if tables exist and have data
    const { data: locationsData, error: locationsError } = await supabaseAdmin
      .from('locations')
      .select('id')
      .limit(1);

    if (locationsError) {
      console.error('Error checking locations table:', locationsError);
      throw locationsError;
    }

    // Log database status
    console.log(`Locations in database: ${locationsData?.length || 0}`);

    // Check daily challenges table
    const { data: challengesData, error: challengesError } = await supabaseAdmin
      .from('daily_challenges')
      .select('id')
      .limit(1);

    if (challengesError) {
      console.error('Error checking daily_challenges table:', challengesError);
      throw challengesError;
    }

    console.log(`Daily challenges in database: ${challengesData?.length || 0}`);

    console.log('Database initialization check completed successfully');
    return true;

  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

const checkDatabaseHealth = async () => {
  try {
    // Test basic connectivity
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database health check failed:', error);
      return false;
    }

    console.log('Database health check passed');
    return true;

  } catch (error) {
    console.error('Database health check error:', error);
    return false;
  }
};

const getDatabaseStats = async () => {
  try {
    const stats = {};

    // Count users
    const { count: userCount } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Count locations
    const { count: locationCount } = await supabaseAdmin
      .from('locations')
      .select('*', { count: 'exact', head: true });

    // Count daily challenges
    const { count: challengeCount } = await supabaseAdmin
      .from('daily_challenges')
      .select('*', { count: 'exact', head: true });

    // Count challenge attempts
    const { count: attemptCount } = await supabaseAdmin
      .from('challenge_attempts')
      .select('*', { count: 'exact', head: true });

    // Count user discoveries
    const { count: discoveryCount } = await supabaseAdmin
      .from('user_locations')
      .select('*', { count: 'exact', head: true });

    stats.users = userCount || 0;
    stats.locations = locationCount || 0;
    stats.daily_challenges = challengeCount || 0;
    stats.challenge_attempts = attemptCount || 0;
    stats.user_discoveries = discoveryCount || 0;

    return stats;

  } catch (error) {
    console.error('Error fetching database stats:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  checkDatabaseHealth,
  getDatabaseStats
};