const { supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const getAllAchievements = async (req, res, next) => {
  try {
    const { data: achievements, error } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw new AppError('Failed to fetch achievements', 500);
    }

    // Add completion statistics for each achievement
    const achievementsWithStats = await Promise.all(
      achievements.map(async (achievement) => {
        const { count: completedCount } = await supabaseAdmin
          .from('user_achievements')
          .select('*', { count: 'exact', head: true })
          .eq('achievement_id', achievement.id);

        const { count: totalUsers } = await supabaseAdmin
          .from('users')
          .select('*', { count: 'exact', head: true });

        const completionRate = totalUsers > 0 ? Math.round((completedCount / totalUsers) * 100) : 0;

        return {
          ...achievement,
          stats: {
            completed_by: completedCount || 0,
            completion_rate: completionRate,
            rarity: completionRate <= 10 ? 'legendary' : 
                   completionRate <= 30 ? 'rare' : 
                   completionRate <= 60 ? 'uncommon' : 'common'
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        achievements: achievementsWithStats,
        total_count: achievements.length
      }
    });

  } catch (error) {
    next(error);
  }
};

const getUserAchievements = async (req, res, next) => {
  try {
    // Get all achievements
    const { data: allAchievements, error: achievementsError } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true });

    if (achievementsError) {
      throw new AppError('Failed to fetch achievements', 500);
    }

    // Get user's unlocked achievements
    const { data: userAchievements, error: userError } = await supabaseAdmin
      .from('user_achievements')
      .select(`
        achievement_id,
        unlocked_at,
        achievements (*)
      `)
      .eq('user_id', req.user.id);

    if (userError) {
      throw new AppError('Failed to fetch user achievements', 500);
    }

    // Get user stats for progress calculation
    const { data: userLocations } = await supabaseAdmin
      .from('user_locations')
      .select('location_id, locations!inner(category)')
      .eq('user_id', req.user.id);

    const { data: challengeAttempts } = await supabaseAdmin
      .from('challenge_attempts')
      .select('correct')
      .eq('user_id', req.user.id);

    // Create maps for easy lookup
    const unlockedMap = new Map(userAchievements.map(ua => [ua.achievement_id, ua]));
    const categoryStats = {
      academic: userLocations?.filter(ul => ul.locations.category === 'academic').length || 0,
      historic: userLocations?.filter(ul => ul.locations.category === 'historic').length || 0,
      athletic: userLocations?.filter(ul => ul.locations.category === 'athletic').length || 0,
      residence: userLocations?.filter(ul => ul.locations.category === 'residence').length || 0,
      dining: userLocations?.filter(ul => ul.locations.category === 'dining').length || 0
    };

    // Process each achievement with progress information
    const processedAchievements = allAchievements.map(achievement => {
      const userAchievement = unlockedMap.get(achievement.id);
      const isUnlocked = !!userAchievement;

      let progress = 0;
      let progressMax = achievement.requirement;

      if (!isUnlocked) {
        // Calculate progress towards achievement
        switch (achievement.achievement_type) {
          case 'first':
            progress = challengeAttempts?.length || 0;
            break;

          case 'streak':
            progress = req.user.current_streak;
            break;

          case 'total_locations':
            progress = userLocations?.length || 0;
            break;

          case 'category_specific':
            progress = categoryStats[achievement.category] || 0;
            break;
        }

        // Cap progress at requirement
        progress = Math.min(progress, progressMax);
      } else {
        progress = progressMax;
      }

      const progressPercentage = Math.round((progress / progressMax) * 100);

      return {
        ...achievement,
        unlocked: isUnlocked,
        unlocked_at: userAchievement?.unlocked_at || null,
        progress: {
          current: progress,
          required: progressMax,
          percentage: progressPercentage
        }
      };
    });

    // Separate unlocked and locked achievements
    const unlocked = processedAchievements.filter(a => a.unlocked);
    const locked = processedAchievements.filter(a => !a.unlocked);

    // Sort locked achievements by progress (closest to completion first)
    locked.sort((a, b) => b.progress.percentage - a.progress.percentage);

    res.status(200).json({
      success: true,
      data: {
        unlocked: unlocked,
        locked: locked,
        summary: {
          total_achievements: allAchievements.length,
          unlocked_count: unlocked.length,
          locked_count: locked.length,
          completion_percentage: Math.round((unlocked.length / allAchievements.length) * 100)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAchievements,
  getUserAchievements
};