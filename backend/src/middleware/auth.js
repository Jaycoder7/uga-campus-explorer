const { supabaseAdmin } = require("../config/supabase");

// Protect route: token required
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    // Verify JWT token with Supabase
    const { data: authData, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !authData?.user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    req.authUser = authData.user; // Supabase user
    req.userId = authData.user.id;

    // Load user profile from database
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('User profile not found:', authData.user.id);
      return res.status(404).json({
        success: false,
        error: "User profile not found",
      });
    }

    req.user = userProfile; // User profile with stats

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ success: false, error: "Server error during authentication" });
  }
};

// Optional auth: token may or may not exist
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.authUser = null;
      req.userId = null;
      req.user = null;
      return next();
    }

    const { data: authData, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !authData?.user) {
      req.authUser = null;
      req.userId = null;
      req.user = null;
      return next();
    }

    req.authUser = authData.user;
    req.userId = authData.user.id;

    // Load user profile from database
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    req.user = userProfile || null;

    next();
  } catch (err) {
    console.error("Optional auth middleware error:", err);
    req.authUser = null;
    req.userId = null;
    req.user = null;
    next();
  }
};

module.exports = {
  protect,
  optionalAuth,
};
