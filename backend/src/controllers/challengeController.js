const { supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');
const { format, startOfDay, isAfter, differenceInDays } = require('date-fns');

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
    const today = format(new Date(), 'yyyy-MM-dd');

    // Get today's challenge
    const { data: challenge, error: challengeError } = await supabaseAdmin
      .from('daily_challenges')
      .select(`
        *,
        locations (
          id,
          category,
          latitude,
          longitude,
          image_url,
          year_built
        )
      `)
      .eq('challenge_date', today)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({
        success: false,
        error: 'No challenge found for today'
      });
    }

    let userAttempt = null;
    let hasRevealed = false;

    // If user is authenticated, check if they've attempted today's challenge
    if (req.user) {
      const { data: attempt } = await supabaseAdmin
        .from('challenge_attempts')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('challenge_id', challenge.id)
        .single();

      userAttempt = attempt;
      hasRevealed = !!attempt;
    }

    // Prepare response (hide location name unless attempted)
    const responseData = {
      id: challenge.id,
      challenge_date: challenge.challenge_date,
      hint: challenge.hint,
      directions: challenge.directions,
      location: {
        id: challenge.locations.id,
        category: challenge.locations.category,
        latitude: challenge.locations.latitude,
        longitude: challenge.locations.longitude,
        image_url: challenge.locations.image_url,
        year_built: challenge.locations.year_built
      },
      attempted: hasRevealed,
      user_attempt: userAttempt
    };

    // Only include location name if user has attempted
    if (hasRevealed) {
      const { data: fullLocation } = await supabaseAdmin
        .from('locations')
        .select('name, fun_fact, building_code, aliases')
        .eq('id', challenge.locations.id)
        .single();

      responseData.location = {
        ...responseData.location,
        name: fullLocation.name,
        fun_fact: fullLocation.fun_fact,
        building_code: fullLocation.building_code,
        aliases: fullLocation.aliases
      };
    }

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    next(error);
  }
};

const submitGuess = async (req, res, next) => {
  try {
    const { guess } = req.body;
    const today = format(new Date(), 'yyyy-MM-dd');

    // Get today's challenge
    const { data: challenge, error: challengeError } = await supabaseAdmin
      .from('daily_challenges')
      .select(`
        *,
        locations (
          id,
          name,
          building_code,
          aliases,
          fun_fact
        )
      `)
      .eq('challenge_date', today)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({
        success: false,
        error: 'No challenge found for today'
      });
    }

    // Check if user already attempted today's challenge
    const { data: existingAttempt } = await supabaseAdmin
      .from('challenge_attempts')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('challenge_id', challenge.id)
      .single();

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        error: 'You have already attempted today\'s challenge'
      });
    }

    // Check if guess is correct
    const location = challenge.locations;
    const normalizedGuess = guess.toLowerCase().trim();
    const isCorrect = 
      location.name.toLowerCase() === normalizedGuess ||
      location.building_code?.toLowerCase() === normalizedGuess ||
      location.aliases.some(alias => alias.toLowerCase() === normalizedGuess);

    let pointsEarned = 0;
    let isFirstDiscovery = false;

    if (isCorrect) {
      // Check if this is the first discovery of this location
      const { data: existingDiscovery } = await supabaseAdmin
        .from('user_locations')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('location_id', location.id)
        .single();

      isFirstDiscovery = !existingDiscovery;

      if (isFirstDiscovery) {
        // Record location discovery
        await supabaseAdmin
          .from('user_locations')
          .insert({
            user_id: req.user.id,
            location_id: location.id
          });
      }

      // Calculate streak
      const lastPlayedDate = req.user.last_played_date 
        ? new Date(req.user.last_played_date)
        : null;
      
      const today = startOfDay(new Date());
      let newStreak = req.user.current_streak;

      if (!lastPlayedDate) {
        newStreak = 1;
      } else {
        const daysDiff = differenceInDays(today, startOfDay(lastPlayedDate));
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1; // Reset streak if more than 1 day gap
        }
      }

      // Calculate points
      pointsEarned = calculatePoints(true, isFirstDiscovery, newStreak);

      // Update user stats
      const newBestStreak = Math.max(req.user.best_streak, newStreak);
      const newTotalPoints = req.user.total_points + pointsEarned;

      await supabaseAdmin
        .from('users')
        .update({
          current_streak: newStreak,
          best_streak: newBestStreak,
          total_points: newTotalPoints,
          last_played_date: today.toISOString()
        })
        .eq('id', req.user.id);

      // Update user object for achievement checking
      req.user.current_streak = newStreak;
      req.user.total_points = newTotalPoints;

    } else {
      // Incorrect guess - reset streak if user has played before
      if (req.user.last_played_date) {
        await supabaseAdmin
          .from('users')
          .update({
            current_streak: 0,
            last_played_date: new Date().toISOString()
          })
          .eq('id', req.user.id);
      }
    }

    // Record the attempt
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from('challenge_attempts')
      .insert({
        user_id: req.user.id,
        challenge_id: challenge.id,
        guess,
        correct: isCorrect,
        points_earned: pointsEarned
      })
      .select()
      .single();

    if (attemptError) {
      throw new AppError('Failed to record challenge attempt', 500);
    }

    // Achievement system removed - only points and streaks are tracked

    res.status(200).json({
      success: true,
      data: {
        correct: isCorrect,
        points_earned: pointsEarned,
        first_discovery: isFirstDiscovery,
        location: {
          name: location.name,
          fun_fact: location.fun_fact
        },
        attempt
      }
    });

  } catch (error) {
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