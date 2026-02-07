-- UGA Campus Explorer Database Schema
-- Run this SQL in Supabase SQL Editor

-- Note: auth.users table is managed by Supabase and already has RLS enabled

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar TEXT,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    last_played_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Locations table
CREATE TABLE locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    building_code TEXT,
    category TEXT NOT NULL CHECK (category IN ('academic', 'historic', 'athletic', 'residence', 'dining')),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    image_url TEXT,
    fun_fact TEXT,
    year_built INTEGER,
    aliases TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Daily challenges table
CREATE TABLE daily_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_date DATE UNIQUE NOT NULL,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    hint TEXT NOT NULL,
    directions TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Challenge attempts table
CREATE TABLE challenge_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
    guess TEXT NOT NULL,
    correct BOOLEAN NOT NULL,
    points_earned INTEGER DEFAULT 0,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, challenge_id)
);

-- User locations (discovery tracking)
CREATE TABLE user_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, location_id)
);

-- Achievements table
CREATE TABLE achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    achievement_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    requirement INTEGER NOT NULL,
    achievement_type TEXT NOT NULL CHECK (achievement_type IN ('streak', 'total_locations', 'category_specific', 'first')),
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User achievements table
CREATE TABLE user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_total_points ON users(total_points DESC);
CREATE INDEX idx_locations_category ON locations(category);
CREATE INDEX idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX idx_challenge_attempts_user_id ON challenge_attempts(user_id);
CREATE INDEX idx_challenge_attempts_challenge_id ON challenge_attempts(challenge_id);
CREATE INDEX idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for locations (publicly readable)
DROP POLICY IF EXISTS "Locations are publicly readable" ON locations;
CREATE POLICY "Locations are publicly readable" ON locations FOR SELECT TO authenticated, anon USING (true);

-- RLS Policies for daily_challenges (publicly readable)
DROP POLICY IF EXISTS "Daily challenges are publicly readable" ON daily_challenges;
CREATE POLICY "Daily challenges are publicly readable" ON daily_challenges FOR SELECT TO authenticated, anon USING (true);

-- RLS Policies for challenge_attempts
DROP POLICY IF EXISTS "Users can view own attempts" ON challenge_attempts;
DROP POLICY IF EXISTS "Users can insert own attempts" ON challenge_attempts;
CREATE POLICY "Users can view own attempts" ON challenge_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON challenge_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_locations
DROP POLICY IF EXISTS "Users can view own discoveries" ON user_locations;
DROP POLICY IF EXISTS "Users can insert own discoveries" ON user_locations;
CREATE POLICY "Users can view own discoveries" ON user_locations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own discoveries" ON user_locations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements (publicly readable)
DROP POLICY IF EXISTS "Achievements are publicly readable" ON achievements;
CREATE POLICY "Achievements are publicly readable" ON achievements FOR SELECT TO authenticated, anon USING (true);

-- RLS Policies for user_achievements
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default achievements
INSERT INTO achievements (achievement_code, name, description, icon, requirement, achievement_type) VALUES
('ach-001', 'First Steps', 'Complete your first challenge', '🎯', 1, 'first'),
('ach-002', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 7, 'streak'),
('ach-003', 'Explorer', 'Discover 10 different locations', '🗺️', 10, 'total_locations'),
('ach-004', 'Scholar', 'Discover 5 academic buildings', '📚', 5, 'category_specific'),
('ach-005', 'Historian', 'Discover 5 historic landmarks', '🏛️', 5, 'category_specific'),
('ach-006', 'Dawg Fan', 'Discover 3 athletic facilities', '🏈', 3, 'category_specific'),
('ach-007', 'Home Away From Home', 'Discover 5 residence halls', '🏠', 5, 'category_specific'),
('ach-008', 'Foodie', 'Discover 3 dining locations', '🍕', 3, 'category_specific');

-- Update achievements with category for category_specific achievements
UPDATE achievements SET category = 'academic' WHERE achievement_code = 'ach-004';
UPDATE achievements SET category = 'historic' WHERE achievement_code = 'ach-005';
UPDATE achievements SET category = 'athletic' WHERE achievement_code = 'ach-006';
UPDATE achievements SET category = 'residence' WHERE achievement_code = 'ach-007';
UPDATE achievements SET category = 'dining' WHERE achievement_code = 'ach-008';