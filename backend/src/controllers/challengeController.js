const { supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const { format, startOfDay, isAfter, differenceInDays } = require('date-fns');
const { UGA_LOCATIONS, getChallengeForDate } = require('../data/locations');

// Achievement system removed - only points and streaks are tracked

const calculatePoints = (isCorrect, isFirstDiscovery, currentStreak) => {
  if (!isCorrect) return 0;

  let points = 50; // Base points for correct guess

  if (isFirstDiscovery) {
    points += 25; // First discovery bonus
  }

  // Streak multipliers
  if (currentStreak >= 10) {
    points = Math.floor(points * 2); // 2x multiplier for 10+ day streak
  } else if (currentStreak >= 5) {
    points = Math.floor(points * 1.5); // 1.5x multiplier for 5+ day streak
  }

  return points;
};

const getTodayChallenge = async (req, res, next) => {
  try {
    console.log('🎯 BACKEND: Getting today\'s challenge from locations.js');
    
    let canPlay = true;
    let hasRevealed = false;
    let userAttempt = null;

    // Check if user already played today based on last_played_date
    if (req.user && req.user.last_played_date) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const lastPlayedDate = format(new Date(req.user.last_played_date), 'yyyy-MM-dd');
      canPlay = lastPlayedDate !== today;
      hasRevealed = !canPlay; // If they can't play, they've already attempted
    }

    // Generate today's challenge from locations.js
    const challenge = getChallengeForDate(new Date());
    
    // Find the location details from our locations data
    const location = UGA_LOCATIONS.find(loc => loc.id === challenge.location);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found in data'
      });
    }

    console.log('✅ BACKEND: Generated challenge for location:', location.name);

    // Prepare response
    const responseData = {
      id: challenge.id,
      challenge_date: challenge.date,
      hint: challenge.hint,
      directions: challenge.directions,
      location: {
        id: location.id,
        category: location.category,
        latitude: location.coordinates.lat,
        longitude: location.coordinates.lng,
        image_url: location.imageUrl,
        year_built: location.yearBuilt,
        // Include location details if user has attempted or for local testing
        name: location.name,
        fun_fact: location.funFact,
        building_code: location.buildingCode,
        aliases: location.aliases
      },
      attempted: hasRevealed,
      user_attempt: userAttempt,
      can_play: canPlay
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('❌ Error in getTodayChallenge:', error);
    next(error);
  }
};

const submitGuess = async (req, res, next) => {
  try {
    const { guess } = req.body;
    const today = format(new Date(), 'yyyy-MM-dd');

    console.log('🎯 BACKEND: Submit guess from locations.js');
    console.log('Guess:', guess);

    // Check if user already played today based on last_played_date
    if (req.user.last_played_date) {
      const lastPlayedDate = format(new Date(req.user.last_played_date), 'yyyy-MM-dd');
      if (lastPlayedDate === today) {
        return res.status(400).json({
          success: false,
          error: 'You have already played today. Come back tomorrow!'
        });
      }
    }

    // Get today's challenge from locations.js
    const challenge = getChallengeForDate(new Date());
    
    // Find the location details from our locations data
    const location = UGA_LOCATIONS.find(loc => loc.id === challenge.location);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found in data'
      });
    }

    console.log('✅ BACKEND: Challenge location:', location.name);

    // Check if guess is correct
    const normalizedGuess = guess.toLowerCase().trim();
    const isCorrect = 
      location.name.toLowerCase() === normalizedGuess ||
      (location.buildingCode && location.buildingCode.toLowerCase() === normalizedGuess) ||
      location.aliases.some(alias => alias.toLowerCase() === normalizedGuess);

    console.log('✅ BACKEND: Is correct?', isCorrect);

    let pointsEarned = 0;

    if (isCorrect) {
      // Calculate streak
      const lastPlayedDate = req.user.last_played_date 
        ? new Date(req.user.last_played_date)
        : null;
      
      const todayDate = startOfDay(new Date());
      let newStreak = req.user.current_streak || 0;

      if (!lastPlayedDate) {
        newStreak = 1;
      } else {
        const daysDiff = differenceInDays(todayDate, startOfDay(lastPlayedDate));
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1; // Reset streak if more than 1 day gap
        }
      }

      // Calculate points - simplified version
      pointsEarned = 100; // Base points for correct guess

      // Update user stats
      const newBestStreak = Math.max(req.user.best_streak || 0, newStreak);
      const newTotalPoints = (req.user.total_points || 0) + pointsEarned;

      await supabaseAdmin
        .from('users')
        .update({
          current_streak: newStreak,
          best_streak: newBestStreak,
          total_points: newTotalPoints,
          last_played_date: todayDate.toISOString()
        })
        .eq('id', req.user.id);

    } else {
      // Incorrect guess - update last played date and reset streak
      await supabaseAdmin
        .from('users')
        .update({
          current_streak: 0,
          last_played_date: new Date().toISOString()
        })
        .eq('id', req.user.id);
    }

    console.log('📊 BACKEND: Points earned:', pointsEarned);

    res.status(200).json({
      success: true,
      data: {
        correct: isCorrect,
        points_earned: pointsEarned,
        first_discovery: isCorrect, // Simplified for now
        location: {
          name: location.name,
          fun_fact: location.funFact
        }
      }
    });

  } catch (error) {
    console.error('❌ BACKEND Error in submitGuess:', error);
    next(error);
  }
};

const getChallengeHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const offset = parseInt(req.query.offset) || 0;

    const { data: attempts, error } = await supabaseAdmin
      .from('challenge_attempts')
      .select(`
        *,
        daily_challenges (
          challenge_date,
          hint,
          locations (
            name,
            category,
            image_url
          )
        )
      `)
      .eq('user_id', req.user.id)
      .order('attempted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError('Failed to fetch challenge history', 500);
    }

    // Get total count for pagination
    const { count, error: countError } = await supabaseAdmin
      .from('challenge_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    if (countError) {
      throw new AppError('Failed to count challenge attempts', 500);
    }

    res.status(200).json({
      success: true,
      data: {
        attempts,
        pagination: {
          total: count,
          limit,
          offset,
          has_more: offset + limit < count
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

const getChallengeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: challenge, error } = await supabaseAdmin
      .from('daily_challenges')
      .select(`
        *,
        locations (
          id,
          name,
          category,
          latitude,
          longitude,
          image_url,
          fun_fact,
          year_built,
          building_code,
          aliases
        )
      `)
      .eq('id', id)
      .single();

    if (error || !challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    let userAttempt = null;

    // If user is authenticated, check if they've attempted this challenge
    if (req.user) {
      const { data: attempt } = await supabaseAdmin
        .from('challenge_attempts')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('challenge_id', challenge.id)
        .single();

      userAttempt = attempt;
    }

    res.status(200).json({
      success: true,
      data: {
        challenge,
        user_attempt: userAttempt
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayChallenge,
  submitGuess,
  getChallengeHistory,
  getChallengeById
};