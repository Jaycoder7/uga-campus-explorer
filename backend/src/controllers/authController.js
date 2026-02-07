const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });
};

const register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Check if username already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered'
        });
      }
      throw new AppError(authError.message, 400);
    }

    // Create user profile
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        username,
        avatar: null,
        current_streak: 0,
        best_streak: 0,
        total_points: 0
      })
      .select()
      .single();

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw new AppError('Failed to create user profile', 500);
    }

    // Generate tokens
    const token = generateToken(userProfile.id);
    const refreshToken = generateRefreshToken(userProfile.id);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: userProfile.id,
          username: userProfile.username,
          avatar: userProfile.avatar,
          current_streak: userProfile.current_streak,
          best_streak: userProfile.best_streak,
          total_points: userProfile.total_points
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    // Generate tokens
    const token = generateToken(userProfile.id);
    const refreshToken = generateRefreshToken(userProfile.id);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: userProfile.id,
          username: userProfile.username,
          avatar: userProfile.avatar,
          current_streak: userProfile.current_streak,
          best_streak: userProfile.best_streak,
          total_points: userProfile.total_points
        },
        token,
        refreshToken
      }
    });

  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Clear cookie
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    res.status(200).json({
      success: true,
      data: { message: 'Successfully logged out' }
    });

  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    // Get detailed user stats
    const { data: userLocations, error: locationsError } = await supabaseAdmin
      .from('user_locations')
      .select('location_id')
      .eq('user_id', req.user.id);

    const { data: challengeAttempts, error: attemptsError } = await supabaseAdmin
      .from('challenge_attempts')
      .select('correct')
      .eq('user_id', req.user.id);

    if (locationsError || attemptsError) {
      throw new AppError('Failed to fetch user stats', 500);
    }

    const totalAttempts = challengeAttempts?.length || 0;
    const correctAttempts = challengeAttempts?.filter(attempt => attempt.correct).length || 0;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...req.user,
          stats: {
            total_locations_discovered: userLocations?.length || 0,
            total_attempts: totalAttempts,
            correct_attempts: correctAttempts,
            accuracy
          }
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // Set HTTP-only cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  refresh
};