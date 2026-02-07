const { supabaseAdmin } = require('../config/supabase');
const { AppError } = require('../middleware/errorHandler');

const getAllLocations = async (req, res, next) => {
  try {
    const { data: locations, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw new AppError('Failed to fetch locations', 500);
    }

    let userDiscoveries = [];

    // If user is authenticated, get their discoveries
    if (req.user) {
      const { data: discoveries } = await supabaseAdmin
        .from('user_locations')
        .select('location_id')
        .eq('user_id', req.user.id);

      userDiscoveries = discoveries?.map(d => d.location_id) || [];
    }

    // Process locations to hide fun facts unless discovered
    const processedLocations = locations.map(location => {
      const isDiscovered = userDiscoveries.includes(location.id);
      
      return {
        id: location.id,
        name: location.name,
        building_code: location.building_code,
        category: location.category,
        latitude: location.latitude,
        longitude: location.longitude,
        image_url: location.image_url,
        year_built: location.year_built,
        aliases: location.aliases,
        discovered: isDiscovered,
        // Only include fun fact if discovered
        fun_fact: isDiscovered ? location.fun_fact : null
      };
    });

    // Group by category
    const groupedByCategory = {
      academic: [],
      historic: [],
      athletic: [],
      residence: [],
      dining: []
    };

    processedLocations.forEach(location => {
      if (groupedByCategory.hasOwnProperty(location.category)) {
        groupedByCategory[location.category].push(location);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        locations: processedLocations,
        grouped_by_category: groupedByCategory,
        total_count: locations.length,
        discovered_count: userDiscoveries.length
      }
    });

  } catch (error) {
    next(error);
  }
};

const getLocationsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    
    // Validate category
    const validCategories = ['academic', 'historic', 'athletic', 'residence', 'dining'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category. Valid categories: ' + validCategories.join(', ')
      });
    }

    const { data: locations, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) {
      throw new AppError('Failed to fetch locations by category', 500);
    }

    let userDiscoveries = [];

    // If user is authenticated, get their discoveries for this category
    if (req.user) {
      const { data: discoveries } = await supabaseAdmin
        .from('user_locations')
        .select('location_id')
        .eq('user_id', req.user.id);

      userDiscoveries = discoveries?.map(d => d.location_id) || [];
    }

    // Process locations to hide fun facts unless discovered
    const processedLocations = locations.map(location => {
      const isDiscovered = userDiscoveries.includes(location.id);
      
      return {
        id: location.id,
        name: location.name,
        building_code: location.building_code,
        category: location.category,
        latitude: location.latitude,
        longitude: location.longitude,
        image_url: location.image_url,
        year_built: location.year_built,
        aliases: location.aliases,
        discovered: isDiscovered,
        // Only include fun fact if discovered
        fun_fact: isDiscovered ? location.fun_fact : null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        locations: processedLocations,
        category,
        total_count: locations.length,
        discovered_count: processedLocations.filter(l => l.discovered).length
      }
    });

  } catch (error) {
    next(error);
  }
};

const getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: location, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    let isDiscovered = false;
    let discoveredAt = null;

    // If user is authenticated, check if they've discovered this location
    if (req.user) {
      const { data: discovery } = await supabaseAdmin
        .from('user_locations')
        .select('discovered_at')
        .eq('user_id', req.user.id)
        .eq('location_id', location.id)
        .single();

      if (discovery) {
        isDiscovered = true;
        discoveredAt = discovery.discovered_at;
      }
    }

    // Get related challenges for this location
    const { data: challenges } = await supabaseAdmin
      .from('daily_challenges')
      .select('id, challenge_date, hint')
      .eq('location_id', location.id)
      .order('challenge_date', { ascending: false });

    // Get discovery statistics
    const { count: totalDiscoveries } = await supabaseAdmin
      .from('user_locations')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', location.id);

    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    const discoveryRate = totalUsers > 0 ? Math.round((totalDiscoveries / totalUsers) * 100) : 0;

    const responseData = {
      id: location.id,
      name: location.name,
      building_code: location.building_code,
      category: location.category,
      latitude: location.latitude,
      longitude: location.longitude,
      image_url: location.image_url,
      year_built: location.year_built,
      aliases: location.aliases,
      discovered: isDiscovered,
      discovered_at: discoveredAt,
      stats: {
        total_discoveries: totalDiscoveries || 0,
        discovery_rate: discoveryRate,
        challenges_featured: challenges?.length || 0
      },
      related_challenges: challenges || []
    };

    // Only include fun fact if discovered or user is not authenticated
    if (isDiscovered || !req.user) {
      responseData.fun_fact = location.fun_fact;
    }

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLocations,
  getLocationsByCategory,
  getLocationById
};