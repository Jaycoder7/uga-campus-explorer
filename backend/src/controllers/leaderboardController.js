const { supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const getLeaderboard = async (req, res, next) => {
  try {
    const period = req.query.period || 'allTime';
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        username,
        avatar,
        total_points,
        current_streak,
        best_streak,
        created_at
      `)
      .order('total_points', { ascending: false });

    // Apply period filter if not allTime
    if (period === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      // Note: For weekly/monthly leaderboards, you might want to create a separate table
      // to track period-specific points. For now, we'll use total_points
    } else if (period === 'monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      // Note: Same as above - might need period-specific tracking
    }

    query = query.range(offset, offset + limit - 1);

    const { data: users, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch leaderboard', 500);
    }

    // Get discovery count for each user
    const leaderboardData = await Promise.all(
      users.map(async (user, index) => {
        const { data: userLocations } = await supabaseAdmin
          .from('user_locations')
          .select('location_id')
          .eq('user_id', user.id);

        const { data: challengeAttempts } = await supabaseAdmin
          .from('challenge_attempts')
          .select('correct')
          .eq('user_id', user.id);

        const totalAttempts = challengeAttempts?.length || 0;
        const correctAttempts = challengeAttempts?.filter(attempt => attempt.correct).length || 0;
        const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

        return {
          rank: offset + index + 1,
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          total_points: user.total_points,
          current_streak: user.current_streak,
          best_streak: user.best_streak,
          locations_discovered: userLocations?.length || 0,
          accuracy,
          member_since: user.created_at
        };
      })
    );

    // Get total count for pagination
    const { count, error: countError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new AppError('Failed to count users', 500);
    }

    res.status(200).json({
      success: true,
      data: {
        leaderboard: leaderboardData,
        pagination: {
          total: count,
          limit,
          offset,
          has_more: offset + limit < count
        },
        period
      }
    });

  } catch (error) {
    next(error);
  }
};

const getUserRank = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Get user by username
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's rank (count users with higher points)
    const { count: higherRankedUsers, error: rankError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('total_points', user.total_points);

    if (rankError) {
      throw new AppError('Failed to calculate user rank', 500);
    }

    const rank = (higherRankedUsers || 0) + 1;

    // Get user's detailed stats
    const { data: userLocations } = await supabaseAdmin
      .from('user_locations')
      .select('location_id')
      .eq('user_id', user.id);

    const { data: challengeAttempts } = await supabaseAdmin
      .from('challenge_attempts')
      .select('correct, attempted_at')
      .eq('user_id', user.id)
      .order('attempted_at', { ascending: false });

    const totalAttempts = challengeAttempts?.length || 0;
    const correctAttempts = challengeAttempts?.filter(attempt => attempt.correct).length || 0;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    // Get recent activity (last 10 attempts)
    const recentActivity = challengeAttempts?.slice(0, 10).map(attempt => ({
      date: attempt.attempted_at,
      correct: attempt.correct
    })) || [];

    // Get total user count for percentile
    const { count: totalUsers, error: totalError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      throw new AppError('Failed to count total users', 500);
    }

    const percentile = totalUsers > 0 ? Math.round((1 - (rank - 1) / totalUsers) * 100) : 100;

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          total_points: user.total_points,
          current_streak: user.current_streak,
          best_streak: user.best_streak,
          member_since: user.created_at
        },
        rank,
        percentile,
        stats: {
          locations_discovered: userLocations?.length || 0,
          total_attempts: totalAttempts,
          correct_attempts: correctAttempts,
          accuracy
        },
        recent_activity: recentActivity
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard,
  getUserRank
};