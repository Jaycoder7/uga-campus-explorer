const cron = require('node-cron');
const { format, addDays } = require('date-fns');
const { generateDailyChallenge } = require('../utils/challengeGenerator');
const { getDatabaseStats } = require('../utils/initDatabase');

const startSchedulers = () => {
  console.log('Starting scheduled jobs...');

  // Generate daily challenge at midnight EST (5 AM UTC)
  // Runs every day at 5:00 AM UTC (midnight EST)
  cron.schedule('0 5 * * *', async () => {
    try {
      console.log('Running daily challenge generation job...');
      const today = format(new Date(), 'yyyy-MM-dd');
      await generateDailyChallenge(today);
      console.log(`Daily challenge generated for ${today}`);
    } catch (error) {
      console.error('Error generating daily challenge:', error);
    }
  }, {
    timezone: 'UTC'
  });

  // Pre-generate tomorrow's challenge at 6 PM EST (11 PM UTC)
  // This provides a backup in case the midnight job fails
  cron.schedule('0 23 * * *', async () => {
    try {
      console.log('Pre-generating tomorrow\'s challenge...');
      const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
      await generateDailyChallenge(tomorrow);
      console.log(`Tomorrow's challenge pre-generated for ${tomorrow}`);
    } catch (error) {
      console.error('Error pre-generating tomorrow\'s challenge:', error);
    }
  }, {
    timezone: 'UTC'
  });

  // Database health check - runs every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running hourly database health check...');
      const stats = await getDatabaseStats();
      console.log('Database stats:', stats);
    } catch (error) {
      console.error('Database health check failed:', error);
    }
  });

  // Weekly cleanup job - runs every Sunday at 2 AM EST (7 AM UTC)
  cron.schedule('0 7 * * 0', async () => {
    try {
      console.log('Running weekly cleanup job...');
      // You could add cleanup logic here, such as:
      // - Removing old session data
      // - Archiving old challenge attempts
      // - Generating weekly reports
      console.log('Weekly cleanup completed');
    } catch (error) {
      console.error('Weekly cleanup failed:', error);
    }
  }, {
    timezone: 'UTC'
  });

  // Daily stats log - runs every day at 1 AM EST (6 AM UTC)
  cron.schedule('0 6 * * *', async () => {
    try {
      console.log('Generating daily statistics...');
      const stats = await getDatabaseStats();
      console.log('Daily stats:', {
        timestamp: new Date().toISOString(),
        ...stats
      });
    } catch (error) {
      console.error('Daily stats generation failed:', error);
    }
  }, {
    timezone: 'UTC'
  });

  console.log('All scheduled jobs started successfully');
};

const generateInitialChallenges = async () => {
  try {
    console.log('Generating initial challenges...');
    
    // Generate challenge for today if it doesn't exist
    const today = format(new Date(), 'yyyy-MM-dd');
    await generateDailyChallenge(today);
    
    // Pre-generate challenge for tomorrow
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    await generateDailyChallenge(tomorrow);
    
    console.log('Initial challenges generated successfully');
  } catch (error) {
    console.error('Error generating initial challenges:', error);
    throw error;
  }
};

module.exports = {
  startSchedulers,
  generateInitialChallenges
};