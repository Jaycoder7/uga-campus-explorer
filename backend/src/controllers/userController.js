const { supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const getProfile = async (req, res, next) => {
  try {
    // Get detailed user stats
    const { data: userLocations, error: locationsError } = await supabaseAdmin
      .from('user_locations')
      .select(`
        location_id,
        discovered_at,
        locations (
          name,
          category,
          image_url
        )
      `)
      .eq('user_id', req.user.id);

    const { data: challengeAttempts, error: attemptsError } = await supabaseAdmin
      .from('challenge_attempts')
      .select('correct, attempted_at, points_earned')
      .eq('user_id', req.user.id)
      .order('attempted_at', { ascending: false });

    if (locationsError || attemptsError) {
      throw new AppError('Failed to fetch user profile data', 500);
    }

    const totalAttempts = challengeAttempts?.length || 0;
    const correctAttempts = challengeAttempts?.filter(attempt => attempt.correct).length || 0;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Calculate category breakdown
    const categoryStats = {
      academic: 0,
      historic: 0,
      athletic: 0,
      residence: 0,
      dining: 0
    };

    userLocations?.forEach(ul => {
      if (categoryStats.hasOwnProperty(ul.locations.category)) {
        categoryStats[ul.locations.category]++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
        stats: {
          total_locations_discovered: userLocations?.length || 0,
          total_attempts: totalAttempts,
          correct_attempts: correctAttempts,
          accuracy,
          category_breakdown: categoryStats
        },
        recent_discoveries: userLocations?.slice(0, 5) || [],
        recent_attempts: challengeAttempts?.slice(0, 10) || []
      }
    });

  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { username, avatar } = req.body;
    const updates = {};

    if (username) {
      // Check if username is already taken by another user
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', req.user.id)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username already taken'
        });
      }

      updates.username = username;
    }

    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update profile', 500);
    }

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    // Get comprehensive user statistics
    const { data: challengeAttempts, error: attemptsError } = await supabaseAdmin
      .from('challenge_attempts')
      .select(`
        correct,
        points_earned,
        attempted_at,
        daily_challenges (
          challenge_date,
          locations (
            category
          )
        )
      `)
      .eq('user_id', req.user.id);

    const { data: userLocations, error: locationsError } = await supabaseAdmin
      .from('user_locations')
      .select(`
        discovered_at,
        locations (
          category
        )
      `)
      .eq('user_id', req.user.id);

    if (attemptsError || locationsError) {
      throw new AppError('Failed to fetch user statistics', 500);
    }

    const totalAttempts = challengeAttempts?.length || 0;
    const correctAttempts = challengeAttempts?.filter(attempt => attempt.correct).length || 0;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Category-wise accuracy
    const categoryAccuracy = {};
    const categories = ['academic', 'historic', 'athletic', 'residence', 'dining'];

    categories.forEach(category => {
      const categoryAttempts = challengeAttempts?.filter(
        attempt => attempt.daily_challenges.locations.category === category
      ) || [];
      const categoryCorrect = categoryAttempts.filter(attempt => attempt.correct).length;
      
      categoryAccuracy[category] = {
        attempts: categoryAttempts.length,
        correct: categoryCorrect,
        accuracy: categoryAttempts.length > 0 
          ? Math.round((categoryCorrect / categoryAttempts.length) * 100) 
          : 0
      };
    });

    // Monthly breakdown (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = {};
    challengeAttempts?.forEach(attempt => {
      const attemptDate = new Date(attempt.attempted_at);
      if (attemptDate >= sixMonthsAgo) {
        const monthKey = attemptDate.toISOString().substring(0, 7); // YYYY-MM format
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { attempts: 0, correct: 0, points: 0 };
        }
        monthlyStats[monthKey].attempts++;
        if (attempt.correct) monthlyStats[monthKey].correct++;
        monthlyStats[monthKey].points += attempt.points_earned;
      }
    });

    // Discovery timeline
    const discoveryTimeline = userLocations?.map(ul => ({
      date: ul.discovered_at,
      category: ul.locations.category
    })).sort((a, b) => new Date(a.date) - new Date(b.date)) || [];

    res.status(200).json({
      success: true,
      data: {
        overall: {
          total_attempts: totalAttempts,
          correct_attempts: correctAttempts,
          accuracy,
          total_points: req.user.total_points,
          current_streak: req.user.current_streak,
          best_streak: req.user.best_streak,
          total_locations: userLocations?.length || 0
        },
        category_accuracy: categoryAccuracy,
        monthly_breakdown: monthlyStats,
        discovery_timeline: discoveryTimeline
      }
    });

  } catch (error) {
    next(error);
  }
};

const getDiscoveries = async (req, res, next) => {
  try {
    const { data: userLocations, error } = await supabaseAdmin
      .from('user_locations')
      .select(`
        discovered_at,
        locations (
          id,
          name,
          category,
          latitude,
          longitude,
          image_url,
          fun_fact,
          year_built,
          building_code
        )
      `)
      .eq('user_id', req.user.id)
      .order('discovered_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch user discoveries', 500);
    }

    // Group by category
    const groupedByCategory = {
      academic: [],
      historic: [],
      athletic: [],
      residence: [],
      dining: []
    };

    userLocations?.forEach(ul => {
      if (groupedByCategory.hasOwnProperty(ul.locations.category)) {
        groupedByCategory[ul.locations.category].push({
          ...ul.locations,
          discovered_at: ul.discovered_at
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        discoveries: userLocations?.map(ul => ({
          ...ul.locations,
          discovered_at: ul.discovered_at
        })) || [],
        grouped_by_category: groupedByCategory,
        total_count: userLocations?.length || 0
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getStats,
  getDiscoveries
};